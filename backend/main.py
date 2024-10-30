from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from passporteye import read_mrz
import pytesseract
import cv2
import io
import numpy as np
import re
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://passport-ocr-pied.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PassportData(BaseModel):
    passport_number: str
    full_name: str
    date_of_birth: str
    date_of_issue: str
    date_of_expiry: str
    nationality: str
    gender: str


def parse_mrz_date(mrz_date: str) -> str:
    """
    Convert MRZ date format (YYMMDD) to standard DD MMM YYYY.
    """
    try:
        if len(mrz_date) != 6:
            return "Invalid Date Format"

        year = int(mrz_date[:2])
        month = int(mrz_date[2:4])
        day = int(mrz_date[4:6])

        if month < 1 or month > 12 or day < 1 or day > 31:
            return "Invalid Date"

        # Convert 2-digit year to 4-digit year
        year += 1900 if year > 30 else 2000

        date_str = f"{day:02d}{month:02d}{year}"
        parsed_date = datetime.strptime(date_str, "%d%m%Y")
        return parsed_date.strftime("%d %b %Y")
    except ValueError:
        return "Invalid Date"


def clean_passport_number(passport_number: str) -> str:
    """
    Clean the passport number by removing any trailing non-alphanumeric characters.
    """
    return re.sub(r"[^A-Z0-9]+$", "", passport_number)


def extract_issue_date(image_bytes: bytes, date_of_birth: str, date_of_expiry: str) -> str:
    """
    Extract the issue date from the passport image using OCR and validate it.
    """
    try:
        np_img = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        # Preprocess image for better OCR
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        text = pytesseract.image_to_string(thresh)

        #print("OCR Extracted Text:", text)  # Debugging output

        # Define date patterns
        date_patterns = [
            r"\b(\d{2}/\d{2}/\d{4}|\d{4}/\d{2}/\d{2})\b",
            r"\b(\d{2} [A-Z]{3} \d{4})\b",
            r"\b(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})\b",
            r"\b(\d{2}\.\d{2}\.\d{4}|\d{4}\.\d{2}\.\d{2})\b",
        ]

        dob = datetime.strptime(date_of_birth, "%d %b %Y")
        expiry = datetime.strptime(date_of_expiry, "%d %b %Y")

        # Search for matching dates
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(0)
                try:
                    if '/' in date_str:
                        date = datetime.strptime(date_str, "%d/%m/%Y")
                    elif ' ' in date_str:
                        date = datetime.strptime(date_str, "%d %b %Y")
                    elif '-' in date_str:
                        date = datetime.strptime(date_str, "%d-%m-%Y")
                    elif '.' in date_str:
                        date = datetime.strptime(date_str, "%d.%m.%Y")

                    if dob < date < expiry:
                        return date_str
                except ValueError:
                    continue

        return "Date of Issue Not Found"
    except Exception as e:
        print(f"OCR Error: {e}")
        return "Error Extracting Issue Date"


def extract_passport_data(image_bytes: bytes) -> PassportData:
    """
    Extract passport data from the image using MRZ and OCR.
    """
    try:
        mrz = read_mrz(io.BytesIO(image_bytes))
        if mrz is None:
            raise ValueError("Could not extract MRZ data from image")

        mrz_data = mrz.to_dict()

        passport_number = clean_passport_number(mrz_data.get('number', 'N/A'))
        full_name = f"{mrz_data.get('names', '')} {mrz_data.get('surname', '')}".strip()
        date_of_birth = parse_mrz_date(mrz_data.get('date_of_birth', '000000'))
        date_of_expiry = parse_mrz_date(mrz_data.get('expiration_date', '000000'))
        nationality = mrz_data.get('nationality', 'N/A')
        gender = mrz_data.get('sex', 'N/A')

        date_of_issue = extract_issue_date(image_bytes, date_of_birth, date_of_expiry)

        return PassportData(
            passport_number=passport_number,
            full_name=full_name,
            date_of_birth=date_of_birth,
            date_of_issue=date_of_issue,
            date_of_expiry=date_of_expiry,
            nationality=nationality,
            gender=gender
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


@app.post("/api/extract-passport")
async def extract_passport(file: UploadFile = File(...)):
    """
    Endpoint to extract passport data from an uploaded image.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    passport_data = extract_passport_data(contents)
    return passport_data


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}

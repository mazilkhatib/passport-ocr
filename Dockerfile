# Use a base image with Python and Node.js
FROM python:3.9-slim as base

# Install system dependencies including Tesseract OCR and its language data
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    git \
    tesseract-ocr \
    libtesseract-dev \
    tesseract-ocr-eng \
    libopencv-dev \
    python3-opencv \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install backend dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Build the frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Copy the built frontend files to a directory that will be served by the backend
RUN mkdir -p /app/backend/static
RUN cp -r dist/* /app/backend/static/

# Set the working directory to the backend folder to run the FastAPI application
WORKDIR /app/backend

# Expose the port that your FastAPI application will run on
EXPOSE 8000

# Set environment variable for Tesseract
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
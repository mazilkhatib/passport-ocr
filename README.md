Passport OCR
================

This project is a web application that allows users to upload passport images and extract key passport data using Optical Character Recognition (OCR) and Machine Readable Zone (MRZ) processing.

The application is built using a **FastAPI** backend and a **ReactJS** frontend. The backend is responsible for processing the uploaded passport images and returning the extracted data, while the frontend provides a user-friendly interface for uploading images and displaying the results.

Installation Instructions
-------------------------

### Frontend

To install and run the frontend, please follow the instructions in the [frontend README](./frontend/README.md).

### Backend

To install and run the backend, please follow the instructions in the [backend README](./backend/README.md).

Features
--------

-   Upload passport images
-   Extract passport data, including:
    -   Passport number
    -   Full name
    -   Date of birth
    -   Date of issue
    -   Date of expiry
    -   Nationality
    -   Gender
-   Validate extracted data for accuracy
-   (Optional) Store extracted data in a database

Technologies Used
-----------------

-   **FastAPI**: Python web framework for building the API backend
-   **ReactJS**: JavaScript library for building the user interface
-   **PassportEye**: Library for extracting MRZ data from passport images
-   **Tesseract OCR**: Library for performing optical character recognition on passport images
-   **OpenCV**: Library for image preprocessing and manipulation
# Backend Service

This is the backend service for our application, built with FastAPI and Python.

## Prerequisites

Before you begin, ensure you have Python 3.10 or higher installed on your system:
```bash
python --version
```

## Setup and Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
# Create venv
python -m venv venv

# Activate venv on Windows
.\venv\Scripts\activate

# Activate venv on Unix or MacOS
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Ensure your virtual environment is activated
2. Run the FastAPI application:
```bash
# From the backend directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at:
- Main API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Documentation: `http://localhost:8000/redoc`

## Project Structure
```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── README.md/           # Readme file
```

## Testing

With your virtual environment activated:
```bash
# Run tests
pytest
```

## Troubleshooting

If you encounter any issues:

1. Verify your Python version is 3.10 or higher
2. Make sure your virtual environment is activated (you should see `(venv)` in your terminal)
3. Try removing and recreating your virtual environment:
   ```bash
   # On Windows
   deactivate
   rmdir /s /q venv
   
   # On Unix/MacOS
   deactivate
   rm -rf venv
   ```
   Then follow the setup steps again.

# Use a base image with Python and Node.js
FROM python:3.9-slim as base

# Install Node.js and required tools
RUN apt-get update && apt-get install -y nodejs npm git

# Set the working directory
WORKDIR /app

# Copy the backend code
COPY backend/ backend/

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the frontend code
COPY frontend/ frontend/

# Build the frontend
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# Copy the built frontend to the backend
WORKDIR /app
RUN cp -r frontend/dist backend/

# Set the entrypoint to run the backend
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
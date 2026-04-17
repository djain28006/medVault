# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
# tesseract-ocr: The OCR engine
# libtesseract-dev: Tesseract development files
# libgl1: OpenCV/Pillow dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV RENDER=true

# Expose the port the app runs on (Render uses $PORT, if not set default to 10000)
# Most FastAPI apps use 8000, we'll use 8005 to match local dev if needed
EXPOSE 8005

# Run uvicorn on container startup
# Render will override $PORT, so we bind to 0.0.0.0
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8005}"]

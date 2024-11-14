import shutil
from datetime import datetime
from pathlib import Path

import torch
from fastapi import FastAPI
from fastapi import File
from fastapi import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import AutoModelForObjectDetection
from transformers import AutoProcessor

UPLOAD_DIRECTORY_PATH = Path("uploaded_files")
UPLOAD_DIRECTORY_PATH.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://Ring-r.github.io/pt-artemis"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping/")
async def ping():
    return "pong"


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_location = UPLOAD_DIRECTORY_PATH / f"{datetime.now().timestamp()}.png"
    with file_location.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    flowers_count = _count_flowers(file_location)

    return JSONResponse(
        {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "flowers_count": flowers_count,
        }
    )


def _count_flowers(image_file_path: Path):
    # Step 1: Load the model and processor
    model_name = "smutuvi/flower_count_model"
    model = AutoModelForObjectDetection.from_pretrained(model_name)
    processor = AutoProcessor.from_pretrained(model_name)

    # Step 2: Load and preprocess the image
    image = Image.open(str(image_file_path)).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    # Step 3: Make predictions
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

        probabilities = torch.softmax(logits, dim=-1)  # Convert to probabilities

        flower_class_index = 2  # Assuming index 2 corresponds to "flower"
        # Count detections where "flower" class has the highest probability
        flower_detections = (
            (torch.argmax(probabilities, dim=-1) == flower_class_index).sum().item()
        )

        return flower_detections

import os
import shutil
from pathlib import Path

from fastapi import FastAPI
from fastapi import File
from fastapi import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

UPLOAD_DIRECTORY_PATH = Path("uploaded_files")
UPLOAD_DIRECTORY_PATH.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_location = UPLOAD_DIRECTORY_PATH / f"{datetime.now().timestamp()}.png"
    with file_location.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return JSONResponse(
        {"message": "File uploaded successfully", "filename": file.filename}
    )

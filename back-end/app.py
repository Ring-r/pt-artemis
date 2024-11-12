import torch
from PIL import Image
from transformers import AutoModelForObjectDetection
from transformers import AutoProcessor

# Step 1: Load the model and processor
model_name = "smutuvi/flower_count_model"
model = AutoModelForObjectDetection.from_pretrained(model_name)
processor = AutoProcessor.from_pretrained(model_name)

# Step 2: Load and preprocess the image
image = Image.open(
    "test/6671bf73_1572117480_jpg.rf.826602ebdc2d58531283526c04f78b11.jpg"
)
inputs = processor(images=image, return_tensors="pt")

# Step 3: Make predictions
with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
    print(logits)

    probabilities = torch.softmax(logits, dim=-1)  # Convert to probabilities
    print(probabilities)

    flower_class_index = 2  # Assuming index 2 corresponds to "flower"
    # Count detections where "flower" class has the highest probability
    flower_detections = (
        (torch.argmax(probabilities, dim=-1) == flower_class_index).sum().item()
    )

print("Estimated flower count:", flower_detections)

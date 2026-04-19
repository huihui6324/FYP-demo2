from ultralytics import YOLO

model = YOLO("best.pt")

results = model("test.jpg", save=True)
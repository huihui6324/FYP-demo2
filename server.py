from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import os
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

# Load YOLO model
model_path = os.path.join(os.path.dirname(__file__), 'model', 'best.pt')
model = YOLO(model_path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get image from request
        if 'image' not in request.files and 'image' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        # Handle base64 image or file upload
        if 'image' in request.json:
            # Base64 encoded image
            image_data = request.json['image']
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            img_bytes = base64.b64decode(image_data)
            img = Image.open(BytesIO(img_bytes))
            img_array = np.array(img)
            # Convert RGB to BGR for OpenCV
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            # File upload
            file = request.files['image']
            img_bytes = np.frombuffer(file.read(), np.uint8)
            img_array = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
        
        # Run inference
        results = model(img_array)
        result = results[0]
        
        # Process results
        detections = []
        if result.boxes is not None:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy()
            class_names = result.names
            
            for i, box in enumerate(boxes):
                detections.append({
                    'bbox': box.tolist(),
                    'confidence': float(confidences[i]),
                    'class_id': int(class_ids[i]),
                    'class_name': class_names[int(class_ids[i])]
                })
        
        # Generate annotated image
        annotated_img = result.plot()
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_img)
        annotated_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': detections,
            'annotated_image': f'data:image/jpeg;base64,{annotated_base64}',
            'count': len(detections)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

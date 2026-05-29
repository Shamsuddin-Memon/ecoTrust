from flask import Flask, request, jsonify
from ultralytics import YOLO
import os, uuid, base64, zipfile, logging
from io import BytesIO
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Constants
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Model", "best"))
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Model", "best.pt"))

# Automatic zipping logic to pack the folder into best.pt if not present
def ensure_zipped_model():
    if os.path.exists(MODEL_PATH):
        logger.info(f"Model zip file already exists at: {MODEL_PATH}")
        return
    
    if not os.path.exists(MODEL_DIR):
        raise FileNotFoundError(f"Model source directory not found at: {MODEL_DIR}")
        
    logger.info(f"Zipping model directory {MODEL_DIR} to {MODEL_PATH}...")
    with zipfile.ZipFile(MODEL_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(MODEL_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, MODEL_DIR)
                # Put everything under the top-level 'archive/' directory as required by PyTorch
                arcname = os.path.join("archive", rel_path)
                zipf.write(file_path, arcname)
    logger.info("Zipping complete.")

# Ensure model exists and is loaded
try:
    ensure_zipped_model()
    logger.info(f"Loading YOLO model from {MODEL_PATH}...")
    model = YOLO(MODEL_PATH)
    logger.info("YOLO model loaded successfully!")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return jsonify({"message": "EcoTrust API chal rahi hai!"})


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "AI model is not loaded on the server"}), 500

    if "image" not in request.files:
        return jsonify({"error": "Image nahi mili"}), 400

    file = request.files["image"]
    filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        results = model(filepath)

        detections = []
        for result in results:
            for box in result.boxes:
                detections.append({
                    "class": result.names[int(box.cls)],
                    "confidence": round(float(box.conf), 3),
                    "bbox": [round(x, 1) for x in box.xyxy[0].tolist()]
                })

        annotated = results[0].plot()
        img = Image.fromarray(annotated[..., ::-1])
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode()

        os.remove(filepath)

        return jsonify({
            "total_detections": len(detections),
            "detections": detections,
            "annotated_image": img_b64
        })
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import io
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image

from flask import Flask, request, jsonify

# Load the model
model = keras.models.load_model("ml.h5")

class_names = [
    '8992753033737', '8992753033713', '8993351124209', '8993007000109', '8998009040313', '8998009010569', '8998009010248'
]

recommendations = {
    "8992753033737": ["ff strawberry_lowfat", "gf strawberry", "um strawberry", "indomilk strawberry"],
    "8992753033713": ["gf strawberry", "um strawberry", "indomilk strawberry"],
    "8993351124209": ["um strawberry", "indomilk strawberry"],
    "8993007000109": ["um strawberry", "gf strawberry"],
    "8998009040313": ["gf strawberry", "indomilk strawberry"],
    "8998009010569": [],
    "8998009010248": []
}

# Function to transform image
def transform_image(pillow_image):
    # Convert image to numpy array and normalize
    data = np.asarray(pillow_image)
    data = data / 255.0
    
    # Ensure grayscale images have 1 channel
    if len(data.shape) == 2:
        data = np.expand_dims(data, axis=-1)
    
    # Resize and convert to RGB if necessary
    data = tf.image.resize(data, [150, 150])
    
    # Convert grayscale to RGB if input shape is (150, 150, 1)
    if data.shape[-1] == 1:
        data = tf.image.grayscale_to_rgb(data)
    
    # Expand dimensions to match expected input shape (None, 150, 150, 3)
    data = tf.expand_dims(data, axis=0)
    
    return data

# Function to predict using the loaded model
def predict(tensor):
    predictions = model.predict(tensor)
    label = np.argmax(predictions[0])
    return label

# Initialize Flask application
app = Flask(__name__)

# Define endpoint for image classification
@app.route("/scan", methods=["POST"])
def predict():
    # Check if request contains file
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    
    # Check if the file is a valid image
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    try:
        # Read image file
        image = Image.open(io.BytesIO(file.read()))
        
        # Preprocess image and perform prediction
        input_data = transform_image(image)
        prediction = model.predict(input_data)
        prediction_idx = np.argmax(prediction)
        predicted_class = class_names[prediction_idx]
        prediction_prob = float(prediction[0][prediction_idx])
        
        # Get recommendations for the predicted class
        if predicted_class in recommendations:
            recommended_products = recommendations[predicted_class]
        else:
            recommended_products = []

        # Return JSON response with predicted class, probability, and recommendations
        response = {
            "predicted_class": predicted_class,
            "prediction_prob": prediction_prob,
            "recommendations": recommended_products
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask application
if __name__ == "__main__":
    app.run(debug=True, port=5000)

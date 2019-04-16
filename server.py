from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd

from backend.detect_v2 import predict

app = Flask(__name__)
CORS(app)

DIR = 'backend/tests/imgs/temp.jpg'

@app.route('/', methods=['POST']) #
def App():
    
    # print(request.files['image'])
    image = request.files['image']
    image.save(DIR)
    print('predicting... wait sec')

    # run model here
    pred = predict()
    return pred


if __name__ == "__main__":
    print('----------READY----------')
    app.run()

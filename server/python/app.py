from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from trading_brain import TradingBrain

app = Flask(__name__)
CORS(app)

# Initialize the TradingBrain once
brain = TradingBrain()

@app.route('/analyze', methods=['POST'])
def analyze():
    req = request.get_json()
    analysis_type = req.get('type')
    data = req.get('data', {})
    result = brain.process_analysis(analysis_type, data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
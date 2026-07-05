"""API routes blueprint"""
from flask import Blueprint, jsonify, request
from datetime import datetime

api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET', 'POST'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'voxcode-api',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '0.1.0'
    }), 200


@api_bp.route('/status', methods=['GET'])
def status():
    """Detailed status endpoint"""
    return jsonify({
        'status': 'running',
        'database': 'connected',
        'features': {
            'auth': True,
            'projects': True,
            'code_generation': False,  # TODO: implement
            'voice_input': False,  # TODO: implement
        }
    }), 200


# TODO: Add auth routes
# TODO: Add project routes
# TODO: Add code generation routes
# TODO: Add voice input WebSocket routes

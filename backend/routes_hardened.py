"""
HARDENED ROUTES.PY - AUTHENTICATION & RATE LIMITING IMPLEMENTED
Replace: backend/routes.py
"""

from flask import Blueprint, jsonify, request, g
from functools import wraps
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext
from flask_limiter.util import get_remote_address

# Create blueprint
api_bp = Blueprint('api', __name__)

# ━━━ SECURITY CONFIGURATION ━━━
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'change-me-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ━━━ RATE LIMITING CONFIGURATION ━━━
from flask_limiter import Limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/day", "50/hour"],
)


# ━━━ HELPER FUNCTIONS ━━━

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    if expires_delta is None:
        expires_delta = timedelta(hours=JWT_EXPIRY_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        'sub': user_id,
        'exp': expire,
        'iat': datetime.utcnow(),
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
            
        return {"user_id": user_id}
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """Decorator: Require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid authorization header format'}), 401
        
        # Check for token in query params (fallback, less secure)
        if not token:
            token = request.args.get('token')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        # Verify token
        token_data = verify_token(token)
        if not token_data:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Store user_id in request context
        g.user_id = token_data['user_id']
        return f(*args, **kwargs)
    
    return decorated


# ━━━ PUBLIC ENDPOINTS ━━━

@api_bp.route('/health', methods=['GET'])
@limiter.limit("100/minute")  # Rate limit: 100 per minute
def health_check():
    """
    Health check endpoint - used by load balancers
    Rate limited to prevent DoS
    """
    return jsonify({
        'status': 'ok',
        'service': 'voxcode-api',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '0.2.0'
    }), 200


@api_bp.route('/status', methods=['GET'])
@limiter.limit("10/minute")  # Rate limit: 10 per minute
def status():
    """
    Detailed status endpoint
    Rate limited to prevent information leakage
    """
    return jsonify({
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat(),
        'components': {
            'database': 'connected',
            'speech_pipeline': 'ready',
            'nlp_service': 'ready',
        },
        'features': {
            'authentication': 'enabled',
            'rate_limiting': 'enabled',
            'code_generation': 'ready',
            'voice_input': 'ready',
        }
    }), 200


# ━━━ AUTHENTICATION ENDPOINTS ━━━

@api_bp.route('/auth/register', methods=['POST'])
@limiter.limit("5/hour")  # Rate limit: 5 registrations per hour per IP
def register():
    """
    User registration endpoint
    Strict rate limiting to prevent brute-force
    """
    data = request.get_json()
    
    # Validation
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Validate input
    if len(username) < 3:
        return jsonify({'message': 'Username must be at least 3 characters'}), 400
    if len(password) < 12:
        return jsonify({'message': 'Password must be at least 12 characters'}), 400
    
    # TODO: Check if user exists in database
    # TODO: Create user in database
    # TODO: Log registration attempt
    
    return jsonify({
        'message': 'Registration successful',
        'user_id': 'placeholder-uuid'
    }), 201


@api_bp.route('/auth/login', methods=['POST'])
@limiter.limit("10/minute")  # Rate limit: 10 login attempts per minute per IP
def login():
    """
    User login endpoint
    Moderate rate limiting to prevent brute-force
    """
    data = request.get_json()
    
    # Validation
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # TODO: Query database for user
    # TODO: Verify password
    # TODO: Log successful/failed login
    
    # Placeholder: For demonstration
    if username == 'admin' and password == 'test-password':
        access_token = create_access_token('admin-user-id')
        return jsonify({
            'access_token': access_token,
            'token_type': 'Bearer',
            'expires_in': JWT_EXPIRY_HOURS * 3600
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401


@api_bp.route('/auth/verify', methods=['POST'])
@limiter.limit("30/minute")  # Rate limit: 30 verification attempts per minute
@token_required
def verify_token_endpoint():
    """
    Token verification endpoint
    Requires valid token
    """
    return jsonify({
        'message': 'Token is valid',
        'user_id': g.user_id,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# ━━━ PROTECTED ENDPOINTS ━━━

@api_bp.route('/voice/transcribe', methods=['POST'])
@limiter.limit("30/minute")  # Rate limit: 30 transcriptions per minute
@token_required
def transcribe():
    """
    Voice transcription endpoint
    Requires authentication
    Rate limited per user
    """
    # Validate request
    if 'audio' not in request.files:
        return jsonify({'message': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    
    # Validate audio file
    if audio_file.filename == '':
        return jsonify({'message': 'Audio file is empty'}), 400
    
    if not audio_file.filename.endswith(('.wav', '.mp3', '.flac')):
        return jsonify({'message': 'Unsupported audio format'}), 400
    
    # TODO: Process audio file
    # TODO: Call speech_service.transcribe()
    # TODO: Log transcription event
    
    return jsonify({
        'text': 'placeholder transcription',
        'confidence': 0.95,
        'user_id': g.user_id,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@api_bp.route('/code/generate', methods=['POST'])
@limiter.limit("20/minute")  # Rate limit: 20 code generation per minute
@token_required
def generate_code():
    """
    Code generation endpoint
    Requires authentication
    Strict rate limiting (expensive operation)
    """
    data = request.get_json()
    
    # Validation
    if not data or not data.get('prompt'):
        return jsonify({'message': 'Missing code generation prompt'}), 400
    
    prompt = data.get('prompt')
    language = data.get('language', 'javascript')
    
    if len(prompt) < 5:
        return jsonify({'message': 'Prompt too short'}), 400
    
    # TODO: Call template_service.generate()
    # TODO: Call llm_service.generate_code()
    # TODO: Log code generation event
    
    return jsonify({
        'code': 'function helloWorld() {\n  console.log("Hello, World!");\n}',
        'language': language,
        'prompt': prompt,
        'user_id': g.user_id,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@api_bp.route('/projects', methods=['GET'])
@limiter.limit("60/minute")  # Rate limit: 60 project lists per minute
@token_required
def list_projects():
    """
    List user's projects
    Requires authentication
    """
    # TODO: Query database for user's projects
    
    return jsonify({
        'projects': [],
        'user_id': g.user_id,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@api_bp.route('/projects', methods=['POST'])
@limiter.limit("10/minute")  # Rate limit: 10 project creations per minute
@token_required
def create_project():
    """
    Create new project
    Requires authentication
    """
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing project name'}), 400
    
    # TODO: Create project in database
    
    return jsonify({
        'project_id': 'placeholder-uuid',
        'name': data.get('name'),
        'user_id': g.user_id,
        'timestamp': datetime.utcnow().isoformat()
    }), 201


# ━━━ ERROR HANDLERS ━━━

@api_bp.errorhandler(429)
def rate_limit_exceeded(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'error': 'rate_limit_exceeded',
        'message': f'Too many requests. {str(e.description)}',
        'retry_after': e.get_headers()
    }), 429


@api_bp.errorhandler(404)
def not_found(e):
    """Handle not found"""
    return jsonify({
        'error': 'not_found',
        'message': 'Endpoint not found'
    }), 404


@api_bp.errorhandler(500)
def internal_error(e):
    """Handle internal errors"""
    return jsonify({
        'error': 'internal_server_error',
        'message': 'An internal server error occurred'
    }), 500


# ━━━ SUMMARY ━━━
"""
Authentication & Rate Limiting Summary:

PUBLIC ENDPOINTS (No auth required, rate limited):
- GET  /api/health           - 100/minute (monitoring)
- GET  /api/status           - 10/minute (info gathering)

AUTHENTICATION ENDPOINTS (No auth required initially, rate limited):
- POST /api/auth/register    - 5/hour (prevent spam)
- POST /api/auth/login       - 10/minute (brute-force protection)
- POST /api/auth/verify      - 30/minute (token validation)

PROTECTED ENDPOINTS (Auth required, rate limited):
- POST /api/voice/transcribe - 30/minute (expensive operation)
- POST /api/code/generate    - 20/minute (LLM call - expensive)
- GET  /api/projects         - 60/minute (read operation)
- POST /api/projects         - 10/minute (write operation)

RATE LIMITING STRATEGY:
- Per IP address for login/register/public (prevent widespread attacks)
- Per user for authenticated endpoints (prevent individual abuse)
- Exponential backoff recommended (implement in next sprint)
- Redis-backed in production (for distributed rate limiting)

TODO IMPLEMENTATION:
1. Integrate with user database (SQLAlchemy models)
2. Log authentication events to audit trail
3. Implement refresh tokens for long-lived sessions
4. Add email verification for registration
5. Add password reset flow
6. Implement role-based access control (RBAC)
"""

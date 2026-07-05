"""
HARDENED APP.PY - PRODUCTION-GRADE FLASK APPLICATION
Replace: backend/app.py
"""

import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config
from models import db, migrate
from routes import api_bp

# ━━━ LOGGING CONFIGURATION ━━━
def setup_logging(app):
    """Configure logging based on environment"""
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    log_format = app.config.get('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format,
        handlers=[
            logging.StreamHandler(),  # Console output
            logging.FileHandler('voxcode_api.log'),  # File output
        ]
    )
    
    # Suppress verbose third-party loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('flask_cors').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)


def create_app(config_name='development'):
    """Application factory pattern - production hardened"""
    
    # 1. Create Flask app instance
    app = Flask(__name__)
    
    # 2. Load configuration
    app.config.from_object(config[config_name])
    
    # 3. Setup logging
    setup_logging(app)
    logger = logging.getLogger(__name__)
    logger.info(f"Starting VoxCode API in {config_name} mode")
    
    # 4. Security Headers Middleware
    @app.after_request
    def set_security_headers(response):
        """Add security headers to all responses"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'"
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'microphone=(), camera=(), geolocation=()'
        return response
    
    # 5. Initialize database extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # 6. Configure CORS with security hardening
    cors_config = {
        'origins': app.config['CORS_ORIGINS'],
        'methods': app.config.get('CORS_METHODS', ['GET', 'POST', 'PUT', 'DELETE']),
        'allow_headers': app.config.get('CORS_ALLOW_HEADERS', ['Content-Type', 'Authorization']),
        'expose_headers': app.config.get('CORS_EXPOSE_HEADERS', ['Content-Length']),
        'supports_credentials': app.config.get('CORS_SUPPORTS_CREDENTIALS', False),
        'max_age': app.config.get('CORS_MAX_AGE', 3600),
    }
    CORS(app, resources={"/api/*": cors_config})
    logger.info(f"CORS configured for origins: {cors_config['origins']}")
    
    # 7. Initialize Rate Limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=app.config.get('RATELIMIT_DEFAULT', '100/hour').split(','),
        storage_uri=app.config.get('RATELIMIT_STORAGE_URL', 'memory://'),
        strategy=app.config.get('RATELIMIT_STRATEGY', 'moving-window'),
        in_memory_fallback_enabled=True,
    )
    logger.info(f"Rate limiting enabled: {app.config.get('RATELIMIT_STORAGE_URL')}")
    
    # 8. Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 9. Shell context for flask shell
    @app.shell_context_processor
    def make_shell_context():
        return {'db': db}
    
    # 10. Create tables on startup
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            if config_name == 'production':
                raise
    
    # 11. Health check route (not rate-limited to prevent false failures)
    @app.route('/health', methods=['GET'])
    @limiter.exempt  # Exempt from rate limiting for monitoring
    def health():
        """Liveness probe endpoint"""
        return {'status': 'healthy', 'service': 'voxcode-api'}, 200
    
    return app, limiter


if __name__ == '__main__':
    # Get configuration from environment
    env = os.getenv('FLASK_ENV', 'development')
    debug = os.getenv('FLASK_DEBUG', env == 'development')
    host = os.getenv('FLASK_HOST', '127.0.0.1')  # Default: localhost only
    port = int(os.getenv('FLASK_PORT', 5000))
    
    logger = logging.getLogger(__name__)
    logger.warning(f"Starting Flask development server: {host}:{port}")
    logger.warning("⚠️  This is NOT suitable for production - use Gunicorn + Nginx")
    
    app, limiter = create_app(env)
    app.run(
        host=host,
        port=port,
        debug=debug,
        use_reloader=True if debug else False,
    )

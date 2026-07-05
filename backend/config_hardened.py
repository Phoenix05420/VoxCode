# VoxCode TIER 1 Remediation - Hardened Configuration Files
# These are the corrected versions of config, app, and routes

"""
HARDENED CONFIG.PY - PRODUCTION-GRADE FLASK CONFIGURATION
Replace: backend/config.py
"""

import os
from datetime import timedelta
import secrets

# Validation Helper
def _validate_production_secrets():
    """Ensure production secrets are strong and environment-sourced"""
    if os.getenv('FLASK_ENV') == 'production':
        secret_key = os.environ.get('SECRET_KEY')
        jwt_secret = os.environ.get('JWT_SECRET_KEY')
        
        if not secret_key:
            raise ValueError(
                'CRITICAL: SECRET_KEY environment variable not set for production. '
                'Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"'
            )
        if not jwt_secret:
            raise ValueError(
                'CRITICAL: JWT_SECRET_KEY environment variable not set for production'
            )
        if len(secret_key) < 32:
            raise ValueError('CRITICAL: SECRET_KEY must be at least 32 characters')


class Config:
    """Base configuration - shared across all environments"""
    
    # ━━━ SECURITY ━━━
    # Never set defaults for secrets - fail loudly if missing
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # Security Headers
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Flask
    DEBUG = False
    TESTING = False
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_ECHO_POOL = False
    
    # ━━━ JWT CONFIGURATION ━━━
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    
    # ━━━ CORS - RESTRICTED ━━━
    # Default: development with localhost only
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://localhost:3002').split(',')
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization']
    CORS_EXPOSE_HEADERS = ['Content-Length', 'X-Total-Count']
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_MAX_AGE = 3600
    
    # ━━━ RATE LIMITING ━━━
    RATELIMIT_ENABLED = True
    RATELIMIT_STRATEGY = "moving-window"
    RATELIMIT_DEFAULT = "100/hour"
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # ━━━ LOGGING ━━━
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'


class DevelopmentConfig(Config):
    """Development configuration - relaxed for local development"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    
    # Allow localhost development origins
    CORS_ORIGINS = [
        'http://localhost:5173',     # Vite frontend
        'http://localhost:3000',      # Alternative frontend
        'http://localhost:3002',      # Next.js frontend
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
    ]
    
    # Development database - in-memory SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///voxcode_dev.db'
    )
    
    # Loose rate limiting for development
    RATELIMIT_DEFAULT = "10000/hour"
    
    # More verbose logging in dev
    LOG_LEVEL = 'DEBUG'


class TestingConfig(Config):
    """Testing configuration - isolated & fast"""
    TESTING = True
    
    # In-memory SQLite for speed
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Short JWT expiry for tests
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    
    # Disable rate limiting in tests
    RATELIMIT_ENABLED = False
    
    # Use memory backend for tests
    RATELIMIT_STORAGE_URL = 'memory://'


class ProductionConfig(Config):
    """Production configuration - hardened & secure"""
    DEBUG = False
    TESTING = False
    
    # ━━━ MANDATORY ENVIRONMENT VARIABLES ━━━
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError(
            'CRITICAL: DATABASE_URL environment variable not set for production. '
            'Format: postgresql://user:password@host:port/database'
        )
    
    # Validate secrets on startup
    _validate_production_secrets()
    
    # ━━━ DATABASE HARDENING ━━━
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,                    # Connection pool size
        'pool_recycle': 3600,               # Recycle connections after 1 hour
        'pool_pre_ping': True,              # Test connection before using
        'pool_timeout': 30,                 # Timeout for acquiring connection
        'max_overflow': 40,                 # Max overflow connections
        'echo': False,                      # No query logging
        'echo_pool': False,                 # No pool logging
    }
    
    # ━━━ SECURITY ENFORCEMENT ━━━
    # Require HTTPS in production
    PREFERRED_URL_SCHEME = 'https'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=8)  # Shorter in production
    
    # ━━━ CORS - PRODUCTION WHITELIST ━━━
    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS',
        'https://voxcode.example.com'
    ).split(',')
    CORS_SUPPORTS_CREDENTIALS = True
    
    # Validate CORS origins are HTTPS
    for origin in CORS_ORIGINS:
        if not origin.startswith('https://'):
            raise ValueError(f'Production CORS origin must use HTTPS: {origin}')
    
    # ━━━ RATE LIMITING - STRICT ━━━
    RATELIMIT_ENABLED = True
    RATELIMIT_STRATEGY = "moving-window"
    RATELIMIT_DEFAULT = "100/hour"
    
    # Must use Redis in production (not memory)
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL')
    if not RATELIMIT_STORAGE_URL:
        raise ValueError(
            'CRITICAL: REDIS_URL environment variable not set for production. '
            'Required for distributed rate limiting. '
            'Format: redis://host:6379'
        )
    
    # ━━━ LOGGING ━━━
    LOG_LEVEL = 'WARNING'  # Minimal logging in production
    
    # ━━━ FEATURE FLAGS ━━━
    ENABLE_DEBUG_ROUTES = False
    ENABLE_QUERY_PROFILING = False


# Configuration selector
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(env=None):
    """Get config based on environment"""
    env = env or os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])


# Validation on module import
if __name__ != '__main__':
    current_env = os.getenv('FLASK_ENV', 'development')
    if current_env == 'production':
        _validate_production_secrets()

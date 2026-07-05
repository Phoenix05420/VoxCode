"""VoxCode Flask Application Entry Point"""
from flask import Flask
from flask_cors import CORS
from config import config
from models import db, migrate
from routes import api_bp


def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Shell context for flask shell
    @app.shell_context_processor
    def make_shell_context():
        return {'db': db}
    
    # Create tables on first run
    with app.app_context():
        db.create_all()
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

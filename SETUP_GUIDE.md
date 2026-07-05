# VoxCode - Development Environment Setup Guide

**VoxCode** is a voice-controlled code generation assistant with a React frontend and Python/Flask backend.

## Quick Start (5 minutes)

### Prerequisites
- **Docker & Docker Compose** (recommended for local dev)
- **Node.js 20+** (for frontend development)
- **Python 3.11+** (for backend development)
- **PostgreSQL 16** (if not using Docker)

### Option 1: Docker Compose (Recommended)
```bash
# From root directory
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - Database: localhost:5432
```

### Option 2: Local Development (Without Docker)

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Start Flask server
flask run
# API available at http://localhost:5000
```

#### 2. Frontend Setup (Next.js 16 App Router)
```bash
cd frontend-next

# Install dependencies (one-time)
npm install

# Start dev server
npm run dev
# Frontend available at http://localhost:3000
```

#### 3. Database Setup (PostgreSQL)
```bash
# Ensure PostgreSQL is running on localhost:5432
# Create database
createdb voxcode_dev

# Initialize migrations (from backend directory)
flask db upgrade
```

---

## Project Structure

```
X:\VoxCode/
├── backend/                     # Flask API Server
│   ├── app.py                  # Application entry point
│   ├── config.py               # Configuration management
│   ├── models.py               # SQLAlchemy ORM models
│   ├── routes.py               # API endpoints
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile              # Container definition
│   └── .env.example            # Environment template
│
├── workspace-mvp/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # React components (TopBar, Sidebar, Editor, AIPanel)
│   │   ├── store/              # Zustand state management
│   │   ├── pages/              # Page components (TODO)
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── styles.css          # Tailwind + global styles
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.js       # PostCSS config
│   ├── Dockerfile             # Container definition
│   └── .env.example           # Environment template
│
├── graphify-out/              # Knowledge graph analysis (read-only)
├── docker-compose.yml         # Local dev orchestration
├── .env.example               # Global environment template
└── README.md                  # This file
```

---

## Configuration

### Environment Variables

#### Backend (.env or .env.local)
```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voxcode_dev
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENV=development
```

### Database Initialization
```bash
# From backend directory
flask db init          # Initialize migrations (one-time)
flask db migrate       # Create migrations
flask db upgrade       # Apply migrations
```

---

## Daily Development Workflow

### 1. Start Services
```bash
# Option A: Docker (all services at once)
docker-compose up

# Option B: Manual (separate terminals)
# Terminal 1: Backend
cd backend && flask run

# Terminal 2: Frontend (Next.js)
cd frontend-next && npm run dev

# Terminal 3: (Optional) Database
# Ensure PostgreSQL is running on port 5432
```

### 2. Make Changes
- **Frontend changes** → Hot reload automatic (Next.js Fast Refresh)
- **Backend changes** → Hot reload automatic (Flask debug mode)
- **Database schema changes** → Run migrations: `flask db migrate && flask db upgrade`

### 3. Test Locally
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: `curl http://localhost:5000/api/health`

### 4. Commit with Conventional Commits
```bash
git add .
git commit -m "feat: add voice input component"
# Examples: feat, fix, refactor, docs, test, chore, style
```

---

## Git Workflow

### Branches
- **main**: Production-ready code
- **dev**: Integration/staging branch
- **feature/\***: Feature branches (e.g., `feature/voice-input`)
- **fix/\***: Bug fix branches (e.g., `fix/api-cors`)

### Creating a Feature
```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit
git add .
git commit -m "feat: implement your feature"

# Push and create PR
git push origin feature/your-feature
```

### Merging to Main
- Create PR from `dev` → `main`
- Require at least 1 review
- All CI checks must pass
- Squash and merge (keep history clean)

---

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', service: 'voxcode-api', timestamp: '...', version: '0.1.0' }
```

### TODO: Add More Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT token generation
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `POST /api/code/generate` - Generate code with LLM
- `WS /api/voice` - WebSocket for voice streaming

---

## Troubleshooting

### "Port Already in Use"
```bash
# Find and kill process using port 5000/3000/5173
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### "Database Connection Failed"
```bash
# Ensure PostgreSQL is running
# Check connection string in .env
# Test connection: psql postgresql://postgres:postgres@localhost:5432/voxcode_dev
```

### "npm install fails"
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### "Flask migrations error"
```bash
# Reset migrations (development only!)
rm -rf backend/migrations/
flask db init
flask db migrate
flask db upgrade
```

### "Vite cache issues"
```bash
# Clear Vite cache
rm -rf workspace-mvp/.vite
rm -rf workspace-mvp/dist
npm run dev
```

---

## Development Tools

### Frontend
- **Vite**: Fast build tool and dev server
- **React 18**: UI framework
- **React Router v6**: Client-side routing
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: Code editor component

### Backend
- **Flask**: Lightweight web framework
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migration tool
- **Flask-CORS**: CORS support
- **Flask-JWT-Extended**: JWT authentication
- **psycopg2**: PostgreSQL adapter

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Relational database

---

## Performance Notes

### Frontend Optimization
- Code splitting with React Router
- Lazy loading with `React.lazy()`
- Memoization with `React.memo()`
- Monitor bundle size: `npm run build && npm run preview`

### Backend Optimization
- Database query optimization (use indexes)
- Connection pooling (SQLAlchemy)
- Response caching (Redis - TODO)
- Rate limiting (Flask - TODO)

---

## Security Considerations

### Do NOT Commit
- `.env` files with secrets
- Private API keys
- Database credentials
- JWT secrets

### Before Production
- [ ] Set unique `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set `FLASK_ENV=production`
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Use environment-specific configs

---

## Next Steps

### Phase 1: Dev Environment (Current)
- ✅ Backend scaffold
- ✅ Frontend framework (React + Tailwind)
- ✅ Docker Compose setup
- ⏳ Database migrations
- ⏳ API health check

### Phase 2: Frontend Core
- [ ] Implement Zustand stores for all data
- [ ] Build page components (Dashboard, Projects, Settings)
- [ ] Add form validation and error handling
- [ ] Implement authentication UI

### Phase 3: Backend API
- [ ] User authentication (JWT)
- [ ] Project CRUD operations
- [ ] Code generation endpoints
- [ ] WebSocket for voice streaming

### Phase 4: Voice Pipeline
- [ ] Vosk integration (local STT)
- [ ] Whisper integration (cloud STT)
- [ ] WebRTC VAD (voice activity detection)
- [ ] Command processor (intent detection)

### Phase 5: Testing & Deployment
- [ ] E2E tests (Playwright)
- [ ] Unit tests (Vitest + pytest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy to staging/production

---

## Support & Questions

- Check existing GitHub issues
- Create a new issue with detailed description
- Use conventional commit messages for clarity

---

## License
MIT

---

**Happy coding! 🚀**

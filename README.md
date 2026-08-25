# OnboardAI - Personalized AI Employee Onboarding Assistant

An enterprise-grade AI-powered employee onboarding platform with a React frontend, FastAPI backend, LangGraph multi-agent orchestration, and RAG-powered AI agents.

## Project Overview

OnboardAI leverages:
- **Frontend**: React + Vite with a clean, light enterprise UI
- **Backend**: Python FastAPI with MVC architecture
- **AI/ML**: OpenAI API, LangChain, ChromaDB, LangGraph
- **Agents**: HR Agent, IT Agent, Training Agent
- **Database**: SQLAlchemy + SQLite
- **Monitoring**: LangSmith tracing
- **Deployment**: Vercel (frontend), Render (backend)

## Architecture

```
OnboardAI/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI + MVC layers
│   ├── app/
│   │   ├── main.py           # Controllers / HTTP endpoints
│   │   ├── services.py       # Business logic
│   │   ├── repositories.py   # Data access layer
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── agents.py         # LangGraph agents
│   │   └── rag.py            # ChromaDB RAG system
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── samples/                  # Sample documents for RAG
│   ├── hr_policies.md
│   ├── it_support.md
│   ├── training_materials.md
│   └── security_guidelines.md
└── README.md
```

## Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Use Python 3.11 or 3.12 for the pinned LangChain and Chroma stack. Python 3.14 currently lacks compatible wheels for some pinned native dependencies.

## Features

- ✅ Multi-agent orchestration with LangGraph Router
- ✅ RAG system with ChromaDB for document search
- ✅ Employee profiles with role-based personalization
- ✅ Interactive AI chat with HR, IT, and Training agents
- ✅ Onboarding task management
- ✅ Training progress tracking
- ✅ IT support ticket system with human intervention
- ✅ Real-time LangSmith tracing
- ✅ Comprehensive error handling and validation

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=ls_...
DATABASE_URL=sqlite:///./onboardai.db
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - Employee login
- `GET /api/employees/{id}` - Get employee profile
- `GET /api/dashboard` - Get dashboard data
- `POST /api/chat` - AI chat endpoint
- `GET /api/tasks` - Get onboarding tasks
- `POST /api/tasks/{id}/complete` - Complete a task
- `GET /api/training` - Get training materials
- `GET /api/tickets` - Get support tickets
- `POST /api/tickets` - Create support ticket

## Development Workflow

1. Start backend: `cd backend && python -m uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Visit http://localhost:5173 (frontend)
4. Backend API at http://localhost:8000
5. API documentation at http://localhost:8000/docs

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```

## Deployment

- **Frontend**: Deploy to Vercel - `vercel deploy`
- **Backend**: Deploy to Render using the included `render.yaml`
- **Frontend**: Deploy to Vercel from `frontend/` using the included `vercel.json`
- **Database**: SQLite (can migrate to PostgreSQL for production)

## Documentation

- [Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](./docs/FRONTEND_ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Agent Design](./docs/AGENTS.md)
- [RAG Implementation](./docs/RAG.md)

## License

Proprietary - TechNova Solutions

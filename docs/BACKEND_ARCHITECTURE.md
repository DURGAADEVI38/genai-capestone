# Backend Architecture - OnboardAI

## Overview

The OnboardAI backend follows a clean **MVC (Model-View-Controller)** architecture pattern with clear separation of concerns:

```
app/
├── models.py         # SQLAlchemy ORM models
├── schemas.py        # Pydantic validation schemas
├── database.py       # Database configuration and session management
├── repositories.py   # Data access layer
├── services.py       # Business logic layer
├── agents.py         # LangGraph multi-agent system
├── rag.py            # RAG system with ChromaDB
└── main.py          # FastAPI application and routes
```

## Architecture Layers

### 1. Models (models.py)
**Responsibility**: Define database schema and relationships

- Employee, OnboardingTask, TrainingMaterial, TrainingProgress, SupportTicket, ChatHistory
- Uses SQLAlchemy ORM for type safety
- Enums for status types and constants

**Key Entities**:
- `Employee`: Core user entity with role, department, experience level
- `OnboardingTask`: Trackable tasks with status and priority
- `TrainingMaterial`: Course/training content with metadata
- `TrainingProgress`: Tracks employee progress through training
- `SupportTicket`: IT support requests with status and resolution
- `ChatHistory`: Stores all AI agent interactions for audit trail

### 2. Schemas (schemas.py)
**Responsibility**: Validate and serialize request/response data

- Pydantic v2 models for runtime validation
- Request schemas (Create/Update operations)
- Response schemas (API responses)
- Shared enums for consistency

**Benefits**:
- Type safety across API
- Automatic request validation
- Swagger documentation generation
- Serialization/deserialization

### 3. Database Layer (database.py)
**Responsibility**: Database configuration and connection management

- SQLAlchemy engine setup
- Session factory (`SessionLocal`)
- Dependency injection via `get_db()`
- Database initialization (`init_db()`)
- Seed data loading (`seed_db()`)

**Features**:
- Supports SQLite (development) and PostgreSQL (production)
- Proper session lifecycle management
- Logging and debugging support

### 4. Repositories (repositories.py)
**Responsibility**: Abstract data access operations

Repositories provide a clean interface for database operations:
- `EmployeeRepository`: Employee CRUD operations
- `OnboardingTaskRepository`: Task management
- `TrainingProgressRepository`: Training tracking
- `SupportTicketRepository`: Support ticket management
- `ChatHistoryRepository`: Chat persistence

**Benefits**:
- Decouples business logic from database specifics
- Easier testing (can mock repositories)
- Single place to modify query logic
- Consistent error handling

**Pattern**:
```python
class EmployeeRepository:
    @staticmethod
    def get_by_id(db: Session, employee_id: int) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.id == employee_id).first()
```

### 5. Services (services.py)
**Responsibility**: Implement business logic and orchestration

Services coordinate repositories, handle complex workflows:
- `EmployeeService`: Employee profile management
- `OnboardingTaskService`: Task assignment and tracking
- `TrainingService`: Training progress and recommendations
- `SupportTicketService`: Ticket lifecycle management
- `ChatService`: Chat history persistence
- `DashboardService`: Dashboard computation

**Key Methods**:
- `get_dashboard()`: Aggregates stats for dashboard
- `get_next_recommended_task()`: Smart task recommendation
- `get_training_progress_percentage()`: Calculate training metrics

**Benefits**:
- Business rules in one place
- Reusable across controllers
- Easy to test in isolation
- Clear separation from HTTP layer

### 6. RAG System (rag.py)
**Responsibility**: Document retrieval and embedding system

- **ChromaDB Integration**: Vector database for document storage
- **OpenAI Embeddings**: Generate embeddings for documents
- **Text Splitting**: Chunk documents intelligently
- **Search Functionality**: Find relevant documents by query

**Key Components**:
```python
class RAGSystem:
    add_document()        # Add documents to index
    search()             # Find relevant documents
    delete_document()    # Remove documents
    clear_collection()   # Reset index
```

**Document Structure**:
- HR policies and procedures
- IT support guidelines
- Training materials
- Security guidelines

**Workflow**:
1. Documents loaded and chunked
2. Embeddings generated using OpenAI
3. Stored in ChromaDB with metadata
4. Agents search by query similarity

### 7. Agents (agents.py)
**Responsibility**: Multi-agent orchestration with LangGraph

**Three Specialized Agents**:

1. **HR Agent**
   - Handles: Policies, leave, benefits, compensation
   - Searches: HR policies documents
   - Responds: Professional HR guidance

2. **IT Agent**
   - Handles: Technical issues, setup, access, hardware
   - Searches: IT support documents
   - Responds: Troubleshooting steps or ticket creation

3. **Training Agent**
   - Handles: Skill development, courses, learning paths
   - Searches: Training materials
   - Responds: Personalized recommendations

**Router System**:
- Uses LLM to classify incoming queries
- Routes to appropriate agent
- Maintains conversation state
- Tracks tools used and sources

**LangGraph Workflow**:
```
Entry → Router → [HR Agent / IT Agent / Training Agent] → Exit
```

### 8. API Layer (main.py)
**Responsibility**: HTTP endpoints and request handling

- FastAPI application setup
- CORS configuration
- Route definitions
- Error handling
- Startup/shutdown events

**Endpoint Categories**:
- **Auth**: `/api/auth/login`
- **Employee**: `/api/employees/{id}`
- **Dashboard**: `/api/dashboard/{id}`
- **Tasks**: `/api/tasks`, `/api/tasks/{id}`
- **Training**: `/api/training/materials`, `/api/training/progress`
- **Tickets**: `/api/tickets`, `/api/tickets/{id}`
- **Chat**: `/api/chat`, `/api/chat/history/{id}`

## Request/Response Flow

```
HTTP Request
    ↓
FastAPI Route Handler
    ↓
Schema Validation (Pydantic)
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database
    ↓
Response Schema Serialization
    ↓
HTTP Response
```

## Data Flow: Chat with AI

```
1. User sends message via POST /api/chat
2. API validates message using ChatMessage schema
3. Service fetches employee from database
4. RAG system searches relevant documents
5. LangGraph router classifies query
6. Appropriate agent processes with RAG results
7. Agent response + sources saved to ChatHistory
8. Response serialized and returned to client
```

## Database Schema

### Employee Table
```
id, employee_id, name, email, role, department, location,
joining_date, experience_level, manager_id, created_at, updated_at
```

### OnboardingTask Table
```
id, employee_id, title, description, category, status,
due_date, completed_at, priority, assigned_by, created_at, updated_at
```

### SupportTicket Table
```
id, ticket_number, employee_id, title, description, category,
priority, status, assigned_to, resolution_notes, created_at, resolved_at
```

### ChatHistory Table
```
id, employee_id, agent_type, user_message, agent_response,
source_documents, created_at
```

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...          # OpenAI API key for LLM and embeddings
LANGSMITH_API_KEY=ls_...        # LangSmith tracing
DATABASE_URL=sqlite:///...      # Database URL
CHROMA_PATH=./chroma_data       # ChromaDB persistence directory
SECRET_KEY=your-secret          # JWT secret
FRONTEND_URL=http://localhost   # CORS origin
```

### Dependencies
- FastAPI: Web framework
- SQLAlchemy: ORM
- Pydantic: Validation
- LangChain: LLM tools
- LangGraph: Agent orchestration
- ChromaDB: Vector database
- OpenAI: Language model and embeddings

## Testing Strategy

### Unit Tests
- Repository methods in isolation
- Service business logic
- Schema validation

### Integration Tests
- Full request/response cycle
- Database operations
- RAG system functionality
- Agent routing and responses

### End-to-End Tests
- Complete workflows
- Multi-step processes (task → completion)
- Chat with agents

## Security Considerations

1. **Authentication**: JWT tokens (mock in demo)
2. **Authorization**: Role-based access control
3. **Data Protection**: Encrypted database fields
4. **API Security**: CORS, rate limiting
5. **Input Validation**: Pydantic schemas
6. **Audit Trail**: ChatHistory logging

## Performance Optimizations

1. **Caching**: LLM responses via RAG
2. **Indexing**: Database indexes on common queries
3. **Lazy Loading**: Related data on demand
4. **Pagination**: List endpoints support pagination
5. **ChromaDB**: Vector similarity search efficiency

## Deployment

### Development
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Production
- Render or Railway
- PostgreSQL database
- Environment variables via secrets
- Gunicorn or similar ASGI server

## Future Enhancements

1. Advanced search filters
2. Real-time notifications
3. Batch operations
4. Advanced analytics
5. Custom agent creation
6. Multi-language support
7. Workflow automation

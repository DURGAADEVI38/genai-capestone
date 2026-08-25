# API Documentation - OnboardAI

## Base URL
```
Development: http://localhost:8000
Production: https://api.onboardai.com
```

## Authentication
Currently using mock tokens. Production should implement JWT.

```
Authorization: Bearer {token}
```

## Response Format

### Success Response
```json
{
  "id": 1,
  "name": "John Smith",
  ...
}
```

### Error Response
```json
{
  "error": "Not Found",
  "detail": "Employee not found",
  "status_code": 404
}
```

## Endpoints

### Health Check
```
GET /api/health
```
Returns API status.

### Employee Endpoints

#### Get Employee Profile
```
GET /api/employees/{id}
```
Returns complete employee profile.

**Response**:
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "name": "John Smith",
  "email": "john@technova.com",
  "role": "engineer",
  "department": "engineering",
  "location": "San Francisco, CA",
  "joining_date": "2024-01-15T00:00:00",
  "experience_level": "junior",
  "created_at": "2024-01-15T10:30:00"
}
```

#### Create Employee
```
POST /api/employees
Content-Type: application/json

{
  "employee_id": "EMP002",
  "name": "Sarah Johnson",
  "email": "sarah@technova.com",
  "role": "designer",
  "department": "design",
  "location": "New York, NY",
  "joining_date": "2024-02-01T00:00:00",
  "experience_level": "mid"
}
```

#### Update Employee
```
PUT /api/employees/{id}
Content-Type: application/json

{
  "name": "John Smith Updated",
  "location": "San Francisco, CA"
}
```

#### List Employees
```
GET /api/employees?skip=0&limit=100
```

### Dashboard Endpoints

#### Get Dashboard
```
GET /api/dashboard/{employee_id}
```
Aggregated dashboard data with stats and recommendations.

**Response**:
```json
{
  "employee": { ... },
  "stats": {
    "total_onboarding_tasks": 20,
    "completed_tasks": 5,
    "pending_tasks": 12,
    "blocked_tasks": 3,
    "training_progress_percentage": 35,
    "open_tickets": 2
  },
  "recommended_next_task": {
    "id": 15,
    "title": "Complete VPN Setup",
    "description": "Set up VPN access for remote work",
    ...
  },
  "pending_tasks": [...],
  "active_trainings": [...]
}
```

### Onboarding Task Endpoints

#### Get Employee Tasks
```
GET /api/employees/{employee_id}/tasks
```
Returns all tasks for an employee.

#### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "employee_id": 1,
  "title": "Complete Security Training",
  "description": "Mandatory security awareness training",
  "category": "training",
  "due_date": "2024-02-28T23:59:59",
  "priority": "high"
}
```

#### Get Task
```
GET /api/tasks/{task_id}
```

#### Update Task
```
PUT /api/tasks/{task_id}
Content-Type: application/json

{
  "status": "in_progress",
  "title": "Complete Security Training (Updated)"
}
```

#### Complete Task
```
POST /api/tasks/{task_id}/complete
```
Sets status to "completed" and records completion time.

### Training Endpoints

#### Get Training Materials
```
GET /api/training/materials
```
Returns all available training courses.

**Response**:
```json
[
  {
    "id": 1,
    "title": "Python Fundamentals",
    "description": "Learn Python basics",
    "content_type": "course",
    "required_role": "engineer",
    "required_experience_level": "junior",
    "duration_minutes": 240,
    "url": "https://example.com/python"
  }
]
```

#### Get Employee Training Progress
```
GET /api/employees/{employee_id}/training
```
Returns training progress for employee.

#### Start Training
```
POST /api/training/start/{material_id}
Content-Type: application/json

{
  "employee_id": 1
}
```

#### Update Training Progress
```
PUT /api/training/progress/{progress_id}
Content-Type: application/json

{
  "percentage": 50
}
```

### Support Ticket Endpoints

#### Get Open Tickets
```
GET /api/tickets/open
```
Returns all open support tickets (for IT team).

#### Get Employee Tickets
```
GET /api/employees/{employee_id}/tickets
```
Returns tickets for specific employee.

#### Create Support Ticket
```
POST /api/tickets
Content-Type: application/json

{
  "employee_id": 1,
  "title": "Laptop not connecting to VPN",
  "description": "Getting connection timeout error when trying to connect to VPN",
  "category": "vpn",
  "priority": "high"
}
```

**Response**:
```json
{
  "id": 1,
  "ticket_number": "TKT-000001",
  "employee_id": 1,
  "title": "Laptop not connecting to VPN",
  "description": "...",
  "category": "vpn",
  "priority": "high",
  "status": "open",
  "assigned_to": null,
  "resolution_notes": null,
  "created_at": "2024-02-01T10:30:00",
  "resolved_at": null
}
```

#### Get Ticket
```
GET /api/tickets/{ticket_id}
```

#### Update Ticket (IT Team)
```
PUT /api/tickets/{ticket_id}
Content-Type: application/json

{
  "status": "in_progress",
  "assigned_to": "Mike (IT)",
  "resolution_notes": "Working on VPN driver issue"
}
```

### Chat Endpoints

#### Send Message to AI
```
POST /api/chat
Content-Type: application/json

{
  "employee_id": 1,
  "message": "What's the process for requesting remote work?"
}
```

**Response**:
```json
{
  "id": 42,
  "agent_type": "hr_agent",
  "user_message": "What's the process for requesting remote work?",
  "agent_response": "At TechNova Solutions, to request remote work...",
  "source_documents": [
    "hr_policies.md",
    "work_from_home_policy.md"
  ],
  "created_at": "2024-02-01T10:35:00"
}
```

#### Get Chat History
```
GET /api/chat/history/{employee_id}?limit=50
```
Returns recent chat messages.

**Response**:
```json
[
  {
    "id": 42,
    "agent_type": "hr_agent",
    "user_message": "What's the process for requesting remote work?",
    "agent_response": "At TechNova Solutions...",
    "source_documents": ["hr_policies.md"],
    "created_at": "2024-02-01T10:35:00"
  }
]
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid auth |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

## Error Handling

### Common Errors

#### 404 Not Found
```json
{
  "error": "Not Found",
  "detail": "Employee not found",
  "status_code": 404
}
```

#### 400 Bad Request
```json
{
  "error": "Bad Request",
  "detail": "Invalid task status",
  "status_code": 400
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "detail": "An error occurred processing your request",
  "status_code": 500
}
```

## Pagination

List endpoints support pagination:

```
GET /api/employees?skip=0&limit=20
```

- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100, max: 1000)

## Rate Limiting

- API requests are not rate limited in development
- Production will implement rate limiting

## Webhooks

Not currently implemented. Plan for future releases.

## Examples

### Complete Onboarding Flow

1. **Employee logs in**
```
GET /api/employees/1
```

2. **Get dashboard**
```
GET /api/dashboard/1
```

3. **View pending tasks**
```
GET /api/employees/1/tasks
```

4. **Ask AI for help**
```
POST /api/chat
{
  "employee_id": 1,
  "message": "How do I set up my laptop?"
}
```

5. **Complete a task**
```
POST /api/tasks/5/complete
```

6. **Check training progress**
```
GET /api/employees/1/training
```

7. **Report an IT issue**
```
POST /api/tickets
{
  "employee_id": 1,
  "title": "Screen setup help",
  "description": "Need help connecting monitors",
  "category": "hardware",
  "priority": "medium"
}
```

## Changelog

### v0.1.0 (Initial Release)
- Basic employee CRUD
- Onboarding task management
- Training tracking
- Support tickets
- Multi-agent AI chat
- RAG-powered document search
- Dashboard and profile management

## Support

For API issues or questions:
- Email: api-support@technova.com
- Issues: https://github.com/technova/onboardai/issues

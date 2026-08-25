# Multi-Agent System Design - OnboardAI

## Overview

OnboardAI uses **LangGraph** to orchestrate three specialized AI agents that work together to provide comprehensive employee support through intelligent routing and RAG-powered responses.

## System Architecture

```
User Query
    ↓
[LangGraph Router]
    ↓
    ├─→ [HR Agent] ──→ RAG (HR Documents) ──→ Response
    ├─→ [IT Agent] ──→ RAG (IT Documents) ──→ Response + Ticket
    └─→ [Training Agent] ──→ RAG (Training Docs) ──→ Recommendations
    ↓
[Response + Sources + Metadata] ──→ Frontend
```

## Agent Specialization

### 1. HR Agent

**Purpose**: Handle human resources and employee relations questions

**Domains**:
- Company policies and procedures
- Leave and time-off policies
- Benefits and compensation
- Employee relations and wellness
- Hiring and onboarding processes
- Career development

**Document Sources**:
- `hr_policies.md` - Comprehensive HR policies
- Employment classifications, compensation, benefits
- Leave policies (vacation, sick, parental)
- Remote work and flex time
- Performance management
- Code of conduct

**Response Style**:
- Professional and policy-focused
- References company policies
- Suggests HR contact for complex issues
- Employee-centric and supportive

**Example Queries**:
- "How much vacation do I get?"
- "What's the process to request remote work?"
- "What are the parental leave benefits?"
- "How does the performance review work?"

### 2. IT Agent

**Purpose**: Provide technical support and IT guidance

**Domains**:
- Hardware setup and troubleshooting
- Software installation and configuration
- Network and VPN access
- Security and access control
- System issues and support tickets
- Device management

**Document Sources**:
- `it_support.md` - Complete IT setup and troubleshooting
- Device onboarding procedures
- VPN setup for all platforms (Windows, Mac, Linux)
- Software requirements by role
- Network security
- Support procedures and escalation

**Response Style**:
- Step-by-step troubleshooting
- Platform-specific instructions
- Clear escalation path for complex issues
- Proactive security reminders

**Example Queries**:
- "How do I set up my laptop?"
- "I can't connect to VPN, help!"
- "What software do I need installed?"
- "My screen isn't working properly"

**Special Feature**: Creates support tickets for unresolved issues
```python
# When troubleshooting fails:
if cannot_resolve(issue):
    ticket = create_support_ticket(
        title="IT troubleshooting escalation",
        description=user_query,
        category=issue_category,
        priority="high"
    )
    response += f"Support ticket {ticket.number} created for IT team"
```

### 3. Training Agent

**Purpose**: Guide employee skill development and training

**Domains**:
- Role-specific training recommendations
- Skill development paths
- Course recommendations
- Learning resources
- Professional certifications
- Onboarding training

**Document Sources**:
- `training_materials.md` - Complete training programs
- Role-based training tracks
- Skill-specific courses
- Certification programs
- Learning delivery methods
- Career development paths

**Response Style**:
- Personalized recommendations
- Considers employee role and level
- Links to training resources
- Motivational and encouraging
- Career advancement focused

**Example Queries**:
- "What training should I take as a new engineer?"
- "How can I improve my leadership skills?"
- "Are there certifications I should pursue?"
- "What courses are available for my role?"

## Router System

### Routing Logic

The router uses LLM-based classification to determine which agent should handle a query:

```python
def route_query(query: str) -> str:
    """
    Classify query to determine which agent handles it.
    Returns: "hr_agent", "it_agent", or "training_agent"
    """
    prompt = f"""
    Analyze this employee question and determine which agent should handle it.
    
    Question: {query}
    
    Routes:
    1. "hr_agent" - HR policies, leave, benefits, career, compensation
    2. "it_agent" - Technical issues, setup, access, hardware, software
    3. "training_agent" - Skills, courses, development, learning, certifications
    
    Return ONLY the agent name.
    """
    
    response = llm(prompt)
    return response.strip()
```

### Classification Examples

```
Query: "How much PTO do I get?"
→ HR Agent

Query: "My VPN isn't working"
→ IT Agent

Query: "What training courses should I take?"
→ Training Agent

Query: "How do I request flexible hours?"
→ HR Agent (Policy question)

Query: "Can I install Docker?"
→ IT Agent (Permission/setup)

Query: "Recommend a Python course"
→ Training Agent (Learning path)
```

## LangGraph Workflow

### Graph Definition

```python
workflow = StateGraph(AgentState)

# Define nodes
workflow.add_node("router", route_query)
workflow.add_node("hr_agent", hr_agent.process_query)
workflow.add_node("it_agent", it_agent.process_query)
workflow.add_node("training_agent", training_agent.process_query)

# Set entry point
workflow.set_entry_point("router")

# Add edges based on router output
workflow.add_conditional_edges(
    "router",
    lambda x: x,  # Router returns agent name
    {
        "hr_agent": "hr_agent",
        "it_agent": "it_agent",
        "training_agent": "training_agent"
    }
)

# All agents flow to END
workflow.add_edge("hr_agent", END)
workflow.add_edge("it_agent", END)
workflow.add_edge("training_agent", END)

graph = workflow.compile()
```

## Agent Processing

### Flow for Each Agent

```python
def process_query(state: AgentState) -> AgentState:
    """
    Generic agent processing flow
    """
    # 1. Search RAG for relevant documents
    documents = rag.search(
        query=state.query,
        top_k=5,
        filter_dict={"category": agent_category}
    )
    
    # 2. Build context from documents
    context = format_documents(documents)
    
    # 3. Create LLM prompt
    prompt = create_prompt(
        query=state.query,
        employee=state.employee_name,
        role=state.employee_role,
        context=context
    )
    
    # 4. Get LLM response
    response = llm.invoke(prompt)
    
    # 5. Extract and format sources
    state.response = response.content
    state.source_documents = [doc.metadata for doc in documents]
    state.agent_type = "hr_agent"  # or appropriate type
    
    return state
```

### Agent State

```python
class AgentState:
    employee_id: int              # Current employee
    employee_name: str            # For personalization
    employee_role: str            # Context for recommendations
    employee_department: str      # Additional context
    query: str                    # User's question
    messages: List[Dict]          # Conversation history
    agent_type: str               # Which agent handled it
    response: str                 # Agent's response
    source_documents: List[Dict]  # References used
    tools_used: List[str]         # Audit trail
```

## RAG Integration

### Document Search

Each agent searches RAG documents filtered by category:

```python
# HR Agent
rag.search(query, filter={"category": "hr"})

# IT Agent  
rag.search(query, filter={"category": "it"})

# Training Agent
rag.search(query, filter={"category": "training"})
```

### Source Attribution

Responses include document sources:

```json
{
  "agent_type": "hr_agent",
  "response": "At TechNova Solutions, vacation policy...",
  "source_documents": [
    {
      "source": "hr_policies.md",
      "relevance": 0.95
    }
  ]
}
```

## Conversation State Management

### Multi-Turn Conversations

Each agent maintains conversation context:

```python
state.messages = [
    {"role": "user", "content": "How much vacation?"},
    {"role": "assistant", "content": "You get 15 days..."},
    {"role": "user", "content": "Can I carry over unused days?"},
    {"role": "assistant", "content": "Yes, up to 5 days..."}
]
```

### Context Window

- Full conversation history available to agents
- Helps agents understand follow-up questions
- Stored in ChatHistory table for audit

## Escalation Mechanisms

### HR Agent
- Suggests HR contact for complex issues
- Policy escalation: "This requires HR approval"

### IT Agent
- Creates support tickets for unresolved issues
- Assigns to IT team with full context
- Can escalate to IT manager for critical issues

### Training Agent
- Escalates to department manager for special requests
- Can refer to training coordinator

## Error Handling

### Agent Failures

```python
try:
    response = llm.invoke(prompt)
except Exception as e:
    response = "I encountered an error. Please try again or contact support."
    log_error(f"Agent error: {e}")
    notify_support("Agent processing failed")
```

### Invalid Routing

```python
if router_output not in VALID_AGENTS:
    # Default to HR agent and log issue
    response = "Routing error - defaulting to HR support"
    route = "hr_agent"
```

## Performance Metrics

### Tracking

```python
metrics = {
    "agent_type": "hr_agent",
    "response_time_ms": 1250,
    "documents_used": 3,
    "confidence_score": 0.92,
    "was_helpful": true,  # From feedback
    "created_ticket": false
}
```

### Dashboards

- Agent response times
- Document relevance scores
- Escalation rates
- User satisfaction ratings
- Error frequency

## Future Enhancements

### 1. Agent Learning
- Track which responses users find helpful
- Improve prompts based on feedback
- A/B test different response styles

### 2. Multi-Agent Collaboration
- Complex issues involving multiple agents
- HR Agent + IT Agent for access/policy issues
- Training Agent + IT Agent for software training

### 3. Custom Agents
- Department-specific agents (Finance, Legal, etc.)
- Role-specific onboarding agents
- Manager productivity agents

### 4. Advanced Routing
- Confidence-based fallback routing
- User preference routing
- Time-of-day based routing (off-hours support)

### 5. Tool Integration
- Agents create real support tickets
- Agents schedule training sessions
- Agents request HR approvals

### 6. Multilingual Support
- Translate queries to English
- Respond in employee's language
- Multilingual RAG documents

## Example Conversations

### HR Agent Conversation

```
User: "I want to work from home, what's required?"

Agent:
"At TechNova Solutions, work-from-home is available for full-time 
employees in non-public-facing roles with a 'Meets Expectations' 
performance review.

Requirements:
- Dedicated quiet workspace
- High-speed internet (25+ Mbps)
- VPN connection mandatory
- Manager approval needed

The standard arrangement is 3 days office, 2 days remote, with core 
hours 10 AM - 3 PM PT.

Sources: hr_policies.md, work_from_home_policy.md"
```

### IT Agent Conversation

```
User: "My laptop isn't connecting to the internet"

Agent:
"Let's troubleshoot your internet connection:

1. Can you see available WiFi networks? (Settings → Network)
2. Try 'technova-office-5G' if available (newer/faster)
3. Enter your employee ID and network password
4. If still not working, try these steps:
   - Forget the network and reconnect
   - Restart your WiFi adapter
   - Check if other devices can connect

If these don't help, I'll create a support ticket for our IT team.
Ticket created: TKT-000156

Sources: it_support.md (Network troubleshooting section)"
```

### Training Agent Conversation

```
User: "I'm a new engineer, what training should I do first?"

Agent:
"Welcome to TechNova! As a junior engineer, here's your recommended 
learning path:

Week 1-2:
- Company Culture & Values (2h)
- Development Environment Setup (4h)
- Git Workflow & Code Review (2h)

Week 3-4:
- Microservices Architecture (4h)
- API Development (4h)
- Testing Standards (3h)

Beyond:
- Kubernetes Administration (60h) [Optional]
- AWS Solutions Architect (40h) [Recommended]

Start with 'Development Environment Setup' - you can access it now 
through our learning portal.

Sources: training_materials.md, engineering_onboarding.md"
```

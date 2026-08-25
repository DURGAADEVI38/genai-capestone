import json, os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import Depends, FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / '.env', override=True)
from app.agents import AgentRouter, AgentState
from app.rag import RAGSystem
from app.repositories import SessionLocal, employee, employee_by_code, employees, hr_requests, init_db, materials, progress, tasks, tickets, task, save_chat, create_ticket
from app.schemas import ChatMessage, ChatResponse, Dashboard, EmployeeResponse, EmployeeCreate, EmployeeUpdate, MaterialResponse, ProgressResponse, TaskCreate, TaskResponse, TaskUpdate, TicketCreate, TicketResponse, TicketUpdate
from app.services import dashboard, seed, update_task, update_ticket
rag=RAGSystem()
@asynccontextmanager
async def lifespan(app):
    init_db()
    db=SessionLocal()
    try: seed(db)
    finally: db.close()
    rag.load_documents()
    yield
app=FastAPI(title='OnboardAI API',version='1.0.0',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[os.getenv('FRONTEND_URL','http://localhost:5173'),'http://localhost:5173','http://127.0.0.1:5173','http://localhost:3000'],allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
def db_session():
    db=SessionLocal()
    try: yield db
    finally: db.close()
@app.get('/api/health')
def health(): return {'status':'healthy','message':'OnboardAI API is running'}
@app.get('/api/employees/{employee_id}',response_model=EmployeeResponse)
def get_employee(employee_id:int,db:Session=Depends(db_session)):
    item=employee(db,employee_id)
    if not item: raise HTTPException(404,'Employee not found')
    return item
@app.get('/api/employees/code/{employee_code}',response_model=EmployeeResponse)
def get_employee_by_code(employee_code:str,db:Session=Depends(db_session)):
    item=employee_by_code(db,employee_code)
    if not item: raise HTTPException(404,'Employee not found')
    return item
@app.post('/api/employees',response_model=EmployeeResponse)
def add_employee(data:EmployeeCreate,db:Session=Depends(db_session)):
    if employee_by_code(db,data.employee_id): raise HTTPException(409,'Employee already exists')
    from app.models import Employee
    item=Employee(**data.model_dump());db.add(item);db.commit();db.refresh(item);return item
@app.put('/api/employees/{employee_id}',response_model=EmployeeResponse)
def edit_employee(employee_id:int,data:EmployeeUpdate,db:Session=Depends(db_session)):
    item=employee(db,employee_id)
    if not item:raise HTTPException(404,'Employee not found')
    for key,value in data.model_dump(exclude_none=True).items():setattr(item,key,value)
    db.commit();db.refresh(item);return item
@app.get('/api/employees',response_model=list[EmployeeResponse])
def list_employee(skip:int=0,limit:int=100,db:Session=Depends(db_session)):return employees(db)[skip:skip+limit]
@app.get('/api/dashboard/{employee_id}',response_model=Dashboard)
def get_dashboard(employee_id:int,db:Session=Depends(db_session)):
    result=dashboard(db,employee_id)
    if not result:raise HTTPException(404,'Employee not found')
    return result
@app.get('/api/employees/{employee_id}/tasks',response_model=list[TaskResponse])
def list_tasks(employee_id:int,db:Session=Depends(db_session)):return tasks(db,employee_id)
@app.post('/api/tasks',response_model=TaskResponse)
def add_task(data:TaskCreate,db:Session=Depends(db_session)):
    from app.models import OnboardingTask
    item=OnboardingTask(**data.model_dump());db.add(item);db.commit();db.refresh(item);return item
@app.put('/api/tasks/{task_id}',response_model=TaskResponse)
def edit_task(task_id:int,data:TaskUpdate,db:Session=Depends(db_session)):
    item=update_task(db,task_id,data)
    if not item:raise HTTPException(404,'Task not found')
    return item
@app.post('/api/tasks/{task_id}/complete',response_model=TaskResponse)
def complete_task(task_id:int,db:Session=Depends(db_session)):
    item=update_task(db,task_id,TaskUpdate(status='completed'))
    if not item:raise HTTPException(404,'Task not found')
    return item
@app.get('/api/training/materials',response_model=list[MaterialResponse])
def list_materials(db:Session=Depends(db_session)):return materials(db)
@app.get('/api/employees/{employee_id}/training',response_model=list[ProgressResponse])
def list_progress(employee_id:int,db:Session=Depends(db_session)):return progress(db,employee_id)
@app.post('/api/training/start/{material_id}',response_model=ProgressResponse)
def start_training(material_id:int,employee_id:int=Body(...,embed=True),db:Session=Depends(db_session)):
    from app.models import TrainingProgress
    existing=next((x for x in progress(db,employee_id) if x.material_id==material_id),None)
    if existing:return existing
    item=TrainingProgress(employee_id=employee_id,material_id=material_id);db.add(item);db.commit();db.refresh(item);return item
@app.put('/api/training/progress/{progress_id}',response_model=ProgressResponse)
def set_progress(progress_id:int,percentage:int=Body(...,embed=True),db:Session=Depends(db_session)):
    from app.models import TrainingProgress
    item=db.get(TrainingProgress,progress_id)
    if not item:raise HTTPException(404,'Training progress not found')
    item.progress_percentage=max(0,min(100,percentage));item.is_completed=item.progress_percentage==100;db.commit();db.refresh(item);return item
@app.get('/api/tickets/open',response_model=list[TicketResponse])
def open_tickets(db:Session=Depends(db_session)):return tickets(db,open_only=True)
@app.get('/api/employees/{employee_id}/tickets',response_model=list[TicketResponse])
def employee_tickets(employee_id:int,db:Session=Depends(db_session)):return tickets(db,employee_id)
@app.post('/api/tickets',response_model=TicketResponse)
def add_ticket(data:TicketCreate,db:Session=Depends(db_session)):return create_ticket(db,data)
@app.put('/api/tickets/{ticket_id}',response_model=TicketResponse)
def edit_ticket(ticket_id:int,data:TicketUpdate,db:Session=Depends(db_session)):
    item=update_ticket(db,ticket_id,data)
    if not item:raise HTTPException(404,'Ticket not found')
    return item
@app.post('/api/chat',response_model=ChatResponse)
async def chat(data:ChatMessage,db:Session=Depends(db_session)):
    person=employee(db,data.employee_id)
    if not person:raise HTTPException(404,'Employee not found')
    history=[{'role':'user','content':x.user_message} for x in db.query(__import__('app.models',fromlist=['ChatHistory']).ChatHistory).filter_by(employee_id=data.employee_id).order_by(__import__('app.models',fromlist=['ChatHistory']).ChatHistory.created_at.desc()).limit(10)]
    result=await AgentRouter(rag).answer(AgentState(employee_id=data.employee_id,query=data.message,history=history,agent_type='',response='',sources=[],db=db,ticket_number=''))
    saved=save_chat(db,data.employee_id,result['agent_type'],data.message,result['response'],json.dumps(result['sources']))
    return ChatResponse(id=saved.id,agent_type=result['agent_type'],user_message=data.message,agent_response=result['response'],source_documents=result['sources'],created_at=saved.created_at)
@app.get('/api/chat/history/{employee_id}',response_model=list[ChatResponse])
def chat_history(employee_id:int,limit:int=50,db:Session=Depends(db_session)):
    from app.models import ChatHistory
    return [ChatResponse(id=x.id,agent_type=x.agent_type,user_message=x.user_message,agent_response=x.agent_response,source_documents=json.loads(x.source_documents or '[]'),created_at=x.created_at) for x in db.query(ChatHistory).filter_by(employee_id=employee_id).order_by(ChatHistory.created_at.desc()).limit(limit)]
@app.get('/api/hr/requests',response_model=list[ChatResponse])
def hr_request_list(limit:int=100,db:Session=Depends(db_session)):
    return [ChatResponse(id=x.id,agent_type=x.agent_type,user_message=x.user_message,agent_response=x.agent_response,source_documents=json.loads(x.source_documents or '[]'),created_at=x.created_at) for x in hr_requests(db,limit)]

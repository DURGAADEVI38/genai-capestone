from datetime import datetime
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session, sessionmaker
from app.models import Base, Employee, OnboardingTask, TrainingMaterial, TrainingProgress, SupportTicket, ChatHistory, OnboardingStatus, TicketStatus
from app.schemas import EmployeeCreate, EmployeeUpdate, TaskCreate, TaskUpdate, TicketCreate, TicketUpdate
import os
engine=create_engine(os.getenv('DATABASE_URL','sqlite:///./onboardai.db'),connect_args={'check_same_thread':False})
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False)
def init_db(): Base.metadata.create_all(engine)
def employees(db): return db.scalars(select(Employee).order_by(Employee.id)).all()
def employee(db, ident): return db.scalar(select(Employee).where(Employee.id==ident))
def employee_by_code(db, code): return db.scalar(select(Employee).where(Employee.employee_id==code))
def tasks(db, eid): return db.scalars(select(OnboardingTask).where(OnboardingTask.employee_id==eid).order_by(OnboardingTask.due_date)).all()
def task(db, tid): return db.get(OnboardingTask,tid)
def materials(db): return db.scalars(select(TrainingMaterial).order_by(TrainingMaterial.id)).all()
def progress(db,eid): return db.scalars(select(TrainingProgress).where(TrainingProgress.employee_id==eid)).all()
def tickets(db,eid=None,open_only=False):
    query=select(SupportTicket).order_by(SupportTicket.created_at.desc())
    if eid is not None: query=query.where(SupportTicket.employee_id==eid)
    if open_only: query=query.where(SupportTicket.status.in_([TicketStatus.OPEN,TicketStatus.IN_PROGRESS]))
    return db.scalars(query).all()
def create_ticket(db, data:TicketCreate):
    number=f'IT-{(db.scalar(select(func.count()).select_from(SupportTicket)) or 0)+1:04d}'
    item=SupportTicket(**data.model_dump(),ticket_number=number); db.add(item); db.commit(); db.refresh(item); return item
def save_chat(db,eid,agent,user,response,sources):
    item=ChatHistory(employee_id=eid,agent_type=agent,user_message=user,agent_response=response,source_documents=sources); db.add(item); db.commit(); db.refresh(item); return item
def hr_requests(db, limit=100):
    return db.scalars(select(ChatHistory).where(ChatHistory.agent_type == 'hr_agent').order_by(ChatHistory.created_at.desc()).limit(limit)).all()

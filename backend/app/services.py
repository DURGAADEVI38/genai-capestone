from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import repositories as repo
from app.models import OnboardingStatus, TicketStatus, TrainingProgress, TrainingMaterial
from app.schemas import EmployeeCreate, EmployeeUpdate, TaskCreate, TaskUpdate, TicketCreate, TicketUpdate
def seed(db:Session):
    from app.models import Employee, EmployeeRole, Department
    people=[EmployeeCreate(employee_id='EMP001',name='John Smith',email='john.smith@technova.com',role='engineer',department='engineering',location='San Francisco, CA',joining_date=datetime.utcnow(),experience_level='junior'),EmployeeCreate(employee_id='EMP002',name='Sarah Johnson',email='sarah.johnson@technova.com',role='designer',department='design',location='New York, NY',joining_date=datetime.utcnow(),experience_level='mid'),EmployeeCreate(employee_id='EMP003',name='Mike Chen',email='mike.chen@technova.com',role='product_manager',department='product',location='San Francisco, CA',joining_date=datetime.utcnow(),experience_level='senior'),EmployeeCreate(employee_id='HR001',name='Priya Shah',email='priya.shah@technova.com',role='hr',department='hr',location='New York, NY',joining_date=datetime.utcnow(),experience_level='senior'),EmployeeCreate(employee_id='IT001',name='Alex Rivera',email='alex.rivera@technova.com',role='it',department='it',location='San Francisco, CA',joining_date=datetime.utcnow(),experience_level='senior')]
    employees=[repo.employee_by_code(db, data.employee_id) for data in people[:3]]
    if not any(employees):
        employees=[]
        for data in people[:3]:
            item=Employee(**data.model_dump()); db.add(item); employees.append(item)
        db.commit()
        for i,e in enumerate(employees):
            db.add_all([repo_task(e.id,'Complete security orientation','Review security and data handling requirements.','training',0,'high',OnboardingStatus.COMPLETED if i else OnboardingStatus.IN_PROGRESS),repo_task(e.id,'Meet your onboarding buddy','Schedule a 30-minute introduction.','meetings',5,'medium',OnboardingStatus.PENDING),repo_task(e.id,'Set up company accounts','Activate email, chat, and project access.','account_setup',2,'high',OnboardingStatus.PENDING)])
        materials=[TrainingMaterial(title='TechNova security essentials',description='Security, privacy, and incident response fundamentals.',content='Security training',content_type='course',duration_minutes=45),TrainingMaterial(title='Engineering onboarding path',description='Repositories, code review, and production readiness.',content='Engineering training',content_type='course',required_role=EmployeeRole.ENGINEER,duration_minutes=90),TrainingMaterial(title='Product discovery foundations',description='Discovery, prioritization, and roadmap practices.',content='Product training',content_type='course',required_role=EmployeeRole.PRODUCT_MANAGER,duration_minutes=75)]
        db.add_all(materials); db.commit()
        db.add_all([TrainingProgress(employee_id=employees[0].id,material_id=materials[0].id,progress_percentage=35),TrainingProgress(employee_id=employees[1].id,material_id=materials[0].id,progress_percentage=60),TrainingProgress(employee_id=employees[2].id,material_id=materials[2].id,progress_percentage=45)])
        repo.create_ticket(db,TicketCreate(employee_id=employees[0].id,title='VPN access is not connecting',description='VPN times out after credentials are entered.',category='vpn',priority='high'))
        db.commit()

    for data in people[3:]:
        if not repo.employee_by_code(db, data.employee_id):
            db.add(Employee(**data.model_dump()))
    db.commit()
def repo_task(eid,title,description,category,days,priority,status):
    from app.models import OnboardingTask
    return OnboardingTask(employee_id=eid,title=title,description=description,category=category,due_date=datetime.utcnow()+timedelta(days=days),priority=priority,status=status,completed_at=datetime.utcnow() if status==OnboardingStatus.COMPLETED else None)
def dashboard(db,eid):
    person=repo.employee(db,eid)
    if not person:return None
    items=repo.tasks(db,eid); active=repo.progress(db,eid); open_tickets=repo.tickets(db,eid,True)
    pending=[x for x in items if x.status==OnboardingStatus.PENDING]
    return {'employee':person,'stats':{'total_onboarding_tasks':len(items),'completed_tasks':sum(x.status==OnboardingStatus.COMPLETED for x in items),'pending_tasks':len(pending),'blocked_tasks':sum(x.status==OnboardingStatus.BLOCKED for x in items),'training_progress_percentage':int(sum(x.progress_percentage for x in active)/len(active)) if active else 0,'open_tickets':len(open_tickets)},'recommended_next_task':sorted(pending,key=lambda x:({'high':0,'medium':1,'low':2}.get(x.priority,3),x.due_date))[0] if pending else None,'pending_tasks':pending,'active_trainings':[x for x in active if not x.is_completed]}
def update_task(db,tid,data:TaskUpdate):
    item=repo.task(db,tid)
    if not item:return None
    for key,value in data.model_dump(exclude_none=True).items(): setattr(item,key,value)
    if item.status==OnboardingStatus.COMPLETED:item.completed_at=datetime.utcnow()
    db.commit();db.refresh(item);return item
def update_ticket(db,tid,data:TicketUpdate):
    item=db.get(__import__('app.models',fromlist=['SupportTicket']).SupportTicket,tid)
    if not item:return None
    for key,value in data.model_dump(exclude_none=True).items():setattr(item,key,value)
    if item.status==TicketStatus.RESOLVED:item.resolved_at=datetime.utcnow()
    db.commit();db.refresh(item);return item

def create_support_ticket(db: Session, employee_id: int, title: str, description: str, category: str, priority: str = 'medium'):
    return repo.create_ticket(db, TicketCreate(
        employee_id=employee_id,
        title=title,
        description=description,
        category=category,
        priority=priority,
    ))

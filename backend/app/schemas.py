from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models import Department, EmployeeRole, ExperienceLevel, OnboardingStatus, TicketPriority, TicketStatus
class EmployeeResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; employee_id:str; name:str; email:str; role:EmployeeRole; department:Department; location:str; joining_date:datetime; experience_level:ExperienceLevel; created_at:datetime; updated_at:datetime
class EmployeeCreate(BaseModel):
    employee_id:str; name:str; email:EmailStr; role:EmployeeRole; department:Department; location:str; joining_date:datetime; experience_level:ExperienceLevel
class EmployeeUpdate(BaseModel):
    name:str|None=None; location:str|None=None; role:EmployeeRole|None=None; department:Department|None=None; experience_level:ExperienceLevel|None=None
class TaskResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; employee_id:int; title:str; description:str; category:str; status:OnboardingStatus; due_date:datetime; priority:str; completed_at:datetime|None=None
class TaskCreate(BaseModel):
    employee_id:int; title:str; description:str; category:str; due_date:datetime; priority:str='medium'
class TaskUpdate(BaseModel):
    status:OnboardingStatus|None=None; title:str|None=None; description:str|None=None; priority:str|None=None
class MaterialResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; title:str; description:str; content_type:str; required_role:EmployeeRole|None; duration_minutes:int|None
class ProgressResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; employee_id:int; material_id:int; progress_percentage:int; is_completed:bool; started_at:datetime; completed_at:datetime|None
class TicketCreate(BaseModel):
    employee_id:int; title:str; description:str; category:str; priority:TicketPriority=TicketPriority.MEDIUM
class TicketUpdate(BaseModel):
    status:TicketStatus|None=None; assigned_to:str|None=None; resolution_notes:str|None=None
class TicketResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int; ticket_number:str; employee_id:int; title:str; description:str; category:str; priority:TicketPriority; status:TicketStatus; assigned_to:str|None; resolution_notes:str|None; created_at:datetime; resolved_at:datetime|None
class ChatMessage(BaseModel): employee_id:int; message:str=Field(min_length=1,max_length=4000)
class ChatResponse(BaseModel):
    id:int; agent_type:str; user_message:str; agent_response:str; source_documents:list[str]; created_at:datetime
class Dashboard(BaseModel): employee:EmployeeResponse; stats:dict; recommended_next_task:TaskResponse|None; pending_tasks:list[TaskResponse]; active_trainings:list[ProgressResponse]

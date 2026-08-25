from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass
class EmployeeRole(str, Enum):
    ENGINEER='engineer'; DESIGNER='designer'; PRODUCT_MANAGER='product_manager'; DATA_SCIENTIST='data_scientist'; HR='hr'; IT='it'
class Department(str, Enum):
    ENGINEERING='engineering'; DESIGN='design'; PRODUCT='product'; DATA='data'; OPERATIONS='operations'; HR='hr'; IT='it'
class ExperienceLevel(str, Enum):
    JUNIOR='junior'; MID='mid'; SENIOR='senior'; LEAD='lead'
class OnboardingStatus(str, Enum):
    PENDING='pending'; IN_PROGRESS='in_progress'; COMPLETED='completed'; BLOCKED='blocked'
class TicketStatus(str, Enum):
    OPEN='open'; IN_PROGRESS='in_progress'; RESOLVED='resolved'; CLOSED='closed'
class TicketPriority(str, Enum):
    LOW='low'; MEDIUM='medium'; HIGH='high'; URGENT='urgent'
class Employee(Base):
    __tablename__='employees'
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120)); email: Mapped[str] = mapped_column(String(255), unique=True)
    role: Mapped[EmployeeRole] = mapped_column(SqlEnum(EmployeeRole)); department: Mapped[Department] = mapped_column(SqlEnum(Department))
    location: Mapped[str] = mapped_column(String(120)); joining_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    experience_level: Mapped[ExperienceLevel] = mapped_column(SqlEnum(ExperienceLevel)); created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow); updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
class OnboardingTask(Base):
    __tablename__='onboarding_tasks'
    id: Mapped[int] = mapped_column(primary_key=True); employee_id: Mapped[int] = mapped_column(ForeignKey('employees.id'), index=True)
    title: Mapped[str] = mapped_column(String(160)); description: Mapped[str] = mapped_column(Text); category: Mapped[str] = mapped_column(String(60)); status: Mapped[OnboardingStatus] = mapped_column(SqlEnum(OnboardingStatus), default=OnboardingStatus.PENDING); due_date: Mapped[datetime] = mapped_column(DateTime); priority: Mapped[str] = mapped_column(String(20), default='medium'); completed_at: Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
class TrainingMaterial(Base):
    __tablename__='training_materials'
    id: Mapped[int] = mapped_column(primary_key=True); title: Mapped[str] = mapped_column(String(160)); description: Mapped[str] = mapped_column(Text); content: Mapped[str] = mapped_column(Text); content_type: Mapped[str] = mapped_column(String(40)); required_role: Mapped[EmployeeRole|None] = mapped_column(SqlEnum(EmployeeRole), nullable=True); duration_minutes: Mapped[int|None] = mapped_column(nullable=True)
class TrainingProgress(Base):
    __tablename__='training_progress'
    id: Mapped[int] = mapped_column(primary_key=True); employee_id: Mapped[int] = mapped_column(ForeignKey('employees.id')); material_id: Mapped[int] = mapped_column(ForeignKey('training_materials.id')); progress_percentage: Mapped[int] = mapped_column(Integer, default=0); is_completed: Mapped[bool] = mapped_column(Boolean, default=False); started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow); completed_at: Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
class SupportTicket(Base):
    __tablename__='support_tickets'
    id: Mapped[int] = mapped_column(primary_key=True); ticket_number: Mapped[str] = mapped_column(String(32), unique=True); employee_id: Mapped[int] = mapped_column(ForeignKey('employees.id')); title: Mapped[str] = mapped_column(String(160)); description: Mapped[str] = mapped_column(Text); category: Mapped[str] = mapped_column(String(60)); priority: Mapped[TicketPriority] = mapped_column(SqlEnum(TicketPriority), default=TicketPriority.MEDIUM); status: Mapped[TicketStatus] = mapped_column(SqlEnum(TicketStatus), default=TicketStatus.OPEN); assigned_to: Mapped[str|None] = mapped_column(String(120), nullable=True); resolution_notes: Mapped[str|None] = mapped_column(Text, nullable=True); created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow); resolved_at: Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
class ChatHistory(Base):
    __tablename__='chat_history'
    id: Mapped[int] = mapped_column(primary_key=True); employee_id: Mapped[int] = mapped_column(ForeignKey('employees.id')); agent_type: Mapped[str] = mapped_column(String(40)); user_message: Mapped[str] = mapped_column(Text); agent_response: Mapped[str] = mapped_column(Text); source_documents: Mapped[str|None] = mapped_column(Text, nullable=True); created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

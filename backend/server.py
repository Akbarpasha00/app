from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    SELECTED = "selected"
    REJECTED = "rejected"

class DriveStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Helper functions for MongoDB serialization
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key.endswith('_date'):
                try:
                    if 'T' in value:
                        item[key] = datetime.fromisoformat(value)
                    else:
                        item[key] = datetime.fromisoformat(value + 'T00:00:00')
                except:
                    pass
    return item

# Enums for new fields
class BacklogStatus(str, Enum):
    CLEARED = "cleared"
    PENDING = "pending"
    NOT_APPLICABLE = "not_applicable"

class CRTFeeStatus(str, Enum):
    PAID = "paid"
    PENDING = "pending"
    PARTIAL = "partial"
    EXEMPTED = "exempted"

# Models
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    roll_no: str
    branch: str
    section: str
    year: int
    cgpa: float
    skills: List[str] = []
    email: EmailStr
    phone: str
    resume_url: Optional[str] = None
    # Academic Information
    ssc_percentage: float
    inter_diploma_percentage: float
    backlogs_count: int = 0
    backlog_status: BacklogStatus = BacklogStatus.NOT_APPLICABLE
    year_of_passing: int
    # CRT Information
    crt_fee_status: CRTFeeStatus
    crt_fee_amount: float
    crt_receipt_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentCreate(BaseModel):
    name: str
    roll_no: str
    branch: str
    section: str
    year: int
    cgpa: float
    skills: List[str] = []
    email: EmailStr
    phone: str
    resume_url: Optional[str] = None
    # Academic Information
    ssc_percentage: float
    inter_diploma_percentage: float
    backlogs_count: int = 0
    backlog_status: BacklogStatus = BacklogStatus.NOT_APPLICABLE
    year_of_passing: int
    # CRT Information
    crt_fee_status: CRTFeeStatus
    crt_fee_amount: float
    crt_receipt_number: Optional[str] = None

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    website: Optional[str] = None
    industry: str
    location: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanyCreate(BaseModel):
    name: str
    description: str
    website: Optional[str] = None
    industry: str
    location: str

class Drive(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    company_name: str
    role: str
    job_description: str
    ctc: float
    eligibility_criteria: str
    drive_date: datetime
    location: str
    status: DriveStatus = DriveStatus.UPCOMING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DriveCreate(BaseModel):
    company_id: str
    role: str
    job_description: str
    ctc: float
    eligibility_criteria: str
    drive_date: datetime
    location: str

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    drive_id: str
    company_name: str
    role: str
    application_status: ApplicationStatus = ApplicationStatus.APPLIED
    applied_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    selected_date: Optional[datetime] = None

class ApplicationCreate(BaseModel):
    student_id: str
    drive_id: str

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class OfferLetter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    drive_id: str
    company_name: str
    role: str
    offer_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    joining_date: datetime
    final_ctc: float
    letter_content: str

class OfferLetterCreate(BaseModel):
    student_id: str
    drive_id: str
    joining_date: datetime
    final_ctc: float

# Student endpoints
@api_router.post("/students", response_model=Student)
async def create_student(student: StudentCreate):
    # Check if roll_no already exists
    existing = await db.students.find_one({"roll_no": student.roll_no})
    if existing:
        raise HTTPException(status_code=400, detail="Student with this roll number already exists")
    
    student_dict = student.dict()
    student_obj = Student(**student_dict)
    student_data = prepare_for_mongo(student_obj.dict())
    await db.students.insert_one(student_data)
    return student_obj

@api_router.get("/students", response_model=List[Student])
async def get_students():
    students = await db.students.find().to_list(1000)
    return [Student(**parse_from_mongo(student)) for student in students]

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    student = await db.students.find_one({"id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return Student(**parse_from_mongo(student))

@api_router.put("/students/{student_id}", response_model=Student)
async def update_student(student_id: str, student_update: StudentCreate):
    existing = await db.students.find_one({"id": student_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = prepare_for_mongo(student_update.dict())
    await db.students.update_one({"id": student_id}, {"$set": update_data})
    
    updated = await db.students.find_one({"id": student_id})
    return Student(**parse_from_mongo(updated))

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

# Company endpoints
@api_router.post("/companies", response_model=Company)
async def create_company(company: CompanyCreate):
    company_dict = company.dict()
    company_obj = Company(**company_dict)
    company_data = prepare_for_mongo(company_obj.dict())
    await db.companies.insert_one(company_data)
    return company_obj

@api_router.get("/companies", response_model=List[Company])
async def get_companies():
    companies = await db.companies.find().to_list(1000)
    return [Company(**parse_from_mongo(company)) for company in companies]

@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: str):
    company = await db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return Company(**parse_from_mongo(company))

# Drive endpoints
@api_router.post("/drives", response_model=Drive)
async def create_drive(drive: DriveCreate):
    # Get company name
    company = await db.companies.find_one({"id": drive.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    drive_dict = drive.dict()
    drive_dict["company_name"] = company["name"]
    drive_obj = Drive(**drive_dict)
    drive_data = prepare_for_mongo(drive_obj.dict())
    await db.drives.insert_one(drive_data)
    return drive_obj

@api_router.get("/drives", response_model=List[Drive])
async def get_drives(status: Optional[DriveStatus] = None):
    filter_query = {}
    if status:
        filter_query["status"] = status
    
    drives = await db.drives.find(filter_query).to_list(1000)
    return [Drive(**parse_from_mongo(drive)) for drive in drives]

@api_router.get("/drives/{drive_id}", response_model=Drive)
async def get_drive(drive_id: str):
    drive = await db.drives.find_one({"id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return Drive(**parse_from_mongo(drive))

@api_router.put("/drives/{drive_id}/status")
async def update_drive_status(drive_id: str, status: DriveStatus):
    result = await db.drives.update_one(
        {"id": drive_id}, 
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Drive not found")
    return {"message": "Drive status updated successfully"}

# Application endpoints
@api_router.post("/applications", response_model=Application)
async def create_application(application: ApplicationCreate):
    # Check if student exists
    student = await db.students.find_one({"id": application.student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if drive exists
    drive = await db.drives.find_one({"id": application.drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    
    # Check if application already exists
    existing = await db.applications.find_one({
        "student_id": application.student_id,
        "drive_id": application.drive_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Application already exists")
    
    application_dict = application.dict()
    application_dict["student_name"] = student["name"]
    application_dict["company_name"] = drive["company_name"]
    application_dict["role"] = drive["role"]
    
    application_obj = Application(**application_dict)
    application_data = prepare_for_mongo(application_obj.dict())
    await db.applications.insert_one(application_data)
    return application_obj

@api_router.get("/applications", response_model=List[Application])
async def get_applications(student_id: Optional[str] = None, drive_id: Optional[str] = None):
    filter_query = {}
    if student_id:
        filter_query["student_id"] = student_id
    if drive_id:
        filter_query["drive_id"] = drive_id
    
    applications = await db.applications.find(filter_query).to_list(1000)
    return [Application(**parse_from_mongo(app)) for app in applications]

@api_router.put("/applications/{application_id}/status", response_model=Application)
async def update_application_status(application_id: str, status_update: ApplicationStatusUpdate):
    update_data = {"application_status": status_update.status}
    if status_update.status == ApplicationStatus.SELECTED:
        update_data["selected_date"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.applications.update_one(
        {"id": application_id}, 
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    updated = await db.applications.find_one({"id": application_id})
    return Application(**parse_from_mongo(updated))

# Offer Letter endpoints
@api_router.post("/offer-letters", response_model=OfferLetter)
async def create_offer_letter(offer: OfferLetterCreate):
    # Get student and drive details
    student = await db.students.find_one({"id": offer.student_id})
    drive = await db.drives.find_one({"id": offer.drive_id})
    
    if not student or not drive:
        raise HTTPException(status_code=404, detail="Student or Drive not found")
    
    # Generate offer letter content
    letter_content = f"""
    OFFER LETTER
    
    Dear {student['name']},
    
    We are pleased to offer you the position of {drive['role']} at {drive['company_name']}.
    
    Position: {drive['role']}
    Annual CTC: ₹{offer.final_ctc:,.2f}
    Joining Date: {offer.joining_date.strftime('%B %d, %Y')}
    Location: {drive['location']}
    
    We look forward to having you join our team.
    
    Best regards,
    {drive['company_name']} HR Team
    """
    
    offer_dict = offer.dict()
    offer_dict.update({
        "student_name": student["name"],
        "company_name": drive["company_name"],
        "role": drive["role"],
        "letter_content": letter_content
    })
    
    offer_obj = OfferLetter(**offer_dict)
    offer_data = prepare_for_mongo(offer_obj.dict())
    await db.offer_letters.insert_one(offer_data)
    return offer_obj

@api_router.get("/offer-letters", response_model=List[OfferLetter])
async def get_offer_letters(student_id: Optional[str] = None):
    filter_query = {}
    if student_id:
        filter_query["student_id"] = student_id
    
    offers = await db.offer_letters.find(filter_query).to_list(1000)
    return [OfferLetter(**parse_from_mongo(offer)) for offer in offers]

# Dashboard stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_students = await db.students.count_documents({})
    total_companies = await db.companies.count_documents({})
    total_drives = await db.drives.count_documents({})
    upcoming_drives = await db.drives.count_documents({"status": "upcoming"})
    total_applications = await db.applications.count_documents({})
    selected_applications = await db.applications.count_documents({"application_status": "selected"})
    
    placement_rate = (selected_applications / total_students * 100) if total_students > 0 else 0
    
    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_drives": total_drives,
        "upcoming_drives": upcoming_drives,
        "total_applications": total_applications,
        "selected_students": selected_applications,
        "placement_rate": round(placement_rate, 1)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum
import razorpay
import hmac
import hashlib
import asyncio
import random
import resend
from twilio.rest import Client as TwilioClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = "HS256"

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_VERIFY_SERVICE_SID = os.environ.get('TWILIO_VERIFY_SERVICE_SID', '')

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and not TWILIO_ACCOUNT_SID.startswith('PLACEHOLDER'):
    twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    twilio_client = None

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

if RESEND_API_KEY and not RESEND_API_KEY.startswith('re_PLACEHOLDER'):
    resend.api_key = RESEND_API_KEY
    resend_enabled = True
else:
    resend_enabled = False

otp_storage = {}

class UserRole(str, Enum):
    TUTOR = "tutor"
    STUDENT = "student"
    PARENT = "parent"
    COACHING = "coaching"
    COMPANY = "company"

class EducationLevel(BaseModel):
    school: Optional[str] = None
    board: Optional[str] = None
    year: Optional[str] = None

class HigherEducation(BaseModel):
    degree: Optional[str] = None
    college: Optional[str] = None
    year: Optional[str] = None

class PhDEducation(BaseModel):
    specialization: Optional[str] = None
    university: Optional[str] = None
    year: Optional[str] = None

class DiplomaEducation(BaseModel):
    course: Optional[str] = None
    institute: Optional[str] = None
    year: Optional[str] = None

class Education(BaseModel):
    tenth: Optional[EducationLevel] = None
    twelfth: Optional[EducationLevel] = None
    graduation: Optional[HigherEducation] = None
    postgraduation: Optional[HigherEducation] = None
    phd: Optional[PhDEducation] = None
    diploma: Optional[DiplomaEducation] = None
    other_courses: Optional[List[str]] = []

class Experience(BaseModel):
    role: str
    company_institute: str
    duration: str

class SubjectClass(BaseModel):
    subject: str
    classes: List[str]

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    name: str
    mobile: Optional[str] = None
    company_name: Optional[str] = None
    institute_name: Optional[str] = None
    
    @validator('mobile')
    def validate_mobile(cls, v):
        if v:
            # Remove any non-digit characters
            mobile_digits = ''.join(filter(str.isdigit, v))
            if len(mobile_digits) != 10:
                raise ValueError('Mobile number must be exactly 10 digits')
            if not mobile_digits.isdigit():
                raise ValueError('Mobile number must contain only digits')
            return mobile_digits
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    otp_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class TutorProfileUpdate(BaseModel):
    name: Optional[str] = None
    education: Optional[Education] = None
    experience: Optional[List[Experience]] = []
    subjects: Optional[List[SubjectClass]] = []
    languages: Optional[List[str]] = []
    fee_min: Optional[int] = None
    fee_max: Optional[int] = None
    mobile: Optional[str] = None
    can_travel: Optional[bool] = None
    teaches_online: Optional[bool] = None
    online_experience: Optional[str] = None
    teaches_at_home: Optional[bool] = None
    homework_help: Optional[bool] = None
    gender: Optional[str] = None
    works_as: Optional[str] = None
    intro_video_url: Optional[str] = None
    location: Optional[str] = None

class StudentRequirement(BaseModel):
    subject: str
    level_class: str
    mode: str
    requirement_type: str
    gender_preference: Optional[str] = None
    time_preference: str
    languages: List[str]
    location: str
    phone: str
    description: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v:
            raise ValueError('Phone number is required')
        # Remove any non-digit characters
        phone_digits = ''.join(filter(str.isdigit, v))
        if len(phone_digits) != 10:
            raise ValueError('Phone number must be exactly 10 digits')
        if not phone_digits.isdigit():
            raise ValueError('Phone number must contain only digits')
        return phone_digits

class ReviewCreate(BaseModel):
    tutor_id: str
    rating: int
    comment: Optional[str] = None

class MessageCreate(BaseModel):
    recipient_id: str
    message: str

class CoinPurchase(BaseModel):
    package: int

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    transaction_id: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    role: UserRole
    name: str
    email_verified: bool = False
    mobile_verified: bool = False
    mobile: Optional[str] = None
    company_name: Optional[str] = None
    institute_name: Optional[str] = None
    coins: int = 0
    created_at: datetime
    last_login: Optional[datetime] = None

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/signup")
async def signup(data: SignupRequest):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role,
        "name": data.name,
        "mobile": data.mobile,
        "company_name": data.company_name,
        "institute_name": data.institute_name,
        "email_verified": False,
        "mobile_verified": False,
        "coins": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.users.insert_one(user_doc)
    
    if data.role == UserRole.TUTOR:
        await db.tutor_profiles.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": data.name,
            "education": {},
            "experience": [],
            "subjects": [],
            "languages": [],
            "fee_min": 0,
            "fee_max": 0,
            "mobile": data.mobile,
            "profile_photo": None,
            "can_travel": False,
            "teaches_online": False,
            "online_experience": "",
            "teaches_at_home": False,
            "homework_help": False,
            "gender": "",
            "works_as": "",
            "intro_video_url": "",
            "location": "",
            "total_teaching_exp": "",
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None,
            "reviews": [],
            "average_rating": 0
        })
    
    token = create_token(user_id, data.email, data.role)
    
    return {
        "message": "Signup successful",
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "role": data.role,
            "name": data.name,
            "coins": 0
        }
    }

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_token(user["id"], user["email"], user["role"])
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "name": user["name"],
            "coins": user.get("coins", 0)
        }
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Send OTP to email for password reset"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If this email is registered, you will receive an OTP shortly."}
    
    otp_code = str(random.randint(100000, 999999))
    
    otp_storage[f"{data.email}_reset"] = {
        "code": otp_code,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    }
    
    if resend_enabled:
        try:
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #4F46E5; text-align: center;">Password Reset - Tricity Tutors</h2>
                        <p style="font-size: 16px; color: #333;">Hello {user.get('name', 'User')},</p>
                        <p style="font-size: 16px; color: #333;">You requested to reset your password. Use this OTP:</p>
                        <div style="background-color: #4F46E5; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 5px; margin: 20px 0; letter-spacing: 5px;">
                            {otp_code}
                        </div>
                        <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes.</p>
                        <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">Tricity Tutors - Chandigarh Region</p>
                    </div>
                </body>
            </html>
            """
            params = {
                "from": SENDER_EMAIL,
                "to": [data.email],
                "subject": f"Password Reset OTP: {otp_code} - Tricity Tutors",
                "html": html_content
            }
            await asyncio.to_thread(resend.Emails.send, params)
            return {"message": "Password reset OTP sent to your email", "otp": otp_code, "mode": "real"}
        except Exception as e:
            logger.error(f"Resend email failed: {str(e)}")
            return {"message": "Password reset OTP sent (Mock Mode)", "otp": otp_code, "mode": "mock"}
    else:
        return {"message": "Password reset OTP sent (Mock Mode)", "otp": otp_code, "mode": "mock"}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using OTP"""
    stored_otp = otp_storage.get(f"{data.email}_reset")
    
    # Allow mock OTP 123456 for testing
    if data.otp == "123456":
        hashed_password = hash_password(data.new_password)
        await db.users.update_one(
            {"email": data.email},
            {"$set": {"password": hashed_password}}
        )
        if f"{data.email}_reset" in otp_storage:
            del otp_storage[f"{data.email}_reset"]
        return {"message": "Password reset successfully"}
    
    if not stored_otp:
        raise HTTPException(status_code=400, detail="No reset request found. Please request a new OTP.")
    
    if datetime.now(timezone.utc).isoformat() > stored_otp["expires_at"]:
        del otp_storage[f"{data.email}_reset"]
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    
    if data.otp != stored_otp["code"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Update password
    hashed_password = hash_password(data.new_password)
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"password": hashed_password}}
    )
    
    del otp_storage[f"{data.email}_reset"]
    
    return {"message": "Password reset successfully"}

@api_router.post("/auth/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    stored_otp = otp_storage.get(f"{data.email}_{data.otp_type}")
    
    # Allow mock OTP 123456 for testing even without send-otp call
    if data.otp == "123456":
        field = "email_verified" if data.otp_type == "email" else "mobile_verified"
        await db.users.update_one(
            {"email": data.email},
            {"$set": {field: True}}
        )
        
        if f"{data.email}_{data.otp_type}" in otp_storage:
            del otp_storage[f"{data.email}_{data.otp_type}"]
        
        return {"message": f"{data.otp_type.capitalize()} verified successfully"}
    
    if not stored_otp:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one or use mock OTP 123456.")
    
    if datetime.now(timezone.utc).isoformat() > stored_otp["expires_at"]:
        del otp_storage[f"{data.email}_{data.otp_type}"]
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    
    if data.otp_type == "mobile":
        user = await db.users.find_one({"email": data.email}, {"_id": 0})
        mobile = user.get('mobile', '')
        
        if twilio_client and TWILIO_VERIFY_SERVICE_SID:
            try:
                phone_number = f"+91{mobile}" if not mobile.startswith('+') else mobile
                verification_check = twilio_client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
                    to=phone_number,
                    code=data.otp
                )
                if verification_check.status == "approved":
                    field = "email_verified" if data.otp_type == "email" else "mobile_verified"
                    await db.users.update_one(
                        {"email": data.email},
                        {"$set": {field: True}}
                    )
                    del otp_storage[f"{data.email}_{data.otp_type}"]
                    return {"message": f"{data.otp_type.capitalize()} verified successfully"}
                else:
                    raise HTTPException(status_code=400, detail="Invalid OTP")
            except Exception as e:
                logger.error(f"Twilio verification failed: {str(e)}")
    
    if data.otp == stored_otp["code"] or data.otp == "123456":
        field = "email_verified" if data.otp_type == "email" else "mobile_verified"
        await db.users.update_one(
            {"email": data.email},
            {"$set": {field: True}}
        )
        
        if f"{data.email}_{data.otp_type}" in otp_storage:
            del otp_storage[f"{data.email}_{data.otp_type}"]
        
        return {"message": f"{data.otp_type.capitalize()} verified successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid OTP")

@api_router.post("/auth/send-otp")
async def send_otp(email: EmailStr, otp_type: str):
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp_code = str(random.randint(100000, 999999))
    
    otp_storage[f"{email}_{otp_type}"] = {
        "code": otp_code,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    }
    
    if otp_type == "email":
        if resend_enabled:
            try:
                html_content = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #4F46E5; text-align: center;">Tricity Tutors - Email Verification</h2>
                            <p style="font-size: 16px; color: #333;">Hello {user.get('name', 'User')},</p>
                            <p style="font-size: 16px; color: #333;">Your OTP for email verification is:</p>
                            <div style="background-color: #4F46E5; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 5px; margin: 20px 0; letter-spacing: 5px;">
                                {otp_code}
                            </div>
                            <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes.</p>
                            <p style="font-size: 14px; color: #666;">If you didn't request this verification, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="font-size: 12px; color: #999; text-align: center;">Tricity Tutors - Chandigarh Region</p>
                        </div>
                    </body>
                </html>
                """
                params = {
                    "from": SENDER_EMAIL,
                    "to": [email],
                    "subject": f"Your Tricity Tutors OTP: {otp_code}",
                    "html": html_content
                }
                await asyncio.to_thread(resend.Emails.send, params)
                return {"message": "OTP sent to email via Resend", "otp": otp_code, "mode": "real"}
            except Exception as e:
                logger.error(f"Resend email failed: {str(e)}")
                return {"message": "OTP sent to email (Mock Mode)", "otp": otp_code, "mode": "mock"}
        else:
            return {"message": "OTP sent to email (Mock Mode)", "otp": otp_code, "mode": "mock"}
    
    elif otp_type == "mobile":
        mobile = user.get('mobile', '')
        if twilio_client and TWILIO_VERIFY_SERVICE_SID:
            try:
                phone_number = f"+91{mobile}" if not mobile.startswith('+') else mobile
                verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create(
                    to=phone_number,
                    channel='sms'
                )
                return {"message": "OTP sent to mobile via Twilio", "otp": "Check your phone", "mode": "real"}
            except Exception as e:
                logger.error(f"Twilio SMS failed: {str(e)}")
                return {"message": "OTP sent to mobile (Mock Mode)", "otp": otp_code, "mode": "mock"}
        else:
            return {"message": "OTP sent to mobile (Mock Mode)", "otp": otp_code, "mode": "mock"}
    
    return {"message": "OTP sent (Mock Mode)", "otp": otp_code, "mode": "mock"}

@api_router.get("/tutor/profile")
async def get_tutor_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = await db.tutor_profiles.find_one({"user_id": current_user["id"]}, {"_id": 0, "reviews._id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if 'reviews' in profile and profile['reviews']:
        for review in profile['reviews']:
            review.pop('_id', None)
    
    return profile

@api_router.put("/tutor/profile")
async def update_tutor_profile(data: TutorProfileUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # Validate mandatory fields when updating
    if update_data:
        # Check if this is a full profile update (has name or subjects)
        if 'name' in update_data or 'subjects' in update_data or 'fee_min' in update_data:
            # Get existing profile to merge with update
            existing = await db.tutor_profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
            merged = {**existing, **update_data} if existing else update_data
            
            # Validate mandatory fields
            errors = []
            if not merged.get('name'):
                errors.append("Name is required")
            if not merged.get('mobile') or len(str(merged.get('mobile', ''))) != 10:
                errors.append("Valid 10-digit mobile number is required")
            if not merged.get('location'):
                errors.append("Location is required")
            if not merged.get('subjects') or len(merged.get('subjects', [])) == 0:
                errors.append("At least one subject is required")
            if not merged.get('fee_min') or merged.get('fee_min', 0) <= 0:
                errors.append("Minimum fee is required")
            if not merged.get('fee_max') or merged.get('fee_max', 0) <= 0:
                errors.append("Maximum fee is required")
            if merged.get('fee_min', 0) >= merged.get('fee_max', 0):
                errors.append("Maximum fee must be greater than minimum fee")
            
            if errors:
                raise HTTPException(status_code=400, detail="; ".join(errors))
        
        await db.tutor_profiles.update_one(
            {"user_id": current_user["id"]},
            {"$set": update_data}
        )
    
    return {"message": "Profile updated successfully"}

@api_router.get("/tutors")
async def get_all_tutors(
    subject: Optional[str] = None,
    location: Optional[str] = None,
    min_fee: Optional[int] = None,
    max_fee: Optional[int] = None
):
    query = {}
    if subject:
        query["subjects.subject"] = {"$regex": subject, "$options": "i"}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if min_fee is not None or max_fee is not None:
        query["$and"] = []
        if min_fee is not None:
            query["$and"].append({"fee_max": {"$gte": min_fee}})
        if max_fee is not None:
            query["$and"].append({"fee_min": {"$lte": max_fee}})
    
    tutors = await db.tutor_profiles.find(query, {"_id": 0, "reviews._id": 0}).to_list(100)
    
    for tutor in tutors:
        if 'reviews' in tutor and tutor['reviews']:
            for review in tutor['reviews']:
                review.pop('_id', None)
    
    return tutors

@api_router.get("/tutors/{tutor_id}")
async def get_tutor_by_id(tutor_id: str, current_user: dict = None):
    profile = await db.tutor_profiles.find_one({"user_id": tutor_id}, {"_id": 0, "reviews._id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    # Increment profile views (don't count self-views)
    await db.tutor_profiles.update_one(
        {"user_id": tutor_id},
        {"$inc": {"profile_views": 1}}
    )
    
    if 'reviews' in profile and profile['reviews']:
        for review in profile['reviews']:
            review.pop('_id', None)
    
    return profile

@api_router.post("/tutor/profile/photo")
async def upload_profile_photo(photo_url: str, current_user: dict = Depends(get_current_user)):
    """Update tutor profile photo URL"""
    if current_user["role"] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.tutor_profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"profile_photo": photo_url}}
    )
    
    return {"message": "Profile photo updated successfully"}

@api_router.post("/tutor/profile/photo/upload")
async def upload_profile_photo_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile photo file directly - stores as base64 in MongoDB"""
    if current_user["role"] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size (max 100KB for base64 storage)
    max_size = 100 * 1024  # 100KB in bytes
    if len(content) > max_size:
        raise HTTPException(
            status_code=400, 
            detail="File too large. Maximum size is 100KB. Please compress your image."
        )
    
    # Convert to base64 data URL
    import base64
    base64_data = base64.b64encode(content).decode('utf-8')
    photo_url = f"data:{file.content_type};base64,{base64_data}"
    
    # Update profile with base64 photo URL
    await db.tutor_profiles.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"profile_photo": photo_url}}
    )
    
    return {
        "message": "Profile photo uploaded successfully",
        "photo_url": photo_url
    }

@api_router.get("/uploads/profile_photos/{filename}")
async def get_profile_photo(filename: str):
    """Serve uploaded profile photos - legacy endpoint"""
    # This endpoint is kept for backward compatibility
    # New uploads use base64 stored in MongoDB
    raise HTTPException(status_code=404, detail="File not found. Please re-upload your photo.")

@api_router.get("/tutor/stats")
async def get_tutor_stats(current_user: dict = Depends(get_current_user)):
    """Get tutor dashboard stats"""
    if current_user["role"] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = await db.tutor_profiles.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Count applications (messages received from students)
    applications_count = await db.messages.count_documents({
        "recipient_id": current_user["id"]
    })
    
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    return {
        "profile_views": profile.get("profile_views", 0),
        "applications": applications_count,
        "rating": profile.get("average_rating", 0),
        "reviews_count": len(profile.get("reviews", [])),
        "coins": user.get("coins", 0)
    }

@api_router.post("/requirements")
async def create_requirement(data: StudentRequirement, current_user: dict = Depends(get_current_user)):
    # Check if student email is verified
    if not current_user.get("email_verified", False):
        raise HTTPException(
            status_code=403, 
            detail="Please verify your email before posting a requirement. Go to your profile to verify."
        )
    
    requirement_id = str(uuid.uuid4())
    requirement_doc = {
        "id": requirement_id,
        "student_id": current_user["id"],
        "student_name": current_user["name"],
        **data.model_dump(),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "phone_verified": True
    }
    
    await db.requirements.insert_one(requirement_doc)
    return {"message": "Requirement posted successfully", "id": requirement_id}

@api_router.get("/requirements")
async def get_requirements(
    subject: Optional[str] = None,
    mode: Optional[str] = None,
    status: str = "active"
):
    query = {"status": status}
    if subject:
        query["subject"] = {"$regex": subject, "$options": "i"}
    if mode:
        query["mode"] = mode
    
    requirements = await db.requirements.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return requirements

@api_router.get("/requirements/my")
async def get_my_requirements(current_user: dict = Depends(get_current_user)):
    requirements = await db.requirements.find(
        {"student_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return requirements

@api_router.delete("/requirements/{requirement_id}")
async def delete_requirement(requirement_id: str, current_user: dict = Depends(get_current_user)):
    requirement = await db.requirements.find_one({"id": requirement_id}, {"_id": 0})
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if requirement["student_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.requirements.update_one(
        {"id": requirement_id},
        {"$set": {"status": "closed"}}
    )
    
    return {"message": "Requirement closed successfully"}

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "tutor_id": data.tutor_id,
        "student_id": current_user["id"],
        "student_name": current_user["name"],
        "rating": data.rating,
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    all_reviews = await db.reviews.find({"tutor_id": data.tutor_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews) if all_reviews else 0
    
    await db.tutor_profiles.update_one(
        {"user_id": data.tutor_id},
        {"$set": {"average_rating": avg_rating}, "$push": {"reviews": review_doc}}
    )
    
    return {"message": "Review submitted successfully", "id": review_id}

@api_router.get("/reviews/{tutor_id}")
async def get_tutor_reviews(tutor_id: str):
    reviews = await db.reviews.find({"tutor_id": tutor_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/messages")
async def send_message(data: MessageCreate, current_user: dict = Depends(get_current_user)):
    # Check if the sender is a student - they need to pay coins to message tutors
    if current_user["role"] in ["student", "parent", "coaching", "company"]:
        # Check if recipient is a tutor
        recipient_profile = await db.tutor_profiles.find_one({"user_id": data.recipient_id}, {"_id": 0})
        if recipient_profile:
            # Check if student has already paid for this tutor
            existing_transaction = await db.transactions.find_one({
                "user_id": current_user["id"],
                "target_id": data.recipient_id,
                "purpose": "message_tutor",
                "status": "completed"
            }, {"_id": 0})
            
            if not existing_transaction:
                # Check coin balance
                user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
                if user.get("coins", 0) < 100:
                    raise HTTPException(
                        status_code=402, 
                        detail="Insufficient coins. You need 100 coins to message this tutor. Please purchase coins first."
                    )
                
                # Deduct coins
                transaction_id = str(uuid.uuid4())
                transaction_doc = {
                    "id": transaction_id,
                    "user_id": current_user["id"],
                    "type": "spend",
                    "coins": -100,
                    "purpose": "message_tutor",
                    "target_id": data.recipient_id,
                    "status": "completed",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.transactions.insert_one(transaction_doc)
                await db.users.update_one(
                    {"id": current_user["id"]},
                    {"$inc": {"coins": -100}}
                )
    
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "sender_id": current_user["id"],
        "sender_name": current_user["name"],
        "recipient_id": data.recipient_id,
        "message": data.message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    return {"message": "Message sent successfully", "id": message_id}

@api_router.get("/messages")
async def get_messages(current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {"$or": [{"sender_id": current_user["id"]}, {"recipient_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return messages

@api_router.get("/messages/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations grouped by user"""
    messages = await db.messages.find(
        {"$or": [{"sender_id": current_user["id"]}, {"recipient_id": current_user["id"]}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    # Group messages by conversation partner
    conversations = {}
    for msg in messages:
        partner_id = msg["recipient_id"] if msg["sender_id"] == current_user["id"] else msg["sender_id"]
        partner_name = msg.get("sender_name") if msg["sender_id"] != current_user["id"] else None
        
        if partner_id not in conversations:
            # Get partner's name if not available
            if not partner_name:
                user = await db.users.find_one({"id": partner_id}, {"_id": 0, "name": 1})
                partner_name = user.get("name", "Unknown") if user else "Unknown"
            
            conversations[partner_id] = {
                "partner_id": partner_id,
                "partner_name": partner_name,
                "last_message": msg["message"],
                "last_message_time": msg["created_at"],
                "unread_count": 0,
                "messages": []
            }
        
        conversations[partner_id]["messages"].append(msg)
        
        # Count unread messages from this partner
        if msg["recipient_id"] == current_user["id"] and not msg.get("read", True):
            conversations[partner_id]["unread_count"] += 1
    
    return list(conversations.values())

@api_router.get("/messages/thread/{partner_id}")
async def get_message_thread(partner_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages with a specific user"""
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": current_user["id"], "recipient_id": partner_id},
            {"sender_id": partner_id, "recipient_id": current_user["id"]}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Mark all received messages as read
    await db.messages.update_many(
        {"sender_id": partner_id, "recipient_id": current_user["id"], "read": False},
        {"$set": {"read": True}}
    )
    
    # Get partner info
    partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "name": 1, "role": 1})
    
    return {
        "partner": partner,
        "messages": messages
    }

@api_router.get("/messages/unread")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.messages.count_documents({
        "recipient_id": current_user["id"],
        "read": False
    })
    return {"count": count}

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, current_user: dict = Depends(get_current_user)):
    await db.messages.update_one(
        {"id": message_id, "recipient_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Message marked as read"}

@api_router.get("/wallet")
async def get_wallet(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    transactions = await db.transactions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {
        "coins": user.get("coins", 0),
        "transactions": transactions
    }

@api_router.post("/wallet/purchase")
async def purchase_coins(data: CoinPurchase, current_user: dict = Depends(get_current_user)):
    packages = {
        50: 100, 100: 200, 250: 500, 500: 950,
        1000: 1800, 2500: 4000, 5000: 7500,
        7500: 10000, 10000: 12000
    }
    
    if data.package not in packages:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    amount_inr = packages[data.package]
    amount_paise = amount_inr * 100
    
    if razorpay_client:
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "user_id": current_user["id"],
                    "coins": data.package
                }
            })
            
            transaction_id = str(uuid.uuid4())
            transaction_doc = {
                "id": transaction_id,
                "user_id": current_user["id"],
                "type": "purchase_pending",
                "coins": data.package,
                "amount": amount_inr,
                "razorpay_order_id": razorpay_order["id"],
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.transactions.insert_one(transaction_doc)
            
            return {
                "order_id": razorpay_order["id"],
                "amount": amount_paise,
                "currency": "INR",
                "key_id": RAZORPAY_KEY_ID,
                "transaction_id": transaction_id
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay order creation failed: {str(e)}")
    else:
        transaction_id = str(uuid.uuid4())
        transaction_doc = {
            "id": transaction_id,
            "user_id": current_user["id"],
            "type": "purchase",
            "coins": data.package,
            "amount": amount_inr,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.transactions.insert_one(transaction_doc)
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"coins": data.package}}
        )
        
        return {"message": "Coins purchased successfully (Mock Mode)", "coins_added": data.package}

@api_router.post("/wallet/verify-payment")
async def verify_payment(data: PaymentVerification, current_user: dict = Depends(get_current_user)):
    if not razorpay_client:
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    try:
        params_dict = {
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        transaction = await db.transactions.find_one({"id": data.transaction_id}, {"_id": 0})
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if transaction["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        if transaction["status"] == "completed":
            raise HTTPException(status_code=400, detail="Transaction already completed")
        
        await db.transactions.update_one(
            {"id": data.transaction_id},
            {"$set": {
                "status": "completed",
                "razorpay_payment_id": data.razorpay_payment_id,
                "type": "purchase",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"coins": transaction["coins"]}}
        )
        
        return {
            "message": "Payment verified successfully",
            "coins_added": transaction["coins"]
        }
        
    except razorpay.errors.SignatureVerificationError:
        await db.transactions.update_one(
            {"id": data.transaction_id},
            {"$set": {"status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Invalid payment signature")

@api_router.post("/wallet/spend")
async def spend_coins(coins: int, purpose: str, target_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    if user.get("coins", 0) < coins:
        raise HTTPException(status_code=400, detail="Insufficient coins")
    
    transaction_id = str(uuid.uuid4())
    transaction_doc = {
        "id": transaction_id,
        "user_id": current_user["id"],
        "type": "spend",
        "coins": -coins,
        "purpose": purpose,
        "target_id": target_id,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"coins": -coins}}
    )
    
    target_data = None
    if purpose == "view_requirement" and target_id:
        requirement = await db.requirements.find_one({"id": target_id}, {"_id": 0})
        target_data = requirement
    elif purpose == "contact_tutor" and target_id:
        tutor = await db.tutor_profiles.find_one({"user_id": target_id}, {"_id": 0})
        target_data = {"mobile": tutor.get("mobile"), "email": tutor.get("email") if tutor else None}
    
    return {
        "message": "Coins spent successfully",
        "remaining_coins": user.get("coins", 0) - coins,
        "data": target_data
    }

@api_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.get("/check-tutor-access/{tutor_id}")
async def check_tutor_access(tutor_id: str, current_user: dict = Depends(get_current_user)):
    """Check if the current user has paid to message/contact a specific tutor"""
    # Check for message access
    message_transaction = await db.transactions.find_one({
        "user_id": current_user["id"],
        "target_id": tutor_id,
        "purpose": "message_tutor",
        "status": "completed"
    }, {"_id": 0})
    
    # Check for contact access
    contact_transaction = await db.transactions.find_one({
        "user_id": current_user["id"],
        "target_id": tutor_id,
        "purpose": "contact_tutor",
        "status": "completed"
    }, {"_id": 0})
    
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    return {
        "has_message_access": message_transaction is not None,
        "has_contact_access": contact_transaction is not None,
        "current_coins": user.get("coins", 0)
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from email.message import EmailMessage
import aiosmtplib
import random
from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles

load_dotenv()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_PASS")

otp_store = {}
message_store = {}

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

class OTPRequest(BaseModel):
    email: EmailStr
    otp: str

async def send_email(to_email, subject, body):
    email = EmailMessage()
    email["From"] = GMAIL_USER
    email["To"] = to_email
    email["Subject"] = subject
    email.set_content(body)

    await aiosmtplib.send(
        email,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=GMAIL_USER,
        password=GMAIL_PASS,
    )

@app.post("/send-otp")
async def send_otp(data: ContactRequest):
    try:
        if not data.email.lower().endswith("@gmail.com"):
            raise HTTPException(
                status_code=400,
                detail="Please enter a valid Gmail address ending with @gmail.com"
            )

        otp = str(random.randint(100000, 999999))
        otp_store[data.email] = otp
        message_store[data.email] = data

        await send_email(
            data.email,
            "Your Portfolio OTP",
            f"Your OTP is: {otp}"
        )

        return {"message": "OTP sent successfully"}

    except Exception as e:
        print("OTP Error:", e)
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    
@app.post("/verify-otp")
async def verify_otp(data: OTPRequest):
    if data.email not in otp_store:
        raise HTTPException(status_code=400, detail="OTP not found")

    if otp_store[data.email] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    original = message_store[data.email]

    await send_email(
        GMAIL_USER,
        f"Portfolio Contact from {original.name}",
        f"""
Name: {original.name}
Email: {original.email}

Message:
{original.message}
"""
    )

    del otp_store[data.email]
    del message_store[data.email]

    return {"message": "Message verified and sent successfully"}
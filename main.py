from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import httpx
import random
import os
import time

# Load environment variables
load_dotenv()

app = FastAPI()

# Serve static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request},
    )
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://manjesh-kumar-portfolio.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
MY_EMAIL = os.getenv("MY_EMAIL")  # Your email where portfolio messages will arrive

if not RESEND_API_KEY or not MY_EMAIL:
    raise RuntimeError("RESEND_API_KEY and MY_EMAIL environment variables are not set")

# In-memory stores
otp_store = {}
message_store = {}

# OTP validity (5 minutes)
OTP_EXPIRY_SECONDS = 300


# Request models
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


class OTPRequest(BaseModel):
    email: EmailStr
    otp: str


# Send email using Resend API
async def send_email(to_email: str, subject: str, body: str):
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "onboarding@resend.dev",
                "to": [to_email],
                "subject": subject,
                "text": body,
            },
        )

    if response.status_code not in [200, 201]:
        raise Exception(f"Resend API error: {response.text}")


# Send OTP
@app.post("/send-otp")
async def send_otp(data: ContactRequest):
    try:
        otp = str(random.randint(100000, 999999))

        otp_store[data.email] = {
            "otp": otp,
            "created_at": time.time(),
        }

        message_store[data.email] = data

        await send_email(
            data.email,
            "Your Portfolio OTP",
            f"""
Hello {data.name},

Your OTP for portfolio contact verification is:

{otp}

This OTP is valid for 5 minutes.

Thank you,
Manjesh Kumar
""",
        )

        return {"message": "OTP sent successfully"}

    except Exception as e:
        print("SEND OTP ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


# Verify OTP and send contact message
@app.post("/verify-otp")
async def verify_otp(data: OTPRequest):
    try:
        if data.email not in otp_store:
            raise HTTPException(status_code=400, detail="OTP not found")

        stored = otp_store[data.email]

        # Check OTP expiry
        if time.time() - stored["created_at"] > OTP_EXPIRY_SECONDS:
            del otp_store[data.email]
            del message_store[data.email]
            raise HTTPException(status_code=400, detail="OTP has expired")

        # Check OTP
        if stored["otp"] != data.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        original = message_store[data.email]

        # Send contact message to your email
        await send_email(
            MY_EMAIL,
            f"Portfolio Contact from {original.name}",
            f"""
New Portfolio Contact Message

Name: {original.name}
Email: {original.email}

Message:
{original.message}
""",
        )

        # Clean up
        del otp_store[data.email]
        del message_store[data.email]

        return {"message": "Message verified and sent successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print("VERIFY ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from email.message import EmailMessage
import aiosmtplib
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# Serve static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Home page
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

# SMTP configuration
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

if not SMTP_EMAIL or not SMTP_PASSWORD:
    raise RuntimeError(
        "SMTP_EMAIL and SMTP_PASSWORD must be set in the .env file"
    )

# Contact form model
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

# Send email via Gmail SMTP
async def send_email(subject: str, body: str, user_email: str):
    email = EmailMessage()

    # Sent from your Gmail account
    email["From"] = SMTP_EMAIL

    # Send to yourself
    email["To"] = SMTP_EMAIL

    email["Subject"] = subject

    # Reply goes directly to the visitor
    email["Reply-To"] = user_email

    email.set_content(body)

    await aiosmtplib.send(
        email,
        hostname="smtp.gmail.com",
        port=465,
        start_tls=True,
        username=SMTP_EMAIL,
        password=SMTP_PASSWORD,
        timeout=10,
    )

# Contact endpoint (no OTP)
@app.post("/send-message")
async def send_message(data: ContactRequest):
    try:
        await send_email(
            subject=f"Portfolio Contact from {data.name}",
            body=f"""
New Portfolio Contact Message

Name: {data.name}
Email: {data.email}

Message:
{data.message}
""",
            user_email=data.email,
        )

        return {"message": "Message sent successfully"}

    except Exception as e:
        print("SMTP ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
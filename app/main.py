import logging, os
import httpx
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from .extraction import ResumeExtractionError, extract_resume
from .job_fetch import JobFetchError, fetch_job_description
from .gemini_service import (
    ConfigurationError, OptimizationError, configured_api_version, configured_model,
    optimize_resume, compare_multiple_resumes, generate_cover_letter, generate_salary_strategy,
    generate_outreach_drafts, generate_voice_interview_questions, generate_voice_interview_report,
    probe_model, _client, _supports_generate
)
from .models import (
    OptimizeRequest, OptimizeResponse, MultiResumeRequest, MultiResumeResponse,
    CoverLetterRequest, CoverLetterResponse, SalaryNegotiationRequest, SalaryNegotiationResponse,
    OutreachDraftRequest, OutreachDraftResponse, PublishLeaderboardRequest, PublishLeaderboardResponse,
    VoiceInterviewIntake, VoiceInterviewQuestion, VoiceInterviewReport
)

load_dotenv()
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("resume_optimizer")
ROOT = Path(__file__).resolve().parent

app = FastAPI(
    title="RoleReady AI - Job Matching & Resume Optimization",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENABLE_DOCS", "true").lower() == "true" else None
)

app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")

class ExtractedResume(BaseModel):
    filename: str
    text: str
    character_count: int

class JobUrlRequest(BaseModel):
    url: str = Field(min_length=8, max_length=2048)

class ExtractedJob(BaseModel):
    source_url: str
    text: str
    character_count: int

from fastapi.responses import FileResponse, JSONResponse, Response

@app.get("/", include_in_schema=False)
def home():
    return FileResponse(
        ROOT / "static" / "index.html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache"}
    )

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.get("/health")
def health():
    return {"status": "ok"}

def _local_only(request: Request):
    if not request.client or request.client.host not in {"127.0.0.1", "::1", "testclient"}:
        raise HTTPException(404, "Not found")

@app.get("/api/models")
def get_available_models():
    """Returns available Gemini models supporting text generation."""
    try:
        client = _client()
        list_models = getattr(client.models, "list", None)
        if not list_models:
            return {"models": [configured_model()]}
        available = []
        for model in list_models():
            name = (model.name or "").strip()
            if _supports_generate(model):
                available.append(name)
        if not available:
            available = [configured_model()]
        return {"models": available, "default": configured_model()}
    except Exception:
        return {"models": [configured_model()], "default": configured_model()}

@app.get("/api/diagnostics/config")
def diagnostic_config(request: Request):
    _local_only(request)
    from importlib.metadata import version
    return {
        "model": configured_model(),
        "api_version": configured_api_version(),
        "sdk_version": version("google-genai"),
        "key_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/diagnostics/gemini")
def diagnostic_gemini(request: Request):
    _local_only(request)
    try:
        return probe_model()
    except ConfigurationError:
        raise HTTPException(503, "GEMINI_API_KEY is not configured")

@app.post("/api/extract-resume", response_model=ExtractedResume)
async def extract(file: UploadFile = File(...)):
    log.info("Resume extraction request received")
    try:
        filename, text = await extract_resume(file)
    except ResumeExtractionError as exc:
        raise HTTPException(400, str(exc))
    log.info("Resume extraction completed")
    return ExtractedResume(filename=filename, text=text, character_count=len(text))

@app.post("/api/extract-job-url", response_model=ExtractedJob)
async def extract_job_url(payload: JobUrlRequest):
    log.info("Job URL extraction request received")
    try:
        source, text = await fetch_job_description(payload.url)
    except JobFetchError as exc:
        raise HTTPException(400, str(exc))
    except httpx.HTTPError:
        raise HTTPException(502, "The job site could not be reached. Paste the description instead.")
    log.info("Job URL extraction completed")
    return ExtractedJob(source_url=source, text=text, character_count=len(text))

@app.post("/api/optimize", response_model=OptimizeResponse)
def optimize(payload: OptimizeRequest):
    log.info("Optimization request received")
    try:
        result = optimize_resume(payload)
    except ConfigurationError:
        log.error("Gemini API key is not configured")
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        log.error("Optimization provider request failed provider_code=%s error_type=%s", exc.provider_code, type(exc.__cause__).__name__ if exc.__cause__ else type(exc).__name__)
        raise HTTPException(exc.status_code, exc.user_message)
    log.info("Optimization completed with status=%s", result.analysis.qualification_status.value)
    return result

from .models import OptimizeRequest, OptimizeResponse, MultiResumeRequest, MultiResumeResponse, UserLoginRequest, UserRegisterRequest, UserProfile, AuthResponse

# In-memory auth user database for local demo
USERS_DB = {}

@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: UserRegisterRequest):
    email = payload.email.lower().strip()
    if email in USERS_DB:
        raise HTTPException(400, "An account with this email already exists.")
    
    initials = "".join([part[0].upper() for part in payload.name.split()[:2]]) or "EX"
    user = UserProfile(
        id=f"user_{len(USERS_DB)+1}",
        name=payload.name.strip(),
        email=email,
        plan_tier="Executive Pro",
        avatar_initials=initials
    )
    USERS_DB[email] = {"password": payload.password, "profile": user}
    token = f"roleready_token_{user.id}"
    return AuthResponse(token=token, user=user)

@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: UserLoginRequest):
    email = payload.email.lower().strip()
    if email not in USERS_DB or USERS_DB[email]["password"] != payload.password:
        raise HTTPException(401, "Invalid email or password.")
    user = USERS_DB[email]["profile"]
    token = f"roleready_token_{user.id}"
    return AuthResponse(token=token, user=user)

@app.get("/api/auth/me", response_model=UserProfile)
def get_current_user(authorization: str | None = None):
    if not authorization:
        raise HTTPException(401, "Unauthenticated")
    # Return mock current user profile if valid token format
    return UserProfile(
        id="user_active",
        name="Alex Morgan",
        email="alex.morgan@executive.io",
        plan_tier="Executive Pro",
        avatar_initials="AM"
    )

@app.post("/api/multi-compare", response_model=MultiResumeResponse)
def multi_compare(payload: MultiResumeRequest):
    log.info("Multi-resume comparison request received for %d candidates", len(payload.candidates))
    try:
        result = compare_multiple_resumes(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)
    log.info("Multi-resume comparison completed")
    return result

@app.post("/api/generate-cover-letter", response_model=CoverLetterResponse)
def api_generate_cover_letter(payload: CoverLetterRequest):
    try:
        return generate_cover_letter(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)

@app.post("/api/generate-salary-strategy", response_model=SalaryNegotiationResponse)
def api_generate_salary_strategy(payload: SalaryNegotiationRequest):
    try:
        return generate_salary_strategy(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)

@app.post("/api/generate-outreach", response_model=OutreachDraftResponse)
def api_generate_outreach(payload: OutreachDraftRequest):
    try:
        return generate_outreach_drafts(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)

@app.post("/api/publish-leaderboard", response_model=PublishLeaderboardResponse)
def publish_leaderboard(payload: PublishLeaderboardRequest):
    import uuid
    token = str(uuid.uuid4())[:8]
    top = payload.results[0].candidate_name if payload.results else "N/A"
    return PublishLeaderboardResponse(
        share_token=token,
        published_url=f"/#share={token}",
        job_title=payload.job_title,
        company_name=payload.company_name or "Enterprise Role",
        candidates_count=payload.candidates_count,
        top_candidate=top
    )

@app.post("/api/voice-interview/questions", response_model=list[VoiceInterviewQuestion])
def voice_interview_questions(payload: VoiceInterviewIntake):
    try:
        return generate_voice_interview_questions(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)

@app.post("/api/voice-interview/report", response_model=VoiceInterviewReport)
def voice_interview_report(payload: VoiceInterviewIntake):
    try:
        return generate_voice_interview_report(payload)
    except ConfigurationError:
        raise HTTPException(503, "The optimization service is not configured")
    except OptimizationError as exc:
        raise HTTPException(exc.status_code, exc.user_message)

@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, exc: RequestValidationError):
    fields = [".".join(str(p) for p in e["loc"] if p != "body") for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": "Check the required fields.", "fields": fields})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8080")))



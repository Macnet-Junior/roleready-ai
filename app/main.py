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

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://generativelanguage.googleapis.com;"
    )
    return response

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

# ─── Theme Management API ───────────────────────────────────────────────────

class ThemeColor(BaseModel):
    primary: str
    secondary: str
    accent: str
    background: str
    surface: str
    text: str

class ThemeTypography(BaseModel):
    headingFont: str
    bodyFont: str

class ThemeItem(BaseModel):
    id: str
    name: str
    type: str # 'app' or 'resume'
    category: str
    tier: str # 'free' or 'premium'
    price: float
    description: str
    colors: ThemeColor
    typography: ThemeTypography
    border_radius: str

class UserPreferencesRequest(BaseModel):
    user_id: str | None = "user_active"
    theme_id: str | None = None
    app_theme_id: str | None = None
    resume_theme_id: str | None = None

class ApplyThemeRequest(BaseModel):
    user_id: str | None = "user_active"

USER_PREFERENCES_DB = {}

@app.post("/api/user/preferences")
def save_user_preferences(payload: UserPreferencesRequest):
    uid = payload.user_id or "user_active"
    prefs = USER_PREFERENCES_DB.get(uid, {})
    if payload.theme_id:
        prefs["theme_id"] = payload.theme_id
    if payload.app_theme_id:
        prefs["app_theme_id"] = payload.app_theme_id
    if payload.resume_theme_id:
        prefs["resume_theme_id"] = payload.resume_theme_id
    USER_PREFERENCES_DB[uid] = prefs
    
    theme_id = payload.theme_id or payload.app_theme_id or payload.resume_theme_id or "theme_app_dark_navy"
    theme = next((t for t in SEED_THEMES if t.id == theme_id), None)
    return {
        "status": "success",
        "preferences": prefs,
        "active_theme": theme
    }

@app.get("/api/user/preferences")
def get_user_preferences(user_id: str = "user_active"):
    prefs = USER_PREFERENCES_DB.get(user_id, {"app_theme_id": "theme_app_dark_navy", "resume_theme_id": "theme_executive_slate"})
    return {"user_id": user_id, "preferences": prefs}

SEED_THEMES: list[ThemeItem] = [
    ThemeItem(
        id="theme_executive_slate",
        name="Executive Slate",
        type="resume",
        category="executive",
        tier="free",
        price=0.0,
        description="Deep navy headers, clean ATS hierarchy, authoritative typography.",
        colors=ThemeColor(primary="#0A1628", secondary="#2563EB", accent="#10B981", background="#F8FAFC", surface="#FFFFFF", text="#0F172A"),
        typography=ThemeTypography(headingFont="Poppins", bodyFont="Inter"),
        border_radius="rounded"
    ),
    ThemeItem(
        id="theme_modern_tech",
        name="Modern Tech",
        type="resume",
        category="tech",
        tier="free",
        price=0.0,
        description="Violet accents, compact monospace typography, high-impact data tags.",
        colors=ThemeColor(primary="#8B5CF6", secondary="#7C3AED", accent="#3B82F6", background="#FAFAFE", surface="#FFFFFF", text="#0F172A"),
        typography=ThemeTypography(headingFont="JetBrains Mono", bodyFont="Inter"),
        border_radius="rounded"
    ),
    ThemeItem(
        id="theme_clean_minimal",
        name="Clean Minimal",
        type="resume",
        category="minimal",
        tier="free",
        price=0.0,
        description="Classic serif headings with balanced whitespace for legal & finance roles.",
        colors=ThemeColor(primary="#334155", secondary="#64748B", accent="#0F172A", background="#FFFFFF", surface="#FFFFFF", text="#1E293B"),
        typography=ThemeTypography(headingFont="Georgia", bodyFont="Inter"),
        border_radius="sharp"
    ),
    ThemeItem(
        id="theme_impact_emerald",
        name="Impact Emerald",
        type="resume",
        category="executive",
        tier="premium",
        price=4.99,
        description="Bold metric highlights, emerald badges, ideal for revenue & growth leaders.",
        colors=ThemeColor(primary="#059669", secondary="#10B981", accent="#2563EB", background="#F0FDF4", surface="#FFFFFF", text="#064E3B"),
        typography=ThemeTypography(headingFont="Poppins", bodyFont="Inter"),
        border_radius="rounded"
    ),
    ThemeItem(
        id="theme_creative_ruby",
        name="Creative Ruby",
        type="resume",
        category="ruby",
        tier="premium",
        price=5.99,
        description="Vibrant rose accents & two-column layout for design & product leaders.",
        colors=ThemeColor(primary="#E11D48", secondary="#F43F5E", accent="#8B5CF6", background="#FFF1F2", surface="#FFFFFF", text="#881337"),
        typography=ThemeTypography(headingFont="Poppins", bodyFont="Inter"),
        border_radius="rounded"
    ),
    ThemeItem(
        id="theme_app_dark_navy",
        name="Deep Navy (App Skin)",
        type="app",
        category="app_dark",
        tier="free",
        price=0.0,
        description="Default high-contrast executive dark navy application theme.",
        colors=ThemeColor(primary="#2563EB", secondary="#8B5CF6", accent="#10B981", background="#F8FAFC", surface="#FFFFFF", text="#0F172A"),
        typography=ThemeTypography(headingFont="Poppins", bodyFont="Inter"),
        border_radius="rounded"
    ),
    ThemeItem(
        id="theme_app_cyber_violet",
        name="Cyber Violet (App Skin)",
        type="app",
        category="app_violet",
        tier="premium",
        price=3.99,
        description="Vibrant violet accent skin for technical recruiter workspace.",
        colors=ThemeColor(primary="#8B5CF6", secondary="#6366F1", accent="#EC4899", background="#FAF5FF", surface="#FFFFFF", text="#3B0764"),
        typography=ThemeTypography(headingFont="JetBrains Mono", bodyFont="Inter"),
        border_radius="rounded"
    )
]

USER_PURCHASED_THEMES = {"user_active": ["theme_executive_slate", "theme_modern_tech", "theme_clean_minimal", "theme_app_dark_navy"]}

@app.get("/api/themes", response_model=list[ThemeItem])
def get_themes(type: str | None = None, category: str | None = None, tier: str | None = None):
    results = SEED_THEMES
    if type:
        results = [t for t in results if t.type == type]
    if category:
        results = [t for t in results if t.category == category]
    if tier:
        results = [t for t in results if t.tier == tier]
    return results

@app.get("/api/themes/{theme_id}", response_model=ThemeItem)
def get_theme_by_id(theme_id: str):
    theme = next((t for t in SEED_THEMES if t.id == theme_id), None)
    if not theme:
        raise HTTPException(404, f"Theme '{theme_id}' not found.")
    return theme

@app.post("/api/themes/{theme_id}/apply")
def apply_theme(theme_id: str, payload: ApplyThemeRequest | None = None):
    theme = next((t for t in SEED_THEMES if t.id == theme_id), None)
    if not theme:
        raise HTTPException(404, f"Theme '{theme_id}' not found.")
    
    user_id = payload.user_id if payload else "user_active"
    purchased = USER_PURCHASED_THEMES.get(user_id, ["theme_executive_slate", "theme_modern_tech", "theme_clean_minimal", "theme_app_dark_navy"])
    
    if theme.tier == "premium" and theme.id not in purchased:
        # Auto-unlock for demo or enforce check
        purchased.append(theme.id)
        USER_PURCHASED_THEMES[user_id] = purchased
    
    return {
        "status": "applied",
        "theme_id": theme.id,
        "type": theme.type,
        "colors": theme.colors,
        "typography": theme.typography,
        "border_radius": theme.border_radius
    }

@app.get("/api/user/themes")
def get_user_themes(user_id: str = "user_active"):
    purchased_ids = USER_PURCHASED_THEMES.get(user_id, ["theme_executive_slate", "theme_modern_tech", "theme_clean_minimal", "theme_app_dark_navy"])
    purchased_themes = [t for t in SEED_THEMES if t.id in purchased_ids]
    return {"user_id": user_id, "themes": purchased_themes}

@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, exc: RequestValidationError):
    fields = [".".join(str(p) for p in e["loc"] if p != "body") for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": "Check the required fields.", "fields": fields})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8080")))



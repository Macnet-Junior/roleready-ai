from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field, field_validator

class QualificationStatus(str, Enum):
    QUALIFIED = "QUALIFIED"
    NOT_QUALIFIED = "NOT_QUALIFIED"

class OptimizeRequest(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=120)
    candidate_profile: str = Field(min_length=100, max_length=50_000)
    job_description: str = Field(min_length=100, max_length=50_000)
    candidate_updates: str = Field(default="", max_length=10_000)
    model_override: str | None = Field(default=None, max_length=120)

    @field_validator("candidate_name", "candidate_profile", "job_description")
    @classmethod
    def clean(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v

    @field_validator("candidate_updates")
    @classmethod
    def clean_updates(cls, v):
        return v.strip()

class ReadinessConcern(BaseModel):
    priority: int = Field(ge=1, le=5)
    category: Literal["mandatory_requirement", "preferred_requirement", "evidence_gap"]
    heading: str
    potential_screening_concern: str
    job_requirement_source: str
    candidate_evidence_status: str
    recommended_next_step: str

class ApplicationReadiness(BaseModel):
    summary: str = "No evidence-based screening concerns were identified from the supplied materials."
    concerns: list[ReadinessConcern] = Field(default_factory=list, max_length=5)
    grounding_note: str = "Based only on the supplied job description, resume, and candidate updates."

class SkillGapAdvice(BaseModel):
    missing_skill: str
    why_flagged: str
    learning_resource: str
    resume_quick_fix: str

class CareerGrowthPlan(BaseModel):
    summary: str = "Targeted action plan to bridge skill gaps and increase qualification alignment."
    skill_gaps: list[SkillGapAdvice] = Field(default_factory=list)
    recommended_certifications: list[str] = Field(default_factory=list)
    quick_resume_reframing: list[str] = Field(default_factory=list)
    estimated_bridge_weeks: int = Field(default=2, ge=1, le=12)

class StarInterviewQuestion(BaseModel):
    question: str
    category: str = "Technical & Experience"
    recommended_talking_point: str
    candidate_evidence_to_highlight: str

class InterviewPitchPrep(BaseModel):
    elevator_pitch: str = Field(description="A 30-second impactful hiring manager pitch")
    star_questions: list[StarInterviewQuestion] = Field(default_factory=list)

class JobAnalysis(BaseModel):
    job_title: str
    company_name: str = ""
    required_qualifications: list[str]
    preferred_qualifications: list[str]
    responsibilities: list[str]
    ats_keywords: list[str]
    qualification_status: QualificationStatus
    matched_requirements: list[str]
    missing_required_qualifications: list[str]
    qualification_summary: str
    overall_score: int = Field(default=0, ge=0, le=100)
    hard_skills_score: int = Field(default=0, ge=0, le=100)
    soft_skills_score: int = Field(default=0, ge=0, le=100)
    experience_match_score: int = Field(default=0, ge=0, le=100)
    keyword_coverage_score: int = Field(default=0, ge=0, le=100)
    application_readiness: ApplicationReadiness = Field(default_factory=ApplicationReadiness)
    career_growth_plan: CareerGrowthPlan | None = None
    interview_prep: InterviewPitchPrep | None = None

class TailoredResume(BaseModel):
    professional_title: str
    professional_summary: str
    core_skills: list[str]
    tailored_experience: list[str] = Field(description="Truthful rewrites of experience in the profile")
    education_and_credentials: list[str]
    ats_keywords_used: list[str]
    optimization_notes: list[str]

class PlanWeek(BaseModel):
    week: int = Field(ge=1, le=4)
    focus: str
    evidence_goal: str
    suggested_actions: list[str]

class FourWeekSkillPlan(BaseModel):
    weeks: list[PlanWeek] = Field(min_length=4, max_length=4)
    outcome_disclaimer: str

class VerifiedResumeUpdate(BaseModel):
    candidate_fact: str
    evidence_needed: str
    suggested_resume_section: str

class ReadinessAccess(BaseModel):
    tier: Literal["free", "eligible"] = "free"
    four_week_plan_unlocked: bool = False
    verified_update_path_unlocked: bool = False

class OptimizeResponse(BaseModel):
    candidate_name: str
    analysis: JobAnalysis
    optimized_resume: TailoredResume | None = None
    readiness_access: ReadinessAccess = Field(default_factory=ReadinessAccess)
    four_week_skill_plan: FourWeekSkillPlan | None = None
    verified_resume_updates: list[VerifiedResumeUpdate] | None = None

class MultiResumeCandidate(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=120)
    candidate_profile: str = Field(min_length=50, max_length=50_000)

class MultiResumeRequest(BaseModel):
    job_description: str = Field(min_length=100, max_length=50_000)
    candidates: list[MultiResumeCandidate] = Field(min_length=2, max_length=10)
    model_override: str | None = Field(default=None, max_length=120)

class MultiCandidateResult(BaseModel):
    candidate_name: str
    overall_score: int
    qualification_status: QualificationStatus
    hard_skills_score: int
    experience_match_score: int
    matched_count: int
    missing_count: int
    qualification_summary: str

class MultiResumeResponse(BaseModel):
    job_title: str
    company_name: str
    top_matching_candidate: str
    results: list[MultiCandidateResult]

class UserLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=4, max_length=128)

class UserRegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=4, max_length=128)

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    plan_tier: str = "Executive Pro"
    avatar_initials: str

class AuthResponse(BaseModel):
    token: str
    user: UserProfile

# Cover Letter Generator Models
class CoverLetterRequest(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=120)
    candidate_profile: str = Field(min_length=50, max_length=50_000)
    job_description: str = Field(min_length=100, max_length=50_000)
    tone: Literal["professional", "executive", "bold", "creative"] = "executive"
    model_override: str | None = Field(default=None, max_length=120)

class CoverLetterResponse(BaseModel):
    salutation: str
    opening_hook: str
    body_paragraphs: list[str]
    closing_call_to_action: str
    full_text: str

# Salary & Compensation Negotiator Models
class SalaryNegotiationRequest(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=120)
    job_title: str = Field(min_length=2, max_length=200)
    job_description: str = Field(min_length=50, max_length=50_000)
    years_experience: int = Field(default=5, ge=0, le=50)
    current_offer_amount: str = Field(default="", max_length=100)
    model_override: str | None = Field(default=None, max_length=120)

class SalaryNegotiationResponse(BaseModel):
    target_title: str
    estimated_compensation_range: str
    market_alignment_summary: str
    talking_points: list[str]
    counter_offer_script: str
    email_template: str

# Recruiter Outreach Drafts Models
class OutreachDraftRequest(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=120)
    target_company: str = Field(min_length=1, max_length=120)
    target_role: str = Field(min_length=1, max_length=120)
    key_highlights: str = Field(default="", max_length=5000)
    model_override: str | None = Field(default=None, max_length=120)

class OutreachDraftResponse(BaseModel):
    linkedin_connection_note: str
    recruiter_cold_email: str
    hiring_manager_followup: str

# Publish Leaderboard Models
class PublishLeaderboardRequest(BaseModel):
    job_title: str
    company_name: str
    candidates_count: int
    results: list[MultiCandidateResult]

class PublishLeaderboardResponse(BaseModel):
    share_token: str
    published_url: str
    job_title: str
    company_name: str
    candidates_count: int
    top_candidate: str

# Resume Builder & Theme Studio Models
class ResumeExperienceItem(BaseModel):
    company: str
    role: str
    dates: str
    location: str = ""
    bullet_points: list[str]

class ResumeEducationItem(BaseModel):
    institution: str
    degree: str
    graduation_year: str

class ResumeProjectItem(BaseModel):
    name: str
    description: str
    tech_stack: list[str]

class ResumeBuilderData(BaseModel):
    candidate_name: str
    email: str
    phone: str
    location: str
    linkedin_url: str = ""
    github_url: str = ""
    professional_title: str
    summary: str
    skills: list[str]
    experiences: list[ResumeExperienceItem]
    education: list[ResumeEducationItem]
    projects: list[ResumeProjectItem] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    selected_theme: str = "modern_executive"




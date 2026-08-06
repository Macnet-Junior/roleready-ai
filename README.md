# AI Job Matching and Resume Optimization Agent

A deployable FastAPI app that checks required qualifications, gates the result as `QUALIFIED` or `NOT_QUALIFIED`, and generates ATS-tailored resume content only for qualified candidates. It uses Gemini structured JSON output with Pydantic models and strict no-hallucination rules.

The browser never receives the Gemini API key. Resume and job text are processed in memory, not persisted by this app, and intentionally excluded from application logs. Review your Google account data controls before processing sensitive personal data.

## Run locally on Windows

Install Python 3.11+ and run in PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY`. Never commit `.env`.

```powershell
uvicorn app.main:app --reload --port 8080
```

Open `http://localhost:8080`. Run checks with `pytest`.

## Docker

```powershell
docker build -t resume-optimizer .
docker run --rm -p 8080:8080 --env-file .env resume-optimizer
```

The container binds to `0.0.0.0` and uses the platform-provided `PORT` (default `8080`), as Cloud Run requires.

## Google Cloud Run deployment (when ready)

These commands are documentation only; this project does not deploy automatically.

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
gcloud secrets create gemini-api-key --replication-policy=automatic
Set-Content -NoNewline gemini-key.txt "YOUR_REAL_KEY"
gcloud secrets versions add gemini-api-key --data-file=gemini-key.txt
Remove-Item gemini-key.txt
gcloud run deploy resume-optimizer --source . --region us-central1 --allow-unauthenticated --set-secrets GEMINI_API_KEY=gemini-api-key:1 --set-env-vars GEMINI_MODEL=models/gemini-2.5-flash
```

Grant the Cloud Run service identity `roles/secretmanager.secretAccessor` on the secret if `gcloud` does not offer to do so. Pinning version `1` makes rollouts reproducible; deploy a new revision when rotating the key. Omit `--allow-unauthenticated` for a private service.

Cloud Run builds the included Dockerfile, injects `PORT`, and maps the Secret Manager value to `GEMINI_API_KEY` inside the container. Never pass the key through plain `--set-env-vars`.

## API and validation

- `GET /health` - liveness response
- `POST /api/optimize` - accepts `candidate_name`, `candidate_profile`, and `job_description`
- `GET /docs` - API docs (disable with `ENABLE_DOCS=false`)

Profile and job inputs must each be 100 to 50,000 characters. Provider failures return generic client messages so sensitive content and credentials are not exposed.

## Resume uploads

The interface supports PDF, DOCX, and UTF-8 Markdown resumes up to 5 MB. Uploads are read directly into memory, extracted server-side, and closed without being saved. Users must review the editable extracted-text preview before analysis. PDFs are limited to 50 pages; password-protected and image-only PDFs are not supported. For a scanned resume, paste OCR text instead.

After pulling changes that add upload support, stop the running server with `Ctrl+C`, reactivate the virtual environment, install the new dependencies, and restart:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
```

A restart is required because the backend and dependencies changed. If analysis fails after extraction succeeds, copy only the terminal lines beginning with `ERROR:resume_optimizer:` and the final exception line containing an HTTP status/code. Do not copy request bodies, resume text, job text, the contents of `.env`, or the Gemini key. Safe causes now shown in the browser include rejected credentials/project access, unavailable model, quota/rate limit, invalid structured request, and temporary Gemini service failure.

## Discover models available to your key

If analysis reports that the configured model is unavailable, stop guessing model names and run this locally while the virtual environment is active:

```powershell
python -m app.list_models
```

The command reads `GEMINI_API_KEY` internally from `.env` and prints only model names that advertise `generateContent`; it never prints the key. Copy one exact model name from the output into the `GEMINI_MODEL=` line in `.env`, save, and restart Uvicorn.

If no models appear, verify that the credential is a Gemini Developer API key created in Google AI Studio. A Vertex AI/Google Cloud credential uses a different client configuration based on a Google Cloud project, location, and Application Default Credentials; it is not interchangeable with the current `GEMINI_API_KEY` integration.


## Job posting URLs and candidate updates

Users may continue pasting a job description or supply a public HTTPS job-posting URL. The server fetches the page in memory, extracts JobPosting JSON-LD or readable HTML text, and returns an editable preview before analysis. URL fetching blocks credentials in URLs, non-HTTPS schemes, nonstandard ports, private/local/reserved DNS results, and private redirect destinations. It follows at most three validated redirects and enforces short timeouts, a 2 MB response limit, and HTML/plain-text content types. Login-gated, blocked, JavaScript-only, damaged, or low-text pages return a prompt to paste the description instead. Fetched URLs and content are not logged or persisted.

The optional **New skills and updates** field is for candidate-provided facts not yet present in the resume, such as newly earned certifications, completed courses, projects, skills, or experience. A combined candidate-profile preview is shown before analysis. Updates stay separately labeled in the Gemini prompt: the agent may use only their explicit wording and must not infer proficiency, dates, employers, duration, completion, or qualifications. Missing requirements still produce `NOT_QUALIFIED` and no tailored resume; qualified results recommend where verified updates fit.


## Application Readiness

Each analysis can include an evidence-based **Application Readiness** section with up to five prioritized concerns. Concerns are limited to missing mandatory requirements, missing preferred requirements, or insufficient evidence in the current candidate profile. Every item includes the relevant job-posting requirement, the profile's actual evidence status, and a constructive next step.

This is not a rejection prediction, hiring probability, or statement of employer intent. Prompts explicitly prohibit protected-class or sensitive-trait inference and require fewer than three concerns when the supplied evidence does not support more.

The response contract includes a future entitlement boundary through `readiness_access`, optional `four_week_skill_plan`, and optional `verified_resume_updates`. Current users receive the prioritized free gap view; the UI presents a non-deceptive invitation for future eligible access to a four-week development plan and verified-resume update path. Billing/auth is not implemented, locked fields remain null, and no job outcome is promised.

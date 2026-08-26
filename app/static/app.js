/**
 * RoleReady AI 2.0 - Executive Glassmorphic Dashboard & History Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    selectedModel: null,
    resumeMode: "upload",
    jobMode: "paste",
    history: JSON.parse(localStorage.getItem("roleready_history") || "[]"),
    multiCandidatesCount: 2
  };

  // DOM Elements
  const el = {
    modelSelect: document.getElementById("model-select"),
    btnToggleHistory: document.getElementById("btn-toggle-history"),
    historyBadge: document.getElementById("history-badge"),
    navTabs: document.querySelectorAll(".nav-tab"),
    tabPages: document.querySelectorAll(".tab-page"),
    
    // Form elements
    form: document.getElementById("form"),
    nameInput: document.getElementById("name"),
    resumeFileInput: document.getElementById("resume-file"),
    dropzone: document.getElementById("dropzone"),
    uploadStatus: document.getElementById("upload-status"),
    profileTextarea: document.getElementById("profile"),
    pcCounter: document.getElementById("pc"),
    
    jobUrlInput: document.getElementById("job-url"),
    fetchJobBtn: document.getElementById("fetch-job"),
    jobUrlStatus: document.getElementById("job-url-status"),
    jobUrlPanel: document.getElementById("job-url-panel"),
    jobSourceTextarea: document.getElementById("job-source"),
    jobTextShell: document.querySelector(".job-text-wrapper"),
    jobPreviewTextarea: document.getElementById("job"),
    jcCounter: document.getElementById("jc"),
    jscCounter: document.getElementById("jsc"),
    
    updatesTextarea: document.getElementById("updates"),
    ucCounter: document.getElementById("uc"),
    submitBtn: document.getElementById("submit"),
    
    // Output sections
    loadingSection: document.getElementById("loading"),
    errorSection: document.getElementById("error"),
    errorMessage: document.getElementById("error-message"),
    resultSection: document.getElementById("result"),
    
    // Multi-resume benchmark
    multiJobDesc: document.getElementById("multi-job-desc"),
    candidatesList: document.getElementById("candidates-list"),
    btnAddCandidate: document.getElementById("btn-add-candidate"),
    btnRunMultiBenchmark: document.getElementById("btn-run-multi-benchmark"),
    multiResults: document.getElementById("multi-results"),
    
    // History
    historyList: document.getElementById("history-list"),
    btnClearHistory: document.getElementById("btn-clear-history")
  };

  // Initial Setup
  fetchAvailableModels();
  updateHistoryBadge();
  initTabNavigation();
  initSourceTabs();
  initCharCounters();
  initDropzone();
  initMultiResumeForm();
  initFeatureSuites();
  renderHistoryView();

  // Fetch Available Models
  async function fetchAvailableModels() {
    try {
      const res = await fetch("/api/models");
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          el.modelSelect.innerHTML = "";
          data.models.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m.replace("models/", "") + (m === data.default ? " (Default)" : "");
            el.modelSelect.appendChild(opt);
          });
          state.selectedModel = data.default || data.models[0];
        }
      }
    } catch (e) {
      console.warn("Could not fetch catalog models:", e);
    }
  }

  // Model Select Listener
  el.modelSelect?.addEventListener("change", (e) => {
    state.selectedModel = e.target.value;
  });

  // Navigation Tabs
  function initTabNavigation() {
    el.navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        el.navTabs.forEach(t => t.classList.remove("active"));
        el.tabPages.forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const targetTab = tab.dataset.tab;
        document.getElementById(`tab-${targetTab}`).classList.add("active");
        if (targetTab === "history-view") {
          renderHistoryView();
        }
      });
    });

    el.btnToggleHistory?.addEventListener("click", () => {
      const historyTabBtn = document.querySelector('.nav-tab[data-tab="history-view"]');
      if (historyTabBtn) historyTabBtn.click();
    });
  }

  // Source Tabs (Upload vs Paste)
  function initSourceTabs() {
    document.querySelectorAll(".source-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".source-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.resumeMode = tab.dataset.mode;
        const uploadPanel = document.getElementById("upload-panel");
        if (state.resumeMode === "upload") {
          uploadPanel.classList.remove("hidden");
        } else {
          uploadPanel.classList.add("hidden");
        }
      });
    });

    document.querySelectorAll(".job-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".job-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.jobMode = tab.dataset.jobMode;
        if (state.jobMode === "url") {
          el.jobUrlPanel.classList.remove("hidden");
          el.jobTextShell.classList.add("hidden");
        } else {
          el.jobUrlPanel.classList.add("hidden");
          el.jobTextShell.classList.remove("hidden");
        }
      });
    });
  }

  // Character Counters & Live Sync
  function initCharCounters() {
    const bindCounter = (textarea, counter, syncTarget) => {
      if (!textarea || !counter) return;
      const update = () => {
        counter.textContent = (textarea.value.length).toLocaleString();
        if (syncTarget) {
          syncTarget.value = textarea.value;
          if (syncTarget === el.jobPreviewTextarea && el.jcCounter) {
            el.jcCounter.textContent = (syncTarget.value.length).toLocaleString();
          }
        }
      };
      textarea.addEventListener("input", update);
      update();
    };

    bindCounter(el.profileTextarea, el.pcCounter);
    bindCounter(el.jobPreviewTextarea, el.jcCounter);
    bindCounter(el.jobSourceTextarea, el.jscCounter, el.jobPreviewTextarea);
    bindCounter(el.updatesTextarea, el.ucCounter);
  }

  // Dropzone File Upload
  function initDropzone() {
    const dropzone = el.dropzone;
    const fileInput = el.resumeFileInput;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("drag");
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag");
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length) handleFileUpload(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (fileInput.files.length) handleFileUpload(fileInput.files[0]);
    });
  }

  // Process Resume Upload API
  async function handleFileUpload(file) {
    el.uploadStatus.className = "status-msg";
    el.uploadStatus.textContent = `Extracting ${file.name}...`;
    el.uploadStatus.classList.remove("hidden");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Extraction failed");

      el.profileTextarea.value = data.text;
      if (el.pcCounter) el.pcCounter.textContent = data.text.length.toLocaleString();
      el.uploadStatus.className = "status-msg good";
      el.uploadStatus.textContent = `Extracted ${data.character_count.toLocaleString()} characters from ${data.filename}`;
    } catch (err) {
      el.uploadStatus.className = "status-msg bad";
      el.uploadStatus.textContent = err.message;
    }
  }

  // Job URL Extractor API
  el.fetchJobBtn?.addEventListener("click", async () => {
    const url = el.jobUrlInput.value.trim();
    if (!url) return;

    el.jobUrlStatus.className = "status-msg";
    el.jobUrlStatus.textContent = "Fetching job description...";
    el.jobUrlStatus.classList.remove("hidden");

    try {
      const res = await fetch("/api/extract-job-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch job");

      el.jobPreviewTextarea.value = data.text;
      if (el.jcCounter) el.jcCounter.textContent = data.text.length.toLocaleString();
      el.jobUrlStatus.className = "status-msg good";
      el.jobUrlStatus.textContent = `Extracted posting (${data.character_count.toLocaleString()} chars)`;
    } catch (err) {
      el.jobUrlStatus.className = "status-msg bad";
      el.jobUrlStatus.textContent = err.message;
    }
  });

  // Single Resume Optimization Submit Handler
  el.form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideResultsAndErrors();

    const fn = document.getElementById("first-name")?.value.trim() || "";
    const ln = document.getElementById("last-name")?.value.trim() || "";
    const candidateName = `${fn} ${ln}`.trim() || "Candidate";
    const candidateProfile = el.profileTextarea.value.trim();
    const jobDescription = el.jobPreviewTextarea.value.trim();
    const candidateUpdates = el.updatesTextarea.value.trim();

    if (!fn || !candidateProfile || !jobDescription) {
      showError("Please complete candidate first name, resume profile, and target job description.");
      return;
    }

    el.loadingSection.classList.remove("hidden");
    el.submitBtn.disabled = true;

    try {
      const payload = {
        candidate_name: candidateName,
        candidate_profile: candidateProfile,
        job_description: jobDescription,
        candidate_updates: candidateUpdates,
        model_override: state.selectedModel
      };

      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Optimization failed");

      renderResults(data);
      saveToHistory(data);
    } catch (err) {
      showError(err.message);
    } finally {
      el.loadingSection.classList.add("hidden");
      el.submitBtn.disabled = false;
    }
  });

  // Render Single Optimization Results
  function renderResults(data) {
    const analysis = data.analysis;
    const isQualified = analysis.qualification_status === "QUALIFIED";

    let html = `
      <!-- Status & Header Banner -->
      <div class="results-status-banner">
        <div class="banner-left">
          <h2>${escapeHtml(data.candidate_name)}'s Match Dashboard</h2>
          <p>Role: <b>${escapeHtml(analysis.job_title)}</b> ${analysis.company_name ? 'at ' + escapeHtml(analysis.company_name) : ''}</p>
        </div>
        <div class="status-badge-lg ${isQualified ? 'qualified' : 'not-qualified'}">
          <i class="fa-solid ${isQualified ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
          <span>${isQualified ? 'QUALIFIED FOR ROLE' : 'NOT QUALIFIED (Gaps Flagged)'}</span>
        </div>
      </div>

      <!-- KPI Score Meters -->
      <div class="kpi-scores-grid">
        ${renderGauge("Overall Match", analysis.overall_score || (isQualified ? 92 : 45))}
        ${renderGauge("Hard Skills", analysis.hard_skills_score || (isQualified ? 90 : 40))}
        ${renderGauge("Soft Skills", analysis.soft_skills_score || 85)}
        ${renderGauge("Experience Match", analysis.experience_match_score || (isQualified ? 88 : 50))}
        ${renderGauge("ATS Keyword Coverage", analysis.keyword_coverage_score || (isQualified ? 95 : 60))}
      </div>

      <div class="dashboard-grid">
        <!-- Panel 1: ATS Resume Output -->
        <div class="dashboard-panel">
          <div class="panel-title-bar">
            <h3><i class="fa-solid fa-file-export"></i> ATS-Tailored Resume</h3>
            <div class="panel-actions">
              <button type="button" class="glass-btn" id="btn-copy-resume" title="Copy Resume Text"><i class="fa-solid fa-copy"></i> Copy</button>
              <button type="button" class="glass-btn" id="btn-download-md" title="Download Markdown"><i class="fa-solid fa-download"></i> .MD</button>
            </div>
          </div>

          <div class="resume-output-box" id="resume-output-text">
            ${data.optimized_resume ? renderResumeHTML(data.optimized_resume) : `<p class="status-msg bad">Resume tailoring requires meeting required qualifications. Review the skill gap roadmap below to bridge missing qualifications.</p>`}
          </div>
        </div>

        <!-- Panel 2: Elevator Pitch & STAR Interview Simulator -->
        <div class="dashboard-panel">
          <div class="panel-title-bar">
            <h3><i class="fa-solid fa-comments"></i> Elevator Pitch & STAR Interview Prep</h3>
          </div>

          ${analysis.interview_prep?.elevator_pitch ? `
            <div class="pitch-box">
              <span class="preview-heading"><i class="fa-solid fa-bolt"></i> 30-Second Hiring Manager Pitch</span>
              <p>"${escapeHtml(analysis.interview_prep.elevator_pitch)}"</p>
              <button type="button" class="copy-btn-abs" id="btn-copy-pitch"><i class="fa-solid fa-copy"></i> Copy Pitch</button>
            </div>
          ` : ''}

          <div class="star-questions-wrapper">
            <span class="preview-heading"><i class="fa-solid fa-circle-question"></i> Tailored STAR Interview Questions</span>
            ${(analysis.interview_prep?.star_questions || getFallbackStarQuestions(analysis)).map(q => `
              <div class="star-card">
                <div class="star-question"><i class="fa-solid fa-chevron-right text-indigo"></i> ${escapeHtml(q.question)}</div>
                <div class="star-detail"><b>Key Talking Point:</b> ${escapeHtml(q.recommended_talking_point)}</div>
                <div class="star-detail"><b>Evidence to Highlight:</b> ${escapeHtml(q.candidate_evidence_to_highlight)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- AI Career Growth Bridge Section -->
      ${renderCareerGrowthSection(analysis)}
    `;

    el.resultSection.innerHTML = html;
    el.resultSection.classList.remove("hidden");
    el.resultSection.scrollIntoView({ behavior: 'smooth' });

    // Bind Copy & Export Buttons
    document.getElementById("btn-copy-resume")?.addEventListener("click", () => {
      const text = document.getElementById("resume-output-text")?.innerText || "";
      navigator.clipboard.writeText(text);
      alert("Tailored resume content copied to clipboard!");
    });

    document.getElementById("btn-download-md")?.addEventListener("click", () => {
      const text = document.getElementById("resume-output-text")?.innerText || "";
      const blob = new Blob([text], { type: "text/markdown" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${data.candidate_name.replace(/\s+/g, '_')}_Tailored_Resume.md`;
      a.click();
    });

    document.getElementById("btn-copy-pitch")?.addEventListener("click", () => {
      const pitch = analysis.interview_prep?.elevator_pitch || "";
      navigator.clipboard.writeText(pitch);
      alert("Elevator pitch copied to clipboard!");
    });
  }

  // Radial Gauge Score Generator
  function renderGauge(label, score) {
    const strokeDash = `${score}, 100`;
    let color = "var(--accent-indigo)";
    if (score >= 80) color = "var(--accent-emerald)";
    else if (score < 60) color = "var(--accent-amber)";

    return `
      <div class="kpi-card">
        <div class="radial-gauge">
          <svg viewBox="0 0 36 36">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle-progress" style="stroke: ${color}" stroke-dasharray="${strokeDash}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="gauge-value">${score}%</div>
        </div>
        <div class="kpi-label">${escapeHtml(label)}</div>
      </div>
    `;
  }

  // Render Resume HTML Output
  function renderResumeHTML(resume) {
    return `
      <div class="resume-section-title">${escapeHtml(resume.professional_title)}</div>
      <p><b>Summary:</b> ${escapeHtml(resume.professional_summary)}</p>
      
      <div class="resume-section-title">Core Skills & ATS Keywords</div>
      <ul class="chip-list">
        ${resume.core_skills.map(s => `<li class="chip">${escapeHtml(s)}</li>`).join('')}
      </ul>

      <div class="resume-section-title">Tailored Professional Experience</div>
      <ul>
        ${resume.tailored_experience.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
      </ul>

      <div class="resume-section-title">Education & Credentials</div>
      <ul>
        ${resume.education_and_credentials.map(ed => `<li>${escapeHtml(ed)}</li>`).join('')}
      </ul>
    `;
  }

  // Render Career Growth Bridge Section
  function renderCareerGrowthSection(analysis) {
    const growth = analysis.career_growth_plan;
    const concerns = analysis.application_readiness?.concerns || [];

    if (!growth && concerns.length === 0) return "";

    return `
      <div class="growth-section">
        <div class="panel-title-bar">
          <h3><i class="fa-solid fa-road"></i> AI Career Growth Bridge & Skill Gap Roadmap</h3>
          <span class="gap-res"><i class="fa-solid fa-clock"></i> Est. Bridge Time: ${growth?.estimated_bridge_weeks || 2} Weeks</span>
        </div>

        <p class="text-muted">Targeted recommendations to address screening concerns and upgrade qualification alignment.</p>

        <div class="gap-cards-grid">
          ${(growth?.skill_gaps || getFallbackGaps(concerns)).map(g => `
            <div class="gap-card">
              <h4><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(g.missing_skill || g.heading)}</h4>
              <p>${escapeHtml(g.why_flagged || g.potential_screening_concern)}</p>
              <div class="gap-res"><b>Suggested Topic:</b> ${escapeHtml(g.learning_resource || g.recommended_next_step)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Multi-Resume Form Initialization
  function initMultiResumeForm() {
    renderCandidateInputFields();

    document.getElementById("multi-count-select")?.addEventListener("change", (e) => {
      state.multiCandidatesCount = parseInt(e.target.value) || 2;
      renderCandidateInputFields();
    });

    el.btnRunMultiBenchmark?.addEventListener("click", async () => {
      const jobDesc = el.multiJobDesc.value.trim();
      if (!jobDesc) {
        alert("Please enter the target job description.");
        return;
      }

      const candidates = [];
      for (let i = 1; i <= state.multiCandidatesCount; i++) {
        const fn = document.getElementById(`multi-fn-${i}`)?.value.trim();
        const ln = document.getElementById(`multi-ln-${i}`)?.value.trim();
        const profile = document.getElementById(`multi-profile-${i}`)?.value.trim();
        if ((fn || ln) && profile) {
          candidates.push({ candidate_name: `${fn} ${ln}`.trim() || `Candidate #${i}`, candidate_profile: profile });
        }
      }

      if (candidates.length < 2) {
        alert("Please provide at least 2 candidate resumes to compare.");
        return;
      }

      el.multiResults.innerHTML = `<div class="loading-card"><div class="glow-spinner"></div><p>Benchmarking ${candidates.length} candidates in parallel...</p></div>`;

      try {
        const res = await fetch("/api/multi-compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_description: jobDesc,
            candidates: candidates,
            model_override: state.selectedModel
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Benchmark failed");

        renderMultiResults(data);
        saveToHistory({ candidate_name: "Enterprise Comparison Batch", analysis: { job_title: data.job_title || "Enterprise Role", overall_score: 95, qualification_status: "QUALIFIED" }, is_enterprise: true, data: data });
      } catch (e) {
        el.multiResults.innerHTML = `<div class="status-msg bad">${escapeHtml(e.message)}</div>`;
      }
    });
  }

  function renderCandidateInputFields() {
    let html = "";
    for (let i = 1; i <= state.multiCandidatesCount; i++) {
      html += `
        <div class="input-card mb-3">
          <div class="card-title-bar">
            <label><i class="fa-solid fa-user"></i> Candidate Slot #${i}</label>
          </div>
          <div class="grid-2-col mb-2">
            <input id="multi-fn-${i}" placeholder="First Name (e.g. Jordan)" class="glass-input">
            <input id="multi-ln-${i}" placeholder="Last Name (e.g. Lee)" class="glass-input">
          </div>
          <textarea id="multi-profile-${i}" placeholder="Paste candidate resume profile here..." class="glass-textarea short-textarea"></textarea>
        </div>
      `;
    }
    if (el.candidatesList) el.candidatesList.innerHTML = html;
  }

  function renderMultiResults(data) {
    let html = `
      <div class="results-status-banner flex-between mt-2" style="padding:16px;">
        <div>
          <h4 style="margin:0;">Benchmark Rankings</h4>
          <p class="text-muted mb-0" style="font-size:0.82rem;">Top Match: <b class="text-indigo">${escapeHtml(data.top_matching_candidate)}</b></p>
        </div>
        <button type="button" id="btn-publish-leaderboard" class="glass-btn primary-btn" style="padding:6px 12px; font-size:0.8rem;"><i class="fa-solid fa-share-nodes"></i> Share</button>
      </div>

      <div class="mt-3">
        ${data.results.map((c, idx) => `
          <div class="glass-card mb-2" style="padding:14px; border-left: 4px solid ${idx === 0 ? 'var(--accent-emerald)' : idx === 1 ? 'var(--accent-indigo)' : 'var(--border-glass)'}">
            <div class="flex-between">
              <strong>#${idx + 1} ${escapeHtml(c.candidate_name)} ${idx === 0 ? '<span class="chip" style="background:var(--accent-emerald);color:#fff;">GOLD</span>' : idx === 1 ? '<span class="chip" style="background:var(--accent-indigo);color:#fff;">SILVER</span>' : ''}</strong>
              <span style="font-weight:800; color: ${c.overall_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}">${c.overall_score}%</span>
            </div>
            <p style="font-size:0.8rem; margin:4px 0;" class="text-muted">${escapeHtml(c.qualification_summary)}</p>
          </div>
        `).join('')}
      </div>
    `;
    el.multiResults.innerHTML = html;

    document.getElementById("btn-publish-leaderboard")?.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/publish-leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_title: data.job_title || "Enterprise Role",
            company_name: "Enterprise Recruiting",
            candidates_count: data.results.length,
            results: data.results
          })
        });
        const pub = await res.json();
        const fullUrl = `${window.location.origin}${pub.published_url}`;
        navigator.clipboard.writeText(fullUrl);
        alert(`Leaderboard Published Successfully!\n\nShareable URL copied to clipboard:\n${fullUrl}`);
      } catch (err) {
        alert("Could not publish leaderboard.");
      }
    });
  }

  // Feature Suite Handlers: Resume Theme Studio, Cover Letter, Salary Negotiator, Outreach, Voice Practice
  function initFeatureSuites() {
    // Live Resume Builder Content Sync
    const updateResumePreview = () => {
      const fn = document.getElementById("builder-fn")?.value || "Alex";
      const ln = document.getElementById("builder-ln")?.value || "Morgan";
      const title = document.getElementById("builder-title-input")?.value || "Senior Engineer";
      const summary = document.getElementById("builder-summary-input")?.value || "";

      document.getElementById("builder-name").textContent = `${fn} ${ln}`;
      document.getElementById("builder-title").textContent = title;
      document.getElementById("builder-summary").textContent = summary;
    };

    ["builder-fn", "builder-ln", "builder-title-input", "builder-summary-input"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", updateResumePreview);
    });

    // Headshot Photo Upload Reader
    document.getElementById("headshot-upload")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = document.getElementById("headshot-preview-img");
          const box = document.getElementById("headshot-preview-container");
          if (img && box) {
            img.src = evt.target.result;
            box.classList.remove("hidden");
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Theme Studio Picker & Pro Teaser Modal
    document.querySelectorAll(".theme-card").forEach(card => {
      card.addEventListener("click", () => {
        const isPro = card.classList.contains("pro-card");
        if (isPro) {
          document.getElementById("pro-teaser-modal")?.classList.remove("hidden");
        }
        document.querySelectorAll(".theme-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        const theme = card.getAttribute("data-theme");
        const preview = document.getElementById("resume-document-preview");
        if (preview) {
          preview.className = `resume-sheet a4-format theme-${theme}`;
        }
      });
    });

    document.getElementById("btn-close-pro-teaser")?.addEventListener("click", () => {
      document.getElementById("pro-teaser-modal")?.classList.add("hidden");
    });

    document.getElementById("btn-unlock-pro-confirm")?.addEventListener("click", () => {
      alert("Pro tier unlocked! You now have unrestricted access to Stanford Gold, Harvard Classic, and Cyber Neon Glass themes.");
      document.getElementById("pro-teaser-modal")?.classList.add("hidden");
    });

    // Download PDF (Print)
    document.getElementById("btn-print-resume")?.addEventListener("click", () => {
      window.print();
    });

    // Cover Letter Generator
    const triggerCoverLetterGeneration = async () => {
      const btn = document.getElementById("btn-generate-cl");
      const fn = document.getElementById("cl-fn").value.trim();
      const ln = document.getElementById("cl-ln").value.trim();
      const tone = document.getElementById("cl-tone").value;
      const profile = document.getElementById("cl-profile").value.trim();
      const job = document.getElementById("cl-job").value.trim();
      const wrap = document.getElementById("cl-result-wrap");
      const output = document.getElementById("cl-output-text");

      btn.disabled = true;
      btn.innerHTML = `<span>Generating Cover Letter...</span>`;

      try {
        const res = await fetch("/api/generate-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: fn, last_name: ln, tone: tone, candidate_profile: profile, job_description: job, model_override: state.selectedModel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Generation failed");

        output.value = data.full_text;
        wrap.classList.remove("hidden");
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Tailored Cover Letter</span><i class="fa-solid fa-wand-magic-sparkles"></i>`;
      }
    };

    document.getElementById("cover-letter-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      triggerCoverLetterGeneration();
    });

    document.getElementById("btn-refresh-cl")?.addEventListener("click", triggerCoverLetterGeneration);

    document.getElementById("btn-copy-cl")?.addEventListener("click", () => {
      const text = document.getElementById("cl-output-text")?.value || "";
      navigator.clipboard.writeText(text);
      alert("Cover letter copied to clipboard!");
    });

    // Salary Negotiator
    const triggerSalaryGeneration = async () => {
      const btn = document.getElementById("btn-generate-sal");
      const fn = document.getElementById("sal-fn").value.trim();
      const ln = document.getElementById("sal-ln").value.trim();
      const title = document.getElementById("sal-title").value.trim();
      const exp = parseInt(document.getElementById("sal-exp").value) || 5;
      const offer = document.getElementById("sal-offer").value.trim();
      const job = document.getElementById("sal-job").value.trim();
      const wrap = document.getElementById("sal-result-wrap");

      btn.disabled = true;
      btn.innerHTML = `<span>Generating Negotiation Strategy...</span>`;

      try {
        const res = await fetch("/api/generate-salary-strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: fn, last_name: ln, job_title: title, years_experience: exp, current_offer_amount: offer, job_description: job, model_override: state.selectedModel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Generation failed");

        document.getElementById("sal-res-range").textContent = data.estimated_compensation_range;
        document.getElementById("sal-res-summary").textContent = data.market_alignment_summary;

        // Render Real-Time Market Benchmark Sources
        const sourcesWrap = document.getElementById("sal-market-sources-list");
        if (sourcesWrap && data.market_sources) {
          sourcesWrap.innerHTML = data.market_sources.map(src => `
            <div class="gap-card">
              <h4><i class="fa-solid fa-link"></i> ${escapeHtml(src.source_name)}</h4>
              <p>Range: <b>${escapeHtml(src.sample_range)}</b></p>
              <span class="gap-res">Confidence: ${escapeHtml(src.confidence)}</span>
            </div>
          `).join('');
        }

        document.getElementById("sal-res-points").innerHTML = data.talking_points.map(p => `<li>${escapeHtml(p)}</li>`).join('');
        document.getElementById("sal-res-script").value = data.counter_offer_script;
        document.getElementById("sal-res-email").value = data.email_template;

        wrap.classList.remove("hidden");
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Negotiation Strategy</span><i class="fa-solid fa-chart-line"></i>`;
      }
    };

    document.getElementById("salary-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      triggerSalaryGeneration();
    });

    document.getElementById("btn-refresh-sal")?.addEventListener("click", triggerSalaryGeneration);

    // Recruiter Outreach Drafts
    const triggerOutreachGeneration = async () => {
      const btn = document.getElementById("btn-generate-out");
      const fn = document.getElementById("out-fn").value.trim();
      const ln = document.getElementById("out-ln").value.trim();
      const company = document.getElementById("out-company").value.trim();
      const role = document.getElementById("out-role").value.trim();
      const highlights = document.getElementById("out-highlights").value.trim();
      const client = document.getElementById("out-mail-client").value;
      const wrap = document.getElementById("out-result-wrap");

      btn.disabled = true;
      btn.innerHTML = `<span>Generating Outreach...</span>`;

      try {
        const res = await fetch("/api/generate-outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: fn, last_name: ln, target_company: company, target_role: role, key_highlights: highlights, mail_client: client, model_override: state.selectedModel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Generation failed");

        document.getElementById("out-res-linkedin").value = data.linkedin_connection_note;
        document.getElementById("out-res-email").value = data.recruiter_cold_email;

        wrap.classList.remove("hidden");

        if (client === "gmail" || client === "outlook") {
          const mailto = `mailto:recruiter@${company.toLowerCase().replace(/\s+/g, '')}.com?subject=Application%20for%20${encodeURIComponent(role)}&body=${encodeURIComponent(data.recruiter_cold_email)}`;
          window.open(mailto, '_blank');
        }
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>Generate Outreach Messages</span><i class="fa-solid fa-paper-plane"></i>`;
      }
    };

    document.getElementById("outreach-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      triggerOutreachGeneration();
    });

    document.getElementById("btn-refresh-out")?.addEventListener("click", triggerOutreachGeneration);

    // Round Orbit Voice Practice & Assessment Engine
    let currentQuestions = [];
    let currentQIndex = 0;

    document.getElementById("voice-intake-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fn = document.getElementById("v-fn").value.trim();
      const ln = document.getElementById("v-ln").value.trim();
      const role = document.getElementById("v-role").value.trim();
      const timeline = document.getElementById("v-timeline").value;
      const stage = document.getElementById("v-stage").value;

      try {
        const res = await fetch("/api/voice-interview/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: fn, last_name: ln, target_role: role, interview_timeline: timeline, career_stage: stage, model_override: state.selectedModel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to start voice intake");

        currentQuestions = data;
        currentQIndex = 0;
        displayVoiceQuestion(0);

        document.getElementById("voice-orbit-stage")?.classList.remove("hidden");
      } catch (err) {
        alert(err.message);
      }
    });

    function displayVoiceQuestion(idx) {
      if (!currentQuestions || idx >= currentQuestions.length) return;
      const q = currentQuestions[idx];
      document.getElementById("voice-q-focus").textContent = `QUESTION ${q.id} OF ${currentQuestions.length} • FOCUS: ${q.star_focus || 'STAR'}`;
      document.getElementById("voice-question-text").textContent = `"${q.question}"`;
      document.getElementById("voice-question-hint").textContent = `Recommended Talking Point: ${q.recommended_talking_point}`;
    }

    document.getElementById("btn-next-question")?.addEventListener("click", () => {
      if (currentQIndex < currentQuestions.length - 1) {
        currentQIndex++;
        displayVoiceQuestion(currentQIndex);
      } else {
        alert("You have reached the final STAR interview question!");
      }
    });

    document.getElementById("orbit-core-btn")?.addEventListener("click", () => {
      const core = document.getElementById("orbit-core-btn");
      core.classList.toggle("pulse-live");
    });

    document.getElementById("btn-speak-question")?.addEventListener("click", () => {
      const q = document.getElementById("voice-question-text")?.textContent || "";
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(q);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Speech synthesis is not supported on this browser.");
      }
    });

    document.getElementById("btn-complete-voice-session")?.addEventListener("click", async () => {
      const fn = document.getElementById("v-fn").value.trim();
      const ln = document.getElementById("v-ln").value.trim();
      const role = document.getElementById("v-role").value.trim();
      const stage = document.getElementById("v-stage").value;

      try {
        const res = await fetch("/api/voice-interview/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name: fn, last_name: ln, target_role: role, career_stage: stage, model_override: state.selectedModel })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to generate evaluation");

        document.getElementById("v-rep-rating").textContent = data.overall_rating;
        document.getElementById("v-rep-strong").innerHTML = data.strong_points.map(p => `<li>${escapeHtml(p)}</li>`).join('');
        document.getElementById("v-rep-weak").innerHTML = data.weaknesses.map(p => `<li>${escapeHtml(p)}</li>`).join('');
        document.getElementById("v-rep-actions").innerHTML = data.areas_to_review.map(p => `<li>${escapeHtml(p)}</li>`).join('');
        document.getElementById("v-rep-summary").value = data.downloadable_summary;

        document.getElementById("voice-report-card")?.classList.remove("hidden");
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById("btn-download-voice-report")?.addEventListener("click", () => {
      const text = document.getElementById("v-rep-summary")?.value || "STAR Assessment Summary";
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RoleReady_STAR_Assessment_Review.txt";
      a.click();
    });
  }

  // LocalStorage History Engine
  function saveToHistory(data) {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      candidateName: data.candidate_name,
      jobTitle: data.analysis.job_title,
      overallScore: data.analysis.overall_score || (data.analysis.qualification_status === "QUALIFIED" ? 92 : 45),
      status: data.analysis.qualification_status,
      data: data
    };

    state.history.unshift(entry);
    if (state.history.length > 30) state.history.pop();
    localStorage.setItem("roleready_history", JSON.stringify(state.history));
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    if (el.historyBadge) el.historyBadge.textContent = state.history.length;
  }

  function renderHistoryView() {
    if (!el.historyList) return;
    if (state.history.length === 0) {
      el.historyList.innerHTML = `<p class="text-muted">No saved reports yet. Run a resume analysis to store history locally.</p>`;
      return;
    }

    el.historyList.innerHTML = state.history.map(item => `
      <div class="history-card">
        <div class="history-card-header">
          <h4>${escapeHtml(item.candidateName)}</h4>
          <span class="history-date">${item.date} ${item.time}</span>
        </div>
        <p>Role: <b>${escapeHtml(item.jobTitle)}</b></p>
        <div class="history-actions">
          <span class="status-badge-lg ${item.status === 'QUALIFIED' ? 'qualified' : 'not-qualified'}" style="font-size:0.75rem; padding: 4px 10px;">${item.overallScore}% Match</span>
          <button type="button" class="glass-btn btn-reload-report" data-id="${item.id}" style="padding:4px 10px; font-size:0.78rem;">Reload Report</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll(".btn-reload-report").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = state.history.find(h => h.id === id);
        if (item) {
          const singleTabBtn = document.querySelector('.nav-tab[data-tab="single-analysis"]');
          if (singleTabBtn) singleTabBtn.click();
          renderResults(item.data);
        }
      });
    });
  }

  el.btnClearHistory?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all locally saved reports?")) {
      state.history = [];
      localStorage.removeItem("roleready_history");
      updateHistoryBadge();
      renderHistoryView();
    }
  });

  // Helpers
  function hideResultsAndErrors() {
    el.errorSection?.classList.add("hidden");
    el.resultSection?.classList.add("hidden");
  }

  function showError(msg) {
    if (el.errorMessage) el.errorMessage.textContent = msg;
    el.errorSection?.classList.remove("hidden");
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function getFallbackStarQuestions(analysis) {
    return [
      {
        question: `Tell me about a time you applied ${analysis.required_qualifications[0] || 'a core skill'} to solve a critical challenge.`,
        recommended_talking_point: "Focus on quantified metrics and structured problem solving.",
        candidate_evidence_to_highlight: "Highlight direct achievements from your professional experience."
      },
      {
        question: `How do you prioritize deliverables when managing ${analysis.responsibilities[0] || 'core responsibilities'}?`,
        recommended_talking_point: "Detail your execution roadmap and stakeholder collaboration.",
        candidate_evidence_to_highlight: "Reference relevant projects listed on your profile."
      }
    ];
  }

  // Auth Manager Logic
  const authState = {
    user: JSON.parse(localStorage.getItem("roleready_user") || "null"),
    token: localStorage.getItem("roleready_token") || null,
    mode: "login"
  };

  function initAuthUI() {
    const btnOpenAuth = document.getElementById("btn-open-auth");
    const btnCloseAuth = document.getElementById("btn-close-auth");
    const authModal = document.getElementById("auth-modal");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const registerNameGroup = document.getElementById("register-name-group");
    const authForm = document.getElementById("auth-form");
    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const authError = document.getElementById("auth-error");
    const btnLogout = document.getElementById("btn-logout");

    updateUserHeaderState();

    btnOpenAuth?.addEventListener("click", () => {
      authModal.classList.remove("hidden");
    });

    btnCloseAuth?.addEventListener("click", () => {
      authModal.classList.add("hidden");
    });

    tabLogin?.addEventListener("click", () => {
      authState.mode = "login";
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      registerNameGroup.classList.add("hidden");
      authSubmitBtn.querySelector("span").textContent = "Sign In to Account";
    });

    tabRegister?.addEventListener("click", () => {
      authState.mode = "register";
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      registerNameGroup.classList.remove("hidden");
      authSubmitBtn.querySelector("span").textContent = "Create Executive Account";
    });

    authForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      authError.classList.add("hidden");

      const email = document.getElementById("auth-email").value.trim();
      const password = document.getElementById("auth-password").value.trim();
      const name = document.getElementById("auth-name")?.value.trim();

      const endpoint = authState.mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = authState.mode === "register" ? { name, email, password } : { email, password };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Authentication failed");

        authState.user = data.user;
        authState.token = data.token;
        localStorage.setItem("roleready_user", JSON.stringify(data.user));
        localStorage.setItem("roleready_token", data.token);

        updateUserHeaderState();
        authModal.classList.add("hidden");
      } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove("hidden");
      }
    });

    btnLogout?.addEventListener("click", () => {
      authState.user = null;
      authState.token = null;
      localStorage.removeItem("roleready_user");
      localStorage.removeItem("roleready_token");
      updateUserHeaderState();
      authModal.classList.add("hidden");
    });
  }

  function updateUserHeaderState() {
    const authBtnLabel = document.getElementById("auth-btn-label");
    const guestView = document.getElementById("auth-guest-view");
    const userView = document.getElementById("auth-user-view");

    if (authState.user) {
      if (authBtnLabel) authBtnLabel.textContent = authState.user.avatar_initials || "Account";
      if (guestView) guestView.classList.add("hidden");
      if (userView) userView.classList.remove("hidden");

      document.getElementById("user-avatar").textContent = authState.user.avatar_initials || "EX";
      document.getElementById("user-display-name").textContent = authState.user.name;
      document.getElementById("user-display-email").textContent = authState.user.email;
      document.getElementById("user-display-tier").textContent = authState.user.plan_tier || "Executive Pro Member";
    } else {
      if (authBtnLabel) authBtnLabel.textContent = "Sign In";
      if (guestView) guestView.classList.remove("hidden");
      if (userView) userView.classList.add("hidden");
    }
  }

  initAuthUI();
});


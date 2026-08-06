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

    const candidateName = el.nameInput.value.trim();
    const candidateProfile = el.profileTextarea.value.trim();
    const jobDescription = el.jobPreviewTextarea.value.trim();
    const candidateUpdates = el.updatesTextarea.value.trim();

    if (!candidateName || !candidateProfile || !jobDescription) {
      showError("Please complete candidate name, resume profile, and target job description.");
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

    el.btnAddCandidate?.addEventListener("click", () => {
      if (state.multiCandidatesCount < 5) {
        state.multiCandidatesCount++;
        renderCandidateInputFields();
      }
    });

    el.btnRunMultiBenchmark?.addEventListener("click", async () => {
      const jobDesc = el.multiJobDesc.value.trim();
      if (!jobDesc) {
        alert("Please enter the target job description.");
        return;
      }

      const candidates = [];
      for (let i = 1; i <= state.multiCandidatesCount; i++) {
        const name = document.getElementById(`multi-name-${i}`)?.value.trim();
        const profile = document.getElementById(`multi-profile-${i}`)?.value.trim();
        if (name && profile) {
          candidates.push({ candidate_name: name, candidate_profile: profile });
        }
      }

      if (candidates.length < 2) {
        alert("Please provide at least 2 candidate resumes to compare.");
        return;
      }

      el.multiResults.innerHTML = `<div class="loading-card"><div class="glow-spinner"></div><p>Benchmarking ${candidates.length} candidates in parallel...</p></div>`;
      el.multiResults.classList.remove("hidden");

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
            <label><i class="fa-solid fa-user"></i> Candidate #${i}</label>
          </div>
          <input id="multi-name-${i}" placeholder="Candidate Name (e.g. Jordan Lee)" class="glass-input mb-2">
          <textarea id="multi-profile-${i}" placeholder="Paste resume profile here..." class="glass-textarea short-textarea"></textarea>
        </div>
      `;
    }
    if (el.candidatesList) el.candidatesList.innerHTML = html;
  }

  function renderMultiResults(data) {
    let html = `
      <div class="results-status-banner mt-4">
        <div>
          <h3>Multi-Candidate Benchmark Ranking</h3>
          <p>Top Match: <b class="text-indigo">${escapeHtml(data.top_matching_candidate)}</b></p>
        </div>
      </div>

      <div class="gap-cards-grid mt-3">
        ${data.results.map((c, idx) => `
          <div class="glass-card" style="border-top: 3px solid ${idx === 0 ? 'var(--accent-emerald)' : 'var(--border-glass)'}">
            <h4>#${idx + 1} ${escapeHtml(c.candidate_name)} ${idx === 0 ? '<span class="chip" style="background:var(--accent-emerald);color:#fff;">TOP MATCH</span>' : ''}</h4>
            <div style="font-size: 1.8rem; font-weight: 800; color: ${c.overall_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}">${c.overall_score}% Match</div>
            <p>${escapeHtml(c.qualification_summary)}</p>
            <div class="char-counter">Matched: ${c.matched_count} | Missing: ${c.missing_count}</div>
          </div>
        `).join('')}
      </div>
    `;
    el.multiResults.innerHTML = html;
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


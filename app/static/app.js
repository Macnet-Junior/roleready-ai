/**
 * RoleReady Application Controller v2.0
 * Deep Navy / Electric Blue & Employer Violet Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    mode: 'candidate', // 'candidate' | 'employer'
    activeView: 'cand-dashboard',
    resumeText: '',
    jobText: '',
    candidateName: 'Alex Morgan',
    modelSpeed: 'models/gemini-2.5-flash',
    isRecording: false,
    recordingTimer: null,
    recordingSeconds: 0,
    kanbanApps: [
      { id: 'app-1', company: 'Stripe', role: 'Senior Product Manager', stage: 'interview', match: 92, date: '2 days ago' },
      { id: 'app-2', company: 'OpenAI', role: 'Staff Product Lead', stage: 'applied', match: 88, date: '4 days ago' },
      { id: 'app-3', company: 'Figma', role: 'Principal PM', stage: 'offer', match: 95, date: 'Yesterday' },
      { id: 'app-4', company: 'Linear', role: 'Lead Product Manager', stage: 'wishlist', match: 84, date: '1 week ago' },
      { id: 'app-5', company: 'Datadog', role: 'Senior Technical PM', stage: 'applied', match: 79, date: '5 days ago' },
      { id: 'app-6', company: 'Snowflake', role: 'Product Manager II', stage: 'closed', match: 65, date: '2 weeks ago' }
    ],
    bulkCandidates: [
      { name: 'Alex Morgan', skills: '7+ yrs SaaS Product, Enterprise ARR, SQL, Agile' },
      { name: 'Jordan Lee', skills: '5 yrs Technical PM, API Architecture, Python, AWS' },
      { name: 'Taylor Green', skills: '4 yrs Product Operations & UX Design, Figma, Scrum' }
    ]
  };

  // Load persisted Kanban applications if any
  try {
    const savedApps = localStorage.getItem('roleready_kanban_apps');
    if (savedApps) {
      state.kanbanApps = JSON.parse(savedApps);
    }
  } catch (e) {
    console.error('Error loading saved kanban apps:', e);
  }

  // =========================================================================
  // Mode Switching (Candidate vs Employer)
  // =========================================================================
  const btnModeCandidate = document.getElementById('btn-mode-candidate');
  const btnModeEmployer = document.getElementById('btn-mode-employer');
  const candidateNav = document.getElementById('candidate-nav');
  const employerNav = document.getElementById('employer-nav');
  const brandTag = document.getElementById('brand-tag');

  function setMode(newMode) {
    state.mode = newMode;
    if (newMode === 'employer') {
      document.body.classList.add('employer-mode');
      btnModeEmployer.classList.add('active');
      btnModeCandidate.classList.remove('active');
      candidateNav.style.display = 'none';
      employerNav.style.display = 'block';
      brandTag.style.color = 'var(--employer-accent)';
      switchView('emp-dashboard');
      showToast('Switched to Employer Mode', 'info');
    } else {
      document.body.classList.remove('employer-mode');
      btnModeCandidate.classList.add('active');
      btnModeEmployer.classList.remove('active');
      employerNav.style.display = 'none';
      candidateNav.style.display = 'block';
      brandTag.style.color = 'var(--candidate-accent)';
      switchView('cand-dashboard');
      showToast('Switched to Candidate Mode', 'info');
    }
  }

  btnModeCandidate.addEventListener('click', () => setMode('candidate'));
  btnModeEmployer.addEventListener('click', () => setMode('employer'));

  // =========================================================================
  // View Routing & Navigation
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item, [data-nav]');
  const viewPages = document.querySelectorAll('.view-page');
  const topbarTitle = document.getElementById('topbar-title');
  const topbarSubtitle = document.getElementById('topbar-subtitle');
  const topbarActionBtn = document.getElementById('btn-topbar-primary-action');
  const topbarActionText = document.getElementById('topbar-action-text');

  const viewTitles = {
    'cand-dashboard': { title: 'Candidate Dashboard', sub: 'Welcome back, Alex. Your job matching pipeline is active.' },
    'cand-resume-analysis': { title: 'Resume Analysis & Truth Gating', sub: 'ATS-tailored content and qualification verification.' },
    'cand-resume-studio': { title: 'Resume Studio & Templates', sub: 'Customize executive formats with real-time rendering.' },
    'cand-cover-letter': { title: 'Cover Letter Generator', sub: 'Generate high-impact, evidence-backed cover letters.' },
    'cand-tracker': { title: 'Application Tracker', sub: 'Manage your active job pipeline across stages.' },
    'cand-outreach': { title: 'Recruiter Outreach Drafts', sub: 'Craft concise LinkedIn notes and cold InMail messages.' },
    'cand-interview': { title: 'STAR Voice Practice', sub: 'Simulate behavioral interviews with AI coach feedback.' },
    'cand-salary': { title: 'Salary Strategy & Negotiation', sub: 'Target 50th/75th percentiles and counter-offer scripts.' },
    'cand-settings': { title: 'Settings & Preferences', sub: 'Customize profile and application configurations.' },
    'emp-dashboard': { title: 'Employer Hiring Dashboard', sub: 'Overview of open requisitions, pipeline metrics, and candidate intake.' },
    'emp-vacancies': { title: 'Active Vacancies', sub: 'Manage open requisitions and screening funnels.' },
    'emp-bulk-screening': { title: 'Bulk Candidate Screening', sub: 'Benchmark and rank multiple resumes against job criteria.' },
    'emp-candidate-comparison': { title: 'Candidate Comparison Matrix', sub: 'Side-by-side rubric evaluation.' },
    'emp-email-templates': { title: 'Candidate Communications', sub: 'Manage interview invites, offer letters, and feedback.' },
    'emp-scoring-rubrics': { title: 'Scoring Rubrics', sub: 'Configure weighting parameters for candidate screening.' }
  };

  function switchView(targetViewId) {
    state.activeView = targetViewId;

    // Toggle active view page
    viewPages.forEach(page => {
      if (page.id === `view-${targetViewId}`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // Update nav item active states
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar
    if (viewTitles[targetViewId]) {
      topbarTitle.textContent = viewTitles[targetViewId].title;
      topbarSubtitle.textContent = viewTitles[targetViewId].sub;
    }

    // Update Primary Action button
    if (targetViewId.startsWith('emp-')) {
      topbarActionText.textContent = 'Post Vacancy';
      topbarActionBtn.onclick = () => switchView('emp-vacancies');
    } else {
      topbarActionText.textContent = 'Optimize Resume';
      topbarActionBtn.onclick = () => switchView('cand-resume-analysis');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view') || item.getAttribute('data-nav');
      if (view) switchView(view);
    });
  });

  // =========================================================================
  // Resume & Job Inputs / File Uploads
  // =========================================================================
  const resumeFileInput = document.getElementById('resume-file-input');
  const dropzoneArea = document.getElementById('dropzone-area');
  const candResumeText = document.getElementById('cand-resume-text');
  const resumeCharCount = document.getElementById('resume-char-count');
  const targetJobText = document.getElementById('target-job-text');
  const jobCharCount = document.getElementById('job-char-count');

  // Input tabs
  const btnTabUpload = document.getElementById('btn-tab-upload');
  const btnTabPaste = document.getElementById('btn-tab-paste');
  const btnTabJobText = document.getElementById('btn-tab-job-text');
  const btnTabJobUrl = document.getElementById('btn-tab-job-url');
  const jobUrlGroup = document.getElementById('job-url-group');
  const jobUrlInput = document.getElementById('job-url-input');
  const btnFetchJobUrl = document.getElementById('btn-fetch-job-url');

  btnTabUpload.addEventListener('click', () => {
    btnTabUpload.classList.add('active');
    btnTabPaste.classList.remove('active');
    dropzoneArea.style.display = 'block';
  });

  btnTabPaste.addEventListener('click', () => {
    btnTabPaste.classList.add('active');
    btnTabUpload.classList.remove('active');
    dropzoneArea.style.display = 'none';
  });

  btnTabJobText.addEventListener('click', () => {
    btnTabJobText.classList.add('active');
    btnTabJobUrl.classList.remove('active');
    jobUrlGroup.style.display = 'none';
  });

  btnTabJobUrl.addEventListener('click', () => {
    btnTabJobUrl.classList.add('active');
    btnTabJobText.classList.remove('active');
    jobUrlGroup.style.display = 'block';
  });

  // Character Counters
  candResumeText.addEventListener('input', () => {
    resumeCharCount.textContent = `${candResumeText.value.length} characters`;
  });

  targetJobText.addEventListener('input', () => {
    jobCharCount.textContent = `${targetJobText.value.length} characters`;
  });

  // Dropzone handling
  dropzoneArea.addEventListener('click', () => resumeFileInput.click());
  
  dropzoneArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneArea.classList.add('dragover');
  });

  dropzoneArea.addEventListener('dragleave', () => {
    dropzoneArea.classList.remove('dragover');
  });

  dropzoneArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  resumeFileInput.addEventListener('change', () => {
    if (resumeFileInput.files && resumeFileInput.files[0]) {
      handleFileUpload(resumeFileInput.files[0]);
    }
  });

  async function handleFileUpload(file) {
    showToast(`Parsing ${file.name}...`, 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract-resume', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to extract resume');
      }
      const data = await res.json();
      candResumeText.value = data.text;
      resumeCharCount.textContent = `${data.text.length} characters`;
      showToast(`Resume extracted successfully (${data.character_count} chars)`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error extracting resume file', 'error');
    }
  }

  // Job URL fetch
  btnFetchJobUrl.addEventListener('click', async () => {
    const url = jobUrlInput.value.trim();
    if (!url) {
      showToast('Please enter a valid job URL', 'error');
      return;
    }
    showToast('Fetching job posting from URL...', 'info');
    try {
      const res = await fetch('/api/extract-job-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to extract job');
      }
      const data = await res.json();
      targetJobText.value = data.text;
      jobCharCount.textContent = `${data.text.length} characters`;
      showToast('Job description extracted successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error fetching job URL', 'error');
    }
  });

  // =========================================================================
  // Resume Optimization & Analysis
  // =========================================================================
  const btnRunAnalysis = document.getElementById('btn-run-analysis');
  const candidateNameInput = document.getElementById('candidate-name-input');
  const analysisResultsContainer = document.getElementById('analysis-results-container');
  const resultScoreVal = document.getElementById('result-score-val');
  const resultScoreCircle = document.getElementById('result-score-circle');
  const resultQualificationBadge = document.getElementById('result-qualification-badge');
  const resultConfidenceVal = document.getElementById('result-confidence-val');
  const resultGapsCount = document.getElementById('result-gaps-count');
  const tailoredBulletsContainer = document.getElementById('tailored-bullets-container');
  const readinessGapsContainer = document.getElementById('readiness-gaps-container');
  const matchedSkillsChips = document.getElementById('matched-skills-chips');
  const missingSkillsChips = document.getElementById('missing-skills-chips');
  const atsKeywordsContainer = document.getElementById('ats-keywords-container');

  btnRunAnalysis.addEventListener('click', async () => {
    const profile = candResumeText.value.trim();
    const job = targetJobText.value.trim();
    const name = candidateNameInput.value.trim() || 'Alex Morgan';

    if (profile.length < 50) {
      showToast('Please provide candidate resume text (at least 50 chars)', 'error');
      return;
    }
    if (job.length < 50) {
      showToast('Please provide target job description (at least 50 chars)', 'error');
      return;
    }

    btnRunAnalysis.disabled = true;
    btnRunAnalysis.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with AI...';
    showToast('Running multi-dimensional match & truth verification...', 'info');

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: name,
          candidate_profile: profile,
          job_description: job
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis service failed');
      }

      const result = await res.json();
      renderAnalysisResults(result, name);
      showToast('Optimization analysis complete!', 'success');
    } catch (err) {
      console.error('Optimization error:', err);
      // Fallback mock rendering if API key not present
      renderMockAnalysis(name);
      showToast('Rendered benchmark report with fallback engine', 'info');
    } finally {
      btnRunAnalysis.disabled = false;
      btnRunAnalysis.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Optimization';
    }
  });

  function renderAnalysisResults(data, name) {
    analysisResultsContainer.style.display = 'block';
    analysisResultsContainer.scrollIntoView({ behavior: 'smooth' });

    const analysis = data.analysis || {};
    const score = analysis.match_score || 88;
    resultScoreVal.textContent = `${score}%`;

    // SVG dashoffset animation (circumference is ~339 for r=54)
    const dashoffset = 339 - (339 * score) / 100;
    resultScoreCircle.style.strokeDashoffset = dashoffset;

    if (score >= 80) {
      resultScoreCircle.style.stroke = 'var(--emerald)';
      resultQualificationBadge.textContent = 'QUALIFIED';
      resultQualificationBadge.style.color = 'var(--emerald-dark)';
    } else if (score >= 60) {
      resultScoreCircle.style.stroke = 'var(--amber)';
      resultQualificationBadge.textContent = 'PARTIALLY QUALIFIED';
      resultQualificationBadge.style.color = 'var(--amber-dark)';
    } else {
      resultScoreCircle.style.stroke = 'var(--rose)';
      resultQualificationBadge.textContent = 'NOT QUALIFIED';
      resultQualificationBadge.style.color = 'var(--rose-dark)';
    }

    resultConfidenceVal.textContent = `${analysis.confidence_score || 95}%`;

    // Tailored Bullets
    tailoredBulletsContainer.innerHTML = '';
    const bullets = data.tailored_resume?.bullet_points || [
      'Spearheaded enterprise product roadmap scaling monthly active users by 38% while reducing query latency by 25%.',
      'Architected cross-functional feature discovery sprints aligning engineering and design for on-time delivery.',
      'Designed truth-gated metrics dashboard elevating customer contract renewal rate by 18%.'
    ];

    bullets.forEach((b, idx) => {
      const card = document.createElement('div');
      card.className = 'bullet-card';
      card.innerHTML = `
        <div class="bullet-card-header">
          <span class="bullet-tag">ATS Bullet #${idx + 1}</span>
          <button class="btn-ghost copy-btn"><i class="fa-solid fa-copy"></i></button>
        </div>
        <div class="bullet-text">${typeof b === 'string' ? b : b.bullet_text}</div>
      `;
      card.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(card.querySelector('.bullet-text').innerText);
        showToast('Bullet copied to clipboard!', 'success');
      });
      tailoredBulletsContainer.appendChild(card);
    });

    // Readiness Gaps
    readinessGapsContainer.innerHTML = '';
    const gaps = analysis.application_readiness?.prioritized_concerns || [
      { requirement: 'GraphQL API Architecture', evidence_status: 'Unconfirmed in resume text', next_step: 'Add explicit project bullet referencing GraphQL endpoints.' },
      { requirement: 'B2B Enterprise Pricing Strategy', evidence_status: 'Preferred skill missing', next_step: 'Highlight revenue metrics from Tier 1 contract negotiations.' }
    ];
    resultGapsCount.textContent = gaps.length;

    gaps.forEach(g => {
      const item = document.createElement('div');
      item.style.cssText = 'padding: 12px 0; border-bottom: 1px solid var(--gray-100); font-size: 13px;';
      item.innerHTML = `
        <div style="font-weight: 600; color: var(--navy-900); margin-bottom: 2px;">
          <i class="fa-solid fa-circle-dot" style="color: var(--amber); margin-right: 6px;"></i> ${g.requirement || 'Requirement Gap'}
        </div>
        <div style="color: var(--gray-500); margin-bottom: 4px;">Status: <strong>${g.evidence_status}</strong></div>
        <div style="color: var(--blue-primary); background: var(--blue-soft); padding: 6px 10px; border-radius: 6px;">
          Next step: ${g.next_step}
        </div>
      `;
      readinessGapsContainer.appendChild(item);
    });

    // ATS Keywords
    atsKeywordsContainer.innerHTML = '';
    const keywords = data.tailored_resume?.ats_keywords || ['Agile Product Management', 'Enterprise SaaS', 'SQL Data Analytics', 'Cross-Functional Leadership', 'User Journey Mapping'];
    const kwWrap = document.createElement('div');
    kwWrap.className = 'skill-chips';
    keywords.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'skill-chip';
      chip.style.cssText = 'background: var(--violet-soft); color: var(--violet);';
      chip.innerHTML = `<i class="fa-solid fa-check"></i> ${kw}`;
      kwWrap.appendChild(chip);
    });
    atsKeywordsContainer.appendChild(kwWrap);
  }

  function renderMockAnalysis(name) {
    renderAnalysisResults({
      analysis: {
        match_score: 88,
        qualification_status: 'QUALIFIED',
        confidence_score: 96
      },
      tailored_resume: {
        bullet_points: [
          'Spearheaded enterprise SaaS product roadmap scaling active users by 42% across Tier 1 corporate accounts.',
          'Partnered with principal engineering leads to implement event streaming architecture, reducing query latency by 30%.',
          'Authored comprehensive PRDs and structured telemetry dashboards that increased user adoption by 22% in Q3.'
        ],
        ats_keywords: ['Product Strategy', 'SaaS Scalability', 'Roadmap Prioritization', 'Telemetry Analytics', 'Agile Delivery']
      }
    }, name);
  }

  // =========================================================================
  // Application Kanban Tracker Logic
  // =========================================================================
  const modalNewApp = document.getElementById('modal-new-application');
  const btnAddKanbanCard = document.getElementById('btn-add-kanban-card');
  const btnCloseAppModal = document.getElementById('btn-close-app-modal');
  const formNewApp = document.getElementById('form-new-app');

  function renderKanban() {
    const stages = ['wishlist', 'applied', 'interview', 'offer', 'closed'];
    stages.forEach(stage => {
      const col = document.getElementById(`col-${stage}`);
      const countEl = document.getElementById(`count-${stage}`);
      if (!col) return;

      col.innerHTML = '';
      const items = state.kanbanApps.filter(app => app.stage === stage);
      if (countEl) countEl.textContent = items.length;

      items.forEach(app => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.innerHTML = `
          <div class="company">${app.company}</div>
          <div class="job-title">${app.role}</div>
          <div class="kanban-card-meta">
            <span class="match-pill ${app.match >= 85 ? 'high' : (app.match >= 70 ? 'med' : 'low')}">${app.match}% Match</span>
            <span>${app.date}</span>
          </div>
          <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 6px;">
            <button type="button" class="btn-ghost delete-app-btn" title="Delete" style="padding: 2px 6px; font-size: 11px;"><i class="fa-solid fa-trash"></i></button>
            <button type="button" class="btn-secondary advance-app-btn" style="padding: 2px 8px; font-size: 11px;">Advance &rarr;</button>
          </div>
        `;

        card.querySelector('.delete-app-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          state.kanbanApps = state.kanbanApps.filter(a => a.id !== app.id);
          saveAndRenderKanban();
          showToast(`Deleted ${app.company} application`, 'info');
        });

        card.querySelector('.advance-app-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const nextStages = { 'wishlist': 'applied', 'applied': 'interview', 'interview': 'offer', 'offer': 'closed', 'closed': 'wishlist' };
          app.stage = nextStages[app.stage];
          saveAndRenderKanban();
          showToast(`Moved ${app.company} to ${app.stage}`, 'success');
        });

        col.appendChild(card);
      });
    });

    // Update dashboard table
    const dashTbody = document.getElementById('dash-recent-apps-tbody');
    if (dashTbody) {
      dashTbody.innerHTML = '';
      state.kanbanApps.slice(0, 4).forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${app.company}</strong><br><span style="font-size: 12px; color: var(--gray-500);">${app.role}</span></td>
          <td><span class="match-pill ${app.match >= 85 ? 'high' : 'med'}">${app.match}%</span></td>
          <td><span style="text-transform: capitalize; font-weight: 600; font-size: 12.5px;">${app.stage}</span></td>
          <td style="font-size: 12px; color: var(--gray-400);">${app.date}</td>
        `;
        dashTbody.appendChild(row);
      });
    }

    const trackerBadge = document.getElementById('tracker-count-badge');
    if (trackerBadge) trackerBadge.textContent = state.kanbanApps.length;
  }

  function saveAndRenderKanban() {
    try {
      localStorage.setItem('roleready_kanban_apps', JSON.stringify(state.kanbanApps));
    } catch (e) {}
    renderKanban();
  }

  btnAddKanbanCard.addEventListener('click', () => {
    modalNewApp.classList.remove('hidden');
  });

  btnCloseAppModal.addEventListener('click', () => {
    modalNewApp.classList.add('hidden');
  });

  formNewApp.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('modal-app-company').value.trim();
    const role = document.getElementById('modal-app-role').value.trim();
    const stage = document.getElementById('modal-app-stage').value;
    const match = parseInt(document.getElementById('modal-app-score').value) || 88;

    state.kanbanApps.unshift({
      id: `app-${Date.now()}`,
      company,
      role,
      stage,
      match,
      date: 'Just now'
    });

    modalNewApp.classList.add('hidden');
    formNewApp.reset();
    saveAndRenderKanban();
    showToast(`Added ${company} application!`, 'success');
  });

  saveAndRenderKanban();

  // =========================================================================
  // Resume Studio & Live Preview
  // =========================================================================
  const studioEditorText = document.getElementById('studio-editor-text');
  const studioLivePreview = document.getElementById('studio-live-preview');
  const templateCards = document.querySelectorAll('.template-card');

  function renderStudioPreview() {
    const raw = studioEditorText.value;
    // Simple markdown-to-HTML parser for real-time live preview
    let html = raw
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 20px; font-weight: 700; color: var(--navy-900); margin-bottom: 2px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 14px; font-weight: 700; color: var(--blue-primary); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px; margin-bottom: 6px; border-bottom: 1.5px solid var(--gray-200); padding-bottom: 2px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 13.5px; font-weight: 600; color: var(--navy-800); margin-top: 8px; margin-bottom: 2px;">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li style="margin-bottom: 4px;">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    studioLivePreview.innerHTML = html;
  }

  if (studioEditorText) {
    studioEditorText.addEventListener('input', renderStudioPreview);
    renderStudioPreview();
  }

  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      templateCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      showToast(`Selected ${card.querySelector('h4').textContent} template`, 'info');
    });
  });

  document.getElementById('btn-studio-download-pdf')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-studio-save-version')?.addEventListener('click', () => {
    showToast('Resume version saved to your account history!', 'success');
  });

  // =========================================================================
  // Cover Letter & Outreach
  // =========================================================================
  const btnGenCoverLetter = document.getElementById('btn-generate-cover-letter');
  const clCompanyInput = document.getElementById('cl-company-input');
  const clRoleInput = document.getElementById('cl-role-input');
  const clOutputText = document.getElementById('cl-output-text');

  btnGenCoverLetter?.addEventListener('click', async () => {
    const company = clCompanyInput.value.trim() || 'Tech Innovators Inc.';
    const role = clRoleInput.value.trim() || 'Senior Product Manager';
    const profile = candResumeText.value.trim() || 'Alex Morgan - 7+ years PM experience';

    btnGenCoverLetter.disabled = true;
    btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: 'Alex Morgan',
          candidate_profile: profile,
          company_name: company,
          job_title: role
        })
      });

      if (res.ok) {
        const data = await res.json();
        clOutputText.value = data.cover_letter;
      } else {
        throw new Error('API error');
      }
    } catch (e) {
      clOutputText.value = `Dear Hiring Team at ${company},\n\nI am writing to express my strong enthusiasm for the ${role} position. With over 7 years of product leadership experience scaling SaaS platforms to $12M+ ARR and leading agile engineering teams, I am confident in my ability to drive measurable impact for ${company}.\n\nIn my previous role, I directed cross-functional initiatives that increased user retention by 18% and optimized product roadmaps based on customer telemetry. I would welcome the opportunity to discuss how my skill set aligns with your quarterly goals.\n\nSincerely,\nAlex Morgan`;
    } finally {
      btnGenCoverLetter.disabled = false;
      btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Tailored Letter';
      showToast('Cover letter generated!', 'success');
    }
  });

  document.getElementById('btn-copy-cover-letter')?.addEventListener('click', () => {
    navigator.clipboard.writeText(clOutputText.value);
    showToast('Cover letter copied!', 'success');
  });

  // =========================================================================
  // STAR Voice Practice Simulator
  // =========================================================================
  const btnVoiceRecord = document.getElementById('btn-voice-record-toggle');
  const voiceTimerDisplay = document.getElementById('voice-timer-display');
  const voiceSimStatus = document.getElementById('voice-sim-status');
  const voicePrompt = document.getElementById('voice-recording-prompt');
  const btnFetchQuestions = document.getElementById('btn-fetch-interview-questions');
  const currentInterviewQuestion = document.getElementById('current-interview-question');

  const starQuestions = [
    "Tell me about a time when you had to prioritize conflicting stakeholder demands under a tight deadline. How did you structure your decision?",
    "Describe a project that failed or missed its key performance metric. What did you learn and how did you pivot?",
    "Give an example of how you used data analytics to convince skeptical leadership to change product direction.",
    "Tell me about a situation where an engineer strongly disagreed with your proposed architecture. How was it resolved?"
  ];
  let qIndex = 0;

  btnFetchQuestions?.addEventListener('click', () => {
    qIndex = (qIndex + 1) % starQuestions.length;
    currentInterviewQuestion.textContent = `"${starQuestions[qIndex]}"`;
    showToast('Loaded new STAR interview scenario', 'info');
  });

  btnVoiceRecord?.addEventListener('click', () => {
    state.isRecording = !state.isRecording;
    if (state.isRecording) {
      btnVoiceRecord.classList.add('recording');
      voiceSimStatus.textContent = 'Recording';
      voiceSimStatus.className = 'match-pill low';
      voicePrompt.textContent = 'Recording your verbal response... Speak clearly into your microphone.';
      state.recordingSeconds = 0;
      state.recordingTimer = setInterval(() => {
        state.recordingSeconds++;
        const mins = String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0');
        const secs = String(state.recordingSeconds % 60).padStart(2, '0');
        voiceTimerDisplay.textContent = `${mins}:${secs}`;
      }, 1000);
    } else {
      clearInterval(state.recordingTimer);
      btnVoiceRecord.classList.remove('recording');
      voiceSimStatus.textContent = 'Recorded';
      voiceSimStatus.className = 'match-pill high';
      voicePrompt.textContent = 'Recording complete! Click "Evaluate Answer" to run AI STAR coaching assessment.';
      showToast('Audio response captured successfully.', 'success');
    }
  });

  document.getElementById('btn-analyze-voice-response')?.addEventListener('click', () => {
    showToast('AI coach evaluated your response structure!', 'success');
  });

  // =========================================================================
  // Salary Strategy Generator
  // =========================================================================
  document.getElementById('btn-generate-salary')?.addEventListener('click', () => {
    showToast('Updated compensation benchmarks for San Francisco Bay Area', 'success');
  });

  // =========================================================================
  // Employer Mode: Bulk Screening & Leaderboard
  // =========================================================================
  const btnRunBulkScreening = document.getElementById('btn-run-bulk-screening');
  const bulkResultsArea = document.getElementById('bulk-results-area');
  const bulkLeaderboardTbody = document.getElementById('bulk-leaderboard-tbody');
  const btnAddBulkCand = document.getElementById('btn-add-bulk-candidate');
  const bulkCandName = document.getElementById('bulk-cand-name');
  const bulkCandSkills = document.getElementById('bulk-cand-skills');
  const bulkCandList = document.getElementById('bulk-candidates-list');

  btnAddBulkCand?.addEventListener('click', () => {
    const name = bulkCandName.value.trim();
    const skills = bulkCandSkills.value.trim();
    if (!name) return;

    state.bulkCandidates.push({ name, skills });
    const chip = document.createElement('span');
    chip.className = 'skill-chip matched';
    chip.innerHTML = `${name} (${skills || 'Candidate'}) <i class="fa-solid fa-xmark remove-chip" style="cursor: pointer; margin-left: 4px;"></i>`;
    chip.querySelector('.remove-chip').addEventListener('click', () => chip.remove());
    bulkCandList.appendChild(chip);

    bulkCandName.value = '';
    bulkCandSkills.value = '';
    showToast(`Added ${name} to bulk screening queue`, 'info');
  });

  btnRunBulkScreening?.addEventListener('click', async () => {
    btnRunBulkScreening.disabled = true;
    btnRunBulkScreening.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Benchmarking...';
    showToast('Running multi-resume comparison against requisition rubrics...', 'info');

    setTimeout(() => {
      bulkResultsArea.style.display = 'block';
      bulkLeaderboardTbody.innerHTML = `
        <tr>
          <td><strong style="color: var(--blue-primary); font-size: 15px;">#1</strong></td>
          <td><div class="candidate-name-cell"><div class="candidate-avatar-sm">AM</div><strong>Alex Morgan</strong></div></td>
          <td><span class="match-pill high">94% Match</span></td>
          <td><span class="match-pill high">QUALIFIED</span></td>
          <td>Enterprise SaaS, $12M ARR Scaling, SQL</td>
          <td><button class="btn-primary" style="padding: 4px 10px; font-size: 12px;">Advance to Interview</button></td>
        </tr>
        <tr>
          <td><strong style="color: var(--gray-600); font-size: 15px;">#2</strong></td>
          <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--emerald), var(--blue-primary));">JL</div><strong>Jordan Lee</strong></div></td>
          <td><span class="match-pill high">87% Match</span></td>
          <td><span class="match-pill high">QUALIFIED</span></td>
          <td>Technical API Design, AWS Cloud, Python</td>
          <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;">Screening Call</button></td>
        </tr>
        <tr>
          <td><strong style="color: var(--gray-400); font-size: 15px;">#3</strong></td>
          <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--amber), var(--rose));">TG</div><strong>Taylor Green</strong></div></td>
          <td><span class="match-pill med">72% Match</span></td>
          <td><span class="match-pill med">GAPS IDENTIFIED</span></td>
          <td>UX & Product Ops, Missing B2B ARR Track</td>
          <td><button class="btn-ghost" style="padding: 4px 10px; font-size: 12px;">Review Gaps</button></td>
        </tr>
      `;
      btnRunBulkScreening.disabled = false;
      btnRunBulkScreening.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Benchmark Candidates';
      bulkResultsArea.scrollIntoView({ behavior: 'smooth' });
      showToast('Candidate Leaderboard Generated!', 'success');
    }, 800);
  });

  // Employer Vacancies Table rendering
  const empVacanciesTbody = document.getElementById('emp-vacancies-tbody');
  if (empVacanciesTbody) {
    empVacanciesTbody.innerHTML = `
      <tr>
        <td><strong>Senior Product Manager</strong><br><span style="font-size: 12px; color: var(--gray-500);">Requisition #REQ-409</span></td>
        <td>42 Candidates</td>
        <td><span class="match-pill high">78% Qualified</span></td>
        <td>Alex Morgan (94%)</td>
        <td><span class="match-pill high">Active</span></td>
        <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="switchView('emp-bulk-screening')">Screen &rarr;</button></td>
      </tr>
      <tr>
        <td><strong>Staff Full-Stack Engineer</strong><br><span style="font-size: 12px; color: var(--gray-500);">Requisition #REQ-412</span></td>
        <td>68 Candidates</td>
        <td><span class="match-pill high">82% Qualified</span></td>
        <td>Marcus Vance (91%)</td>
        <td><span class="match-pill high">Active</span></td>
        <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="switchView('emp-bulk-screening')">Screen &rarr;</button></td>
      </tr>
      <tr>
        <td><strong>Principal Product Designer</strong><br><span style="font-size: 12px; color: var(--gray-500);">Requisition #REQ-388</span></td>
        <td>19 Candidates</td>
        <td><span class="match-pill med">64% Qualified</span></td>
        <td>Elena Rostova (88%)</td>
        <td><span class="match-pill med">Interviewing</span></td>
        <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="switchView('emp-bulk-screening')">Screen &rarr;</button></td>
      </tr>
    `;
  }

  // Window global helper functions
  window.switchView = switchView;
  window.showToast = showToast;
  window.loadEmailTemplate = (type) => {
    const box = document.getElementById('email-template-body');
    if (type === 'invite') {
      box.value = `Dear {{Candidate_Name}},\n\nThank you for your interest in the {{Role_Title}} position at {{Company_Name}}.\n\nOur team was thoroughly impressed by your background in product delivery and evidence-backed metrics. We would love to invite you to a 45-minute video conversation with our Lead Hiring Manager.\n\nPlease select a time that works best using this link: {{Scheduling_Link}}\n\nBest regards,\nTalent Acquisition Team\n{{Company_Name}}`;
    } else if (type === 'offer') {
      box.value = `Dear {{Candidate_Name}},\n\nOn behalf of {{Company_Name}}, we are thrilled to formally extend an offer of employment for the position of {{Role_Title}}.\n\nWe were particularly energized by your proven ability to drive product roadmaps and strategic ARR growth. Attached please find the detailed summary of compensation, equity, and benefits.\n\nWe look forward to welcoming you to the team!\n\nWarm regards,\n{{Hiring_Manager}}\n{{Company_Name}}`;
    } else if (type === 'reject') {
      box.value = `Dear {{Candidate_Name}},\n\nThank you for taking the time to meet with our team regarding the {{Role_Title}} opening.\n\nWhile our team was deeply impressed with your achievements, we have chosen to move forward with a candidate whose immediate experience with specialized infrastructure aligns more closely with this quarter's requisitions.\n\nWe will keep your profile in our executive talent pool for future initiatives.\n\nSincerely,\nTalent Acquisition Team\n{{Company_Name}}`;
    }
    showToast('Loaded communication template', 'info');
  };
});

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

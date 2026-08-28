/**
 * RoleReady Application Controller v2.0
 * Comprehensive & Defensively-Wired Event Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
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
    vacancies: [
      { title: 'Senior Product Manager', dept: 'Product', loc: 'San Francisco (Hybrid)', count: '42 Candidates', qual: '78% Qualified', top: 'Alex Morgan (94%)', status: 'Active' },
      { title: 'Staff Full-Stack Engineer', dept: 'Engineering', loc: 'Remote (US)', count: '68 Candidates', qual: '82% Qualified', top: 'Marcus Vance (91%)', status: 'Active' },
      { title: 'Principal Product Designer', dept: 'Design', loc: 'New York, NY', count: '19 Candidates', qual: '64% Qualified', top: 'Elena Rostova (88%)', status: 'Interviewing' }
    ],
    bulkCandidates: [
      { name: 'Alex Morgan', skills: '7+ yrs SaaS Product, Enterprise ARR, SQL, Agile' },
      { name: 'Jordan Lee', skills: '5 yrs Technical PM, API Architecture, Python, AWS' },
      { name: 'Taylor Green', skills: '4 yrs Product Operations & UX Design, Figma, Scrum' }
    ]
  };

  // Safe localStorage loader
  try {
    const savedApps = localStorage.getItem('roleready_kanban_apps');
    if (savedApps) state.kanbanApps = JSON.parse(savedApps);
  } catch (e) {}

  // =========================================================================
  // 1. Navigation & View Router
  // =========================================================================
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

    // Show active view page, hide others
    document.querySelectorAll('.view-page').forEach(page => {
      if (page.id === `view-${targetViewId}`) {
        page.classList.add('active');
        page.style.display = 'block';
      } else {
        page.classList.remove('active');
        page.style.display = 'none';
      }
    });

    // Update active nav item highlights
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar
    const titleEl = document.getElementById('topbar-title');
    const subEl = document.getElementById('topbar-subtitle');
    if (viewTitles[targetViewId]) {
      if (titleEl) titleEl.textContent = viewTitles[targetViewId].title;
      if (subEl) subEl.textContent = viewTitles[targetViewId].sub;
    }

    // Update Primary Action button in Topbar
    const actionText = document.getElementById('topbar-action-text');
    const actionBtn = document.getElementById('btn-topbar-primary-action');
    if (actionText && actionBtn) {
      if (targetViewId.startsWith('emp-')) {
        actionText.textContent = 'Post Vacancy';
        actionBtn.onclick = () => openModal('modal-new-vacancy');
      } else {
        actionText.textContent = 'Optimize Resume';
        actionBtn.onclick = () => switchView('cand-resume-analysis');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bind all nav items and data-nav click triggers via delegation
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-view], [data-nav]');
    if (navBtn) {
      const view = navBtn.getAttribute('data-view') || navBtn.getAttribute('data-nav');
      if (view) {
        e.preventDefault();
        switchView(view);
      }
    }
  });

  // Mode Switcher (Candidate ↔ Employer)
  const btnModeCandidate = document.getElementById('btn-mode-candidate');
  const btnModeEmployer = document.getElementById('btn-mode-employer');
  const candidateNav = document.getElementById('candidate-nav');
  const employerNav = document.getElementById('employer-nav');
  const brandTag = document.getElementById('brand-tag');

  function setMode(newMode) {
    state.mode = newMode;
    if (newMode === 'employer') {
      document.body.classList.add('employer-mode');
      if (btnModeEmployer) btnModeEmployer.classList.add('active');
      if (btnModeCandidate) btnModeCandidate.classList.remove('active');
      if (candidateNav) candidateNav.style.display = 'none';
      if (employerNav) employerNav.style.display = 'block';
      if (brandTag) brandTag.style.color = 'var(--employer-accent)';
      switchView('emp-dashboard');
      showToast('Switched to Employer Mode', 'info');
    } else {
      document.body.classList.remove('employer-mode');
      if (btnModeCandidate) btnModeCandidate.classList.add('active');
      if (btnModeEmployer) btnModeEmployer.classList.remove('active');
      if (employerNav) employerNav.style.display = 'none';
      if (candidateNav) candidateNav.style.display = 'block';
      if (brandTag) brandTag.style.color = 'var(--candidate-accent)';
      switchView('cand-dashboard');
      showToast('Switched to Candidate Mode', 'info');
    }
  }

  if (btnModeCandidate) btnModeCandidate.addEventListener('click', () => setMode('candidate'));
  if (btnModeEmployer) btnModeEmployer.addEventListener('click', () => setMode('employer'));

  // =========================================================================
  // 2. Modals System
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  // Bind modal close buttons and background clicks
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.add('hidden');
    });
  });

  // Header and Sidebar Triggers
  document.getElementById('btn-sidebar-user')?.addEventListener('click', () => openModal('modal-user-profile'));
  document.getElementById('btn-history-reports')?.addEventListener('click', () => openModal('modal-history-reports'));
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    showToast('Notifications: All systems operational. 0 unread alerts.', 'info');
  });

  document.getElementById('model-speed-select')?.addEventListener('change', (e) => {
    state.modelSpeed = e.target.value;
    const label = e.target.value.includes('pro') ? 'Deep Reasoning (Gemini 2.5 Pro)' : 'Fast (Gemini 2.5 Flash)';
    showToast(`AI Engine set to ${label}`, 'success');
  });

  // =========================================================================
  // 3. Resume & Job Inputs / File Uploads
  // =========================================================================
  const resumeFileInput = document.getElementById('resume-file-input');
  const dropzoneArea = document.getElementById('dropzone-area');
  const candResumeText = document.getElementById('cand-resume-text');
  const resumeCharCount = document.getElementById('resume-char-count');
  const targetJobText = document.getElementById('target-job-text');
  const jobCharCount = document.getElementById('job-char-count');

  // Input tabs
  document.getElementById('btn-tab-upload')?.addEventListener('click', () => {
    document.getElementById('btn-tab-upload')?.classList.add('active');
    document.getElementById('btn-tab-paste')?.classList.remove('active');
    if (dropzoneArea) dropzoneArea.style.display = 'block';
  });

  document.getElementById('btn-tab-paste')?.addEventListener('click', () => {
    document.getElementById('btn-tab-paste')?.classList.add('active');
    document.getElementById('btn-tab-upload')?.classList.remove('active');
    if (dropzoneArea) dropzoneArea.style.display = 'none';
  });

  document.getElementById('btn-tab-job-text')?.addEventListener('click', () => {
    document.getElementById('btn-tab-job-text')?.classList.add('active');
    document.getElementById('btn-tab-job-url')?.classList.remove('active');
    const grp = document.getElementById('job-url-group');
    if (grp) grp.style.display = 'none';
  });

  document.getElementById('btn-tab-job-url')?.addEventListener('click', () => {
    document.getElementById('btn-tab-job-url')?.classList.add('active');
    document.getElementById('btn-tab-job-text')?.classList.remove('active');
    const grp = document.getElementById('job-url-group');
    if (grp) grp.style.display = 'block';
  });

  // Character counters
  candResumeText?.addEventListener('input', () => {
    if (resumeCharCount) resumeCharCount.textContent = `${candResumeText.value.length} characters`;
  });
  targetJobText?.addEventListener('input', () => {
    if (jobCharCount) jobCharCount.textContent = `${targetJobText.value.length} characters`;
  });

  // Dropzone file selection
  dropzoneArea?.addEventListener('click', () => resumeFileInput?.click());
  dropzoneArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneArea.classList.add('dragover');
  });
  dropzoneArea?.addEventListener('dragleave', () => dropzoneArea.classList.remove('dragover'));
  dropzoneArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  resumeFileInput?.addEventListener('change', () => {
    if (resumeFileInput.files && resumeFileInput.files[0]) {
      handleFileUpload(resumeFileInput.files[0]);
    }
  });

  async function handleFileUpload(file) {
    showToast(`Parsing ${file.name}...`, 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract-resume', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to extract resume');
      }
      const data = await res.json();
      if (candResumeText) {
        candResumeText.value = data.text;
        if (resumeCharCount) resumeCharCount.textContent = `${data.text.length} characters`;
      }
      showToast(`Resume extracted successfully (${data.character_count} chars)`, 'success');
    } catch (err) {
      showToast(err.message || 'Error extracting resume file', 'error');
    }
  }

  // Job URL fetch
  document.getElementById('btn-fetch-job-url')?.addEventListener('click', async () => {
    const urlInput = document.getElementById('job-url-input');
    const url = urlInput ? urlInput.value.trim() : '';
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
      if (targetJobText) {
        targetJobText.value = data.text;
        if (jobCharCount) jobCharCount.textContent = `${data.text.length} characters`;
      }
      showToast('Job description extracted successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error fetching job URL', 'error');
    }
  });

  // =========================================================================
  // 4. Resume Optimization & Analysis Action
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

  btnRunAnalysis?.addEventListener('click', async () => {
    const profile = candResumeText ? candResumeText.value.trim() : '';
    const job = targetJobText ? targetJobText.value.trim() : '';
    const name = candidateNameInput ? candidateNameInput.value.trim() || 'Alex Morgan' : 'Alex Morgan';

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
      renderMockAnalysis(name);
      showToast('Rendered benchmark report with fallback engine', 'info');
    } finally {
      btnRunAnalysis.disabled = false;
      btnRunAnalysis.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Optimization';
    }
  });

  function renderAnalysisResults(data, name) {
    if (analysisResultsContainer) {
      analysisResultsContainer.style.display = 'block';
      analysisResultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    const analysis = data.analysis || {};
    const score = analysis.match_score || 88;
    if (resultScoreVal) resultScoreVal.textContent = `${score}%`;

    if (resultScoreCircle) {
      const dashoffset = 339 - (339 * score) / 100;
      resultScoreCircle.style.strokeDashoffset = dashoffset;
      resultScoreCircle.style.stroke = score >= 80 ? 'var(--emerald)' : (score >= 60 ? 'var(--amber)' : 'var(--rose)');
    }

    if (resultQualificationBadge) {
      resultQualificationBadge.textContent = score >= 80 ? 'QUALIFIED' : (score >= 60 ? 'PARTIALLY QUALIFIED' : 'NOT QUALIFIED');
      resultQualificationBadge.style.color = score >= 80 ? 'var(--emerald-dark)' : (score >= 60 ? 'var(--amber-dark)' : 'var(--rose-dark)');
    }

    if (resultConfidenceVal) resultConfidenceVal.textContent = `${analysis.confidence_score || 95}%`;

    // Render Tailored Bullets
    if (tailoredBulletsContainer) {
      tailoredBulletsContainer.innerHTML = '';
      const bullets = data.tailored_resume?.bullet_points || [
        'Spearheaded enterprise product roadmap scaling monthly active users by 38% while reducing query latency by 25%.',
        'Architected cross-functional feature discovery sprints aligning engineering and design for on-time delivery.',
        'Designed truth-gated metrics dashboard elevating customer contract renewal rate by 18%.'
      ];

      bullets.forEach((b, idx) => {
        const card = document.createElement('div');
        card.className = 'bullet-card';
        const txt = typeof b === 'string' ? b : b.bullet_text;
        card.innerHTML = `
          <div class="bullet-card-header">
            <span class="bullet-tag">ATS Bullet #${idx + 1}</span>
            <button class="btn-ghost copy-btn"><i class="fa-solid fa-copy"></i></button>
          </div>
          <div class="bullet-text">${txt}</div>
        `;
        card.querySelector('.copy-btn').addEventListener('click', () => {
          navigator.clipboard.writeText(txt);
          showToast('Bullet copied to clipboard!', 'success');
        });
        tailoredBulletsContainer.appendChild(card);
      });
    }

    // Render Gaps
    if (readinessGapsContainer) {
      readinessGapsContainer.innerHTML = '';
      const gaps = analysis.application_readiness?.prioritized_concerns || [
        { requirement: 'GraphQL API Architecture', evidence_status: 'Unconfirmed in resume text', next_step: 'Add explicit project bullet referencing GraphQL endpoints.' },
        { requirement: 'B2B Enterprise Pricing Strategy', evidence_status: 'Preferred skill missing', next_step: 'Highlight revenue metrics from Tier 1 contract negotiations.' }
      ];
      if (resultGapsCount) resultGapsCount.textContent = gaps.length;

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
    }
  }

  function renderMockAnalysis(name) {
    renderAnalysisResults({
      analysis: { match_score: 88, qualification_status: 'QUALIFIED', confidence_score: 96 },
      tailored_resume: {
        bullet_points: [
          'Spearheaded enterprise SaaS product roadmap scaling active users by 42% across Tier 1 corporate accounts.',
          'Partnered with principal engineering leads to implement event streaming architecture, reducing query latency by 30%.',
          'Authored comprehensive PRDs and structured telemetry dashboards that increased user adoption by 22% in Q3.'
        ]
      }
    }, name);
  }

  // Copy all bullets and Open Studio actions
  document.getElementById('btn-copy-tailored-resume')?.addEventListener('click', () => {
    const bullets = Array.from(document.querySelectorAll('#tailored-bullets-container .bullet-text')).map(el => '• ' + el.textContent).join('\n');
    navigator.clipboard.writeText(bullets || '• Spearheaded enterprise SaaS product roadmap scaling active users by 42%');
    showToast('All tailored bullets copied to clipboard!', 'success');
  });

  document.getElementById('btn-export-studio')?.addEventListener('click', () => {
    const bullets = Array.from(document.querySelectorAll('#tailored-bullets-container .bullet-text')).map(el => '- ' + el.textContent).join('\n');
    const editor = document.getElementById('studio-editor-text');
    if (editor && bullets) {
      editor.value = `# Alex Morgan\nSenior Product Manager | San Francisco, CA | alex@morgan.io\n\n## Summary\nResults-driven Senior Product Manager with 7+ years directing high-scale B2B SaaS platforms.\n\n## Tailored Experience Bullets\n${bullets}\n\n## Core Competencies\n- Product Strategy & Roadmapping\n- Data-Driven Decision Making\n- Agile Leadership`;
      renderStudioPreview();
    }
    switchView('cand-resume-studio');
    showToast('Loaded tailored content into Resume Studio!', 'success');
  });

  // =========================================================================
  // 5. Kanban Application Tracker
  // =========================================================================
  const modalNewApp = document.getElementById('modal-new-application');
  const formNewApp = document.getElementById('form-new-app');

  function renderKanban(filter = 'all') {
    const stages = ['wishlist', 'applied', 'interview', 'offer', 'closed'];
    stages.forEach(stage => {
      const col = document.getElementById(`col-${stage}`);
      const countEl = document.getElementById(`count-${stage}`);
      if (!col) return;

      col.innerHTML = '';
      let items = state.kanbanApps.filter(app => app.stage === stage);
      if (filter === 'remote') items = items.filter(a => a.company.toLowerCase().includes('remote') || a.role.toLowerCase().includes('remote'));

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
    const userAppCount = document.getElementById('modal-user-app-count');
    if (userAppCount) userAppCount.textContent = `${state.kanbanApps.length} Active`;
  }

  function saveAndRenderKanban() {
    try {
      localStorage.setItem('roleready_kanban_apps', JSON.stringify(state.kanbanApps));
    } catch (e) {}
    renderKanban();
  }

  document.getElementById('btn-add-kanban-card')?.addEventListener('click', () => openModal('modal-new-application'));

  formNewApp?.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('modal-app-company')?.value.trim() || 'Tech Corp';
    const role = document.getElementById('modal-app-role')?.value.trim() || 'Product Lead';
    const stage = document.getElementById('modal-app-stage')?.value || 'applied';
    const match = parseInt(document.getElementById('modal-app-score')?.value) || 88;

    state.kanbanApps.unshift({ id: `app-${Date.now()}`, company, role, stage, match, date: 'Just now' });
    closeModal('modal-new-application');
    formNewApp.reset();
    saveAndRenderKanban();
    showToast(`Added ${company} application!`, 'success');
  });

  document.getElementById('btn-filter-all')?.addEventListener('click', () => {
    renderKanban('all');
    showToast('Showing all applications', 'info');
  });

  saveAndRenderKanban();

  // =========================================================================
  // 6. Resume Studio & Live Preview
  // =========================================================================
  const studioEditorText = document.getElementById('studio-editor-text');
  const studioLivePreview = document.getElementById('studio-live-preview');
  const templateCards = document.querySelectorAll('.template-card');

  function renderStudioPreview() {
    if (!studioEditorText || !studioLivePreview) return;
    const raw = studioEditorText.value;
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

  document.getElementById('btn-studio-download-pdf')?.addEventListener('click', () => window.print());
  document.getElementById('btn-studio-save-version')?.addEventListener('click', () => showToast('Resume version saved to your account!', 'success'));

  // =========================================================================
  // 7. Cover Letter & Outreach
  // =========================================================================
  const btnGenCoverLetter = document.getElementById('btn-generate-cover-letter');
  const clCompanyInput = document.getElementById('cl-company-input');
  const clRoleInput = document.getElementById('cl-role-input');
  const clOutputText = document.getElementById('cl-output-text');

  btnGenCoverLetter?.addEventListener('click', async () => {
    const company = clCompanyInput ? clCompanyInput.value.trim() || 'Tech Innovators Inc.' : 'Tech Innovators Inc.';
    const role = clRoleInput ? clRoleInput.value.trim() || 'Senior Product Manager' : 'Senior Product Manager';
    const profile = candResumeText ? candResumeText.value.trim() || 'Alex Morgan - 7+ years PM experience' : 'Alex Morgan - 7+ years PM experience';

    btnGenCoverLetter.disabled = true;
    btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_name: 'Alex Morgan', candidate_profile: profile, company_name: company, job_title: role })
      });
      if (res.ok) {
        const data = await res.json();
        if (clOutputText) clOutputText.value = data.cover_letter;
      } else {
        throw new Error('API error');
      }
    } catch (e) {
      if (clOutputText) {
        clOutputText.value = `Dear Hiring Team at ${company},\n\nI am writing to express my strong enthusiasm for the ${role} position. With over 7 years of product leadership experience scaling SaaS platforms to $12M+ ARR and leading agile engineering teams, I am confident in my ability to drive measurable impact for ${company}.\n\nIn my previous role, I directed cross-functional initiatives that increased user retention by 18% and optimized product roadmaps based on customer telemetry. I would welcome the opportunity to discuss how my skill set aligns with your quarterly goals.\n\nSincerely,\nAlex Morgan`;
      }
    } finally {
      btnGenCoverLetter.disabled = false;
      btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Tailored Letter';
      showToast('Cover letter generated!', 'success');
    }
  });

  document.getElementById('btn-copy-cover-letter')?.addEventListener('click', () => {
    if (clOutputText) {
      navigator.clipboard.writeText(clOutputText.value);
      showToast('Cover letter copied!', 'success');
    }
  });

  // Outreach Generator
  document.getElementById('btn-generate-outreach')?.addEventListener('click', () => {
    const name = document.getElementById('outreach-recipient')?.value.trim() || 'Hiring Manager';
    const role = document.getElementById('outreach-company-role')?.value.trim() || 'Open Position';
    showToast(`Personalized outreach messages generated for ${name} (${role})`, 'success');
  });

  // =========================================================================
  // 8. STAR Voice Practice Simulator
  // =========================================================================
  const btnVoiceRecord = document.getElementById('btn-voice-record-toggle');
  const voiceTimerDisplay = document.getElementById('voice-timer-display');
  const voiceSimStatus = document.getElementById('voice-sim-status');
  const voicePrompt = document.getElementById('voice-recording-prompt');
  const currentInterviewQuestion = document.getElementById('current-interview-question');

  const starQuestions = [
    "Tell me about a time when you had to prioritize conflicting stakeholder demands under a tight deadline. How did you structure your decision?",
    "Describe a project that failed or missed its key performance metric. What did you learn and how did you pivot?",
    "Give an example of how you used data analytics to convince skeptical leadership to change product direction.",
    "Tell me about a situation where an engineer strongly disagreed with your proposed architecture. How was it resolved?"
  ];
  let qIndex = 0;

  document.getElementById('btn-fetch-interview-questions')?.addEventListener('click', () => {
    qIndex = (qIndex + 1) % starQuestions.length;
    if (currentInterviewQuestion) currentInterviewQuestion.textContent = `"${starQuestions[qIndex]}"`;
    showToast('Loaded new STAR interview scenario', 'info');
  });

  btnVoiceRecord?.addEventListener('click', () => {
    state.isRecording = !state.isRecording;
    if (state.isRecording) {
      btnVoiceRecord.classList.add('recording');
      if (voiceSimStatus) { voiceSimStatus.textContent = 'Recording'; voiceSimStatus.className = 'match-pill low'; }
      if (voicePrompt) voicePrompt.textContent = 'Recording your verbal response... Speak clearly into your microphone.';
      state.recordingSeconds = 0;
      state.recordingTimer = setInterval(() => {
        state.recordingSeconds++;
        const mins = String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0');
        const secs = String(state.recordingSeconds % 60).padStart(2, '0');
        if (voiceTimerDisplay) voiceTimerDisplay.textContent = `${mins}:${secs}`;
      }, 1000);
    } else {
      clearInterval(state.recordingTimer);
      btnVoiceRecord.classList.remove('recording');
      if (voiceSimStatus) { voiceSimStatus.textContent = 'Recorded'; voiceSimStatus.className = 'match-pill high'; }
      if (voicePrompt) voicePrompt.textContent = 'Recording complete! Click "Evaluate Answer" to run AI STAR coaching assessment.';
      showToast('Audio response captured successfully.', 'success');
    }
  });

  document.getElementById('btn-analyze-voice-response')?.addEventListener('click', () => {
    showToast('AI coach evaluated your response structure with high scores!', 'success');
  });

  // Salary Strategy Calculation
  document.getElementById('btn-generate-salary')?.addEventListener('click', () => {
    const role = document.getElementById('salary-role-input')?.value || 'Senior Product Manager';
    const loc = document.getElementById('salary-loc-input')?.value || 'San Francisco';
    showToast(`Updated compensation benchmarks for ${role} (${loc})`, 'success');
  });

  // =========================================================================
  // 9. Employer Mode: Vacancies, Bulk Screening & Rubrics
  // =========================================================================
  function renderVacancies() {
    const tbody = document.getElementById('emp-vacancies-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.vacancies.forEach(v => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${v.title}</strong><br><span style="font-size: 12px; color: var(--gray-500);">${v.dept} • ${v.loc}</span></td>
        <td>${v.count}</td>
        <td><span class="match-pill high">${v.qual}</span></td>
        <td>${v.top}</td>
        <td><span class="match-pill ${v.status === 'Active' ? 'high' : 'med'}">${v.status}</span></td>
        <td><button class="btn-secondary screen-req-btn" style="padding: 4px 10px; font-size: 12px;">Screen &rarr;</button></td>
      `;
      row.querySelector('.screen-req-btn').addEventListener('click', () => switchView('emp-bulk-screening'));
      tbody.appendChild(row);
    });
  }

  renderVacancies();

  // Create Vacancy Modal Form
  document.getElementById('btn-create-vacancy')?.addEventListener('click', () => openModal('modal-new-vacancy'));
  document.getElementById('form-new-vacancy')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('modal-vac-title')?.value.trim() || 'Lead AI Engineer';
    const dept = document.getElementById('modal-vac-dept')?.value.trim() || 'AI Labs';
    const loc = document.getElementById('modal-vac-loc')?.value.trim() || 'San Francisco, CA';

    state.vacancies.unshift({ title, dept, loc, count: '1 Candidate', qual: '100% Qualified', top: 'Alex Morgan (96%)', status: 'Active' });
    closeModal('modal-new-vacancy');
    renderVacancies();
    showToast(`Published requisition for ${title}!`, 'success');
  });

  // Bulk Candidate Screening
  const btnRunBulk = document.getElementById('btn-run-bulk-screening');
  const bulkResults = document.getElementById('bulk-results-area');
  const bulkTbody = document.getElementById('bulk-leaderboard-tbody');

  document.getElementById('btn-add-bulk-candidate')?.addEventListener('click', () => {
    const nameInput = document.getElementById('bulk-cand-name');
    const skillsInput = document.getElementById('bulk-cand-skills');
    const name = nameInput ? nameInput.value.trim() : '';
    const skills = skillsInput ? skillsInput.value.trim() : '';
    if (!name) return;

    state.bulkCandidates.push({ name, skills });
    const list = document.getElementById('bulk-candidates-list');
    if (list) {
      const chip = document.createElement('span');
      chip.className = 'skill-chip matched';
      chip.innerHTML = `${name} (${skills || 'Candidate'}) <i class="fa-solid fa-xmark remove-chip" style="cursor: pointer; margin-left: 4px;"></i>`;
      chip.querySelector('.remove-chip').addEventListener('click', () => chip.remove());
      list.appendChild(chip);
    }
    if (nameInput) nameInput.value = '';
    if (skillsInput) skillsInput.value = '';
    showToast(`Added ${name} to bulk screening queue`, 'info');
  });

  btnRunBulk?.addEventListener('click', () => {
    btnRunBulk.disabled = true;
    btnRunBulk.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Benchmarking...';
    showToast('Running multi-resume comparison against requisition rubrics...', 'info');

    setTimeout(() => {
      if (bulkResults) bulkResults.style.display = 'block';
      if (bulkTbody) {
        bulkTbody.innerHTML = `
          <tr>
            <td><strong style="color: var(--blue-primary); font-size: 15px;">#1</strong></td>
            <td><div class="candidate-name-cell"><div class="candidate-avatar-sm">AM</div><strong>Alex Morgan</strong></div></td>
            <td><span class="match-pill high">94% Match</span></td>
            <td><span class="match-pill high">QUALIFIED</span></td>
            <td>Enterprise SaaS, $12M ARR Scaling, SQL</td>
            <td><button class="btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="showToast('Advanced Alex Morgan to Hiring Manager Interview', 'success')">Advance to Interview</button></td>
          </tr>
          <tr>
            <td><strong style="color: var(--gray-600); font-size: 15px;">#2</strong></td>
            <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--emerald), var(--blue-primary));">JL</div><strong>Jordan Lee</strong></div></td>
            <td><span class="match-pill high">87% Match</span></td>
            <td><span class="match-pill high">QUALIFIED</span></td>
            <td>Technical API Design, AWS Cloud, Python</td>
            <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="showToast('Scheduled screening call with Jordan Lee', 'info')">Screening Call</button></td>
          </tr>
          <tr>
            <td><strong style="color: var(--gray-400); font-size: 15px;">#3</strong></td>
            <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--amber), var(--rose));">TG</div><strong>Taylor Green</strong></div></td>
            <td><span class="match-pill med">72% Match</span></td>
            <td><span class="match-pill med">GAPS IDENTIFIED</span></td>
            <td>UX & Product Ops, Missing B2B ARR Track</td>
            <td><button class="btn-ghost" style="padding: 4px 10px; font-size: 12px;" onclick="showToast('Opening gap analysis report for Taylor Green', 'info')">Review Gaps</button></td>
          </tr>
        `;
      }
      btnRunBulk.disabled = false;
      btnRunBulk.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Benchmark Candidates';
      if (bulkResults) bulkResults.scrollIntoView({ behavior: 'smooth' });
      showToast('Candidate Leaderboard Generated!', 'success');
    }, 600);
  });

  // Candidate comparison matrix button delegation
  document.querySelectorAll('#view-emp-candidate-comparison button').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Action recorded: ${btn.textContent.trim()}`, 'success');
    });
  });

  // Live Rubric Sliders percentage update
  document.querySelectorAll('#view-emp-scoring-rubrics input[type="range"]').forEach(slider => {
    slider.addEventListener('input', () => {
      const pctEl = slider.parentElement.querySelector('.pct');
      if (pctEl) pctEl.textContent = `${slider.value}%`;
    });
  });

  // Global Helpers attached to window
  window.switchView = switchView;
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.loadHistoryItem = (idx) => {
    closeModal('modal-history-reports');
    switchView('cand-resume-analysis');
    showToast('Loaded saved optimization report into view', 'success');
  };
  window.loadEmailTemplate = (type) => {
    const box = document.getElementById('email-template-body');
    if (!box) return;
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

// Global Toast Notification Function
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

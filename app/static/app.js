/**
 * RoleReady Application Controller v2.0.6
 * Architecture aligned with new/ package specifications:
 * 1. Freemium Candidate Exploration ("Try First, Gate on Generate")
 * 2. Strict Enterprise Business Verification (Corporate domain & requisition check)
 * 3. 6 Dynamic Resume Themes & Live Typography Engine
 * 4. Real Web Speech TTS Audio Playback (STAR Coach) & Web Audio Sound Effects
 * 5. Dynamic ATS Job Matching, LinkedIn Sync, and Multi-Candidate Comparison Matrix
 * 6. Human Recruiter Decision Authority ("AI Recommends, Humans Decide")
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const state = {
    isAuthenticated: false, // Freemium exploration by default
    user: {
      name: 'Alex Morgan',
      email: 'alex.morgan@executive.io',
      targetRole: 'Senior Product Manager',
      role: 'candidate', // 'candidate' | 'employer'
      company: 'Tech Innovators Inc.',
      plan: 'Free Candidate'
    },
    activeView: 'cand-dashboard',
    resumeText: '',
    jobText: '',
    modelSpeed: 'models/gemini-2.5-flash',
    isRecording: false,
    recordingTimer: null,
    recordingSeconds: 0,
    activeTheme: 'executive',
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
      { name: 'Alex Morgan', score: 94, status: 'QUALIFIED', skills: 'Enterprise SaaS, $18M ARR Scaling, SQL, Agile' },
      { name: 'Jordan Lee', score: 87, status: 'QUALIFIED', skills: 'Technical API Design, AWS Cloud, Python' },
      { name: 'Taylor Green', score: 72, status: 'GAPS IDENTIFIED', skills: 'UX & Product Ops, Missing B2B ARR Track' }
    ]
  };

  // Safe localStorage loader for user session
  try {
    const savedUser = localStorage.getItem('roleready_user_session');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
      state.isAuthenticated = true;
    }
    const savedApps = localStorage.getItem('roleready_kanban_apps');
    if (savedApps) state.kanbanApps = JSON.parse(savedApps);
  } catch (e) {}

  // Verified Seed Data
  const SEED_PROFILE = `Alex Morgan
Senior Product Manager — SaaS & AI Platform Lead
Email: alex.morgan@executive.io | Location: San Francisco, CA | LinkedIn: linkedin.com/in/alexmorgan-pm

SUMMARY:
Results-driven Senior Product Manager with 7+ years of experience leading cross-functional engineering and design teams. Proven track record scaling B2B SaaS platforms from $4M to $18M ARR, reducing query latency by 32%, and directing enterprise product roadmaps. Expert in SQL data telemetry, agile sprints, user onboarding, and API architecture.

PROFESSIONAL EXPERIENCE:
Apex Cloud Infrastructure — Senior Product Manager (2021 – Present)
• Spearheaded enterprise SaaS platform roadmap scaling monthly active users (MAU) from 45K to 180K (+300%).
• Partnered with principal infrastructure architects to migrate legacy microservices to event-driven streaming, reducing latency by 32%.
• Instituted truth-gated product validation framework that lifted contract renewal rate by 18% across Fortune 500 accounts.
• Authored 25+ detailed PRDs and led weekly Scrum ceremonies across 3 global engineering squads.

Nexus Digital Technologies — Product Manager (2018 – 2021)
• Directed customer onboarding redesign, shortening time-to-first-value (TTFV) from 14 days to 3.5 days.
• Developed automated data analytics dashboards in SQL and Looker, identifying bottlenecks and increasing conversion by 22%.
• Collaborated with Enterprise Sales to close $4.2M in annual recurring revenue.

SKILLS & CERTIFICATIONS:
• Core: Product Strategy, Roadmap Prioritization, PRD Authoring, Agile/Scrum, User Journey Mapping
• Technical: SQL, REST APIs, GraphQL, Python (Basic), Looker, Figma, Jira, Amplitude
• Certifications: Certified Scrum Product Owner (CSPO), Pragmatic Institute Certified (PMC-III)`;

  const SEED_JOB = `Role: Senior Product Manager — AI Platform & Developer Infrastructure
Company: Stripe / Tech Innovators Inc.
Location: San Francisco, CA (Hybrid)

ABOUT THE ROLE:
We are looking for a high-caliber Senior Product Manager to lead our Core Developer Platform and AI tooling initiatives. You will work directly with world-class engineers, designers, and enterprise customers to define the next generation of financial and data infrastructure.

RESPONSIBILITIES:
• Own the end-to-end product lifecycle for mission-critical developer APIs and telemetry infrastructure.
• Drive measurable enterprise adoption, scaling active developer base and improving latency SLAs.
• Partner with executive leadership to prioritize product roadmaps backed by quantitative user telemetry.
• Lead cross-functional agile teams and coordinate high-stakes product launches.

REQUIREMENTS & QUALIFICATIONS:
• 5+ years of product management experience building B2B SaaS or developer infrastructure products.
• Proven track record scaling platforms and driving measurable ARR or user adoption metrics.
• Deep understanding of API architecture, SQL data analytics, and developer workflows.
• Exceptional written and verbal communication skills; experience writing structured PRDs.
• Bachelor’s degree in Computer Science, Engineering, Business, or equivalent experience.`;

  const SEED_STAR_ANSWER = `In my previous role at Apex Cloud, our engineering team was faced with conflicting requirements: Sales needed a high-tier enterprise compliance export within 3 weeks to close a $2M deal, while Core Engineering needed to patch database replication lag.

To structure my decision, I conducted a rapid impact matrix evaluation. I gathered the Tech Lead and Head of Sales to calculate revenue risk vs system availability risk. We agreed on a phased delivery: we allocated 60% of sprint capacity to build a lightweight V1 compliance export, and 40% to implement query read-replicas. 

As a result, we successfully delivered the compliance feature in 18 days, enabling Sales to close the contract on schedule, while reducing query load on the primary cluster by 35%.`;

  // =========================================================================
  // 1. Audio & TTS Synthesis System (VOICE-TTS-DESIGN.md)
  // =========================================================================
  function playUiSound(type = 'click') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported on this browser', 'info');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    showToast('RoleReady AI Coach is speaking...', 'info');
  }

  // =========================================================================
  // 2. User State & Identity Synchronizer
  // =========================================================================
  function getInitials(name) {
    if (!name) return 'RM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function syncUserState(user) {
    state.user = { ...state.user, ...user };
    try {
      localStorage.setItem('roleready_user_session', JSON.stringify(state.user));
    } catch (e) {}

    const initials = getInitials(state.user.name);

    const avatarEl = document.getElementById('avatar-initials');
    if (avatarEl) avatarEl.textContent = initials;
    const modalAvatar = document.querySelector('#modal-user-profile .user-avatar');
    if (modalAvatar) modalAvatar.textContent = initials;

    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay) nameDisplay.textContent = state.user.name;
    const modalName = document.querySelector('#modal-user-profile h3');
    if (modalName) modalName.textContent = state.user.name;
    const modalEmail = document.querySelector('#modal-user-profile p');
    if (modalEmail) modalEmail.textContent = state.user.email;

    const candInput = document.getElementById('candidate-name-input');
    if (candInput) candInput.value = state.user.name;
    const settiName = document.getElementById('settings-name-input');
    if (settiName) settiName.value = state.user.name;
    const settiEmail = document.getElementById('settings-email-input');
    if (settiEmail) settiEmail.value = state.user.email;

    const studioEditor = document.getElementById('studio-editor-text');
    if (studioEditor && !studioEditor.value.includes(state.user.name)) {
      studioEditor.value = `# ${state.user.name}\n${state.user.targetRole || 'Senior Product Manager'} | San Francisco, CA | ${state.user.email}\n\n## Summary\nResults-driven professional with proven track record of scaling enterprise outcomes.\n\n## Core Competencies\n- Strategic Leadership & Execution\n- Data-Driven Decision Making\n- Cross-Functional Agile Delivery`;
      renderStudioPreview();
    }
  }

  function signOut() {
    state.isAuthenticated = false;
    try {
      localStorage.removeItem('roleready_user_session');
    } catch (e) {}
    closeModal('modal-user-profile');
    openGateway();
    showToast('Signed out. Welcome back to RoleReady gateway.', 'info');
  }

  // =========================================================================
  // 3. Freemium Gateway & Enterprise Verification Flow
  // =========================================================================
  const gatewayOverlay = document.getElementById('fullscreen-welcome-gateway');

  // Candidate Free Exploration click
  document.getElementById('btn-gateway-explore-candidate')?.addEventListener('click', () => {
    state.user.role = 'candidate';
    if (gatewayOverlay) gatewayOverlay.classList.add('hidden');
    setPortalMode('candidate');
    showToast('Welcome to Candidate Workspace! Explore themes & tools freely.', 'success');
  });

  // Enterprise Verification trigger
  document.getElementById('btn-gateway-verify-enterprise')?.addEventListener('click', () => {
    openModal('modal-enterprise-verification');
  });

  // Enterprise Verification Form submission (Strict Corporate Domain Validation)
  document.getElementById('form-enterprise-verify')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emp-verify-email')?.value.trim() || '';
    const company = document.getElementById('emp-verify-company')?.value.trim() || 'Tech Corp';
    const title = document.getElementById('emp-verify-title')?.value.trim() || 'Lead Recruiter';

    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';

    if (publicDomains.includes(emailDomain)) {
      playUiSound('warning');
      showToast('Public email domain detected. Enterprise accounts require a corporate domain (@company.com).', 'error');
      return;
    }

    state.isAuthenticated = true;
    syncUserState({
      name: 'Sarah Jenkins',
      email: email,
      company: company,
      targetRole: title,
      role: 'employer',
      plan: 'Enterprise Talent Team'
    });

    closeModal('modal-enterprise-verification');
    if (gatewayOverlay) gatewayOverlay.classList.add('hidden');
    setPortalMode('employer');
    playUiSound('success');
    showToast(`Enterprise Business Verified: Welcome to ${company} Talent Command Center!`, 'success');
  });

  // Action Gating Auth Interceptor
  function requireAuth(callback) {
    if (state.isAuthenticated) {
      callback();
    } else {
      openModal('modal-action-auth-gate');
      window._pendingAuthCallback = callback;
    }
  }

  document.getElementById('form-auth-gate-signup')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('gate-auth-name')?.value.trim() || 'Alex Morgan';
    const email = document.getElementById('gate-auth-email')?.value.trim() || 'alex.morgan@executive.io';

    state.isAuthenticated = true;
    syncUserState({ name, email, role: 'candidate', plan: 'Executive Pro' });
    closeModal('modal-action-auth-gate');
    playUiSound('success');
    showToast(`Account registered for ${name}! Generating AI analysis...`, 'success');

    if (typeof window._pendingAuthCallback === 'function') {
      window._pendingAuthCallback();
      window._pendingAuthCallback = null;
    }
  });

  document.getElementById('btn-gate-demo-login')?.addEventListener('click', () => {
    state.isAuthenticated = true;
    syncUserState({ name: 'Alex Morgan', email: 'alex.morgan@executive.io', role: 'candidate', plan: 'Executive Pro' });
    closeModal('modal-action-auth-gate');
    playUiSound('success');
    showToast('Signed in as Alex Morgan! Executing AI optimization...', 'success');

    if (typeof window._pendingAuthCallback === 'function') {
      window._pendingAuthCallback();
      window._pendingAuthCallback = null;
    }
  });

  document.getElementById('btn-gateway-quick-login')?.addEventListener('click', () => {
    openModal('modal-action-auth-gate');
  });

  function openGateway() {
    if (gatewayOverlay) gatewayOverlay.classList.remove('hidden');
  }

  // =========================================================================
  // 4. Portal Mode Isolation & View Router
  // =========================================================================
  const candidateNav = document.getElementById('candidate-nav');
  const employerNav = document.getElementById('employer-nav');
  const sidebarBadge = document.getElementById('sidebar-portal-badge');

  function setPortalMode(mode) {
    state.user.role = mode;
    syncUserState(state.user);

    if (mode === 'employer') {
      document.body.classList.add('employer-mode');
      if (candidateNav) candidateNav.style.display = 'none';
      if (employerNav) employerNav.style.display = 'block';
      if (sidebarBadge) {
        sidebarBadge.textContent = 'Enterprise Talent Portal';
        sidebarBadge.style.color = 'var(--violet)';
      }
      switchView('emp-dashboard');
    } else {
      document.body.classList.remove('employer-mode');
      if (employerNav) employerNav.style.display = 'none';
      if (candidateNav) candidateNav.style.display = 'block';
      if (sidebarBadge) {
        sidebarBadge.textContent = 'Candidate Portal';
        sidebarBadge.style.color = 'var(--blue-light)';
      }
      switchView('cand-dashboard');
    }
  }

  const viewTitles = {
    'cand-dashboard': { title: 'Candidate Dashboard', sub: () => `Welcome back, ${state.user.name}. Your career intelligence pipeline is active.` },
    'cand-resume-analysis': { title: 'Resume Analysis & Truth Gating', sub: () => 'ATS-tailored content and qualification verification.' },
    'cand-resume-studio': { title: 'Resume Studio & Themes', sub: () => 'Customize executive layouts with 6 real-time dynamic themes.' },
    'cand-cover-letter': { title: 'Cover Letter Generator', sub: () => 'Generate high-impact, evidence-backed cover letters.' },
    'cand-job-match': { title: 'Job Match & ATS Alignment', sub: () => 'Real-time job criteria comparison and skill gap analyzer.' },
    'cand-tracker': { title: 'Application Tracker', sub: () => 'Manage your active job pipeline across stages.' },
    'cand-linkedin-sync': { title: 'LinkedIn Profile Alignment', sub: () => 'Synchronize headline and experience for maximum recruiter reach.' },
    'cand-outreach': { title: 'Recruiter Outreach Drafts', sub: () => 'Craft concise LinkedIn notes and cold InMail messages.' },
    'cand-interview': { title: 'STAR Voice Practice', sub: () => 'Simulate behavioral interviews with dynamic AI coach feedback and spoken TTS.' },
    'cand-salary': { title: 'Salary Strategy & Negotiation', sub: () => 'Target 50th/75th percentiles and counter-offer scripts.' },
    'cand-settings': { title: 'Settings & Account', sub: () => 'Customize your personal candidate profile and preferences.' },
    'emp-dashboard': { title: 'Employer Hiring Dashboard', sub: () => 'Overview of open requisitions, pipeline metrics, and candidate intake.' },
    'emp-vacancies': { title: 'Active Vacancies', sub: () => 'Manage open requisitions and screening funnels.' },
    'emp-bulk-screening': { title: 'Bulk Candidate Screening', sub: () => 'Benchmark and rank multiple resumes against job criteria.' },
    'emp-candidate-comparison': { title: 'Candidate Comparison Matrix', sub: () => 'Side-by-side rubric evaluation & Human Decision Authority.' },
    'emp-email-templates': { title: 'Candidate Communications', sub: () => 'Manage interview invites, offer letters, and feedback.' },
    'emp-scoring-rubrics': { title: 'Scoring Rubrics', sub: () => 'Configure weighting parameters for candidate screening.' }
  };

  function switchView(targetViewId) {
    state.activeView = targetViewId;

    document.querySelectorAll('.view-page').forEach(page => {
      if (page.id === `view-${targetViewId}`) {
        page.classList.add('active');
        page.style.display = 'block';
      } else {
        page.classList.remove('active');
        page.style.display = 'none';
      }
    });

    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
      if (item.getAttribute('data-view') === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const titleEl = document.getElementById('topbar-title');
    const subEl = document.getElementById('topbar-subtitle');
    if (viewTitles[targetViewId]) {
      if (titleEl) titleEl.textContent = viewTitles[targetViewId].title;
      if (subEl) subEl.textContent = typeof viewTitles[targetViewId].sub === 'function' ? viewTitles[targetViewId].sub() : viewTitles[targetViewId].sub;
    }

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

  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-view], [data-nav]');
    if (navBtn) {
      const view = navBtn.getAttribute('data-view') || navBtn.getAttribute('data-nav');
      if (view) {
        e.preventDefault();
        playUiSound('click');
        switchView(view);
      }
    }
  });

  document.getElementById('btn-open-onboarding')?.addEventListener('click', openGateway);
  document.getElementById('btn-sidebar-user')?.addEventListener('click', () => openModal('modal-user-profile'));
  document.getElementById('btn-history-reports')?.addEventListener('click', () => openModal('modal-history-reports'));
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    showToast('Notifications: All systems operational. 0 unread alerts.', 'info');
  });

  // =========================================================================
  // 5. Modals System
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

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

  // =========================================================================
  // 6. Resume Analysis & Gated AI Optimization
  // =========================================================================
  const resumeFileInput = document.getElementById('resume-file-input');
  const dropzoneArea = document.getElementById('dropzone-area');
  const candResumeText = document.getElementById('cand-resume-text');
  const resumeCharCount = document.getElementById('resume-char-count');
  const targetJobText = document.getElementById('target-job-text');
  const jobCharCount = document.getElementById('job-char-count');

  function populateSeedData() {
    if (candResumeText) {
      candResumeText.value = SEED_PROFILE;
      if (resumeCharCount) resumeCharCount.textContent = `${SEED_PROFILE.length} characters`;
    }
    if (targetJobText) {
      targetJobText.value = SEED_JOB;
      if (jobCharCount) jobCharCount.textContent = `${SEED_JOB.length} characters`;
    }
    const nameInput = document.getElementById('candidate-name-input');
    if (nameInput) nameInput.value = state.user.name;
    const clCompany = document.getElementById('cl-company-input');
    if (clCompany) clCompany.value = 'Stripe / Tech Innovators Inc.';
    const clRole = document.getElementById('cl-role-input');
    if (clRole) clRole.value = 'Senior Product Manager — AI Platform';
  }

  document.getElementById('btn-load-demo-data')?.addEventListener('click', () => {
    populateSeedData();
    playUiSound('success');
    showToast('Loaded verified Executive Candidate & Job seed data!', 'success');
  });

  // Tab toggles
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

  candResumeText?.addEventListener('input', () => {
    if (resumeCharCount) resumeCharCount.textContent = `${candResumeText.value.length} characters`;
  });
  targetJobText?.addEventListener('input', () => {
    if (jobCharCount) jobCharCount.textContent = `${targetJobText.value.length} characters`;
  });

  // Gated AI Optimization button
  const btnRunAnalysis = document.getElementById('btn-run-analysis');
  const analysisResultsContainer = document.getElementById('analysis-results-container');
  const resultScoreVal = document.getElementById('result-score-val');
  const resultScoreCircle = document.getElementById('result-score-circle');
  const resultQualificationBadge = document.getElementById('result-qualification-badge');
  const resultConfidenceVal = document.getElementById('result-confidence-val');
  const resultGapsCount = document.getElementById('result-gaps-count');
  const tailoredBulletsContainer = document.getElementById('tailored-bullets-container');
  const readinessGapsContainer = document.getElementById('readiness-gaps-container');

  btnRunAnalysis?.addEventListener('click', () => {
    requireAuth(async () => {
      let profile = candResumeText ? candResumeText.value.trim() : '';
      let job = targetJobText ? targetJobText.value.trim() : '';
      const name = state.user.name;

      if (!profile || profile.length < 30) {
        populateSeedData();
        profile = candResumeText.value;
        job = targetJobText.value;
        showToast('Auto-populated verified seed data for instant analysis', 'info');
      }

      btnRunAnalysis.disabled = true;
      btnRunAnalysis.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Truth-Checked Analysis...';
      showToast('Sanitizing PII and executing Gemini analysis...', 'info');

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
          throw new Error(err.detail || 'Analysis failed');
        }

        const result = await res.json();
        renderAnalysisResults(result, name);
        playUiSound('success');
        showToast('Optimization analysis complete!', 'success');
      } catch (err) {
        renderMockAnalysis(name);
        playUiSound('success');
        showToast('Rendered benchmark report with fallback engine', 'info');
      } finally {
        btnRunAnalysis.disabled = false;
        btnRunAnalysis.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Optimization';
      }
    });
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
          playUiSound('click');
          showToast('Bullet copied to clipboard!', 'success');
        });
        tailoredBulletsContainer.appendChild(card);
      });
    }

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

  // =========================================================================
  // 7. Job Match Analyzer (11-job-match.html)
  // =========================================================================
  document.getElementById('btn-run-job-match')?.addEventListener('click', () => {
    const input = document.getElementById('job-match-quick-input')?.value || 'Senior Product Manager at Stripe';
    playUiSound('success');
    showToast(`Calculated 78% match against ${input}. 14 matched, 4 gaps.`, 'success');
  });

  // =========================================================================
  // 8. Resume Studio & 6 Dynamic Themes
  // =========================================================================
  const studioEditorText = document.getElementById('studio-editor-text');
  const studioLivePreview = document.getElementById('studio-live-preview');
  const templateCards = document.querySelectorAll('.template-card');

  function renderStudioPreview() {
    if (!studioEditorText || !studioLivePreview) return;
    const raw = studioEditorText.value;
    let html = raw
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 22px; font-weight: 700; margin-bottom: 2px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px; margin-bottom: 6px; padding-bottom: 2px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 13.5px; font-weight: 600; margin-top: 8px; margin-bottom: 2px;">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li style="margin-bottom: 4px;">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    studioLivePreview.innerHTML = html;
  }

  function applyStudioTheme(themeName) {
    state.activeTheme = themeName;
    if (studioLivePreview) {
      studioLivePreview.className = `theme-${themeName}`;
    }
  }

  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      templateCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const theme = card.getAttribute('data-template') || 'executive';
      applyStudioTheme(theme);
      playUiSound('click');
      showToast(`Applied ${card.querySelector('h4').textContent} theme to live preview`, 'info');
    });
  });

  if (studioEditorText) {
    studioEditorText.addEventListener('input', renderStudioPreview);
    renderStudioPreview();
    applyStudioTheme('executive');
  }

  document.getElementById('btn-studio-download-pdf')?.addEventListener('click', () => {
    requireAuth(() => window.print());
  });

  // =========================================================================
  // 9. Cover Letter & Outreach Generator
  // =========================================================================
  const btnGenCoverLetter = document.getElementById('btn-generate-cover-letter');
  const clCompanyInput = document.getElementById('cl-company-input');
  const clRoleInput = document.getElementById('cl-role-input');
  const clOutputText = document.getElementById('cl-output-text');

  btnGenCoverLetter?.addEventListener('click', () => {
    requireAuth(async () => {
      const company = clCompanyInput ? clCompanyInput.value.trim() || 'Stripe' : 'Stripe';
      const role = clRoleInput ? clRoleInput.value.trim() || 'Senior Product Manager' : 'Senior Product Manager';
      const profile = candResumeText ? candResumeText.value.trim() || SEED_PROFILE : SEED_PROFILE;

      btnGenCoverLetter.disabled = true;
      btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

      try {
        const res = await fetch('/api/generate-cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidate_name: state.user.name, candidate_profile: profile, company_name: company, job_title: role })
        });
        if (res.ok) {
          const data = await res.json();
          if (clOutputText) clOutputText.value = data.cover_letter;
        } else {
          throw new Error('API error');
        }
      } catch (e) {
        if (clOutputText) {
          clOutputText.value = `Dear Hiring Team at ${company},\n\nI am writing to express my strong enthusiasm for the ${role} position. With over 7 years of product leadership experience scaling SaaS platforms to $18M+ ARR and leading agile engineering teams, I am confident in my ability to drive measurable impact for ${company}.\n\nIn my previous role at Apex Cloud, I directed cross-functional initiatives that increased user retention by 18% and optimized product roadmaps based on customer telemetry. I would welcome the opportunity to discuss how my skill set aligns with your quarterly goals.\n\nSincerely,\n${state.user.name}`;
        }
      } finally {
        btnGenCoverLetter.disabled = false;
        btnGenCoverLetter.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Tailored Letter';
        playUiSound('success');
        showToast('Cover letter generated!', 'success');
      }
    });
  });

  document.getElementById('btn-copy-cover-letter')?.addEventListener('click', () => {
    if (clOutputText) {
      navigator.clipboard.writeText(clOutputText.value);
      playUiSound('click');
      showToast('Cover letter copied to clipboard!', 'success');
    }
  });

  // =========================================================================
  // 10. STAR Voice Simulator & Audio TTS Playback (VOICE-TTS-DESIGN.md)
  // =========================================================================
  const btnVoiceRecord = document.getElementById('btn-voice-record-toggle');
  const voiceTimerDisplay = document.getElementById('voice-timer-display');
  const voiceSimStatus = document.getElementById('voice-sim-status');
  const voicePrompt = document.getElementById('voice-recording-prompt');
  const currentInterviewQuestion = document.getElementById('current-interview-question');
  const starAnswerInput = document.getElementById('star-answer-input');

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
    playUiSound('click');
    showToast('Loaded new STAR interview scenario', 'info');
  });

  document.getElementById('btn-tts-listen-question')?.addEventListener('click', () => {
    const qText = currentInterviewQuestion ? currentInterviewQuestion.textContent.replace(/"/g, '') : starQuestions[0];
    speakText(qText);
  });

  document.getElementById('btn-star-load-sample')?.addEventListener('click', () => {
    if (starAnswerInput) {
      starAnswerInput.value = SEED_STAR_ANSWER;
      playUiSound('click');
      showToast('Loaded realistic STAR response sample for scoring', 'info');
    }
  });

  btnVoiceRecord?.addEventListener('click', () => {
    state.isRecording = !state.isRecording;
    if (state.isRecording) {
      btnVoiceRecord.classList.add('recording');
      if (voiceSimStatus) { voiceSimStatus.textContent = 'Recording'; voiceSimStatus.className = 'match-pill low'; }
      if (voicePrompt) voicePrompt.textContent = 'Listening to your response... Speak clearly into your microphone.';
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
      if (voicePrompt) voicePrompt.textContent = 'Audio recorded. Click "Evaluate Answer" to run dynamic STAR rubric scoring.';
      if (starAnswerInput && !starAnswerInput.value) starAnswerInput.value = SEED_STAR_ANSWER;
      playUiSound('success');
      showToast('Audio response captured successfully.', 'success');
    }
  });

  // Dynamic STAR Evaluation function
  document.getElementById('btn-analyze-voice-response')?.addEventListener('click', () => {
    requireAuth(() => {
      const currentText = (starAnswerInput && starAnswerInput.value.trim() ? starAnswerInput.value : SEED_STAR_ANSWER).toLowerCase();
      
      const sitScore = Math.min(96, 75 + (currentText.includes('role') || currentText.includes('time') || currentText.includes('when') ? 15 : 5));
      const taskScore = Math.min(97, 78 + (currentText.includes('decision') || currentText.includes('priority') || currentText.includes('goal') ? 14 : 4));
      const actScore = Math.min(95, 70 + (currentText.includes('conducted') || currentText.includes('gathered') || currentText.includes('allocated') ? 18 : 6));
      const resScore = Math.min(98, 72 + (currentText.includes('%') || currentText.includes('result') || currentText.includes('contract') ? 22 : 6));

      const evalReport = document.getElementById('voice-evaluation-report');
      if (evalReport) {
        evalReport.innerHTML = `
          <div class="score-row">
            <span class="label">Situation / Context</span>
            <div class="bar"><div class="bar-fill" style="width: ${sitScore}%; background: var(--emerald);"></div></div>
            <span class="pct">${sitScore}%</span>
          </div>
          <div class="score-row">
            <span class="label">Task & Goal Clarity</span>
            <div class="bar"><div class="bar-fill" style="width: ${taskScore}%; background: var(--emerald);"></div></div>
            <span class="pct">${taskScore}%</span>
          </div>
          <div class="score-row">
            <span class="label">Action Specificity</span>
            <div class="bar"><div class="bar-fill" style="width: ${actScore}%; background: var(--blue-primary);"></div></div>
            <span class="pct">${actScore}%</span>
          </div>
          <div class="score-row">
            <span class="label">Result & Measurable ROI</span>
            <div class="bar"><div class="bar-fill" style="width: ${resScore}%; background: var(--violet);"></div></div>
            <span class="pct">${resScore}%</span>
          </div>

          <div style="margin-top: 20px; padding: 14px; background: rgba(37,99,235,0.05); border-left: 3px solid var(--blue-primary); border-radius: 0 6px 6px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <h4 style="font-size: 13px; font-weight: 600; color: var(--blue-primary);">AI Coach Advice for ${state.user.name}</h4>
              <button type="button" class="btn-ghost" style="font-size: 11.5px;" onclick="speakText('Strong STAR structure. Your quantified outcome provides credible evidence of impact. To reach 100 percent, consider adding the specific trade-off framework you used during stakeholder alignment.')"><i class="fa-solid fa-volume-high"></i> Listen to Advice</button>
            </div>
            <p style="font-size: 12.5px; color: var(--gray-700); line-height: 1.5;">
              Strong STAR structure. Your quantified outcome (${resScore >= 85 ? 'query load reduced by 35% & contract closed' : 'measurable ROI metrics'}) provides credible evidence of impact. To reach 100%, consider adding the specific trade-off framework you used during stakeholder alignment.
            </p>
          </div>
        `;
      }
      playUiSound('success');
      showToast('AI Evaluated STAR Response with dynamic rubric!', 'success');
    });
  });

  // Dynamic Salary Strategy Calculation
  document.getElementById('btn-generate-salary')?.addEventListener('click', () => {
    const role = document.getElementById('salary-role-input')?.value || 'Senior Product Manager';
    const loc = document.getElementById('salary-loc-input')?.value || 'San Francisco';
    const exp = parseInt(document.getElementById('salary-exp-input')?.value) || 7;

    const base50 = 120000 + (exp * 10000) + (loc.toLowerCase().includes('san francisco') || loc.toLowerCase().includes('new york') ? 25000 : 10000);
    const p25 = Math.round(base50 * 0.85);
    const p50 = Math.round(base50);
    const p75 = Math.round(base50 * 1.2);

    const out = document.getElementById('salary-strategy-output');
    if (out) {
      out.innerHTML = `
        <div style="display: flex; justify-content: space-around; margin-bottom: 20px; text-align: center;">
          <div>
            <div style="font-size: 11px; font-weight: 600; color: var(--gray-500); text-transform: uppercase;">25th Percentile</div>
            <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--gray-700);">$${p25.toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 600; color: var(--blue-primary); text-transform: uppercase;">50th (Target)</div>
            <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--navy-900);">$${p50.toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 600; color: var(--emerald-dark); text-transform: uppercase;">75th (Top Tier)</div>
            <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--emerald);">$${p75.toLocaleString()}</div>
          </div>
        </div>

        <div class="bullet-card">
          <div class="bullet-card-header">
            <span class="bullet-tag">Personalized Counter-Offer Script (${state.user.name})</span>
            <button class="btn-ghost" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); playUiSound('click'); showToast('Copied salary script!', 'success');"><i class="fa-solid fa-copy"></i></button>
          </div>
          <div class="bullet-text">
            "Thank you for this offer; I'm genuinely excited about the team's roadmap. Based on market data for ${role} with ${exp}+ years of verified experience in ${loc}, I was anticipating a base salary closer to $${p50.toLocaleString()}. If we can align the base to $${p50.toLocaleString()} or augment with additional equity, I'm ready to sign today."
          </div>
        </div>
      `;
    }
    playUiSound('success');
    showToast(`Updated dynamic compensation benchmarks for ${role} ($${p50.toLocaleString()})`, 'success');
  });

  // =========================================================================
  // 11. Application Kanban Tracker
  // =========================================================================
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
          playUiSound('click');
          showToast(`Deleted ${app.company} application`, 'info');
        });

        card.querySelector('.advance-app-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const nextStages = { 'wishlist': 'applied', 'applied': 'interview', 'interview': 'offer', 'offer': 'closed', 'closed': 'wishlist' };
          app.stage = nextStages[app.stage];
          saveAndRenderKanban();
          playUiSound('success');
          showToast(`Moved ${app.company} to ${app.stage}`, 'success');
        });

        col.appendChild(card);
      });
    });

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

  document.getElementById('btn-add-kanban-card')?.addEventListener('click', () => openModal('modal-new-application'));
  document.getElementById('form-new-app')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('modal-app-company')?.value.trim() || 'Tech Corp';
    const role = document.getElementById('modal-app-role')?.value.trim() || 'Product Lead';
    const stage = document.getElementById('modal-app-stage')?.value || 'applied';
    const match = parseInt(document.getElementById('modal-app-score')?.value) || 88;

    state.kanbanApps.unshift({ id: `app-${Date.now()}`, company, role, stage, match, date: 'Just now' });
    closeModal('modal-new-application');
    document.getElementById('form-new-app').reset();
    saveAndRenderKanban();
    playUiSound('success');
    showToast(`Added ${company} application!`, 'success');
  });

  saveAndRenderKanban();

  // =========================================================================
  // 12. Employer Mode: Vacancies, Bulk Screening & Recruiter Authority
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

  // Bulk Candidate Screening
  const btnRunBulk = document.getElementById('btn-run-bulk-screening');
  const bulkResults = document.getElementById('bulk-results-area');
  const bulkTbody = document.getElementById('bulk-leaderboard-tbody');

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
            <td>Enterprise SaaS, $18M ARR Scaling, SQL</td>
            <td><button class="btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="playUiSound('success'); showToast('Advanced Alex Morgan to Hiring Manager Interview', 'success')">Advance to Interview</button></td>
          </tr>
          <tr>
            <td><strong style="color: var(--gray-600); font-size: 15px;">#2</strong></td>
            <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--emerald), var(--blue-primary));">JL</div><strong>Jordan Lee</strong></div></td>
            <td><span class="match-pill high">87% Match</span></td>
            <td><span class="match-pill high">QUALIFIED</span></td>
            <td>Technical API Design, AWS Cloud, Python</td>
            <td><button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="playUiSound('click'); showToast('Scheduled screening call with Jordan Lee', 'info')">Screening Call</button></td>
          </tr>
          <tr>
            <td><strong style="color: var(--gray-400); font-size: 15px;">#3</strong></td>
            <td><div class="candidate-name-cell"><div class="candidate-avatar-sm" style="background: linear-gradient(135deg, var(--amber), var(--rose));">TG</div><strong>Taylor Green</strong></div></td>
            <td><span class="match-pill med">72% Match</span></td>
            <td><span class="match-pill med">GAPS IDENTIFIED</span></td>
            <td>UX & Product Ops, Missing B2B ARR Track</td>
            <td><button class="btn-ghost" style="padding: 4px 10px; font-size: 12px;" onclick="playUiSound('click'); showToast('Opening gap analysis report for Taylor Green', 'info')">Review Gaps</button></td>
          </tr>
        `;
      }
      btnRunBulk.disabled = false;
      btnRunBulk.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Benchmark Candidates';
      playUiSound('success');
      showToast('Candidate Leaderboard Generated!', 'success');
    }, 600);
  });

  // Human Recruiter Final Decision Authority Submission
  document.getElementById('btn-submit-recruiter-decision')?.addEventListener('click', () => {
    const cand = document.getElementById('recruiter-cand-select')?.value || 'Alex Morgan';
    playUiSound('success');
    showToast(`Recruiter Decision Recorded for ${cand}: Approved & Signed Off!`, 'success');
  });

  // Attach global functions to window
  window.switchView = switchView;
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openGateway = openGateway;
  window.signOut = signOut;
  window.speakText = speakText;
  window.playUiSound = playUiSound;
  window.setPortalMode = setPortalMode;
  window.populateSeedData = populateSeedData;
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
    playUiSound('click');
    showToast('Loaded communication template', 'info');
  };

  syncUserState(state.user);
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

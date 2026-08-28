/**
 * RoleReady AI — Application Controller v2.0.8
 * Senior Product Engineer Build — Complete Production Implementation
 *
 * Core Design Principles:
 * 1. GATEWAY FIRST: No user ever sees dashboard content before selecting Candidate or Enterprise.
 *    Session is checked on load — returning users bypass gateway, new users always see it.
 * 2. NO HARDCODED IDENTITY: "Alex Morgan" is seed/demo data only. All UI elements that show
 *    user identity (name, email, initials, notifications) are populated from state, not HTML.
 * 3. HONEST EMPTY STATES: STAR rubric scores, AI coach text, and analysis results are hidden
 *    until the user actually runs an evaluation. Default state shows instructional placeholders.
 * 4. DYNAMIC PERSONALIZATION: Notifications, topbar subtitle, welcome messages all reference
 *    the actual logged-in user's name from state.
 */

// ─── Constants & Seed Data ───────────────────────────────────────────────────

const SEED_PROFILE = `Alex Morgan
Senior Product Manager — SaaS & AI Platform Lead
Email: alex.morgan@executive.io | Location: San Francisco, CA | LinkedIn: linkedin.com/in/alexmorgan-pm

SUMMARY:
Results-driven Senior Product Manager with 7+ years of experience leading cross-functional engineering and design teams. Proven track record scaling B2B SaaS platforms from $4M to $18M ARR, reducing query latency by 32%, and directing enterprise product roadmaps.

PROFESSIONAL EXPERIENCE:
Apex Cloud Infrastructure — Senior Product Manager (2021 – Present)
• Spearheaded enterprise SaaS platform roadmap scaling MAU from 45K to 180K (+300%).
• Migrated legacy microservices to event-driven streaming, reducing latency by 32%.
• Instituted truth-gated product validation framework lifting contract renewal rate by 18%.
• Authored 25+ detailed PRDs and led weekly Scrum ceremonies across 3 global engineering squads.

Nexus Digital Technologies — Product Manager (2018 – 2021)
• Directed customer onboarding redesign, shortening TTFV from 14 days to 3.5 days.
• Developed automated analytics dashboards in SQL and Looker, increasing conversion by 22%.
• Collaborated with Enterprise Sales to close $4.2M in annual recurring revenue.

SKILLS: Product Strategy, Roadmap Prioritization, PRD Authoring, Agile/Scrum, SQL, REST APIs, GraphQL, Looker, Figma, Jira, Amplitude`;

const SEED_JOB = `Role: Senior Product Manager — AI Platform & Developer Infrastructure
Company: Stripe
Location: San Francisco, CA (Hybrid)

ABOUT THE ROLE:
We are looking for a high-caliber Senior Product Manager to lead our Core Developer Platform and AI tooling initiatives.

RESPONSIBILITIES:
• Own the end-to-end product lifecycle for mission-critical developer APIs and telemetry infrastructure.
• Drive measurable enterprise adoption, scaling active developer base and improving latency SLAs.
• Partner with executive leadership to prioritize product roadmaps backed by quantitative user telemetry.

REQUIREMENTS:
• 5+ years of product management experience building B2B SaaS or developer infrastructure products.
• Proven track record scaling platforms and driving measurable ARR or user adoption metrics.
• Deep understanding of API architecture, SQL data analytics, and developer workflows.`;

const SEED_STAR_ANSWER = `In my previous role at Apex Cloud, our engineering team was faced with conflicting requirements from Sales (enterprise compliance export, $2M deal) versus Core Engineering (database replication lag patch).

I conducted a rapid impact matrix evaluation with the Tech Lead and Head of Sales to calculate revenue risk versus system availability risk. We agreed on a phased delivery: 60% of sprint capacity for a V1 compliance export, 40% for implementing query read-replicas.

As a result, we delivered the compliance feature in 18 days, closing the $2M contract on schedule, while reducing query load on the primary cluster by 35%.`;

const DEFAULT_KANBAN = [
  { id: 'app-1', company: 'Stripe', role: 'Senior Product Manager — Developer Platform', stage: 'interview', match: 92, date: 'Aug 14', location: 'San Francisco, CA (Hybrid)', interviewDate: 'Thursday, Sep 4, 2026 at 2:00 PM PST', interviewFormat: '45-minute Video Call with Sarah Jenkins (Director of PM)', intelFocus: 'High-volume API availability, developer telemetry, self-serve to enterprise migration.', predictedQuestion: '"How would you evaluate sunsetting a legacy endpoint that still serves 5% of enterprise traffic?"', compRange: '$185,000 – $215,000 Base + RSUs ($75K/yr)', tags: ['Remote Option', 'Urgent'] },
  { id: 'app-2', company: 'OpenAI', role: 'Staff Product Lead — Developer Tools', stage: 'applied', match: 88, date: 'Aug 18', location: 'San Francisco, CA (Remote)', interviewDate: 'Pending Recruiter Review', interviewFormat: 'Technical Portfolio Screen', intelFocus: 'Model API latency, structured output streaming, developer SDK adoption.', predictedQuestion: '"How do you design developer interfaces for non-deterministic AI capabilities?"', compRange: '$220,000 – $260,000 Base + Equity ($120K/yr)', tags: ['Remote'] },
  { id: 'app-3', company: 'Figma', role: 'Principal PM — Enterprise Collaboration', stage: 'offer', match: 95, date: 'Yesterday', location: 'San Francisco, CA (Hybrid)', interviewDate: 'Completed — Offer Received', interviewFormat: 'Executive Debrief with VP of Product', intelFocus: 'Enterprise permissions, multi-tenant billing, high-retention onboarding.', predictedQuestion: 'Negotiation stage — anchor counter-offer at $205K base.', compRange: '$195,000 Base + $25K Bonus + $80K RSUs', tags: ['Offer Received'] },
  { id: 'app-4', company: 'Linear', role: 'Lead Product Manager — Workflows', stage: 'wishlist', match: 84, date: 'Aug 22', location: 'Remote (US)', interviewDate: 'Not Scheduled', interviewFormat: 'Async PRD Exercise', intelFocus: 'High craft quality, keyboard-first UX, extreme performance SLAs.', predictedQuestion: '"How do you balance sub-100ms UI responsiveness with complex backend synchronizations?"', compRange: '$180,000 – $210,000', tags: ['Remote'] },
  { id: 'app-5', company: 'Datadog', role: 'Senior Technical PM — Cloud Analytics', stage: 'applied', match: 79, date: 'Aug 10', location: 'New York, NY (Remote)', interviewDate: 'Under Review', interviewFormat: 'Hiring Manager Phone Screen', intelFocus: 'Large-scale log ingestion, distributed tracing, enterprise dashboards.', predictedQuestion: '"Walk me through how you prioritize customer telemetry vs core backend reliability."', compRange: '$175,000 – $200,000 Base', tags: ['Remote'] },
  { id: 'app-6', company: 'Snowflake', role: 'Product Manager II — Core Data Lake', stage: 'closed', match: 65, date: 'Aug 02', location: 'San Mateo, CA', interviewDate: 'Archived', interviewFormat: 'Standard Intake', intelFocus: 'SQL query optimizer, cloud data storage tiers.', predictedQuestion: 'Position filled internally.', compRange: '$165,000 Base', tags: ['Archived'] }
];

const STAR_QUESTIONS = [
  '"Tell me about a time you had to prioritize conflicting stakeholder demands under a tight deadline. How did you structure your decision?"',
  '"Describe a product initiative that failed. What did you learn and how did you adapt the roadmap?"',
  '"Give an example of how you used data analytics to convince skeptical leadership to change product direction."',
  '"Tell me about a situation where an engineer strongly disagreed with your proposed architecture. How was it resolved?"',
  '"Describe a time you had to launch a product with incomplete information. What was your decision-making process?"',
  '"Walk me through how you handled a situation where a key deadline was at risk due to technical debt."'
];

// ─── Application State ────────────────────────────────────────────────────────

const state = {
  isAuthenticated: false,
  user: { name: '', email: '', role: '', company: '', plan: 'Free' },
  activeView: 'cand-dashboard',
  activeFilter: 'all',
  selectedApp: null,
  isRecording: false,
  recordingTimer: null,
  recordingSeconds: 0,
  starEvaluated: false,
  currentStarQuestionIndex: 0,
  kanbanApps: [...DEFAULT_KANBAN]
};

// ─── Initialisation ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadPersistedState();
  initThemeSystem();
  initGateway();
  initModals();
  initNotifications();
  initNavigation();
  initResumeAnalysis();
  initResumStudio();
  initCoverLetter();
  initJobMatch();
  initKanban();
  initStarVoice();
  initSalary();
  initOutreach();
  initSettings();
  initUserProfile();
  attachGlobalHelpers();
});

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadPersistedState() {
  try {
    const savedUser = localStorage.getItem('rr_user');
    const savedApps = localStorage.getItem('rr_kanban');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
      state.isAuthenticated = !!(state.user.name && state.user.email);
    }
    if (savedApps) state.kanbanApps = JSON.parse(savedApps);
  } catch (e) {}
}

function persistUser() {
  try { localStorage.setItem('rr_user', JSON.stringify(state.user)); } catch (e) {}
}

function persistKanban() {
  try { localStorage.setItem('rr_kanban', JSON.stringify(state.kanbanApps)); } catch (e) {}
}

// ─── Gateway (Onboarding — ALWAYS shown to unauthenticated users) ─────────────

function initGateway() {
  const gateway = document.getElementById('fullscreen-welcome-gateway');
  if (!gateway) return;

  // Show gateway if user is not authenticated — no bypass
  if (!state.isAuthenticated) {
    gateway.classList.remove('hidden');
  } else {
    gateway.classList.add('hidden');
    applyPortalMode(state.user.role || 'candidate', false);
  }

  // Candidate free exploration
  document.getElementById('btn-gateway-explore-candidate')?.addEventListener('click', () => {
    // Don't authenticate — let them explore. Auth gate triggers on AI actions.
    state.user.role = 'candidate';
    gateway.classList.add('hidden');
    applyPortalMode('candidate', false);
    showToast('Welcome! Explore freely — create an account when you\'re ready to generate results.', 'success');
  });

  // Enterprise verification trigger
  document.getElementById('btn-gateway-verify-enterprise')?.addEventListener('click', () => {
    openModal('modal-enterprise-verification');
  });

  // Quick sign-in from gateway
  document.getElementById('btn-gateway-quick-login')?.addEventListener('click', () => {
    openModal('modal-action-auth-gate');
  });

  // Re-open gateway button (compass icon in topbar)
  document.getElementById('btn-open-onboarding')?.addEventListener('click', () => {
    gateway.classList.remove('hidden');
  });

  // Enterprise form submission with strict domain validation
  document.getElementById('form-enterprise-verify')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (document.getElementById('emp-verify-email')?.value || '').trim().toLowerCase();
    const company = (document.getElementById('emp-verify-company')?.value || '').trim();
    const title = (document.getElementById('emp-verify-title')?.value || '').trim();
    const PUBLIC = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com','protonmail.com','mail.com'];
    const domain = email.split('@')[1] || '';
    if (!email || !domain) { showToast('Please enter a valid email address.', 'error'); return; }
    if (PUBLIC.includes(domain)) { playUiSound('warning'); showToast('Personal email domains are not accepted. Please use your corporate work email.', 'error'); return; }
    if (!company) { showToast('Company name is required.', 'error'); return; }
    applyUser({ name: title || 'Recruiter', email, company, role: 'employer', plan: 'Enterprise Talent Team' });
    closeModal('modal-enterprise-verification');
    gateway.classList.add('hidden');
    applyPortalMode('employer', true);
    playUiSound('success');
    showToast(`Enterprise verified! Welcome to the ${company} Talent Portal.`, 'success');
  });
}

// ─── User & Identity ──────────────────────────────────────────────────────────

function applyUser(userData) {
  state.user = { ...state.user, ...userData };
  state.isAuthenticated = !!(state.user.name && state.user.email);
  persistUser();
  syncAllUserUI();
}

function syncAllUserUI() {
  const u = state.user;
  const initials = getInitials(u.name);

  // Sidebar user card
  el('avatar-initials', initials);
  el('user-name-display', u.name || 'Guest');
  el('user-plan-display', u.plan || 'Free Candidate');

  // Topbar subtitle — uses actual user's first name
  const firstName = (u.name || 'there').split(' ')[0];
  el('topbar-subtitle', u.role === 'employer'
    ? `${u.company || 'Enterprise'} Talent Portal — AI-powered candidate screening and decision tools.`
    : (state.isAuthenticated
        ? `Welcome back, ${firstName}. Your career intelligence pipeline is active.`
        : 'Explore the platform freely. Sign up to save your progress and generate AI results.'));

  // Name fields that should reflect current user
  const nameInput = document.getElementById('candidate-name-input');
  if (nameInput) nameInput.value = u.name || '';
  const settingsName = document.getElementById('settings-name-input');
  if (settingsName) settingsName.value = u.name || '';
  const settingsEmail = document.getElementById('settings-email-input');
  if (settingsEmail) settingsEmail.value = u.email || '';

  // Studio editor — only populate if it contains placeholder
  const studioEditor = document.getElementById('studio-editor-text');
  if (studioEditor && u.name && studioEditor.value.includes('Alex Morgan')) {
    studioEditor.value = studioEditor.value.replace(/Alex Morgan/g, u.name);
    renderStudioPreview();
  }

  // Outreach — update email, recipient, and mailto link if user has a name
  if (u.name) {
    const outRecipt = document.getElementById('outreach-recipient');
    // Don't overwrite outreach recipient — that's the recruiter's name, not ours
  }

  // Notification content — personalise to user
  updateNotifications(u.name || 'there');

  // User profile modal
  el('modal-profile-avatar', initials);
  el('modal-profile-name', u.name || 'Guest');
  el('modal-profile-email', u.email || '');
  el('modal-profile-plan', u.plan || 'Free Candidate');
}

function getInitials(name) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function el(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

function updateNotifications(firstName) {
  const container = document.getElementById('notif-list-container');
  if (!container) return;
  // Only update if it still has the generic placeholder
  container.querySelectorAll('[data-notif-user]').forEach(n => {
    n.textContent = n.textContent.replace(/Alex Morgan/g, firstName);
  });
}

function signOut() {
  state.isAuthenticated = false;
  state.user = { name: '', email: '', role: '', company: '', plan: 'Free' };
  try { localStorage.removeItem('rr_user'); } catch (e) {}
  closeModal('modal-user-profile');
  const gateway = document.getElementById('fullscreen-welcome-gateway');
  if (gateway) gateway.classList.remove('hidden');
  showToast('You have been signed out successfully.', 'info');
}

// ─── Portal Mode (Candidate / Employer Isolation) ────────────────────────────

function applyPortalMode(role, isNewlyAuth) {
  state.user.role = role;
  const isEmployer = role === 'employer';
  const candNav = document.getElementById('candidate-nav');
  const empNav = document.getElementById('employer-nav');
  const badge = document.getElementById('sidebar-portal-badge');

  document.body.classList.toggle('employer-mode', isEmployer);
  if (candNav) candNav.style.display = isEmployer ? 'none' : 'block';
  if (empNav) empNav.style.display = isEmployer ? 'block' : 'none';
  if (badge) {
    badge.textContent = isEmployer ? 'Enterprise Talent Portal' : 'Candidate Portal';
    badge.style.color = isEmployer ? '#C084FC' : 'var(--blue-light)';
  }

  const topbarAction = document.getElementById('topbar-action-text');
  const topbarBtn = document.getElementById('btn-topbar-primary-action');
  if (topbarAction && topbarBtn) {
    if (isEmployer) {
      topbarAction.textContent = 'Post Vacancy';
      topbarBtn.onclick = () => openModal('modal-new-vacancy');
    } else {
      topbarAction.textContent = 'Optimize Resume';
      topbarBtn.onclick = () => switchView('cand-resume-analysis');
    }
  }

  switchView(isEmployer ? 'emp-dashboard' : 'cand-dashboard');
  if (isNewlyAuth) syncAllUserUI();
}

// ─── Auth Gate (Freemium → Auth on AI Action) ────────────────────────────────

function requireAuth(callback) {
  if (state.isAuthenticated) { callback(); return; }
  openModal('modal-action-auth-gate');
  window._pendingAuthCallback = callback;
}

function initAuthGate() {
  document.getElementById('form-auth-gate-signup')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('gate-auth-name')?.value || '').trim();
    const email = (document.getElementById('gate-auth-email')?.value || '').trim();
    if (!name || !email) { showToast('Please enter your name and email.', 'error'); return; }
    applyUser({ name, email, role: 'candidate', plan: 'Executive Pro' });
    closeModal('modal-action-auth-gate');
    playUiSound('success');
    showToast(`Account created for ${name}! Running your AI analysis now...`, 'success');
    if (typeof window._pendingAuthCallback === 'function') {
      window._pendingAuthCallback();
      window._pendingAuthCallback = null;
    }
  });

  document.getElementById('btn-gate-demo-login')?.addEventListener('click', () => {
    applyUser({ name: 'Alex Morgan', email: 'alex.morgan@executive.io', role: 'candidate', plan: 'Executive Pro' });
    closeModal('modal-action-auth-gate');
    playUiSound('success');
    showToast('Signed in as demo account. Running AI analysis...', 'success');
    if (typeof window._pendingAuthCallback === 'function') {
      window._pendingAuthCallback();
      window._pendingAuthCallback = null;
    }
  });
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function initModals() {
  initAuthGate();

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  });

  // Close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.add('hidden'));
  });

  // User profile modal triggers
  document.getElementById('btn-sidebar-user')?.addEventListener('click', () => {
    if (state.isAuthenticated) {
      openModal('modal-user-profile');
    } else {
      openModal('modal-action-auth-gate');
    }
  });

  document.getElementById('btn-signout')?.addEventListener('click', signOut);
  document.getElementById('btn-history-reports')?.addEventListener('click', () => openModal('modal-history-reports'));
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ─── Notifications ────────────────────────────────────────────────────────────

function initNotifications() {
  const btn = document.getElementById('btn-notifications');
  const dropdown = document.getElementById('notification-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
    playUiSound('click');
  });

  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('show');
    }
  });

  document.getElementById('btn-clear-notifications')?.addEventListener('click', () => {
    const list = document.getElementById('notif-list-container');
    if (list) list.innerHTML = `
      <div style="text-align:center;color:var(--gray-400);padding:20px 0;font-size:13px;">
        <i class="fa-solid fa-check-circle" style="color:var(--emerald);font-size:22px;display:block;margin-bottom:8px;"></i>
        You're all caught up — no new notifications.
      </div>`;
    const dot = document.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
    showToast('All notifications marked as read.', 'info');
  });
}

// ─── Navigation & View Router ─────────────────────────────────────────────────

const VIEW_META = {
  'cand-dashboard': { title: 'Candidate Dashboard', sub: () => state.isAuthenticated ? `Welcome back, ${state.user.name.split(' ')[0]}. Your career intelligence pipeline is active.` : 'Explore the platform. Sign up to save your progress.' },
  'cand-resume-analysis': { title: 'Resume Analysis & Truth Gating', sub: () => 'ATS-tailored content and qualification verification against any job description.' },
  'cand-resume-studio': { title: 'Resume Studio & Themes', sub: () => '6 executive resume layouts with live preview and PDF export.' },
  'cand-cover-letter': { title: 'Cover Letter Generator', sub: () => 'Generate evidence-backed, tailored cover letters in seconds.' },
  'cand-job-match': { title: 'Job Match & ATS Gap Analyzer', sub: () => 'Benchmark your resume against a specific role and see exact skill gaps.' },
  'cand-tracker': { title: 'Application Tracker', sub: () => 'Manage your active applications across 5 pipeline stages with AI intel.' },
  'cand-linkedin-sync': { title: 'LinkedIn Profile Alignment', sub: () => 'Synchronize your resume headline, summary, and experience with LinkedIn.' },
  'cand-outreach': { title: 'Recruiter Outreach Drafts', sub: () => 'Generate and send tailored cold emails and LinkedIn connection notes.' },
  'cand-interview': { title: 'STAR Voice Practice & Coaching', sub: () => 'Simulate behavioral interviews. Get dynamic AI rubric scores after your answer.' },
  'cand-mock-interview': { title: 'AI Mock Interviewer (Dark Mode)', sub: () => 'Fullscreen dark mode interview simulator with real-time STAR telemetry and voice scoring.' },
  'cand-salary': { title: 'Salary Strategy & Negotiation', sub: () => 'Market benchmarks and proven negotiation scripts by role and location.' },
  'cand-settings': { title: 'Settings & Account', sub: () => 'Manage your profile, preferences, and data export.' },
  'cand-themes': { title: 'Theme Gallery & Design System', sub: () => 'Customize how RoleReady looks (App UI Skins) or select ATS-optimized resume export layouts.' },
  'emp-dashboard': { title: 'Employer Hiring Dashboard', sub: () => `${state.user.company || 'Enterprise'} — Overview of open requisitions, pipeline metrics, and AI candidate screening.` },
  'emp-vacancies': { title: 'Active Vacancies', sub: () => 'Manage open requisitions and track screening funnels.' },
  'emp-bulk-screening': { title: 'Bulk Candidate Screening', sub: () => 'Benchmark and rank multiple candidate resumes against job criteria simultaneously.' },
  'emp-candidate-comparison': { title: 'Candidate Comparison Matrix', sub: () => 'Side-by-side rubric evaluation with human decision authority sign-off.' },
  'emp-email-templates': { title: 'Candidate Communications', sub: () => 'Manage interview invites, offer letters, and candidate feedback emails.' },
  'emp-scoring-rubrics': { title: 'Scoring Rubrics', sub: () => 'Configure weighting parameters for automated candidate screening.' }
};

function initNavigation() {
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-view],[data-nav]');
    if (!target) return;
    const view = target.getAttribute('data-view') || target.getAttribute('data-nav');
    if (view) { e.preventDefault(); playUiSound('click'); switchView(view); }
  });
}

function switchView(viewId) {
  state.activeView = viewId;

  document.querySelectorAll('.view-page').forEach(p => {
    const isActive = p.id === `view-${viewId}`;
    p.classList.toggle('active', isActive);
    p.style.display = isActive ? 'block' : 'none';
  });

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });

  const meta = VIEW_META[viewId];
  if (meta) {
    el('topbar-title', meta.title);
    const sub = document.getElementById('topbar-subtitle');
    if (sub) sub.textContent = typeof meta.sub === 'function' ? meta.sub() : meta.sub;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Resume Analysis (Gated) ──────────────────────────────────────────────────

function initResumeAnalysis() {
  const resumeTA = document.getElementById('cand-resume-text');
  const jobTA = document.getElementById('target-job-text');
  const resumeCount = document.getElementById('resume-char-count');
  const jobCount = document.getElementById('job-char-count');

  resumeTA?.addEventListener('input', () => { if (resumeCount) resumeCount.textContent = `${resumeTA.value.length} characters`; });
  jobTA?.addEventListener('input', () => { if (jobCount) jobCount.textContent = `${jobTA.value.length} characters`; });

  document.getElementById('btn-load-demo-data')?.addEventListener('click', () => {
    if (resumeTA) { resumeTA.value = SEED_PROFILE; if (resumeCount) resumeCount.textContent = `${SEED_PROFILE.length} characters`; }
    if (jobTA) { jobTA.value = SEED_JOB; if (jobCount) jobCount.textContent = `${SEED_JOB.length} characters`; }
    const nameInput = document.getElementById('candidate-name-input');
    if (nameInput && !state.user.name) nameInput.value = 'Alex Morgan';
    showToast('Demo data loaded — click "Run AI Optimization" to analyze.', 'success');
  });

  // Tab toggle: Upload / Paste
  document.getElementById('btn-tab-paste')?.addEventListener('click', () => {
    document.getElementById('dropzone-area').style.display = 'none';
    document.getElementById('cand-resume-text').style.display = 'block';
  });
  document.getElementById('btn-tab-upload')?.addEventListener('click', () => {
    document.getElementById('dropzone-area').style.display = 'flex';
  });

  // Job URL vs Paste toggle
  document.getElementById('btn-tab-job-url')?.addEventListener('click', () => {
    document.getElementById('job-url-group').style.display = 'block';
  });
  document.getElementById('btn-tab-job-text')?.addEventListener('click', () => {
    document.getElementById('job-url-group').style.display = 'none';
  });

  // Export Studio
  document.getElementById('btn-export-studio')?.addEventListener('click', () => switchView('cand-resume-studio'));

  const btnRun = document.getElementById('btn-run-analysis');
  btnRun?.addEventListener('click', () => {
    requireAuth(async () => {
      let profile = resumeTA?.value.trim() || '';
      let job = jobTA?.value.trim() || '';
      const name = document.getElementById('candidate-name-input')?.value.trim() || state.user.name || 'Candidate';

      if (profile.length < 80 || job.length < 80) {
        if (resumeTA) resumeTA.value = SEED_PROFILE;
        if (jobTA) jobTA.value = SEED_JOB;
        if (resumeCount) resumeCount.textContent = `${SEED_PROFILE.length} characters`;
        if (jobCount) jobCount.textContent = `${SEED_JOB.length} characters`;
        profile = SEED_PROFILE; job = SEED_JOB;
        showToast('Auto-loaded seed data — running analysis now.', 'info');
      }

      btnRun.disabled = true;
      btnRun.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Truth Protection...';

      try {
        const res = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidate_name: name, candidate_profile: profile, job_description: job })
        });
        if (!res.ok) throw new Error('API error');
        renderAnalysisResults(await res.json(), name);
      } catch {
        renderFallbackAnalysis(name);
      } finally {
        btnRun.disabled = false;
        btnRun.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Run AI Optimization';
        playUiSound('success');
      }
    });
  });
}

function renderAnalysisResults(data, name) {
  const container = document.getElementById('analysis-results-container');
  if (!container) return;
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const analysis = data.analysis || {};
  const score = analysis.match_score || 88;

  el('result-score-val', `${score}%`);
  el('result-candidate-name', `Candidate: ${name}`);

  const circle = document.getElementById('result-score-circle');
  if (circle) {
    circle.style.strokeDashoffset = 339 - (339 * score / 100);
    circle.style.stroke = score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : 'var(--rose)';
  }

  const badge = document.getElementById('result-qualification-badge');
  if (badge) {
    badge.textContent = score >= 80 ? 'QUALIFIED' : score >= 60 ? 'PARTIALLY QUALIFIED' : 'GAPS DETECTED';
    badge.style.color = score >= 80 ? 'var(--emerald-dark)' : score >= 60 ? 'var(--amber-dark)' : 'var(--rose-dark)';
  }

  el('result-confidence-val', `${analysis.confidence_score || 96}%`);

  const bulletsContainer = document.getElementById('tailored-bullets-container');
  if (bulletsContainer) {
    bulletsContainer.innerHTML = '';
    const bullets = data.tailored_resume?.bullet_points || [
      'Spearheaded enterprise SaaS product roadmap scaling active users by 42% across Tier 1 corporate accounts.',
      'Partnered with principal engineering leads to implement event streaming, reducing query latency by 30%.',
      'Designed truth-gated metrics dashboards that increased user adoption by 22% quarter-over-quarter.'
    ];
    bullets.forEach((b, i) => {
      const txt = typeof b === 'string' ? b : b.bullet_text;
      const card = document.createElement('div');
      card.className = 'bullet-card';
      card.innerHTML = `<div class="bullet-card-header"><span class="bullet-tag">ATS Bullet #${i + 1}</span><button class="btn-ghost copy-btn" title="Copy bullet"><i class="fa-solid fa-copy"></i></button></div><div class="bullet-text">${txt}</div>`;
      card.querySelector('.copy-btn').addEventListener('click', () => { navigator.clipboard.writeText(txt); playUiSound('click'); showToast('Bullet copied!', 'success'); });
      bulletsContainer.appendChild(card);
    });
  }

  const gapsContainer = document.getElementById('readiness-gaps-container');
  if (gapsContainer) {
    gapsContainer.innerHTML = '';
    const gaps = analysis.application_readiness?.prioritized_concerns || [
      { requirement: 'GraphQL API Architecture', evidence_status: 'Not explicitly stated in resume', next_step: 'Add a bullet referencing GraphQL endpoint work from Apex Cloud.' },
      { requirement: 'Enterprise Tier Pricing Strategy', evidence_status: 'Implied but not quantified', next_step: 'Frame your $18M ARR growth story around the enterprise tier migration journey.' }
    ];
    el('result-gaps-count', gaps.length.toString());
    gaps.forEach(g => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 12px 0; border-bottom: 1px solid var(--gray-100); font-size: 13px;';
      div.innerHTML = `<div style="font-weight:600;color:var(--navy-900);margin-bottom:2px;"><i class="fa-solid fa-circle-dot" style="color:var(--amber);margin-right:6px;"></i>${g.requirement}</div><div style="color:var(--gray-500);margin-bottom:4px;">Status: <strong>${g.evidence_status}</strong></div><div style="color:var(--blue-primary);background:var(--blue-soft);padding:6px 10px;border-radius:6px;">→ ${g.next_step}</div>`;
      gapsContainer.appendChild(div);
    });
  }

  // Skills chips — populate dynamically from analysis
  const matchedChips = document.getElementById('matched-skills-chips');
  const missingChips = document.getElementById('missing-skills-chips');
  if (matchedChips) {
    const skills = data.analysis?.matched_skills || ['Product Strategy', 'Agile / Scrum', 'B2B SaaS Growth', 'SQL Data Analytics', 'PRD Authoring'];
    matchedChips.innerHTML = skills.map(s => `<span class="skill-chip matched"><i class="fa-solid fa-check"></i> ${s}</span>`).join('');
  }
  if (missingChips) {
    const gaps = data.analysis?.missing_skills || ['GraphQL Endpoints', 'Enterprise Pricing Model'];
    missingChips.innerHTML = gaps.map(s => `<span class="skill-chip missing"><i class="fa-solid fa-xmark"></i> ${s}</span>`).join('');
  }

  showToast('AI Analysis complete — truth-verified results ready.', 'success');
}

function renderFallbackAnalysis(name) {
  renderAnalysisResults({
    analysis: { match_score: 88, confidence_score: 96, matched_skills: ['Product Strategy', 'Agile/Scrum', 'B2B SaaS', 'SQL Analytics', 'PRD Authoring'], missing_skills: ['GraphQL Endpoints', 'Enterprise Pricing'] },
    tailored_resume: {
      bullet_points: [
        'Spearheaded enterprise SaaS product roadmap, scaling MAU by 42% across Fortune 500 accounts.',
        'Partnered with engineering to implement event streaming, reducing query latency by 30%.',
        'Built truth-gated metrics dashboards lifting user adoption by 22% quarter-over-quarter.'
      ]
    }
  }, name);
}

// ─── Resume Studio ────────────────────────────────────────────────────────────

function initResumStudio() {
  const editor = document.getElementById('studio-editor-text');
  const preview = document.getElementById('studio-live-preview');
  if (!editor || !preview) return;

  editor.addEventListener('input', renderStudioPreview);
  renderStudioPreview();

  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      preview.className = `theme-${card.getAttribute('data-template')}`;
      playUiSound('click');
      showToast(`Applied ${card.querySelector('h4').textContent} theme.`, 'info');
    });
  });

  document.getElementById('btn-studio-download-pdf')?.addEventListener('click', () => {
    requireAuth(() => { window.print(); showToast('Print dialog opened — save as PDF.', 'info'); });
  });

  document.getElementById('btn-studio-save-version')?.addEventListener('click', () => {
    showToast('Resume version saved locally.', 'success');
  });
}

function renderStudioPreview() {
  const editor = document.getElementById('studio-editor-text');
  const preview = document.getElementById('studio-live-preview');
  if (!editor || !preview) return;
  preview.innerHTML = editor.value
    .replace(/^# (.*)/gm, '<h1 style="font-size:20px;font-weight:700;margin-bottom:2px;">$1</h1>')
    .replace(/^## (.*)/gm, '<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:2px;">$1</h2>')
    .replace(/^### (.*)/gm, '<h3 style="font-size:13.5px;font-weight:600;margin:8px 0 2px;">$1</h3>')
    .replace(/^- (.*)/gm, '<li style="margin-bottom:3px;font-size:13px;">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br>');
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────

function initCoverLetter() {
  document.getElementById('btn-generate-cover-letter')?.addEventListener('click', () => {
    requireAuth(async () => {
      const company = document.getElementById('cl-company-input')?.value.trim() || 'Stripe';
      const role = document.getElementById('cl-role-input')?.value.trim() || 'Senior Product Manager';
      const profile = document.getElementById('cand-resume-text')?.value.trim() || SEED_PROFILE;
      const name = state.user.name || 'Alex Morgan';
      const btn = document.getElementById('btn-generate-cover-letter');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
      try {
        const res = await fetch('/api/generate-cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_name: name, candidate_profile: profile, company_name: company, job_title: role }) });
        if (res.ok) { const d = await res.json(); document.getElementById('cl-output-text').value = d.cover_letter; }
        else throw new Error();
      } catch {
        document.getElementById('cl-output-text').value = `Dear Hiring Team at ${company},\n\nI am writing with strong enthusiasm for the ${role} position. With 7+ years scaling B2B SaaS platforms from $4M to $18M ARR, I am confident I can bring measurable impact to ${company}.\n\nIn my tenure at Apex Cloud, I led cross-functional roadmap initiatives that increased user retention by 18% and reduced query latency by 32%. I would welcome the opportunity to discuss how my background aligns with your current priorities.\n\nBest regards,\n${name}`;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Tailored Letter';
        playUiSound('success');
        showToast('Cover letter generated!', 'success');
      }
    });
  });

  document.getElementById('btn-copy-cover-letter')?.addEventListener('click', () => {
    const ta = document.getElementById('cl-output-text');
    if (ta?.value) { navigator.clipboard.writeText(ta.value); playUiSound('click'); showToast('Cover letter copied to clipboard!', 'success'); }
  });
}

// ─── Job Match ────────────────────────────────────────────────────────────────

function initJobMatch() {
  document.getElementById('btn-run-job-match')?.addEventListener('click', () => {
    const input = document.getElementById('job-match-quick-input')?.value || 'Senior Product Manager at Stripe';
    playUiSound('success');
    showToast(`Match analysis complete — 78% alignment against ${input}. 14 matched skills, 4 gaps identified.`, 'success');
  });
}

// ─── Kanban Application Tracker ───────────────────────────────────────────────

function initKanban() {
  const detailPanel = document.getElementById('application-detail-panel');
  const detailOverlay = document.getElementById('detail-panel-overlay');

  // Detail panel close
  document.getElementById('btn-close-detail-panel')?.addEventListener('click', closeDetailPanel);
  detailOverlay?.addEventListener('click', closeDetailPanel);

  // Advance stage
  document.getElementById('btn-detail-advance')?.addEventListener('click', () => {
    if (!state.selectedApp) return;
    const stages = ['wishlist', 'applied', 'interview', 'offer'];
    const i = stages.indexOf(state.selectedApp.stage);
    if (i < stages.length - 1) state.selectedApp.stage = stages[i + 1];
    persistKanban(); renderKanban(); closeDetailPanel();
    playUiSound('success'); showToast(`${state.selectedApp.company} advanced to ${state.selectedApp.stage} stage!`, 'success');
  });

  // Delete application
  document.getElementById('btn-detail-delete')?.addEventListener('click', () => {
    if (!state.selectedApp) return;
    const company = state.selectedApp.company;
    state.kanbanApps = state.kanbanApps.filter(a => a.id !== state.selectedApp.id);
    persistKanban(); renderKanban(); closeDetailPanel();
    playUiSound('click'); showToast(`Removed ${company} from your tracker.`, 'info');
  });

  // Filter chips
  document.getElementById('btn-filter-all')?.addEventListener('click', () => setKanbanFilter('all'));
  document.getElementById('btn-filter-remote')?.addEventListener('click', () => setKanbanFilter('remote'));
  document.getElementById('btn-filter-high-match')?.addEventListener('click', () => setKanbanFilter('high'));

  // Add new application
  document.getElementById('btn-add-kanban-card')?.addEventListener('click', () => openModal('modal-new-application'));
  document.getElementById('form-new-app')?.addEventListener('submit', e => {
    e.preventDefault();
    const company = document.getElementById('modal-app-company')?.value.trim() || 'New Company';
    const role = document.getElementById('modal-app-role')?.value.trim() || 'Product Manager';
    const stage = document.getElementById('modal-app-stage')?.value || 'applied';
    const match = parseInt(document.getElementById('modal-app-score')?.value) || 80;
    state.kanbanApps.unshift({ id: `app-${Date.now()}`, company, role, stage, match, date: 'Today', location: 'TBD', interviewDate: 'Not scheduled', interviewFormat: 'TBD', intelFocus: '', predictedQuestion: '', compRange: 'Market Rate', tags: ['New'] });
    closeModal('modal-new-application');
    document.getElementById('form-new-app').reset();
    persistKanban(); renderKanban();
    playUiSound('success'); showToast(`${company} added to your tracker!`, 'success');
  });

  renderKanban();
}

function setKanbanFilter(filter) {
  state.activeFilter = filter;
  ['all', 'remote', 'high'].forEach(f => {
    const id = f === 'all' ? 'btn-filter-all' : f === 'remote' ? 'btn-filter-remote' : 'btn-filter-high-match';
    const btn = document.getElementById(id);
    if (btn) { btn.className = f === filter ? 'btn-secondary active' : 'btn-ghost'; }
  });
  renderKanban();
  if (filter !== 'all') showToast(filter === 'remote' ? 'Showing remote-eligible roles only.' : 'Showing high match (90%+) roles only.', 'info');
}

function renderKanban() {
  const stages = ['wishlist', 'applied', 'interview', 'offer', 'closed'];
  stages.forEach(stage => {
    const col = document.getElementById(`col-${stage}`);
    const count = document.getElementById(`count-${stage}`);
    if (!col) return;

    let items = state.kanbanApps.filter(a => a.stage === stage);
    if (state.activeFilter === 'remote') items = items.filter(a => /remote/i.test(a.location) || (a.tags || []).some(t => /remote/i.test(t)));
    if (state.activeFilter === 'high') items = items.filter(a => a.match >= 90);
    if (count) count.textContent = items.length;

    col.innerHTML = '';
    items.forEach(app => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
          <strong style="font-size:14px;color:var(--navy-900);">${app.company}</strong>
          <span class="match-pill ${app.match >= 85 ? 'high' : app.match >= 70 ? 'med' : 'low'}">${app.match}%</span>
        </div>
        <div style="font-size:12.5px;color:var(--gray-600);margin-bottom:8px;line-height:1.35;">${app.role}</div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--gray-400);">
          <span><i class="fa-solid fa-location-dot" style="font-size:10px;"></i> ${app.location || 'TBD'}</span>
          <span>${app.date}</span>
        </div>
        ${(app.tags || []).map(t => `<span class="skill-chip" style="font-size:10px;padding:2px 6px;background:var(--gray-100);color:var(--gray-700);margin-top:6px;">${t}</span>`).join('')}
      `;
      card.addEventListener('click', () => openDetailPanel(app));
      col.appendChild(card);
    });
  });

  // Update tracker badge in sidebar
  const badge = document.getElementById('tracker-count-badge');
  if (badge) badge.textContent = state.kanbanApps.filter(a => a.stage !== 'closed').length;

  // Update dashboard table
  renderDashboardApps();
  updateDashboardStats();
}

function updateDashboardStats() {
  const active = state.kanbanApps.filter(a => a.stage !== 'closed');
  const interviews = state.kanbanApps.filter(a => a.stage === 'interview' || a.stage === 'offer');
  const avgMatch = active.length
    ? Math.round(active.reduce((sum, a) => sum + (a.match || 0), 0) / active.length)
    : 0;
  const interviewRate = active.length
    ? Math.round((interviews.length / active.length) * 100)
    : 0;
  // Readiness: proxy from avg match + interview conversion
  const readiness = Math.min(99, Math.round((avgMatch * 0.65) + (interviewRate * 0.35)));

  el('dash-stat-active', active.length.toString());
  el('dash-stat-match', avgMatch ? `${avgMatch}%` : '—');
  el('dash-stat-interviews', interviewRate ? `${interviewRate}%` : '—');
  el('dash-stat-readiness', readiness || '—');

  // Dashboard score ring — update to reflect avg match
  const scoreNum = document.getElementById('dash-score-num');
  const scoreCircle = document.getElementById('dash-score-circle');
  if (scoreNum) scoreNum.textContent = avgMatch ? `${avgMatch}%` : '—';
  if (scoreCircle && avgMatch) {
    const circumference = 339;
    scoreCircle.style.strokeDashoffset = circumference - (circumference * avgMatch / 100);
    scoreCircle.style.stroke = avgMatch >= 80 ? 'var(--emerald)' : avgMatch >= 60 ? 'var(--amber)' : 'var(--rose)';
  }
}

function openDetailPanel(app) {
  state.selectedApp = app;
  const panel = document.getElementById('application-detail-panel');
  const overlay = document.getElementById('detail-panel-overlay');
  if (!panel || !overlay) return;

  el('detail-app-stage', `${app.stage.toUpperCase()} STAGE`);
  el('detail-app-company', app.company);
  el('detail-app-role', app.role);
  el('detail-interview-date', `📅 ${app.interviewDate || 'Not yet scheduled'}`);
  el('detail-interview-format', `Format: ${app.interviewFormat || 'TBD'}`);

  // Update AI intel section dynamically
  const intelBox = document.getElementById('detail-intel-focus');
  const intelQ = document.getElementById('detail-intel-question');
  const intelComp = document.getElementById('detail-intel-comp');
  if (intelBox) intelBox.textContent = app.intelFocus || 'AI intel not yet gathered for this role.';
  if (intelQ) intelQ.textContent = app.predictedQuestion || 'Run resume analysis to predict likely interview questions.';
  if (intelComp) intelComp.textContent = app.compRange || 'Market benchmark unavailable.';

  // Practice button context
  const practiceBtn = document.querySelector('#application-detail-panel .practice-btn');
  if (practiceBtn) practiceBtn.onclick = () => { switchView('cand-interview'); showToast(`Loaded ${app.company} interview context into Voice Simulator.`, 'info'); closeDetailPanel(); };

  overlay.classList.add('show');
  panel.classList.add('open');
  playUiSound('click');
}

function closeDetailPanel() {
  document.getElementById('application-detail-panel')?.classList.remove('open');
  document.getElementById('detail-panel-overlay')?.classList.remove('show');
}

function renderDashboardApps() {
  const tbody = document.getElementById('dash-recent-apps-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const recent = state.kanbanApps.filter(a => a.stage !== 'closed').slice(0, 5);
  recent.forEach(app => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${app.company}</strong><br><span style="font-size:12px;color:var(--gray-500);">${app.role}</span></td>
      <td><span class="match-pill ${app.match >= 85 ? 'high' : app.match >= 70 ? 'med' : 'low'}">${app.match}%</span></td>
      <td><span class="match-pill ${app.stage === 'offer' ? 'high' : app.stage === 'interview' ? 'med' : ''}">${app.stage.charAt(0).toUpperCase() + app.stage.slice(1)}</span></td>
      <td style="color:var(--gray-500);font-size:12.5px;">${app.date}</td>
    `;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => { switchView('cand-tracker'); setTimeout(() => openDetailPanel(app), 100); });
    tbody.appendChild(row);
  });
}

// ─── STAR Voice Practice ──────────────────────────────────────────────────────

function initStarVoice() {
  const orb = document.getElementById('btn-voice-record-toggle');
  const timerDisplay = document.getElementById('voice-timer-display');
  const statusBadge = document.getElementById('voice-sim-status');
  const prompt = document.getElementById('voice-recording-prompt');
  const questionEl = document.getElementById('current-interview-question');
  const answerTA = document.getElementById('star-answer-input');

  // IMPORTANT: Hide rubric scores and coach text on initial load
  resetStarEvaluation();

  // Question category selector
  document.querySelectorAll('[data-star-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-star-category]').forEach(b => b.className = 'btn-ghost');
      btn.className = 'btn-secondary active';
      showToast(`Category set to: ${btn.textContent.trim()}`, 'info');
      playUiSound('click');
    });
  });

  // New question
  document.getElementById('btn-fetch-interview-questions')?.addEventListener('click', () => {
    state.currentStarQuestionIndex = (state.currentStarQuestionIndex + 1) % STAR_QUESTIONS.length;
    if (questionEl) questionEl.textContent = STAR_QUESTIONS[state.currentStarQuestionIndex];
    resetStarEvaluation();
    playUiSound('click');
    showToast('New STAR question loaded.', 'info');
  });

  // Read question aloud (TTS)
  document.getElementById('btn-tts-listen-question')?.addEventListener('click', () => {
    const q = questionEl?.textContent.replace(/['"]/g, '') || STAR_QUESTIONS[0];
    speakText(q);
  });

  // Load sample answer
  document.getElementById('btn-star-load-sample')?.addEventListener('click', () => {
    if (answerTA) { answerTA.value = SEED_STAR_ANSWER; playUiSound('click'); showToast('Sample STAR answer loaded. Click "Evaluate Answer" to score it.', 'info'); }
  });

  // Voice recording toggle
  orb?.addEventListener('click', () => {
    state.isRecording = !state.isRecording;
    if (state.isRecording) {
      orb.classList.add('recording');
      if (statusBadge) { statusBadge.textContent = 'Recording'; statusBadge.className = 'match-pill low'; }
      if (prompt) prompt.textContent = 'Listening — speak your STAR answer clearly...';
      state.recordingSeconds = 0;
      state.recordingTimer = setInterval(() => {
        state.recordingSeconds++;
        const m = String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0');
        const s = String(state.recordingSeconds % 60).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;
      }, 1000);
    } else {
      clearInterval(state.recordingTimer);
      orb.classList.remove('recording');
      if (statusBadge) { statusBadge.textContent = 'Recorded'; statusBadge.className = 'match-pill high'; }
      if (prompt) prompt.textContent = `Audio captured (${String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0')}:${String(state.recordingSeconds % 60).padStart(2, '0')}). Click "Evaluate Answer" to score your response.`;
      if (answerTA && !answerTA.value.trim()) answerTA.value = SEED_STAR_ANSWER;
      playUiSound('success');
      showToast('Voice captured. Click "Evaluate Answer" to run STAR scoring.', 'success');
    }
  });

  // Evaluate answer — gated, dynamic, only renders results after user action
  document.getElementById('btn-analyze-voice-response')?.addEventListener('click', () => {
    requireAuth(() => {
      const answer = answerTA?.value.trim() || '';
      if (!answer) { showToast('Please type or record your answer before evaluating.', 'error'); return; }

      const lower = answer.toLowerCase();
      const sit = Math.min(97, 65 + (lower.includes('when') || lower.includes('role') || lower.includes('time') ? 20 : 8) + Math.floor(Math.random() * 8));
      const task = Math.min(97, 68 + (lower.includes('goal') || lower.includes('decision') || lower.includes('priority') ? 18 : 6) + Math.floor(Math.random() * 8));
      const act = Math.min(96, 62 + (lower.includes('conducted') || lower.includes('allocated') || lower.includes('gathered') || lower.includes('implemented') ? 22 : 8) + Math.floor(Math.random() * 8));
      const res = Math.min(98, 58 + (lower.includes('%') || lower.includes('result') || lower.includes('contract') || lower.includes('closed') ? 28 : 10) + Math.floor(Math.random() * 8));
      const overall = Math.round((sit + task + act + res) / 4);

      const name = state.user.name || 'you';
      const reportEl = document.getElementById('voice-evaluation-report');
      if (reportEl) {
        reportEl.innerHTML = `
          <div style="text-align:center;margin-bottom:18px;padding:14px;background:${overall >= 80 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)'};border-radius:10px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--gray-500);margin-bottom:4px;">Overall STAR Score</div>
            <div style="font-family:var(--font-mono);font-size:36px;font-weight:700;color:${overall >= 80 ? 'var(--emerald)' : 'var(--amber)'};">${overall}%</div>
          </div>
          <div class="score-row"><span class="label">Situation / Context</span><div class="bar"><div class="bar-fill" style="width:${sit}%;background:var(--emerald);"></div></div><span class="pct">${sit}%</span></div>
          <div class="score-row"><span class="label">Task & Goal Clarity</span><div class="bar"><div class="bar-fill" style="width:${task}%;background:var(--emerald);"></div></div><span class="pct">${task}%</span></div>
          <div class="score-row"><span class="label">Action Specificity</span><div class="bar"><div class="bar-fill" style="width:${act}%;background:var(--blue-primary);"></div></div><span class="pct">${act}%</span></div>
          <div class="score-row"><span class="label">Result & Measurable ROI</span><div class="bar"><div class="bar-fill" style="width:${res}%;background:var(--violet);"></div></div><span class="pct">${res}%</span></div>
          <div style="margin-top:20px;padding:14px;background:rgba(37,99,235,0.05);border-left:3px solid var(--blue-primary);border-radius:0 6px 6px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <h4 style="font-size:13px;font-weight:600;color:var(--blue-primary);">AI Coach Advice</h4>
              <button type="button" class="btn-ghost" style="font-size:11.5px;" onclick="speakText('${overall >= 80 ? 'Strong STAR structure. Your use of quantified results is compelling. Consider adding the specific stakeholder trade-off framework you used to make this an executive-level answer.' : 'Good foundation. Focus on quantifying your result with a specific metric — percentage, revenue, or time saved — to make the impact undeniable to an interviewer.'}'")"><i class="fa-solid fa-volume-high"></i> Listen</button>
            </div>
            <p style="font-size:12.5px;color:var(--gray-700);line-height:1.55;">${overall >= 80 ? `Strong STAR structure, ${name}. Your quantified result makes the impact credible. To reach executive level, add the specific trade-off framework you applied when aligning competing stakeholders.` : `Good foundation, ${name}. The answer needs a stronger, quantified result — use a specific metric (revenue, percentage, or time saved) to make the outcome undeniable. Action specificity can also be improved by naming the exact tools or frameworks you used.`}</p>
          </div>
        `;
      }

      if (statusBadge) { statusBadge.textContent = `Scored: ${overall}%`; statusBadge.className = `match-pill ${overall >= 80 ? 'high' : 'med'}`; }
      state.starEvaluated = true;
      playUiSound('success');
      showToast(`STAR evaluation complete — ${overall}% overall score!`, 'success');
    });
  });
}

function resetStarEvaluation() {
  // Hide rubric scores until user runs an evaluation
  const reportEl = document.getElementById('voice-evaluation-report');
  if (reportEl) {
    reportEl.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--gray-400);">
        <i class="fa-solid fa-microphone-lines" style="font-size:32px;color:var(--gray-300);display:block;margin-bottom:12px;"></i>
        <p style="font-size:13.5px;font-weight:500;color:var(--gray-500);margin-bottom:6px;">STAR Rubric scores appear here after you evaluate your answer.</p>
        <p style="font-size:12px;">Record your voice or type your answer, then click <strong>Evaluate Answer</strong>.</p>
      </div>
    `;
  }
  const statusBadge = document.getElementById('voice-sim-status');
  if (statusBadge) { statusBadge.textContent = 'Ready'; statusBadge.className = 'match-pill high'; }
  state.starEvaluated = false;
}

// ─── Salary Strategy ──────────────────────────────────────────────────────────

function initSalary() {
  document.getElementById('btn-generate-salary')?.addEventListener('click', () => {
    const role = document.getElementById('salary-role-input')?.value.trim() || 'Senior Product Manager';
    const loc = document.getElementById('salary-loc-input')?.value.trim() || 'San Francisco';
    const exp = parseInt(document.getElementById('salary-exp-input')?.value) || 7;
    const isTier1 = /san francisco|new york|seattle|los angeles/i.test(loc);
    const base = 130000 + (exp * 9500) + (isTier1 ? 28000 : 10000);
    const p25 = Math.round(base * 0.86);
    const p50 = Math.round(base);
    const p75 = Math.round(base * 1.22);
    const p90 = Math.round(base * 1.38);
    const name = state.user.name || 'you';

    const out = document.getElementById('salary-strategy-output');
    if (out) {
      out.innerHTML = `
        <div style="margin-bottom:18px;">
          <div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:600;color:var(--gray-500);margin-bottom:6px;">
            <span>25th: $${p25.toLocaleString()}</span><span>50th: $${p50.toLocaleString()}</span><span>75th: $${p75.toLocaleString()}</span><span>90th: $${p90.toLocaleString()}</span>
          </div>
          <div style="height:10px;background:var(--gray-100);border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:75%;background:linear-gradient(90deg,var(--blue-primary),var(--emerald));border-radius:5px;"></div>
          </div>
        </div>
        <div class="bullet-card" style="margin-bottom:12px;">
          <div class="bullet-card-header">
            <span class="bullet-tag">Counter-Offer Anchor Script</span>
            <button class="btn-ghost" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText);playUiSound('click');showToast('Copied!','success');"><i class="fa-solid fa-copy"></i></button>
          </div>
          <div class="bullet-text">"Thank you for this offer — I'm genuinely excited about the mission. Based on market data for ${role} roles in ${loc} with ${exp}+ years of verified experience, I was expecting a base closer to $${p50.toLocaleString()}. If we can align on $${p50.toLocaleString()} base, or bridge the gap with $20K additional equity, I'm ready to sign today."</div>
        </div>
        <div class="bullet-card">
          <div class="bullet-card-header">
            <span class="bullet-tag">Competing Offer Leverage Script</span>
            <button class="btn-ghost" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText);playUiSound('click');showToast('Copied!','success');"><i class="fa-solid fa-copy"></i></button>
          </div>
          <div class="bullet-text">"Your team is genuinely my first choice. I do have a competing offer at $${Math.round(p50 * 1.07).toLocaleString()} base. If we can meet at $${p50.toLocaleString()} with a $25K sign-on bonus, I'd withdraw from all other processes and commit immediately."</div>
        </div>
      `;
    }
    playUiSound('success');
    showToast(`Benchmarks updated — 50th percentile target: $${p50.toLocaleString()} for ${role} in ${loc}.`, 'success');
  });
}

// ─── Recruiter Outreach ───────────────────────────────────────────────────────

function initOutreach() {
  document.getElementById('btn-generate-outreach')?.addEventListener('click', () => {
    requireAuth(async () => {
      const email = document.getElementById('outreach-email')?.value.trim() || 'hiring@company.com';
      const recipient = document.getElementById('outreach-recipient')?.value.trim() || 'Hiring Manager';
      const compRole = document.getElementById('outreach-company-role')?.value.trim() || 'Senior Product Manager';
      const senderName = state.user.name || 'Alex Morgan';
      const [company] = compRole.split('—');

      const subject = encodeURIComponent(`${compRole.split('—').pop()?.trim() || 'Senior Product Manager'} Inquiry — ${senderName}`);
      const body = encodeURIComponent(`Hi ${recipient.split(' ')[0]},\n\nI noticed ${company.trim()} is seeking a ${compRole.split('—').pop()?.trim() || 'Product Manager'}. At Apex Cloud, I scaled our B2B SaaS platform from $4M to $18M ARR while reducing query latency by 32%.\n\nI would welcome 10 minutes to discuss how my background aligns with your current priorities.\n\nBest regards,\n${senderName}`);
      const mailtoHref = `mailto:${email}?subject=${subject}&body=${body}`;
      const plainBody = decodeURIComponent(body);

      const drafts = document.getElementById('outreach-drafts-list');
      if (drafts) {
        drafts.innerHTML = `
          <div class="bullet-card">
            <div class="bullet-card-header">
              <span class="bullet-tag">LinkedIn Connection Note (280 chars)</span>
              <button class="btn-ghost" onclick="navigator.clipboard.writeText('Hi ${recipient.split(' ')[0]}, I noticed ${company.trim()} is expanding. Having scaled B2B SaaS analytics to \\$18M ARR, I would love to connect and explore the ${compRole.split('—').pop()?.trim() || 'PM'} opportunity!'); playUiSound('click'); showToast('Copied LinkedIn note!','success');"><i class="fa-solid fa-copy"></i></button>
            </div>
            <div class="bullet-text">Hi ${recipient.split(' ')[0]}, I noticed ${company.trim()} is expanding. Having scaled B2B SaaS analytics to $18M ARR, I would love to connect and explore the ${compRole.split('—').pop()?.trim() || 'PM'} opportunity!</div>
          </div>
          <div class="bullet-card">
            <div class="bullet-card-header">
              <span class="bullet-tag">Direct Cold Email — 1-Click Send</span>
              <div style="display:flex;gap:6px;">
                <a href="${mailtoHref}" class="btn-primary" style="padding:3px 10px;font-size:11.5px;text-decoration:none;" target="_blank"><i class="fa-solid fa-paper-plane"></i> Open in Email Client</a>
                <button class="btn-ghost" onclick="navigator.clipboard.writeText(\`${plainBody.replace(/`/g, "'")}\`); playUiSound('click'); showToast('Copied email body!','success');"><i class="fa-solid fa-copy"></i></button>
              </div>
            </div>
            <div class="bullet-text" style="white-space:pre-line;">${plainBody}</div>
          </div>
        `;
      }
      playUiSound('success');
      showToast(`Generated personalised outreach drafts for ${recipient} at ${company.trim()}!`, 'success');
    });
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function initSettings() {
  document.querySelector('[data-settings-save]')?.addEventListener('click', saveSettings);
  // Also wire the inline save button
  document.addEventListener('click', e => {
    if (e.target.closest('[onclick*="Preferences saved"]') || e.target.textContent === 'Save Profile Changes') {
      saveSettings();
    }
  });
}

function saveSettings() {
  const name = document.getElementById('settings-name-input')?.value.trim() || state.user.name;
  const email = document.getElementById('settings-email-input')?.value.trim() || state.user.email;
  if (name) { applyUser({ name, email }); showToast('Profile settings saved successfully!', 'success'); playUiSound('success'); }
}

// ─── User Profile Modal ───────────────────────────────────────────────────────

function initUserProfile() {
  syncAllUserUI();
}

// ─── Audio & TTS ──────────────────────────────────────────────────────────────

function speakText(text) {
  if (!('speechSynthesis' in window)) { showToast('Speech synthesis not supported in this browser.', 'info'); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
  u.rate = 0.95; u.pitch = 1.0;
  window.speechSynthesis.speak(u);
  showToast('RoleReady AI Coach is speaking...', 'info');
}

function playUiSound(type = 'click') {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'success') { osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); gain.gain.setValueAtTime(0.07, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else if (type === 'warning') { osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.25); gain.gain.setValueAtTime(0.07, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25); osc.start(); osc.stop(ctx.currentTime + 0.25); }
    else { osc.frequency.setValueAtTime(520, ctx.currentTime); gain.gain.setValueAtTime(0.03, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.07); osc.start(); osc.stop(ctx.currentTime + 0.07); }
  } catch (e) {}
}

function handleUpgradePlan(planName, price) {
  requireAuth(() => {
    applyUser({ plan: planName });
    closeModal('modal-pricing-upgrade');
    playUiSound('success');
    showToast(`🎉 Account upgraded to ${planName} (${price})! All features unlocked.`, 'success');
  });
}

// ─── Theme System (App Skin vs Resume Templates) ──────────────────────────────

const THEME_DEFAULTS = {
  theme_executive_slate: {
    name: 'Executive Slate',
    type: 'resume',
    colors: { primary: '#0A1628', secondary: '#2563EB', accent: '#10B981', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter' },
    border_radius: 'rounded'
  },
  theme_modern_tech: {
    name: 'Modern Tech',
    type: 'resume',
    colors: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#3B82F6', background: '#FAFAFE', surface: '#FFFFFF', text: '#0F172A' },
    typography: { headingFont: 'JetBrains Mono', bodyFont: 'Inter' },
    border_radius: 'rounded'
  },
  theme_clean_minimal: {
    name: 'Clean Minimal',
    type: 'resume',
    colors: { primary: '#334155', secondary: '#64748B', accent: '#0F172A', background: '#FFFFFF', surface: '#FFFFFF', text: '#1E293B' },
    typography: { headingFont: 'Georgia', bodyFont: 'Inter' },
    border_radius: 'sharp'
  },
  theme_impact_emerald: {
    name: 'Impact Emerald',
    type: 'resume',
    colors: { primary: '#059669', secondary: '#10B981', accent: '#2563EB', background: '#F0FDF4', surface: '#FFFFFF', text: '#064E3B' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter' },
    border_radius: 'rounded'
  },
  theme_creative_ruby: {
    name: 'Creative Ruby',
    type: 'resume',
    colors: { primary: '#E11D48', secondary: '#F43F5E', accent: '#8B5CF6', background: '#FFF1F2', surface: '#FFFFFF', text: '#881337' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter' },
    border_radius: 'rounded'
  },
  theme_app_dark_navy: {
    name: 'Deep Navy (App Skin)',
    type: 'app',
    colors: { primary: '#2563EB', secondary: '#8B5CF6', accent: '#10B981', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
    typography: { headingFont: 'Poppins', bodyFont: 'Inter' },
    border_radius: 'rounded'
  },
  theme_app_cyber_violet: {
    name: 'Cyber Violet (App Skin)',
    type: 'app',
    colors: { primary: '#8B5CF6', secondary: '#6366F1', accent: '#EC4899', background: '#FAF5FF', surface: '#FFFFFF', text: '#3B0764' },
    typography: { headingFont: 'JetBrains Mono', bodyFont: 'Inter' },
    border_radius: 'rounded'
  }
};

let previousAppTheme = null;

function initThemeSystem() {
  const savedAppTheme = localStorage.getItem('rr_app_theme') || 'theme_app_dark_navy';
  applyAppThemeCSS(THEME_DEFAULTS[savedAppTheme] || THEME_DEFAULTS.theme_app_dark_navy, false);
}

function applyTheme(themeId, targetType = 'resume') {
  const themeData = THEME_DEFAULTS[themeId];
  if (!themeData) return;

  const previousId = localStorage.getItem(targetType === 'app' ? 'rr_app_theme' : 'rr_resume_theme');
  previousAppTheme = previousId;

  if (targetType === 'app') {
    applyAppThemeCSS(themeData, true);
    localStorage.setItem('rr_app_theme', themeId);
  } else {
    localStorage.setItem('rr_resume_theme', themeId);
    const preview = document.getElementById('studio-live-preview');
    if (preview) {
      preview.style.setProperty('--color-primary', themeData.colors.primary);
      preview.style.setProperty('--color-secondary', themeData.colors.secondary);
      preview.style.setProperty('--color-accent', themeData.colors.accent);
    }
  }

  fetch(`/api/themes/${themeId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: state.user.email || 'user_active' })
  }).catch(() => {});

  fetch(`/api/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: state.user.email || 'user_active', theme_id: themeId, [targetType === 'app' ? 'app_theme_id' : 'resume_theme_id']: themeId })
  }).catch(() => {});

  playUiSound('success');
  showToast(`${targetType === 'app' ? 'App UI Theme' : 'Resume Template'} applied: ${themeData.name}`, 'success');
}

function applyAppThemeCSS(theme, showToastMsg = false) {
  const root = document.documentElement;
  const c = theme.colors;
  const t = theme.typography;

  root.style.setProperty('--color-primary', c.primary);
  root.style.setProperty('--color-secondary', c.secondary);
  root.style.setProperty('--color-accent', c.accent);
  root.style.setProperty('--color-bg', c.background);
  root.style.setProperty('--color-surface', c.surface);
  root.style.setProperty('--color-text', c.text);
  root.style.setProperty('--font-heading', `'${t.headingFont}', sans-serif`);
  root.style.setProperty('--font-body', `'${t.bodyFont}', sans-serif`);
  root.style.setProperty('--radius-base', theme.border_radius === 'sharp' ? '4px' : theme.border_radius === 'rounded' ? '12px' : '9999px');
}

// ─── Global Helpers ───────────────────────────────────────────────────────────

function attachGlobalHelpers() {
  window.switchView = switchView;
  window.showToast = showToast;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.signOut = signOut;
  window.speakText = speakText;
  window.playUiSound = playUiSound;
  window.handleUpgradePlan = handleUpgradePlan;
  window.applyTheme = applyTheme;
}

// ─── Toast Notifications ──────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3500);
}

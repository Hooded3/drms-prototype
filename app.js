// ── State ─────────────────────────────────────────────────────────────────────
let currentUser  = { name:'Nickson', role:'admin', email:'nickson@portal.go.ke' };
let currentMemoId = null;
let currentProjectId = null;
let paymentStatus = 'pending';

// Document checklist items
const DOC_TYPES = [
  { id:'memo',       label:'Memo PDF',            hint:'Memo/imprest PDF' },
  { id:'rfi',        label:'RFI PDF',              hint:'Request for Invoice' },
  { id:'report',     label:'Report / Minutes PDF', hint:'Meeting report or minutes' },
  { id:'wticket',    label:'Work Ticket',          hint:'Driver/officer work ticket' },
  { id:'attendance', label:'Attendance List',      hint:'Signed attendance sheet' },
  { id:'receipts',   label:'Receipts',             hint:'Fuel, taxi, other receipts' },
  { id:'other',      label:'Other Docs',           hint:'Any additional documents' },
];

// Per-doc state: 'none' | 'uploaded' | 'na'
let docState = {};

// ── Sample project data ────────────────────────────────────────────────────────
const PROJECTS = {
  ahp: [
    { id:'p1', name:'Diani Whitehouse AHP', contractor:'Sihaam Construction Ltd', tender:'218', county:'Msambweni', color:'#0F3D91' },
    { id:'p2', name:'Matuga AHP',           contractor:'Blueswift Contractors',   tender:'234', county:'Matuga',    color:'#0F3D91' },
    { id:'p3', name:'Mokowe AHP',           contractor:'Parklane Construction',   tender:'217', county:'Lamu West', color:'#0F3D91' },
  ],
  institutions: [
    { id:'p4', name:'Taita Taveta University', contractor:'Azeco Investment Ltd',  tender:'537', county:'Mwatate',  color:'#16A34A' },
    { id:'p5', name:'Voi KMTC',               contractor:'Patience Services',      tender:'539', county:'Voi',      color:'#16A34A' },
  ],
  markets: [
    { id:'p6', name:'Diani Modern Market', contractor:'Biomax Africa Ltd',         tender:'184', county:'Msambweni', color:'#D97706' },
    { id:'p7', name:'Voi Modern Market',   contractor:'Buuti Enterprises Ltd',     tender:'628', county:'Voi',       color:'#D97706' },
  ],
};

// ── Sample memos per project ───────────────────────────────────────────────────
const MEMOS_DB = {
  p1: [
    { id:'m1',  ref:'SDHUD/RL/AHP/CST/NE/218/VOL.1(20-1)', purpose:'Facilitation towards corporate social responsibility', date:'30 Jun 2026', amount:'1,000,000', payee:'John Karanja & Hussein Ali', payStatus:'pending',  s2status:null, docs:{} },
    { id:'m2',  ref:'SDHUD/RL/CST/AHP/218/VOL.1(19)',       purpose:'Site beaconing facilitation',                          date:'22 Apr 2026', amount:'125,500',   payee:'Siti Mnyazi',               payStatus:'pending',  s2status:null, docs:{} },
    { id:'m3',  ref:'SDHUD/RL/AHP/CST/NE/218/VOL.1(20)',    purpose:'Facilitation towards affordable housing board activities', date:'10 Mar 2026', amount:'200,000', payee:'John Karanja & Hussein Ali', payStatus:'paid', s2status:'partially_surrendered', docs:{memo:'uploaded',rfi:'na',report:'uploaded',wticket:'na',attendance:'na',receipts:'na',other:'na'} },
    { id:'m4',  ref:'SDHUD/RL/AHP/CST/NE/218/VOL.1(17)',    purpose:'Facilitation — technical working retreat',             date:'19 Nov 2025', amount:'117,600',   payee:'John Karanja & Hussein Ali', payStatus:'paid', s2status:'not_surrendered', docs:{} },
    { id:'m5',  ref:'SDHUD/RL/AHP/CST/NE/218/VOL.1(12)',    purpose:'Office facilitation',                                  date:'25 Jul 2025', amount:'500,000',   payee:'John Karanja & Hussein Ali', payStatus:'pending',  s2status:null, docs:{} },
  ],
  p2: [
    { id:'m6',  ref:'SDHUD/AHP/CRG/234/VOL.1(31)',          purpose:'Facilitation for site meeting',                        date:'26 May 2026', amount:'121,500',   payee:'Mnyazi Zuma',               payStatus:'pending',  s2status:null, docs:{} },
    { id:'m7',  ref:'SDHUD/RL/AHP/CRG/234/VOL.1(13)',       purpose:'Presidential visit',                                   date:'21 May 2026', amount:'250,000',   payee:'John Karanja & Hussein Ali', payStatus:'paid', s2status:'partially_surrendered', docs:{memo:'uploaded',rfi:'uploaded',report:'uploaded',wticket:'uploaded',attendance:'uploaded',receipts:'uploaded',other:'na'} },
    { id:'m8',  ref:'SDHUD/AHP/CRG/234/VOL.1(018)',         purpose:'Facilitation of ESIA full study',                      date:'13 Apr 2026', amount:'282,000',   payee:'Anthony Ng\'ang\'a',        payStatus:'pending',  s2status:null, docs:{} },
  ],
  p3: [
    { id:'m9',  ref:'SDHUD/RL/AHP/CRG/217/VOL.1(13)',       purpose:'Facilitation — site meeting 11',                       date:'2 Feb 2026',  amount:'24,800',    payee:'John Nyaga',                payStatus:'pending',  s2status:null, docs:{} },
    { id:'m10', ref:'SDHUD/RL/AHP/CRG/217/VOL.1(12)',       purpose:'Office of the project managers representative',        date:'19 Nov 2025', amount:'181,200',   payee:'Robert Oloo',               payStatus:'paid', s2status:'partially_surrendered', docs:{memo:'uploaded',rfi:'na',report:'na',wticket:'uploaded',attendance:'na',receipts:'na',other:'na'} },
  ],
  p4: [
    { id:'m11', ref:'MLPWHUD/SDHUD/TTAV/AHP/18/12',         purpose:'Site meeting 03',                                      date:'14 May 2026', amount:'68,800',    payee:'Peter Kinyua',              payStatus:'pending',  s2status:null, docs:{} },
    { id:'m12', ref:'SDHUD/AHP/CRG/537/VOL.1(08)',          purpose:'Facilitation for ESIA full study',                     date:'21 Apr 2026', amount:'289,000',   payee:'Anthony Ng\'ang\'a',        payStatus:'pending',  s2status:null, docs:{} },
  ],
  p5: [
    { id:'m13', ref:'SDHUD/RL/AHP/CRG/539/VOL.1(20)',       purpose:'Instruction for payment in support of CSR initiative', date:'26 Jun 2026', amount:'100,000',   payee:'Weaver Bird',               payStatus:'pending',  s2status:null, docs:{} },
    { id:'m14', ref:'SDHUD/RL/CST/NE/AHP/539/VOL.1(11)',    purpose:'Site meeting',                                         date:'25 Jun 2026', amount:'38,600',    payee:'Siti Zuma',                 payStatus:'paid', s2status:'partially_surrendered', docs:{memo:'uploaded',rfi:'uploaded',report:'uploaded',wticket:'uploaded',attendance:'uploaded',receipts:'uploaded',other:'uploaded'} },
  ],
  p6: [
    { id:'m15', ref:'SDHUD/CRG/2023-2024/184/VOL.1(56/1)',  purpose:'Project managers representative office facilitation',  date:'24 Feb 2026', amount:'1,000,000', payee:'John Karanja & Hussein Ali', payStatus:'pending',  s2status:null, docs:{} },
  ],
  p7: [
    { id:'m16', ref:'SDHUD/RL/CST/AHP/628/VOL.1(04)',       purpose:'Facilitation — site meeting 01',                       date:'4 Mar 2026',  amount:'197,500',   payee:'Siti Zuma',                 payStatus:'paid', s2status:'not_surrendered', docs:{} },
  ],
};

// Extra projects added at runtime
let extraProjects = [];

// ── Login ─────────────────────────────────────────────────────────────────────
function login() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  updateUserChip();
}

function switchLoginUser() {
  const sel = document.getElementById('login-user');
  const map = {
    nickson: { name:'Nickson',       role:'admin',   email:'nickson@portal.go.ke',  badge:'Administrator' },
    james:   { name:'James Mwangi',  role:'officer', email:'j.mwangi@portal.go.ke', badge:'Records Officer' },
    sarah:   { name:'Sarah Achieng', role:'manager', email:'s.achieng@portal.go.ke',badge:'Manager' },
    brian:   { name:'Brian Otieno',  role:'viewer',  email:'b.otieno@portal.go.ke', badge:'Viewer' },
  };
  const u = map[sel.value];
  currentUser = u;
  document.getElementById('login-email').value  = u.email;
  document.getElementById('login-role-badge').textContent = u.badge;
}

function updateUserChip() {
  const el_name   = document.getElementById('topbar-username');
  const el_role   = document.getElementById('topbar-role');
  const el_avatar = document.getElementById('topbar-avatar');
  if (el_name)   el_name.textContent   = currentUser.name;
  if (el_role)   el_role.textContent   = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  if (el_avatar) el_avatar.textContent = currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  // Also update sidebar foot
  const foot = document.querySelector('.sb-foot b');
  if (foot) foot.textContent = currentUser.name;
}

// ── Navigation ────────────────────────────────────────────────────────────────
function go(pageId, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    const match = document.querySelector('.navitem[data-page="' + pageId + '"]');
    if (match) match.classList.add('active');
  }
  document.querySelector('.content').scrollTo(0,0);
  window.scrollTo(0,0);
  closeSidebar();
}

// ── Sidebar (mobile) ─────────────────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('visible');
}

// ── Modals ────────────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); });

// ── Project list view ──────────────────────────────────────────────────────────
// ========== UPDATED: AHP NOW WORKS LIKE OTHER MODULES ==========
function openProjectDetail(moduleName, color) {
  // AHP is now treated as a multi-project module (like Institutions & Markets)
  // It should go to openModuleList(), not directly to a single project.
  
  // Only for single-module groups (Office, EIA, Internal Memo) do we go direct to memos.
  const singleModules = ['Office', 'EIA & Power Connection', 'Internal Memo'];
  
  if (singleModules.includes(moduleName)) {
    const map = {
      'Office':               { id:'office-main', name:'Office Records (VOL 1 & 2)', contractor:'Internal', tender:'—', county:'HQ', color },
      'EIA & Power Connection':{ id:'eia-main',   name:'EIA & Power Connection',      contractor:'Various',  tender:'—', county:'Coast Region', color },
      'Internal Memo':        { id:'im-main',      name:'General Internal Memos',      contractor:'Internal', tender:'—', county:'HQ', color },
    };
    const proj = map[moduleName];
    if (proj) {
      loadProjectDetail(proj.id, proj.name, proj.contractor, proj.tender, proj.county, color, []);
    }
  } else {
    // For AHP, Institutions, Markets, show sub-project list
    openModuleList(moduleName, color);
  }
}

function openModuleList(moduleName, color) {
  // For multi-project modules (AHP, Institutions, Markets) show sub-project list
  const keyMap = { AHP:'ahp', Institutions:'institutions', Markets:'markets' };
  const key = keyMap[moduleName];
  const projs = (PROJECTS[key] || []).concat(extraProjects.filter(p => p.module === moduleName));

  document.getElementById('detail-name').textContent = moduleName + ' — Select a Sub-Project';
  document.getElementById('detail-meta').textContent = projs.length + ' sub-projects registered';
  document.getElementById('detail-icon').style.background = color;
  document.getElementById('detail-total').textContent = projs.length;
  document.getElementById('detail-pending').textContent = '—';
  document.getElementById('detail-surrendered').textContent = '—';

  const list = document.getElementById('memo-list');
  list.innerHTML = '';

  projs.forEach(p => {
    const memos = MEMOS_DB[p.id] || [];
    const pending = memos.filter(m => m.payStatus === 'pending').length;
    const surr = memos.filter(m => m.s2status === 'partially_surrendered').length;

    const card = document.createElement('div');
    card.style.cssText = 'background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-bottom:8px;';
    card.onmouseover = () => card.style.borderColor = color;
    card.onmouseout  = () => card.style.borderColor = '#E2E8F0';
    card.innerHTML = `
      <div>
        <div style="font-size:14px;font-weight:600;margin-bottom:3px;">${p.name}</div>
        <div style="font-size:11.5px;color:#64748B;">${p.contractor} · T.NO ${p.tender} · ${p.county}</div>
      </div>
      <div style="display:flex;gap:18px;align-items:center;">
        <div style="text-align:center"><div style="font-size:16px;font-weight:700;font-family:'Poppins',sans-serif;">${memos.length}</div><div style="font-size:10px;color:#64748B;">Memos</div></div>
        <div style="text-align:center"><div style="font-size:16px;font-weight:700;font-family:'Poppins',sans-serif;color:#F59E0B;">${pending}</div><div style="font-size:10px;color:#64748B;">Pending</div></div>
        <button style="padding:7px 14px;border-radius:7px;border:1.5px solid ${color};background:#fff;color:${color};font-size:12px;font-weight:600;cursor:pointer;">Open →</button>
      </div>`;
    card.querySelector('button').onclick = () => loadProjectDetail(p.id, p.name, p.contractor, p.tender, p.county, color, MEMOS_DB[p.id] || []);
    list.appendChild(card);
  });

  // Add new project shortcut inside module
  const addBtn = document.createElement('div');
  addBtn.style.cssText = 'border:2px dashed #C9D5EC;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:10px;cursor:pointer;color:#64748B;font-size:13px;font-weight:500;';
  addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add new ${moduleName} sub-project`;
  addBtn.onclick = () => { document.getElementById('np-module').value = moduleName; openModal('add-project-modal'); };
  list.appendChild(addBtn);

  go('project-detail');
}

function loadProjectDetail(projId, name, contractor, tender, county, color, memos) {
  currentProjectId = projId;

  document.getElementById('detail-name').textContent = name;
  document.getElementById('detail-meta').textContent = `Contractor: ${contractor} · T.NO: ${tender} · ${county}`;
  document.getElementById('detail-icon').style.background = color;

  const memoData = MEMOS_DB[projId] || memos;
  const pending  = memoData.filter(m => m.payStatus === 'pending').length;
  const surr     = memoData.filter(m => m.s2status === 'partially_surrendered').length;

  document.getElementById('detail-total').textContent     = memoData.length;
  document.getElementById('detail-pending').textContent   = pending;
  document.getElementById('detail-surrendered').textContent = surr;

  document.getElementById('add-memo-project-name').textContent = 'Project: ' + name;

  renderMemoList(memoData);
  go('project-detail');
}

// ── Render memo list ──────────────────────────────────────────────────────────
function renderMemoList(memos, filter='all', search='') {
  const list = document.getElementById('memo-list');
  list.innerHTML = '';

  let filtered = memos;
  if (filter !== 'all') filtered = filtered.filter(m => {
    if (filter === 'pending')              return m.payStatus === 'pending';
    if (filter === 'paid')                 return m.payStatus === 'paid' && !m.s2status;
    if (filter === 'partially_surrendered') return m.s2status === 'partially_surrendered';
    if (filter === 'not_surrendered')      return m.s2status === 'not_surrendered';
    return true;
  });
  if (search) filtered = filtered.filter(m =>
    m.ref.toLowerCase().includes(search) ||
    m.purpose.toLowerCase().includes(search) ||
    (m.payee||'').toLowerCase().includes(search)
  );

  if (!filtered.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:#94A3B8;font-size:13px;">No memos found</div>';
    return;
  }

  filtered.forEach(m => {
    const s2 = m.s2status;
    let stage1Badge = m.payStatus === 'paid'
      ? '<span class="stage-pill s-paid">Paid</span>'
      : '<span class="stage-pill s-pending">Pending</span>';

    let stage2Badge = '';
    if (m.payStatus === 'paid') {
      if (s2 === 'partially_surrendered') {
        stage2Badge = '<span class="stage-pill s-partial">Partially Surrendered</span>';
      } else {
        stage2Badge = '<span class="stage-pill s-not-surr">Not Surrendered</span>';
      }
    }

    const row = document.createElement('div');
    row.className = 'memo-item';
    row.innerHTML = `
      <div class="memo-left">
        <div class="memo-ref">${m.ref || '—'}</div>
        <div class="memo-purpose">${m.purpose}</div>
        <div class="memo-meta">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${m.date}</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>KES ${m.amount}</span>
          ${m.payee ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${m.payee}</span>` : ''}
        </div>
      </div>
      <div class="memo-right">
        <div class="stage-wrap">${stage1Badge} ${stage2Badge}</div>
        <button class="update-btn" onclick="openStatusModal('${m.id}')">Update</button>
      </div>`;
    list.appendChild(row);
  });
}

function filterMemos(val) {
  const memos = MEMOS_DB[currentProjectId] || [];
  const search = document.querySelector('#page-project-detail input[type=text]').value.toLowerCase();
  renderMemoList(memos, val, search);
}
function searchMemos(val) {
  const memos = MEMOS_DB[currentProjectId] || [];
  const filter = document.querySelector('#page-project-detail select').value;
  renderMemoList(memos, filter, val.toLowerCase());
}

// ── Status Modal ──────────────────────────────────────────────────────────────
function openStatusModal(memoId) {
  currentMemoId = memoId;
  const allMemos = Object.values(MEMOS_DB).flat();
  const memo = allMemos.find(m => m.id === memoId);
  if (!memo) return;

  document.getElementById('modal-ref').textContent = 'REF: ' + (memo.ref || '—');

  // Reset doc state from memo
  docState = { ...memo.docs };

  // Set stage 1
  paymentStatus = memo.payStatus || 'pending';
  selectPaymentStatus(paymentStatus, false);

  // Build doc grid
  buildDocGrid();

  // If already paid show doc section
  if (paymentStatus === 'paid') {
    document.getElementById('doc-section').classList.add('visible');
    evaluateAutoStatus();
  }

  openModal('status-modal');
}

function selectPaymentStatus(status, fromClick = true) {
  paymentStatus = status;
  document.getElementById('opt-pending').classList.toggle('selected-pending', status === 'pending');
  document.getElementById('opt-paid').classList.toggle('selected-paid', status === 'paid');
  const docSec = document.getElementById('doc-section');
  if (status === 'paid') {
    docSec.classList.add('visible');
    buildDocGrid();
    evaluateAutoStatus();
  } else {
    docSec.classList.remove('visible');
    document.getElementById('auto-status-banner').classList.remove('show');
  }
}

function buildDocGrid() {
  const grid = document.getElementById('doc-grid');
  grid.innerHTML = '';
  DOC_TYPES.forEach((doc, i) => {
    const state = docState[doc.id] || 'none';
    const row = document.createElement('div');
    row.className = 'doc-row' + (state === 'uploaded' ? ' uploaded' : state === 'na' ? ' na' : '');
    row.id = 'doc-row-' + doc.id;
    row.innerHTML = `
      <div class="doc-row-left">
        <div class="doc-num">${i+1}</div>
        <div class="doc-name">${doc.label}<small>${doc.hint}</small></div>
      </div>
      <div class="doc-actions">
        <button class="doc-upload-btn ${state === 'uploaded' ? 'done' : ''}" id="upload-btn-${doc.id}" onclick="uploadDoc('${doc.id}')">
          ${state === 'uploaded' ? '✓ Uploaded' : '↑ Upload'}
        </button>
        <label class="na-check">
          <input type="checkbox" id="na-${doc.id}" ${state === 'na' ? 'checked' : ''} onchange="toggleNA('${doc.id}', this.checked)" /> N/A
        </label>
      </div>`;
    grid.appendChild(row);
  });
}

function uploadDoc(docId) {
  // Simulate upload
  docState[docId] = 'uploaded';
  // Uncheck NA
  const naCheck = document.getElementById('na-' + docId);
  if (naCheck) naCheck.checked = false;
  // Update row
  const row = document.getElementById('doc-row-' + docId);
  row.className = 'doc-row uploaded';
  const btn = document.getElementById('upload-btn-' + docId);
  btn.textContent = '✓ Uploaded';
  btn.classList.add('done');
  evaluateAutoStatus();
}

function toggleNA(docId, checked) {
  if (checked) {
    docState[docId] = 'na';
    const row = document.getElementById('doc-row-' + docId);
    row.className = 'doc-row na';
    const btn = document.getElementById('upload-btn-' + docId);
    btn.textContent = '↑ Upload';
    btn.classList.remove('done');
  } else {
    docState[docId] = 'none';
    document.getElementById('doc-row-' + docId).className = 'doc-row';
  }
  evaluateAutoStatus();
}

function evaluateAutoStatus() {
  const banner = document.getElementById('auto-status-banner');
  const allResolved = DOC_TYPES.every(d => docState[d.id] === 'uploaded' || docState[d.id] === 'na');
  const anyUploaded = DOC_TYPES.some(d => docState[d.id] === 'uploaded');
  const allNA       = DOC_TYPES.every(d => docState[d.id] === 'na');

  if (!allResolved) {
    banner.classList.remove('show', 'partial', 'not-surr');
    return;
  }

  banner.classList.add('show');
  if (anyUploaded && !allNA) {
    banner.classList.add('partial');
    banner.classList.remove('not-surr');
    document.getElementById('auto-status-icon').style.color = '#7C3AED';
    document.getElementById('auto-status-text').textContent = '① Partially Surrendered';
    document.getElementById('auto-status-desc').textContent = 'Some documents uploaded — memo will be marked partially surrendered';
  } else {
    banner.classList.add('not-surr');
    banner.classList.remove('partial');
    document.getElementById('auto-status-icon').style.color = '#EF4444';
    document.getElementById('auto-status-text').textContent = '② Not Surrendered';
    document.getElementById('auto-status-desc').textContent = 'Paid but no documents uploaded — memo marked not surrendered';
  }
}

function saveStatus() {
  const allMemos = Object.values(MEMOS_DB).flat();
  const memo = allMemos.find(m => m.id === currentMemoId);
  if (!memo) return;

  memo.payStatus = paymentStatus;
  memo.docs = { ...docState };

  if (paymentStatus === 'pending') {
    memo.s2status = null;
  } else {
    // User note: Only 2 surrender states.
    // Rule: If any document is uploaded (not N/A) -> Partially Surrendered.
    // Otherwise -> Not Surrendered.
    const anyUploaded = DOC_TYPES.some(d => docState[d.id] === 'uploaded');

    if (anyUploaded) {
      memo.s2status = 'partially_surrendered';
    } else {
      memo.s2status = 'not_surrendered';
    }
  }

  closeModal('status-modal');
  // Refresh list
  const memos = MEMOS_DB[currentProjectId] || [];
  const filter = document.querySelector('#page-project-detail select').value;
  renderMemoList(memos, filter);

  // Update header stats
  const pending = memos.filter(m => m.payStatus === 'pending').length;
  const surr    = memos.filter(m => m.s2status === 'partially_surrendered' || m.s2status === 'fully_surrendered').length;
  document.getElementById('detail-pending').textContent   = pending;
  document.getElementById('detail-surrendered').textContent = surr;
}

// ── Add Project ───────────────────────────────────────────────────────────────
function saveNewProject() {
  const name       = document.getElementById('np-name').value.trim();
  const module_    = document.getElementById('np-module').value;
  const contractor = document.getElementById('np-contractor').value.trim();
  const county     = document.getElementById('np-county').value.trim();
  const tender     = document.getElementById('np-tender').value.trim();
  const status     = document.getElementById('np-status').value;

  if (!name) { alert('Please enter a project name'); return; }

  const newProj = {
    id: 'ep' + Date.now(),
    name, contractor, tender, county,
    module: module_, color: '#0F3D91', status
  };
  extraProjects.push(newProj);
  MEMOS_DB[newProj.id] = [];

  // Update card count
  const ahpCount = document.getElementById('ahp-count');
  if (ahpCount && module_ === 'AHP') {
    ahpCount.textContent = (PROJECTS.ahp.length + extraProjects.filter(p=>p.module==='AHP').length);
  }

  closeModal('add-project-modal');
  // Clear form
  ['np-name','np-contractor','np-county','np-tender'].forEach(id => document.getElementById(id).value = '');

  alert(`Project "${name}" added successfully.`);
}

// ── Add Memo ──────────────────────────────────────────────────────────────────
function openAddMemoModal() { openModal('add-memo-modal'); }

function saveNewMemo() {
  const ref     = document.getElementById('nm-ref').value.trim();
  const purpose = document.getElementById('nm-purpose').value.trim();
  const date    = document.getElementById('nm-date').value;
  const amount  = document.getElementById('nm-amount').value.trim();
  const payee   = document.getElementById('nm-payee').value.trim();
  const info    = document.getElementById('nm-info').value.trim();

  if (!purpose) { alert('Please enter a purpose'); return; }

  const newMemo = {
    id: 'm' + Date.now(),
    ref, purpose,
    date: date ? new Date(date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—',
    amount, payee, additional_info: info,
    payStatus: 'pending', s2status: null, docs: {}
  };

  if (!MEMOS_DB[currentProjectId]) MEMOS_DB[currentProjectId] = [];
  MEMOS_DB[currentProjectId].unshift(newMemo);

  closeModal('add-memo-modal');
  ['nm-ref','nm-purpose','nm-amount','nm-payee','nm-info'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('nm-date').value = '';

  const memos = MEMOS_DB[currentProjectId];
  document.getElementById('detail-total').textContent = memos.length;
  const filter = document.querySelector('#page-project-detail select').value;
  renderMemoList(memos, filter);
}

// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display = 'flex';
}

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser  = { name:'Nickson', role:'admin', email:'nickson@portal.go.ke' };
let currentMemoId = null;
let currentProjectId = null;
let paymentStatus = 'pending';
let importLocked = false;
let currentModuleName = '';
let notices = [
  { id:'n1', title:'Important: New Surrender Policy Effective Immediately', content:'All memos must be surrendered within 14 days of payment. Please ensure all documents are uploaded to the system before the deadline.', date:'2 Jul 2026', pinned:true, author:'Admin' },
  { id:'n2', title:'System Maintenance Scheduled for Friday', content:'The DRMS will be offline for scheduled maintenance on Friday, 10th July 2026 from 18:00 to 20:00 EAT. Please save all work before then.', date:'30 Jun 2026', pinned:false, author:'IT Department' },
  { id:'n3', title:'Reminder: Monthly Reports Due', content:'All project managers are reminded to submit their monthly expenditure reports by the 5th of every month. Late submissions will be flagged.', date:'28 Jun 2026', pinned:false, author:'Records Office' },
];

const DOC_TYPES = [
  { id:'memo',       label:'Memo PDF',            hint:'Memo/imprest PDF' },
  { id:'rfi',        label:'RFI PDF',              hint:'Request for Invoice' },
  { id:'report',     label:'Report / Minutes PDF', hint:'Meeting report or minutes' },
  { id:'wticket',    label:'Work Ticket',          hint:'Driver/officer work ticket' },
  { id:'attendance', label:'Attendance List',      hint:'Signed attendance sheet' },
  { id:'receipts',   label:'Receipts',             hint:'Fuel, taxi, other receipts' },
  { id:'other',      label:'Other Docs',           hint:'Any additional documents' },
];

let docState = {};

// ── Sample project data ────────────────────────────────────────────────────────
const PROJECTS = {
  ahp: [
    { id:'p1', name:'Diani Whitehouse AHP', contractor:'Sihaam Construction Ltd', tender:'218', county:'Msambweni', color:'#0F3D91', status:'active' },
    { id:'p2', name:'Matuga AHP',           contractor:'Blueswift Contractors',   tender:'234', county:'Matuga',    color:'#0F3D91', status:'active' },
    { id:'p3', name:'Mokowe AHP',           contractor:'Parklane Construction',   tender:'217', county:'Lamu West', color:'#0F3D91', status:'active' },
  ],
  institutions: [
    { id:'p4', name:'Taita Taveta University', contractor:'Azeco Investment Ltd',  tender:'537', county:'Mwatate',  color:'#16A34A', status:'active' },
    { id:'p5', name:'Voi KMTC',               contractor:'Patience Services',      tender:'539', county:'Voi',      color:'#16A34A', status:'active' },
  ],
  markets: [
    { id:'p6', name:'Diani Modern Market', contractor:'Biomax Africa Ltd',         tender:'184', county:'Msambweni', color:'#D97706', status:'active' },
    { id:'p7', name:'Voi Modern Market',   contractor:'Buuti Enterprises Ltd',     tender:'628', county:'Voi',       color:'#D97706', status:'active' },
  ],
  esp: [
    { id:'p8', name:'Maungu ESP Market',      contractor:'Snavem Enterprises Ltd',   tender:'287', county:'Voi',       color:'#0891B2', status:'active' },
    { id:'p9', name:'Mnarani ESP Market',     contractor:'Yatico Suppliers',         tender:'358', county:'Kilifi N',  color:'#0891B2', status:'active' },
  ],
  modern_markets: [
    { id:'p10', name:'Voi Township Modern Market', contractor:'Buuti Enterprises Ltd', tender:'628', county:'Voi', color:'#7C3AED', status:'active' },
    { id:'p11', name:'Makupa MUD',                contractor:'Whitespan Enterprises',  tender:'278', county:'Mvita', color:'#7C3AED', status:'active' },
  ],
  office: [
    { id:'p12', name:'Office Records (VOL 1 & 2)', contractor:'Internal', tender:'—', county:'HQ', color:'#DB2777', status:'active' },
  ],
  eia: [
    { id:'p13', name:'EIA & Power Connection', contractor:'Various', tender:'—', county:'Coast Region', color:'#0F3D91', status:'active' },
  ],
  internal_memo: [
    { id:'p14', name:'General Internal Memos', contractor:'Internal', tender:'—', county:'HQ', color:'#16A34A', status:'active' },
  ],
  assets: [
    { id:'p15', name:'County Asset Register', contractor:'Internal', tender:'—', county:'HQ', color:'#D97706', status:'active' },
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
  p8: [], p9: [], p10: [], p11: [], p12: [], p13: [], p14: [], p15: []
};

let extraProjects = [];

// ── Login ─────────────────────────────────────────────────────────────────────
function login() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  updateUserChip();
  applyRolePermissions();
  updateDashboard();
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
  const foot = document.querySelector('.sb-foot b');
  if (foot) foot.textContent = currentUser.name;
  document.getElementById('sb-role').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

// ── Role Permissions ──────────────────────────────────────────────────────────
function applyRolePermissions() {
  const isAdmin = currentUser.role === 'admin';
  const isOfficer = currentUser.role === 'officer' || isAdmin;
  const isManager = currentUser.role === 'manager' || isAdmin;

  document.getElementById('nav-import').style.display = isAdmin ? 'flex' : 'none';
  document.getElementById('btn-add-project').style.display = isAdmin ? 'flex' : 'none';
  document.getElementById('btn-add-memo').style.display = isOfficer ? 'flex' : 'none';
  document.getElementById('btn-add-memo-detail').style.display = isOfficer ? 'flex' : 'none';
  document.getElementById('btn-add-notice').style.display = isManager ? 'flex' : 'none';
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

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('visible');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); });

// ── Dashboard ──────────────────────────────────────────────────────────────────
function updateDashboard() {
  let totalProjects = 0;
  let pendingMemos = 0;
  let surrendered = 0;
  let totalAssets = 468;

  Object.keys(PROJECTS).forEach(key => { totalProjects += PROJECTS[key].length; });
  totalProjects += extraProjects.length;

  Object.values(MEMOS_DB).forEach(memos => {
    memos.forEach(m => {
      if (m.payStatus === 'pending') pendingMemos++;
      if (m.s2status === 'partially_surrendered' || m.s2status === 'fully_surrendered') surrendered++;
    });
  });

  document.getElementById('kpi-total-projects').textContent = totalProjects;
  document.getElementById('kpi-pending-memos').textContent = pendingMemos;
  document.getElementById('kpi-surrendered').textContent = surrendered;
  document.getElementById('kpi-total-assets').textContent = totalAssets;

  const total = pendingMemos + surrendered + 20;
  const pctSurrendered = Math.round((surrendered / total) * 100);
  const pctPending = Math.round((pendingMemos / total) * 100);
  document.getElementById('legend-surrendered').textContent = pctSurrendered + '%';
  document.getElementById('legend-pending').textContent = pctPending + '%';
  document.getElementById('legend-partial').textContent = Math.max(10, 100 - pctSurrendered - pctPending) + '%';
  document.getElementById('legend-overdue').textContent = Math.max(5, 100 - pctSurrendered - pctPending - 20) + '%';

  const ahpCount = document.getElementById('ahp-count');
  if (ahpCount) ahpCount.textContent = PROJECTS.ahp.length + extraProjects.filter(p=>p.module==='AHP').length;
}

// ── Projects Page ──────────────────────────────────────────────────────────────
function openModuleList(moduleName, color) {
  currentModuleName = moduleName;
  const keyMap = { 
    AHP:'ahp', Institutions:'institutions', Markets:'markets', 
    'ESP Markets':'esp', 'Modern Markets':'modern_markets',
    'Office':'office', 'EIA & Power Connection':'eia',
    'Internal Memo':'internal_memo', 'Assets':'assets'
  };
  const key = keyMap[moduleName];
  const projs = (PROJECTS[key] || []).concat(extraProjects.filter(p => p.module === moduleName));

  document.getElementById('detail-name').textContent = moduleName + ' — Sub-Projects';
  document.getElementById('detail-meta').textContent = projs.length + ' sub-projects registered';
  document.getElementById('detail-icon').style.background = color;
  document.getElementById('detail-total').textContent = projs.length;
  document.getElementById('detail-pending').textContent = '—';
  document.getElementById('detail-surrendered').textContent = '—';
  document.getElementById('add-memo-project-name').textContent = 'Project: ' + moduleName;

  renderSubProjectTable(projs, color);
  go('project-detail');
}

function renderSubProjectTable(projs, color) {
  const container = document.getElementById('project-sub-list');
  container.innerHTML = '';

  if (!projs.length) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#94A3B8;">No sub-projects found. Click "Add Sub-Project" to create one.</div>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:44px;text-align:center;">#</th>
        <th style="min-width:200px;">Project Name</th>
        <th style="min-width:180px;">Contractor</th>
        <th style="min-width:120px;">County</th>
        <th style="min-width:100px;">Tender No.</th>
        <th style="min-width:80px;text-align:center;">Memos</th>
        <th style="min-width:80px;text-align:center;">Pending</th>
        <th style="min-width:100px;text-align:center;">Status</th>
        <th style="width:80px;text-align:center;"></th>
      </tr>
    </thead>
    <tbody id="sub-proj-tbody"></tbody>
  `;
  container.appendChild(table);

  const tbody = document.getElementById('sub-proj-tbody');
  projs.forEach((p, i) => {
    const memos = MEMOS_DB[p.id] || [];
    const pending = memos.filter(m => m.payStatus === 'pending').length;
    const statusClass = p.status || 'active';
    
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.onmouseover = () => row.style.background = '#F8FAFC';
    row.onmouseout  = () => row.style.background = '';
    row.onclick = () => loadProjectDetail(p.id, p.name, p.contractor, p.tender, p.county, color, MEMOS_DB[p.id] || []);
    
    row.innerHTML = `
      <td class="row-index">${i+1}</td>
      <td class="proj-name">${p.name}</td>
      <td class="contractor">${p.contractor}</td>
      <td class="county">${p.county}</td>
      <td class="tender">${p.tender}</td>
      <td class="stat-cell memos">${memos.length}</td>
      <td class="stat-cell pending">${pending}</td>
      <td style="text-align:center;">
        <span class="status-badge ${statusClass}">${statusClass.replace('_', ' ')}</span>
      </td>
      <td style="text-align:center;">
        <button class="open-btn">Open</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  const addRow = document.createElement('tr');
  addRow.className = 'add-row';
  addRow.style.cursor = 'pointer';
  addRow.onclick = () => { document.getElementById('np-module').value = currentModuleName; openModal('add-project-modal'); };
  addRow.innerHTML = `
    <td colspan="9">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px;"><path d="M12 5v14M5 12h14"/></svg>
      Add new ${currentModuleName} sub-project
    </td>
  `;
  tbody.appendChild(addRow);
}

function searchSubProjects(val) {
  const keyMap = { 
    AHP:'ahp', Institutions:'institutions', Markets:'markets', 
    'ESP Markets':'esp', 'Modern Markets':'modern_markets',
    'Office':'office', 'EIA & Power Connection':'eia',
    'Internal Memo':'internal_memo', 'Assets':'assets'
  };
  const key = keyMap[currentModuleName];
  let projs = (PROJECTS[key] || []).concat(extraProjects.filter(p => p.module === currentModuleName));
  
  if (val) {
    const search = val.toLowerCase();
    projs = projs.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.contractor.toLowerCase().includes(search) ||
      p.county.toLowerCase().includes(search) ||
      p.tender.toLowerCase().includes(search)
    );
  }
  
  const color = projs.length ? projs[0].color : '#0F3D91';
  renderSubProjectTable(projs, color);
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

  // Replace table with clean memo table
  const container = document.getElementById('project-sub-list');
  container.innerHTML = `
    <div class="table-toolbar" style="background:var(--card);border-radius:var(--radius) var(--radius) 0 0;border:1px solid var(--line-soft);border-bottom:none;">
      <div class="filters">
        <select onchange="filterMemos(this.value)">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="partially_surrendered">Partially Surrendered</option>
          <option value="not_surrendered">Not Surrendered</option>
        </select>
        <input type="text" placeholder="Search memos..." oninput="searchMemos(this.value)" style="border:1.5px solid var(--line);border-radius:7px;padding:7px 11px;font-size:12.5px;font-family:'Inter',sans-serif;" />
      </div>
      <button class="btn btn-navy" onclick="openAddMemoModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Add Memo
      </button>
    </div>
    <div id="memo-list" class="memo-list-table"></div>
  `;
  
  renderMemoList(memoData);
}

// ── Render memo list as clean table ────────────────────────────────────────────
function renderMemoList(memos, filter='all', search='') {
  const container = document.getElementById('memo-list');
  if (!container) return;
  container.innerHTML = '';

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
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#94A3B8;font-size:13px;">No memos found</div>';
    return;
  }

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontSize = '13px';
  
  // Headers
  table.innerHTML = `
    <thead>
      <tr>
        <th style="padding:10px 14px;text-align:left;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Ref No.</th>
        <th style="padding:10px 14px;text-align:left;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Purpose</th>
        <th style="padding:10px 14px;text-align:left;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Date</th>
        <th style="padding:10px 14px;text-align:left;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Amount</th>
        <th style="padding:10px 14px;text-align:left;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Payee</th>
        <th style="padding:10px 14px;text-align:center;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Stage 1</th>
        <th style="padding:10px 14px;text-align:center;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;">Stage 2</th>
        <th style="padding:10px 14px;text-align:center;background:#F1F5F9;color:#334155;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #E2E8F0;width:80px;"></th>
      </tr>
    </thead>
    <tbody id="memo-tbody"></tbody>
  `;
  container.appendChild(table);

  const tbody = document.getElementById('memo-tbody');
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

    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.onmouseover = () => row.style.background = '#F8FAFC';
    row.onmouseout  = () => row.style.background = '';
    row.onclick = () => openStatusModal(m.id);
    
    row.innerHTML = `
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-family:'JetBrains Mono',monospace;font-size:12px;color:#0F3D91;font-weight:600;">${m.ref || '—'}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-weight:500;">${m.purpose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;color:#475569;">${m.date}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-weight:600;">KES ${m.amount}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;color:#475569;">${m.payee || '—'}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;text-align:center;">${stage1Badge}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;text-align:center;">${stage2Badge}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;text-align:center;">
        <button class="update-btn" onclick="event.stopPropagation(); openStatusModal('${m.id}')">Update</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterMemos(val) {
  const memos = MEMOS_DB[currentProjectId] || [];
  const search = document.querySelector('#memo-list input[type=text]')?.value?.toLowerCase() || '';
  renderMemoList(memos, val, search);
}
function searchMemos(val) {
  const memos = MEMOS_DB[currentProjectId] || [];
  const filter = document.querySelector('#project-sub-list select')?.value || 'all';
  renderMemoList(memos, filter, val.toLowerCase());
}

// ── Status Modal ──────────────────────────────────────────────────────────────
function openStatusModal(memoId) {
  currentMemoId = memoId;
  const allMemos = Object.values(MEMOS_DB).flat();
  const memo = allMemos.find(m => m.id === memoId);
  if (!memo) return;

  document.getElementById('modal-ref').textContent = 'REF: ' + (memo.ref || '—');
  docState = { ...memo.docs };
  paymentStatus = memo.payStatus || 'pending';
  selectPaymentStatus(paymentStatus, false);
  buildDocGrid();

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
  const btn = document.getElementById('upload-btn-' + docId);
  btn.textContent = '⏳ Uploading...';
  btn.disabled = true;
  setTimeout(() => {
    docState[docId] = 'uploaded';
    const naCheck = document.getElementById('na-' + docId);
    if (naCheck) naCheck.checked = false;
    const row = document.getElementById('doc-row-' + docId);
    row.className = 'doc-row uploaded';
    btn.textContent = '✓ Uploaded';
    btn.classList.add('done');
    btn.disabled = false;
    evaluateAutoStatus();
  }, 1000);
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
    const anyUploaded = DOC_TYPES.some(d => docState[d.id] === 'uploaded');
    if (anyUploaded) {
      memo.s2status = 'partially_surrendered';
    } else {
      memo.s2status = 'not_surrendered';
    }
  }

  closeModal('status-modal');
  const memos = MEMOS_DB[currentProjectId] || [];
  const filter = document.querySelector('#project-sub-list select')?.value || 'all';
  renderMemoList(memos, filter);

  const pending = memos.filter(m => m.payStatus === 'pending').length;
  const surr    = memos.filter(m => m.s2status === 'partially_surrendered' || m.s2status === 'fully_surrendered').length;
  document.getElementById('detail-pending').textContent   = pending;
  document.getElementById('detail-surrendered').textContent = surr;
  updateDashboard();
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

  closeModal('add-project-modal');
  ['np-name','np-contractor','np-county','np-tender'].forEach(id => document.getElementById(id).value = '');
  updateDashboard();
  
  if (currentModuleName) {
    const keyMap = { 
      AHP:'ahp', Institutions:'institutions', Markets:'markets', 
      'ESP Markets':'esp', 'Modern Markets':'modern_markets',
      'Office':'office', 'EIA & Power Connection':'eia',
      'Internal Memo':'internal_memo', 'Assets':'assets'
    };
    const key = keyMap[currentModuleName];
    const projs = (PROJECTS[key] || []).concat(extraProjects.filter(p => p.module === currentModuleName));
    const color = projs.length ? projs[0].color : '#0F3D91';
    renderSubProjectTable(projs, color);
  }
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
  const filter = document.querySelector('#project-sub-list select')?.value || 'all';
  renderMemoList(memos, filter);
  updateDashboard();
}

// ── Noticeboard ────────────────────────────────────────────────────────────────
function saveNewNotice() {
  const title = document.getElementById('nn-title').value.trim();
  const content = document.getElementById('nn-content').value.trim();
  const pinned = document.getElementById('nn-pin').value === 'yes';

  if (!title || !content) { alert('Please fill in both title and content.'); return; }

  const newNotice = {
    id: 'n' + Date.now(),
    title, content,
    date: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
    pinned, author: currentUser.name
  };
  notices.unshift(newNotice);
  renderNoticeboard();
  closeModal('add-notice-modal');
  document.getElementById('nn-title').value = '';
  document.getElementById('nn-content').value = '';
  alert('Notice posted successfully.');
}

function renderNoticeboard() {
  const grid = document.getElementById('notice-grid');
  grid.innerHTML = '';
  notices.forEach(n => {
    const card = document.createElement('div');
    card.className = 'notice-card' + (n.pinned ? ' pinned' : '');
    card.innerHTML = `
      <div class="notice-header">
        ${n.pinned ? '<span class="notice-pin">📌</span>' : ''}
        <span class="notice-date">${n.date}</span>
        ${n.pinned ? '<span class="notice-badge pinned">Pinned</span>' : ''}
      </div>
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <div class="notice-footer"><span>— ${n.author}</span></div>
    `;
    grid.appendChild(card);
  });
}

// ── Import Simulation ──────────────────────────────────────────────────────────
function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (importLocked) {
    alert('Import is already locked. This system only allows a single workbook upload.');
    return;
  }

  const zone = document.getElementById('import-zone');
  zone.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg>
    <h3>Processing workbook...</h3>
    <p>Please wait while we parse the data.</p>
  `;

  setTimeout(() => {
    const preview = document.getElementById('import-preview');
    preview.style.display = 'block';
    document.getElementById('import-results').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin:14px 0;">
        <div style="background:#EFF6FF;padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--navy);">64</div>
          <div style="font-size:11px;color:var(--muted);">AHP Projects</div>
        </div>
        <div style="background:#F0FDF4;padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--emerald);">52</div>
          <div style="font-size:11px;color:var(--muted);">ESP Markets</div>
        </div>
        <div style="background:#FFFBEB;padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:var(--amber);">49</div>
          <div style="font-size:11px;color:var(--muted);">Institutions</div>
        </div>
      </div>
      <div style="background:#F8FAFC;padding:14px;border-radius:8px;font-size:12px;color:var(--muted);">
        ✅ Google Drive links detected in <b>37</b> records. These will be stored as external file references.
      </div>
    `;
    document.getElementById('import-zone').style.display = 'none';
  }, 2000);
}

function confirmImport() {
  importLocked = true;
  document.getElementById('import-preview').style.display = 'none';
  document.getElementById('import-sub').textContent = '✓ Workbook imported and locked. System is ready.';
  document.getElementById('import-zone').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="1.6"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
    <h3 style="color:var(--emerald);">Import Complete</h3>
    <p>All data has been loaded. The import function is now locked permanently.</p>
  `;
  document.getElementById('import-zone').style.display = 'block';
  updateDashboard();
}

function simulateExport() {
  alert('📄 Export simulation:\n\nIn the final system, this will generate a downloadable Excel, PDF, or CSV report based on the current data view.');
}

function logout() {
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
  renderNoticeboard();
  updateDashboard();
  applyRolePermissions();
});

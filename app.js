const USERS = {
  nickson: { name: 'Nickson',       initials: 'NK', role: 'Administrator',   email: 'nickson@portal.go.ke' },
  james:   { name: 'James Mwangi',  initials: 'JM', role: 'Records Officer', email: 'james@portal.go.ke'   },
  sarah:   { name: 'Sarah Achieng', initials: 'SA', role: 'Manager',         email: 'sarah@portal.go.ke'   },
  brian:   { name: 'Brian Otieno',  initials: 'BO', role: 'Viewer',          email: 'brian@portal.go.ke'   }
};

// Pages each role can access
const ACCESS = {
  Administrator:   ['dashboard','projects','memos','upload','files','assets','references','reports','notifications','users','settings'],
  Manager:         ['dashboard','projects','memos','upload','files','assets','references','reports','notifications'],
  'Records Officer':['dashboard','projects','memos','upload','files','assets','references','notifications'],
  Viewer:          ['dashboard','projects','memos','files','notifications']
};

let currentUser = null;

function switchLoginUser() {
  const key = document.getElementById('login-user').value;
  const u = USERS[key];
  document.getElementById('login-email').value = u.email;
  document.getElementById('login-role-badge').textContent = u.role;
}

function login() {
  const key = document.getElementById('login-user').value;
  currentUser = USERS[key];

  // Update topbar
  document.getElementById('topbar-avatar').textContent   = currentUser.initials;
  document.getElementById('topbar-username').textContent = currentUser.name;
  document.getElementById('topbar-role').textContent     = currentUser.role;

  // Update sidebar footer
  document.getElementById('sb-username').textContent = currentUser.name;
  document.getElementById('sb-role').textContent     = currentUser.role;

  // Show/hide nav items based on role
  const allowed = ACCESS[currentUser.role];
  document.querySelectorAll('.navitem[data-page]').forEach(item => {
    const page = item.getAttribute('data-page');
    item.style.display = allowed.includes(page) ? 'flex' : 'none';
  });

  // Show app
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');

  go('dashboard');
}

function logout() {
  currentUser = null;
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display = 'flex';
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));
  document.querySelector('.navitem[data-page="dashboard"]').classList.add('active');
}

function go(pageId, el) {
  // Check access
  if (currentUser) {
    const allowed = ACCESS[currentUser.role];
    if (!allowed.includes(pageId)) {
      showDenied(pageId);
      return;
    }
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));

  if (el) {
    el.classList.add('active');
  } else {
    const match = document.querySelector('.navitem[data-page="' + pageId + '"]');
    if (match) match.classList.add('active');
  }

  document.querySelector('.content').scrollTo(0, 0);
  window.scrollTo(0, 0);
}

function showDenied(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-denied').classList.add('active');
  document.getElementById('denied-page-name').textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
  document.getElementById('denied-role').textContent = currentUser.role;
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));
  document.querySelector('.content').scrollTo(0, 0);
  window.scrollTo(0, 0);
}

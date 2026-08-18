/**
 * ULTIMATE FOOTBALL WEB - ENGINE WITH INVENTORY & CARD SYSTEM (STEP 3)
 */

const STORAGE_KEYS = {
  USERS: 'ufw_registered_users',
  SESSION: 'ufw_active_session',
  GAME_DATA_PREFIX: 'ufw_data_'
};

const DEFAULT_GAME_DATA = {
  coins: 100000,
  gems: 500,
  energy: 20,
  maxEnergy: 20,
  level: 1,
  xp: 0,
  teamOvr: 75,
  players: [1, 2, 6, 15, 16, 20], // ID các cầu thủ khởi tạo sẵn khi mở tài khoản
  team: [1, 2, 6, 15, 16, 20],
  formation: "4-3-3",
  missions: [],
  transactions: [],
  settings: { sound: true, music: true }
};

let currentUser = null;
let currentUserData = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  console.log("Ultimate Football Web - Step 3 Loaded");
  checkSession();
}

// ==========================================
// LOCALSTORAGE & SESSION
// ==========================================

function getRegisteredUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : {};
}

function saveRegisteredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function loadUserData(username) {
  const key = STORAGE_KEYS.GAME_DATA_PREFIX + username.toLowerCase();
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return { ...DEFAULT_GAME_DATA };
    }
  }
  return { ...DEFAULT_GAME_DATA };
}

function saveCurrentUserData() {
  if (!currentUser || !currentUserData) return;
  const key = STORAGE_KEYS.GAME_DATA_PREFIX + currentUser.toLowerCase();
  localStorage.setItem(key, JSON.stringify(currentUserData));
}

function checkSession() {
  const activeSession = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (activeSession) {
    currentUser = activeSession;
    currentUserData = loadUserData(currentUser);
    hideAuthModal();
    updateUIWithUserData();
    renderInventory();
  } else {
    showAuthModal();
  }
}

// ==========================================
// AUTHENTICATION HANDLERS
// ==========================================

function switchAuthTab(tab) {
  hideAuthError();
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('form-login');
  const regForm = document.getElementById('form-register');

  if (tab === 'login') {
    loginBtn.classList.add('active');
    regBtn.classList.remove('active');
    loginForm.classList.add('active');
    regForm.classList.remove('active');
  } else {
    regBtn.classList.add('active');
    loginBtn.classList.remove('active');
    regForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  hideAuthError();

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const passwordConfirm = document.getElementById('reg-password-confirm').value;

  if (username.length < 3 || username.length > 16) {
    showAuthError("Tên tài khoản phải từ 3 đến 16 ký tự!");
    return;
  }

  if (password !== passwordConfirm) {
    showAuthError("Mật khẩu xác nhận không khớp!");
    return;
  }

  const users = getRegisteredUsers();
  const userKey = username.toLowerCase();

  if (users[userKey]) {
    showAuthError("Tên tài khoản này đã tồn tại!");
    return;
  }

  users[userKey] = { username: username, password: password, createdAt: new Date().toISOString() };
  saveRegisteredUsers(users);

  currentUser = username;
  currentUserData = JSON.parse(JSON.stringify(DEFAULT_GAME_DATA));
  saveCurrentUserData();

  localStorage.setItem(STORAGE_KEYS.SESSION, username);

  hideAuthModal();
  updateUIWithUserData();
  renderInventory();
}

async function handleLogin(event) {
  event.preventDefault();
  hideAuthError();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = getRegisteredUsers();
  const userKey = username.toLowerCase();

  if (!users[userKey] || users[userKey].password !== password) {
    showAuthError("Tên tài khoản hoặc mật khẩu không đúng!");
    return;
  }

  currentUser = users[userKey].username;
  currentUserData = loadUserData(currentUser);
  localStorage.setItem(STORAGE_KEYS.SESSION, currentUser);

  hideAuthModal();
  updateUIWithUserData();
  renderInventory();
}

function handleLogout() {
  saveCurrentUserData();
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  currentUser = null;
  currentUserData = null;
  showAuthModal();
}

function showAuthModal() { document.getElementById('auth-modal').classList.add('active'); }
function hideAuthModal() { document.getElementById('auth-modal').classList.remove('active'); }
function showAuthError(msg) {
  const errBox = document.getElementById('auth-error');
  errBox.innerText = msg;
  errBox.style.display = 'block';
}
function hideAuthError() { document.getElementById('auth-error').style.display = 'none'; }

function updateUIWithUserData() {
  if (!currentUserData) return;
  document.getElementById('user-name').innerText = currentUser;
  document.getElementById('user-level').innerText = `LV.${currentUserData.level || 1}`;
  document.getElementById('team-ovr').innerText = currentUserData.teamOvr || 75;
  document.getElementById('coins-count').innerText = (currentUserData.coins || 0).toLocaleString('vi-VN');
  document.getElementById('gems-count').innerText = (currentUserData.gems || 0).toLocaleString('vi-VN');
  document.getElementById('energy-count').innerText = `${currentUserData.energy || 0}/${currentUserData.maxEnergy || 20}`;
}

// ==========================================
// HỆ THỐNG PLAYER CARDS & INVENTORY (BƯỚC 3)
// ==========================================

/**
 * Render thẻ cầu thủ theo cấu trúc HTML chuẩn
 */
function createCardHTML(player) {
  const rarityClass = `${player.rarity.toLowerCase()}-card`;
  return `
    <div class="player-card ${rarityClass}" onclick="openPlayerModal(${player.id})">
      <div class="card-inner">
        <div class="card-top">
          <div class="card-ovr-box">
            <span class="card-ovr">${player.overall}</span>
            <span class="card-pos">${player.position}</span>
          </div>
          <div class="card-flag">${player.country}</div>
        </div>
        <div class="card-image-wrapper">
          <img src="${player.image}" alt="${player.name}" class="player-img">
        </div>
        <div class="card-info">
          <div class="card-name">${player.name.toUpperCase()}</div>
          <div class="card-stats-grid">
            <div class="stat-box"><span>PAC</span><strong>${player.pace}</strong></div>
            <div class="stat-box"><span>SHO</span><strong>${player.shooting}</strong></div>
            <div class="stat-box"><span>PAS</span><strong>${player.passing}</strong></div>
            <div class="stat-box"><span>DRI</span><strong>${player.dribbling}</strong></div>
            <div class="stat-box"><span>DEF</span><strong>${player.defending}</strong></div>
            <div class="stat-box"><span>PHY</span><strong>${player.physical}</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Hiển thị kho cầu thủ người chơi đang sở hữu kèm Lọc, Tìm kiếm, Sắp xếp
 */
function renderInventory() {
  if (!currentUserData || !currentUserData.players) return;

  const gridContainer = document.getElementById('inventory-grid');
  const countSpan = document.getElementById('inventory-count');
  
  const searchVal = document.getElementById('inventory-search').value.toLowerCase().trim();
  const posVal = document.getElementById('filter-position').value;
  const rarityVal = document.getElementById('filter-rarity').value;
  const sortVal = document.getElementById('sort-players').value;

  // Lấy toàn bộ cầu thủ người chơi sở hữu dựa trên danh sách ID trong localStorage
  let ownedPlayers = currentUserData.players.map(id => PLAYERS_DATABASE.find(p => p.id === id)).filter(Boolean);

  // 1. Tìm kiếm theo tên
  if (searchVal) {
    ownedPlayers = ownedPlayers.filter(p => p.name.toLowerCase().includes(searchVal));
  }

  // 2. Lọc theo vị trí
  if (posVal !== 'ALL') {
    ownedPlayers = ownedPlayers.filter(p => p.position === posVal);
  }

  // 3. Lọc theo độ hiếm
  if (rarityVal !== 'ALL') {
    ownedPlayers = ownedPlayers.filter(p => p.rarity === rarityVal);
  }

  // 4. Sắp xếp
  ownedPlayers.sort((a, b) => {
    if (sortVal === 'OVR_DESC') return b.overall - a.overall;
    if (sortVal === 'OVR_ASC') return a.overall - b.overall;
    if (sortVal === 'PRICE_DESC') return b.price - a.price;
    if (sortVal === 'PRICE_ASC') return a.price - b.price;
    return 0;
  });

  countSpan.innerText = ownedPlayers.length;

  if (ownedPlayers.length === 0) {
    gridContainer.innerHTML = `<div class="no-players-msg">Không tìm thấy cầu thủ nào phù hợp!</div>`;
    return;
  }

  gridContainer.innerHTML = ownedPlayers.map(p => createCardHTML(p)).join('');
}

/**
 * Mở Popup xem chi tiết Cầu thủ
 */
function openPlayerModal(playerId) {
  const player = PLAYERS_DATABASE.find(p => p.id === playerId);
  if (!player) return;

  const modal = document.getElementById('player-modal');
  const modalBody = document.getElementById('player-modal-body');

  modalBody.innerHTML = `
    <div class="player-detail-container">
      ${createCardHTML(player)}
      <div style="text-align: center;">
        <h3 style="font-family: var(--font-heading); font-size: 28px; color: var(--cyan-primary);">${player.name}</h3>
        <p style="font-size: 13px; color: var(--text-muted);">Độ hiếm: <strong style="color: #fff;">${player.rarity}</strong> | Vị trí: <strong style="color: #fff;">${player.position}</strong></p>
        <p style="font-size: 14px; color: var(--gold-primary); margin-top: 4px;">Giá thị trường: 🪙 ${player.price.toLocaleString('vi-VN')} Coins</p>
      </div>

      <div class="detail-stats-list">
        <div class="stat-row">
          <span>Tốc độ (PAC): <strong>${player.pace}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.pace}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Sút bóng (SHO): <strong>${player.shooting}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.shooting}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Chuyền bóng (PAS): <strong>${player.passing}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.passing}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Rê bóng (DRI): <strong>${player.dribbling}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.dribbling}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Phòng ngự (DEF): <strong>${player.defending}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.defending}%;"></div></div>
        </div>
        <div class="stat-row">
          <span>Thể lực (PHY): <strong>${player.physical}</strong></span>
          <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${player.physical}%;"></div></div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closePlayerModal() {
  document.getElementById('player-modal').classList.remove('active');
}

/**
 * Switch Navigation Tab
 */
function switchSection(sectionId) {
  const sections = document.querySelectorAll('.game-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-target') === sectionId) {
      btn.classList.add('active');
    }
  });

  if (sectionId === 'players') {
    renderInventory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

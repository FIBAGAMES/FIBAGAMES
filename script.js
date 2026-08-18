/**
 * ULTIMATE FOOTBALL WEB - GAME ENGINE (STEP 4: PACK OPENING)
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
  players: [1, 2, 6, 15, 16, 20],
  team: [1, 2, 6, 15, 16, 20],
  formation: "4-3-3"
};

// Cấu hình tỷ lệ Pack (Bước 4)
const PACK_CONFIGS = {
  STANDARD: { name: "STANDARD PACK", costType: "coins", cost: 10000, rates: { COMMON: 70, RARE: 25, EPIC: 5, LEGEND: 0, ICON: 0 } },
  GOLD_COINS: { name: "GOLD PREMIUM PACK", costType: "coins", cost: 50000, rates: { COMMON: 0, RARE: 50, EPIC: 35, LEGEND: 14, ICON: 1 } },
  GOLD_GEMS: { name: "GOLD PREMIUM PACK", costType: "gems", cost: 100, rates: { COMMON: 0, RARE: 50, EPIC: 35, LEGEND: 14, ICON: 1 } },
  ULTIMATE_ICON: { name: "ULTIMATE ICON PACK", costType: "gems", cost: 500, rates: { COMMON: 0, RARE: 0, EPIC: 40, LEGEND: 45, ICON: 15 } }
};

let currentUser = null;
let currentUserData = null;
let pendingRevealedPlayer = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  console.log("Ultimate Football Web - Step 4 Engine Ready");
  checkSession();
}

// ==========================================
// SESSION & LOCALSTORAGE
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
    try { return JSON.parse(data); } catch (e) { return { ...DEFAULT_GAME_DATA }; }
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
    loginBtn.classList.add('active'); regBtn.classList.remove('active');
    loginForm.classList.add('active'); regForm.classList.remove('active');
  } else {
    regBtn.classList.add('active'); loginBtn.classList.remove('active');
    regForm.classList.add('active'); loginForm.classList.remove('active');
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
  if (users[username.toLowerCase()]) {
    showAuthError("Tên tài khoản này đã tồn tại!");
    return;
  }

  users[username.toLowerCase()] = { username, password, createdAt: new Date().toISOString() };
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
  errBox.innerText = msg; errBox.style.display = 'block';
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
// INVENTORY & CARD RENDERING
// ==========================================

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

function renderInventory() {
  if (!currentUserData || !currentUserData.players) return;

  const gridContainer = document.getElementById('inventory-grid');
  const countSpan = document.getElementById('inventory-count');
  
  const searchVal = document.getElementById('inventory-search').value.toLowerCase().trim();
  const posVal = document.getElementById('filter-position').value;
  const rarityVal = document.getElementById('filter-rarity').value;
  const sortVal = document.getElementById('sort-players').value;

  let ownedPlayers = currentUserData.players.map(id => PLAYERS_DATABASE.find(p => p.id === id)).filter(Boolean);

  if (searchVal) ownedPlayers = ownedPlayers.filter(p => p.name.toLowerCase().includes(searchVal));
  if (posVal !== 'ALL') ownedPlayers = ownedPlayers.filter(p => p.position === posVal);
  if (rarityVal !== 'ALL') ownedPlayers = ownedPlayers.filter(p => p.rarity === rarityVal);

  ownedPlayers.sort((a, b) => {
    if (sortVal === 'OVR_DESC') return b.overall - a.overall;
    if (sortVal === 'OVR_ASC') return a.overall - b.overall;
    if (sortVal === 'PRICE_DESC') return b.price - a.price;
    if (sortVal === 'PRICE_ASC') return a.price - b.price;
    return 0;
  });

  countSpan.innerText = ownedPlayers.length;

  if (ownedPlayers.length === 0) {
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Không tìm thấy cầu thủ nào phù hợp!</div>`;
    return;
  }

  gridContainer.innerHTML = ownedPlayers.map(p => createCardHTML(p)).join('');
}

function openPlayerModal(playerId) {
  const player = PLAYERS_DATABASE.find(p => p.id === playerId);
  if (!player) return;

  const modal = document.getElementById('player-modal');
  const modalBody = document.getElementById('player-modal-body');

  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
      ${createCardHTML(player)}
      <div style="text-align: center;">
        <h3 style="font-family: var(--font-heading); font-size: 28px; color: var(--cyan-primary);">${player.name}</h3>
        <p style="font-size: 13px; color: var(--text-muted);">Độ hiếm: <strong style="color: #fff;">${player.rarity}</strong> | Vị trí: <strong style="color: #fff;">${player.position}</strong></p>
        <p style="font-size: 14px; color: var(--gold-primary); margin-top: 4px;">Giá thị trường: 🪙 ${player.price.toLocaleString('vi-VN')} Coins</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closePlayerModal() { document.getElementById('player-modal').classList.remove('active'); }

// ==========================================
// BƯỚC 4: THUẬT TOÁN MỞ PACK & HOẠT HỌA REVEAL
// ==========================================

function handleBuyPack(packTypeKey) {
  const config = PACK_CONFIGS[packTypeKey];
  if (!config) return;

  // 1. Kiểm tra số dư Coins / Gems
  if (config.costType === 'coins' && currentUserData.coins < config.cost) {
    alert("Bạn không đủ Coins để mở gói này!");
    return;
  }
  if (config.costType === 'gems' && currentUserData.gems < config.cost) {
    alert("Bạn không đủ Gems để mở gói này!");
    return;
  }

  // 2. Trừ tiền và Lưu
  if (config.costType === 'coins') currentUserData.coins -= config.cost;
  if (config.costType === 'gems') currentUserData.gems -= config.cost;
  saveCurrentUserData();
  updateUIWithUserData();

  // 3. Tính toán ngẫu nhiên Rarity theo Tỷ lệ Weighted Probability
  const chosenRarity = rollRarity(config.rates);

  // 4. Lấy ngẫu nhiên cầu thủ thuộc Rarity đó
  const availablePlayers = PLAYERS_DATABASE.filter(p => p.rarity === chosenRarity);
  pendingRevealedPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

  // 5. Khởi chạy Animation Mở Pack
  startPackOpeningAnimation(config.name);
}

function rollRarity(rates) {
  const randomNum = Math.random() * 100;
  let cumulative = 0;

  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (randomNum <= cumulative) {
      return rarity;
    }
  }
  return "COMMON";
}

function startPackOpeningAnimation(packTitle) {
  const overlay = document.getElementById('pack-opening-overlay');
  const packBox = document.getElementById('pack-3d-box');
  const revealCard = document.getElementById('pack-reveal-card');
  const packTitleEl = document.getElementById('pack-overlay-title');

  packTitleEl.innerText = packTitle;
  packBox.classList.remove('burst');
  packBox.style.display = 'flex';
  revealCard.classList.remove('show');

  overlay.classList.add('active');
}

function triggerPackBurst() {
  const packBox = document.getElementById('pack-3d-box');
  const revealCard = document.getElementById('pack-reveal-card');
  const cardContainer = document.getElementById('revealed-card-container');

  packBox.classList.add('burst');

  setTimeout(() => {
    packBox.style.display = 'none';
    cardContainer.innerHTML = createCardHTML(pendingRevealedPlayer);
    revealCard.classList.add('show');
  }, 500);
}

function closePackOpening() {
  if (pendingRevealedPlayer) {
    // Thêm cầu thủ vừa nhận vào kho đồ người chơi
    currentUserData.players.push(pendingRevealedPlayer.id);
    saveCurrentUserData();
    renderInventory();
    pendingRevealedPlayer = null;
  }

  const overlay = document.getElementById('pack-opening-overlay');
  overlay.classList.remove('active');
}

function switchSection(sectionId) {
  const sections = document.querySelectorAll('.game-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) targetSection.classList.add('active');

  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-target') === sectionId) btn.classList.add('active');
  });

  if (sectionId === 'players') renderInventory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * ULTIMATE FOOTBALL WEB - GAME ENGINE (STEP 5: SQUAD MANAGEMENT)
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
  team: [1, 2, 6, null, null, null, null, null, null, null, null], // 11 vị trí trên sân
  formation: "4-3-3"
};

// Cấu hình Tỷ lệ Pack
const PACK_CONFIGS = {
  STANDARD: { name: "STANDARD PACK", costType: "coins", cost: 10000, rates: { COMMON: 70, RARE: 25, EPIC: 5, LEGEND: 0, ICON: 0 } },
  GOLD_COINS: { name: "GOLD PREMIUM PACK", costType: "coins", cost: 50000, rates: { COMMON: 0, RARE: 50, EPIC: 35, LEGEND: 14, ICON: 1 } },
  GOLD_GEMS: { name: "GOLD PREMIUM PACK", costType: "gems", cost: 100, rates: { COMMON: 0, RARE: 50, EPIC: 35, LEGEND: 14, ICON: 1 } },
  ULTIMATE_ICON: { name: "ULTIMATE ICON PACK", costType: "gems", cost: 500, rates: { COMMON: 0, RARE: 0, EPIC: 40, LEGEND: 45, ICON: 15 } }
};

// Cấu hình Tọa độ Sơ đồ Chiến thuật (BƯỚC 5)
const FORMATIONS_CONFIG = {
  "4-3-3": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 72, left: 16 },
    { pos: "CB", top: 74, left: 38 },
    { pos: "CB", top: 74, left: 62 },
    { pos: "RB", top: 72, left: 84 },
    { pos: "CM", top: 48, left: 28 },
    { pos: "CDM", top: 52, left: 50 },
    { pos: "CM", top: 48, left: 72 },
    { pos: "LW", top: 20, left: 20 },
    { pos: "ST", top: 16, left: 50 },
    { pos: "RW", top: 20, left: 80 }
  ],
  "4-4-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "LB", top: 72, left: 16 },
    { pos: "CB", top: 74, left: 38 },
    { pos: "CB", top: 74, left: 62 },
    { pos: "RB", top: 72, left: 84 },
    { pos: "LM", top: 45, left: 16 },
    { pos: "CM", top: 48, left: 38 },
    { pos: "CM", top: 48, left: 62 },
    { pos: "RM", top: 45, left: 84 },
    { pos: "ST", top: 18, left: 35 },
    { pos: "ST", top: 18, left: 65 }
  ],
  "3-5-2": [
    { pos: "GK", top: 88, left: 50 },
    { pos: "CB", top: 74, left: 25 },
    { pos: "CB", top: 76, left: 50 },
    { pos: "CB", top: 74, left: 75 },
    { pos: "LWB", top: 48, left: 12 },
    { pos: "CDM", top: 55, left: 35 },
    { pos: "CAM", top: 38, left: 50 },
    { pos: "CDM", top: 55, left: 65 },
    { pos: "RWB", top: 48, left: 88 },
    { pos: "ST", top: 18, left: 35 },
    { pos: "ST", top: 18, left: 65 }
  ]
};

let currentUser = null;
let currentUserData = null;
let pendingRevealedPlayer = null;
let activeSlotIndexToPick = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  console.log("Ultimate Football Web - Step 5 Squad Engine Ready");
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
    try {
      const parsed = JSON.parse(data);
      if (!parsed.team || parsed.team.length !== 11) {
        parsed.team = [1, 2, 6, null, null, null, null, null, null, null, null];
      }
      return parsed;
    } catch (e) { return { ...DEFAULT_GAME_DATA }; }
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
    renderSquadPitch();
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
  renderSquadPitch();
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
  renderSquadPitch();
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
  
  calculateAndUpdateTeamOVR();

  document.getElementById('user-name').innerText = currentUser;
  document.getElementById('user-level').innerText = `LV.${currentUserData.level || 1}`;
  document.getElementById('coins-count').innerText = (currentUserData.coins || 0).toLocaleString('vi-VN');
  document.getElementById('gems-count').innerText = (currentUserData.gems || 0).toLocaleString('vi-VN');
  document.getElementById('energy-count').innerText = `${currentUserData.energy || 0}/${currentUserData.maxEnergy || 20}`;
  
  if (currentUserData.formation) {
    document.getElementById('select-formation').value = currentUserData.formation;
  }
}

// ==========================================
// BƯỚC 5: SQUAD MANAGEMENT ENGINE & SÂN BÓNG
// ==========================================

function calculateAndUpdateTeamOVR() {
  if (!currentUserData || !currentUserData.team) return;

  const starterIds = currentUserData.team.filter(id => id !== null);
  if (starterIds.length === 0) {
    currentUserData.teamOvr = 0;
  } else {
    const totalOvr = starterIds.reduce((sum, id) => {
      const p = PLAYERS_DATABASE.find(player => player.id === id);
      return sum + (p ? p.overall : 0);
    }, 0);
    currentUserData.teamOvr = Math.round(totalOvr / starterIds.length);
  }

  document.getElementById('team-ovr').innerText = currentUserData.teamOvr;
  const squadOvrEl = document.getElementById('squad-total-ovr');
  if (squadOvrEl) squadOvrEl.innerText = currentUserData.teamOvr;
}

function renderSquadPitch() {
  if (!currentUserData) return;

  const formationKey = currentUserData.formation || "4-3-3";
  const slotsConfig = FORMATIONS_CONFIG[formationKey] || FORMATIONS_CONFIG["4-3-3"];
  const pitchContainer = document.getElementById('pitch-slots-container');

  pitchContainer.innerHTML = '';

  slotsConfig.forEach((slot, index) => {
    const playerId = currentUserData.team[index];
    const player = playerId ? PLAYERS_DATABASE.find(p => p.id === playerId) : null;

    const slotDiv = document.createElement('div');
    slotDiv.className = 'pitch-slot';
    slotDiv.style.top = `${slot.top}%`;
    slotDiv.style.left = `${slot.left}%`;
    slotDiv.onclick = () => openPickerForSlot(index, slot.pos);

    if (player) {
      slotDiv.innerHTML = `
        <div class="slot-card-preview filled">
          <span class="slot-player-ovr">${player.overall}</span>
          <img src="${player.image}" class="slot-player-img" alt="${player.name}">
          <div class="slot-player-info">${player.name.split(' ').pop().toUpperCase()}</div>
        </div>
        <span class="slot-pos-badge">${slot.pos}</span>
      `;
    } else {
      slotDiv.innerHTML = `
        <div class="slot-card-preview">
          <span class="slot-empty-icon">+</span>
        </div>
        <span class="slot-pos-badge">${slot.pos}</span>
      `;
    }

    pitchContainer.appendChild(slotDiv);
  });
}

function changeFormation(newFormation) {
  currentUserData.formation = newFormation;
  saveCurrentUserData();
  renderSquadPitch();
}

function openPickerForSlot(slotIndex, posName) {
  activeSlotIndexToPick = slotIndex;
  const modal = document.getElementById('picker-modal');
  const title = document.getElementById('picker-slot-title');
  const grid = document.getElementById('picker-players-grid');

  title.innerText = `CHỌN CẦU THỦ CHO VỊ TRÍ: ${posName}`;

  // Lọc các cầu thủ đã sở hữu trong kho đồ
  const ownedPlayers = currentUserData.players
    .map(id => PLAYERS_DATABASE.find(p => p.id === id))
    .filter(Boolean);

  if (ownedPlayers.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Bạn chưa có cầu thủ nào trong Kho!</div>`;
  } else {
    grid.innerHTML = ownedPlayers.map(p => {
      const isAlreadyInTeam = currentUserData.team.includes(p.id);
      const isCurrentSlotPlayer = currentUserData.team[slotIndex] === p.id;

      return `
        <div style="position: relative; cursor: pointer;" onclick="selectPlayerForSlot(${p.id})">
          ${createCardHTML(p)}
          ${isAlreadyInTeam ? `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--gold-primary); font-size: 14px;">${isCurrentSlotPlayer ? 'ĐANG ĐÁ' : 'ĐÃ ĐÁ VỊ TRÍ KHÁC'}</div>` : ''}
        </div>
      `;
    }).join('');

    // Nút bỏ trống vị trí
    grid.innerHTML += `
      <div onclick="selectPlayerForSlot(null)" style="width: 180px; height: 260px; border: 2px dashed rgba(239, 68, 68, 0.5); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #fca5a5; font-weight: 800;">
        <span style="font-size: 32px;">❌</span>
        <span>BỎ TRỐNG</span>
      </div>
    `;
  }

  modal.classList.add('active');
}

function selectPlayerForSlot(playerId) {
  if (activeSlotIndexToPick === null) return;

  // Nếu cầu thủ đã nằm ở slot khác -> Hoán đổi vị trí (Swap)
  if (playerId !== null) {
    const existingIndex = currentUserData.team.indexOf(playerId);
    if (existingIndex !== -1 && existingIndex !== activeSlotIndexToPick) {
      currentUserData.team[existingIndex] = currentUserData.team[activeSlotIndexToPick];
    }
  }

  currentUserData.team[activeSlotIndexToPick] = playerId;
  saveCurrentUserData();
  calculateAndUpdateTeamOVR();
  renderSquadPitch();
  closePickerModal();
}

function closePickerModal() {
  document.getElementById('picker-modal').classList.remove('active');
  activeSlotIndexToPick = null;
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
// PACK ENGINE
// ==========================================

function handleBuyPack(packTypeKey) {
  const config = PACK_CONFIGS[packTypeKey];
  if (!config) return;

  if (config.costType === 'coins' && currentUserData.coins < config.cost) {
    alert("Bạn không đủ Coins để mở gói này!");
    return;
  }
  if (config.costType === 'gems' && currentUserData.gems < config.cost) {
    alert("Bạn không đủ Gems để mở gói này!");
    return;
  }

  if (config.costType === 'coins') currentUserData.coins -= config.cost;
  if (config.costType === 'gems') currentUserData.gems -= config.cost;
  saveCurrentUserData();
  updateUIWithUserData();

  const chosenRarity = rollRarity(config.rates);
  const availablePlayers = PLAYERS_DATABASE.filter(p => p.rarity === chosenRarity);
  pendingRevealedPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

  startPackOpeningAnimation(config.name);
}

function rollRarity(rates) {
  const randomNum = Math.random() * 100;
  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (randomNum <= cumulative) return rarity;
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
    currentUserData.players.push(pendingRevealedPlayer.id);
    saveCurrentUserData();
    renderInventory();
    pendingRevealedPlayer = null;
  }
  document.getElementById('pack-opening-overlay').classList.remove('active');
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

  if (sectionId === 'team') renderSquadPitch();
  if (sectionId === 'players') renderInventory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// ==========================================
// BƯỚC 6: HỆ THỐNG THỊ TRƯỜNG CHUYỂN NHƯỢNG (TRANSFER MARKET)
// ==========================================

let currentMarketPage = 1;
const MARKET_PER_PAGE = 12;

function renderMarket() {
  const marketContainer = document.getElementById('market-players-list');
  if (!marketContainer) return;

  marketContainer.innerHTML = '';
  
  // Hiển thị các cầu thủ có sẵn trong PLAYERS_DATABASE
  const startIndex = (currentMarketPage - 1) * MARKET_PER_PAGE;
  const pagePlayers = PLAYERS_DATABASE.slice(startIndex, startIndex + MARKET_PER_PAGE);

  pagePlayers.forEach(player => {
    const card = document.createElement('div');
    card.className = 'market-card';
    card.innerHTML = `
      <div class="player-card mini-card rarity-${player.rarity.toLowerCase()}">
        <div class="card-ovr">${player.overall}</div>
        <div class="card-pos">${player.position}</div>
        <div class="card-name">${player.name}</div>
      </div>
      <div class="market-card-price">💰 ${player.price.toLocaleString()} Coins</div>
      <button class="btn btn-primary" onclick="buyPlayerFromMarket(${player.id})">Mua Cầu Thủ</button>
    `;
    marketContainer.appendChild(card);
  });
}

function buyPlayerFromMarket(playerId) {
  const player = PLAYERS_DATABASE.find(p => p.id === playerId);
  if (!player) return;

  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { coins: 1000000, inventory: [] };

  if (currentUser.coins < player.price) {
    alert("❌ Bạn không đủ Coins để mua cầu thủ này!");
    return;
  }

  // Trừ tiền và thêm cầu thủ vào Inventory
  currentUser.coins -= player.price;
  
  // Clone cầu thủ kèm ID duy nhất trong Inventory
  const newPlayer = { ...player, inventoryId: Date.now() + Math.random() };
  currentUser.inventory.push(newPlayer);

  // Lưu trữ lại LocalStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  alert(`🎉 Chúc mừng! Bạn đã chiêu mộ thành công ${player.name}!`);
  
  // Cập nhật UI
  if (typeof updateUI === 'function') updateUI();
  renderMarket();
}

// ==========================================
// BƯỚC 7: HỆ THỐNG NÂNG CẤP (UPGRADE) & NHIỆM VỤ (MISSIONS)
// ==========================================

let selectedUpgradePlayer = null;

function selectPlayerForUpgrade(player) {
  selectedUpgradePlayer = player;
  renderUpgradeUI();
}

function renderUpgradeUI() {
  const slot = document.getElementById('upgrade-slot-target');
  const rateBadge = document.getElementById('upgrade-success-rate');
  const btn = document.getElementById('btn-execute-upgrade');

  if (!slot) return;

  if (!selectedUpgradePlayer) {
    slot.innerHTML = `<p>Chọn 1 cầu thủ từ Kho đồ để nâng cấp</p>`;
    slot.classList.remove('has-player');
    if (rateBadge) rateBadge.innerText = 'Tỷ lệ thành công: 0%';
    if (btn) btn.disabled = true;
    return;
  }

  slot.classList.add('has-player');
  slot.innerHTML = `
    <div class="player-card mini-card rarity-${selectedUpgradePlayer.rarity.toLowerCase()}">
      <div class="card-ovr">+${(selectedUpgradePlayer.upgradeLevel || 0)} ${selectedUpgradePlayer.overall}</div>
      <div class="card-pos">${selectedUpgradePlayer.position}</div>
      <div class="card-name">${selectedUpgradePlayer.name}</div>
    </div>
  `;

  // Tính tỷ lệ thành công dựa trên cấp độ hiện tại
  const currentLevel = selectedUpgradePlayer.upgradeLevel || 0;
  const successRate = Math.max(10, 100 - (currentLevel * 15));

  if (rateBadge) rateBadge.innerText = `Tỷ lệ thành công: ${successRate}%`;
  if (btn) btn.disabled = false;
}

function executeUpgrade() {
  if (!selectedUpgradePlayer) return;

  let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const upgradeCost = 50000;

  if (currentUser.coins < upgradeCost) {
    alert("❌ Bạn cần 50,000 Coins để thực hiện nâng cấp!");
    return;
  }

  currentUser.coins -= upgradeCost;

  const currentLevel = selectedUpgradePlayer.upgradeLevel || 0;
  const successRate = Math.max(10, 100 - (currentLevel * 15));
  const randomRoll = Math.random() * 100;

  if (randomRoll <= successRate) {
    // Nâng cấp thành công!
    alert(`🔥 NÂNG CẤP THÀNH CÔNG! ${selectedUpgradePlayer.name} đã lên +${currentLevel + 1}!`);
    
    // Tìm và cập nhật chỉ số cầu thủ trong kho
    const targetInInv = currentUser.inventory.find(p => p.inventoryId === selectedUpgradePlayer.inventoryId);
    if (targetInInv) {
      targetInInv.upgradeLevel = currentLevel + 1;
      targetInInv.overall += 1;
      targetInInv.pace += 1;
      targetInInv.shooting += 1;
      targetInInv.passing += 1;
      targetInInv.dribbling += 1;
      selectedUpgradePlayer = targetInInv;
    }
  } else {
    // Nâng cấp thất bại
    alert(`💥 NÂNG CẤP THẤT BẠI! Rất tiếc, chỉ số cầu thủ giữ nguyên.`);
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  if (typeof updateUI === 'function') updateUI();
  renderUpgradeUI();
}

// --- NHIỆM VỤ (MISSIONS) ---
const DAILY_MISSIONS = [
  { id: 1, title: "Mở 1 Gói Cầu Thủ", reward: 20000, completed: false },
  { id: 2, title: "Nâng cấp Cầu thủ 1 lần", reward: 50000, completed: false },
  { id: 3, title: "Mua 1 Cầu thủ từ Market", reward: 30000, completed: false }
];

function renderMissions() {
  const container = document.getElementById('missions-list');
  if (!container) return;

  container.innerHTML = '';
  DAILY_MISSIONS.forEach(mission => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    card.innerHTML = `
      <div class="mission-info">
        <h4>${mission.title}</h4>
        <p>Phần thưởng hoàn thành nhiệm vụ ngày</p>
      </div>
      <div class="mission-reward">
        <span class="reward-badge">+💰 ${mission.reward.toLocaleString()}</span>
        <button class="btn btn-primary" ${mission.completed ? 'disabled' : ''} onclick="claimMissionReward(${mission.id})">
          ${mission.completed ? 'Đã Nhận' : 'Nhận'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function claimMissionReward(missionId) {
  const mission = DAILY_MISSIONS.find(m => m.id === missionId);
  if (!mission || mission.completed) return;

  let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  currentUser.coins = (currentUser.coins || 0) + mission.reward;
  mission.completed = true;

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  alert(`🎉 Bạn đã nhận được ${mission.reward.toLocaleString()} Coins!`);

  if (typeof updateUI === 'function') updateUI();
  renderMissions();
}

// Tự động render khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  renderMarket();
  renderMissions();
});

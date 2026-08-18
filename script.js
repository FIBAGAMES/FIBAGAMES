/* ==========================================================================
   ULTIMATE XI - MAIN GAME LOGIC
   ========================================================================== */

// STATE TOÀN CỤC
let currentUser = null;
let currentUserData = null;

// CẤU HÌNH SƠ ĐỒ THI ĐẤU
const FORMATIONS = {
  "4-3-3": [
    { pos: "GK", top: "85%", left: "50%" },
    { pos: "LB", top: "68%", left: "18%" },
    { pos: "CB", top: "72%", left: "38%" },
    { pos: "CB", top: "72%", left: "62%" },
    { pos: "RB", top: "68%", left: "82%" },
    { pos: "CM", top: "48%", left: "30%" },
    { pos: "CM", top: "52%", left: "50%" },
    { pos: "CM", top: "48%", left: "70%" },
    { pos: "LW", top: "22%", left: "20%" },
    { pos: "ST", top: "18%", left: "50%" },
    { pos: "RW", top: "22%", left: "80%" }
  ],
  "4-4-2": [
    { pos: "GK", top: "85%", left: "50%" },
    { pos: "LB", top: "68%", left: "18%" },
    { pos: "CB", top: "72%", left: "38%" },
    { pos: "CB", top: "72%", left: "62%" },
    { pos: "RB", top: "68%", left: "82%" },
    { pos: "LM", top: "45%", left: "18%" },
    { pos: "CM", top: "48%", left: "38%" },
    { pos: "CM", top: "48%", left: "62%" },
    { pos: "RM", top: "45%", left: "82%" },
    { pos: "ST", top: "20%", left: "38%" },
    { pos: "ST", top: "20%", left: "62%" }
  ],
  "3-5-2": [
    { pos: "GK", top: "85%", left: "50%" },
    { pos: "CB", top: "72%", left: "25%" },
    { pos: "CB", top: "75%", left: "50%" },
    { pos: "CB", top: "72%", left: "75%" },
    { pos: "LWB", top: "48%", left: "15%" },
    { pos: "CDM", top: "54%", left: "38%" },
    { pos: "CDM", top: "54%", left: "62%" },
    { pos: "RWB", top: "48%", left: "85%" },
    { pos: "CAM", top: "36%", left: "50%" },
    { pos: "ST", top: "18%", left: "38%" },
    { pos: "ST", top: "18%", left: "62%" }
  ]
};

// 1. QUẢN LÝ ĐĂNG NHẬP / ĐĂNG KÝ
function switchAuthTab(tab) {
  document.getElementById("tab-login-btn").classList.toggle("active", tab === "login");
  document.getElementById("tab-register-btn").classList.toggle("active", tab === "register");
  document.getElementById("form-login").classList.toggle("d-none", tab !== "login");
  document.getElementById("form-register").classList.toggle("d-none", tab !== "register");
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById("login-username").value.trim();
  const pass = document.getElementById("login-password").value.trim();

  const savedUser = localStorage.getItem(`ufw_user_${user}`);
  if (!savedUser) {
    alert("Tài khoản không tồn tại!");
    return;
  }

  const userData = JSON.parse(savedUser);
  if (userData.password !== pass) {
    alert("Sai mật khẩu!");
    return;
  }

  currentUser = user;
  loadUserData();
  initApp();
}

function handleRegister(e) {
  e.preventDefault();
  const user = document.getElementById("reg-username").value.trim();
  const club = document.getElementById("reg-club").value.trim();
  const pass = document.getElementById("reg-password").value.trim();

  if (localStorage.getItem(`ufw_user_${user}`)) {
    alert("Tên tài khoản đã tồn tại!");
    return;
  }

  // Khởi tạo tài khoản mới kèm 11 cầu thủ mặc định
  const starterTeam = PLAYERS_DATABASE.slice(0, 11);
  const defaultData = {
    username: user,
    password: pass,
    clubName: club,
    level: 1,
    xp: 0,
    coins: 10000,
    gems: 100,
    energy: 10,
    formation: "4-3-3",
    inventory: [...starterTeam],
    team: [...starterTeam]
  };

  localStorage.setItem(`ufw_user_${user}`, JSON.stringify(defaultData));
  alert("Tạo tài khoản thành công! Hãy đăng nhập.");
  switchAuthTab("login");
}

function handleLogout() {
  currentUser = null;
  currentUserData = null;
  document.getElementById("modal-auth").classList.remove("d-none");
  document.getElementById("app-header").classList.add("d-none");
  document.getElementById("app-content").classList.add("d-none");
  document.getElementById("bottom-nav").classList.add("d-none");
}

function loadUserData() {
  const data = localStorage.getItem(`ufw_user_${currentUser}`);
  if (data) {
    currentUserData = JSON.parse(data);
  }
}

function saveUserData() {
  if (currentUser && currentUserData) {
    localStorage.setItem(`ufw_user_${currentUser}`, JSON.stringify(currentUserData));
  }
}

// 2. KHỞI TẠO GIAO DIỆN CHÍNH
function initApp() {
  document.getElementById("modal-auth").classList.add("d-none");
  document.getElementById("app-header").classList.remove("d-none");
  document.getElementById("app-content").classList.remove("d-none");
  document.getElementById("bottom-nav").classList.remove("d-none");

  updateTopBarUI();
  renderPitch();
  renderInventory();
  updateOpponentPreview();
}

function updateTopBarUI() {
  if (!currentUserData) return;
  document.getElementById("user-club-name").innerText = currentUserData.clubName;
  document.getElementById("dash-user-name").innerText = currentUserData.username.toUpperCase();
  document.getElementById("user-level").innerText = currentUserData.level;
  document.getElementById("user-coins").innerText = currentUserData.coins.toLocaleString();
  document.getElementById("user-gems").innerText = currentUserData.gems.toLocaleString();
  document.getElementById("user-energy").innerText = `${currentUserData.energy}/10`;

  const xpNeeded = currentUserData.level * 200;
  const xpPercent = Math.min(100, Math.round((currentUserData.xp / xpNeeded) * 100));
  document.getElementById("xp-progress").style.width = `${xpPercent}%`;

  calculateTeamOVR();
}

function switchTab(tabId) {
  document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

  document.getElementById(`section-${tabId}`).classList.add("active");
  const navIndex = ["home", "team", "players", "packs", "gameplay"].indexOf(tabId);
  if (navIndex !== -1) {
    document.querySelectorAll(".nav-item")[navIndex].classList.add("active");
  }

  if (tabId === "team") renderPitch();
  if (tabId === "players") renderInventory();
  if (tabId === "gameplay") updateOpponentPreview();
}

// 3. SQUAD MANAGEMENT (SÂN BÓNG 11 VỊ TRÍ)
function renderPitch() {
  const container = document.getElementById("pitch-container");
  container.innerHTML = "";

  const formationKey = currentUserData.formation || "4-3-3";
  const layout = FORMATIONS[formationKey];

  layout.forEach((slot, index) => {
    const slotEl = document.createElement("div");
    slotEl.className = "pitch-slot";
    slotEl.style.top = slot.top;
    slotEl.style.left = slot.left;

    const player = currentUserData.team[index];

    if (player) {
      slotEl.innerHTML = createPlayerCardHTML(player, true);
      slotEl.onclick = () => swapOrRemoveSlot(index);
    } else {
      slotEl.innerHTML = `<div class="pitch-slot-empty">${slot.pos}</div>`;
      slotEl.onclick = () => assignPlayerToSlot(index);
    }

    container.appendChild(slotEl);
  });

  renderReserves();
  calculateTeamOVR();
}

function renderReserves() {
  const container = document.getElementById("reserves-list");
  container.innerHTML = "";

  const startersIds = currentUserData.team.filter(p => p !== null).map(p => p.id);
  const reserves = currentUserData.inventory.filter(p => !startersIds.includes(p.id));

  reserves.forEach(player => {
    const card = document.createElement("div");
    card.innerHTML = createPlayerCardHTML(player, true);
    card.onclick = () => showPlayerDetail(player);
    container.appendChild(card);
  });
}

function changeFormation(val) {
  currentUserData.formation = val;
  saveUserData();
  renderPitch();
}

function calculateTeamOVR() {
  const starters = currentUserData.team.filter(p => p !== null);
  if (starters.length === 0) return;

  const totalOvr = starters.reduce((acc, curr) => acc + curr.ovr, 0);
  const avgOvr = Math.round(totalOvr / starters.length);

  document.getElementById("squad-team-ovr").innerText = avgOvr;
  document.getElementById("dash-team-ovr").innerText = avgOvr;
}

function createPlayerCardHTML(p, mini = false) {
  const rarityClass = p.rarity ? p.rarity.toLowerCase() : "gold";
  if (mini) {
    return `
      <div class="player-card-mini ${rarityClass}">
        <div class="card-top">
          <span class="card-ovr">${p.ovr}</span>
          <span class="card-pos">${p.position}</span>
        </div>
        <div class="card-name">${p.name}</div>
      </div>
    `;
  }
  return "";
}

// 4. KHO CẦU THỦ & LỌC
function renderInventory() {
  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";

  const startersIds = currentUserData.team.filter(p => p !== null).map(p => p.id);

  currentUserData.inventory.forEach(player => {
    const card = document.createElement("div");
    card.className = "inv-card-wrapper";
    const isStarter = startersIds.includes(player.id);

    card.innerHTML = `
      ${createPlayerCardHTML(player, true)}
      ${isStarter ? '<small class="text-cyan">Đang đá chính</small>' : ''}
    `;
    card.onclick = () => showPlayerDetail(player);
    grid.appendChild(card);
  });
}

function filterInventory() {
  const search = document.getElementById("inv-search").value.toLowerCase();
  const pos = document.getElementById("inv-filter-pos").value;
  const rarity = document.getElementById("inv-filter-rarity").value;

  const cards = document.querySelectorAll("#inventory-grid .inv-card-wrapper");
  currentUserData.inventory.forEach((player, i) => {
    const matchSearch = player.name.toLowerCase().includes(search);
    const matchPos = pos === "ALL" || player.position === pos;
    const matchRarity = rarity === "ALL" || player.rarity === rarity;

    if (cards[i]) {
      cards[i].style.display = (matchSearch && matchPos && matchRarity) ? "block" : "none";
    }
  });
}

function showPlayerDetail(player) {
  const container = document.getElementById("modal-player-card-container");
  container.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h2>${player.name} (${player.position})</h2>
      <h1 class="text-gold" style="font-size: 3rem;">${player.ovr}</h1>
      <p>Câu lạc bộ: ${player.club || 'Free Agent'}</p>
      <p>Độ hiếm: ${player.rarity}</p>
      <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
        <div>Tốc độ (PAC): ${player.stats?.pace || player.ovr}</div>
        <div>Sút (SHO): ${player.stats?.shooting || player.ovr}</div>
        <div>Chuyền (PAS): ${player.stats?.passing || player.ovr}</div>
        <div>Rê bóng (DRI): ${player.stats?.dribbling || player.ovr}</div>
        <div>Phòng thủ (DEF): ${player.stats?.defending || player.ovr}</div>
        <div>Thể lực (PHY): ${player.stats?.physical || player.ovr}</div>
      </div>
    </div>
  `;
  document.getElementById("modal-player-detail").classList.remove("d-none");
}

function closePlayerModal() {
  document.getElementById("modal-player-detail").classList.add("d-none");
}

// 5. PACK STORE & MỞ THẺ
function buyPack(type, price, currency) {
  if (currentUserData[currency] < price) {
    alert(`Bạn không đủ ${currency}!`);
    return;
  }

  currentUserData[currency] -= price;
  updateTopBarUI();

  // Chọn cầu thủ rớt theo tỷ lệ
  let pool = [...PLAYERS_DATABASE];
  if (type === "bronze") pool = pool.filter(p => p.ovr <= 75);
  if (type === "gold") pool = pool.filter(p => p.ovr >= 75 && p.ovr <= 88);
  if (type === "premium") pool = pool.filter(p => p.ovr >= 83);
  if (type === "icon") pool = pool.filter(p => p.rarity === "ICON");

  const droppedPlayer = pool[Math.floor(Math.random() * pool.length)];

  // Thêm cầu thủ vào kho với ID duy nhất
  const newPlayer = { ...droppedPlayer, id: `${droppedPlayer.id}_${Date.now()}` };
  currentUserData.inventory.push(newPlayer);
  saveUserData();

  // Mở Animation Modal
  triggerPackOpeningAnimation(newPlayer);
}

function triggerPackOpeningAnimation(player) {
  const modal = document.getElementById("modal-pack-opening");
  const box = document.getElementById("pack-3d-box");
  const revealed = document.getElementById("pack-revealed-card");
  const btn = document.getElementById("btn-claim-pack");

  modal.classList.remove("d-none");
  box.classList.remove("d-none");
  revealed.classList.add("d-none");
  btn.classList.add("d-none");

  setTimeout(() => {
    box.classList.add("d-none");
    revealed.innerHTML = createPlayerCardHTML(player, false);
    revealed.classList.remove("d-none");
    btn.classList.remove("d-none");
  }, 1200);
}

function closePackOpening() {
  document.getElementById("modal-pack-opening").classList.add("d-none");
  renderInventory();
}

/* ==========================================================================
   BƯỚC 6: MATCH ENGINE & GAMEPLAY LOGIC
   ========================================================================== */

const OPPONENT_PRESETS = {
  amateur: { name: "Nghiệp Dư FC", icon: "fa-shield", ovr: 68, att: 67, mid: 68, def: 69, coinsWin: 300, xpWin: 80 },
  semipro: { name: "Bán Chuyên United", icon: "fa-dragon", ovr: 78, att: 79, mid: 77, def: 78, coinsWin: 500, xpWin: 120 },
  pro: { name: "Chuyên Nghiệp City", icon: "fa-crown", ovr: 86, att: 88, mid: 85, def: 85, coinsWin: 800, xpWin: 200 },
  legend: { name: "Huyền Thoại All-Stars", icon: "fa-fire", ovr: 93, att: 95, mid: 92, def: 92, coinsWin: 1500, xpWin: 350 }
};

let currentMatch = {
  active: false, paused: false, minute: 0, speed: 1,
  timerInterval: null, homeScore: 0, awayScore: 0,
  homeShots: 0, awayShots: 0, homeSOT: 0, awaySOT: 0,
  homePossession: 50, opponentKey: "semipro",
  myStats: { att: 80, mid: 80, def: 80, ovr: 80 }, oppStats: null
};

function updateOpponentPreview() {
  const oppKey = document.getElementById("select-opponent").value;
  const opp = OPPONENT_PRESETS[oppKey];
  currentMatch.opponentKey = oppKey;

  document.getElementById("pm-opp-name").innerText = opp.name.toUpperCase();
  document.getElementById("pm-opp-ovr").innerText = opp.ovr;
  document.getElementById("pm-opp-att").innerText = opp.att;
  document.getElementById("pm-opp-mid").innerText = opp.mid;
  document.getElementById("pm-opp-def").innerText = opp.def;
  document.getElementById("pm-opp-icon").innerHTML = `<i class="fa-solid ${opp.icon}"></i>`;

  calculateMyTeamRatings();
}

function calculateMyTeamRatings() {
  if (!currentUserData || !currentUserData.team) return;
  const starting11 = currentUserData.team.filter(p => p !== null);

  if (starting11.length === 0) {
    currentMatch.myStats = { att: 60, mid: 60, def: 60, ovr: 60 };
  } else {
    let totalShooting = 0, totalPassing = 0, totalDefending = 0, totalPace = 0;
    starting11.forEach(p => {
      totalShooting += p.stats?.shooting || p.ovr;
      totalPassing += p.stats?.passing || p.ovr;
      totalDefending += p.stats?.defending || p.ovr;
      totalPace += p.stats?.pace || p.ovr;
    });

    const count = starting11.length;
    const att = Math.round((totalShooting / count) * 0.7 + (totalPace / count) * 0.3);
    const mid = Math.round((totalPassing / count) * 0.7 + (totalPace / count) * 0.3);
    const def = Math.round((totalDefending / count) * 0.7 + (totalPace / count) * 0.3);
    const ovr = Math.round((att + mid + def) / 3);

    currentMatch.myStats = { att, mid, def, ovr };
  }

  document.getElementById("pm-my-team-name").innerText = currentUserData.clubName || "ULTIMATE XI";
  document.getElementById("pm-my-ovr").innerText = currentMatch.myStats.ovr;
  document.getElementById("pm-my-att").innerText = currentMatch.myStats.att;
  document.getElementById("pm-my-mid").innerText = currentMatch.myStats.mid;
  document.getElementById("pm-my-def").innerText = currentMatch.myStats.def;
}

function startMatch() {
  if (currentUserData.energy < 1) {
    alert("Bạn không đủ Energy!");
    return;
  }

  currentUserData.energy -= 1;
  updateTopBarUI();
  saveUserData();

  const opp = OPPONENT_PRESETS[currentMatch.opponentKey];
  currentMatch.oppStats = opp;
  currentMatch.active = true;
  currentMatch.paused = false;
  currentMatch.minute = 0;
  currentMatch.homeScore = 0;
  currentMatch.awayScore = 0;
  currentMatch.homeShots = 0;
  currentMatch.awayShots = 0;
  currentMatch.homeSOT = 0;
  currentMatch.awaySOT = 0;

  const totalMid = currentMatch.myStats.mid + opp.mid;
  currentMatch.homePossession = Math.round((currentMatch.myStats.mid / totalMid) * 100);

  document.getElementById("pre-match-view").classList.add("d-none");
  document.getElementById("in-match-view").classList.remove("d-none");

  document.getElementById("sb-home-name").innerText = currentUserData.clubName || "MY TEAM";
  document.getElementById("sb-home-ovr").innerText = currentMatch.myStats.ovr;
  document.getElementById("sb-away-name").innerText = opp.name.toUpperCase();
  document.getElementById("sb-away-ovr").innerText = opp.ovr;
  document.getElementById("score-home").innerText = "0";
  document.getElementById("score-away").innerText = "0";
  document.getElementById("match-timer").innerText = "00'";
  document.getElementById("match-status-text").innerText = "ĐANG THI ĐẤU";

  const logContainer = document.getElementById("commentary-log");
  logContainer.innerHTML = `<div class="log-entry info">Trọng tài đã thổi còi bắt đầu trận đấu giữa ${currentUserData.clubName} và ${opp.name}!</div>`;

  runMatchLoop();
}

function runMatchLoop() {
  if (currentMatch.timerInterval) clearInterval(currentMatch.timerInterval);

  const baseIntervalSpeed = 1000;
  const currentInterval = baseIntervalSpeed / currentMatch.speed;

  currentMatch.timerInterval = setInterval(() => {
    if (currentMatch.paused || !currentMatch.active) return;

    currentMatch.minute++;
    document.getElementById("match-timer").innerText = `${currentMatch.minute < 10 ? '0' : ''}${currentMatch.minute}'`;

    moveSimBall();
    simulateMinuteEvent(currentMatch.minute);

    if (currentMatch.minute >= 90) {
      finishMatch();
    }
  }, currentInterval);
}

function moveSimBall() {
  const ball = document.getElementById("sim-ball");
  if (!ball) return;
  ball.style.left = `${15 + Math.floor(Math.random() * 70)}%`;
  ball.style.top = `${20 + Math.floor(Math.random() * 60)}%`;
}

function getRandomStartingPlayer() {
  const starters = currentUserData.team.filter(p => p !== null);
  if (starters.length === 0) return { name: "Cầu thủ Đội nhà" };
  return starters[Math.floor(Math.random() * starters.length)];
}

function simulateMinuteEvent(minute) {
  const myAtt = currentMatch.myStats.att;
  const oppDef = currentMatch.oppStats.def;
  const oppAtt = currentMatch.oppStats.att;
  const myDef = currentMatch.myStats.def;

  if (Math.random() < 0.15) {
    const isHomeAttack = Math.random() * (myAtt + oppAtt) < myAtt;

    if (isHomeAttack) {
      currentMatch.homeShots++;
      const player = getRandomStartingPlayer();
      const goalProbability = (myAtt / (myAtt + oppDef)) * 0.35;
      const rand = Math.random();

      if (rand < goalProbability) {
        currentMatch.homeScore++;
        currentMatch.homeSOT++;
        document.getElementById("score-home").innerText = currentMatch.homeScore;
        addCommentaryLog(`${minute}' - VÀOOOOO! ${player.name} tung cú sút xé lưới đối phương! (${currentMatch.homeScore}-${currentMatch.awayScore})`, "goal");
      } else if (rand < goalProbability + 0.3) {
        currentMatch.homeSOT++;
        addCommentaryLog(`${minute}' - ${player.name} dứt điểm căng nhưng thủ môn cản phá thành công.`, "normal");
      } else {
        addCommentaryLog(`${minute}' - Cú sút của ${player.name} đi chệch cột dọc.`, "normal");
      }
    } else {
      currentMatch.awayShots++;
      const goalProbability = (oppAtt / (oppAtt + myDef)) * 0.32;
      const rand = Math.random();

      if (rand < goalProbability) {
        currentMatch.awayScore++;
        currentMatch.awaySOT++;
        document.getElementById("score-away").innerText = currentMatch.awayScore;
        addCommentaryLog(`${minute}' - BÀN THẮNG! Đội bạn phản công và ghi bàn! (${currentMatch.homeScore}-${currentMatch.awayScore})`, "opp-goal");
      } else {
        addCommentaryLog(`${minute}' - Đội bạn dứt điểm không chính xác.`, "normal");
      }
    }
  }
}

function addCommentaryLog(text, type = "normal") {
  const container = document.getElementById("commentary-log");
  if (!container) return;

  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerText = text;

  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function setMatchSpeed(speed) {
  currentMatch.speed = speed;
  document.querySelectorAll(".btn-speed").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  runMatchLoop();
}

function togglePauseMatch() {
  currentMatch.paused = !currentMatch.paused;
  const btn = document.getElementById("btn-pause-match");
  btn.innerHTML = currentMatch.paused ? `<i class="fa-solid fa-play"></i> Tiếp Tục` : `<i class="fa-solid fa-pause"></i> Tạm Dừng`;
  document.getElementById("match-status-text").innerText = currentMatch.paused ? "TẠM DỪNG" : "ĐANG THI ĐẤU";
}

function confirmForfeit() {
  if (confirm("Đầu hàng trận đấu? Bạn sẽ bị tính thua 0-3.")) {
    clearInterval(currentMatch.timerInterval);
    currentMatch.active = false;
    currentMatch.homeScore = 0;
    currentMatch.awayScore = 3;
    finishMatch(true);
  }
}

function finishMatch(isForfeit = false) {
  clearInterval(currentMatch.timerInterval);
  currentMatch.active = false;

  const opp = currentMatch.oppStats;
  let coinsEarned = 0, xpEarned = 0;
  let statusTitle = "", statusSub = "";

  if (isForfeit) {
    statusTitle = "BỎ CUỘC"; statusSub = "Bạn đã đầu hàng."; coinsEarned = 50; xpEarned = 10;
  } else if (currentMatch.homeScore > currentMatch.awayScore) {
    statusTitle = "CHIẾN THẮNG!"; statusSub = "Thắng lợi thuyết phục!";
    coinsEarned = opp.coinsWin + (currentMatch.homeScore * 50); xpEarned = opp.xpWin;
  } else if (currentMatch.homeScore === currentMatch.awayScore) {
    statusTitle = "TRẬN HÒA!"; statusSub = "Trận đấu cân tài cân sức.";
    coinsEarned = Math.round(opp.coinsWin * 0.5); xpEarned = Math.round(opp.xpWin * 0.5);
  } else {
    statusTitle = "THẤT BẠI"; statusSub = "Cần cải thiện thêm đội hình.";
    coinsEarned = Math.round(opp.coinsWin * 0.2); xpEarned = Math.round(opp.xpWin * 0.2);
  }

  currentUserData.coins += coinsEarned;
  currentUserData.xp += xpEarned;

  checkLevelUp();
  saveUserData();
  updateTopBarUI();

  document.getElementById("result-status-title").innerText = statusTitle;
  document.getElementById("result-subtitle").innerText = statusSub;
  document.getElementById("res-home-name").innerText = currentUserData.clubName || "MY TEAM";
  document.getElementById("res-away-name").innerText = opp.name.toUpperCase();
  document.getElementById("res-home-score").innerText = currentMatch.homeScore;
  document.getElementById("res-away-score").innerText = currentMatch.awayScore;

  document.getElementById("stat-home-pos").innerText = `${currentMatch.homePossession}%`;
  document.getElementById("stat-away-pos").innerText = `${100 - currentMatch.homePossession}%`;
  document.getElementById("stat-home-shots").innerText = currentMatch.homeShots;
  document.getElementById("stat-away-shots").innerText = currentMatch.awayShots;
  document.getElementById("stat-home-sot").innerText = currentMatch.homeSOT;
  document.getElementById("stat-away-sot").innerText = currentMatch.awaySOT;

  document.getElementById("res-coins-earned").innerText = `+${coinsEarned}`;
  document.getElementById("res-xp-earned").innerText = `+${xpEarned}`;

  document.getElementById("modal-match-result").classList.remove("d-none");
}

function closeMatchResult() {
  document.getElementById("modal-match-result").classList.add("d-none");
  document.getElementById("in-match-view").classList.add("d-none");
  document.getElementById("pre-match-view").classList.remove("d-none");
}

function checkLevelUp() {
  const xpNeeded = currentUserData.level * 200;
  if (currentUserData.xp >= xpNeeded) {
    currentUserData.xp -= xpNeeded;
    currentUserData.level += 1;
    currentUserData.gems += 20;
    alert(`🎉 CHÚC MỪNG! Đội bóng đã đạt LEVEL ${currentUserData.level}! Nhận 20 Gems!`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Bật Modal Auth khi vừa mở trang
  document.getElementById("modal-auth").classList.remove("d-none");
});

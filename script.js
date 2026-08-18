/**
 * ULTIMATE FOOTBALL WEB - CORE & AUTH SYSTEM (STEP 2)
 */

// ĐỊNH NGHĨA STORAGE KEYS
const STORAGE_KEYS = {
  USERS: 'ufw_registered_users',
  SESSION: 'ufw_active_session',
  GAME_DATA_PREFIX: 'ufw_data_'
};

// CẤU TRÚC GAME DATA MẶC ĐỊNH CHO TÀI KHOẢN MỚI
const DEFAULT_GAME_DATA = {
  coins: 100000,
  gems: 500,
  energy: 20,
  maxEnergy: 20,
  level: 1,
  xp: 0,
  teamOvr: 75,
  players: [],
  team: [],
  formation: "4-3-3",
  missions: [],
  transactions: [],
  settings: { sound: true, music: true }
};

// BIẾN TOÀN CỤC LƯU DỮ LIỆU CỦA USER ĐANG ĐĂNG NHẬP
let currentUser = null;
let currentUserData = null;

// ==========================================
// KHỞI TẠO VÀ LẮNG NGHE SỰ KIỆN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * Khởi tạo ứng dụng
 */
function initApp() {
  console.log("Ultimate Football Web Engine Initialized");
  checkSession();
}

// ==========================================
// ĐỒNG BỘ DỮ LIỆU & STORAGE SYSTEM
// ==========================================

/**
 * Lấy danh sách toàn bộ tài khoản từ localStorage
 */
function getRegisteredUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : {};
}

/**
 * Lưu danh sách tài khoản
 */
function saveRegisteredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Tải game data của user cụ thể từ localStorage
 */
function loadUserData(username) {
  const key = STORAGE_KEYS.GAME_DATA_PREFIX + username.toLowerCase();
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Lỗi đọc game data từ LocalStorage:", e);
      return { ...DEFAULT_GAME_DATA };
    }
  }
  return { ...DEFAULT_GAME_DATA };
}

/**
 * Lưu game data hiện tại của user vào localStorage
 */
function saveCurrentUserData() {
  if (!currentUser || !currentUserData) return;
  const key = STORAGE_KEYS.GAME_DATA_PREFIX + currentUser.toLowerCase();
  localStorage.setItem(key, JSON.stringify(currentUserData));
}

/**
 * Kiểm tra phiên đăng nhập khi tải lại trang
 */
function checkSession() {
  const activeSession = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (activeSession) {
    currentUser = activeSession;
    currentUserData = loadUserData(currentUser);
    hideAuthModal();
    updateUIWithUserData();
  } else {
    showAuthModal();
  }
}

// ==========================================
// PHÂN HỆ ĐĂNG NHẬP / ĐĂNG KÝ / ĐĂNG XUẤT
// ==========================================

/**
 * Chuyển tab giữa Đăng Nhập và Đăng Ký
 */
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

/**
 * Xử lý sự kiện Đăng ký
 */
async function handleRegister(event) {
  event.preventDefault();
  hideAuthError();

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const passwordConfirm = document.getElementById('reg-password-confirm').value;

  // Validate Frontend
  if (username.length < 3 || username.length > 16) {
    showAuthError("Tên tài khoản phải từ 3 đến 16 ký tự!");
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showAuthError("Tên tài khoản chỉ gồm chữ cái, số và dấu gạch dưới!");
    return;
  }

  if (password.length < 4) {
    showAuthError("Mật khẩu phải chứa ít nhất 4 ký tự!");
    return;
  }

  if (password !== passwordConfirm) {
    showAuthError("Mật khẩu xác nhận không khớp!");
    return;
  }

  const users = getRegisteredUsers();
  const userKey = username.toLowerCase();

  if (users[userKey]) {
    showAuthError("Tên tài khoản này đã được đăng ký!");
    return;
  }

  // Đăng ký thành công -> Lưu người dùng
  users[userKey] = {
    username: username,
    password: password, // Chú ý: Đây là bản demo frontend, thực tế phải hash password trên backend
    createdAt: new Date().toISOString()
  };

  saveRegisteredUsers(users);

  // Tạo game data mặc định cho user mới
  currentUser = username;
  currentUserData = { ...DEFAULT_GAME_DATA };
  saveCurrentUserData();

  // Lưu Session
  localStorage.setItem(STORAGE_KEYS.SESSION, username);

  // Cập nhật giao diện
  hideAuthModal();
  updateUIWithUserData();

  // Clear inputs
  document.getElementById('form-register').reset();
}

/**
 * Xử lý sự kiện Đăng nhập
 */
async function handleLogin(event) {
  event.preventDefault();
  hideAuthError();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = getRegisteredUsers();
  const userKey = username.toLowerCase();

  if (!users[userKey] || users[userKey].password !== password) {
    showAuthError("Tên tài khoản hoặc mật khẩu không chính xác!");
    return;
  }

  // Đăng nhập thành công -> Set session
  currentUser = users[userKey].username;
  currentUserData = loadUserData(currentUser);
  localStorage.setItem(STORAGE_KEYS.SESSION, currentUser);

  hideAuthModal();
  updateUIWithUserData();

  // Clear inputs
  document.getElementById('form-login').reset();
}

/**
 * Đăng xuất khỏi hệ thống
 */
function handleLogout() {
  saveCurrentUserData();
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  currentUser = null;
  currentUserData = null;
  showAuthModal();
}

// ==========================================
// CẬP NHẬT GIAO DIỆN
// ==========================================

function showAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

function showAuthError(msg) {
  const errBox = document.getElementById('auth-error');
  errBox.innerText = msg;
  errBox.style.display = 'block';
}

function hideAuthError() {
  const errBox = document.getElementById('auth-error');
  errBox.style.display = 'none';
  errBox.innerText = '';
}

/**
 * Đồng bộ dữ liệu người dùng lên UI (Header & Stats)
 */
function updateUIWithUserData() {
  if (!currentUserData) return;

  document.getElementById('user-name').innerText = currentUser;
  document.getElementById('user-level').innerText = `LV.${currentUserData.level || 1}`;
  document.getElementById('team-ovr').innerText = currentUserData.teamOvr || 75;
  document.getElementById('coins-count').innerText = (currentUserData.coins || 0).toLocaleString('vi-VN');
  document.getElementById('gems-count').innerText = (currentUserData.gems || 0).toLocaleString('vi-VN');
  document.getElementById('energy-count').innerText = `${currentUserData.energy || 0}/${currentUserData.maxEnergy || 20}`;
}

/**
 * Chuyển đổi giữa các Section trong Game
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

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
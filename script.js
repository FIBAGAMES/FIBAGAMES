/**
 * ULTIMATE FOOTBALL WEB - MAIN ENGINE (STEP 1)
 * Quản lý khởi tạo giao diện Home & Navigation
 */

// Đảm bảo DOM đã tải xong trước khi thực thi
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * Khởi tạo ứng dụng
 */
function initApp() {
  console.log("Ultimate Football Web - Step 1 Initialized");
  loadInitialData();
  setupEventListeners();
}

/**
 * Load dữ liệu giả lập cho Trang Chủ
 */
function loadInitialData() {
  // Cập nhật thông số mặc định nếu chưa có
  const defaultUserData = {
    username: "Manager",
    level: 12,
    coins: 1000000,
    gems: 2500,
    energy: 100,
    maxEnergy: 100,
    ovr: 88
  };

  // Hiển thị lên giao diện
  document.getElementById('user-name').innerText = defaultUserData.username;
  document.getElementById('team-ovr').innerText = defaultUserData.ovr;
  document.getElementById('coins-count').innerText = defaultUserData.coins.toLocaleString('vi-VN');
  document.getElementById('gems-count').innerText = defaultUserData.gems.toLocaleString('vi-VN');
  document.getElementById('energy-count').innerText = `${defaultUserData.energy}/${defaultUserData.maxEnergy}`;
}

/**
 * Thiết lập sự kiện lắng nghe
 */
function setupEventListeners() {
  // Có thể mở rộng sự kiện bấm nút ở các bước sau
}

/**
 * Chuyển đổi giữa các Section trong Game
 * @param {string} sectionId - ID của khu vực cần hiển thị
 */
function switchSection(sectionId) {
  // 1. Ẩn tất cả các section
  const sections = document.querySelectorAll('.game-section');
  sections.forEach(sec => sec.classList.remove('active'));

  // 2. Kích hoạt section mục tiêu
  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // 3. Cập nhật trạng thái Active cho Nav Buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-target') === sectionId) {
      btn.classList.add('active');
    }
  });

  // Cuộn mượt lên đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
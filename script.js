// STATE GAME TỔNG THỂ
let userState = {
    coins: 1000,
    gems: 50,
    level: 1,
    xp: 0,
    ownedPlayerIds: [],
    squad: {
        LW: null, ST: null, RW: null,
        CAM: null, CM: null, CDM: null,
        LB: null, CB1: null, CB2: null, RB: null,
        GK: null
    }
};

// KHỞI TẠO HỆ THỐNG
document.addEventListener("DOMContentLoaded", () => {
    loadGameState();
    initNavigation();
    initRollSystem();
    initCollectionSystem();
    initSquadSystem();
    initNationsSystem();
    initQuestsAndShop();
    updateUIHeader();
});

// LƯU VÀ TẢI TỪ LOCALSTORAGE
function saveGameState() {
    localStorage.setItem("FPC_USER_STATE", JSON.stringify(userState));
}

function loadGameState() {
    const saved = localStorage.getItem("FPC_USER_STATE");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            userState = { ...userState, ...parsed };
        } catch (e) {
            console.error("Lỗi khi load state:", e);
        }
    }
}

function updateUIHeader() {
    document.getElementById("user-coins").innerText = userState.coins.toLocaleString();
    document.getElementById("user-gems").innerText = userState.gems.toLocaleString();
    document.getElementById("user-level").innerText = userState.level;
    document.getElementById("user-xp").innerText = userState.xp;
    document.getElementById("col-count").innerText = userState.ownedPlayerIds.length;
}

function addXP(amount) {
    userState.xp += amount;
    if (userState.xp >= userState.level * 100) {
        userState.xp -= userState.level * 100;
        userState.level += 1;
        alert(`🎉 CHÚC MỪNG! BẠN ĐÃ LÊN LEVEL ${userState.level}!`);
    }
    updateUIHeader();
    saveGameState();
}

// KHỞI TẠO ĐIỀU HƯỚNG TAB
function initNavigation() {
    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabTarget = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(`tab-${tabTarget}`).classList.add("active");

            if (tabTarget === "collection") renderCollection();
            if (tabTarget === "squad") renderSquad();
            if (tabTarget === "nations") renderNations();
        });
    });
}

// TẠO THẺ CẦU THỦ HTML
function createPlayerCardHTML(player, isLocked = false) {
    const rarityClass = `rarity-${player.rarity.toLowerCase()}`;
    const avatarUrl = player.image && player.image.trim() !== "" ? player.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=128`;

    return `
        <div class="player-card ${rarityClass} ${isLocked ? 'locked' : ''}" data-id="${player.id}">
            <div class="card-top">
                <span class="card-ovr">${player.rating}</span>
                <span class="card-pos">${player.position}</span>
            </div>
            <div class="card-avatar-wrap">
                <img src="${avatarUrl}" alt="${player.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=333&color=fff'">
            </div>
            <div class="card-info">
                <div class="card-name">${player.name}</div>
                <div class="card-details">${player.nationality} • ${player.year}</div>
                <div class="card-details">${player.club}</div>
            </div>
            <div class="card-rarity-tag">${player.rarity}</div>
        </div>
    `;
}

// HỆ THỐNG ROLL (CHIÊU MỘ)
function initRollSystem() {
    document.getElementById("btn-roll-1").addEventListener("click", () => performRoll(1, 100));
    document.getElementById("btn-roll-10").addEventListener("click", () => performRoll(10, 950));
    document.getElementById("btn-close-reveal").addEventListener("click", () => {
        document.getElementById("special-reveal-modal").classList.add("hidden");
    });
}

function getRandomPlayerByWeight() {
    // Tỷ lệ ngẫu nhiên trọng số để cầu thủ rating cao hiếm hơn
    const rand = Math.random() * 100;
    let targetRarity = "COMMON";

    if (rand < 0.05) targetRarity = "ULTIMATE";      // 0.05%
    else if (rand < 0.8) targetRarity = "ICON";        // 0.75%
    else if (rand < 5.0) targetRarity = "LEGENDARY";   // 4.2%
    else if (rand < 18.0) targetRarity = "LEGEND";     // 13%
    else if (rand < 42.0) targetRarity = "EPIC";       // 24%
    else if (rand < 72.0) targetRarity = "RARE";       // 30%
    else targetRarity = "COMMON";                      // 28%

    const pool = PLAYERS_DATABASE.filter(p => p.rarity === targetRarity);
    if (pool.length === 0) return PLAYERS_DATABASE[Math.floor(Math.random() * PLAYERS_DATABASE.length)];
    return pool[Math.floor(Math.random() * pool.length)];
}

function performRoll(count, cost) {
    if (userState.coins < cost) {
        alert("Bạn không đủ Coins để mở gói này!");
        return;
    }

    userState.coins -= cost;
    addXP(count * 5);
    updateUIHeader();

    const resultsContainer = document.getElementById("roll-results-container");
    resultsContainer.innerHTML = "";

    let hasUltimate = false;
    let ultimatePlayer = null;

    for (let i = 0; i < count; i++) {
        const p = getRandomPlayerByWeight();
        if (!userState.ownedPlayerIds.includes(p.id)) {
            userState.ownedPlayerIds.push(p.id);
        }
        
        if (p.rating === 99) {
            hasUltimate = true;
            ultimatePlayer = p;
        }

        resultsContainer.innerHTML += createPlayerCardHTML(p, false);
    }

    saveGameState();

    if (hasUltimate && ultimatePlayer) {
        triggerSpecial99Reveal(ultimatePlayer);
    }
}

function triggerSpecial99Reveal(player) {
    const modal = document.getElementById("special-reveal-modal");
    const cardContainer = document.getElementById("reveal-card-container");
    cardContainer.innerHTML = createPlayerCardHTML(player, false);
    modal.classList.remove("hidden");
}

// HỆ THỐNG COLLECTION (BỘ SƯU TẬP 500 PLAYERS)
function initCollectionSystem() {
    document.getElementById("search-player").addEventListener("input", renderCollection);
    document.getElementById("filter-rarity").addEventListener("change", renderCollection);
    document.getElementById("filter-position").addEventListener("change", renderCollection);
}

function renderCollection() {
    const grid = document.getElementById("collection-grid");
    const search = document.getElementById("search-player").value.toLowerCase();
    const rarity = document.getElementById("filter-rarity").value;
    const posGroup = document.getElementById("filter-position").value;

    const totalCount = PLAYERS_DATABASE.length; // Luôn luôn là 500
    const ownedCount = userState.ownedPlayerIds.length;
    const pct = Math.round((ownedCount / totalCount) * 100);

    document.getElementById("col-count").innerText = ownedCount;
    document.getElementById("col-percent").innerText = `${pct}% (${ownedCount}/${totalCount})`;
    document.getElementById("col-progress-bar").style.width = `${pct}%`;

    grid.innerHTML = "";

    PLAYERS_DATABASE.forEach(p => {
        // Search Filter
        const matchSearch = p.name.toLowerCase().includes(search) || 
                            p.club.toLowerCase().includes(search) || 
                            p.nationality.toLowerCase().includes(search);
        
        // Rarity Filter
        const matchRarity = rarity === "ALL" || p.rarity === rarity;

        // Position Filter
        let matchPos = true;
        if (posGroup === "GK") matchPos = p.position === "GK";
        else if (posGroup === "DEF") matchPos = ["CB", "LB", "RB"].includes(p.position);
        else if (posGroup === "MID") matchPos = ["CDM", "CM", "CAM", "LM", "RM"].includes(p.position);
        else if (posGroup === "FW") matchPos = ["ST", "CF", "LW", "RW"].includes(p.position);

        if (matchSearch && matchRarity && matchPos) {
            const isOwned = userState.ownedPlayerIds.includes(p.id);
            grid.innerHTML += createPlayerCardHTML(p, !isOwned);
        }
    });
}

// HỆ THỐNG ĐỘI HÌNH (SQUAD BEST XI)
function initSquadSystem() {
    document.getElementById("btn-autobuild").addEventListener("click", autoBuildBestSquad);
}

function renderSquad() {
    let totalOvr = 0;
    const slots = document.querySelectorAll(".squad-slot");

    slots.forEach(slot => {
        const posTag = slot.getAttribute("data-pos");
        const pId = userState.squad[posTag];
        const cardSlot = slot.querySelector(".slot-card");

        if (pId) {
            const player = PLAYERS_DATABASE.find(p => p.id === pId);
            if (player) {
                cardSlot.innerHTML = createPlayerCardHTML(player, false);
                totalOvr += player.rating;
            } else {
                cardSlot.innerHTML = `<div class="empty-slot">+ Chồng</div>`;
            }
        } else {
            cardSlot.innerHTML = `<div class="empty-slot">+ Chọn</div>`;
        }
    });

    document.getElementById("squad-total-ovr").innerText = totalOvr;
}

function autoBuildBestSquad() {
    if (userState.ownedPlayerIds.length === 0) {
        alert("Bạn chưa sở hữu cầu thủ nào! Hãy mở gói trước.");
        return;
    }

    const ownedPlayers = PLAYERS_DATABASE.filter(p => userState.ownedPlayerIds.includes(p.id))
                                         .sort((a,b) => b.rating - a.rating);

    const positions = ["LW", "ST", "RW", "CAM", "CM", "CDM", "LB", "CB1", "CB2", "RB", "GK"];
    const usedIds = new Set();

    positions.forEach(pos => {
        let basePos = pos.startsWith("CB") ? "CB" : pos;
        let match = ownedPlayers.find(p => p.position === basePos && !usedIds.has(p.id));

        if (!match) {
            // Lấy cầu thủ tốt nhất còn lại bất kể vị trí
            match = ownedPlayers.find(p => !usedIds.has(p.id));
        }

        if (match) {
            userState.squad[pos] = match.id;
            usedIds.add(match.id);
        }
    });

    saveGameState();
    renderSquad();
    alert("Đã tự động tối ưu Đội Hình Mạnh Nhất!");
}

// HỆ THỐNG BỘ SƯU TẬP QUỐC GIA
function initNationsSystem() {}

function renderNations() {
    const container = document.getElementById("nations-list");
    container.innerHTML = "";

    const nationsMap = {};
    PLAYERS_DATABASE.forEach(p => {
        if (!nationsMap[p.nationality]) {
            nationsMap[p.nationality] = { total: 0, owned: 0 };
        }
        nationsMap[p.nationality].total += 1;
        if (userState.ownedPlayerIds.includes(p.id)) {
            nationsMap[p.nationality].owned += 1;
        }
    });

    Object.keys(nationsMap).sort().forEach(nat => {
        const data = nationsMap[nat];
        const pct = Math.round((data.owned / data.total) * 100);
        container.innerHTML += `
            <div class="quest-card" style="margin-bottom: 10px;">
                <div class="quest-info">
                    <h4>🌐 ${nat}</h4>
                    <p>Sở hữu: ${data.owned} / ${data.total} cầu thủ</p>
                    <div class="progress-bar-bg" style="width: 200px;"><div class="progress-bar-fill" style="width: ${pct}%"></div></div>
                </div>
                <strong style="color: var(--accent-gold);">${pct}%</strong>
            </div>
        `;
    });
}

// NHIỆM VỤ VÀ CỬA HÀNG
function initQuestsAndShop() {
    document.getElementById("claim-q1").addEventListener("click", () => {
        userState.coins += 200;
        addXP(10);
        alert("Nhận +200 Coins!");
    });
    document.getElementById("claim-q2").addEventListener("click", () => {
        userState.gems += 50;
        addXP(25);
        alert("Nhận +50 Gems!");
    });
}

function buyCoins(gemCost, coinReward) {
    if (userState.gems < gemCost) {
        alert("Không đủ Gems!");
        return;
    }
    userState.gems -= gemCost;
    userState.coins += coinReward;
    updateUIHeader();
    saveGameState();
    alert(`Thành công đổi ${gemCost} Gems lấy ${coinReward} Coins!`);
}

function buyGemsDirect() {
    userState.gems += 100;
    updateUIHeader();
    saveGameState();
    alert("Đã nạp thành công +100 Gems!");
}

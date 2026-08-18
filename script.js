/* ==========================================================================
   FPC ULTIMATE 500 - GAME ENGINE & LOGIC HANDLER
   ========================================================================== */

// STATE MANAGEMENT
const STATE = {
    coins: 12450,
    gems: 250,
    level: 1,
    xp: 20,
    collectedIds: new Set(),
    squad: {
        LW: null, ST: null, RW: null,
        CM1: null, CAM: null, CM2: null,
        LB: null, CB1: null, CB2: null, RB: null,
        GK: null
    },
    quests: [
        { id: 'q1', title: 'Pack Opener', desc: 'Roll 1 player pack', req: 1, current: 0, rewardCoins: 200, rewardXp: 50, claimed: false },
        { id: 'q2', title: 'Squad Manager', desc: 'Place a player in your squad', req: 1, current: 0, rewardCoins: 300, rewardXp: 80, claimed: false },
        { id: 'q3', title: 'Collector', desc: 'Collect 10 unique players', req: 10, current: 0, rewardCoins: 1000, rewardXp: 200, claimed: false }
    ]
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    initNavigation();
    initRollSystem();
    initFilters();
    initSquadBuilder();
    updateUI();
});

// LOCAL STORAGE PERSISTENCE
function loadSavedData() {
    const saved = localStorage.getItem('FPC_ULTIMATE_500_SAVE');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            STATE.coins = parsed.coins ?? STATE.coins;
            STATE.gems = parsed.gems ?? STATE.gems;
            STATE.level = parsed.level ?? STATE.level;
            STATE.xp = parsed.xp ?? STATE.xp;
            STATE.collectedIds = new Set(parsed.collectedIds || []);
            STATE.squad = parsed.squad || STATE.squad;
            if (parsed.quests) STATE.quests = parsed.quests;
        } catch (e) {
            console.error("Save data parse error", e);
        }
    }
}

function saveData() {
    const dataToSave = {
        coins: STATE.coins,
        gems: STATE.gems,
        level: STATE.level,
        xp: STATE.xp,
        collectedIds: Array.from(STATE.collectedIds),
        squad: STATE.squad,
        quests: STATE.quests
    };
    localStorage.setItem('FPC_ULTIMATE_500_SAVE', JSON.stringify(dataToSave));
}

// UI UPDATE ENGINE
function updateUI() {
    // Currency HUD
    document.getElementById('coins-count').innerText = STATE.coins.toLocaleString();
    document.getElementById('gems-count').innerText = STATE.gems.toLocaleString();
    document.getElementById('user-level').innerText = STATE.level;
    document.getElementById('xp-fill').style.width = `${Math.min(100, (STATE.xp / (STATE.level * 100)) * 100)}%`;

    // Collection stats
    document.getElementById('collected-count').innerText = STATE.collectedIds.size;
    document.getElementById('total-count').innerText = PLAYER_DATABASE.length;
    const progressPercent = (STATE.collectedIds.size / PLAYER_DATABASE.length) * 100;
    document.getElementById('collection-progress').style.width = `${progressPercent}%`;

    // Render active views
    renderCollectionGrid();
    renderSquadPitch();
    renderNations();
    renderQuests();

    saveData();
}

// NAVIGATION TAB SYSTEM
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// PACK ROLL SYSTEM
function initRollSystem() {
    document.getElementById('btn-roll-1').addEventListener('click', () => executeRoll(1, 100));
    document.getElementById('btn-roll-10').addEventListener('click', () => executeRoll(10, 950));
    
    document.getElementById('btn-close-reveal').addEventListener('click', () => {
        document.getElementById('modal-roll-reveal').classList.remove('active');
    });

    document.getElementById('btn-close-ultimate').addEventListener('click', () => {
        document.getElementById('modal-ultimate-99').classList.remove('active');
    });
}

function executeRoll(count, cost) {
    if (STATE.coins < cost) {
        alert("Not enough coins!");
        return;
    }

    STATE.coins -= cost;
    addXP(count * 15);

    // Track Quests
    const q1 = STATE.quests.find(q => q.id === 'q1');
    if (q1) q1.current += count;

    const rolledPlayers = [];
    let has99Ultimate = false;

    for (let i = 0; i < count; i++) {
        const player = getRandomPlayerByGacha();
        rolledPlayers.push(player);
        STATE.collectedIds.add(player.id);
        if (player.rating === 99) has99Ultimate = true;
    }

    updateUI();

    if (has99Ultimate && count === 1) {
        showUltimate99Modal(rolledPlayers[0]);
    } else {
        showRollRevealModal(rolledPlayers);
    }
}

function getRandomPlayerByGacha() {
    const rand = Math.random() * 100;
    let targetRarity = 'COMMON';

    if (rand < 0.5) targetRarity = 'ULTIMATE';     // 0.5%
    else if (rand < 3) targetRarity = 'ICON';      // 2.5%
    else if (rand < 8) targetRarity = 'LEGENDARY'; // 5%
    else if (rand < 18) targetRarity = 'LEGEND';   // 10%
    else if (rand < 35) targetRarity = 'EPIC';     // 17%
    else if (rand < 60) targetRarity = 'RARE';     // 25%

    const matching = PLAYER_DATABASE.filter(p => p.rarity === targetRarity);
    if (matching.length > 0) {
        return matching[Math.floor(Math.random() * matching.length)];
    }
    return PLAYER_DATABASE[Math.floor(Math.random() * PLAYER_DATABASE.length)];
}

function showRollRevealModal(players) {
    const modal = document.getElementById('modal-roll-reveal');
    const singleContainer = document.getElementById('reveal-single-container');
    const multiContainer = document.getElementById('reveal-multi-container');

    singleContainer.innerHTML = '';
    multiContainer.innerHTML = '';

    if (players.length === 1) {
        singleContainer.appendChild(createFutCardHTML(players[0]));
    } else {
        players.forEach(p => {
            multiContainer.appendChild(createFutCardHTML(p));
        });
    }

    modal.classList.add('active');
}

function showUltimate99Modal(player) {
    const modal = document.getElementById('modal-ultimate-99');
    const target = document.getElementById('ultimate-card-target');
    target.innerHTML = '';
    target.appendChild(createFutCardHTML(player));
    modal.classList.add('active');
}

// FUT CARD HTML CREATOR
function createFutCardHTML(player, isLocked = false) {
    const card = document.createElement('div');
    card.className = `fut-card rarity-${player.rarity} ${isLocked ? 'locked' : ''}`;

    card.innerHTML = `
        <div class="fut-top">
            <span class="fut-rating">${isLocked ? '??' : player.rating}</span>
            <span class="fut-position">${player.position}</span>
        </div>
        <div class="fut-avatar-box">
            <img class="fut-avatar-img" src="${player.image}" alt="${player.name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/166/166108.png'">
        </div>
        <div class="fut-bottom">
            <div class="fut-name">${isLocked ? 'NOT COLLECTED' : player.name}</div>
            <div class="fut-meta">
                <span>${player.flag} ${player.nation}</span>
            </div>
            <div class="fut-rarity-badge">${player.rarity}</div>
        </div>
    `;
    return card;
}

// COLLECTION GRID & FILTERS
function initFilters() {
    ['search-input', 'rarity-filter', 'position-filter', 'sort-filter'].forEach(id => {
        document.getElementById(id).addEventListener('change', renderCollectionGrid);
        document.getElementById(id).addEventListener('keyup', renderCollectionGrid);
    });
}

function renderCollectionGrid() {
    const grid = document.getElementById('collection-grid');
    grid.innerHTML = '';

    const search = document.getElementById('search-input').value.toLowerCase();
    const rarity = document.getElementById('rarity-filter').value;
    const position = document.getElementById('position-filter').value;
    const sort = document.getElementById('sort-filter').value;

    let filtered = PLAYER_DATABASE.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search) || p.nation.toLowerCase().includes(search);
        const matchesRarity = rarity === 'ALL' || p.rarity === rarity;
        const matchesPos = position === 'ALL' || p.position === position;
        return matchesSearch && matchesRarity && matchesPos;
    });

    if (sort === 'RATING_DESC') filtered.sort((a, b) => b.rating - a.rating);
    if (sort === 'RATING_ASC') filtered.sort((a, b) => a.rating - b.rating);
    if (sort === 'NAME_ASC') filtered.sort((a, b) => a.name.localeCompare(b.name));

    filtered.forEach(p => {
        const isCollected = STATE.collectedIds.has(p.id);
        const cardElem = createFutCardHTML(p, !isCollected);
        grid.appendChild(cardElem);
    });
}

// SQUAD BUILDER SYSTEM
function initSquadBuilder() {
    document.getElementById('btn-auto-squad').addEventListener('click', autoBuildSquad);
    document.getElementById('btn-clear-squad').addEventListener('click', clearSquad);
    document.getElementById('btn-close-squad-select').addEventListener('click', () => {
        document.getElementById('modal-squad-select').classList.remove('active');
    });
}

function renderSquadPitch() {
    const slots = document.querySelectorAll('.squad-slot');
    let totalRating = 0;
    let placedCount = 0;

    slots.forEach(slot => {
        const posKey = slot.getAttribute('data-pos');
        const holder = slot.querySelector('.slot-card-holder');
        holder.innerHTML = '';

        const playerId = STATE.squad[posKey];
        if (playerId) {
            const player = PLAYER_DATABASE.find(p => p.id === playerId);
            if (player) {
                holder.appendChild(createFutCardHTML(player));
                totalRating += player.rating;
                placedCount++;
            }
        }

        slot.onclick = () => openSquadSelector(posKey);
    });

    const squadOvr = placedCount > 0 ? Math.round(totalRating / 11) : 0;
    document.getElementById('squad-ovr').innerText = squadOvr;
}

function openSquadSelector(posKey) {
    const modal = document.getElementById('modal-squad-select');
    const list = document.getElementById('squad-select-list');
    list.innerHTML = '';

    const collectedPlayers = PLAYER_DATABASE.filter(p => STATE.collectedIds.has(p.id));

    collectedPlayers.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;";
        item.innerHTML = `
            <span><strong>${p.name}</strong> (${p.position}) - ${p.rating} OVR</span>
            <button class="btn-gaming" style="min-width: auto; padding: 6px 12px;">SELECT</button>
        `;
        item.onclick = () => {
            STATE.squad[posKey] = p.id;
            modal.classList.remove('active');
            updateUI();
        };
        list.appendChild(item);
    });

    modal.classList.add('active');
}

function autoBuildSquad() {
    const collected = PLAYER_DATABASE.filter(p => STATE.collectedIds.has(p.id))
                                     .sort((a, b) => b.rating - a.rating);

    const positions = Object.keys(STATE.squad);
    positions.forEach((pos, idx) => {
        if (collected[idx]) {
            STATE.squad[pos] = collected[idx].id;
        }
    });

    updateUI();
}

function clearSquad() {
    Object.keys(STATE.squad).forEach(key => STATE.squad[key] = null);
    updateUI();
}

// NATIONS & QUESTS RENDERING
function renderNations() {
    const grid = document.getElementById('nations-grid');
    grid.innerHTML = '';

    const nations = [...new Set(PLAYER_DATABASE.map(p => p.nation))];

    nations.forEach(nat => {
        const totalInNat = PLAYER_DATABASE.filter(p => p.nation === nat).length;
        const collectedInNat = PLAYER_DATABASE.filter(p => p.nation === nat && STATE.collectedIds.has(p.id)).length;
        const percent = Math.round((collectedInNat / totalInNat) * 100);
        const samplePlayer = PLAYER_DATABASE.find(p => p.nation === nat);

        const card = document.createElement('div');
        card.className = `nation-card ${percent === 100 ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="nation-info">
                <span class="flag-icon">${samplePlayer ? samplePlayer.flag : '⚽'}</span>
                <div>
                    <div class="nation-name">${nat}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${collectedInNat} / ${totalInNat} Collected</div>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-fill" style="width: ${percent}%;"></div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderQuests() {
    const container = document.getElementById('quests-list');
    container.innerHTML = '';

    STATE.quests.forEach(q => {
        const card = document.createElement('div');
        card.className = 'quest-card';
        card.innerHTML = `
            <div>
                <div class="quest-title">${q.title}</div>
                <div class="quest-desc">${q.desc} (${Math.min(q.current, q.req)}/${q.req})</div>
            </div>
            <button class="btn-gaming" ${q.claimed || q.current < q.req ? 'disabled style="opacity: 0.5;"' : ''} onclick="claimQuest('${q.id}')">
                ${q.claimed ? 'CLAIMED' : 'CLAIM'}
            </button>
        `;
        container.appendChild(card);
    });
}

function claimQuest(id) {
    const q = STATE.quests.find(quest => quest.id === id);
    if (q && !q.claimed && q.current >= q.req) {
        q.claimed = true;
        STATE.coins += q.rewardCoins;
        addXP(q.rewardXp);
        updateUI();
    }
}

// SHOP HELPERS
function buyCoins(gemCost, coinAmount) {
    if (STATE.gems >= gemCost) {
        STATE.gems -= gemCost;
        STATE.coins += coinAmount;
        updateUI();
    } else {
        alert("Not enough gems!");
    }
}

function claimDailyGems() {
    STATE.gems += 100;
    updateUI();
    alert("Claimed 100 Free Daily Gems!");
}

function addXP(amount) {
    STATE.xp += amount;
    const requiredXp = STATE.level * 100;
    if (STATE.xp >= requiredXp) {
        STATE.xp -= requiredXp;
        STATE.level++;
        STATE.gems += 50; // Level up reward
    }
}

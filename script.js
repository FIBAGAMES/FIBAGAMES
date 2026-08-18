/**
 * FOOTBALL PLAYER COLLECTOR - CORE GAME ENGINE
 */

// GAME CONFIGURATION
const CONFIG = {
    startingCoins: 5000,
    startingGems: 100,
    rollCost: 500,
    roll10Cost: 4500,
    freeCoinsAmount: 500,
    freeCoinsCooldownMs: 60000 // 1 minute cooldown
};

const RARITY_RATES = {
    COMMON: 45,
    RARE: 25,
    EPIC: 15,
    LEGEND: 9,
    ICON: 5.5,
    ULTIMATE: 0.5
};

// SECRET CAPTAIN CARDS DATABASE
const SECRET_CAPTAINS = {
    "Brazil": { name: "Captain Pelé 🌟", rating: 99, position: "ST", nationality: "Brazil", rarity: "ULTIMATE", club: "National Captain", image: "👑" },
    "Argentina": { name: "Captain Messi 🌟", rating: 99, position: "RW", nationality: "Argentina", rarity: "ULTIMATE", club: "National Captain", image: "👑" },
    "France": { name: "Captain Zidane 🌟", rating: 98, position: "CAM", nationality: "France", rarity: "ICON", club: "National Captain", image: "👑" },
    "Spain": { name: "Captain Xavi 🌟", rating: 97, position: "CM", nationality: "Spain", rarity: "ICON", club: "National Captain", image: "👑" },
    "Germany": { name: "Captain Beckenbauer 🌟", rating: 98, position: "CB", nationality: "Germany", rarity: "ICON", club: "National Captain", image: "👑" }
};

// INITIAL GAME STATE
let gameState = {
    coins: CONFIG.startingCoins,
    gems: CONFIG.startingGems,
    ownedPlayers: {}, // { playerId: count }
    squad: {
        LW: null, ST: null, RW: null,
        CM1: null, CM2: null, CM3: null,
        LB: null, CB1: null, CB2: null, RB: null,
        GK: null
    },
    xp: 0,
    level: 1,
    username: "Manager",
    bestSquadRating: 0,
    secretCaptainCards: [],
    recentPulls: [],
    stats: {
        totalRolls: 0,
        ultimatesPulled: 0,
        lastFreeCoins: 0
    },
    quests: [
        { id: 1, text: "Roll 1 Player", target: 1, progress: 0, reward: 250, claimed: false },
        { id: 2, text: "Roll 10 Players", target: 10, progress: 0, reward: 1000, claimed: false },
        { id: 3, text: "Collect 5 Unique Cards", target: 5, progress: 0, reward: 500, claimed: false }
    ],
    dailyClaimed: [false, false, false, false, false, false, false]
};

// APPLICATION CLASS
class FootballCollectorApp {
    constructor() {
        this.selectedPitchSlot = null;
        this.init();
    }

    init() {
        this.loadGame();
        this.bindEvents();
        this.updateUI();
        this.renderAllViews();
    }

    // LOCAL STORAGE MANAGEMENT
    saveGame() {
        try {
            localStorage.setItem('FPC_GAME_STATE', JSON.stringify(gameState));
        } catch (e) {
            console.error("Save error", e);
        }
    }

    loadGame() {
        const saved = localStorage.getItem('FPC_GAME_STATE');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                gameState = { ...gameState, ...parsed };
            } catch (e) {
                console.error("Load error", e);
            }
        }
    }

    resetGame() {
        if (confirm("Are you sure you want to reset ALL progress? This cannot be undone!")) {
            localStorage.removeItem('FPC_GAME_STATE');
            location.reload();
        }
    }

    // NAVIGATION & VIEW SWITCHING
    switchView(targetViewId) {
        document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
        document.querySelectorAll('.nav-btn, .mobile-btn').forEach(btn => btn.classList.remove('active'));

        const activePanel = document.getElementById(targetViewId);
        if (activePanel) activePanel.classList.add('active');

        document.querySelectorAll(`[data-target="${targetViewId}"]`).forEach(btn => btn.classList.add('active'));

        // Refresh views dynamically on switch
        if (targetViewId === 'collection-view') this.renderCollection();
        if (targetViewId === 'squad-view') this.renderSquadPitch();
        if (targetViewId === 'national-view') this.renderNationalTeams();
        if (targetViewId === 'quests-view') this.renderQuests();
        if (targetViewId === 'daily-view') this.renderDailyCalendar();
        if (targetViewId === 'leaderboard-view') this.renderLeaderboard();
        if (targetViewId === 'profile-view') this.renderProfile();
    }

    bindEvents() {
        // Navigation Buttons
        document.querySelectorAll('[data-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.switchView(target);
            });
        });

        // Free Coins Button
        document.getElementById('free-coins-btn').addEventListener('click', () => this.claimFreeCoins());

        // Gacha Roll Buttons
        document.getElementById('roll-1-btn').addEventListener('click', () => this.performRoll(1));
        document.getElementById('roll-10-btn').addEventListener('click', () => this.performRoll(10));

        // Collection Filter Listeners
        ['filter-search', 'filter-position', 'filter-rarity', 'filter-status'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.renderCollection());
        });

        // Squad Actions
        document.getElementById('auto-build-btn').addEventListener('click', () => this.autoBuildBestXI());
        document.getElementById('clear-squad-btn').addEventListener('click', () => this.clearSquad());

        // Squad Slot Clicks
        document.querySelectorAll('.squad-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const pos = e.currentTarget.getAttribute('data-pos');
                this.openSquadSelectModal(pos);
            });
        });

        // Profile Actions
        document.getElementById('save-username-btn').addEventListener('click', () => {
            const input = document.getElementById('profile-username-input').value.trim();
            if (input) {
                gameState.username = input;
                this.saveGame();
                this.updateUI();
                this.showToast("Username updated!");
            }
        });

        document.getElementById('reset-game-btn').addEventListener('click', () => this.resetGame());
    }

    // CORE CURRENCY & XP MECHANICS
    addCurrencies(coins, gems) {
        gameState.coins += coins;
        gameState.gems += gems;
        this.saveGame();
        this.updateUI();
    }

    addXP(amount) {
        gameState.xp += amount;
        const requiredXp = gameState.level * 100;
        if (gameState.xp >= requiredXp) {
            gameState.xp -= requiredXp;
            gameState.level++;
            this.showToast(`🎉 LEVEL UP! You reached Level ${gameState.level}!`);
            this.addCurrencies(1000, 20);
        }
        this.saveGame();
        this.updateUI();
    }

    claimFreeCoins() {
        const now = Date.now();
        if (now - gameState.stats.lastFreeCoins < CONFIG.freeCoinsCooldownMs) {
            const remaining = Math.ceil((CONFIG.freeCoinsCooldownMs - (now - gameState.stats.lastFreeCoins)) / 1000);
            this.showToast(`Wait ${remaining}s for Free Coins!`);
            return;
        }

        gameState.stats.lastFreeCoins = now;
        this.addCurrencies(CONFIG.freeCoinsAmount, 0);
        this.showToast(`⚡ Claimed +${CONFIG.freeCoinsAmount} Free Coins!`);
    }

    // GACHA ROLL SYSTEM
    getRandomRarity() {
        const rand = Math.random() * 100;
        let cumulative = 0;

        for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
            cumulative += rate;
            if (rand <= cumulative) return rarity;
        }
        return "COMMON";
    }

    performRoll(count) {
        const cost = count === 1 ? CONFIG.rollCost : CONFIG.roll10Cost;

        if (gameState.coins < cost) {
            this.showToast("🪙 Not enough Coins!");
            return;
        }

        gameState.coins -= cost;
        gameState.stats.totalRolls += count;

        const pulledCards = [];

        for (let i = 0; i < count; i++) {
            const targetRarity = this.getRandomRarity();
            const eligiblePlayers = PLAYERS_DATABASE.filter(p => p.rarity === targetRarity);
            
            // Fallback to all if rarity pool empty
            const pool = eligiblePlayers.length > 0 ? eligiblePlayers : PLAYERS_DATABASE;
            const pulled = pool[Math.floor(Math.random() * pool.length)];

            // Update Owned State
            gameState.ownedPlayers[pulled.id] = (gameState.ownedPlayers[pulled.id] || 0) + 1;
            pulledCards.push(pulled);

            if (pulled.rarity === 'ULTIMATE') gameState.stats.ultimatesPulled++;

            // Quest progress tracking
            this.updateQuestProgress(1, 1);
            this.updateQuestProgress(2, 1);
        }

        // Quests unique card check
        this.updateQuestProgress(3, Object.keys(gameState.ownedPlayers).length, true);

        // Track recent pulls
        gameState.recentPulls = [...pulledCards, ...gameState.recentPulls].slice(0, 10);

        this.addXP(count * 15);
        this.saveGame();
        this.updateUI();

        // Reveal Animation
        if (count === 1) {
            this.showRevealModal(pulledCards[0]);
        } else {
            this.renderRollResults(pulledCards);
        }

        this.checkNationalTeamsCompletion();
    }

    // CARDS RENDER UTILITY
    createCardDOM(player, ownedCount = 1, isLocked = false) {
        const card = document.createElement('div');
        card.className = `player-card ${player.rarity} ${isLocked ? 'locked' : ''}`;

        card.innerHTML = `
            ${ownedCount > 1 ? `<div class="card-dup-badge">x${ownedCount}</div>` : ''}
            <div class="card-top">
                <div class="card-rating-pos">
                    <span class="card-rating">${player.rating}</span>
                    <span class="card-position">${player.position}</span>
                </div>
                <div class="card-flag">${player.image}</div>
            </div>
            <div class="card-avatar">⚽</div>
            <div class="card-bottom">
                <div class="card-name">${player.name}</div>
                <div class="card-meta">${player.year} | ${player.nationality}</div>
            </div>
        `;
        return card;
    }

    showRevealModal(player) {
        const modal = document.getElementById('reveal-modal');
        const stage = document.getElementById('reveal-card-container');
        const banner = document.getElementById('reveal-title-banner');

        stage.innerHTML = '';
        stage.appendChild(this.createCardDOM(player));

        if (player.rating === 99) {
            banner.innerHTML = "🔥 99 RATED ULTIMATE PULL! 🔥";
        } else {
            banner.innerHTML = "NEW PLAYER UNLOCKED";
        }

        modal.classList.remove('hidden');
    }

    closeRevealModal() {
        document.getElementById('reveal-modal').classList.add('hidden');
    }

    renderRollResults(cards) {
        const container = document.getElementById('roll-results-area');
        const grid = document.getElementById('roll-cards-grid');

        grid.innerHTML = '';
        cards.forEach(cardData => {
            grid.appendChild(this.createCardDOM(cardData));
        });

        container.classList.remove('hidden');
    }

    // COLLECTION VIEW ENGINE
    renderCollection() {
        const grid = document.getElementById('collection-cards-grid');
        grid.innerHTML = '';

        const searchQuery = document.getElementById('filter-search').value.toLowerCase();
        const posFilter = document.getElementById('filter-position').value;
        const rarityFilter = document.getElementById('filter-rarity').value;
        const statusFilter = document.getElementById('filter-status').value;

        let totalOwnedCount = 0;

        PLAYERS_DATABASE.forEach(player => {
            const ownedQty = gameState.ownedPlayers[player.id] || 0;
            const isOwned = ownedQty > 0;

            if (isOwned) totalOwnedCount++;

            // Filtering Logic
            if (searchQuery && !player.name.toLowerCase().includes(searchQuery) && !player.club.toLowerCase().includes(searchQuery)) return;
            if (posFilter !== 'ALL' && player.position !== posFilter) return;
            if (rarityFilter !== 'ALL' && player.rarity !== rarityFilter) return;
            if (statusFilter === 'OWNED' && !isOwned) return;
            if (statusFilter === 'LOCKED' && isOwned) return;
            if (statusFilter === '90PLUS' && player.rating < 90) return;

            grid.appendChild(this.createCardDOM(player, ownedQty, !isOwned));
        });

        const pct = Math.round((totalOwnedCount / PLAYERS_DATABASE.length) * 100);
        document.getElementById('collection-stats-counter').innerText = `Collected: ${totalOwnedCount} / ${PLAYERS_DATABASE.length} (${pct}%)`;
    }

    // SQUAD BUILDING ENGINE (4-3-3 FORMATION)
    renderSquadPitch() {
        let totalRating = 0;
        let filledCount = 0;

        for (const [slotPos, player] of Object.entries(gameState.squad)) {
            const slotEl = document.querySelector(`.squad-slot[data-pos="${slotPos}"]`);
            if (!slotEl) continue;

            slotEl.innerHTML = '';

            if (player) {
                slotEl.appendChild(this.createCardDOM(player));
                totalRating += player.rating;
                filledCount++;
            } else {
                const labelPos = slotPos.replace(/[0-9]/g, '');
                slotEl.innerHTML = `<span class="slot-pos-label">${labelPos}</span>`;
            }
        }

        const avgRating = filledCount > 0 ? Math.round(totalRating / 11) : 0;
        document.getElementById('squad-rating-display').innerText = `${avgRating} OVR`;

        if (avgRating > gameState.bestSquadRating) {
            gameState.bestSquadRating = avgRating;
            this.saveGame();
        }
    }

    openSquadSelectModal(slotPos) {
        this.selectedPitchSlot = slotPos;
        const modal = document.getElementById('squad-select-modal');
        const grid = document.getElementById('squad-modal-cards-grid');

        document.getElementById('squad-modal-title').innerText = `Select Player for ${slotPos}`;
        grid.innerHTML = '';

        const targetPos = slotPos.replace(/[0-9]/g, '');

        // Get owned players
        const available = PLAYERS_DATABASE.filter(p => (gameState.ownedPlayers[p.id] || 0) > 0);

        if (available.length === 0) {
            grid.innerHTML = '<p class="empty-msg">No owned players available. Roll cards first!</p>';
        } else {
            available.forEach(player => {
                const card = this.createCardDOM(player, gameState.ownedPlayers[player.id]);
                card.onclick = () => {
                    gameState.squad[slotPos] = player;
                    this.saveGame();
                    this.renderSquadPitch();
                    this.closeSquadModal();
                };
                grid.appendChild(card);
            });
        }

        modal.classList.remove('hidden');
    }

    closeSquadModal() {
        document.getElementById('squad-select-modal').classList.add('hidden');
    }

    autoBuildBestXI() {
        const owned = PLAYERS_DATABASE.filter(p => (gameState.ownedPlayers[p.id] || 0) > 0);

        if (owned.length === 0) {
            this.showToast("No players in collection!");
            return;
        }

        // Sort descending by rating
        const sorted = [...owned].sort((a, b) => b.rating - a.rating);

        const slots = ['ST', 'LW', 'RW', 'CM1', 'CM2', 'CM3', 'LB', 'CB1', 'CB2', 'RB', 'GK'];
        const usedIds = new Set();

        slots.forEach(slot => {
            const requiredPos = slot.replace(/[0-9]/g, '');
            // Match ideal position or fallback best available
            const match = sorted.find(p => p.position === requiredPos && !usedIds.has(p.id)) || sorted.find(p => !usedIds.has(p.id));

            if (match) {
                gameState.squad[slot] = match;
                usedIds.add(match.id);
            }
        });

        this.saveGame();
        this.renderSquadPitch();
        this.showToast("⚡ Best XI Auto Built!");
    }

    clearSquad() {
        for (let pos in gameState.squad) gameState.squad[pos] = null;
        this.saveGame();
        this.renderSquadPitch();
    }

    // NATIONAL TEAMS & SECRET CAPTAINS
    renderNationalTeams() {
        const grid = document.getElementById('national-teams-grid');
        grid.innerHTML = '';

        const nations = ["Brazil", "Argentina", "France", "Spain", "Germany", "Italy", "Portugal", "Netherlands", "England", "Uruguay"];

        nations.forEach(nation => {
            const totalNationPlayers = PLAYERS_DATABASE.filter(p => p.nationality === nation);
            const ownedNationPlayers = totalNationPlayers.filter(p => (gameState.ownedPlayers[p.id] || 0) > 0);

            const pct = totalNationPlayers.length > 0 ? Math.round((ownedNationPlayers.length / totalNationPlayers.length) * 100) : 0;
            const isComplete = pct === 100;

            const card = document.createElement('div');
            card.className = 'national-card';
            card.innerHTML = `
                <div class="national-header">
                    <span class="national-flag">${totalNationPlayers[0]?.image || '🏳️'}</span>
                    <div class="national-title">
                        <h3>${nation}</h3>
                        <p>${ownedNationPlayers.length} / ${totalNationPlayers.length} Players</p>
                    </div>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${pct}%"></div>
                </div>
                ${isComplete ? '<span class="text-ultimate">🏆 100% COMPLETE - CAPTAIN UNLOCKED</span>' : `<span>${pct}% Completed</span>`}
            `;

            grid.appendChild(card);
        });
    }

    checkNationalTeamsCompletion() {
        const nations = ["Brazil", "Argentina", "France", "Spain", "Germany"];

        nations.forEach(nation => {
            const total = PLAYERS_DATABASE.filter(p => p.nationality === nation);
            const owned = total.filter(p => (gameState.ownedPlayers[p.id] || 0) > 0);

            if (total.length > 0 && owned.length === total.length) {
                const captain = SECRET_CAPTAINS[nation];
                if (captain && !gameState.secretCaptainCards.some(c => c.nationality === nation)) {
                    gameState.secretCaptainCards.push(captain);
                    this.showToast(`👑 NATIONAL TEAM COMPLETE! Secret Captain ${captain.name} Unlocked!`);
                    this.saveGame();
                }
            }
        });
    }

    // QUESTS SYSTEM
    updateQuestProgress(questId, amount, setAbsolute = false) {
        const quest = gameState.quests.find(q => q.id === questId);
        if (quest && !quest.claimed) {
            if (setAbsolute) quest.progress = amount;
            else quest.progress += amount;

            if (quest.progress > quest.target) quest.progress = quest.target;
            this.saveGame();
        }
    }

    renderQuests() {
        const container = document.getElementById('quests-list-container');
        container.innerHTML = '';

        gameState.quests.forEach(quest => {
            const isReady = quest.progress >= quest.target;

            const div = document.createElement('div');
            div.className = 'quest-item';
            div.innerHTML = `
                <div class="quest-info">
                    <h4>${quest.text}</h4>
                    <p>Progress: ${quest.progress} / ${quest.target}</p>
                    <div class="quest-reward">Reward: 🪙 ${quest.reward} Coins</div>
                </div>
                <button class="btn ${quest.claimed ? 'btn-secondary' : 'btn-primary'}" ${(!isReady || quest.claimed) ? 'disabled' : ''}>
                    ${quest.claimed ? 'Claimed' : 'Claim Reward'}
                </button>
            `;

            const btn = div.querySelector('button');
            if (isReady && !quest.claimed) {
                btn.onclick = () => {
                    quest.claimed = true;
                    this.addCurrencies(quest.reward, 0);
                    this.addXP(50);
                    this.renderQuests();
                };
            }

            container.appendChild(div);
        });
    }

    // DAILY LOGIN SYSTEM
    renderDailyCalendar() {
        const grid = document.getElementById('daily-calendar');
        grid.innerHTML = '';

        const rewards = [
            { day: 1, reward: "🪙 1,000 Coins" },
            { day: 2, reward: "🪙 2,000 Coins" },
            { day: 3, reward: "💎 50 Gems" },
            { day: 4, reward: "🪙 5,000 Coins" },
            { day: 5, reward: "💎 100 Gems" },
            { day: 6, reward: "🪙 10,000 Coins" },
            { day: 7, reward: "🔥 ULTIMATE PACK" }
        ];

        rewards.forEach((r, idx) => {
            const claimed = gameState.dailyClaimed[idx];
            const div = document.createElement('div');
            div.className = `daily-day-card ${claimed ? 'claimed' : ''}`;
            div.innerHTML = `
                <h4>Day ${r.day}</h4>
                <p>${r.reward}</p>
                <button class="btn btn-sm ${claimed ? 'btn-secondary' : 'btn-accent'}" ${claimed ? 'disabled' : ''}>
                    ${claimed ? 'Claimed' : 'Claim'}
                </button>
            `;

            const btn = div.querySelector('button');
            if (!claimed) {
                btn.onclick = () => {
                    gameState.dailyClaimed[idx] = true;
                    if (r.reward.includes('Coins')) this.addCurrencies(parseInt(r.reward.replace(/[^0-9]/g, '')), 0);
                    if (r.reward.includes('Gems')) this.addCurrencies(0, parseInt(r.reward.replace(/[^0-9]/g, '')));
                    if (idx === 6) this.performRoll(1);

                    this.saveGame();
                    this.renderDailyCalendar();
                    this.showToast("Daily Reward Claimed!");
                };
            }

            grid.appendChild(div);
        });
    }

    // SHOP SYSTEM
    buyShopItem(type) {
        if (type === 'coins_small' && gameState.gems >= 20) {
            this.addCurrencies(2500, -20);
            this.showToast("Purchased 2,500 Coins!");
        } else if (type === 'coins_large' && gameState.gems >= 75) {
            this.addCurrencies(10000, -75);
            this.showToast("Purchased 10,000 Coins!");
        } else if (type === 'gems_pack' && gameState.coins >= 10000) {
            this.addCurrencies(-10000, 100);
            this.showToast("Purchased 100 Gems!");
        } else if (type === 'special_roll' && gameState.gems >= 50) {
            gameState.gems -= 50;
            const epics = PLAYERS_DATABASE.filter(p => p.rating >= 85);
            const pulled = epics[Math.floor(Math.random() * epics.length)];
            gameState.ownedPlayers[pulled.id] = (gameState.ownedPlayers[pulled.id] || 0) + 1;
            this.saveGame();
            this.updateUI();
            this.showRevealModal(pulled);
        } else {
            this.showToast("Insufficient resources!");
        }
    }

    // LEADERBOARD ENGINE
    renderLeaderboard() {
        const body = document.getElementById('leaderboard-body');
        body.innerHTML = '';

        const bots = [
            { name: "LegendHunter", rating: 99 },
            { name: "FootballKing", rating: 98 },
            { name: "GOATCollector", rating: 97 },
            { name: "UltimateXI", rating: 96 },
            { name: "PitchMaster", rating: 94 }
        ];

        const userScore = { name: `${gameState.username} (You)`, rating: gameState.bestSquadRating, isUser: true };
        const list = [...bots, userScore].sort((a, b) => b.rating - a.rating);

        list.forEach((entry, index) => {
            const tr = document.createElement('tr');
            if (entry.isUser) {
                tr.className = 'user-row';
                document.getElementById('home-global-rank').innerText = `#${index + 1}`;
            }

            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td>${entry.name}</td>
                <td><strong>${entry.rating} OVR</strong></td>
            `;
            body.appendChild(tr);
        });
    }

    // PROFILE VIEW
    renderProfile() {
        document.getElementById('profile-username-input').value = gameState.username;
        document.getElementById('profile-level-tag').innerText = `Level ${gameState.level} Manager`;

        document.getElementById('p-stat-coins').innerText = gameState.coins.toLocaleString();
        document.getElementById('p-stat-gems').innerText = gameState.gems.toLocaleString();

        const ownedCount = Object.keys(gameState.ownedPlayers).length;
        document.getElementById('p-stat-collected').innerText = `${ownedCount} / ${PLAYERS_DATABASE.length}`;
        document.getElementById('p-stat-squad').innerText = `${gameState.bestSquadRating} OVR`;
        document.getElementById('p-stat-rolls').innerText = gameState.stats.totalRolls;
        document.getElementById('p-stat-ultimates').innerText = gameState.stats.ultimatesPulled;
        document.getElementById('p-stat-nations').innerText = gameState.secretCaptainCards.length;
        document.getElementById('p-stat-captains').innerText = gameState.secretCaptainCards.length;

        // Render unlocked captains
        const grid = document.getElementById('profile-captains-grid');
        grid.innerHTML = '';

        if (gameState.secretCaptainCards.length === 0) {
            grid.innerHTML = '<p class="empty-msg">No Captain cards unlocked yet. Complete a National Team!</p>';
        } else {
            gameState.secretCaptainCards.forEach(captain => {
                grid.appendChild(this.createCardDOM(captain));
            });
        }
    }

    // UI REFRESH
    updateUI() {
        // Headers & Currency
        document.getElementById('coins-display').innerText = gameState.coins.toLocaleString();
        document.getElementById('gems-display').innerText = gameState.gems.toLocaleString();

        document.getElementById('header-level').innerText = `LVL ${gameState.level}`;
        const reqXp = gameState.level * 100;
        const xpPct = Math.min(100, Math.round((gameState.xp / reqXp) * 100));
        document.getElementById('header-xp-fill').style.width = `${xpPct}%`;
        document.getElementById('header-xp-text').innerText = `${gameState.xp}/${reqXp} XP`;

        // Home View Summaries
        document.getElementById('home-username').innerText = gameState.username;
        document.getElementById('home-squad-rating').innerText = `${gameState.bestSquadRating} OVR`;

        const filledCount = Object.values(gameState.squad).filter(x => x !== null).length;
        document.getElementById('home-squad-count').innerText = `${filledCount} / 11 Players Positioned`;

        const ownedCount = Object.keys(gameState.ownedPlayers).length;
        document.getElementById('home-collection-count').innerText = `${ownedCount} / ${PLAYERS_DATABASE.length}`;

        const collPct = Math.round((ownedCount / PLAYERS_DATABASE.length) * 100);
        document.getElementById('home-collection-fill').style.width = `${collPct}%`;

        // Home recent pulls
        const recentRow = document.getElementById('home-recent-cards');
        recentRow.innerHTML = '';
        if (gameState.recentPulls.length === 0) {
            recentRow.innerHTML = '<p class="empty-msg">No players pulled yet. Visit the Roll section!</p>';
        } else {
            gameState.recentPulls.slice(0, 5).forEach(player => {
                recentRow.appendChild(this.createCardDOM(player));
            });
        }
    }

    renderAllViews() {
        this.renderCollection();
        this.renderSquadPitch();
        this.renderNationalTeams();
        this.renderQuests();
        this.renderDailyCalendar();
        this.renderLeaderboard();
        this.renderProfile();
    }

    // TOAST SYSTEM
    showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;

        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// INITIALIZE GAME ENGINE
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new FootballCollectorApp();
});

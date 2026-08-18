/**
 * ULTIMATE FOOTBALL WEB - PLAYER DATABASE (100 PLAYERS)
 * Độ hiếm: COMMON (55%), RARE (30%), EPIC (10%), LEGEND (4%), ICON (1%)
 */

const PLAYERS_DATABASE = [
  // --- ICON (1%) ---
  { id: 1, name: "Leo Santoro", country: "🇮🇹", position: "RW", overall: 94, pace: 96, shooting: 91, passing: 90, dribbling: 97, defending: 40, physical: 78, rarity: "ICON", price: 5000000, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80" },

  // --- LEGEND (4%) ---
  { id: 2, name: "Alex Moretti", country: "🇮🇹", position: "ST", overall: 91, pace: 92, shooting: 94, passing: 82, dribbling: 89, defending: 35, physical: 85, rarity: "LEGEND", price: 2500000, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
  { id: 3, name: "Daniel Kovac", country: "🇭🇷", position: "CM", overall: 90, pace: 84, shooting: 85, passing: 93, dribbling: 91, defending: 78, physical: 80, rarity: "LEGEND", price: 2200000, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },
  { id: 4, name: "Marco Silva", country: "🇧🇷", position: "CAM", overall: 89, pace: 88, shooting: 87, passing: 91, dribbling: 93, defending: 45, physical: 72, rarity: "LEGEND", price: 1900000, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80" },
  { id: 5, name: "Adrian Costa", country: "🇪🇸", position: "CB", overall: 88, pace: 80, shooting: 45, passing: 75, dribbling: 72, defending: 92, physical: 90, rarity: "LEGEND", price: 1700000, image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80" },

  // --- EPIC (10%) ---
  { id: 6, name: "Mateo Rossi", country: "🇮🇹", position: "LW", overall: 87, pace: 91, shooting: 85, passing: 82, dribbling: 88, defending: 38, physical: 74, rarity: "EPIC", price: 900000, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80" },
  { id: 7, name: "Lucas Vance", country: "🇬🇧", position: "CDM", overall: 86, pace: 78, shooting: 70, passing: 84, dribbling: 80, defending: 87, physical: 88, rarity: "EPIC", price: 800000, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80" },
  { id: 8, name: "Gabriel Santos", country: "🇧🇷", position: "ST", overall: 86, pace: 89, shooting: 88, passing: 76, dribbling: 85, defending: 32, physical: 81, rarity: "EPIC", price: 820000, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80" },
  { id: 9, name: "Hugo Blanc", country: "🇫🇷", position: "GK", overall: 85, pace: 50, shooting: 20, passing: 65, dribbling: 40, defending: 88, physical: 82, rarity: "EPIC", price: 750000, image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80" },
  { id: 10, name: "Lars Eriksson", country: "🇸🇪", position: "RB", overall: 85, pace: 88, shooting: 68, passing: 80, dribbling: 81, defending: 82, physical: 84, rarity: "EPIC", price: 720000, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80" },
  { id: 11, name: "Kenji Sato", country: "🇯🇵", position: "RM", overall: 84, pace: 90, shooting: 79, passing: 83, dribbling: 86, defending: 55, physical: 68, rarity: "EPIC", price: 680000, image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80" },
  { id: 12, name: "Carlos Santana", country: "🇦🇷", position: "CAM", overall: 84, pace: 82, shooting: 84, passing: 86, dribbling: 87, defending: 42, physical: 70, rarity: "EPIC", price: 650000, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80" },
  { id: 13, name: "Ivan Petrov", country: "🇷🇺", position: "CB", overall: 83, pace: 74, shooting: 40, passing: 68, dribbling: 65, defending: 85, physical: 89, rarity: "EPIC", price: 600000, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
  { id: 14, name: "Pablo Ramos", country: "🇲🇽", position: "LB", overall: 82, pace: 86, shooting: 65, passing: 78, dribbling: 80, defending: 80, physical: 78, rarity: "EPIC", price: 550000, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },

  // --- RARE (30%) ---
  { id: 15, name: "David O'Connor", country: "🇮🇪", position: "CM", overall: 81, pace: 76, shooting: 75, passing: 82, dribbling: 80, defending: 76, physical: 80, rarity: "RARE", price: 350000, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80" },
  { id: 16, name: "Milan Horvat", country: "🇸🇮", position: "ST", overall: 80, pace: 82, shooting: 83, passing: 70, dribbling: 78, defending: 30, physical: 82, rarity: "RARE", price: 300000, image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80" },
  { id: 17, name: "Jae-Jin Park", country: "🇰🇷", position: "LM", overall: 80, pace: 87, shooting: 74, passing: 78, dribbling: 82, defending: 50, physical: 68, rarity: "RARE", price: 310000, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80" },
  { id: 18, name: "Tariq Al-Mansoor", country: "🇸🇦", position: "RW", overall: 79, pace: 88, shooting: 76, passing: 74, dribbling: 81, defending: 35, physical: 65, rarity: "RARE", price: 280000, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80" },
  { id: 19, name: "Kwesi Mensah", country: "🇬🇭", position: "CDM", overall: 79, pace: 78, shooting: 62, passing: 75, dribbling: 74, defending: 81, physical: 85, rarity: "RARE", price: 270000, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80" },
  { id: 20, name: "Fernando Gomez", country: "🇨🇱", position: "CB", overall: 78, pace: 72, shooting: 38, passing: 65, dribbling: 62, defending: 81, physical: 83, rarity: "RARE", price: 240000, image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80" },
  { id: 21, name: "Stefan Popa", country: "🇷🇴", position: "GK", overall: 78, pace: 45, shooting: 18, passing: 60, dribbling: 35, defending: 80, physical: 78, rarity: "RARE", price: 230000, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80" },
  { id: 22, name: "Andrej Novak", country: "🇸🇰", position: "CAM", overall: 77, pace: 76, shooting: 75, passing: 80, dribbling: 79, defending: 40, physical: 68, rarity: "RARE", price: 210000, image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80" },
  { id: 23, name: "Oscar Lindqvist", country: "🇫🇮", position: "LB", overall: 77, pace: 82, shooting: 60, passing: 72, dribbling: 74, defending: 76, physical: 75, rarity: "RARE", price: 200000, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80" },
  { id: 24, name: "Liam Gallagher", country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", position: "ST", overall: 76, pace: 80, shooting: 78, passing: 65, dribbling: 73, defending: 32, physical: 80, rarity: "RARE", price: 190000, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
  { id: 25, name: "Noah Bennett", country: "🇦🇺", position: "RB", overall: 76, pace: 83, shooting: 58, passing: 70, dribbling: 72, defending: 75, physical: 76, rarity: "RARE", price: 180000, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },
  { id: 26, name: "Ethan Hawke", country: "🇨🇦", position: "LW", overall: 75, pace: 86, shooting: 72, passing: 70, dribbling: 78, defending: 35, physical: 66, rarity: "RARE", price: 170000, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80" }
];

// Hàm bổ sung thêm tự động để đạt đủ 100 Cầu thủ với phân bổ Tỷ lệ chuẩn
(function generateFull100Players() {
  const positions = ["ST", "LW", "RW", "CAM", "CM", "CDM", "LM", "RM", "CB", "LB", "RB", "GK"];
  const countries = ["🇻🇳", "🇧🇷", "🇦🇷", "🇫🇷", "🇪🇸", "🇩🇪", "🇮🇹", "🇵🇹", "🇳🇱", "🇪🇳", "🇯🇵", "🇰🇷"];
  const firstNames = ["Minh", "Quang", "Anh", "Bruno", "Diego", "Jean", "Klaus", "Sandro", "Pedro", "Robin", "Ken", "Dong"];
  const lastNames = ["Nguyen", "Tran", "Silva", "Gomez", "Dupont", "Muller", "Conti", "Ferreira", "Van Dijk", "Tanaka", "Kim"];

  let currentId = PLAYERS_DATABASE.length + 1;

  while (currentId <= 100) {
    let rarity = "COMMON";
    let ovr = Math.floor(Math.random() * 10) + 64; // 64 - 74
    let price = ovr * 1500;

    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];

    PLAYERS_DATABASE.push({
      id: currentId,
      name: name,
      country: country,
      position: pos,
      overall: ovr,
      pace: Math.floor(Math.random() * 30) + 60,
      shooting: Math.floor(Math.random() * 30) + 55,
      passing: Math.floor(Math.random() * 30) + 55,
      dribbling: Math.floor(Math.random() * 30) + 60,
      defending: Math.floor(Math.random() * 30) + 50,
      physical: Math.floor(Math.random() * 30) + 55,
      rarity: rarity,
      price: price,
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80"
    });

    currentId++;
  }
})();

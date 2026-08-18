/* ==========================================================================
   CƠ SỞ DỮ LIỆU CẦU THỦ (PLAYERS DATABASE) - 100+ CẦU THỦ
   ========================================================================== */

const PLAYERS_DATABASE = [
  // --- HUYỀN THOẠI (ICON) ---
  { id: "p1", name: "Pelé", ovr: 98, position: "ST", rarity: "ICON", club: "Brazil Legend", stats: { pace: 95, shooting: 97, passing: 93, dribbling: 96, defending: 55, physical: 82 } },
  { id: "p2", name: "Diego Maradona", ovr: 97, position: "CAM", rarity: "ICON", club: "Argentina Legend", stats: { pace: 92, shooting: 93, passing: 95, dribbling: 98, defending: 45, physical: 78 } },
  { id: "p3", name: "Zinedine Zidane", ovr: 96, position: "CAM", rarity: "ICON", club: "France Legend", stats: { pace: 85, shooting: 90, passing: 96, dribbling: 95, defending: 75, physical: 85 } },
  { id: "p4", name: "Ronaldo Nazário", ovr: 96, position: "ST", rarity: "ICON", club: "Brazil Legend", stats: { pace: 97, shooting: 95, passing: 81, dribbling: 95, defending: 45, physical: 80 } },
  { id: "p5", name: "Paolo Maldini", ovr: 95, position: "CB", rarity: "ICON", club: "AC Milan Legend", stats: { pace: 86, shooting: 56, passing: 75, dribbling: 70, defending: 97, physical: 88 } },
  { id: "p6", name: "Lev Yashin", ovr: 94, position: "GK", rarity: "ICON", club: "Russia Legend", stats: { pace: 93, shooting: 90, passing: 88, dribbling: 94, defending: 95, physical: 90 } },
  { id: "p7", name: "Ronaldinho", ovr: 94, position: "LW", rarity: "ICON", club: "Brazil Legend", stats: { pace: 91, shooting: 89, passing: 91, dribbling: 97, defending: 40, physical: 79 } },
  { id: "p8", name: "Johan Cruyff", ovr: 95, position: "CF", rarity: "ICON", club: "Netherlands Legend", stats: { pace: 91, shooting: 92, passing: 91, dribbling: 94, defending: 42, physical: 73 } },

  // --- CẦU THỦ ĐẶC BIỆT / SIÊU SAO (SPECIAL / GOLD HIGH) ---
  { id: "p9", name: "Lionel Messi", ovr: 93, position: "RW", rarity: "SPECIAL", club: "Inter Miami", stats: { pace: 85, shooting: 92, passing: 94, dribbling: 95, defending: 35, physical: 65 } },
  { id: "p10", name: "Cristiano Ronaldo", ovr: 91, position: "ST", rarity: "SPECIAL", club: "Al Nassr", stats: { pace: 82, shooting: 93, passing: 78, dribbling: 84, defending: 34, physical: 77 } },
  { id: "p11", name: "Kylian Mbappé", ovr: 92, position: "ST", rarity: "SPECIAL", club: "Real Madrid", stats: { pace: 97, shooting: 90, passing: 80, dribbling: 92, defending: 36, physical: 78 } },
  { id: "p12", name: "Erling Haaland", ovr: 91, position: "ST", rarity: "SPECIAL", club: "Manchester City", stats: { pace: 89, shooting: 93, passing: 66, dribbling: 80, defending: 45, physical: 88 } },
  { id: "p13", name: "Kevin De Bruyne", ovr: 91, position: "CM", rarity: "SPECIAL", club: "Manchester City", stats: { pace: 72, shooting: 88, passing: 94, dribbling: 87, defending: 65, physical: 78 } },
  { id: "p14", name: "Jude Bellingham", ovr: 90, position: "CAM", rarity: "SPECIAL", club: "Real Madrid", stats: { pace: 82, shooting: 86, passing: 85, dribbling: 88, defending: 78, physical: 85 } },
  { id: "p15", name: "Virgil van Dijk", ovr: 89, position: "CB", rarity: "SPECIAL", club: "Liverpool", stats: { pace: 78, shooting: 60, passing: 71, dribbling: 72, defending: 91, physical: 89 } },
  { id: "p16", name: "Thibaut Courtois", ovr: 89, position: "GK", rarity: "SPECIAL", club: "Real Madrid", stats: { pace: 85, shooting: 89, passing: 76, dribbling: 90, defending: 88, physical: 88 } },
  { id: "p17", name: "Mohamed Salah", ovr: 89, position: "RW", rarity: "GOLD", club: "Liverpool", stats: { pace: 89, shooting: 87, passing: 81, dribbling: 88, defending: 45, physical: 75 } },
  { id: "p18", name: "Vinícius Júnior", ovr: 89, position: "LW", rarity: "GOLD", club: "Real Madrid", stats: { pace: 95, shooting: 82, passing: 78, dribbling: 90, defending: 29, physical: 68 } },

  // --- CẦU THỦ THƯỜNG / KHỞI ĐẦU (GOLD / BRONZE) ---
  { id: "p19", name: "Harry Kane", ovr: 90, position: "ST", rarity: "GOLD", club: "Bayern Munich", stats: { pace: 69, shooting: 93, passing: 84, dribbling: 83, defending: 49, physical: 82 } },
  { id: "p20", name: "Rodri", ovr: 89, position: "CDM", rarity: "GOLD", club: "Manchester City", stats: { pace: 58, shooting: 73, passing: 80, dribbling: 79, defending: 87, physical: 84 } },
  { id: "p21", name: "Bruno Fernandes", ovr: 88, position: "CAM", rarity: "GOLD", club: "Manchester United", stats: { pace: 75, shooting: 86, passing: 88, dribbling: 83, defending: 68, physical: 77 } },
  { id: "p22", name: "Ruben Dias", ovr: 88, position: "CB", rarity: "GOLD", club: "Manchester City", stats: { pace: 62, shooting: 39, passing: 66, dribbling: 68, defending: 89, physical: 87 } },
  { id: "p23", name: "Trent Alexander-Arnold", ovr: 86, position: "RB", rarity: "GOLD", club: "Liverpool", stats: { pace: 76, shooting: 69, passing: 90, dribbling: 80, defending: 80, physical: 73 } },
  { id: "p24", name: "Alphonso Davies", ovr: 84, position: "LB", rarity: "GOLD", club: "Bayern Munich", stats: { pace: 95, shooting: 66, passing: 77, dribbling: 84, defending: 76, physical: 76 } },
  { id: "p25", name: "Bukayo Saka", ovr: 86, position: "RW", rarity: "GOLD", club: "Arsenal", stats: { pace: 85, shooting: 81, passing: 82, dribbling: 86, defending: 65, physical: 74 } },
  { id: "p26", name: "Pedri", ovr: 86, position: "CM", rarity: "GOLD", club: "Barcelona", stats: { pace: 78, shooting: 68, passing: 85, dribbling: 88, defending: 68, physical: 65 } },
  { id: "p27", name: "Declan Rice", ovr: 86, position: "CDM", rarity: "GOLD", club: "Arsenal", stats: { pace: 73, shooting: 66, passing: 78, dribbling: 79, defending: 85, physical: 83 } },
  { id: "p28", name: "Gianluigi Donnarumma", ovr: 87, position: "GK", rarity: "GOLD", club: "PSG", stats: { pace: 88, shooting: 83, passing: 75, dribbling: 89, defending: 86, physical: 85 } }
];

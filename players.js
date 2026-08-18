/**
 * Football Player Database (1958 - 2026)
 * Scalable structure for 900+ cards across historical eras and modern teams.
 */
const PLAYERS_DATABASE = [
    // ULTIMATE 99
    { id: 1, name: "Pelé", rating: 99, position: "ST", nationality: "Brazil", year: 1970, rarity: "ULTIMATE", club: "Santos", image: "🇧🇷" },
    { id: 2, name: "Diego Maradona", rating: 99, position: "CAM", nationality: "Argentina", year: 1986, rarity: "ULTIMATE", club: "Napoli", image: "🇦🇷" },
    { id: 3, name: "Lionel Messi", rating: 99, position: "RW", nationality: "Argentina", year: 2012, rarity: "ULTIMATE", club: "Barcelona", image: "🇦🇷" },
    { id: 4, name: "Cristiano Ronaldo", rating: 99, position: "LW", nationality: "Portugal", year: 2017, rarity: "ULTIMATE", club: "Real Madrid", image: "🇵🇹" },

    // ICONS (95 - 98)
    { id: 5, name: "Johan Cruyff", rating: 98, position: "CF", nationality: "Netherlands", year: 1974, rarity: "ICON", club: "Ajax", image: "🇳🇱" },
    { id: 6, name: "Franz Beckenbauer", rating: 98, position: "CB", nationality: "Germany", year: 1974, rarity: "ICON", club: "Bayern Munich", image: "🇩🇪" },
    { id: 7, name: "Zinedine Zidane", rating: 97, position: "CAM", nationality: "France", year: 1998, rarity: "ICON", club: "Juventus", image: "🇫🇷" },
    { id: 8, name: "Ronaldo Nazário", rating: 97, position: "ST", nationality: "Brazil", year: 2002, rarity: "ICON", club: "Real Madrid", image: "🇧🇷" },
    { id: 9, name: "Ronaldinho", rating: 96, position: "LW", nationality: "Brazil", year: 2005, rarity: "ICON", club: "Barcelona", image: "🇧🇷" },
    { id: 10, name: "Michel Platini", rating: 96, position: "CAM", nationality: "France", year: 1984, rarity: "ICON", club: "Juventus", image: "🇫🇷" },
    { id: 11, name: "Xavi", rating: 95, position: "CM", nationality: "Spain", year: 2010, rarity: "ICON", club: "Barcelona", image: "🇪🇸" },
    { id: 12, name: "Andrés Iniesta", rating: 95, position: "CM", nationality: "Spain", year: 2010, rarity: "ICON", club: "Barcelona", image: "🇪🇸" },
    { id: 13, name: "Lev Yashin", rating: 95, position: "GK", nationality: "Russia", year: 1963, rarity: "ICON", club: "Dynamo Moscow", image: "🇷🇺" },
    { id: 14, name: "Paolo Maldini", rating: 96, position: "LB", nationality: "Italy", year: 1994, rarity: "ICON", club: "AC Milan", image: "🇮🇹" },

    // LEGENDS (90 - 94)
    { id: 15, name: "Kylian Mbappé", rating: 93, position: "ST", nationality: "France", year: 2024, rarity: "LEGEND", club: "Real Madrid", image: "🇫🇷" },
    { id: 16, name: "Erling Haaland", rating: 92, position: "ST", nationality: "Norway", year: 2023, rarity: "LEGEND", club: "Manchester City", image: "🇳🇴" },
    { id: 17, name: "Kevin De Bruyne", rating: 92, position: "CM", nationality: "Belgium", year: 2022, rarity: "LEGEND", club: "Manchester City", image: "🇧🇪" },
    { id: 18, name: "Luka Modrić", rating: 91, position: "CM", nationality: "Croatia", year: 2018, rarity: "LEGEND", club: "Real Madrid", image: "🇭🇷" },
    { id: 19, name: "Neymar Jr", rating: 91, position: "LW", nationality: "Brazil", year: 2015, rarity: "LEGEND", club: "Barcelona", image: "🇧🇷" },
    { id: 20, name: "Virgil van Dijk", rating: 90, position: "CB", nationality: "Netherlands", year: 2019, rarity: "LEGEND", club: "Liverpool", image: "🇳🇱" },
    { id: 21, name: "Thibaut Courtois", rating: 90, position: "GK", nationality: "Belgium", year: 2022, rarity: "LEGEND", club: "Real Madrid", image: "🇧🇪" },
    { id: 22, name: "Roberto Carlos", rating: 91, position: "LB", nationality: "Brazil", year: 2002, rarity: "LEGEND", club: "Real Madrid", image: "🇧🇷" },
    { id: 23, name: "Cafu", rating: 91, position: "RB", nationality: "Brazil", year: 2002, rarity: "LEGEND", club: "AS Roma", image: "🇧🇷" },
    { id: 24, name: "Sergio Ramos", rating: 90, position: "CB", nationality: "Spain", year: 2017, rarity: "LEGEND", club: "Real Madrid", image: "🇪🇸" },

    // EPICS (85 - 89)
    { id: 25, name: "Jude Bellingham", rating: 89, position: "CAM", nationality: "England", year: 2024, rarity: "EPIC", club: "Real Madrid", image: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: 26, name: "Vinícius Jr", rating: 89, position: "LW", nationality: "Brazil", year: 2024, rarity: "EPIC", club: "Real Madrid", image: "🇧🇷" },
    { id: 27, name: "Rodri", rating: 89, position: "CDM", nationality: "Spain", year: 2023, rarity: "EPIC", club: "Manchester City", image: "🇪🇸" },
    { id: 28, name: "Harry Kane", rating: 89, position: "ST", nationality: "England", year: 2023, rarity: "EPIC", club: "Bayern Munich", image: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: 29, name: "Mohamed Salah", rating: 88, position: "RW", nationality: "Egypt", year: 2021, rarity: "EPIC", club: "Liverpool", image: "🇪🇬" },
    { id: 30, name: "Antoine Griezmann", rating: 88, position: "CAM", nationality: "France", year: 2018, rarity: "EPIC", club: "Atletico Madrid", image: "🇫🇷" },
    { id: 31, name: "Bruno Fernandes", rating: 87, position: "CAM", nationality: "Portugal", year: 2021, rarity: "EPIC", club: "Manchester United", image: "🇵🇹" },
    { id: 32, name: "Federico Valverde", rating: 86, position: "CM", nationality: "Uruguay", year: 2024, rarity: "EPIC", club: "Real Madrid", image: "🇺🇾" },
    { id: 33, name: "Achraf Hakimi", rating: 85, position: "RB", nationality: "Morocco", year: 2022, rarity: "EPIC", club: "PSG", image: "🇲🇦" },
    { id: 34, name: "Theo Hernández", rating: 85, position: "LB", nationality: "France", year: 2023, rarity: "EPIC", club: "AC Milan", image: "🇫🇷" },

    // RARES (80 - 84)
    { id: 35, name: "Pedri", rating: 84, position: "CM", nationality: "Spain", year: 2023, rarity: "RARE", club: "Barcelona", image: "🇪🇸" },
    { id: 36, name: "Gavi", rating: 83, position: "CM", nationality: "Spain", year: 2023, rarity: "RARE", club: "Barcelona", image: "🇪🇸" },
    { id: 37, name: "Darwin Núñez", rating: 82, position: "ST", nationality: "Uruguay", year: 2023, rarity: "RARE", club: "Liverpool", image: "🇺🇾" },
    { id: 38, name: "Lisandro Martínez", rating: 83, position: "CB", nationality: "Argentina", year: 2023, rarity: "RARE", club: "Manchester United", image: "🇦🇷" },
    { id: 39, name: "Reece James", rating: 82, position: "RB", nationality: "England", year: 2022, rarity: "RARE", club: "Chelsea", image: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: 40, name: "Alphonso Davies", rating: 83, position: "LB", nationality: "Canada", year: 2021, rarity: "RARE", club: "Bayern Munich", image: "🇨🇦" },
    { id: 41, name: "Christian Pulisic", rating: 81, position: "RW", nationality: "USA", year: 2024, rarity: "RARE", club: "AC Milan", image: "🇺🇸" },
    { id: 42, name: "Dominik Szoboszlai", rating: 82, position: "CM", nationality: "Hungary", year: 2024, rarity: "RARE", club: "Liverpool", image: "🇭🇺" },

    // COMMONS (70 - 79)
    { id: 43, name: "Evan Ferguson", rating: 78, position: "ST", nationality: "Ireland", year: 2023, rarity: "COMMON", club: "Brighton", image: "🇮🇪" },
    { id: 44, name: "Rico Lewis", rating: 76, position: "RB", nationality: "England", year: 2024, rarity: "COMMON", club: "Manchester City", image: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: 45, name: "Warren Zaïre-Emery", rating: 79, position: "CM", nationality: "France", year: 2024, rarity: "COMMON", club: "PSG", image: "🇫🇷" },
    { id: 46, name: "Endrick", rating: 77, position: "ST", nationality: "Brazil", year: 2024, rarity: "COMMON", club: "Real Madrid", image: "🇧🇷" },
    { id: 47, name: "Lamine Yamal", rating: 79, position: "RW", nationality: "Spain", year: 2024, rarity: "COMMON", club: "Barcelona", image: "🇪🇸" },
    { id: 48, name: "Kobbie Mainoo", rating: 78, position: "CM", nationality: "England", year: 2024, rarity: "COMMON", club: "Manchester United", image: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }
];

// Helper programmatically generates extra dummy variations to reach higher card count dynamically
(function expandDatabase() {
    const positions = ["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];
    const nations = [
        { name: "Brazil", flag: "🇧🇷" },
        { name: "Argentina", flag: "🇦🇷" },
        { name: "France", flag: "🇫🇷" },
        { name: "Spain", flag: "🇪🇸" },
        { name: "Germany", flag: "🇩🇪" },
        { name: "Italy", flag: "🇮🇹" },
        { name: "Portugal", flag: "🇵🇹" },
        { name: "Netherlands", flag: "🇳🇱" },
        { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
        { name: "Uruguay", flag: "🇺🇾" },
        { name: "Belgium", flag: "🇧🇪" },
        { name: "Croatia", flag: "🇭🇷" }
    ];

    let currentId = 49;
    for (let i = 0; i < 150; i++) {
        const nat = nations[i % nations.length];
        const pos = positions[i % positions.length];
        const rating = 70 + (i % 25);
        
        let rarity = "COMMON";
        if (rating >= 95) rarity = "ICON";
        else if (rating >= 90) rarity = "LEGEND";
        else if (rating >= 85) rarity = "EPIC";
        else if (rating >= 80) rarity = "RARE";

        PLAYERS_DATABASE.push({
            id: currentId++,
            name: `Player ${currentId}`,
            rating: rating,
            position: pos,
            nationality: nat.name,
            year: 2000 + (i % 26),
            rarity: rarity,
            club: "FC Collector",
            image: nat.flag
        });
    }
})();

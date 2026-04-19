// Sample card data for WNBA Card Collection prototype.
// Parallel palette pulled straight from styling-guidelines.md.

window.PARALLELS = {
  base:        { name: 'Base',          hex: '#A8A8B3', animated: false },
  silver:      { name: 'Silver Prizm',  hex: '#D4D4E0', animated: false },
  gold:        { name: 'Gold Prizm',    hex: '#FFD700', animated: false, run: 10 },
  goldVinyl:   { name: 'Gold Vinyl',    hex: '#C9A84C', animated: 'shimmer', run: 1 },
  redIce:      { name: 'Red Ice',       hex: '#E74C3C', animated: false, run: 99 },
  blueIce:     { name: 'Blue Ice',      hex: '#4A9EE8', animated: false, run: 49 },
  neonPulse:   { name: 'Neon Green',    hex: '#2ECC71', animated: false, run: 75 },
  tigerStripe: { name: 'Tiger Stripe',  hex: '#E67E22', animated: false, run: 25 },
  mojo:        { name: 'Mojo',          hex: '#9B59B6', animated: 'mojo' },
  pulsar:      { name: 'Blue Pulsar',   hex: '#2C65D4', animated: false, run: 49 },
  oneOfOne:    { name: '1-of-1',        hex: '#FFD700', animated: 'rainbow', run: 1 },
};

// Team colors — official primary/secondary, short code, recommended gradient recipe,
// and a sub-brand descriptor. Feeds card art + the Team Gradient System doc.
// 15 active franchises for the 2026 season (adds Toronto Tempo + Portland Fire).
window.TEAMS = {
  // Eastern Conference
  'Atlanta Dream':          { p: '#C8102E', s: '#A2AAAD', short: 'ATL', city: 'Atlanta',        mark: 'Dream',     recipe: 'Dream Red → Silver', angle: 155 },
  'Chicago Sky':            { p: '#418FDE', s: '#FFD100', short: 'CHI', city: 'Chicago',        mark: 'Sky',       recipe: 'Sky Blue → Sun Yellow', angle: 150 },
  'Connecticut Sun':        { p: '#F47B20', s: '#0A2240', short: 'CON', city: 'Connecticut',    mark: 'Sun',       recipe: 'Flare Orange → Navy', angle: 155 },
  'Indiana Fever':          { p: '#FFC633', s: '#002D62', short: 'IND', city: 'Indiana',        mark: 'Fever',     recipe: 'Fever Gold → Navy', angle: 155 },
  'New York Liberty':       { p: '#2B5F4A', s: '#000000', short: 'NYL', city: 'New York',       mark: 'Liberty',   recipe: 'Liberty Green → Black', angle: 155 },
  'Toronto Tempo':          { p: '#6F2232', s: '#3B6BA5', short: 'TOR', city: 'Toronto',        mark: 'Tempo',     recipe: 'Bordeaux → Borealis Blue', angle: 150 },
  'Washington Mystics':     { p: '#E03A3E', s: '#002B5C', short: 'WAS', city: 'Washington',     mark: 'Mystics',   recipe: 'Monument Red → Navy', angle: 155 },

  // Western Conference
  'Dallas Wings':           { p: '#C8102E', s: '#0C2340', short: 'DAL', city: 'Dallas',         mark: 'Wings',     recipe: 'Wings Red → Midnight', angle: 160 },
  'Golden State Valkyries': { p: '#F2C94C', s: '#14274E', short: 'GSV', city: 'Golden State',   mark: 'Valkyries', recipe: 'Violet Gold → Navy', angle: 145 },
  'Las Vegas Aces':         { p: '#A79059', s: '#000000', short: 'LVA', city: 'Las Vegas',      mark: 'Aces',      recipe: 'Aces Gold → Jet Black', angle: 160 },
  'Los Angeles Sparks':     { p: '#552583', s: '#FDB927', short: 'LAS', city: 'Los Angeles',    mark: 'Sparks',    recipe: 'Purple → Forum Gold', angle: 150 },
  'Minnesota Lynx':         { p: '#266092', s: '#79BC43', short: 'MIN', city: 'Minnesota',      mark: 'Lynx',      recipe: 'Lake Blue → Aurora Green', angle: 150 },
  'Phoenix Mercury':        { p: '#E56020', s: '#201747', short: 'PHX', city: 'Phoenix',        mark: 'Mercury',   recipe: 'Sunburst → Deep Purple', angle: 160 },
  'Portland Fire':          { p: '#C8102E', s: '#6B3A1E', short: 'POR', city: 'Portland',       mark: 'Fire',      recipe: 'Fire Red → Ember Brown', angle: 160 },
  'Seattle Storm':          { p: '#2C5234', s: '#FFC72C', short: 'SEA', city: 'Seattle',        mark: 'Storm',     recipe: 'Storm Green → Lightning Yellow', angle: 155 },
};

// The collection. Mix of stars, parallels, conditions.
window.CARDS = [
  { id: 'c01', player: "Caitlin Clark",   team: 'Indiana Fever',      set: '2024 Prizm', num: 1,   parallel: 'silver',      rookie: true,  serial: null,      cond: 'NM',  cost: 120, date: '2024-11-02', fav: true },
  { id: 'c02', player: "Caitlin Clark",   team: 'Indiana Fever',      set: '2024 Prizm', num: 1,   parallel: 'oneOfOne',    rookie: true,  serial: '1/1',     cond: 'MT',  cost: 4800,date: '2025-02-18', fav: true },
  { id: 'c03', player: "Caitlin Clark",   team: 'Indiana Fever',      set: '2024 Prizm', num: 1,   parallel: 'redIce',      rookie: true,  serial: '14/99',   cond: 'NM',  cost: 380, date: '2024-12-20' },
  { id: 'c04', player: "Angel Reese",     team: 'Chicago Sky',        set: '2024 Prizm', num: 2,   parallel: 'silver',      rookie: true,  serial: null,      cond: 'NM',  cost: 65,  date: '2024-10-14' },
  { id: 'c05', player: "Angel Reese",     team: 'Chicago Sky',        set: '2024 Prizm', num: 2,   parallel: 'gold',        rookie: true,  serial: '7/10',    cond: 'MT',  cost: 720, date: '2025-01-09' },
  { id: 'c06', player: "Angel Reese",     team: 'Chicago Sky',        set: '2024 Prizm', num: 2,   parallel: 'neonPulse',   rookie: true,  serial: '42/75',   cond: 'NM',  cost: 145, date: '2024-12-03' },
  { id: 'c07', player: "Cameron Brink",   team: 'Los Angeles Sparks', set: '2024 Prizm', num: 3,   parallel: 'silver',      rookie: true,  serial: null,      cond: 'NM',  cost: 32,  date: '2024-09-28' },
  { id: 'c08', player: "Cameron Brink",   team: 'Los Angeles Sparks', set: '2024 Prizm', num: 3,   parallel: 'goldVinyl',   rookie: true,  serial: '1/1',     cond: 'MT',  cost: 2100,date: '2025-03-11', fav: true },
  { id: 'c09', player: "Cameron Brink",   team: 'Los Angeles Sparks', set: '2024 Prizm', num: 3,   parallel: 'blueIce',     rookie: true,  serial: '22/49',   cond: 'NM',  cost: 180, date: '2024-11-16' },
  { id: 'c10', player: "A'ja Wilson",     team: 'Las Vegas Aces',     set: '2024 Prizm', num: 4,   parallel: 'silver',      rookie: false, serial: null,      cond: 'NM',  cost: 40,  date: '2024-08-19' },
  { id: 'c11', player: "A'ja Wilson",     team: 'Las Vegas Aces',     set: '2024 Prizm', num: 4,   parallel: 'mojo',        rookie: false, serial: '3/25',    cond: 'MT',  cost: 520, date: '2025-01-27' },
  { id: 'c12', player: "A'ja Wilson",     team: 'Las Vegas Aces',     set: '2024 Prizm', num: 4,   parallel: 'tigerStripe', rookie: false, serial: '18/25',   cond: 'NM',  cost: 410, date: '2024-12-30' },
  { id: 'c13', player: "Breanna Stewart", team: 'New York Liberty',   set: '2024 Prizm', num: 5,   parallel: 'silver',      rookie: false, serial: null,      cond: 'NM',  cost: 28,  date: '2024-09-05' },
  { id: 'c14', player: "Breanna Stewart", team: 'New York Liberty',   set: '2024 Prizm', num: 5,   parallel: 'pulsar',      rookie: false, serial: '8/49',    cond: 'MT',  cost: 240, date: '2025-02-05' },
  { id: 'c15', player: "Sabrina Ionescu", team: 'New York Liberty',   set: '2024 Prizm', num: 6,   parallel: 'silver',      rookie: false, serial: null,      cond: 'NM',  cost: 35,  date: '2024-09-12' },
  { id: 'c16', player: "Sabrina Ionescu", team: 'New York Liberty',   set: '2024 Prizm', num: 6,   parallel: 'redIce',      rookie: false, serial: '55/99',   cond: 'NM',  cost: 210, date: '2024-11-22' },
  { id: 'c17', player: "Sabrina Ionescu", team: 'New York Liberty',   set: '2024 Prizm', num: 6,   parallel: 'gold',        rookie: false, serial: '2/10',    cond: 'MT',  cost: 890, date: '2025-03-02', fav: true },
];

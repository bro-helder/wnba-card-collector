// Team colors and parallel definitions — mirrors the design prototype's data.js.
// Used by CardArt, ParallelBadge, and collection screens.

export type ParallelKey =
  | 'base' | 'silver' | 'gold' | 'goldVinyl' | 'redIce' | 'blueIce'
  | 'neonPulse' | 'tigerStripe' | 'mojo' | 'pulsar' | 'oneOfOne';

export interface ParallelDef {
  name: string;
  hex: string;
  animated: false | 'shimmer' | 'mojo' | 'rainbow';
  run?: number;
}

export const PARALLELS: Record<ParallelKey, ParallelDef> = {
  base:        { name: 'Base',          hex: '#A8A8B3', animated: false },
  silver:      { name: 'Silver Prizm',  hex: '#D4D4E0', animated: false },
  gold:        { name: 'Gold Prizm',    hex: '#FFD700', animated: false,    run: 10 },
  goldVinyl:   { name: 'Gold Vinyl',    hex: '#C9A84C', animated: 'shimmer', run: 1 },
  redIce:      { name: 'Red Ice',       hex: '#E74C3C', animated: false,    run: 99 },
  blueIce:     { name: 'Blue Ice',      hex: '#4A9EE8', animated: false,    run: 49 },
  neonPulse:   { name: 'Neon Green',    hex: '#2ECC71', animated: false,    run: 75 },
  tigerStripe: { name: 'Tiger Stripe',  hex: '#E67E22', animated: false,    run: 25 },
  mojo:        { name: 'Mojo',          hex: '#9B59B6', animated: 'mojo' },
  pulsar:      { name: 'Blue Pulsar',   hex: '#2C65D4', animated: false,    run: 49 },
  oneOfOne:    { name: '1-of-1',        hex: '#FFD700', animated: 'rainbow', run: 1 },
};

export interface TeamDef {
  p: string;
  s: string;
  short: string;
  city: string;
  mark: string;
  recipe: string;
  angle: number;
}

export const TEAMS: Record<string, TeamDef> = {
  'Atlanta Dream':          { p: '#C8102E', s: '#A2AAAD', short: 'ATL', city: 'Atlanta',      mark: 'Dream',     recipe: 'Dream Red → Silver',              angle: 155 },
  'Chicago Sky':            { p: '#418FDE', s: '#FFD100', short: 'CHI', city: 'Chicago',      mark: 'Sky',       recipe: 'Sky Blue → Sun Yellow',           angle: 150 },
  'Connecticut Sun':        { p: '#F47B20', s: '#0A2240', short: 'CON', city: 'Connecticut',  mark: 'Sun',       recipe: 'Flare Orange → Navy',             angle: 155 },
  'Indiana Fever':          { p: '#FFC633', s: '#002D62', short: 'IND', city: 'Indiana',      mark: 'Fever',     recipe: 'Fever Gold → Navy',               angle: 155 },
  'New York Liberty':       { p: '#2B5F4A', s: '#000000', short: 'NYL', city: 'New York',     mark: 'Liberty',   recipe: 'Liberty Green → Black',           angle: 155 },
  'Toronto Tempo':          { p: '#6F2232', s: '#3B6BA5', short: 'TOR', city: 'Toronto',      mark: 'Tempo',     recipe: 'Bordeaux → Borealis Blue',        angle: 150 },
  'Washington Mystics':     { p: '#E03A3E', s: '#002B5C', short: 'WAS', city: 'Washington',   mark: 'Mystics',   recipe: 'Monument Red → Navy',             angle: 155 },
  'Dallas Wings':           { p: '#C8102E', s: '#0C2340', short: 'DAL', city: 'Dallas',       mark: 'Wings',     recipe: 'Wings Red → Midnight',            angle: 160 },
  'Golden State Valkyries': { p: '#F2C94C', s: '#14274E', short: 'GSV', city: 'Golden State', mark: 'Valkyries', recipe: 'Violet Gold → Navy',              angle: 145 },
  'Las Vegas Aces':         { p: '#A79059', s: '#000000', short: 'LVA', city: 'Las Vegas',    mark: 'Aces',      recipe: 'Aces Gold → Jet Black',           angle: 160 },
  'Los Angeles Sparks':     { p: '#552583', s: '#FDB927', short: 'LAS', city: 'Los Angeles',  mark: 'Sparks',    recipe: 'Purple → Forum Gold',             angle: 150 },
  'Minnesota Lynx':         { p: '#266092', s: '#79BC43', short: 'MIN', city: 'Minnesota',    mark: 'Lynx',      recipe: 'Lake Blue → Aurora Green',        angle: 150 },
  'Phoenix Mercury':        { p: '#E56020', s: '#201747', short: 'PHX', city: 'Phoenix',      mark: 'Mercury',   recipe: 'Sunburst → Deep Purple',          angle: 160 },
  'Portland Fire':          { p: '#C8102E', s: '#6B3A1E', short: 'POR', city: 'Portland',     mark: 'Fire',      recipe: 'Fire Red → Ember Brown',          angle: 160 },
  'Seattle Storm':          { p: '#2C5234', s: '#FFC72C', short: 'SEA', city: 'Seattle',      mark: 'Storm',     recipe: 'Storm Green → Lightning Yellow',  angle: 155 },
};

// Map a DB parallel name (from the parallels table) → CardArt ParallelKey.
// Falls back to 'base' if unknown.
export function nameToParallelKey(name: string | null | undefined): ParallelKey {
  if (!name) return 'base';
  const n = name.toLowerCase();
  if (n.includes('1-of-1') || n.includes('1/1') || n.includes('one of one')) return 'oneOfOne';
  if (n.includes('gold vinyl')) return 'goldVinyl';
  if (n.includes('mojo')) return 'mojo';
  if (n.includes('tiger stripe') || n.includes('tiger')) return 'tigerStripe';
  if (n.includes('blue pulsar') || n.includes('pulsar')) return 'pulsar';
  if (n.includes('neon') || n.includes('green')) return 'neonPulse';
  if (n.includes('red ice')) return 'redIce';
  if (n.includes('blue ice')) return 'blueIce';
  if (n.includes('gold')) return 'gold';
  if (n.includes('silver')) return 'silver';
  if (n.includes('base') || n.includes('base prizm') || n === '') return 'base';
  return 'base';
}

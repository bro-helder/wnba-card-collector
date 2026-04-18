import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverClient(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      db: { schema: 'wnba_cards' },
      global: { headers: { Authorization: authHeader } },
    }
  );
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

interface CsvRow {
  cardSet: string;
  cardNumber: string;
  athlete: string;
  team: string;
  sequence: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const rows: CsvRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Split on comma but handle fields that might be quoted
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 4) continue;
    // Skip header rows (by content, not just first line)
    if (cols[0].trim() === 'Card Set') continue;

    rows.push({
      cardSet: cols[0].trim(),
      cardNumber: cols[1].trim(),
      athlete: cols[2].trim(),
      team: cols[3].trim(),
      sequence: cols[4]?.trim() ?? '',
    });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { cols.push(current); current = ''; continue; }
    current += ch;
  }
  cols.push(current);
  return cols;
}

// ---------------------------------------------------------------------------
// Insert / parallel name extraction
// ---------------------------------------------------------------------------

interface ParsedCardSet {
  insertName: string;
  parallelName: string;
}

function detectRootInserts(allCardSets: string[]): string[] {
  // Greedy shortest-match: a string is a root insert if it does not start with
  // any shorter root followed by a space. This prevents "Clark-Mania! Gold" from
  // being treated as a root (it starts with "Clark-Mania! ").
  const candidates = [...new Set(allCardSets)]
    .filter(cs => !cs.includes(' Prizms '))
    .sort((a, b) => a.length - b.length);

  const roots: string[] = [];
  for (const cs of candidates) {
    const hasParentRoot = roots.some(r => cs.startsWith(r + ' '));
    if (!hasParentRoot) roots.push(cs);
  }
  return roots;
}

function parseCardSet(cardSet: string, rootInserts: string[]): ParsedCardSet {
  // Primary: split on ' Prizms '
  const idx = cardSet.indexOf(' Prizms ');
  if (idx !== -1) {
    return { insertName: cardSet.slice(0, idx).trim(), parallelName: cardSet.slice(idx + 8).trim() };
  }

  // Secondary: starts with a known root followed by ' ' (e.g. "Clark-Mania! Black Finite")
  // Sort longest first so we match the most specific prefix
  const sorted = [...rootInserts].sort((a, b) => b.length - a.length);
  for (const root of sorted) {
    if (cardSet !== root && cardSet.startsWith(root + ' ')) {
      return { insertName: root, parallelName: cardSet.slice(root.length + 1).trim() };
    }
  }

  // Full string is the insert, parallel = "Base"
  return { insertName: cardSet, parallelName: 'Base' };
}

// ---------------------------------------------------------------------------
// Sequence parsing
// ---------------------------------------------------------------------------

function parseSequence(seq: string): { printRun: number | null; isNumbered: boolean } {
  if (!seq?.trim()) return { printRun: null, isNumbered: false };
  // Beckett uses "/99" (denominator only) or "1/1" (specific serial).
  // The old regex broke on leading-slash format — use lastIndexOf instead.
  const s = seq.trim();
  const slash = s.lastIndexOf('/');
  if (slash !== -1) {
    const printRun = parseInt(s.slice(slash + 1), 10);
    if (!isNaN(printRun) && printRun > 0) return { printRun, isNumbered: true };
  }
  return { printRun: null, isNumbered: false };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = serverClient(authHeader);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const setNameBase = (formData.get('setName') as string | null)?.trim();
  const yearStr = formData.get('year') as string | null;
  const manufacturer = (formData.get('manufacturer') as string | null)?.trim() ?? null;

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });
  if (!setNameBase) return NextResponse.json({ error: 'setName is required' }, { status: 400 });
  if (!yearStr) return NextResponse.json({ error: 'year is required' }, { status: 400 });

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return NextResponse.json({ error: 'year must be a number' }, { status: 400 });

  const text = await file.text();
  const rows = parseCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
  }

  // Detect all root insert names from the data
  const allCardSets = rows.map(r => r.cardSet);
  const rootInserts = detectRootInserts(allCardSets);

  // Parse all rows
  const parsed = rows.map(r => ({
    ...r,
    ...parseCardSet(r.cardSet, rootInserts),
    ...parseSequence(r.sequence),
  }));

  // Group by insert name
  const byInsert = new Map<string, typeof parsed>();
  for (const row of parsed) {
    if (!byInsert.has(row.insertName)) byInsert.set(row.insertName, []);
    byInsert.get(row.insertName)!.push(row);
  }

  let setsCreated = 0;
  let parallelsCreated = 0;
  let cardsCreated = 0;
  const errors: string[] = [];

  for (const [insertName, insertRows] of byInsert) {
    // Build set name: base insert uses the provided name directly;
    // other inserts get " — InsertName" suffix.
    const isBase = insertName.toLowerCase() === 'base';
    const setName = isBase ? setNameBase : `${setNameBase} — ${insertName}`;

    // Upsert set (match on name + year)
    const { data: existingSets } = await supabase
      .from('sets')
      .select('id')
      .eq('name', setName)
      .eq('year', year)
      .limit(1);

    let setId: string;
    if (existingSets && existingSets.length > 0) {
      setId = existingSets[0].id;
    } else {
      const { data: newSet, error: setErr } = await supabase
        .from('sets')
        .insert({ name: setName, year, manufacturer })
        .select('id')
        .single();
      if (setErr || !newSet) {
        errors.push(`Failed to create set "${setName}": ${setErr?.message}`);
        continue;
      }
      setId = newSet.id;
      setsCreated++;
    }

    // Collect unique parallels for this insert
    // Use a Map: parallelName → { printRun, isNumbered }
    // Take the first non-null sequence encountered per parallel
    const parallelMap = new Map<string, { printRun: number | null; isNumbered: boolean }>();
    for (const row of insertRows) {
      if (!parallelMap.has(row.parallelName)) {
        parallelMap.set(row.parallelName, { printRun: row.printRun, isNumbered: row.isNumbered });
      }
    }

    // Fetch existing parallels for this set (need id + name + print_run to patch nulls)
    const { data: existingParallels } = await supabase
      .from('parallels')
      .select('id, name, print_run')
      .eq('set_id', setId);
    const existingParallelMap = new Map((existingParallels ?? []).map(p => [p.name, p]));

    let parallelSortOrder = 0;
    for (const [parallelName, { printRun, isNumbered }] of parallelMap) {
      const existing = existingParallelMap.get(parallelName);
      if (existing) {
        // Patch print_run if it was previously stored as null (e.g. from the old broken regex)
        if (existing.print_run == null && printRun != null) {
          await supabase.from('parallels').update({ print_run: printRun, is_numbered: isNumbered }).eq('id', existing.id);
        }
        continue;
      }

      const { error: pErr } = await supabase.from('parallels').insert({
        set_id: setId,
        name: parallelName,
        print_run: printRun,
        is_numbered: isNumbered,
        is_base: parallelName === 'Base',
        sort_order: parallelSortOrder++,
      });
      if (pErr) {
        errors.push(`Parallel "${parallelName}" in "${setName}": ${pErr.message}`);
      } else {
        parallelsCreated++;
      }
    }

    // Collect unique cards (by card_number) — use the first row encountered
    const cardMap = new Map<string, { player_name: string; team: string }>();
    for (const row of insertRows) {
      if (!cardMap.has(row.cardNumber)) {
        cardMap.set(row.cardNumber, { player_name: row.athlete, team: row.team });
      }
    }

    // Fetch existing cards for this set
    const { data: existingCards } = await supabase
      .from('cards')
      .select('card_number')
      .eq('set_id', setId);
    const existingCardNumbers = new Set((existingCards ?? []).map(c => c.card_number));

    const newCards = [...cardMap.entries()]
      .filter(([num]) => !existingCardNumbers.has(num))
      .map(([card_number, { player_name, team }]) => ({
        set_id: setId,
        card_number,
        player_name,
        team: team || null,
      }));

    if (newCards.length > 0) {
      // Insert in batches of 200 to stay under payload limits
      for (let i = 0; i < newCards.length; i += 200) {
        const batch = newCards.slice(i, i + 200);
        const { error: cardErr, data: inserted } = await supabase
          .from('cards')
          .insert(batch)
          .select('id');
        if (cardErr) {
          errors.push(`Cards batch for "${setName}": ${cardErr.message}`);
        } else {
          cardsCreated += inserted?.length ?? 0;
        }
      }
    }
  }

  return NextResponse.json({
    sets_created: setsCreated,
    parallels_created: parallelsCreated,
    cards_created: cardsCreated,
    inserts_processed: byInsert.size,
    rows_processed: rows.length,
    errors,
  });
}

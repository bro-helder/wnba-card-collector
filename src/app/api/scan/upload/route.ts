import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

function createServerClient(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      db: { schema: 'wnba_cards' },
      global: { headers: { Authorization: authHeader } },
    }
  );
}

function createStorageClient(authHeader: string) {
  // Storage API lives outside the wnba_cards schema — use default client
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadFile(storageClient: any, file: File, userId: string, suffix: 'front' | 'back'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  // Use a single timestamp prefix so front/back share the same logical scan
  const storagePath = `${userId}/${Date.now()}-${suffix}.${ext}`;

  const { error } = await storageClient.storage
    .from('card-images')
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`${suffix} upload failed: ${error.message}`);
  return storagePath;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient(authHeader);
  const storageClient = createStorageClient(authHeader);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const frontFile = formData.get('front') as File | null;
  const backFile = formData.get('back') as File | null;

  if (!frontFile) {
    return NextResponse.json({ error: 'Front image is required' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(frontFile.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or HEIC.' }, { status: 400 });
  }
  if (backFile && !ALLOWED_TYPES.includes(backFile.type)) {
    return NextResponse.json({ error: 'Invalid back image type. Use JPEG, PNG, WebP, or HEIC.' }, { status: 400 });
  }

  let frontPath: string;
  let backPath: string | null = null;

  try {
    frontPath = await uploadFile(storageClient, frontFile, user.id, 'front');
    if (backFile) {
      backPath = await uploadFile(storageClient, backFile, user.id, 'back');
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }

  // Create scan session using only the original schema columns (no migration required)
  // image_url stores the front storage path; back path is returned to the client and
  // passed directly to Edge Functions — no DB column needed.
  const { data: session, error: sessionError } = await supabase
    .from('scan_sessions')
    .insert({
      user_id: user.id,
      image_url: frontPath,
      status: 'pending',
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Failed to create scan session', detail: sessionError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    session_id: session.id,
    front_image_path: frontPath,
    back_image_path: backPath,
  });
}

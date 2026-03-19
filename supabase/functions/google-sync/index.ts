// @ts-nocheck

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const GOOGLE_SYNC_WEBHOOK_URL = Deno.env.get('GOOGLE_SYNC_WEBHOOK_URL') ?? '';
const GOOGLE_SYNC_SHARED_SECRET = Deno.env.get('GOOGLE_SYNC_SHARED_SECRET') ?? '';
const GOOGLE_SYNC_FUNCTION_TOKEN = Deno.env.get('GOOGLE_SYNC_FUNCTION_TOKEN') ?? '';
const SYNC_BATCH_SIZE = Number(Deno.env.get('GOOGLE_SYNC_BATCH_SIZE') ?? '10');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function buildAttachmentPayload(row: Record<string, unknown>) {
  return [
    {
      key: 'strategy',
      path: row.strategy_file_path,
      url: row.strategy_file_url,
      name: row.strategy_file_name,
      targetFolderKey: 'strategy',
    },
    {
      key: 'org_structure',
      path: row.org_structure_file_path,
      url: row.org_structure_file_url,
      name: row.org_structure_file_name,
      targetFolderKey: 'org_structure',
    },
    {
      key: 'hrd_plan',
      path: row.hrd_plan_file_path,
      url: row.hrd_plan_file_url,
      name: row.hrd_plan_file_name,
      targetFolderKey: 'hrd_plan',
    },
  ].filter((item) => item.url);
}

function sanitizeRowForWebhook(row: Record<string, unknown>) {
  const clone = { ...row };
  delete clone.google_sync_error;
  delete clone.google_drive_error;
  return clone;
}

async function markRowStatus(id: string, payload: Record<string, unknown>) {
  const { error } = await supabaseAdmin
    .from('hrd_ch1_responses')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Failed to update sync status', { id, error });
  }
}

async function syncRow(row: Record<string, unknown>) {
  const issuedAt = new Date().toISOString();
  const nonce = crypto.randomUUID();

  const requestBody = {
    source: 'supabase-edge-function',
    secret: GOOGLE_SYNC_SHARED_SECRET,
    issuedAt,
    nonce,
    record: sanitizeRowForWebhook(row),
    attachments: buildAttachmentPayload(row),
  };

  const response = await fetch(GOOGLE_SYNC_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  let payload: Record<string, unknown> = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = { raw: responseText };
  }

  if (!response.ok) {
    throw new Error(`Google sync webhook failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function fetchPendingRows(limit: number) {
  const { data, error } = await supabaseAdmin
    .from('ch1_google_sync_queue')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

function isAuthorizedCaller(req: Request): boolean {
  if (!GOOGLE_SYNC_FUNCTION_TOKEN) return true;

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7).trim();
  return token === GOOGLE_SYNC_FUNCTION_TOKEN;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!isAuthorizedCaller(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized caller' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  if (!GOOGLE_SYNC_WEBHOOK_URL || !GOOGLE_SYNC_SHARED_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Missing GOOGLE_SYNC_WEBHOOK_URL or GOOGLE_SYNC_SHARED_SECRET' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const rowId = body?.rowId as string | undefined;
    const limit = Number(body?.limit ?? SYNC_BATCH_SIZE);

    let rows: Record<string, unknown>[] = [];

    if (rowId) {
      const { data, error } = await supabaseAdmin
        .from('hrd_ch1_responses')
        .select('*')
        .eq('id', rowId)
        .single();

      if (error) throw error;
      if (data) rows = [data];
    } else {
      rows = await fetchPendingRows(limit);
    }

    const results = [];

    for (const row of rows) {
      const rowIdValue = String(row.id);
      const nextAttemptCount = Number(row.google_sync_attempts ?? 0) + 1;

      await markRowStatus(rowIdValue, {
        google_sync_status: 'processing',
        google_sync_attempts: nextAttemptCount,
        google_sync_error: null,
      });

      try {
        const payload = await syncRow(row);
        const driveFiles = Array.isArray(payload.driveFiles) ? payload.driveFiles : [];
        const driveStatus = driveFiles.length > 0 || buildAttachmentPayload(row).length === 0 ? 'synced' : 'pending';

        await markRowStatus(rowIdValue, {
          google_sync_status: 'synced',
          google_synced_at: new Date().toISOString(),
          google_sync_error: null,
          google_sheet_row_number: payload.rowNumber ?? null,
          google_drive_sync_status: driveStatus,
          google_drive_synced_at: driveStatus === 'synced' ? new Date().toISOString() : null,
          google_drive_error: null,
          google_drive_files: driveFiles,
        });

        results.push({ id: rowIdValue, status: 'synced', rowNumber: payload.rowNumber ?? null });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await markRowStatus(rowIdValue, {
          google_sync_status: 'failed',
          google_sync_error: message,
          google_drive_sync_status: buildAttachmentPayload(row).length > 0 ? 'failed' : row.google_drive_sync_status,
          google_drive_error: buildAttachmentPayload(row).length > 0 ? message : row.google_drive_error,
        });
        results.push({ id: rowIdValue, status: 'failed', error: message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

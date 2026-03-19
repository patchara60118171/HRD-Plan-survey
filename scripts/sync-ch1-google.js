require('dotenv').config({ path: '.env.local' });
const { supabaseAdmin } = require('./supabase-admin');

const GOOGLE_SYNC_WEBHOOK_URL = process.env.GOOGLE_SYNC_WEBHOOK_URL;
const GOOGLE_SYNC_SHARED_SECRET = process.env.GOOGLE_SYNC_SHARED_SECRET;
const DEFAULT_LIMIT = Number(process.env.GOOGLE_SYNC_BATCH_SIZE || 20);
const MODE = process.argv[2] || 'pending';
const MODE_VALUE = process.argv[3] || '';

if (!GOOGLE_SYNC_WEBHOOK_URL || !GOOGLE_SYNC_SHARED_SECRET) {
  console.error('❌ Missing GOOGLE_SYNC_WEBHOOK_URL or GOOGLE_SYNC_SHARED_SECRET in .env.local');
  process.exit(1);
}

function buildAttachmentPayload(row) {
  return [
    {
      key: 'strategy',
      path: row.strategy_file_path,
      url: row.strategy_file_url,
      name: row.strategy_file_name,
      targetFolderKey: 'strategy'
    },
    {
      key: 'org_structure',
      path: row.org_structure_file_path,
      url: row.org_structure_file_url,
      name: row.org_structure_file_name,
      targetFolderKey: 'org_structure'
    },
    {
      key: 'hrd_plan',
      path: row.hrd_plan_file_path,
      url: row.hrd_plan_file_url,
      name: row.hrd_plan_file_name,
      targetFolderKey: 'hrd_plan'
    }
  ].filter((item) => item.url);
}

function sanitizeRowForWebhook(row) {
  const clone = { ...row };
  delete clone.google_sync_error;
  delete clone.google_drive_error;
  return clone;
}

async function markRowStatus(id, payload) {
  const { error } = await supabaseAdmin
    .from('hrd_ch1_responses')
    .update(payload)
    .eq('id', id);

  if (error) {
    throw error;
  }
}

async function loadRows() {
  if (MODE === 'id' && MODE_VALUE) {
    const { data, error } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*')
      .eq('id', MODE_VALUE)
      .limit(1);

    if (error) throw error;
    return data || [];
  }

  if (MODE === 'all') {
    const { data, error } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*')
      .not('submitted_at', 'is', null)
      .order('created_at', { ascending: true })
      .limit(DEFAULT_LIMIT);

    if (error) throw error;
    return data || [];
  }

  const { data, error } = await supabaseAdmin
    .from('ch1_google_sync_queue')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIMIT);

  if (error) throw error;
  return data || [];
}

async function syncRow(row) {
  const response = await fetch(GOOGLE_SYNC_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'node-script',
      secret: GOOGLE_SYNC_SHARED_SECRET,
      record: sanitizeRowForWebhook(row),
      attachments: buildAttachmentPayload(row)
    })
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Webhook ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 CH1 Google Sync');
  console.log('='.repeat(60));

  const rows = await loadRows();
  console.log(`📦 Found ${rows.length} row(s) to sync`);

  for (const row of rows) {
    const nextAttemptCount = Number(row.google_sync_attempts || 0) + 1;
    console.log(`\n➡️  Syncing ${row.id} | ${row.respondent_email || '-'} | attempt ${nextAttemptCount}`);

    await markRowStatus(row.id, {
      google_sync_status: 'processing',
      google_sync_attempts: nextAttemptCount,
      google_sync_error: null
    });

    try {
      const payload = await syncRow(row);
      const driveFiles = Array.isArray(payload.driveFiles) ? payload.driveFiles : [];
      const driveStatus = driveFiles.length > 0 || buildAttachmentPayload(row).length === 0 ? 'synced' : 'pending';

      await markRowStatus(row.id, {
        google_sync_status: 'synced',
        google_synced_at: new Date().toISOString(),
        google_sync_error: null,
        google_sheet_row_number: payload.rowNumber || null,
        google_drive_sync_status: driveStatus,
        google_drive_synced_at: driveStatus === 'synced' ? new Date().toISOString() : null,
        google_drive_error: null,
        google_drive_files: driveFiles
      });

      console.log(`✅ Synced ${row.id} -> row ${payload.rowNumber || 'n/a'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markRowStatus(row.id, {
        google_sync_status: 'failed',
        google_sync_error: message,
        google_drive_sync_status: buildAttachmentPayload(row).length > 0 ? 'failed' : row.google_drive_sync_status,
        google_drive_error: buildAttachmentPayload(row).length > 0 ? message : row.google_drive_error
      });

      console.error(`❌ Failed ${row.id}: ${message}`);
    }
  }

  console.log('\n🏁 Done');
}

main().catch((error) => {
  console.error('❌ Sync script failed:', error.message || error);
  process.exit(1);
});

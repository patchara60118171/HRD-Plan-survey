/* ========== ADMIN PORTAL — API HELPERS (HYBRID LAYER) ========== */

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function callEdgeFunction(functionName, body) {
  const token = state.session?.access_token;
  if (!token) throw new Error('No session');

  return fetchJson(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
}

async function fetchAdminUserRoles() {
  // Reads from view that excludes sensitive columns like initial_password.
  const { data, error } = await sb.from('admin_user_roles_public').select('*').order('email', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function fetchOrgHrCredentials() {
  // Security-definer RPC — never exposes initial_password to the client directly.
  const { data, error } = await sb.rpc('get_org_hr_credentials');
  if (error) throw error;
  return data || [];
}

async function saveAdminUserRole(payload, rowId = null, email = null) {
  const query = rowId
    ? sb.from('admin_user_roles').update(payload).eq('id', rowId)
    : email
      ? sb.from('admin_user_roles').update(payload).eq('email', email)
      : sb.from('admin_user_roles').insert(payload);

  const { error } = await query;
  if (error) throw error;

  state.orgHrCredentials = await fetchOrgHrCredentials();

  return fetchAdminUserRoles();
}

async function deleteAdminUserRole(id) {
  const { error } = await sb.from('admin_user_roles').delete().eq('id', id);
  if (error) throw error;
  state.orgHrCredentials = await fetchOrgHrCredentials();
  return fetchAdminUserRoles();
}

async function fetchOrganizations() {
  const { data, error } = await sb.from('organizations').select('*').eq('is_active', true).order('org_name_th', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function saveOrganization(payload, existingId = null) {
  const query = existingId
    ? sb.from('organizations').update(payload).eq('id', existingId)
    : sb.from('organizations').insert(payload);

  const { error } = await query;
  if (error) throw error;

  return fetchOrganizations();
}

async function deleteOrganization(id) {
  const { error } = await sb.from('organizations').delete().eq('id', id);
  if (error) throw error;
  return fetchOrganizations();
}

async function toggleOrgVisibility(id, currentValue) {
  const { error } = await sb.from('organizations').update({ show_in_dashboard: !currentValue }).eq('id', id);
  if (error) throw error;
  return fetchOrganizations();
}

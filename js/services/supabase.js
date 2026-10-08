import { collectProfile, lengthFieldIds } from '../components/avatar.js';
import { toast } from '../router.js';

// ---- Real accounts, via Supabase ----
const SUPABASE_URL = 'https://htkqrsqjikhyoztrviqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0a3Fyc3FqaWtoeW96dHJ2aXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Nzk2MzMsImV4cCI6MjEwNTQ1NTYzM30.plfdKwvUicQG_a9I3smBKpLPsRIBJWNJdnY7m4So5ws';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase automatically logs someone in the moment they land back on the
// site from a "confirm your email" link — this just makes that moment
// visible instead of silent, and cleans the token out of the URL after.
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && window.location.hash.includes('type=signup')) {
    if (typeof toast === 'function') toast('✅ Email confirmed — you\'re logged in!');
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
});

// Maps this form's camelCase field ids to the measurements table's
// snake_case column names (see setup-measurements-table.sql).
const FIELD_TO_COLUMN = {
  shoulderWidth: 'shoulder_width',
  neckToWaistBack: 'neck_to_waist_back',
  neckToWaistFront: 'neck_to_waist_front',
  chestGirth: 'chest_girth',
  underbustGirth: 'underbust_girth',
  armLength: 'arm_length',
  bicepGirth: 'bicep_girth',
  waistGirth: 'waist_girth',
  hipGirth: 'hip_girth',
  thighGirth: 'thigh_girth',
  crotchHeight: 'crotch_height'
};

async function getCurrentUser(){
  const { data } = await supabaseClient.auth.getSession();
  return data.session ? data.session.user : null;
}
// Exposed so services/cloud-sync.js can sync saved/hearted patterns and step
// progress to the cloud without importing this module (which pulls in the
// BodyDouble viewer).
window.supabaseClient = supabaseClient;
window.iliGetCurrentUser = getCurrentUser;

// Returning visitors who are already logged in (Supabase persists the
// session) get their hearted patterns and step progress pulled in
// automatically, without needing to open Profile first.
getCurrentUser().then(user => {
  if (user) window.loadCloudPatterns && window.loadCloudPatterns();
});

// Renders either the sign-up/log-in form or a "signed in as..." state
// into #authSection, and wires up its buttons. Called every time the
// profile modal opens, since login state can change between visits.
window.renderAuthUI = async function renderAuthUI(){
  const wrap = document.getElementById('authSection');
  if (!wrap) return;
  const user = await getCurrentUser();

  if (user) {
    wrap.innerHTML = `
        <p style="font-size:13px;color:#38506c;margin-bottom:10px;">Signed in as <b>${user.email}</b> — your measurements sync across devices.</p>
        <button id="authLogoutBtn" type="button" style="font-size:12px;padding:7px 14px;border-radius:8px;background:#eee;border:none;cursor:pointer;">Log out</button>
      `;
    document.getElementById('authLogoutBtn').addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.renderAuthUI();
      window.resetLocalPatternState && window.resetLocalPatternState();
    });
    return;
  }

  wrap.innerHTML = `
      <p style="font-size:13px;color:#38506c;margin-bottom:10px;">Create an account so your measurements follow you across devices — optional, the form below still works without one.</p>
      <input id="authEmail" type="email" placeholder="Email" style="width:100%;padding:8px 10px;margin-bottom:6px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box;">
      <div style="position:relative; margin-bottom:8px;">
        <input id="authPassword" type="password" placeholder="Password" style="width:100%;padding:8px 38px 8px 10px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box;">
        <button id="authPasswordToggle" type="button" title="Show password" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:15px; padding:4px; line-height:1;">👁️</button>
      </div>
      <div style="display:flex;gap:8px;">
        <button id="authSignupBtn" type="button" style="flex:1;font-size:12px;padding:8px;border-radius:8px;background:var(--indigo);color:#fff;border:none;cursor:pointer;">Sign up</button>
        <button id="authLoginBtn" type="button" style="flex:1;font-size:12px;padding:8px;border-radius:8px;background:#eee;border:none;cursor:pointer;">Log in</button>
      </div>
      <p id="authMsg" style="font-size:12px;margin-top:8px;"></p>
    `;
  const emailEl = document.getElementById('authEmail');
  const passEl = document.getElementById('authPassword');
  const msgEl = document.getElementById('authMsg');
  const passToggle = document.getElementById('authPasswordToggle');

  passToggle.addEventListener('click', () => {
    const showing = passEl.type === 'text';
    passEl.type = showing ? 'password' : 'text';
    passToggle.textContent = showing ? '👁️' : '🐒';
    passToggle.title = showing ? 'Show password' : 'Hide password';
  });

  document.getElementById('authSignupBtn').addEventListener('click', async () => {
    msgEl.style.color = '#c0392b';
    msgEl.textContent = '';
    const { error } = await supabaseClient.auth.signUp({ email: emailEl.value, password: passEl.value });
    if (error) { msgEl.textContent = error.message; return; }
    msgEl.style.color = '#2e7d32';
    msgEl.textContent = 'Check your email to confirm your account, then log in.';
  });

  document.getElementById('authLoginBtn').addEventListener('click', async () => {
    msgEl.style.color = '#c0392b';
    msgEl.textContent = '';
    const { error } = await supabaseClient.auth.signInWithPassword({ email: emailEl.value, password: passEl.value });
    if (error) { msgEl.textContent = error.message; return; }
    await window.renderAuthUI();
    await window.loadSavedMeasurements();
    await window.loadCloudPatterns();
  });
};

// Loads measurements into the form: from the cloud if signed in and a
// saved row exists, otherwise falls back to this browser's localStorage
// (for people without an account, or before their first cloud save).
window.loadSavedMeasurements = async function loadSavedMeasurements(){
  const user = await getCurrentUser();

  if (user) {
    try {
      const { data } = await supabaseClient
        .from('measurements')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        if (data.gender) document.getElementById('bd-gender').value = data.gender;
        if (data.height != null) document.getElementById('bd-height').value = data.height;
        if (data.weight != null) document.getElementById('bd-weight').value = data.weight;
        lengthFieldIds.forEach(id => {
          const col = FIELD_TO_COLUMN[id];
          if (data[col] != null) document.getElementById('bd-' + id).value = data[col];
        });
        return;
      }
    } catch (e) {
      console.warn('Could not load cloud measurements:', e);
    }
  }

  // No account, or no cloud row saved yet — fall back to this device only.
  try {
    const saved = localStorage.getItem('ili_measurements');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed.gender) document.getElementById('bd-gender').value = parsed.gender;
    if (parsed.fields) {
      if (parsed.fields.height != null) document.getElementById('bd-height').value = parsed.fields.height;
      if (parsed.fields.weight != null) document.getElementById('bd-weight').value = parsed.fields.weight;
      lengthFieldIds.forEach(id => {
        if (parsed.fields[id] != null) document.getElementById('bd-' + id).value = parsed.fields[id];
      });
    }
  } catch (e) {
    console.warn('Could not restore saved measurements:', e);
  }
};

// Save button: persists the current form values (to the cloud if signed
// in, always to localStorage as a same-device backup too), then closes
// the profile modal so whatever page was underneath is visible again.
document.getElementById('bd-save')?.addEventListener('click', async () => {
  const profile = collectProfile();

  try {
    localStorage.setItem('ili_measurements', JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save measurements locally:', e);
  }

  const user = await getCurrentUser();
  if (user) {
    const row = { user_id: user.id };
    if (profile.gender) row.gender = profile.gender;
    if (profile.fields.height != null) row.height = profile.fields.height;
    if (profile.fields.weight != null) row.weight = profile.fields.weight;
    lengthFieldIds.forEach(id => {
      const col = FIELD_TO_COLUMN[id];
      if (profile.fields[id] != null) row[col] = profile.fields[id];
    });
    const { error } = await supabaseClient.from('measurements').upsert(row);
    if (error) console.error('Could not save to your account:', error);
  }

  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
  if (typeof toast === 'function') {
    toast(user ? '💾 Saved to your account!' : '💾 Saved on this device!');
  }
});

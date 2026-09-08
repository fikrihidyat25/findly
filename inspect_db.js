const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split(/\r?\n/);
const envObj = {};
lines.forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0) {
    const k = l.substring(0, idx).trim();
    const v = l.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    envObj[k] = v;
  }
});
const { createClient } = require('@supabase/supabase-js');
const key = envObj.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || envObj.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(envObj.NEXT_PUBLIC_SUPABASE_URL, key);

async function inspect() {
  const { data: profiles } = await supabase.from('profil_pengguna').select('id, nama_lengkap, email, tipe_akun');
  console.log('Profiles count:', profiles?.length);
}
inspect();

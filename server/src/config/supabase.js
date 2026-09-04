const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabaseClient = null;

const getSupabase = () => {
  if (!supabaseClient && env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    try {
      supabaseClient = createClient(env.SUPABASE_URL, key);
      console.log(`[Supabase] Client initialized for project: ${env.SUPABASE_URL}`);
    } catch (err) {
      console.warn(`[Supabase] Initialization warning: ${err.message}`);
    }
  }
  return supabaseClient;
};

module.exports = {
  getSupabase,
};

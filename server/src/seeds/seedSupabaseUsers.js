/**
 * One-time script: Creates demo users in Supabase Auth.
 * Run with: node src/seeds/seedSupabaseUsers.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Admin client (service role bypasses email confirmation)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    email: 'admin@college.edu',
    password: 'Admin@123',
    user_metadata: {
      name: 'Dr. Sarah Mitchell (Administrator)',
      role: 'admin',
      department: 'Admissions & Academic Affairs',
    },
  },
  {
    email: 'student@college.edu',
    password: 'Student@123',
    user_metadata: {
      name: 'Alex Vance (Student)',
      role: 'student',
      department: 'Computer Science',
    },
  },
];

async function seedUsers() {
  console.log('🌱 Seeding demo users into Supabase Auth...\n');

  for (const u of DEMO_USERS) {
    // Check if user already exists by listing users
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((x) => x.email === u.email);

    if (found) {
      // Update password + metadata in case it changed
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: u.password,
        user_metadata: u.user_metadata,
        email_confirm: true,
      });
      if (error) {
        console.error(`  ⚠️  Could not update ${u.email}:`, error.message);
      } else {
        console.log(`  ✅ Updated (already exists): ${u.email}`);
      }
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        user_metadata: u.user_metadata,
        email_confirm: true, // skip email verification for demo accounts
      });
      if (error) {
        console.error(`  ❌ Failed to create ${u.email}:`, error.message);
      } else {
        console.log(`  ✅ Created: ${u.email}`);
      }
    }
  }

  console.log('\n🎉 Done! You can now log in with:');
  console.log('   Admin  → admin@college.edu   / Admin@123');
  console.log('   Student → student@college.edu / Student@123');
}

seedUsers().catch(console.error);

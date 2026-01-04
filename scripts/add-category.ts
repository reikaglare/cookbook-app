import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};

envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

console.log('Loading env vars manually...');
console.log('URL:', env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('Key:', env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.VITE_SUPABASE_ANON_KEY; // Using anon key since we might not have service role locally, but Row Level Security might block insert if not authed. 
// Actually, for admin tasks usually we need service role, but if RLS allows anon insert (unlikely) or if we sign in.
// Let's assume we can use the anon key if RLS allows it or if we are just adding it. 
// If this fails, I might need to ask the user to insert it manually or provide a service key.
// However, the user is authenticated in the app.
// A better approach for a script is to use the service_role key if available in .env, or try with anon key.

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCategory() {
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'alt.fl-8ygl84f@yopmail.com',
        password: 'AntyGravity'
    });

    if (authError) {
        console.error('Auth failed:', authError.message);
        // Continue anyway, maybe anon works? (Unlikely since we just failed)
    } else {
        console.log('Authenticated as:', authData.session?.user.email);
    }

    const category = {
        name: 'Salse, sughi e condimenti',
        icon: '💧', // Fallback emoji for DB, though we use the component now
        color: '#3b82f6', // blue-500
        display_order: 100 // Put it at the end
    };

    const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();

    if (error) {
        console.error('Error adding category:', error);
    } else {
        console.log('Category added successfully:', data);
    }
}

addCategory();

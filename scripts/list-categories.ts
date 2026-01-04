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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function listCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Categories in DB:');
        data.forEach(c => {
            console.log(`- "${c.name}" (Icon: ${c.icon})`);
        });
    }
}

listCategories();

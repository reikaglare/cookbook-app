import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables! Please check your .env file.');
}

// Create a safe client initialization
const isValidUrl = (url: string) => {
    try { return Boolean(new URL(url)); } catch (e) { return false; }
};

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frsaogezzueyapkecbda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2FvZ2V6enVleWFwa2VjYmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTY4MTMsImV4cCI6MjA3MDg5MjgxM30.4yj790DQWMrgo6Q6Bifvq0PdlH7jCHWuPTTVGJQOklQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
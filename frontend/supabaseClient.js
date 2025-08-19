// Integração básica com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjjbsxqmauhiunkwpqwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamJzeHFtYXVoaXVua3dwcXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTQwNjQsImV4cCI6MjA3MTE5MDA2NH0.w9V9UyMD7VALeheImIaG0zsMkN3ZKG3ITcNQmNDo1-0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Integração básica com Supabase
// Usar CDN UMD do Supabase JS para browser
// Adicione no clientes.html antes do script clientes.js:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js"></script>

const supabaseUrl = 'https://yjjbsxqmauhiunkwpqwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamJzeHFtYXVoaXVua3dwcXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTQwNjQsImV4cCI6MjA3MTE5MDA2NH0.w9V9UyMD7VALeheImIaG0zsMkN3ZKG3ITcNQmNDo1-0';

window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

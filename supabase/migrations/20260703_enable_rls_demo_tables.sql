-- Habilita RLS nas 6 tabelas de demo que estavam totalmente expostas à anon key
-- (alerta do Supabase Security Advisor).
--
-- Modelo de acesso:
--   • SELECT: público (o site exibe esses dados para visitantes)
--   • INSERT/UPDATE/DELETE: apenas usuários autenticados (admins fazem login real
--     no Supabase Auth — admin@fontara.com e arthurdocusign@gmail.com)
--
-- Também restringe a escrita em site_settings (tema) a usuários autenticados.
--
-- Rode no SQL Editor do projeto yjjbsxqmauhiunkwpqwv (ou peça ao Claude para
-- aplicar via MCP com sua aprovação).

do $$
declare
    t text;
begin
    foreach t in array array['clientes','categorias_produtos','produtos','contratos','transacoes','historico_alteracoes']
    loop
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists "%s_select_all" on public.%I', t, t);
        execute format('create policy "%s_select_all" on public.%I for select using (true)', t, t);
        execute format('drop policy if exists "%s_write_authenticated" on public.%I', t, t);
        execute format('create policy "%s_write_authenticated" on public.%I for all to authenticated using (true) with check (true)', t, t);
    end loop;
end $$;

-- Tema do site: leitura continua pública, escrita só autenticada
drop policy if exists "site_settings_write_all" on public.site_settings;
drop policy if exists "site_settings_write_authenticated" on public.site_settings;
create policy "site_settings_write_authenticated"
    on public.site_settings for all
    to authenticated
    using (true)
    with check (true);

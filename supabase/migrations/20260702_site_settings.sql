-- Tabela de configurações do site (tema, etc.)
-- Rode este script no SQL Editor do Supabase do projeto Fontara para que o
-- tema escolhido no /admin/tema valha para TODOS os visitantes.
-- Sem esta tabela, o tema fica salvo apenas no navegador (localStorage).

create table if not exists public.site_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Leitura pública (o tema precisa carregar para visitantes anônimos)
drop policy if exists "site_settings_select_all" on public.site_settings;
create policy "site_settings_select_all"
    on public.site_settings for select
    using (true);

-- Escrita: qualquer sessão autenticada OU anônima (site de demonstração).
-- Se quiser restringir, troque para: using (auth.role() = 'authenticated')
drop policy if exists "site_settings_write_all" on public.site_settings;
create policy "site_settings_write_all"
    on public.site_settings for all
    using (true)
    with check (true);

-- Tema padrão inicial
insert into public.site_settings (key, value)
values ('theme', '{"presetId": "fontara", "colors": {"primary": "#14b8a6", "secondary": "#06b6d4", "accent": "#34d399"}}')
on conflict (key) do nothing;

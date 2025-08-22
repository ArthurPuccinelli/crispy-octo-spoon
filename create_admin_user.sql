-- Script para criar usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar usuário através da interface de autenticação do Supabase
-- Vá para Authentication > Users no painel do Supabase
-- Clique em "Add User" e crie um usuário com:
-- Email: admin@fontara.com
-- Password: admin123

-- 2. Atualizar os metadados do usuário para incluir o role admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'admin@fontara.com';

-- 3. Verificar se a atualização foi feita
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'admin@fontara.com';

-- 4. Alternativa: Criar uma tabela de perfis de usuário (opcional)
-- CREATE TABLE IF NOT EXISTS public.user_profiles (
--   id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--   role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
--   nome_completo TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- 5. Inserir perfil do usuário admin (se usar a tabela de perfis)
-- INSERT INTO public.user_profiles (id, role, nome_completo)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'admin@fontara.com'),
--   'admin',
--   'Administrador Fontara'
-- );

-- 6. Habilitar RLS na tabela de perfis (se usar)
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas para a tabela de perfis (se usar)
-- CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.user_profiles
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Apenas admins podem atualizar perfis" ON public.user_profiles
--   FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- 8. Verificar se tudo está funcionando
-- SELECT 
--   u.email,
--   u.raw_user_meta_data->>'role' as jwt_role,
--   p.role as profile_role
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON u.id = p.id
-- WHERE u.email = 'admin@fontara.com';

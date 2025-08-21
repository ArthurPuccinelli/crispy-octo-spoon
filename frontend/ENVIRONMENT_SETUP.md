# Configuração de Variáveis de Ambiente

## Variáveis Necessárias para o Supabase

Para que a aplicação funcione corretamente tanto em desenvolvimento quanto em produção, as seguintes variáveis de ambiente devem ser configuradas:

### Variáveis Obrigatórias

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

### Configuração no Netlify

1. Acesse o painel do Netlify
2. Vá para **Site settings** > **Environment variables**
3. Adicione as seguintes variáveis:

#### Para Produção:
- `NEXT_PUBLIC_SUPABASE_URL` = URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Chave anônima do seu projeto Supabase

#### Para Deploy Preview:
- `NEXT_PUBLIC_SUPABASE_URL` = URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Chave anônima do seu projeto Supabase

### Como Obter as Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá para **Settings** > **API**
5. Copie:
   - **Project URL** (para `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** (para `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Verificação

Após configurar as variáveis:
1. Faça um novo deploy no Netlify
2. Verifique no console do navegador se não há mais o aviso "Supabase environment variables not found"
3. A aplicação deve funcionar normalmente com acesso ao banco de dados

### Desenvolvimento Local

Para desenvolvimento local, crie um arquivo `.env.local` na pasta `frontend/` com as mesmas variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

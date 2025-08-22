# Deploy no Netlify - Instruções Completas

## 🚀 Configuração das Variáveis de Ambiente

### 1. Acesse o Painel do Netlify
- Faça login em [netlify.com](https://netlify.com)
- Selecione seu site/projeto

### 2. Configure as Variáveis de Ambiente
1. Vá para **Site settings** > **Environment variables**
2. Clique em **Add a variable**
3. Adicione as seguintes variáveis:

#### Para TODOS os contextos (Production, Deploy Preview, Branch Deploy):
```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_anonima_aqui
```

### 3. Como Obter as Credenciais do Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login e selecione seu projeto
3. Vá para **Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔄 Deploy

### Deploy Automático (Recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure o build:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: `frontend`
3. Faça push para a branch principal
4. O Netlify fará deploy automático

### Deploy Manual
1. Execute localmente: `npm run build`
2. Faça upload da pasta `.next` para o Netlify

## ✅ Verificação

### Após o Deploy:
1. Acesse seu site no Netlify
2. Abra o console do navegador (F12)
3. Verifique se NÃO há mais:
   - `⚠️ Supabase environment variables not found`
   - `TypeError: o.O.from(...).select(...).eq is not a function`

### Se ainda houver problemas:
1. Verifique se as variáveis estão configuradas corretamente
2. Faça um novo deploy
3. Limpe o cache do Netlify se necessário

## 🐛 Troubleshooting

### Erro: "Supabase environment variables not found"
- ✅ Verifique se as variáveis estão configuradas no Netlify
- ✅ Verifique se os nomes estão exatamente como especificado
- ✅ Faça um novo deploy após configurar as variáveis

### Erro: "TypeError: o.O.from(...).select(...).eq is not a function"
- ✅ Este erro indica que o cliente mock está sendo usado
- ✅ Configure as variáveis de ambiente no Netlify
- ✅ Faça um novo deploy

### Erro: "Configuring Next.js via 'next.config.ts' is not supported"
- ✅ **RESOLVIDO**: O arquivo `next.config.ts` foi convertido para `next.config.mjs`
- ✅ O Netlify só suporta arquivos `.js` ou `.mjs` para configuração do Next.js
- ✅ **IMPORTANTE**: Agora usando `next.config.mjs` para máxima compatibilidade
- ✅ Faça um novo deploy após a correção

### Erro: "Build failed"
- ✅ Verifique se o comando `npm run build` funciona localmente
- ✅ Verifique se todas as dependências estão no `package.json`
- ✅ Verifique os logs de build no Netlify

## 📞 Suporte

Se ainda houver problemas:
1. Verifique os logs de build no Netlify
2. Teste localmente com `npm run dev`
3. Execute `npm run check-env` para verificar as variáveis
4. Consulte o arquivo `ENVIRONMENT_SETUP.md` no frontend

## 🔧 Correções Recentes

### ✅ Problema do next.config.ts Resolvido
- **Problema**: O Netlify não suporta arquivos de configuração do Next.js em TypeScript
- **Solução**: Convertido para `next.config.mjs` (máxima compatibilidade)
- **Status**: ✅ Resolvido e testado localmente
- **Arquivo atual**: `frontend/next.config.mjs`

### 🔄 Mudança para .mjs
- **Motivo**: Garantir máxima compatibilidade com o Netlify
- **Formato**: ES Modules (mais moderno e compatível)
- **Teste**: ✅ Build local funcionando perfeitamente

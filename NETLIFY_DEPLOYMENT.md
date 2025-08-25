# Deploy no Netlify

## Configuração Atual

O projeto está configurado para fazer deploy no Netlify com as seguintes configurações:

### Estrutura do Projeto
```
crispy-octo-spoon/
├── frontend/          # Aplicação Next.js
├── backend/           # API Node.js (não deployada no Netlify)
└── netlify.toml      # Configuração do Netlify
```

### Configuração do Netlify (`netlify.toml`)

```toml
[build]
  base = "frontend"           # Diretório base para o build
  command = "npm run build"   # Comando de build
  publish = ".next"           # Diretório de publicação

[build.environment]
  NODE_VERSION = "18"         # Versão do Node.js

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Plugin oficial do Next.js

# Redirects para SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

# Headers para cache de arquivos estáticos
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_next/image"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel do Netlify:

### Supabase (Obrigatórias)
- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase

### Opcionais
- `NODE_VERSION` - Versão do Node.js (padrão: 18)

## Passos para Deploy

1. **Conecte o repositório** ao Netlify
2. **Configure as variáveis de ambiente** no painel do Netlify
3. **Deploy automático** será feito a cada push para a branch principal

## Estrutura de Build

O Netlify irá:
1. Navegar para o diretório `frontend/`
2. Executar `npm install` para instalar dependências
3. Executar `npm run build` para fazer o build do Next.js
4. Publicar o conteúdo do diretório `.next/`

## Solução de Problemas

### Erro: "The directory does not contain a Next.js production build"

**Causa:** O Netlify não está encontrando o build do Next.js
**Solução:** Verifique se:
- O diretório base está configurado como `frontend/`
- O comando de build é `npm run build`
- O diretório de publicação é `.next`

### Erro: "Plugin @netlify/plugin-nextjs failed"

**Causa:** Problema com o plugin do Next.js
**Solução:** 
- Verifique se o plugin está instalado no Netlify
- Atualize para a versão mais recente do plugin
- Verifique se o Next.js está na versão 13+

## Notas Importantes

- **Backend não é deployado** no Netlify (apenas o frontend)
- **API Routes** do Next.js funcionam normalmente
- **SSR/SSG** são suportados pelo plugin oficial
- **Imagens otimizadas** do Next.js funcionam com cache configurado

## Comandos Locais para Teste

```bash
# Testar build localmente
cd frontend
npm run build

# Verificar se o diretório .next foi criado
ls -la .next/

# Testar build de produção
npm run start
```



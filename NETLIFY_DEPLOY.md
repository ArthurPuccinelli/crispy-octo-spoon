# Deploy no Netlify - Crispy Octo Spoon

## Visão Geral

Este guia explica como fazer o deploy da aplicação frontend no Netlify, corrigindo os problemas de build comuns.

## Problema Identificado

O erro original no Netlify era:
```
Error: The directory "/opt/build/repo/frontend" does not contain a Next.js production build.
```

## Solução Implementada

### 1. Arquivo de Configuração Principal
- **`netlify.toml`** na raiz do projeto
- **`frontend/netlify.toml`** específico para o frontend

### 2. Script de Build Personalizado
- **`frontend/.netlify/build.sh`** - Script que garante o build correto
- Verificações de dependências e variáveis de ambiente
- Validação do diretório `.next` após o build

### 3. Configuração do Next.js
- **`frontend/next.config.mjs`** otimizado para Netlify
- Configuração `output: 'standalone'`
- Otimizações de performance

## Configuração no Netlify

### 1. Configurações de Build
```
Base directory: frontend
Build command: .netlify/build.sh
Publish directory: .next
```

### 2. Variáveis de Ambiente
Configure as seguintes variáveis no painel do Netlify:

```bash
# Supabase (obrigatórias)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Build (opcionais)
NODE_VERSION=18
NPM_VERSION=9
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. Plugin Next.js
O plugin `@netlify/plugin-nextjs` será instalado automaticamente.

## Estrutura de Arquivos

```
crispy-octo-spoon/
├── netlify.toml                    # Configuração principal
├── frontend/
│   ├── netlify.toml               # Configuração específica
│   ├── .netlify/
│   │   ├── build.sh               # Script de build
│   │   ├── plugins.json           # Configuração de plugins
│   │   └── environment.production # Variáveis de produção
│   ├── next.config.mjs            # Configuração Next.js
│   └── package.json               # Scripts de build
```

## Passos para Deploy

### 1. Preparar o Repositório
```bash
# Certifique-se de que todos os arquivos estão commitados
git add .
git commit -m "Configuração Netlify corrigida"
git push origin main
```

### 2. Conectar ao Netlify
1. Acesse [Netlify](https://app.netlify.com/)
2. Clique em **"New site from Git"**
3. Conecte com seu repositório GitHub
4. Configure as opções de build:
   - **Base directory**: `frontend`
   - **Build command**: `.netlify/build.sh`
   - **Publish directory**: `.next`

### 3. Configurar Variáveis de Ambiente
1. Vá para **Site settings** > **Environment variables**
2. Adicione as variáveis do Supabase
3. Configure outras variáveis conforme necessário

### 4. Fazer Deploy
1. Clique em **"Deploy site"**
2. Aguarde o build completar
3. Verifique os logs para identificar possíveis problemas

## Troubleshooting

### Problema: Build Falha
```bash
# Verificar logs do build
# Verificar se o script de build tem permissão de execução
chmod +x frontend/.netlify/build.sh
```

### Problema: Plugin Next.js Falha
```bash
# Verificar se o diretório .next foi criado
# Verificar se o publish directory está correto
# Verificar se as variáveis de ambiente estão configuradas
```

### Problema: Variáveis de Ambiente Não Carregadas
```bash
# Verificar se as variáveis estão configuradas no Netlify
# Verificar se os nomes estão corretos (NEXT_PUBLIC_*)
# Verificar se o build está sendo feito no diretório correto
```

## Testes Locais

### 1. Testar Build Localmente
```bash
cd frontend
npm run build:netlify
```

### 2. Testar Script de Build
```bash
cd frontend
./.netlify/build.sh
```

### 3. Verificar Diretório .next
```bash
ls -la frontend/.next/
```

## Otimizações

### 1. Cache
- Assets estáticos com cache longo
- Páginas HTML sem cache
- Imagens e fontes otimizadas

### 2. Headers de Segurança
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

### 3. Performance
- Compressão habilitada
- Bundle e minificação
- Otimização de imagens

## Monitoramento

### 1. Logs de Build
- Acesse **Deploys** > **Build logs**
- Monitore erros e avisos
- Verifique tempo de build

### 2. Métricas de Performance
- Lighthouse scores
- Core Web Vitals
- Tempo de carregamento

### 3. Status do Site
- Uptime
- Tempo de resposta
- Erros 4xx/5xx

## Próximos Passos

### 1. Implementações Imediatas
- [ ] Configurar domínio personalizado
- [ ] Configurar HTTPS
- [ ] Configurar CDN

### 2. Melhorias de Performance
- [ ] Implementar PWA
- [ ] Otimizar imagens
- [ ] Implementar lazy loading

### 3. Funcionalidades Avançadas
- [ ] Configurar webhooks
- [ ] Implementar A/B testing
- [ ] Configurar analytics

## Suporte

### Documentação
- [Netlify Docs](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Build Configuration](https://docs.netlify.com/configure-build/overview/)

### Comunidade
- [Netlify Community](https://community.netlify.com/)
- [GitHub Issues](https://github.com/netlify/build-image/issues)

### Contato
- **Netlify Support**: https://www.netlify.com/support/
- **Status**: https://www.netlifystatus.com/

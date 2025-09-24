# Guia de Variáveis de Ambiente para Desenvolvimento Local

Este documento explica todas as variáveis de ambiente necessárias para executar o projeto localmente sem impactar a produção.

## 📋 Resumo das Variáveis

### 🔴 OBRIGATÓRIAS (funcionalidades básicas)
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_URL` - URL do Supabase para funções Netlify
- `SUPABASE_ANON_KEY` - Chave anônima para funções Netlify

### 🟡 OPCIONAIS (funcionalidades específicas)
- Todas as variáveis do DocuSign (apenas se testar integração)
- Configurações de logging e cache
- Configurações de segurança

## 🚀 Configuração Rápida

1. **Copie o template:**
   ```bash
   cd frontend
   cp env.local.template .env.local
   ```

2. **Configure as variáveis obrigatórias:**
   - Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
   - Vá em Settings > API
   - Copie a URL e a chave anônima
   - Cole nos campos correspondentes no `.env.local`

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

## 📝 Detalhamento das Variáveis

### Supabase (Obrigatório)
```env
# Frontend Next.js
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Funções Netlify (usar os mesmos valores)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### DocuSign (Opcional)
```env
# Configurações básicas
DOCUSIGN_ACCOUNT_ID=12345678-1234-1234-1234-123456789012
DOCUSIGN_USER_ID=12345678-1234-1234-1234-123456789012
DOCUSIGN_IK=12345678-1234-1234-1234-123456789012

# Chave privada (escolha uma das opções)
DOCUSIGN_RSA_PEM_AS_BASE64=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
# OU
DOCUSIGN_RSA_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...

# Configurações de ambiente
DOCUSIGN_AUTH_SERVER=account-d.docusign.com
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_IAM_SCOPES=signature,impersonation,aow_manage
DOCUSIGN_MAESTRO_BASE_URL=https://api-d.docusign.net/maestro/v1
```

### Desenvolvimento
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Logging (Opcional)
```env
LOG_LEVEL=debug
ENABLE_AUDIT_LOG=true
LOG_DOCUSIGN_REQUESTS=true
ENABLE_QUERY_LOG=true
```

### Segurança (Opcional)
```env
ENABLE_RATE_LIMITING=false
MAX_REQUESTS_PER_MINUTE=1000
ENABLE_CORS=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://*.netlify.app
```

### Cache (Opcional)
```env
ENABLE_CACHE=false
CACHE_TTL=300
```

## 🧪 Cenários de Teste

### Teste Básico (apenas Supabase)
- Configure apenas as variáveis do Supabase
- Teste funcionalidades de clientes, produtos e serviços
- Não testa integração DocuSign

### Teste Completo (Supabase + DocuSign)
- Configure todas as variáveis
- Teste todas as funcionalidades incluindo assinatura de documentos
- Requer configuração completa do DocuSign

### Teste de Desenvolvimento
- Use `LOG_LEVEL=debug` para logs detalhados
- Desabilite rate limiting para desenvolvimento
- Configure CORS para localhost

## 🔒 Segurança

- **NUNCA** commite o arquivo `.env.local`
- Use valores de desenvolvimento/teste para DocuSign
- Mantenha as chaves privadas seguras
- Use diferentes contas para desenvolvimento e produção

## 🐛 Troubleshooting

### Erro: "Supabase environment variables not found"
- Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_*` estão configuradas
- Certifique-se de que o arquivo `.env.local` está na pasta `frontend/`

### Erro: "DocuSign environment variables missing"
- Configure as variáveis do DocuSign ou remova a funcionalidade
- Verifique se a chave privada está no formato correto

### Erro de CORS
- Adicione `http://localhost:3000` ao `ALLOWED_ORIGINS`
- Verifique se `ENABLE_CORS=true`

## 📚 Referências

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do DocuSign](https://developers.docusign.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

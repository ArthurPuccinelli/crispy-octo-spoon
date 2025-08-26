# 🚀 Netlify Functions - Crispy Octo Spoon API

Este diretório contém as funções serverless do Netlify que substituem o backend tradicional.

## 📁 Estrutura

```
.netlify/functions/
├── api.js                 # Função principal da API
├── routes/                # Rotas da API
│   └── docusign.js       # Rotas do DocuSign
├── services/              # Serviços da aplicação
│   └── docusignService.js # Serviço DocuSign
├── config/                # Configurações
│   └── docusign.js       # Configuração DocuSign
├── package.json           # Dependências das funções
└── env.example           # Exemplo de variáveis de ambiente
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Netlify:

```bash
# DocuSign
DOCUSIGN_API_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_USER_ID=your_user_id
DOCUSIGN_INTEGRATION_KEY=your_integration_key
DOCUSIGN_RSA_PRIVATE_KEY=your_rsa_private_key

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true

# Segurança
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=100
```

### 2. Instalação de Dependências

```bash
cd frontend/.netlify/functions
npm install
```

## 🌐 Endpoints Disponíveis

### Base URL
- **Produção**: `https://your-site.netlify.app/.netlify/functions/api`
- **Desenvolvimento**: `http://localhost:8888/.netlify/functions/api`

### Rotas

#### DocuSign
- `GET /api/docusign/clientes` - Listar clientes
- `GET /api/docusign/clientes/:id` - Buscar cliente por ID
- `POST /api/docusign/clientes` - Criar cliente
- `PUT /api/docusign/clientes/:id` - Atualizar cliente
- `DELETE /api/docusign/clientes/:id` - Deletar cliente
- `GET /api/docusign/produtos` - Listar produtos
- `POST /api/docusign/produtos` - Criar produto
- `GET /api/docusign/servicos` - Listar serviços
- `POST /api/docusign/servicos` - Criar serviço

#### Sistema
- `GET /api/` - Status da API
- `GET /api/health` - Health check

## 🧪 Desenvolvimento Local

### 1. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Executar em modo de desenvolvimento
```bash
cd frontend
netlify dev
```

### 3. Testar endpoints
```bash
# Health check
curl http://localhost:8888/.netlify/functions/api/health

# Listar clientes (com autenticação)
curl -H "Authorization: Bearer your_token" \
     http://localhost:8888/.netlify/functions/api/docusign/clientes
```

## 🚀 Deploy

### Deploy Automático
O deploy é feito automaticamente quando você faz push para o branch principal.

### Deploy Manual
```bash
cd frontend
netlify deploy --prod
```

## 📊 Monitoramento

- **Logs**: Acesse os logs no painel do Netlify
- **Funções**: Monitore o uso das funções no painel do Netlify
- **Performance**: Use o Netlify Analytics para métricas de performance

## 🔒 Segurança

- CORS configurado para origens permitidas
- Autenticação via Bearer token
- Rate limiting configurável
- Headers de segurança via Helmet

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se o arquivo `api.js` existe
- Confirme se o `netlify.toml` está configurado corretamente

### Erro: "Module not found"
- Execute `npm install` no diretório das funções
- Verifique se todas as dependências estão no `package.json`

### Erro: "Environment variables not found"
- Configure as variáveis no painel do Netlify
- Verifique se o arquivo `.env` está sendo carregado corretamente

## 📚 Recursos Adicionais

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Express.js](https://expressjs.com/)
- [DocuSign API](https://developers.docusign.com/)

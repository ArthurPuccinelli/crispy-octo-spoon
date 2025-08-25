# Integração DocuSign Extension App Data IO

## Visão Geral

Esta integração permite que o DocuSign acesse e gerencie dados de clientes através do Extension App Data IO. O sistema suporta operações de leitura, escrita e consulta personalizada para a entidade "cliente".

## Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DocuSign      │    │   Extension App  │    │   Crispy Octo   │
│   Data IO       │◄──►│   Manifest       │◄──►│   Spoon API     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Componentes

### 1. Manifest do Extension App
- **Arquivo**: `docusign-extension-app-manifest.json`
- **Função**: Define as capacidades, modelo de dados e ações disponíveis
- **Entidades**: Cliente com campos validados e tipados

### 2. API Backend
- **Rotas**: `/api/docusign/*`
- **Autenticação**: Bearer Token
- **Operações**: CRUD para clientes
- **Validação**: Dados e tipos

### 3. Serviço DocuSign
- **Arquivo**: `backend/src/services/docusignService.js`
- **Função**: Gerenciar operações com DocuSign
- **Recursos**: JWT, validação, auditoria

## Configuração

### Variáveis de Ambiente

Copie o arquivo `backend/env.docusign.example` para `backend/.env` e configure:

```bash
# Configurações obrigatórias
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_USER_ID=your_user_id
DOCUSIGN_INTEGRATION_KEY=your_integration_key

# Configurações opcionais
DOCUSIGN_API_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_PATH=account-d.docusign.com
NODE_ENV=development
```

### Instalação de Dependências

```bash
cd backend
npm install
```

## Endpoints da API

### Autenticação
```
POST /api/docusign/auth/token
```

### Clientes

#### Listar Clientes
```
GET /api/docusign/clientes?limit=100&offset=0&status=ativo&tipo_cliente=pessoa_fisica
```

#### Buscar Cliente por ID
```
GET /api/docusign/clientes/:id
```

#### Criar Cliente
```
POST /api/docusign/clientes
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "tipo_cliente": "pessoa_fisica",
  "status": "ativo"
}
```

#### Atualizar Cliente
```
PUT /api/docusign/clientes/:id
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com"
}
```

#### Busca Avançada
```
POST /api/docusign/clientes/search
Content-Type: application/json

{
  "query": "João",
  "filters": {
    "status": "ativo",
    "cidade": "São Paulo"
  },
  "limit": 50,
  "offset": 0
}
```

## Modelo de Dados

### Entidade: Cliente

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | ✅ | Identificador único |
| nome | string | ✅ | Nome completo |
| email | string | ✅ | Email válido |
| cpf_cnpj | string | ❌ | CPF ou CNPJ |
| telefone | string | ❌ | Número de telefone |
| cidade | string | ❌ | Cidade |
| estado | string | ❌ | Estado (UF) |
| tipo_cliente | enum | ✅ | pessoa_fisica ou pessoa_juridica |
| status | enum | ✅ | ativo, inativo ou suspenso |
| created_at | datetime | ✅ | Data de criação |
| updated_at | datetime | ✅ | Data de atualização |

## Operações Suportadas

### ✅ Leitura (Read)
- Listar todos os clientes
- Buscar cliente por ID
- Filtros por status e tipo
- Paginação configurável

### ✅ Escrita (Write)
- Criar novo cliente
- Atualizar cliente existente
- Validação de dados
- Logs de auditoria

### ✅ Consulta (Query)
- Busca por texto
- Filtros avançados
- Ordenação personalizada
- Resultados paginados

### ❌ Exclusão (Delete)
- Não suportado por segurança

## Segurança

### Autenticação
- Bearer Token obrigatório
- Validação de origem (CORS)
- Rate limiting configurável

### Validação
- Campos obrigatórios
- Tipos de dados
- Formato de email
- Valores enum válidos

### Auditoria
- Log de todas as operações
- Timestamp e usuário
- Dados de entrada e saída

## Desenvolvimento

### Estrutura de Arquivos
```
backend/
├── src/
│   ├── routes/
│   │   └── docusign.js          # Rotas da API
│   ├── services/
│   │   └── docusignService.js   # Lógica de negócio
│   ├── config/
│   │   └── docusign.js          # Configurações
│   └── server.js                # Servidor principal
├── docusign-extension-app-manifest.json
└── env.docusign.example
```

### Executar em Desenvolvimento

```bash
cd backend
npm run dev
```

### Testar Endpoints

```bash
# Testar autenticação
curl -X POST http://localhost:3001/api/docusign/auth/token

# Testar listagem de clientes
curl -H "Authorization: Bearer mock_token" \
     http://localhost:3001/api/docusign/clientes

# Testar criação de cliente
curl -X POST \
     -H "Authorization: Bearer mock_token" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Teste","email":"teste@exemplo.com","tipo_cliente":"pessoa_fisica"}' \
     http://localhost:3001/api/docusign/clientes
```

## Próximos Passos

### Implementações Pendentes
1. **Autenticação Real**: Integrar com OAuth2/JWT do DocuSign
2. **Banco de Dados**: Conectar com Supabase/PostgreSQL
3. **Validação Avançada**: CPF/CNPJ, telefone, CEP
4. **Webhooks**: Notificações em tempo real
5. **Cache**: Redis para performance
6. **Métricas**: Monitoramento e alertas

### Melhorias de Segurança
1. **Rate Limiting**: Por usuário/IP
2. **Auditoria**: Banco de dados persistente
3. **Criptografia**: Dados sensíveis
4. **Validação**: Sanitização de entrada

### Funcionalidades Adicionais
1. **Sincronização**: Bidirecional com DocuSign
2. **Relatórios**: Exportação de dados
3. **Notificações**: Email/SMS automático
4. **Dashboard**: Interface administrativa

## Suporte

### Documentação DocuSign
- [Extension Apps 101](https://developers.docusign.com/extension-apps/extension-apps-101/)
- [Data IO Reference](https://developers.docusign.com/extension-apps/extension-app-reference/extension-contracts/data-io/)
- [Manifest Reference](https://developers.docusign.com/extension-apps/extension-app-reference/app-manifest-reference/)

### Logs e Debug
```bash
# Verificar logs do servidor
tail -f backend/logs/server.log

# Verificar configurações
node -e "console.log(require('./backend/src/config/docusign').config)"
```

### Troubleshooting

#### Erro de CORS
```bash
# Verificar configuração CORS
echo $CORS_ALLOWED_ORIGINS
```

#### Erro de Autenticação
```bash
# Verificar token
curl -H "Authorization: Bearer INVALID_TOKEN" \
     http://localhost:3001/api/docusign/clientes
```

#### Erro de Validação
```bash
# Verificar dados enviados
curl -X POST \
     -H "Authorization: Bearer mock_token" \
     -H "Content-Type: application/json" \
     -d '{"nome":"","email":"invalid-email"}' \
     http://localhost:3001/api/docusign/clientes
```

## Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

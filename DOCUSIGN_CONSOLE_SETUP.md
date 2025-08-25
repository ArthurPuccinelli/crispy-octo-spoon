# Configuração do Extension App no Console DocuSign

## Visão Geral

Este guia explica como configurar o Extension App "Crispy Octo Spoon - Clientes Data IO" no console de desenvolvedores do DocuSign.

## Pré-requisitos

1. Conta DocuSign Developer ativa
2. Access Token válido
3. Permissões de administrador na conta
4. Manifest do Extension App configurado

## Passo a Passo

### 1. Acessar o Console DocuSign

1. Acesse [DocuSign Developer Center](https://developers.docusign.com/)
2. Faça login com suas credenciais
3. Navegue para **Extension Apps** no menu lateral

### 2. Criar Novo Extension App

1. Clique em **"Create Extension App"**
2. Selecione o tipo **"Data IO"**
3. Preencha as informações básicas:
   - **Name**: `Crispy Octo Spoon - Clientes Data IO`
   - **Description**: `Gerenciamento de dados de clientes`
   - **Version**: `1.0.0`

### 3. Configurar Manifest

1. Na seção **"App Manifest"**, clique em **"Upload Manifest"**
2. Selecione o arquivo `docusign-extension-app-manifest.json`
3. Verifique se não há erros de validação
4. Clique em **"Save"**

### 4. Configurar Conexões

1. Na seção **"Connections"**, clique em **"Add Connection"**
2. Configure a conexão API:
   - **Name**: `api-connection`
   - **Type**: `API`
   - **Base URL**: `https://yourdomain.com` (ou `http://localhost:3001` para desenvolvimento)
   - **Authentication**: `Bearer Token`
   - **Token URL**: `https://yourdomain.com/api/docusign/auth/token`

### 5. Configurar Entidades

1. Na seção **"Data Model"**, verifique se a entidade **"cliente"** foi carregada
2. Confirme os campos e tipos:
   - `id` (string, primary key)
   - `nome` (string, required)
   - `email` (string, required, email validation)
   - `cpf_cnpj` (string, optional)
   - `telefone` (string, optional)
   - `cidade` (string, optional)
   - `estado` (string, optional)
   - `tipo_cliente` (enum: pessoa_fisica, pessoa_juridica)
   - `status` (enum: ativo, inativo, suspenso)
   - `created_at` (datetime)
   - `updated_at` (datetime)

### 6. Configurar Ações

1. Na seção **"Actions"**, verifique as ações disponíveis:
   - `read-clientes` - Listar clientes
   - `read-cliente-by-id` - Buscar cliente específico
   - `create-cliente` - Criar novo cliente
   - `update-cliente` - Atualizar cliente existente

### 7. Configurar Permissões

1. Na seção **"Permissions"**, confirme:
   - `data:read` - Para operações de leitura
   - `data:write` - Para operações de escrita

### 8. Configurar Configurações

1. Na seção **"Settings"**, configure:
   - **API Base URL**: URL da sua API
   - **Max Records Per Request**: `100`
   - **Timeout**: `30000` (30 segundos)

### 9. Testar Conexão

1. Clique em **"Test Connection"**
2. Verifique se a conexão está funcionando
3. Teste os endpoints:
   - `GET /api/docusign/clientes`
   - `POST /api/docusign/auth/token`

### 10. Publicar Extension App

1. Após todos os testes passarem, clique em **"Publish"**
2. Aguarde a aprovação do DocuSign
3. Anote o **Extension App ID** gerado

## Configurações de Produção

### Variáveis de Ambiente

```bash
# Produção
DOCUSIGN_API_BASE_URL=https://www.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_PATH=account.docusign.com

# Desenvolvimento
DOCUSIGN_API_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_PATH=account-d.docusign.com
```

### URLs de Produção

```bash
# Substitua no manifest
"baseUrl": "https://yourdomain.com"
"tokenUrl": "https://yourdomain.com/api/docusign/auth/token"
"endpoints": {
  "read": "https://yourdomain.com/api/docusign/clientes",
  "write": "https://yourdomain.com/api/docusign/clientes",
  "query": "https://yourdomain.com/api/docusign/clientes/search"
}
```

## Testando a Integração

### 1. Teste Básico

```bash
# Verificar se o Extension App está ativo
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://yourdomain.com/api/docusign/clientes
```

### 2. Teste de Criação

```bash
# Criar cliente via DocuSign
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Teste DocuSign","email":"teste@docusign.com","tipo_cliente":"pessoa_fisica"}' \
     https://yourdomain.com/api/docusign/clientes
```

### 3. Teste de Busca

```bash
# Buscar clientes
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query":"Teste","filters":{"status":"ativo"}}' \
     https://yourdomain.com/api/docusign/clientes/search
```

## Monitoramento e Logs

### 1. Logs do Extension App

- Acesse o console DocuSign
- Vá para **"Logs"** na seção do Extension App
- Monitore requisições e erros

### 2. Logs da API

```bash
# Verificar logs do servidor
tail -f backend/logs/server.log

# Verificar logs específicos do DocuSign
grep "DOCUSIGN" backend/logs/server.log
```

### 3. Métricas

- **Taxa de sucesso**: Requisições bem-sucedidas
- **Tempo de resposta**: Performance da API
- **Erros**: Tipos e frequência de falhas

## Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```
Access to fetch at 'https://yourdomain.com' from origin 'https://app.docusign.com' has been blocked by CORS policy
```

**Solução**: Configure CORS para permitir `https://app.docusign.com`

#### 2. Erro de Autenticação
```
401 Unauthorized: Invalid token
```

**Solução**: Verifique se o token está sendo gerado corretamente

#### 3. Erro de Validação
```
400 Bad Request: Validation failed
```

**Solução**: Verifique os dados enviados pelo DocuSign

#### 4. Timeout
```
Request timeout after 30 seconds
```

**Solução**: Otimize a performance da API ou aumente o timeout

### Logs de Debug

```bash
# Habilitar logs detalhados
LOG_LEVEL=debug
LOG_DOCUSIGN_REQUESTS=true

# Verificar configurações
node -e "console.log(require('./backend/src/config/docusign').config)"
```

## Próximos Passos

### 1. Implementações Imediatas
- [ ] Autenticação real com OAuth2/JWT
- [ ] Conexão com banco de dados
- [ ] Validação avançada de dados
- [ ] Logs de auditoria persistentes

### 2. Melhorias de Performance
- [ ] Cache Redis
- [ ] Paginação otimizada
- [ ] Compressão de resposta
- [ ] Rate limiting inteligente

### 3. Funcionalidades Avançadas
- [ ] Webhooks para sincronização
- [ ] Relatórios e exportação
- [ ] Dashboard administrativo
- [ ] Notificações automáticas

## Suporte

### Documentação DocuSign
- [Extension Apps Guide](https://developers.docusign.com/extension-apps/)
- [Data IO Reference](https://developers.docusign.com/extension-apps/extension-app-reference/extension-contracts/data-io/)
- [API Reference](https://developers.docusign.com/rest-api/)

### Comunidade
- [DocuSign Developer Community](https://community.docusign.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/docusign)
- [GitHub Issues](https://github.com/your-repo/issues)

### Contato
- **Email**: suporte@yourdomain.com
- **Documentação**: https://docs.yourdomain.com
- **Status**: https://status.yourdomain.com

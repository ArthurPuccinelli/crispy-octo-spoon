# 🍜 API de Clientes - Crispy Octo Spoon

API RESTful para gestão de clientes, compatível com **DocuSign Extension App Data IO**.

## 🔗 Endpoints Base

- **Base URL**: `/api/clientes`
- **Autenticação**: Bearer Token (DocuSign)
- **Formato**: JSON

## 🔐 Autenticação

Todas as requisições devem incluir o header de autorização:

```http
Authorization: Bearer <seu_token_docusign>
```

## 📋 Endpoints Disponíveis

### 1. Listar Clientes

**GET** `/api/clientes`

Lista todos os clientes com paginação e filtros.

#### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `limit` | number | ❌ | Limite de registros (padrão: 50, máximo: 100) |
| `offset` | number | ❌ | Offset para paginação (padrão: 0) |
| `status` | string | ❌ | Filtrar por status: `ativo`, `inativo`, `suspenso` |
| `tipo_cliente` | string | ❌ | Filtrar por tipo: `pessoa_fisica`, `pessoa_juridica` |
| `cidade` | string | ❌ | Filtrar por cidade (busca parcial) |
| `estado` | string | ❌ | Filtrar por estado (exato) |
| `search` | string | ❌ | Busca por nome, email ou CPF/CNPJ |

#### Exemplo de Requisição

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes?limit=20&status=ativo&tipo_cliente=pessoa_fisica" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-do-cliente",
      "nome": "João Silva",
      "email": "joao@email.com",
      "cpf_cnpj": "123.456.789-00",
      "telefone": "(11) 99999-9999",
      "cidade": "São Paulo",
      "estado": "SP",
      "tipo_cliente": "pessoa_fisica",
      "status": "ativo",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "page": 1,
    "totalPages": 8
  },
  "metadata": {
    "entity": "cliente",
    "operation": "read",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Buscar Cliente por ID

**GET** `/api/clientes/:id`

Busca um cliente específico pelo ID.

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Exemplo de Requisição

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/uuid-do-cliente" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-cliente",
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf_cnpj": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "cidade": "São Paulo",
    "estado": "SP",
    "tipo_cliente": "pessoa_fisica",
    "status": "ativo",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "entity": "cliente",
    "operation": "read_by_id",
    "id": "uuid-do-cliente",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Criar Cliente

**POST** `/api/clientes`

Cria um novo cliente.

#### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome completo do cliente |
| `cpf_cnpj` | string | CPF ou CNPJ do cliente |
| `tipo_cliente` | string | `pessoa_fisica` ou `pessoa_juridica` |

#### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | string | Email do cliente |
| `telefone` | string | Telefone do cliente |
| `cidade` | string | Cidade do cliente |
| `estado` | string | Estado do cliente |
| `status` | string | Status inicial (padrão: `ativo`) |

#### Exemplo de Requisição

```bash
curl -X POST "https://seu-dominio.netlify.app/.netlify/functions/api/clientes" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "cpf_cnpj": "987.654.321-00",
    "tipo_cliente": "pessoa_fisica",
    "email": "maria@email.com",
    "telefone": "(11) 88888-8888",
    "cidade": "Rio de Janeiro",
    "estado": "RJ"
  }'
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": "novo-uuid-gerado",
    "nome": "Maria Santos",
    "cpf_cnpj": "987.654.321-00",
    "tipo_cliente": "pessoa_fisica",
    "email": "maria@email.com",
    "telefone": "(11) 88888-8888",
    "cidade": "Rio de Janeiro",
    "estado": "RJ",
    "status": "ativo",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Cliente criado com sucesso",
  "metadata": {
    "entity": "cliente",
    "operation": "create",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Atualizar Cliente

**PUT** `/api/clientes/:id`

Atualiza um cliente existente.

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Campos da Requisição

Mesmos campos da criação, mas apenas os que deseja atualizar.

#### Exemplo de Requisição

```bash
curl -X PUT "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/uuid-do-cliente" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(11) 77777-7777",
    "cidade": "Belo Horizonte",
    "estado": "MG"
  }'
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-cliente",
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf_cnpj": "123.456.789-00",
    "telefone": "(11) 77777-7777",
    "cidade": "Belo Horizonte",
    "estado": "MG",
    "tipo_cliente": "pessoa_fisica",
    "status": "ativo",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Cliente atualizado com sucesso",
  "metadata": {
    "entity": "cliente",
    "operation": "update",
    "id": "uuid-do-cliente",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Remover Cliente

**DELETE** `/api/clientes/:id`

Remove um cliente (soft delete - marca como inativo).

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Exemplo de Requisição

```bash
curl -X DELETE "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/uuid-do-cliente" \
  -H "Authorization: Bearer seu_token_aqui"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-cliente",
    "nome": "João Silva",
    "status": "inativo",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Cliente removido com sucesso",
  "metadata": {
    "entity": "cliente",
    "operation": "delete",
    "id": "uuid-do-cliente",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Estatísticas dos Clientes

**GET** `/api/clientes/stats/estatisticas`

Obtém estatísticas gerais dos clientes.

#### Exemplo de Requisição

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/stats/estatisticas" \
  -H "Authorization: Bearer seu_token_aqui"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "total": 150,
    "porStatus": {
      "ativo": 120,
      "inativo": 25,
      "suspenso": 5
    },
    "porTipo": {
      "pessoa_fisica": 100,
      "pessoa_juridica": 50
    },
    "porEstado": {
      "SP": 80,
      "RJ": 30,
      "MG": 25,
      "RS": 15
    },
    "porCidade": {
      "São Paulo": 50,
      "Rio de Janeiro": 20,
      "Belo Horizonte": 15
    }
  },
  "metadata": {
    "entity": "cliente",
    "operation": "statistics",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 7. Busca Avançada

**GET** `/api/clientes/search/buscar`

Busca clientes por texto com filtros adicionais.

#### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `q` | string | ✅ | Texto para busca (nome, email, CPF/CNPJ) |
| `limit` | number | ❌ | Limite de registros (padrão: 50, máximo: 100) |
| `offset` | number | ❌ | Offset para paginação (padrão: 0) |
| `status` | string | ❌ | Filtrar por status |
| `tipo_cliente` | string | ❌ | Filtrar por tipo |
| `cidade` | string | ❌ | Filtrar por cidade |
| `estado` | string | ❌ | Filtrar por estado |

#### Exemplo de Requisição

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/search/buscar?q=João&status=ativo&limit=10" \
  -H "Authorization: Bearer seu_token_aqui"
```

## 🔍 Códigos de Erro

### Códigos HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Bad Request - Dados inválidos |
| `401` | Unauthorized - Token inválido |
| `404` | Not Found - Cliente não encontrado |
| `500` | Internal Server Error - Erro interno |

### Códigos de Erro Específicos

| Código | Descrição |
|--------|-----------|
| `AUTH_REQUIRED` | Token de autenticação necessário |
| `INVALID_TOKEN` | Token inválido |
| `MISSING_REQUIRED_FIELDS` | Campos obrigatórios ausentes |
| `INVALID_TIPO_CLIENTE` | Tipo de cliente inválido |
| `VALIDATION_ERROR` | Erro de validação dos dados |
| `CLIENTE_NOT_FOUND` | Cliente não encontrado |
| `MISSING_CLIENTE_ID` | ID do cliente ausente |
| `MISSING_SEARCH_QUERY` | Query de busca ausente |

## 📊 Estrutura de Resposta Padrão

Todas as respostas seguem o padrão DocuSign Data IO:

```json
{
  "success": boolean,
  "data": any,
  "message": "string (opcional)",
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean,
    "page": number,
    "totalPages": number
  },
  "metadata": {
    "entity": "cliente",
    "operation": "string",
    "id": "string (opcional)",
    "timestamp": "ISO 8601"
  }
}
```

## 🔧 Validações

### Campos Obrigatórios

- **nome**: String não vazia
- **cpf_cnpj**: CPF (11 dígitos) ou CNPJ (14 dígitos) válido
- **tipo_cliente**: `pessoa_fisica` ou `pessoa_juridica`

### Validações de Formato

- **email**: Formato de email válido (se fornecido)
- **cpf_cnpj**: Formato válido de CPF ou CNPJ
- **status**: `ativo`, `inativo` ou `suspenso`
- **estado**: Sigla de estado brasileiro válida

### Validações de Negócio

- **CPF/CNPJ único**: Não permite duplicatas
- **Soft Delete**: Remoção apenas marca como inativo
- **Timestamps**: Criação e atualização automáticas

## 🚀 Compatibilidade com DocuSign Data IO

Esta API é totalmente compatível com o contrato do **DocuSign Extension App Data IO**:

- ✅ **Formato de resposta** padronizado
- ✅ **Paginação** implementada
- ✅ **Filtros** suportados
- ✅ **Validações** robustas
- ✅ **Logs de auditoria** incluídos
- ✅ **Tratamento de erros** padronizado
- ✅ **Metadados** completos

## 📝 Exemplos de Uso

### Listar Clientes Ativos

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes?status=ativo&limit=100" \
  -H "Authorization: Bearer seu_token_aqui"
```

### Buscar Cliente por CPF

```bash
curl -X GET "https://seu-dominio.netlify.app/.netlify/functions/api/clientes/search/buscar?q=123.456.789-00" \
  -H "Authorization: Bearer seu_token_aqui"
```

### Criar Cliente Pessoa Jurídica

```bash
curl -X POST "https://seu-dominio.netlify.app/.netlify/functions/api/clientes" \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Empresa XYZ Ltda",
    "cpf_cnpj": "12.345.678/0001-90",
    "tipo_cliente": "pessoa_juridica",
    "email": "contato@empresa.com",
    "cidade": "São Paulo",
    "estado": "SP"
  }'
```

## 🔒 Segurança

- **Autenticação**: Bearer Token obrigatório
- **Validação**: Dados validados antes do processamento
- **Logs**: Auditoria de todas as operações
- **Rate Limiting**: Configurável via variáveis de ambiente
- **CORS**: Configurado para origens permitidas

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs da função no Netlify
2. Confirme as variáveis de ambiente
3. Valide o formato dos dados enviados
4. Verifique a autenticação DocuSign

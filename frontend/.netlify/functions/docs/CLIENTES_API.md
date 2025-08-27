# 🍜 API de Clientes - Crispy Octo Spoon

API RESTful para gestão de clientes, compatível com **DocuSign Extension App Data IO**.

> Nota: Estas APIs estão implantadas em Netlify Functions. Para a documentação específica das rotas atuais em produção (clientes-simple) consulte também: `CLIENTES_API_NETLIFY.md`.

## 🔗 Endpoints Base

- **Base URL (produção)**: `https://crispy-octo-spoon.netlify.app/.netlify/functions`
- **Prefixo atual**: `clientes-simple`
- **Autenticação**: Bearer Token (DocuSign)
- **Formato**: JSON

## 🔐 Autenticação

Todas as requisições devem incluir o header de autorização:

```http
Authorization: Bearer <seu_token_docusign>
```

## 📋 Endpoints Disponíveis

### 1. Listar Clientes

**GET** `/.netlify/functions/clientes-simple`

Lista todos os clientes com paginação e filtros.

#### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `limit` | number | ❌ | Limite de registros (padrão: 10) |
| `offset` | number | ❌ | Offset para paginação (padrão: 0) |

#### Exemplo de Requisição

```bash
curl -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple?limit=10&offset=0" \
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
    "total": 3,
    "limit": 10,
    "offset": 0,
    "hasMore": false,
    "page": 1,
    "totalPages": 1
  },
  "metadata": {
    "entity": "cliente",
    "operation": "read",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Buscar Cliente por ID

**GET** `/.netlify/functions/clientes-simple/:id`

Busca um cliente específico pelo ID.

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Exemplo de Requisição

```bash
curl -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/uuid-do-cliente" \
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

**POST** `/.netlify/functions/clientes-simple`

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
curl -X POST "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple" \
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

**PUT** `/.netlify/functions/clientes-simple/:id`

Atualiza um cliente existente.

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Campos da Requisição

Mesmos campos da criação, mas apenas os que deseja atualizar.

#### Exemplo de Requisição

```bash
curl -X PUT "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/uuid-do-cliente" \
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
    "telefone": "(11) 77777-7777",
    "cidade": "Belo Horizonte",
    "estado": "MG"
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

**DELETE** `/.netlify/functions/clientes-simple/:id`

Remove um cliente (soft delete - marca como inativo).

#### Parâmetros de Path

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `id` | string | ✅ | UUID do cliente |

#### Exemplo de Requisição

```bash
curl -X DELETE "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/uuid-do-cliente" \
  -H "Authorization: Bearer seu_token_aqui"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": { "id": "uuid-do-cliente" },
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

**GET** `/.netlify/functions/clientes-simple/stats/estatisticas`

Obtém estatísticas gerais dos clientes.

#### Exemplo de Requisição

```bash
curl -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/stats/estatisticas" \
  -H "Authorization: Bearer seu_token_aqui"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "total": 3,
    "porStatus": { "ativo": 3 },
    "porTipo": { "pessoa_fisica": 2, "pessoa_juridica": 1 },
    "porEstado": { "SP": 2, "RJ": 1 },
    "porCidade": { "São Paulo": 1, "Campinas": 1, "Rio de Janeiro": 1 }
  },
  "metadata": {
    "entity": "cliente",
    "operation": "statistics",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 7. Busca Avançada

**GET** `/.netlify/functions/clientes-simple/search/buscar`

Busca clientes por texto com paginação.

#### Parâmetros de Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|------------|------|-------------|-----------|
| `q` | string | ✅ | Texto para busca (nome, email, CPF/CNPJ) |
| `limit` | number | ❌ | Limite de registros (padrão: 10) |
| `offset` | number | ❌ | Offset para paginação (padrão: 0) |

#### Exemplo de Requisição

```bash
curl -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/search/buscar?q=Jo%C3%A3o&limit=10" \
  -H "Authorization: Bearer seu_token_aqui"
```

## 🔍 Códigos de Erro

Os códigos continuam os mesmos descritos anteriormente, com respostas no padrão DocuSign Data IO (`success`, `data`, `message`, `pagination`, `metadata`).

## 📱 Postman

- Use `base_url = https://crispy-octo-spoon.netlify.app/.netlify/functions`
- Configure `Authorization: Bearer {{auth_token}}` na Collection
- Exemplos prontos:
  - `GET {{base_url}}/clientes-simple`
  - `GET {{base_url}}/clientes-simple/{{cliente_id}}`
  - `POST {{base_url}}/clientes-simple`
  - `PUT {{base_url}}/clientes-simple/{{cliente_id}}`
  - `DELETE {{base_url}}/clientes-simple/{{cliente_id}}`
  - `GET {{base_url}}/clientes-simple/stats/estatisticas`
  - `GET {{base_url}}/clientes-simple/search/buscar?q=Joao`

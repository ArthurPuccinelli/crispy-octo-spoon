## 🍜 Crispy Octo Spoon - APIs de Clientes (Netlify Functions)

APIs RESTful para gestão de clientes, hospedadas em Netlify Functions e conectadas ao Supabase. Compatível com o contrato do DocuSign Extension App Data IO.

- **Base URL (produção)**: `https://crispy-octo-spoon.netlify.app/.netlify/functions`
- **Entidade**: `cliente`
- **Formato**: JSON
- **Autenticação**: Bearer Token no header `Authorization`

### Autenticação

Inclua o header em todas as requisições:

```http
Authorization: Bearer <seu_token>
```

Se omitido ou inválido: retorna 401.

---

## Endpoints

Todos os endpoints abaixo estão sob o prefixo `/.netlify/functions`.

### 1) Listar clientes

GET `/clientes-simple`

- **Query params:**
  - `limit` (number, opcional, padrão 10)
  - `offset` (number, opcional, padrão 0)

Exemplo:
```bash
curl -s \
  -H "Authorization: Bearer test_token" \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple?limit=10&offset=0"
```

Resposta (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "cpf_cnpj": "123.456.789-00",
      "telefone": "(11) 98765-4321",
      "cidade": "São Paulo",
      "estado": "SP",
      "tipo_cliente": "pessoa_fisica",
      "status": "ativo",
      "created_at": "2025-08-21T12:46:12.502697+00:00",
      "updated_at": "2025-08-26T18:55:19.735968+00:00"
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
  "metadata": { "entity": "cliente", "operation": "read", "timestamp": "ISO8601" },
  "message": "Clientes listados com sucesso"
}
```

---

### 2) Buscar cliente por ID

GET `/clientes-simple/:id`

- `id`: UUID do cliente

Exemplo:
```bash
curl -s \
  -H "Authorization: Bearer test_token" \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/<uuid>"
```

Resposta (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "cpf_cnpj": "123.456.789-00",
    "telefone": "(11) 98765-4321",
    "cidade": "São Paulo",
    "estado": "SP",
    "tipo_cliente": "pessoa_fisica",
    "status": "ativo",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  },
  "metadata": { "entity": "cliente", "operation": "read" },
  "message": "Cliente encontrado"
}
```

Erros:
- 404 quando não encontrado

---

### 3) Criar cliente

POST `/clientes-simple`

Body (JSON):
- Obrigatórios: `nome`, `cpf_cnpj`, `tipo_cliente` (`pessoa_fisica` | `pessoa_juridica`)
- Opcionais: `email`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `observacoes`, `status`

Exemplo:
```bash
curl -s -X POST \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Postman",
    "cpf_cnpj": "111.222.333-44",
    "tipo_cliente": "pessoa_fisica",
    "email": "postman@exemplo.com",
    "cidade": "São Paulo",
    "estado": "SP"
  }' \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple"
```

Resposta (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "Cliente Postman",
    "cpf_cnpj": "111.222.333-44",
    "tipo_cliente": "pessoa_fisica",
    "email": "postman@exemplo.com",
    "cidade": "São Paulo",
    "estado": "SP",
    "status": "ativo",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  },
  "metadata": { "entity": "cliente", "operation": "create" },
  "message": "Cliente criado com sucesso"
}
```

Erros comuns:
- 400 campos obrigatórios ausentes
- 500 erro ao salvar no banco

---

### 4) Atualizar cliente

PUT `/clientes-simple/:id`

- `id`: UUID do cliente
- Body com campos a atualizar (mesmos da criação)

Exemplo:
```bash
curl -s -X PUT \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(11) 99999-0000",
    "email": "novo@exemplo.com"
  }' \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/<uuid>"
```

Resposta (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "telefone": "(11) 99999-0000", "email": "novo@exemplo.com" },
  "metadata": { "entity": "cliente", "operation": "update" },
  "message": "Cliente atualizado com sucesso"
}
```

Erros:
- 404 quando não encontrado
- 500 erro ao atualizar

---

### 5) Remover cliente (soft delete)

DELETE `/clientes-simple/:id`

- Marca o cliente como `inativo`.

Exemplo:
```bash
curl -s -X DELETE \
  -H "Authorization: Bearer test_token" \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/<uuid>"
```

Resposta (200):
```json
{
  "success": true,
  "data": { "id": "uuid" },
  "metadata": { "entity": "cliente", "operation": "delete" },
  "message": "Cliente removido com sucesso"
}
```

---

### 6) Estatísticas

GET `/clientes-simple/stats/estatisticas`

- Retorna agregações: total, porStatus, porTipo, porEstado, porCidade.

Exemplo:
```bash
curl -s \
  -H "Authorization: Bearer test_token" \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/stats/estatisticas"
```

Resposta (200):
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
  "metadata": { "entity": "cliente", "operation": "statistics" },
  "message": "Estatísticas obtidas"
}
```

---

### 7) Busca avançada

GET `/clientes-simple/search/buscar`

- Query params:
  - `q` (obrigatório): texto para busca em `nome`, `email`, `cpf_cnpj`
  - `limit` (opcional)
  - `offset` (opcional)

Exemplo:
```bash
curl -s \
  -H "Authorization: Bearer test_token" \
  "https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple/search/buscar?q=Jo%C3%A3o&limit=10&offset=0"
```

Resposta (200):
```json
{
  "success": true,
  "data": [ { "id": "uuid", "nome": "João Silva", "cpf_cnpj": "123.456.789-00" } ],
  "pagination": { "total": 1, "limit": 10, "offset": 0, "hasMore": false, "page": 1, "totalPages": 1 },
  "metadata": { "entity": "cliente", "operation": "search" },
  "message": "Busca executada"
}
```

Erros:
- 400 quando `q` não é informado

---

## Códigos de status e erros

- 200 OK
- 201 Created
- 400 Bad Request (validação)
- 401 Unauthorized (token ausente/ inválido)
- 404 Not Found
- 500 Internal Server Error

Resposta de erro padrão:
```json
{
  "success": false,
  "error": "Error",
  "message": "Descrição do erro",
  "code": "ERROR_400",
  "timestamp": "ISO8601"
}
```

---

## Dicas para Postman

- Crie um Environment com:
  - `base_url` = `https://crispy-octo-spoon.netlify.app/.netlify/functions`
  - `auth_token` = `test_token_docusign`
- Headers padrão na Collection:
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`

Exemplos prontos:
```http
GET {{base_url}}/clientes-simple
GET {{base_url}}/clientes-simple/{{cliente_id}}
POST {{base_url}}/clientes-simple
PUT {{base_url}}/clientes-simple/{{cliente_id}}
DELETE {{base_url}}/clientes-simple/{{cliente_id}}
GET {{base_url}}/clientes-simple/stats/estatisticas
GET {{base_url}}/clientes-simple/search/buscar?q=Joao
```

---

## Observações

- Estas rotas já estão em produção e usam Supabase real.
- Em breve, rotas sob `/api/clientes` (Express) serão migradas/ajustadas para o mesmo padrão de Netlify Function por endpoint.
- Variáveis de ambiente necessárias nas Functions: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (ou as versões `NEXT_PUBLIC_*`).

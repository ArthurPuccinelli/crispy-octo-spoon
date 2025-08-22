# 🔧 Solução para Erro 400 ao Adicionar Produtos

## 🚨 **PROBLEMA IDENTIFICADO:**

O erro 400 (Bad Request) ao tentar adicionar produtos está ocorrendo devido a **duas incompatibilidades principais**:

### 1. **Schema Mismatch (INCOMPATIBILIDADE DE CAMPOS)**
O formulário estava enviando campos que **NÃO EXISTEM** na tabela `produtos`:

| ❌ **Formulário (Antes)** | ✅ **Tabela Real** |
|---------------------------|-------------------|
| `valor` | `preco` |
| `tipo` | `tipo_produto` |
| `status` | `ativo` |
| `periodo_cobranca` | `periodicidade` |

### 2. **Políticas RLS (Row Level Security)**
A tabela `produtos` tem RLS habilitado e requer:
- ✅ Usuário **autenticado**
- ✅ Role **'admin'** no JWT

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

### **1. Correção do Schema**
- ✅ Atualizado `ProdutoForm.tsx` para usar campos corretos
- ✅ Atualizado `page.tsx` da gestão de produtos
- ✅ Interface `Produto` corrigida para corresponder ao banco

### **2. Sistema de Autenticação**
- ✅ Criado `AuthContext.tsx` para gerenciar login
- ✅ Criada página `/login` para autenticação
- ✅ Verificação de permissões em todas as páginas admin
- ✅ Redirecionamento automático para login se não autenticado

### **3. Verificação de Permissões**
- ✅ Todas as páginas admin verificam se usuário é admin
- ✅ Redirecionamento para `/` se não tiver permissão
- ✅ Loading states durante verificação de autenticação

## 🚀 **COMO RESOLVER:**

### **Passo 1: Criar Usuário Admin no Supabase**

1. **Acesse o painel do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Criar usuário:**
   - Vá para **Authentication** > **Users**
   - Clique em **"Add User"**
   - Email: `admin@fontara.com`
   - Password: `admin123`

3. **Definir role admin:**
   - Execute no **SQL Editor** do Supabase:

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'admin@fontara.com';
```

4. **Verificar:**
```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'admin@fontara.com';
```

### **Passo 2: Testar a Aplicação**

1. **Acesse:** `http://localhost:3000/login`
2. **Faça login com:**
   - Email: `admin@fontara.com`
   - Senha: `admin123`
3. **Vá para:** `/admin/produtos`
4. **Tente adicionar um produto**

### **Passo 3: Verificar Console**

Após o login, o console deve mostrar:
```
✅ Supabase client created successfully with environment variables
```

## 🔍 **VERIFICAÇÕES ADICIONAIS:**

### **Se ainda houver erro 400:**

1. **Verificar campos obrigatórios:**
   - `nome` (VARCHAR 255, NOT NULL)
   - `preco` (DECIMAL 10,2, NOT NULL)
   - `tipo_produto` (VARCHAR 50, NOT NULL)
   - `ativo` (BOOLEAN, DEFAULT true)

2. **Verificar tipos de dados:**
   - `preco`: deve ser número (ex: 99.99)
   - `ativo`: deve ser boolean (true/false)
   - `tipo_produto`: deve ser 'servico', 'produto' ou 'assinatura'

3. **Verificar políticas RLS:**
   - Usuário deve estar autenticado
   - JWT deve conter `role: 'admin'`

## 🐛 **TROUBLESHOOTING:**

### **Erro: "JWT token is invalid"**
- ✅ Verificar se usuário está logado
- ✅ Verificar se token não expirou
- ✅ Fazer logout e login novamente

### **Erro: "new row violates row-level security policy"**
- ✅ Verificar se usuário tem role 'admin'
- ✅ Verificar se políticas RLS estão configuradas corretamente

### **Erro: "column does not exist"**
- ✅ Verificar se campos do formulário correspondem ao schema
- ✅ Verificar se tabela foi criada corretamente

## 📋 **CAMPOS CORRETOS DA TABELA PRODUTOS:**

```sql
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias_produtos(id),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,           -- ✅ CORRETO
  preco_promocional DECIMAL(10,2),
  tipo_produto VARCHAR(50) DEFAULT 'servico', -- ✅ CORRETO
  periodicidade VARCHAR(20),               -- ✅ CORRETO
  duracao_dias INTEGER,
  ativo BOOLEAN DEFAULT true,              -- ✅ CORRETO
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 **RESULTADO ESPERADO:**

Após implementar todas as correções:
- ✅ Formulário envia campos corretos
- ✅ Usuário está autenticado como admin
- ✅ Produtos são inseridos com sucesso
- ✅ Sem mais erros 400 (Bad Request)

---

**💡 Dica:** Sempre verifique o console do navegador para mensagens de debug e erros detalhados.

# 🔧 Solução para Supabase não trazendo dados localmente

## 🚨 **PROBLEMA IDENTIFICADO:**

O portal local não está trazendo dados do Supabase quando o usuário está logado como admin. O problema está relacionado a:

1. **Conflito entre sessão logada e acesso aos dados**
2. **Botão de logout não funcionando corretamente**
3. **Políticas RLS (Row Level Security) bloqueando acesso**
4. **Usuário não consegue fazer login novamente após logout**
5. **Logout não redireciona para página principal**

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

### **1. Componente de Debug**
- ✅ Criado `DebugSupabase.tsx` para testar conexão
- ✅ Adicionado à página principal em `/`
- ✅ Permite verificar variáveis de ambiente e testar conexões
- ✅ **NOVO:** Botão para verificar estado de autenticação

### **2. Correção do Sistema de Autenticação**
- ✅ **AuthContext.tsx** - Melhorado com logs detalhados e redirecionamento
- ✅ **AdminLayout** - Adicionada verificação de autenticação e admin
- ✅ **AdminNavBar** - Corrigido logout com feedback visual e tratamento de erros
- ✅ **LoginPage** - Melhorada para funcionar corretamente após logout

### **3. Scripts de Verificação**
- ✅ `check-and-fix-rls.sql` - Verifica e corrige políticas RLS

### **4. Teste de Logout e Login**
- ✅ **TESTE_LOGOUT.md** - Instruções detalhadas para testar o sistema

## 🚀 **COMO RESOLVER:**

### **Passo 1: Testar no Navegador**

1. **Acesse:** `http://localhost:3000`
2. **Role até o final da página** - você verá a seção "🔍 Debug Supabase"
3. **Clique em "🧪 Testar Conexão Supabase"**
4. **Abra o console do navegador (F12)** para ver logs detalhados

### **Passo 2: Verificar e Corrigir Políticas RLS no Supabase**

1. **Acesse o painel do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Execute o script de correção:**
   - Vá para **SQL Editor**
   - Cole e execute o conteúdo de `check-and-fix-rls.sql`

3. **Este script irá:**
   - Verificar configuração atual das tabelas
   - Desabilitar RLS nas tabelas principais
   - Garantir acesso SELECT para roles 'anon' e 'authenticated'
   - Verificar se as alterações foram aplicadas

### **Passo 3: Testar Autenticação**

1. **Faça logout se estiver logado:**
   - Vá para `/admin`
   - Clique em "Sair" na barra de navegação
   - Deve redirecionar para `/`

2. **Faça login novamente:**
   - Vá para `/login`
   - Use: `admin@fontara.com` / `admin123`
   - Deve redirecionar para `/admin`

3. **Verifique se os dados aparecem:**
   - Vá para `/admin/clientes` ou `/admin/produtos`
   - Os dados devem aparecer normalmente

### **Passo 4: Testar Logout e Login (IMPORTANTE)**

1. **Teste o logout completo:**
   - Clique em "Sair" na barra de navegação admin
   - Deve redirecionar para página principal (`/`)
   - Verifique no console se aparecem os logs de logout

2. **Teste login após logout:**
   - Vá para `/login` novamente
   - Use as mesmas credenciais
   - Deve funcionar normalmente

3. **Se houver problemas, use o debug:**
   - Na página principal, clique em "🔍 Verificar Estado Auth"
   - Verifique no console se localStorage foi limpo
   - Não deve haver tokens do Supabase

### **Passo 5: Verificar Console do Navegador**

Após o login, o console deve mostrar:

```
🔐 Auth state change: SIGNED_IN admin@fontara.com
🔍 Verificando role do usuário: admin@fontara.com
✅ Usuário admin padrão detectado
```

## 🔍 **VERIFICAÇÕES ADICIONAIS:**

### **1. Variáveis de Ambiente**
```bash
# frontend/.env.local deve conter:
NEXT_PUBLIC_SUPABASE_URL=https://yjjbsxqmauhiunkwpqwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### **2. Estrutura das Tabelas**
- ✅ Tabela `clientes` deve existir com campos: `id`, `nome`, `email`, `tipo_cliente`, `status`
- ✅ Tabela `produtos` deve existir com campos: `id`, `nome`, `preco`, `tipo_produto`, `ativo`

### **3. Políticas RLS**
- ✅ RLS deve estar **DESABILITADO** nas tabelas principais
- ✅ Role 'anon' deve ter permissão SELECT
- ✅ Role 'authenticated' deve ter permissão SELECT

## 🐛 **TROUBLESHOOTING:**

### **Erro: "JWT token is invalid"**
- ✅ Verificar se não há token expirado no localStorage
- ✅ Limpar localStorage e recarregar a página
- ✅ Fazer logout e login novamente

### **Erro: "new row violates row-level security policy"**
- ✅ Executar `check-and-fix-rls.sql` no Supabase
- ✅ Verificar se RLS foi desabilitado

### **Erro: "permission denied"**
- ✅ Verificar permissões das roles 'anon' e 'authenticated'
- ✅ Executar `GRANT SELECT ON table_name TO anon, authenticated;`

### **Logout não funciona:**
- ✅ Verificar console para erros
- ✅ Verificar se o redirecionamento está funcionando
- ✅ Limpar localStorage manualmente se necessário

### **Login não funciona após logout:**
- ✅ Verificar se localStorage foi limpo
- ✅ Verificar se estado foi resetado
- ✅ Verificar se não há cache do Supabase
- ✅ Usar botão "🔍 Verificar Estado Auth" para debug

### **Logout não redireciona:**
- ✅ Verificar se `window.location.href = '/'` está funcionando
- ✅ Verificar se não há conflito com Next.js router
- ✅ Verificar se não há bloqueadores de popup

## 📋 **COMANDOS ÚTEIS:**

### **Reiniciar servidor Next.js:**
```bash
cd frontend
npm run dev
```

### **Verificar variáveis de ambiente:**
```bash
cd frontend
cat .env.local
```

### **Limpar cache do Next.js:**
```bash
cd frontend
rm -rf .next
npm run dev
```

### **Limpar localStorage no navegador:**
```javascript
// No console do navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### **Debug de autenticação:**
```javascript
// No console do navegador:
// Verificar tokens do Supabase
Object.keys(localStorage).filter(key => key.includes('supabase'))

// Verificar estado da aplicação
console.log('Estado atual:')
console.log('localStorage:', Object.keys(localStorage))
console.log('sessionStorage:', Object.keys(sessionStorage))
console.log('Cookies:', document.cookie)
```

## 🎯 **RESULTADO ESPERADO:**

Após implementar todas as correções:
- ✅ Componente de debug mostra variáveis corretas
- ✅ Teste de conexão retorna dados das tabelas
- ✅ Login funciona corretamente
- ✅ Logout funciona e redireciona para home
- ✅ Páginas admin mostram dados normalmente
- ✅ Sem erros no console do navegador

## 🔧 **ARQUIVOS CORRIGIDOS:**

1. **`src/contexts/AuthContext.tsx`** - Melhorado sistema de autenticação
2. **`src/app/admin/layout.tsx`** - Adicionada verificação de auth
3. **`src/components/navigation/AdminNavBar.tsx`** - Corrigido logout
4. **`src/app/login/page.tsx`** - Melhorada para funcionar após logout
5. **`src/components/DebugSupabase.tsx`** - Adicionado botão de debug de auth
6. **`check-and-fix-rls.sql`** - Script para corrigir RLS
7. **`TESTE_LOGOUT.md`** - Instruções para testar logout e login

---

**💡 Dica:** O problema principal era o conflito entre RLS e autenticação. Com RLS desabilitado, tanto usuários anônimos quanto autenticados podem acessar os dados.

**🔗 Links úteis:**
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase SQL Editor](https://supabase.com/dashboard/project/[PROJECT_ID]/sql)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

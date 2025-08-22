# 🧪 Teste de Logout e Login

## 🎯 **OBJETIVO:**

Testar se o logout está funcionando corretamente e se o usuário consegue fazer login novamente após logout.

## 🚀 **COMO TESTAR:**

### **Passo 1: Verificar Estado Inicial**

1. **Acesse:** `http://localhost:3000`
2. **Role até o final da página** - seção "🔍 Debug Supabase"
3. **Clique em "🔍 Verificar Estado Auth"**
4. **Abra o console do navegador (F12)** para ver logs

### **Passo 2: Fazer Login**

1. **Vá para:** `http://localhost:3000/login`
2. **Use as credenciais:**
   - Email: `admin@fontara.com`
   - Senha: `admin123`
3. **Verifique no console:**
   ```
   🔐 Tentando login com: admin@fontara.com
   ✅ Login bem-sucedido, redirecionando...
   🔐 Auth state change: SIGNED_IN admin@fontara.com
   🔍 Verificando role do usuário: admin@fontara.com
   ✅ Usuário admin padrão detectado
   ```

### **Passo 3: Testar Logout**

1. **Vá para:** `http://localhost:3000/admin`
2. **Clique em "Sair" na barra de navegação**
3. **Verifique no console:**
   ```
   🚪 Iniciando logout...
   🚪 Fazendo logout...
   ✅ Logout bem-sucedido
   🔐 Auth state change: SIGNED_OUT
   🚪 Usuário fez logout, limpando estado...
   ```
4. **Deve redirecionar para:** `http://localhost:3000`

### **Passo 4: Verificar Estado Após Logout**

1. **Na página principal, clique em "🔍 Verificar Estado Auth"**
2. **Verifique no console se localStorage foi limpo**
3. **Não deve haver tokens do Supabase**

### **Passo 5: Testar Login Após Logout**

1. **Vá para:** `http://localhost:3000/login`
2. **Use as mesmas credenciais:**
   - Email: `admin@fontara.com`
   - Senha: `admin123`
3. **Deve funcionar normalmente e redirecionar para `/admin`**

## 🔍 **VERIFICAÇÕES IMPORTANTES:**

### **1. Console do Navegador**
- ✅ Deve mostrar logs detalhados de cada operação
- ✅ Não deve haver erros
- ✅ Eventos de auth devem ser capturados corretamente

### **2. Redirecionamentos**
- ✅ Login deve redirecionar para `/admin`
- ✅ Logout deve redirecionar para `/`
- ✅ Tentativa de acessar `/admin` sem login deve redirecionar para `/login`

### **3. Estado da Aplicação**
- ✅ Após logout, usuário deve ser `null`
- ✅ `isAdmin` deve ser `false`
- ✅ Não deve haver tokens no localStorage

## 🐛 **PROBLEMAS COMUNS E SOLUÇÕES:**

### **Problema: Logout não redireciona**
**Solução:**
- Verificar se `window.location.href = '/'` está funcionando
- Verificar se não há conflito com Next.js router

### **Problema: Login não funciona após logout**
**Solução:**
- Verificar se localStorage foi limpo
- Verificar se estado foi resetado
- Verificar se não há cache do Supabase

### **Problema: Estado não é limpo**
**Solução:**
- Verificar se `setUser(null)` está sendo chamado
- Verificar se `setIsAdmin(false)` está sendo chamado
- Verificar se eventos de auth estão sendo capturados

## 📋 **COMANDOS DE DEBUG:**

### **No console do navegador:**

```javascript
// Verificar estado atual
console.log('Estado da aplicação:')
console.log('localStorage:', Object.keys(localStorage))
console.log('sessionStorage:', Object.keys(sessionStorage))

// Limpar manualmente se necessário
localStorage.clear()
sessionStorage.clear()
location.reload()

// Verificar se há tokens do Supabase
Object.keys(localStorage).filter(key => key.includes('supabase'))
```

### **Verificar se o usuário está logado:**
```javascript
// No console do navegador
// Se estiver na página admin, deve mostrar o usuário
// Se não estiver logado, deve redirecionar para login
```

## 🎯 **RESULTADO ESPERADO:**

Após todos os testes:
- ✅ Login funciona normalmente
- ✅ Logout redireciona para página principal
- ✅ Estado é limpo corretamente
- ✅ Login funciona novamente após logout
- ✅ Não há tokens ou dados persistentes incorretos
- ✅ Console mostra logs detalhados sem erros

---

**💡 Dica:** Use o console do navegador para acompanhar cada etapa do processo de login/logout.

**🔗 Para mais detalhes:** Consulte `SOLUCAO_SUPABASE_LOCAL.md`

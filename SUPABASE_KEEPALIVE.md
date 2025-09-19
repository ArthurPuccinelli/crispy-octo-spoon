# 🚀 Serviço de Keepalive para Supabase - Netlify Scheduled Functions

Este documento descreve a implementação do serviço de keepalive para manter o Supabase ativo usando as **Scheduled Functions** nativas do Netlify.

## 🎯 Problema Resolvido

O Supabase pode entrar em modo de hibernação quando não há atividade por um período prolongado, causando:
- ⏱️ Latência aumentada na primeira requisição após inatividade
- ⚠️ Timeouts ocasionais
- 😞 Experiência de usuário degradada

## 🏗️ Solução Implementada

Utilizamos as **[Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)** do Netlify, que são:
- ✅ **Nativas** do Netlify (sem plugins externos)
- ✅ **Serverless** (sem custo de servidor)
- ✅ **Confiáveis** (execução garantida)
- ✅ **Fáceis de monitorar** (logs integrados)

## 📁 Arquivos Criados

### 1. **Função Scheduled** (`supabase-keepalive.mjs`)
```javascript
// Executa a cada 10 minutos
export const config = {
  schedule: '*/10 * * * *'
};
```

**Funcionalidades:**
- 🔍 Teste de conectividade básica
- 🗃️ Verificação de tabelas principais
- ⚡ Teste de performance
- 📊 Relatórios detalhados de status
- 📝 Logs estruturados

### 2. **Script de Teste** (`test-keepalive.mjs`)
- 🧪 Testa a função localmente
- 📊 Exibe relatórios detalhados
- 🔧 Valida configurações

### 3. **Configuração** (`netlify.toml`)
- 📝 Documentação da configuração alternativa
- 🔧 Comentários explicativos

## 🚀 Como Funciona

### Execução Automática
1. **A cada 10 minutos**, o Netlify executa automaticamente a função
2. **Queries de teste** são executadas no Supabase:
   - Verificação de conectividade
   - Teste de tabelas (`clientes`, `produtos`, `servicos_contratados`)
   - Teste de performance
3. **Logs detalhados** são gerados para monitoramento
4. **Supabase permanece ativo** sem hibernação

### Monitoramento
- 📊 **Logs no Netlify Dashboard**: Functions > supabase-keepalive
- ⏰ **Próxima execução**: Exibida na interface
- 📈 **Métricas de performance**: Duração das queries
- 🚨 **Alertas de erro**: Detecção automática de problemas

## 📋 Configuração

### 1. **Variáveis de Ambiente**
Configure no Netlify Dashboard:

```env
# Configurações do Supabase (já existentes)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configurações opcionais
NODE_ENV=production
LOG_LEVEL=info
```

### 2. **Instalação de Dependências**
```bash
cd frontend/.netlify/functions
npm install @netlify/functions
```

### 3. **Deploy**
```bash
git add .
git commit -m "feat: implementa keepalive do Supabase com Scheduled Functions"
git push origin main
```

## 🧪 Testando

### Teste Local
```bash
cd frontend/.netlify/functions
node test-keepalive.mjs
```

### Teste via Netlify CLI
```bash
# Iniciar Netlify Dev
netlify dev

# Em outro terminal, invocar a função
netlify functions:invoke supabase-keepalive
```

### Verificar em Produção
1. Acesse o **Netlify Dashboard**
2. Vá em **Functions**
3. Procure por `supabase-keepalive` com badge **Scheduled**
4. Visualize logs e próxima execução

## 📊 Exemplo de Logs

### Execução Bem-sucedida
```
🚀 Scheduled function executada!
⏰ Próxima execução: 2024-01-15T10:40:00.000Z
🕐 Execução atual: 2024-01-15T10:30:00.000Z
🔄 Iniciando keepalive do Supabase...
📡 Testando conectividade...
🗃️ Verificando tabelas...
⚡ Testando performance...
✅ Keepalive executado com sucesso: {
  timestamp: "2024-01-15T10:30:00.000Z",
  totalDuration: "450ms",
  queriesExecuted: 5,
  successfulQueries: 5,
  success: true,
  errors: 0
}
🎉 Keepalive concluído com sucesso!
📊 Performance: 450ms total, 90ms média
```

### Execução com Erros
```
⚠️ Keepalive concluído com erros: [
  "Table produtos check failed: relation 'produtos' does not exist"
]
```

## ⚙️ Personalização

### Alterar Frequência
Edite o `schedule` em `supabase-keepalive.mjs`:

```javascript
// A cada 5 minutos
schedule: '*/5 * * * *'

// A cada 15 minutos
schedule: '*/15 * * * *'

// A cada hora
schedule: '0 * * * *'

// Usando extensões RFC
schedule: '@hourly'  // A cada hora
schedule: '@daily'   // Diariamente
```

### Adicionar Novas Tabelas
Edite o array `tables` na função:

```javascript
const tables = ['clientes', 'produtos', 'servicos_contratados', 'nova_tabela'];
```

### Configuração no netlify.toml (Alternativa)
Se preferir configurar no `netlify.toml`:

```toml
[functions."supabase-keepalive"]
schedule = "*/10 * * * *"
```

## 🛠️ Troubleshooting

### Função Não Aparece no Dashboard
- ✅ Verifique se o deploy foi feito
- ✅ Confirme se o arquivo está em `.netlify/functions/`
- ✅ Verifique se a extensão é `.mjs` ou `.js`

### Erro de Configuração do Supabase
- ✅ Verifique as variáveis de ambiente
- ✅ Confirme se o projeto Supabase está ativo
- ✅ Teste com o script `test-keepalive.mjs`

### Cron Não Executa
- ✅ Verifique se a sintaxe do cron está correta
- ✅ Confirme se está em produção (não funciona em preview)
- ✅ Verifique os logs para erros

### Performance Lenta
- ✅ Verifique a conexão com o Supabase
- ✅ Considere reduzir o número de queries
- ✅ Monitore os logs de performance

## 📈 Benefícios

### ✅ **Vantagens da Solução**
- **Zero configuração externa**: Usa recursos nativos do Netlify
- **Custo zero**: Sem servidor dedicado
- **Alta confiabilidade**: Execução garantida pelo Netlify
- **Monitoramento integrado**: Logs e métricas no dashboard
- **Fácil manutenção**: Código simples e bem documentado
- **Flexível**: Fácil de personalizar frequência e queries

### 📊 **Métricas Esperadas**
- **Latência**: < 100ms por query
- **Disponibilidade**: 99.9% (execução a cada 10 min)
- **Cobertura**: Todas as tabelas principais verificadas
- **Alertas**: Detecção automática de problemas

## 🔄 Comparação com Alternativas

| Solução | Prós | Contras | Recomendação |
|---------|------|---------|--------------|
| **Scheduled Functions** ✅ | Nativa, confiável, zero config | - | **Recomendada** |
| Plugin Cron | Flexível | Dependência externa | Alternativa |
| Uptime Robot | Simples | Serviço externo, menos controle | Não recomendada |
| Backend + Cron | Controle total | Servidor dedicado, complexo | Não recomendada |

## 📚 Referências

- [Netlify Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)
- [Cron Expression Guide](https://crontab.guru/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

**🎉 Implementação concluída!** Seu Supabase agora permanecerá sempre ativo com execução automática a cada 10 minutos.



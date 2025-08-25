# Migração: CPF/CNPJ como Identificador Único dos Clientes

Este documento descreve o processo de migração para alterar o identificador único dos clientes de email para CPF/CNPJ.

## 🎯 Objetivo da Migração

- **Antes**: Email era o campo obrigatório e único para identificação dos clientes
- **Depois**: CPF/CNPJ será o campo obrigatório e único para identificação dos clientes
- **Email**: Tornará-se opcional

## 📋 Pré-requisitos

1. Acesso ao painel administrativo do Supabase
2. Backup dos dados existentes (recomendado)
3. Acesso ao SQL Editor do Supabase

## 🚀 Passos da Migração

### Passo 1: Executar Script de Migração do Banco

1. Acesse o **SQL Editor** no painel do Supabase
2. Execute o script `database_migration.sql` completo
3. Verifique se não houve erros na execução

### Passo 2: Migrar Dados Existentes

1. Execute o script `data_migration_script.sql` no SQL Editor
2. Este script irá:
   - Identificar clientes sem CPF/CNPJ
   - Gerar valores temporários para clientes existentes
   - Resolver conflitos de duplicatas
   - Verificar a integridade dos dados

### Passo 3: Atualizar CPFs/CNPJs Temporários

1. Execute a consulta para listar clientes com CPF/CNPJ temporário:
   ```sql
   SELECT id, nome, email, cpf_cnpj, tipo_cliente, created_at
   FROM clientes 
   WHERE cpf_cnpj LIKE 'TEMP_%'
   ORDER BY created_at;
   ```

2. Para cada cliente listado, atualize com o CPF/CNPJ real:
   ```sql
   UPDATE clientes 
   SET cpf_cnpj = '123.456.789-00'  -- Substituir pelo CPF/CNPJ real
   WHERE id = 'uuid-do-cliente';
   ```

### Passo 4: Verificar a Migração

1. Execute a consulta de verificação:
   ```sql
   SELECT 
       COUNT(*) as total_clientes,
       COUNT(DISTINCT cpf_cnpj) as cpf_cnpj_unicos,
       COUNT(CASE WHEN cpf_cnpj LIKE 'TEMP_%' THEN 1 END) as com_cpf_cnpj_temporario
   FROM clientes;
   ```

2. Confirme que:
   - `total_clientes` = `cpf_cnpj_unicos`
   - `com_cpf_cnpj_temporario` = 0

## 🔧 Atualizações no Código Frontend

### Arquivos Modificados

1. **`frontend/src/types/index.ts`**
   - Interface `Cliente` atualizada
   - `cpf_cnpj` agora é obrigatório (`string`)
   - `email` agora é opcional (`string?`)

2. **`frontend/src/components/forms/ClienteForm.tsx`**
   - Campo CPF/CNPJ agora é obrigatório
   - Campo email agora é opcional
   - Adicionada validação de formato CPF/CNPJ
   - Formatação automática de CPF/CNPJ
   - Placeholder dinâmico baseado no tipo de cliente

3. **`frontend/src/components/ClientesList.tsx`**
   - CPF/CNPJ exibido como identificador principal
   - Email exibido apenas se existir
   - Interface atualizada para refletir as mudanças

### Funcionalidades Adicionadas

- **Validação de CPF/CNPJ**: Verifica se tem 11 ou 14 dígitos
- **Formatação automática**: Aplica máscara CPF (XXX.XXX.XXX-XX) ou CNPJ (XX.XXX.XXX/XXXX-XX)
- **Placeholder dinâmico**: Mostra formato esperado baseado no tipo de cliente
- **Validação no frontend**: Impede envio de formulário com CPF/CNPJ inválido

## ⚠️ Considerações Importantes

### Antes da Migração

1. **Backup**: Faça backup completo dos dados
2. **Teste**: Execute a migração em ambiente de desenvolvimento primeiro
3. **Horário**: Execute em horário de baixo tráfego
4. **Comunicação**: Informe a equipe sobre a manutenção

### Durante a Migração

1. **Monitoramento**: Acompanhe a execução dos scripts
2. **Verificação**: Confirme cada etapa antes de prosseguir
3. **Rollback**: Tenha plano de reversão em caso de problemas

### Após a Migração

1. **Testes**: Verifique todas as funcionalidades do sistema
2. **Validação**: Confirme que novos clientes são criados corretamente
3. **Documentação**: Atualize documentação da API se necessário

## 🔍 Verificações Pós-Migração

### Testes Funcionais

1. **Criação de Cliente**: Teste criar cliente com CPF/CNPJ válido
2. **Edição de Cliente**: Teste editar cliente existente
3. **Validação**: Teste CPF/CNPJ inválido (deve ser rejeitado)
4. **Listagem**: Verifique se clientes são exibidos corretamente

### Testes de Integridade

1. **Unicidade**: Tente criar cliente com CPF/CNPJ duplicado
2. **Obrigatoriedade**: Tente criar cliente sem CPF/CNPJ
3. **Formato**: Teste diferentes formatos de CPF/CNPJ

## 🆘 Solução de Problemas

### Erro: "cpf_cnpj_unique constraint violation"

- **Causa**: Tentativa de inserir CPF/CNPJ duplicado
- **Solução**: Verificar se o CPF/CNPJ já existe na base

### Erro: "cpf_cnpj is null"

- **Causa**: Campo CPF/CNPJ não foi preenchido
- **Solução**: Verificar se o campo é obrigatório no frontend

### Clientes com CPF/CNPJ temporário

- **Causa**: Clientes existentes sem CPF/CNPJ real
- **Solução**: Atualizar manualmente com CPF/CNPJ real

## 📞 Suporte

Em caso de dúvidas ou problemas durante a migração:

1. Verifique os logs de erro no Supabase
2. Consulte a documentação oficial do Supabase
3. Entre em contato com a equipe de desenvolvimento

## 📝 Notas de Versão

- **Versão**: 1.0.0
- **Data**: [Data da migração]
- **Responsável**: [Nome do responsável]
- **Status**: [Em andamento / Concluído / Revertido]

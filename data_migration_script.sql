-- Script para migrar dados existentes da tabela clientes
-- Este script deve ser executado APÓS executar o database_migration.sql

-- 1. Verificar clientes sem CPF/CNPJ
SELECT 
    id, 
    nome, 
    email, 
    cpf_cnpj,
    tipo_cliente,
    created_at
FROM clientes 
WHERE cpf_cnpj IS NULL OR cpf_cnpj = '';

-- 2. Para clientes existentes sem CPF/CNPJ, gerar um valor baseado no email ou ID
-- Se o cliente tem email, usar o email como base para gerar um CPF/CNPJ temporário
UPDATE clientes 
SET cpf_cnpj = CASE 
    WHEN email IS NOT NULL AND email != '' THEN 
        CONCAT('TEMP_', SUBSTRING(MD5(email), 1, 8))
    ELSE 
        CONCAT('TEMP_', id)
    END
WHERE cpf_cnpj IS NULL OR cpf_cnpj = '';

-- 3. Verificar se há duplicatas de CPF/CNPJ
SELECT 
    cpf_cnpj,
    COUNT(*) as total
FROM clientes 
GROUP BY cpf_cnpj 
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 4. Para CPFs/CNPJs duplicados, adicionar sufixo único
-- Primeiro, vamos criar uma tabela temporária para identificar duplicatas
CREATE TEMP TABLE temp_duplicates AS
SELECT 
    cpf_cnpj,
    ROW_NUMBER() OVER (PARTITION BY cpf_cnpj ORDER BY created_at) as rn
FROM clientes 
WHERE cpf_cnpj IN (
    SELECT cpf_cnpj 
    FROM clientes 
    GROUP BY cpf_cnpj 
    HAVING COUNT(*) > 1
);

-- Agora atualizar os registros duplicados (exceto o primeiro)
UPDATE clientes 
SET cpf_cnpj = CONCAT(cpf_cnpj, '_', td.rn)
FROM temp_duplicates td
WHERE clientes.cpf_cnpj = td.cpf_cnpj 
AND td.rn > 1;

-- 5. Limpar tabela temporária
DROP TABLE temp_duplicates;

-- 6. Verificar se todos os clientes agora têm CPF/CNPJ único
SELECT 
    COUNT(*) as total_clientes,
    COUNT(DISTINCT cpf_cnpj) as cpf_cnpj_unicos,
    COUNT(CASE WHEN cpf_cnpj LIKE 'TEMP_%' THEN 1 END) as com_cpf_cnpj_temporario
FROM clientes;

-- 7. Listar clientes com CPF/CNPJ temporário para atualização manual
SELECT 
    id,
    nome,
    email,
    cpf_cnpj,
    tipo_cliente,
    created_at
FROM clientes 
WHERE cpf_cnpj LIKE 'TEMP_%'
ORDER BY created_at;

-- 8. Exemplo de como atualizar um cliente específico com CPF/CNPJ real
-- UPDATE clientes 
-- SET cpf_cnpj = '123.456.789-00'  -- Substituir pelo CPF/CNPJ real
-- WHERE id = 'uuid-do-cliente';

-- 9. Verificar a estrutura final da tabela
\d clientes;

-- 10. Verificar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass;

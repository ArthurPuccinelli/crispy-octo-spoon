-- Script de validação para verificar se a migração foi bem-sucedida
-- Execute este script após completar todos os passos da migração

-- 1. Verificar estrutura da tabela
SELECT 
    'Estrutura da Tabela' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
    'Constraints' as verificacao,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass;

-- 3. Verificar índices
SELECT 
    'Índices' as verificacao,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'clientes';

-- 4. Verificar integridade dos dados
SELECT 
    'Integridade dos Dados' as verificacao,
    COUNT(*) as total_clientes,
    COUNT(DISTINCT cpf_cnpj) as cpf_cnpj_unicos,
    COUNT(CASE WHEN cpf_cnpj IS NULL THEN 1 END) as cpf_cnpj_nulos,
    COUNT(CASE WHEN cpf_cnpj = '' THEN 1 END) as cpf_cnpj_vazios,
    COUNT(CASE WHEN cpf_cnpj LIKE 'TEMP_%' THEN 1 END) as com_cpf_cnpj_temporario,
    COUNT(CASE WHEN email IS NULL THEN 1 END) as emails_nulos,
    COUNT(CASE WHEN email = '' THEN 1 END) as emails_vazios
FROM clientes;

-- 5. Verificar se há duplicatas de CPF/CNPJ
SELECT 
    'Verificação de Duplicatas' as verificacao,
    cpf_cnpj,
    COUNT(*) as total
FROM clientes 
GROUP BY cpf_cnpj 
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 6. Verificar formato dos CPFs/CNPJs
SELECT 
    'Formato dos CPFs/CNPJs' as verificacao,
    CASE 
        WHEN LENGTH(REPLACE(cpf_cnpj, '.', '')) = 11 THEN 'CPF (11 dígitos)'
        WHEN LENGTH(REPLACE(cpf_cnpj, '.', '')) = 14 THEN 'CNPJ (14 dígitos)'
        ELSE 'Formato inválido'
    END as tipo_documento,
    COUNT(*) as quantidade
FROM clientes 
GROUP BY 
    CASE 
        WHEN LENGTH(REPLACE(cpf_cnpj, '.', '')) = 11 THEN 'CPF (11 dígitos)'
        WHEN LENGTH(REPLACE(cpf_cnpj, '.', '')) = 14 THEN 'CNPJ (14 dígitos)'
        ELSE 'Formato inválido'
    END;

-- 7. Verificar distribuição por tipo de cliente
SELECT 
    'Distribuição por Tipo' as verificacao,
    tipo_cliente,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clientes), 2) as percentual
FROM clientes 
GROUP BY tipo_cliente
ORDER BY quantidade DESC;

-- 8. Verificar distribuição por status
SELECT 
    'Distribuição por Status' as verificacao,
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clientes), 2) as percentual
FROM clientes 
GROUP BY status
ORDER BY quantidade DESC;

-- 9. Verificar clientes criados recentemente
SELECT 
    'Clientes Recentes' as verificacao,
    nome,
    cpf_cnpj,
    tipo_cliente,
    created_at
FROM clientes 
ORDER BY created_at DESC
LIMIT 10;

-- 10. Verificar se a função de validação foi criada
SELECT 
    'Função de Validação' as verificacao,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'validate_cpf_cnpj';

-- 11. Testar a função de validação (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'validate_cpf_cnpj') THEN
        RAISE NOTICE 'Testando função de validação...';
        
        -- Teste com CPF válido
        IF validate_cpf_cnpj('123.456.789-09') THEN
            RAISE NOTICE 'CPF válido: OK';
        ELSE
            RAISE NOTICE 'CPF válido: FALHOU';
        END IF;
        
        -- Teste com CNPJ válido
        IF validate_cpf_cnpj('12.345.678/0001-90') THEN
            RAISE NOTICE 'CNPJ válido: OK';
        ELSE
            RAISE NOTICE 'CNPJ válido: FALHOU';
        END IF;
        
        -- Teste com formato inválido
        IF NOT validate_cpf_cnpj('123') THEN
            RAISE NOTICE 'Formato inválido: OK';
        ELSE
            RAISE NOTICE 'Formato inválido: FALHOU';
        END IF;
    ELSE
        RAISE NOTICE 'Função de validação não encontrada';
    END IF;
END $$;

-- 12. Resumo final da validação
SELECT 
    'RESUMO DA VALIDAÇÃO' as status,
    CASE 
        WHEN (SELECT COUNT(*) FROM clientes) = (SELECT COUNT(DISTINCT cpf_cnpj) FROM clientes) 
             AND (SELECT COUNT(*) FROM clientes WHERE cpf_cnpj IS NULL) = 0
             AND (SELECT COUNT(*) FROM clientes WHERE cpf_cnpj = '') = 0
        THEN '✅ MIGRAÇÃO BEM-SUCEDIDA'
        ELSE '❌ PROBLEMAS ENCONTRADOS'
    END as resultado;

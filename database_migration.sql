-- Script de migração para atualizar a estrutura da tabela clientes
-- Este script deve ser executado no Supabase SQL Editor

-- 1. Primeiro, vamos adicionar uma coluna temporária para CPF/CNPJ se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'cpf_cnpj') THEN
        ALTER TABLE clientes ADD COLUMN cpf_cnpj VARCHAR(18);
    END IF;
END $$;

-- 2. Atualizar registros existentes que não tenham CPF/CNPJ
-- Para clientes existentes sem CPF/CNPJ, vamos gerar um valor temporário baseado no ID
UPDATE clientes 
SET cpf_cnpj = CONCAT('TEMP_', id) 
WHERE cpf_cnpj IS NULL OR cpf_cnpj = '';

-- 3. Tornar o campo CPF/CNPJ NOT NULL
ALTER TABLE clientes ALTER COLUMN cpf_cnpj SET NOT NULL;

-- 4. Adicionar constraint de unicidade para CPF/CNPJ
-- Primeiro, vamos remover duplicatas se existirem
DELETE FROM clientes a USING clientes b 
WHERE a.id > b.id AND a.cpf_cnpj = b.cpf_cnpj;

-- Agora adicionar a constraint de unicidade
ALTER TABLE clientes ADD CONSTRAINT clientes_cpf_cnpj_unique UNIQUE (cpf_cnpj);

-- 5. Tornar o campo email opcional (remover NOT NULL se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'email' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE clientes ALTER COLUMN email DROP NOT NULL;
    END IF;
END $$;

-- 6. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- 7. Adicionar validação para CPF/CNPJ (opcional, mas recomendado)
-- Esta função valida se o CPF/CNPJ tem o formato correto
CREATE OR REPLACE FUNCTION validate_cpf_cnpj(cpf_cnpj VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove caracteres especiais
    cpf_cnpj := regexp_replace(cpf_cnpj, '[^0-9]', '', 'g');
    
    -- Validação básica de tamanho
    IF length(cpf_cnpj) NOT IN (11, 14) THEN
        RETURN FALSE;
    END IF;
    
    -- Validação básica de formato
    IF length(cpf_cnpj) = 11 THEN
        -- CPF: não pode ter todos os dígitos iguais
        IF cpf_cnpj = regexp_replace(cpf_cnpj, '^(\d)\1*$', '\1') THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Adicionar constraint de validação (opcional)
-- ALTER TABLE clientes ADD CONSTRAINT check_cpf_cnpj_format CHECK (validate_cpf_cnpj(cpf_cnpj));

-- 9. Comentários para documentação
COMMENT ON COLUMN clientes.cpf_cnpj IS 'CPF ou CNPJ do cliente - campo obrigatório e único';
COMMENT ON COLUMN clientes.email IS 'Email do cliente - campo opcional';
COMMENT ON TABLE clientes IS 'Tabela de clientes com CPF/CNPJ como identificador único';

-- 10. Verificar a estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

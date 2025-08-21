-- ========================================
-- FONTARA - PLATAFORMA FINANCEIRA
-- Script de configuração completa do banco
-- ========================================

-- ========================================
-- 1. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- ========================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE,
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  tipo_cliente VARCHAR(20) DEFAULT 'pessoa_fisica' CHECK (tipo_cliente IN ('pessoa_fisica', 'pessoa_juridica')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  cor VARCHAR(7) DEFAULT '#3B82F6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  tipo_produto VARCHAR(50) DEFAULT 'servico' CHECK (tipo_produto IN ('servico', 'produto', 'assinatura')),
  periodicidade VARCHAR(20) CHECK (periodicidade IN ('unico', 'mensal', 'trimestral', 'semestral', 'anual')),
  duracao_dias INTEGER,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contratos/Assinaturas
CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'suspenso', 'expirado')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  data_cancelamento DATE,
  valor_contratado DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações/Pagamentos
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('pagamento', 'reembolso', 'taxa', 'multa')),
  valor DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
  metodo_pagamento VARCHAR(50),
  referencia_externa VARCHAR(255),
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de Alterações
CREATE TABLE IF NOT EXISTS historico_alteracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabela VARCHAR(50) NOT NULL,
  registro_id UUID NOT NULL,
  campo VARCHAR(100) NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  usuario_id UUID,
  tipo_operacao VARCHAR(20) CHECK (tipo_operacao IN ('insercao', 'atualizacao', 'exclusao')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CRIAÇÃO DOS ÍNDICES
-- ========================================

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_produto ON contratos(produto_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_data_inicio ON contratos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_transacoes_contrato ON transacoes(contrato_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente ON transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_data_vencimento ON transacoes(data_vencimento);

-- ========================================
-- 3. FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_produtos_updated_at ON categorias_produtos;
CREATE TRIGGER update_categorias_produtos_updated_at BEFORE UPDATE ON categorias_produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contratos_updated_at ON contratos;
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transacoes_updated_at ON transacoes;
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. INSERÇÃO DE DADOS INICIAIS
-- ========================================

-- Inserir categorias de produtos
INSERT INTO categorias_produtos (nome, descricao, icone, cor) VALUES
('Investimentos', 'Produtos de investimento e aplicações financeiras', '💰', '#10B981'),
('Seguros', 'Produtos de seguros e proteção', '🛡️', '#3B82F6'),
('Crédito', 'Produtos de crédito e financiamento', '💳', '#F59E0B'),
('Previdência', 'Produtos de previdência privada', '🏦', '#8B5CF6'),
('Consultoria', 'Serviços de consultoria financeira', '📊', '#EF4444')
ON CONFLICT DO NOTHING;

-- Inserir produtos
INSERT INTO produtos (categoria_id, nome, descricao, preco, tipo_produto, periodicidade, duracao_dias, destaque) VALUES
((SELECT id FROM categorias_produtos WHERE nome = 'Investimentos'), 'Plano de Aposentadoria', 'Plano de aposentadoria com aportes mensais e rendimento atrativo', 150.00, 'assinatura', 'mensal', 365, true),
((SELECT id FROM categorias_produtos WHERE nome = 'Investimentos'), 'Fundos Imobiliários', 'Investimento em fundos imobiliários com rendimento mensal', 5000.00, 'produto', 'unico', NULL, true),
((SELECT id FROM categorias_produtos WHERE nome = 'Seguros'), 'Seguro de Vida', 'Seguro de vida com cobertura de até R$ 500.000', 89.90, 'assinatura', 'mensal', 365, false),
((SELECT id FROM categorias_produtos WHERE nome = 'Crédito'), 'Empréstimo Pessoal', 'Empréstimo pessoal com juros baixos e parcelas flexíveis', 0.00, 'servico', 'unico', NULL, false),
((SELECT id FROM categorias_produtos WHERE nome = 'Consultoria'), 'Consultoria Financeira', 'Sessão de consultoria financeira personalizada', 200.00, 'servico', 'unico', NULL, true)
ON CONFLICT DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, email, cpf_cnpj, telefone, cidade, estado, tipo_cliente) VALUES
('João Silva', 'joao.silva@email.com', '123.456.789-00', '(11) 99999-9999', 'São Paulo', 'SP', 'pessoa_fisica'),
('Maria Santos', 'maria.santos@email.com', '987.654.321-00', '(11) 88888-8888', 'São Paulo', 'SP', 'pessoa_fisica'),
('Empresa ABC Ltda', 'contato@abc.com.br', '12.345.678/0001-90', '(11) 77777-7777', 'São Paulo', 'SP', 'pessoa_juridica'),
('Pedro Costa', 'pedro.costa@email.com', '111.222.333-44', '(11) 66666-6666', 'Rio de Janeiro', 'RJ', 'pessoa_fisica')
ON CONFLICT DO NOTHING;

-- Inserir contratos de exemplo
INSERT INTO contratos (cliente_id, produto_id, status, data_inicio, data_fim, valor_contratado, forma_pagamento) VALUES
((SELECT id FROM clientes WHERE email = 'joao.silva@email.com'), (SELECT id FROM produtos WHERE nome = 'Plano de Aposentadoria'), 'ativo', '2024-01-01', '2024-12-31', 150.00, 'cartao_credito'),
((SELECT id FROM clientes WHERE email = 'maria.santos@email.com'), (SELECT id FROM produtos WHERE nome = 'Seguro de Vida'), 'ativo', '2024-02-01', '2025-01-31', 89.90, 'boleto'),
((SELECT id FROM clientes WHERE email = 'pedro.costa@email.com'), (SELECT id FROM produtos WHERE nome = 'Consultoria Financeira'), 'ativo', '2024-03-01', NULL, 200.00, 'pix')
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. CRIAÇÃO DAS VIEWS
-- ========================================

-- View para dashboard de clientes
CREATE OR REPLACE VIEW dashboard_clientes AS
SELECT 
  c.id,
  c.nome,
  c.email,
  c.tipo_cliente,
  c.status,
  c.cidade,
  c.estado,
  COUNT(co.id) as total_contratos,
  COUNT(CASE WHEN co.status = 'ativo' THEN 1 END) as contratos_ativos,
  SUM(CASE WHEN co.status = 'ativo' THEN co.valor_contratado ELSE 0 END) as valor_total_contratos,
  c.created_at
FROM clientes c
LEFT JOIN contratos co ON c.id = co.cliente_id
GROUP BY c.id, c.nome, c.email, c.tipo_cliente, c.status, c.cidade, c.estado, c.created_at;

-- View para relatório financeiro
CREATE OR REPLACE VIEW relatorio_financeiro AS
SELECT 
  DATE_TRUNC('month', t.created_at) as mes,
  COUNT(t.id) as total_transacoes,
  SUM(CASE WHEN t.tipo = 'pagamento' THEN t.valor ELSE 0 END) as total_recebido,
  SUM(CASE WHEN t.tipo = 'reembolso' THEN t.valor ELSE 0 END) as total_reembolsos,
  SUM(CASE WHEN t.status = 'pendente' THEN t.valor ELSE 0 END) as total_pendente
FROM transacoes t
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY mes DESC;

-- ========================================
-- 6. CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_alteracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (apenas usuários autenticados podem ver/editar)
DROP POLICY IF EXISTS "Usuários autenticados podem ver clientes" ON clientes;
CREATE POLICY "Usuários autenticados podem ver clientes" ON clientes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON clientes;
CREATE POLICY "Usuários autenticados podem inserir clientes" ON clientes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON clientes;
CREATE POLICY "Usuários autenticados podem atualizar clientes" ON clientes FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON clientes;
CREATE POLICY "Usuários autenticados podem deletar clientes" ON clientes FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para produtos (todos podem ver, apenas admin pode editar)
DROP POLICY IF EXISTS "Todos podem ver produtos" ON produtos;
CREATE POLICY "Todos podem ver produtos" ON produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admin pode inserir produtos" ON produtos;
CREATE POLICY "Apenas admin pode inserir produtos" ON produtos FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Apenas admin pode atualizar produtos" ON produtos;
CREATE POLICY "Apenas admin pode atualizar produtos" ON produtos FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Apenas admin pode deletar produtos" ON produtos;
CREATE POLICY "Apenas admin pode deletar produtos" ON produtos FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para contratos
DROP POLICY IF EXISTS "Usuários autenticados podem ver contratos" ON contratos;
CREATE POLICY "Usuários autenticados podem ver contratos" ON contratos FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários autenticados podem inserir contratos" ON contratos;
CREATE POLICY "Usuários autenticados podem inserir contratos" ON contratos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contratos" ON contratos;
CREATE POLICY "Usuários autenticados podem atualizar contratos" ON contratos FOR UPDATE USING (auth.role() = 'authenticated');

-- ========================================
-- 7. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se todas as tabelas foram criadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clientes', 'categorias_produtos', 'produtos', 'contratos', 'transacoes', 'historico_alteracoes')
ORDER BY tablename;

-- Verificar dados inseridos
SELECT 'Clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Categorias' as tabela, COUNT(*) as total FROM categorias_produtos
UNION ALL
SELECT 'Produtos' as tabela, COUNT(*) as total FROM produtos
UNION ALL
SELECT 'Contratos' as tabela, COUNT(*) as total FROM contratos;

-- ========================================
-- FIM DO SCRIPT - FONTARA CONFIGURADA!
-- ========================================

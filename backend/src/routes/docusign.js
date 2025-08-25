const express = require('express');
const router = express.Router();
const DocuSignService = require('../services/docusignService');

const docusignService = new DocuSignService();

// Middleware para autenticação DocuSign
const authenticateDocuSign = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de autenticação necessário'
    });
  }

  // Aqui você implementaria a validação do token DocuSign
  // Por enquanto, vamos aceitar qualquer token Bearer
  const token = authHeader.substring(7);
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token inválido'
    });
  }

  // TODO: Implementar validação real do token DocuSign
  req.docuSignToken = token;
  next();
};

// GET /api/docusign/clientes - Listar clientes (Data IO Read)
router.get('/clientes', authenticateDocuSign, async (req, res) => {
  try {
    const { limit = 100, offset = 0, status, tipo_cliente } = req.query;
    
    // Usar o serviço DocuSign para operação de leitura
    const options = { limit: parseInt(limit), offset: parseInt(offset) };
    
    if (status || tipo_cliente) {
      options.filters = { status, tipo_cliente };
    }

    const result = await docusignService.readData('cliente', options);
    
    // Log de auditoria
    docusignService.logAudit('read', 'cliente', { options }, result);

    res.json(result);

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao buscar clientes'
    });
  }
});

// GET /api/docusign/clientes/:id - Buscar cliente por ID (Data IO Read)
router.get('/clientes/:id', authenticateDocuSign, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Usar o serviço DocuSign para operação de leitura específica
    const options = { id, limit: 1 };
    const result = await docusignService.readData('cliente', options);
    
    // Log de auditoria
    docusignService.logAudit('read_by_id', 'cliente', { id }, result);

    res.json(result);

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao buscar cliente'
    });
  }
});

// POST /api/docusign/clientes - Criar cliente (Data IO Write)
router.post('/clientes', authenticateDocuSign, async (req, res) => {
  try {
    const clienteData = req.body;
    
    // Validar dados usando o serviço DocuSign
    docusignService.validateData('cliente', clienteData);
    
    // Usar o serviço DocuSign para operação de escrita
    const result = await docusignService.writeData('cliente', clienteData, 'create');
    
    // Log de auditoria
    docusignService.logAudit('create', 'cliente', clienteData, result);

    res.status(201).json(result);

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    if (error.message.includes('Validação falhou')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao criar cliente'
    });
  }
});

// PUT /api/docusign/clientes/:id - Atualizar cliente (Data IO Write)
router.put('/clientes/:id', authenticateDocuSign, async (req, res) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;
    
    // Validar dados usando o serviço DocuSign
    docusignService.validateData('cliente', clienteData);
    
    // Usar o serviço DocuSign para operação de escrita
    const result = await docusignService.writeData('cliente', { id, ...clienteData }, 'update');
    
    // Log de auditoria
    docusignService.logAudit('update', 'cliente', { id, ...clienteData }, result);

    res.json(result);

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    
    if (error.message.includes('Validação falhou')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao atualizar cliente'
    });
  }
});

// POST /api/docusign/clientes/search - Busca avançada (Data IO Query)
router.post('/clientes/search', authenticateDocuSign, async (req, res) => {
  try {
    const { query, filters, limit = 100, offset = 0 } = req.body;
    
    // Usar o serviço DocuSign para consulta personalizada
    const result = await docusignService.queryData('cliente', query, { ...filters, limit, offset });
    
    // Log de auditoria
    docusignService.logAudit('search', 'cliente', { query, filters, limit, offset }, result);

    res.json(result);

  } catch (error) {
    console.error('Erro na busca avançada:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro na busca avançada'
    });
  }
});

// Endpoint de autenticação para DocuSign
router.post('/auth/token', (req, res) => {
  try {
    // TODO: Implementar autenticação real com DocuSign
    // Por enquanto, retornamos um token mockado
    const mockToken = {
      access_token: 'mock_docusign_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'data:read data:write'
    };

    res.json(mockToken);

  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro na autenticação'
    });
  }
});

module.exports = router;

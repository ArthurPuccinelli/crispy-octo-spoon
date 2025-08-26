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
        const result = await docusignService.writeData('cliente', { ...clienteData, id }, 'update');

        // Log de auditoria
        docusignService.logAudit('update', 'cliente', { id, ...clienteData }, result);

        res.json(result);

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao atualizar cliente'
        });
    }
});

// DELETE /api/docusign/clientes/:id - Deletar cliente (Data IO Write)
router.delete('/clientes/:id', authenticateDocuSign, async (req, res) => {
    try {
        const { id } = req.params;

        // Usar o serviço DocuSign para operação de escrita (soft delete)
        const result = await docusignService.writeData('cliente', { id, status: 'deleted' }, 'delete');

        // Log de auditoria
        docusignService.logAudit('delete', 'cliente', { id }, result);

        res.json(result);

    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao deletar cliente'
        });
    }
});

// GET /api/docusign/produtos - Listar produtos
router.get('/produtos', authenticateDocuSign, async (req, res) => {
    try {
        const { limit = 100, offset = 0, categoria, status } = req.query;

        const options = { limit: parseInt(limit), offset: parseInt(offset) };

        if (categoria || status) {
            options.filters = { categoria, status };
        }

        const result = await docusignService.readData('produto', options);

        docusignService.logAudit('read', 'produto', { options }, result);

        res.json(result);

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao buscar produtos'
        });
    }
});

// POST /api/docusign/produtos - Criar produto
router.post('/produtos', authenticateDocuSign, async (req, res) => {
    try {
        const produtoData = req.body;

        docusignService.validateData('produto', produtoData);

        const result = await docusignService.writeData('produto', produtoData, 'create');

        docusignService.logAudit('create', 'produto', produtoData, result);

        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao criar produto'
        });
    }
});

// GET /api/docusign/servicos - Listar serviços
router.get('/servicos', authenticateDocuSign, async (req, res) => {
    try {
        const { limit = 100, offset = 0, tipo, status } = req.query;

        const options = { limit: parseInt(limit), offset: parseInt(offset) };

        if (tipo || status) {
            options.filters = { tipo, status };
        }

        const result = await docusignService.readData('servico', options);

        docusignService.logAudit('read', 'servico', { options }, result);

        res.json(result);

    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao buscar serviços'
        });
    }
});

// POST /api/docusign/servicos - Criar serviço
router.post('/servicos', authenticateDocuSign, async (req, res) => {
    try {
        const servicoData = req.body;

        docusignService.validateData('servico', servicoData);

        const result = await docusignService.writeData('servico', servicoData, 'create');

        docusignService.logAudit('create', 'servico', servicoData, result);

        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erro ao criar serviço'
        });
    }
});

module.exports = router;

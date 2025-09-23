const express = require('express');
const router = express.Router();
const ClientesService = require('../services/clientesService');

const clientesService = new ClientesService();

// Middleware para autenticação DocuSign (reutiliza o existente)
const authenticateDocuSign = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token de autenticação necessário',
            code: 'AUTH_REQUIRED'
        });
    }

    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }

    // TODO: Implementar validação real do token DocuSign
    req.docuSignToken = token;
    next();
};

// Middleware para validação de dados
const validateClienteData = (req, res, next) => {
    const { nome, cpf_cnpj, tipo_cliente } = req.body;

    if (!nome || !cpf_cnpj || !tipo_cliente) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Campos obrigatórios: nome, cpf_cnpj, tipo_cliente',
            code: 'MISSING_REQUIRED_FIELDS',
            requiredFields: ['nome', 'cpf_cnpj', 'tipo_cliente']
        });
    }

    if (!['pessoa_fisica', 'pessoa_juridica'].includes(tipo_cliente)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Tipo de cliente deve ser "pessoa_fisica" ou "pessoa_juridica"',
            code: 'INVALID_TIPO_CLIENTE'
        });
    }

    next();
};

// GET /api/clientes - Listar todos os clientes (Data IO Read)
// Compatível com DocuSign Extension App Data IO
router.get('/', authenticateDocuSign, async (req, res) => {
    try {
        const {
            limit = 50,
            offset = 0,
            status,
            tipo_cliente,
            cidade,
            estado,
            search
        } = req.query;

        // Validar parâmetros de paginação
        const validLimit = Math.min(parseInt(limit) || 50, 100);
        const validOffset = Math.max(parseInt(offset) || 0, 0);

        const options = {
            limit: validLimit,
            offset: validOffset,
            status,
            tipo_cliente,
            cidade,
            estado,
            search
        };

        const result = await clientesService.listarClientes(options);



        res.json(result);

    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'LIST_CLIENTES_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/clientes/:id - Buscar cliente por ID (Data IO Read)
// Compatível com DocuSign Extension App Data IO
router.get('/:id', authenticateDocuSign, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'ID do cliente é obrigatório',
                code: 'MISSING_CLIENTE_ID'
            });
        }

        const result = await clientesService.buscarClientePorId(id);



        res.json(result);

    } catch (error) {
        console.error('Erro ao buscar cliente por ID:', error);

        if (error.message.includes('não encontrado')) {
            return res.status(404).json({
                error: 'Not Found',
                message: error.message,
                code: 'CLIENTE_NOT_FOUND',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'GET_CLIENTE_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/clientes - Criar novo cliente (Data IO Write)
// Compatível com DocuSign Extension App Data IO
router.post('/', authenticateDocuSign, validateClienteData, async (req, res) => {
    try {
        const clienteData = req.body;



        const result = await clientesService.criarCliente(clienteData);



        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao criar cliente:', error);

        if (error.message.includes('Validação falhou')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: error.message,
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'CREATE_CLIENTE_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// PUT /api/clientes/:id - Atualizar cliente existente (Data IO Write)
// Compatível com DocuSign Extension App Data IO
router.put('/:id', authenticateDocuSign, validateClienteData, async (req, res) => {
    try {
        const { id } = req.params;
        const clienteData = req.body;

        if (!id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'ID do cliente é obrigatório',
                code: 'MISSING_CLIENTE_ID'
            });
        }



        const result = await clientesService.atualizarCliente(id, clienteData);



        res.json(result);

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);

        if (error.message.includes('não encontrado')) {
            return res.status(404).json({
                error: 'Not Found',
                message: error.message,
                code: 'CLIENTE_NOT_FOUND',
                timestamp: new Date().toISOString()
            });
        }

        if (error.message.includes('Validação falhou')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: error.message,
                code: 'VALIDATION_ERROR',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'UPDATE_CLIENTE_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/clientes/:id - Remover cliente (Data IO Write - Soft Delete)
// Compatível com DocuSign Extension App Data IO
router.delete('/:id', authenticateDocuSign, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'ID do cliente é obrigatório',
                code: 'MISSING_CLIENTE_ID'
            });
        }



        const result = await clientesService.removerCliente(id);



        res.json(result);

    } catch (error) {
        console.error('Erro ao remover cliente:', error);

        if (error.message.includes('não encontrado')) {
            return res.status(404).json({
                error: 'Not Found',
                message: error.message,
                code: 'CLIENTE_NOT_FOUND',
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'DELETE_CLIENTE_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/clientes/stats/estatisticas - Obter estatísticas dos clientes
// Compatível com DocuSign Extension App Data IO
router.get('/stats/estatisticas', authenticateDocuSign, async (req, res) => {
    try {
        const result = await clientesService.obterEstatisticas();



        res.json(result);

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'STATS_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/clientes/search/buscar - Busca avançada de clientes
// Compatível com DocuSign Extension App Data IO
router.get('/search/buscar', authenticateDocuSign, async (req, res) => {
    try {
        const {
            q, // query de busca
            limit = 50,
            offset = 0,
            status,
            tipo_cliente,
            cidade,
            estado
        } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Parâmetro de busca "q" é obrigatório',
                code: 'MISSING_SEARCH_QUERY'
            });
        }

        const options = {
            limit: Math.min(parseInt(limit) || 50, 100),
            offset: Math.max(parseInt(offset) || 0, 0),
            search: q,
            status,
            tipo_cliente,
            cidade,
            estado
        };

        const result = await clientesService.listarClientes(options);



        res.json(result);

    } catch (error) {
        console.error('Erro na busca de clientes:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            code: 'SEARCH_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// Middleware de tratamento de erros específico para rotas de clientes
router.use((err, req, res, next) => {
    console.error('Erro nas rotas de clientes:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro interno nas rotas de clientes',
        code: 'CLIENTES_ROUTES_ERROR',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

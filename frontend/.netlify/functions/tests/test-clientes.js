/**
 * 🧪 Testes para API de Clientes - Crispy Octo Spoon
 * 
 * Este arquivo contém testes para validar as funcionalidades da API de clientes
 * compatível com DocuSign Extension App Data IO.
 * 
 * Para executar os testes:
 * 1. Configure as variáveis de ambiente
 * 2. Execute: node tests/test-clientes.js
 */

const axios = require('axios');

// Configurações de teste
const TEST_CONFIG = {
    baseURL: process.env.TEST_API_URL || 'http://localhost:8888/.netlify/functions/api',
    authToken: process.env.TEST_AUTH_TOKEN || 'test_token_docusign',
    timeout: 10000
};

// Cliente de teste
const TEST_CLIENTE = {
    nome: 'João Silva Teste',
    cpf_cnpj: '123.456.789-00',
    tipo_cliente: 'pessoa_fisica',
    email: 'joao.teste@email.com',
    telefone: '(11) 99999-9999',
    cidade: 'São Paulo',
    estado: 'SP'
};

// Cliente pessoa jurídica para teste
const TEST_CLIENTE_PJ = {
    nome: 'Empresa Teste Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    tipo_cliente: 'pessoa_juridica',
    email: 'contato@empresa-teste.com',
    telefone: '(11) 88888-8888',
    cidade: 'São Paulo',
    estado: 'SP'
};

// Função para criar cliente de teste
async function criarClienteTeste(clienteData = TEST_CLIENTE) {
    try {
        const response = await axios.post('/clientes', clienteData, {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Cliente de teste criado:', response.data.data.id);
        return response.data.data;
    } catch (error) {
        console.error('❌ Erro ao criar cliente de teste:', error.response?.data || error.message);
        throw error;
    }
}

// Função para limpar cliente de teste
async function limparClienteTeste(clienteId) {
    try {
        await axios.delete(`/clientes/${clienteId}`, {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        console.log('🧹 Cliente de teste removido:', clienteId);
    } catch (error) {
        console.error('⚠️ Erro ao limpar cliente de teste:', error.response?.data || error.message);
    }
}

// Teste 1: Listar Clientes
async function testListarClientes() {
    console.log('\n🧪 Teste 1: Listar Clientes');

    try {
        const response = await axios.get('/clientes?limit=10', {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        console.log('✅ Listagem de clientes:', {
            status: response.status,
            total: response.data.pagination?.total || 0,
            count: response.data.data?.length || 0
        });

        // Validar estrutura da resposta
        if (response.data.success && Array.isArray(response.data.data)) {
            console.log('✅ Estrutura da resposta válida');
        } else {
            throw new Error('Estrutura da resposta inválida');
        }

        return response.data;
    } catch (error) {
        console.error('❌ Teste de listagem falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 2: Criar Cliente
async function testCriarCliente() {
    console.log('\n🧪 Teste 2: Criar Cliente');

    try {
        const response = await axios.post('/clientes', TEST_CLIENTE, {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Cliente criado:', {
            status: response.status,
            id: response.data.data.id,
            nome: response.data.data.nome
        });

        // Validar estrutura da resposta
        if (response.data.success && response.data.data.id) {
            console.log('✅ Estrutura da resposta válida');
        } else {
            throw new Error('Estrutura da resposta inválida');
        }

        return response.data.data;
    } catch (error) {
        console.error('❌ Teste de criação falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 3: Buscar Cliente por ID
async function testBuscarClientePorId(clienteId) {
    console.log('\n🧪 Teste 3: Buscar Cliente por ID');

    try {
        const response = await axios.get(`/clientes/${clienteId}`, {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        console.log('✅ Cliente encontrado:', {
            status: response.status,
            id: response.data.data.id,
            nome: response.data.data.nome
        });

        // Validar estrutura da resposta
        if (response.data.success && response.data.data.id === clienteId) {
            console.log('✅ Estrutura da resposta válida');
        } else {
            throw new Error('Estrutura da resposta inválida');
        }

        return response.data.data;
    } catch (error) {
        console.error('❌ Teste de busca por ID falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 4: Atualizar Cliente
async function testAtualizarCliente(clienteId) {
    console.log('\n🧪 Teste 4: Atualizar Cliente');

    const dadosAtualizacao = {
        telefone: '(11) 77777-7777',
        cidade: 'Belo Horizonte',
        estado: 'MG'
    };

    try {
        const response = await axios.put(`/clientes/${clienteId}`, dadosAtualizacao, {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Cliente atualizado:', {
            status: response.status,
            id: response.data.data.id,
            telefone: response.data.data.telefone,
            cidade: response.data.data.cidade,
            estado: response.data.data.estado
        });

        // Validar se os dados foram atualizados
        if (response.data.data.telefone === dadosAtualizacao.telefone &&
            response.data.data.cidade === dadosAtualizacao.cidade &&
            response.data.data.estado === dadosAtualizacao.estado) {
            console.log('✅ Dados atualizados corretamente');
        } else {
            throw new Error('Dados não foram atualizados corretamente');
        }

        return response.data.data;
    } catch (error) {
        console.error('❌ Teste de atualização falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 5: Busca Avançada
async function testBuscaAvancada() {
    console.log('\n🧪 Teste 5: Busca Avançada');

    try {
        const response = await axios.get('/clientes/search/buscar?q=João&limit=5', {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        console.log('✅ Busca avançada executada:', {
            status: response.status,
            query: 'João',
            resultCount: response.data.data?.length || 0
        });

        // Validar estrutura da resposta
        if (response.data.success && Array.isArray(response.data.data)) {
            console.log('✅ Estrutura da resposta válida');
        } else {
            throw new Error('Estrutura da resposta inválida');
        }

        return response.data;
    } catch (error) {
        console.error('❌ Teste de busca avançada falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 6: Estatísticas
async function testEstatisticas() {
    console.log('\n🧪 Teste 6: Estatísticas');

    try {
        const response = await axios.get('/clientes/stats/estatisticas', {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        console.log('✅ Estatísticas obtidas:', {
            status: response.status,
            total: response.data.data?.total || 0
        });

        // Validar estrutura da resposta
        if (response.data.success && response.data.data.total !== undefined) {
            console.log('✅ Estrutura da resposta válida');
        } else {
            throw new Error('Estrutura da resposta inválida');
        }

        return response.data;
    } catch (error) {
        console.error('❌ Teste de estatísticas falhou:', error.response?.data || error.message);
        throw error;
    }
}

// Teste 7: Validações
async function testValidacoes() {
    console.log('\n🧪 Teste 7: Validações');

    const testes = [
        {
            nome: 'Teste sem nome',
            dados: { cpf_cnpj: '123.456.789-00', tipo_cliente: 'pessoa_fisica' },
            esperado: 400
        },
        {
            nome: 'Teste sem CPF/CNPJ',
            dados: { nome: 'Teste', tipo_cliente: 'pessoa_fisica' },
            esperado: 400
        },
        {
            nome: 'Teste tipo cliente inválido',
            dados: { nome: 'Teste', cpf_cnpj: '123.456.789-00', tipo_cliente: 'invalido' },
            esperado: 400
        }
    ];

    for (const teste of testes) {
        try {
            await axios.post('/clientes', teste.dados, {
                baseURL: TEST_CONFIG.baseURL,
                headers: {
                    'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`❌ ${teste.nome}: Deveria ter falhado`);
        } catch (error) {
            if (error.response?.status === teste.esperado) {
                console.log(`✅ ${teste.nome}: Falhou corretamente com status ${teste.esperado}`);
            } else {
                console.log(`⚠️ ${teste.nome}: Falhou com status ${error.response?.status}, esperado ${teste.esperado}`);
            }
        }
    }
}

// Teste 8: Autenticação
async function testAutenticacao() {
    console.log('\n🧪 Teste 8: Autenticação');

    try {
        await axios.get('/clientes', {
            baseURL: TEST_CONFIG.baseURL
            // Sem header de autorização
        });

        console.log('❌ Deveria ter falhado sem autenticação');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Autenticação requerida corretamente');
        } else {
            console.log(`⚠️ Falhou com status ${error.response?.status}, esperado 401`);
        }
    }

    try {
        await axios.get('/clientes', {
            baseURL: TEST_CONFIG.baseURL,
            headers: {
                'Authorization': 'Bearer token_invalido'
            }
        });

        console.log('❌ Deveria ter falhado com token inválido');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Token inválido rejeitado corretamente');
        } else {
            console.log(`⚠️ Falhou com status ${error.response?.status}, esperado 401`);
        }
    }
}

// Executar todos os testes
async function executarTodosTestes() {
    console.log('🚀 Iniciando testes da API de Clientes');
    console.log('📍 URL Base:', TEST_CONFIG.baseURL);
    console.log('🔑 Token de Teste:', TEST_CONFIG.authToken ? 'Configurado' : 'Não configurado');

    let clienteTeste = null;

    try {
        // Testes básicos
        await testListarClientes();
        await testAutenticacao();
        await testValidacoes();

        // Testes que criam/modificam dados
        clienteTeste = await testCriarCliente();
        await testBuscarClientePorId(clienteTeste.id);
        await testAtualizarCliente(clienteTeste.id);
        await testBuscaAvancada();
        await testEstatisticas();

        console.log('\n🎉 Todos os testes passaram com sucesso!');

    } catch (error) {
        console.error('\n💥 Alguns testes falharam:', error.message);
    } finally {
        // Limpeza
        if (clienteTeste) {
            await limparClienteTeste(clienteTeste.id);
        }

        console.log('\n🏁 Testes concluídos');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    executarTodosTestes().catch(console.error);
}

module.exports = {
    executarTodosTestes,
    testListarClientes,
    testCriarCliente,
    testBuscarClientePorId,
    testAtualizarCliente,
    testBuscaAvancada,
    testEstatisticas,
    testValidacoes,
    testAutenticacao
};

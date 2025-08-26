/**
 * 🧪 Testes para API de Clientes em PRODUÇÃO - Crispy Octo Spoon
 * 
 * Este arquivo contém testes para validar as funcionalidades da API de clientes
 * em ambiente de produção no Netlify.
 * 
 * Para executar os testes:
 * 1. Configure as variáveis de ambiente
 * 2. Execute: node tests/test-producao.js
 */

const axios = require('axios');

// Configurações para PRODUÇÃO
const PROD_CONFIG = {
  baseURL: process.env.PROD_API_URL || 'https://crispy-octo-spoon.netlify.app/.netlify/functions/api',
  authToken: process.env.PROD_AUTH_TOKEN || 'test_token_docusign_producao',
  timeout: 15000, // Timeout maior para produção
  retries: 3
};

// Cliente de teste para produção
const TEST_CLIENTE_PROD = {
  nome: 'Cliente Teste Produção',
  cpf_cnpj: '987.654.321-00',
  tipo_cliente: 'pessoa_fisica',
  email: 'teste.producao@email.com',
  telefone: '(11) 99999-8888',
  cidade: 'São Paulo',
  estado: 'SP'
};

// Função para aguardar deploy
function aguardarDeploy() {
  return new Promise((resolve) => {
    console.log('⏳ Aguardando deploy do Netlify...');
    console.log('📍 URL de produção:', PROD_CONFIG.baseURL);
    console.log('🔄 Verificando se a API está online...');
    
    // Aguardar 30 segundos para o deploy
    setTimeout(resolve, 30000);
  });
}

// Função para verificar se a API está online
async function verificarAPIOnline() {
  try {
    console.log('🔍 Verificando se a API está online...');
    
    const response = await axios.get('/', {
      baseURL: PROD_CONFIG.baseURL,
      timeout: 10000
    });
    
    if (response.status === 200) {
      console.log('✅ API está online!');
      console.log('📊 Resposta:', response.data);
      return true;
    }
  } catch (error) {
    console.log('❌ API ainda não está online:', error.message);
    return false;
  }
}

// Função para aguardar API ficar online
async function aguardarAPIOnline() {
  let tentativas = 0;
  const maxTentativas = 10;
  
  while (tentativas < maxTentativas) {
    tentativas++;
    console.log(`🔄 Tentativa ${tentativas}/${maxTentativas}...`);
    
    if (await verificarAPIOnline()) {
      return true;
    }
    
    // Aguardar 10 segundos entre tentativas
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  throw new Error('API não ficou online após várias tentativas');
}

// Função para criar cliente de teste
async function criarClienteTeste(clienteData = TEST_CLIENTE_PROD) {
  try {
    const response = await axios.post('/clientes', clienteData, {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: PROD_CONFIG.timeout
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
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`
      },
      timeout: PROD_CONFIG.timeout
    });
    
    console.log('🧹 Cliente de teste removido:', clienteId);
  } catch (error) {
    console.error('⚠️ Erro ao limpar cliente de teste:', error.response?.data || error.message);
  }
}

// Teste 1: Verificar API Online
async function testAPIOnline() {
  console.log('\n🧪 Teste 1: Verificar API Online');
  
  try {
    const response = await axios.get('/', {
      baseURL: PROD_CONFIG.baseURL,
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ API respondendo:', {
      status: response.status,
      message: response.data.message,
      environment: response.data.environment
    });

    return response.data;
  } catch (error) {
    console.error('❌ API não está respondendo:', error.message);
    throw error;
  }
}

// Teste 2: Health Check
async function testHealthCheck() {
  console.log('\n🧪 Teste 2: Health Check');
  
  try {
    const response = await axios.get('/health', {
      baseURL: PROD_CONFIG.baseURL,
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Health Check:', {
      status: response.status,
      health: response.data.status,
      environment: response.data.environment
    });

    return response.data;
  } catch (error) {
    console.error('❌ Health Check falhou:', error.message);
    throw error;
  }
}

// Teste 3: Listar Clientes (sem autenticação - deve falhar)
async function testListarClientesSemAuth() {
  console.log('\n🧪 Teste 3: Listar Clientes sem Autenticação');
  
  try {
    await axios.get('/clientes', {
      baseURL: PROD_CONFIG.baseURL,
      timeout: PROD_CONFIG.timeout
    });
    
    console.log('❌ Deveria ter falhado sem autenticação');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Autenticação requerida corretamente (401)');
      return true;
    } else {
      console.log(`⚠️ Falhou com status ${error.response?.status}, esperado 401`);
      return false;
    }
  }
}

// Teste 4: Listar Clientes (com autenticação)
async function testListarClientesComAuth() {
  console.log('\n🧪 Teste 4: Listar Clientes com Autenticação');
  
  try {
    const response = await axios.get('/clientes?limit=5', {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Listagem de clientes:', {
      status: response.status,
      total: response.data.pagination?.total || 0,
      count: response.data.data?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ Listagem de clientes falhou:', error.response?.data || error.message);
    throw error;
  }
}

// Teste 5: Criar Cliente
async function testCriarCliente() {
  console.log('\n🧪 Teste 5: Criar Cliente');
  
  try {
    const response = await axios.post('/clientes', TEST_CLIENTE_PROD, {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Cliente criado:', {
      status: response.status,
      id: response.data.data.id,
      nome: response.data.data.nome
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Criação de cliente falhou:', error.response?.data || error.message);
    throw error;
  }
}

// Teste 6: Buscar Cliente por ID
async function testBuscarClientePorId(clienteId) {
  console.log('\n🧪 Teste 6: Buscar Cliente por ID');
  
  try {
    const response = await axios.get(`/clientes/${clienteId}`, {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Cliente encontrado:', {
      status: response.status,
      id: response.data.data.id,
      nome: response.data.data.nome
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Busca por ID falhou:', error.response?.data || error.message);
    throw error;
  }
}

// Teste 7: Atualizar Cliente
async function testAtualizarCliente(clienteId) {
  console.log('\n🧪 Teste 7: Atualizar Cliente');
  
  const dadosAtualizacao = {
    telefone: '(11) 77777-7777',
    cidade: 'Belo Horizonte',
    estado: 'MG'
  };

  try {
    const response = await axios.put(`/clientes/${clienteId}`, dadosAtualizacao, {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Cliente atualizado:', {
      status: response.status,
      telefone: response.data.data.telefone,
      cidade: response.data.data.cidade,
      estado: response.data.data.estado
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Atualização falhou:', error.response?.data || error.message);
    throw error;
  }
}

// Teste 8: Estatísticas
async function testEstatisticas() {
  console.log('\n🧪 Teste 8: Estatísticas');
  
  try {
    const response = await axios.get('/clientes/stats/estatisticas', {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Estatísticas obtidas:', {
      status: response.status,
      total: response.data.data?.total || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ Estatísticas falharam:', error.response?.data || error.message);
    throw error;
  }
}

// Teste 9: Busca Avançada
async function testBuscaAvancada() {
  console.log('\n🧪 Teste 9: Busca Avançada');
  
  try {
    const response = await axios.get('/clientes/search/buscar?q=Teste&limit=5', {
      baseURL: PROD_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${PROD_CONFIG.authToken}`
      },
      timeout: PROD_CONFIG.timeout
    });

    console.log('✅ Busca avançada executada:', {
      status: response.status,
      query: 'Teste',
      resultCount: response.data.data?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ Busca avançada falhou:', error.response?.data || error.message);
    throw error;
  }
}

// Executar todos os testes de produção
async function executarTestesProducao() {
  console.log('🚀 Iniciando testes da API de Clientes em PRODUÇÃO');
  console.log('📍 URL Base:', PROD_CONFIG.baseURL);
  console.log('🔑 Token de Teste:', PROD_CONFIG.authToken ? 'Configurado' : 'Não configurado');
  console.log('⏱️ Timeout:', PROD_CONFIG.timeout + 'ms');
  
  let clienteTeste = null;
  
  try {
    // Aguardar deploy e API ficar online
    await aguardarDeploy();
    await aguardarAPIOnline();
    
    // Testes básicos
    await testAPIOnline();
    await testHealthCheck();
    await testListarClientesSemAuth();
    await testListarClientesComAuth();
    
    // Testes que criam/modificam dados
    clienteTeste = await testCriarCliente();
    await testBuscarClientePorId(clienteTeste.id);
    await testAtualizarCliente(clienteTeste.id);
    await testEstatisticas();
    await testBuscaAvancada();
    
    console.log('\n🎉 Todos os testes de PRODUÇÃO passaram com sucesso!');
    console.log('🌐 A API está funcionando perfeitamente em produção!');
    
  } catch (error) {
    console.error('\n💥 Alguns testes de PRODUÇÃO falharam:', error.message);
    console.error('🔍 Verifique os logs do Netlify para mais detalhes');
  } finally {
    // Limpeza
    if (clienteTeste) {
      console.log('\n🧹 Limpando dados de teste...');
      await limparClienteTeste(clienteTeste.id);
    }
    
    console.log('\n🏁 Testes de PRODUÇÃO concluídos');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestesProducao().catch(console.error);
}

module.exports = {
  executarTestesProducao,
  testAPIOnline,
  testHealthCheck,
  testListarClientesSemAuth,
  testListarClientesComAuth,
  testCriarCliente,
  testBuscarClientePorId,
  testAtualizarCliente,
  testEstatisticas,
  testBuscaAvancada
};

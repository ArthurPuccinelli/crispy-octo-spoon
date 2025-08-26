/**
 * 🧪 Teste para Função Simples - Crispy Octo Spoon
 * 
 * Este arquivo testa a função simples que não depende do Express
 */

const axios = require('axios');

// Configurações
const API_URL = 'https://crispy-octo-spoon.netlify.app/.netlify/functions/clientes-simple';

// Função para testar endpoint básico
async function testEndpointBasico() {
  console.log('🔍 Testando endpoint básico...');
  
  try {
    const response = await axios.get(API_URL, {
      timeout: 10000
    });
    
    console.log('✅ API respondendo:', {
      status: response.status,
      data: response.data.data ? `${response.data.data.length} clientes` : 'Sem dados'
    });
    
    return true;
  } catch (error) {
    console.error('❌ API não está respondendo:', error.message);
    return false;
  }
}

// Função para testar endpoint sem autenticação
async function testSemAutenticacao() {
  console.log('🔍 Testando sem autenticação...');
  
  try {
    await axios.get(API_URL, {
      timeout: 10000
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

// Função para testar com autenticação
async function testComAutenticacao() {
  console.log('🔍 Testando com autenticação...');
  
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': 'Bearer test_token_docusign'
      },
      timeout: 10000
    });
    
    console.log('✅ Endpoint funcionando com autenticação:', {
      status: response.status,
      data: response.data.data ? `${response.data.data.length} clientes` : 'Sem dados'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Endpoint falhou com autenticação:', error.message);
    return false;
  }
}

// Função para testar busca por ID
async function testBuscaPorId() {
  console.log('🔍 Testando busca por ID...');
  
  try {
    const response = await axios.get(`${API_URL}/1`, {
      headers: {
        'Authorization': 'Bearer test_token_docusign'
      },
      timeout: 10000
    });
    
    console.log('✅ Busca por ID funcionando:', {
      status: response.status,
      cliente: response.data.data.nome
    });
    
    return true;
  } catch (error) {
    console.error('❌ Busca por ID falhou:', error.message);
    return false;
  }
}

// Função para testar criação de cliente
async function testCriarCliente() {
  console.log('🔍 Testando criação de cliente...');
  
  const novoCliente = {
    nome: 'Cliente Teste',
    cpf_cnpj: '111.222.333-44',
    tipo_cliente: 'pessoa_fisica',
    email: 'teste@email.com'
  };
  
  try {
    const response = await axios.post(API_URL, novoCliente, {
      headers: {
        'Authorization': 'Bearer test_token_docusign',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Cliente criado:', {
      status: response.status,
      id: response.data.data.id,
      nome: response.data.data.nome
    });
    
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Criação de cliente falhou:', error.message);
    return null;
  }
}

// Função para testar estatísticas
async function testEstatisticas() {
  console.log('🔍 Testando estatísticas...');
  
  try {
    const response = await axios.get(`${API_URL}/stats/estatisticas`, {
      headers: {
        'Authorization': 'Bearer test_token_docusign'
      },
      timeout: 10000
    });
    
    console.log('✅ Estatísticas funcionando:', {
      status: response.status,
      total: response.data.data.total
    });
    
    return true;
  } catch (error) {
    console.error('❌ Estatísticas falharam:', error.message);
    return false;
  }
}

// Função para testar busca
async function testBusca() {
  console.log('🔍 Testando busca...');
  
  try {
    const response = await axios.get(`${API_URL}/search/buscar?q=João`, {
      headers: {
        'Authorization': 'Bearer test_token_docusign'
      },
      timeout: 10000
    });
    
    console.log('✅ Busca funcionando:', {
      status: response.status,
      resultados: response.data.data.length
    });
    
    return true;
  } catch (error) {
    console.error('❌ Busca falhou:', error.message);
    return false;
  }
}

// Executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes da função simples');
  console.log('📍 URL:', API_URL);
  console.log('⏱️ Timeout: 10s por teste');
  
  const resultados = [];
  
  try {
    // Testes básicos
    resultados.push(await testEndpointBasico());
    resultados.push(await testSemAutenticacao());
    resultados.push(await testComAutenticacao());
    resultados.push(await testBuscaPorId());
    
    // Teste de criação
    const clienteId = await testCriarCliente();
    if (clienteId) {
      resultados.push(true);
    } else {
      resultados.push(false);
    }
    
    // Testes adicionais
    resultados.push(await testEstatisticas());
    resultados.push(await testBusca());
    
    // Resumo
    const sucessos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    console.log('\n📊 Resumo dos Testes:');
    console.log(`✅ Sucessos: ${sucessos}/${total}`);
    console.log(`❌ Falhas: ${total - sucessos}/${total}`);
    
    if (sucessos === total) {
      console.log('\n🎉 Todos os testes passaram! A função está funcionando!');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('\n💥 Erro durante os testes:', error.message);
  }
  
  console.log('\n🏁 Testes concluídos');
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestes().catch(console.error);
}

module.exports = {
  executarTestes,
  testEndpointBasico,
  testSemAutenticacao,
  testComAutenticacao,
  testBuscaPorId,
  testCriarCliente,
  testEstatisticas,
  testBusca
};

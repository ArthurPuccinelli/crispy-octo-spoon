/**
 * 🧪 Teste Simples para Verificar API - Crispy Octo Spoon
 * 
 * Este arquivo contém testes básicos para verificar se a API está funcionando
 * em produção.
 */

const axios = require('axios');

// Configurações
const API_URL = 'https://crispy-octo-spoon.netlify.app/.netlify/functions/api-handler';

// Função para testar endpoint básico
async function testEndpointBasico() {
    console.log('🔍 Testando endpoint básico...');

    try {
        const response = await axios.get(API_URL, {
            timeout: 10000
        });

        console.log('✅ API respondendo:', {
            status: response.status,
            message: response.data.message,
            environment: response.data.environment
        });

        return true;
    } catch (error) {
        console.error('❌ API não está respondendo:', error.message);
        return false;
    }
}

// Função para testar health check
async function testHealthCheck() {
    console.log('🔍 Testando health check...');

    try {
        const response = await axios.get(`${API_URL}/health`, {
            timeout: 10000
        });

        console.log('✅ Health check funcionando:', {
            status: response.status,
            health: response.data.status
        });

        return true;
    } catch (error) {
        console.error('❌ Health check falhou:', error.message);
        return false;
    }
}

// Função para testar endpoint de clientes (sem auth)
async function testClientesSemAuth() {
    console.log('🔍 Testando endpoint de clientes sem autenticação...');

    try {
        await axios.get(`${API_URL}/clientes`, {
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

// Função para testar endpoint de clientes (com auth)
async function testClientesComAuth() {
    console.log('🔍 Testando endpoint de clientes com autenticação...');

    try {
        const response = await axios.get(`${API_URL}/clientes?limit=5`, {
            headers: {
                'Authorization': 'Bearer test_token_docusign'
            },
            timeout: 10000
        });

        console.log('✅ Endpoint de clientes funcionando:', {
            status: response.status,
            data: response.data.data ? 'Dados recebidos' : 'Sem dados'
        });

        return true;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Autenticação funcionando (401 - token inválido)');
            return true;
        } else {
            console.error('❌ Endpoint de clientes falhou:', error.message);
            return false;
        }
    }
}

// Executar todos os testes
async function executarTestesSimples() {
    console.log('🚀 Iniciando testes simples da API');
    console.log('📍 URL:', API_URL);
    console.log('⏱️ Timeout: 10s por teste');

    const resultados = [];

    try {
        // Teste 1: Endpoint básico
        resultados.push(await testEndpointBasico());

        // Teste 2: Health check
        resultados.push(await testHealthCheck());

        // Teste 3: Clientes sem auth
        resultados.push(await testClientesSemAuth());

        // Teste 4: Clientes com auth
        resultados.push(await testClientesComAuth());

        // Resumo
        const sucessos = resultados.filter(r => r).length;
        const total = resultados.length;

        console.log('\n📊 Resumo dos Testes:');
        console.log(`✅ Sucessos: ${sucessos}/${total}`);
        console.log(`❌ Falhas: ${total - sucessos}/${total}`);

        if (sucessos === total) {
            console.log('\n🎉 Todos os testes passaram! A API está funcionando!');
        } else {
            console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
        }

    } catch (error) {
        console.error('\n💥 Erro durante os testes:', error.message);
    }

    console.log('\n🏁 Testes simples concluídos');
}

// Executar se chamado diretamente
if (require.main === module) {
    executarTestesSimples().catch(console.error);
}

module.exports = {
    executarTestesSimples,
    testEndpointBasico,
    testHealthCheck,
    testClientesSemAuth,
    testClientesComAuth
};

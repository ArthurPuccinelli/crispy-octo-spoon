#!/usr/bin/env node

/**
 * Script de teste para integração DocuSign Data IO
 * Executa testes básicos nos endpoints da API
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/docusign`;

// Configurações de teste
const TEST_CONFIG = {
    timeout: 5000,
    retries: 3,
    delay: 1000
};

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body,
                        parseError: error.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.setTimeout(TEST_CONFIG.timeout);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Função para aguardar
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para exibir resultado
function displayResult(testName, success, message, details = null) {
    const status = success ? `${colors.green}✅ PASSOU${colors.reset}` : `${colors.red}❌ FALHOU${colors.reset}`;
    console.log(`${colors.bright}${testName}:${colors.reset} ${status}`);

    if (message) {
        console.log(`   ${colors.blue}${message}${colors.reset}`);
    }

    if (details && !success) {
        console.log(`   ${colors.yellow}Detalhes:${colors.reset}`, details);
    }

    console.log('');
}

// Testes
async function runTests() {
    console.log(`${colors.bright}${colors.cyan}🧪 TESTANDO INTEGRAÇÃO DOCUSIGN DATA IO${colors.reset}\n`);
    console.log(`Base URL: ${BASE_URL}\n`);

    let passedTests = 0;
    let totalTests = 0;

    // Teste 1: Verificar se o servidor está rodando
    try {
        const healthResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/health',
            method: 'GET'
        });

        totalTests++;
        if (healthResponse.statusCode === 200) {
            displayResult('Servidor Ativo', true, 'Servidor respondendo corretamente');
            passedTests++;
        } else {
            displayResult('Servidor Ativo', false, `Status: ${healthResponse.statusCode}`);
        }
    } catch (error) {
        totalTests++;
        displayResult('Servidor Ativo', false, 'Servidor não está rodando', error.message);
    }

    await delay(TEST_CONFIG.delay);

    // Teste 2: Endpoint de autenticação
    try {
        const authResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/docusign/auth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        totalTests++;
        if (authResponse.statusCode === 200 && authResponse.body && authResponse.body.access_token) {
            displayResult('Autenticação', true, 'Token gerado com sucesso');
            passedTests++;
        } else {
            displayResult('Autenticação', false, `Status: ${authResponse.statusCode}`, authResponse.body);
        }
    } catch (error) {
        totalTests++;
        displayResult('Autenticação', false, 'Erro na requisição', error.message);
    }

    await delay(TEST_CONFIG.delay);

    // Teste 3: Listar clientes (sem autenticação - deve falhar)
    try {
        const listResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/docusign/clientes',
            method: 'GET'
        });

        totalTests++;
        if (listResponse.statusCode === 401) {
            displayResult('Proteção de Rota', true, 'Rota protegida corretamente');
            passedTests++;
        } else {
            displayResult('Proteção de Rota', false, `Status inesperado: ${listResponse.statusCode}`);
        }
    } catch (error) {
        totalTests++;
        displayResult('Proteção de Rota', false, 'Erro na requisição', error.message);
    }

    await delay(TEST_CONFIG.delay);

    // Teste 4: Listar clientes (com autenticação)
    try {
        const listResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/docusign/clientes',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer mock_token'
            }
        });

        totalTests++;
        if (listResponse.statusCode === 200 && listResponse.body && listResponse.body.success) {
            displayResult('Listar Clientes', true, 'Clientes listados com sucesso');
            passedTests++;
        } else {
            displayResult('Listar Clientes', false, `Status: ${listResponse.statusCode}`, listResponse.body);
        }
    } catch (error) {
        totalTests++;
        displayResult('Listar Clientes', false, 'Erro na requisição', error.message);
    }

    await delay(TEST_CONFIG.delay);

    // Teste 5: Criar cliente
    try {
        const clienteData = {
            nome: 'Cliente Teste',
            email: 'teste@exemplo.com',
            tipo_cliente: 'pessoa_fisica',
            status: 'ativo'
        };

        const createResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/docusign/clientes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock_token'
            }
        }, clienteData);

        totalTests++;
        if (createResponse.statusCode === 201 && createResponse.body && createResponse.body.success) {
            displayResult('Criar Cliente', true, 'Cliente criado com sucesso');
            passedTests++;
        } else {
            displayResult('Criar Cliente', false, `Status: ${createResponse.statusCode}`, createResponse.body);
        }
    } catch (error) {
        totalTests++;
        displayResult('Criar Cliente', false, 'Erro na requisição', error.message);
    }

    await delay(TEST_CONFIG.delay);

    // Teste 6: Validação de dados
    try {
        const invalidData = {
            nome: '', // Nome vazio
            email: 'email-invalido', // Email inválido
            tipo_cliente: 'invalido' // Tipo inválido
        };

        const validationResponse = await makeRequest({
            hostname: 'localhost',
            port: 3001,
            path: '/api/docusign/clientes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock_token'
            }
        }, invalidData);

        totalTests++;
        if (validationResponse.statusCode === 400 && validationResponse.body && validationResponse.body.error) {
            displayResult('Validação de Dados', true, 'Validação funcionando corretamente');
            passedTests++;
        } else {
            displayResult('Validação de Dados', false, `Status: ${validationResponse.statusCode}`, validationResponse.body);
        }
    } catch (error) {
        totalTests++;
        displayResult('Validação de Dados', false, 'Erro na requisição', error.message);
    }

    // Resumo dos testes
    console.log(`${colors.bright}${colors.cyan}📊 RESUMO DOS TESTES${colors.reset}\n`);
    console.log(`Total de testes: ${totalTests}`);
    console.log(`Testes aprovados: ${colors.green}${passedTests}${colors.reset}`);
    console.log(`Testes reprovados: ${colors.red}${totalTests - passedTests}${colors.reset}`);

    const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    console.log(`Taxa de sucesso: ${colors.bright}${percentage}%${colors.reset}\n`);

    if (passedTests === totalTests) {
        console.log(`${colors.green}🎉 Todos os testes passaram! A integração está funcionando corretamente.${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠️  Alguns testes falharam. Verifique os detalhes acima.${colors.reset}\n`);
    }

    // Instruções para próximos passos
    console.log(`${colors.bright}${colors.blue}🚀 PRÓXIMOS PASSOS${colors.reset}\n`);
    console.log('1. Configure as variáveis de ambiente em backend/.env');
    console.log('2. Implemente a autenticação real com DocuSign');
    console.log('3. Conecte com o banco de dados real');
    console.log('4. Teste com dados reais do DocuSign');
    console.log('5. Configure o Extension App no console DocuSign\n');
}

// Executar testes
if (require.main === module) {
    runTests().catch(error => {
        console.error(`${colors.red}Erro fatal:${colors.reset}`, error.message);
        process.exit(1);
    });
}

module.exports = { runTests, makeRequest };

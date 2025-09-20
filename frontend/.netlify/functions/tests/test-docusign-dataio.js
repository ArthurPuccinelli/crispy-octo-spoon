// Teste completo da integração DocuSign DataIO
// Valida todas as funções conforme especificação DocuSign

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_API_URL || 'https://crispy-octo-spoon.netlify.app/.netlify/functions';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test_token_docusign';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(data)
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// Test functions
async function testGetTypeNames() {
    console.log('🧪 Testing GetTypeNames...');
    try {
        const response = await makeRequest(`${BASE_URL}/GetTypeNames`, {
            method: 'POST',
            body: {}
        });

        if (response.statusCode === 200 && response.body.typeNames) {
            console.log('✅ GetTypeNames: PASSED');
            console.log('   Available types:', response.body.typeNames.map(t => t.typeName));
            return true;
        } else {
            console.log('❌ GetTypeNames: FAILED');
            console.log('   Response:', response.body);
            return false;
        }
    } catch (error) {
        console.log('❌ GetTypeNames: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

async function testGetTypeDefinitions() {
    console.log('🧪 Testing GetTypeDefinitions...');
    try {
        const response = await makeRequest(`${BASE_URL}/GetTypeDefinitions`, {
            method: 'POST',
            body: { typeNames: ['Cliente'] }
        });

        if (response.statusCode === 200 && response.body.declarations) {
            console.log('✅ GetTypeDefinitions: PASSED');
            console.log('   Declarations count:', response.body.declarations.length);
            return true;
        } else {
            console.log('❌ GetTypeDefinitions: FAILED');
            console.log('   Response:', response.body);
            return false;
        }
    } catch (error) {
        console.log('❌ GetTypeDefinitions: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

async function testCreateRecord() {
    console.log('🧪 Testing CreateRecord...');
    try {
        const testData = {
            typeName: 'Cliente',
            data: {
                Nome: 'João Silva Teste',
                Email: 'joao.teste@example.com',
                CpfCnpj: '12345678901',
                Telefone: '11999999999',
                Cidade: 'São Paulo',
                Estado: 'SP',
                TipoCliente: 'PF',
                Status: 'ativo'
            }
        };

        const response = await makeRequest(`${BASE_URL}/CreateRecord`, {
            method: 'POST',
            body: testData
        });

        if (response.statusCode === 200 && response.body.recordId) {
            console.log('✅ CreateRecord: PASSED');
            console.log('   Created record ID:', response.body.recordId);
            return response.body.recordId;
        } else {
            console.log('❌ CreateRecord: FAILED');
            console.log('   Response:', response.body);
            return null;
        }
    } catch (error) {
        console.log('❌ CreateRecord: ERROR');
        console.log('   Error:', error.message);
        return null;
    }
}

async function testSearchRecords() {
    console.log('🧪 Testing SearchRecords...');
    try {
        const searchQuery = {
            query: {
                from: 'Cliente',
                queryFilter: {
                    operation: {
                        operator: 'EQUALS',
                        leftOperand: { name: 'CpfCnpj' },
                        rightOperand: { name: '12345678901' }
                    }
                }
            },
            pagination: { limit: 1, skip: 0 }
        };

        const response = await makeRequest(`${BASE_URL}/SearchRecords`, {
            method: 'POST',
            body: searchQuery
        });

        if (response.statusCode === 200 && response.body.records) {
            console.log('✅ SearchRecords: PASSED');
            console.log('   Found records:', response.body.records.length);
            return response.body.records[0];
        } else {
            console.log('❌ SearchRecords: FAILED');
            console.log('   Response:', response.body);
            return null;
        }
    } catch (error) {
        console.log('❌ SearchRecords: ERROR');
        console.log('   Error:', error.message);
        return null;
    }
}

async function testPatchRecord(recordId) {
    console.log('🧪 Testing PatchRecord...');
    try {
        const updateData = {
            typeName: 'Cliente',
            recordId: recordId,
            data: {
                Telefone: '11888888888',
                Cidade: 'Rio de Janeiro',
                Estado: 'RJ'
            }
        };

        const response = await makeRequest(`${BASE_URL}/PatchRecord`, {
            method: 'POST',
            body: updateData
        });

        if (response.statusCode === 200 && response.body.success) {
            console.log('✅ PatchRecord: PASSED');
            return true;
        } else {
            console.log('❌ PatchRecord: FAILED');
            console.log('   Response:', response.body);
            return false;
        }
    } catch (error) {
        console.log('❌ PatchRecord: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

async function testVerify() {
    console.log('🧪 Testing Verify...');
    try {
        const verifyData = {
            typeName: 'Cliente',
            data: {
                CpfCnpj: '12345678901'
            }
        };

        const response = await makeRequest(`${BASE_URL}/verify`, {
            method: 'POST',
            body: verifyData
        });

        if (response.statusCode === 200 && typeof response.body.valid === 'boolean') {
            console.log('✅ Verify: PASSED');
            console.log('   Valid:', response.body.valid);
            return true;
        } else {
            console.log('❌ Verify: FAILED');
            console.log('   Response:', response.body);
            return false;
        }
    } catch (error) {
        console.log('❌ Verify: ERROR');
        console.log('   Error:', error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting DocuSign DataIO Integration Tests');
    console.log('='.repeat(50));

    const results = {
        getTypeNames: await testGetTypeNames(),
        getTypeDefinitions: await testGetTypeDefinitions(),
        createRecord: await testCreateRecord(),
        searchRecords: await testSearchRecords(),
        patchRecord: null,
        verify: await testVerify()
    };

    // Test PatchRecord if we have a record ID
    if (results.createRecord) {
        results.patchRecord = await testPatchRecord(results.createRecord);
    }

    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    console.log(`GetTypeNames: ${results.getTypeNames ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`GetTypeDefinitions: ${results.getTypeDefinitions ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CreateRecord: ${results.createRecord ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`SearchRecords: ${results.searchRecords ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`PatchRecord: ${results.patchRecord ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Verify: ${results.verify ? '✅ PASS' : '❌ FAIL'}`);

    const passedTests = Object.values(results).filter(r => r === true).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! DocuSign DataIO integration is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the implementation.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testGetTypeNames,
    testGetTypeDefinitions,
    testCreateRecord,
    testSearchRecords,
    testPatchRecord,
    testVerify
};

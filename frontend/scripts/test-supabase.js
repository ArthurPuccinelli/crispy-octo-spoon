#!/usr/bin/env node

/**
 * Script para testar a conectividade com o Supabase
 * Execute com: node scripts/test-supabase.js
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando conectividade com o Supabase...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variáveis de ambiente não configuradas localmente');
    console.log('📋 Configure o arquivo .env.local primeiro');
    process.exit(1);
}

console.log(`📡 URL do Supabase: ${supabaseUrl}`);
console.log(`🔑 Chave anônima: ${supabaseAnonKey.substring(0, 30)}...\n`);

// Teste 1: Verificar se o domínio responde
console.log('🧪 Teste 1: Verificando resposta do domínio...');
const url = new URL(supabaseUrl);
const hostname = url.hostname;

const testDomain = () => {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: hostname,
            port: 443,
            path: '/',
            method: 'GET',
            timeout: 10000
        }, (res) => {
            console.log(`✅ Domínio responde: ${res.statusCode} ${res.statusMessage}`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log(`❌ Erro ao conectar: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Timeout ao conectar');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Teste 2: Verificar se o Supabase responde
console.log('\n🧪 Teste 2: Verificando resposta da API do Supabase...');
const testSupabase = async () => {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Teste simples de conexão
        const { data, error } = await supabase
            .from('clientes')
            .select('count')
            .limit(1);

        if (error) {
            console.log(`❌ Erro na API: ${error.message}`);
            return false;
        }

        console.log('✅ API do Supabase funcionando!');
        return true;
    } catch (err) {
        console.log(`❌ Erro ao testar API: ${err.message}`);
        return false;
    }
};

// Executar testes
const runTests = async () => {
    try {
        console.log('🚀 Iniciando testes...\n');

        // Teste de domínio
        await testDomain();

        // Teste da API
        await testSupabase();

        console.log('\n📋 Resumo dos testes:');
        console.log('✅ Conectividade básica testada');
        console.log('✅ API do Supabase testada');

    } catch (err) {
        console.log('\n❌ Alguns testes falharam:');
        console.log(`   ${err.message}`);
    }

    console.log('\n💡 Dicas de solução:');
    console.log('1. Verifique se o projeto Supabase ainda existe');
    console.log('2. Verifique se não foi pausado por inatividade');
    console.log('3. Tente acessar a URL diretamente no navegador');
    console.log('4. Verifique se há problemas de rede/região');
};

runTests();

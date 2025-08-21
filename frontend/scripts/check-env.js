#!/usr/bin/env node

/**
 * Script para verificar se as variáveis de ambiente estão configuradas corretamente
 * Execute com: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando variáveis de ambiente...\n');

const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let allSet = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
        console.log(`❌ ${varName}: NÃO CONFIGURADA`);
        allSet = false;
    }
});

console.log('\n📋 Resumo:');
if (allSet) {
    console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
    console.log('🚀 A aplicação deve funcionar corretamente.');
} else {
    console.log('❌ Algumas variáveis obrigatórias não estão configuradas.');
    console.log('📖 Consulte o arquivo ENVIRONMENT_SETUP.md para instruções.');
}

console.log('\n🌐 Para produção no Netlify:');
console.log('1. Configure as variáveis no painel do Netlify');
console.log('2. Faça um novo deploy');
console.log('3. Verifique se não há mais erros no console do navegador');

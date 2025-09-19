import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente Supabase
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Função para executar queries de keepalive (mesma lógica da scheduled function)
async function executeKeepaliveQueries() {
    if (!supabase) {
        throw new Error('Supabase não configurado - verifique as variáveis de ambiente');
    }

    const results = {
        timestamp: new Date().toISOString(),
        queries: [],
        success: true,
        errors: [],
        performance: {
            totalDuration: 0,
            averageQueryTime: 0
        }
    };

    const startTime = Date.now();

    try {
        console.log('🔄 Iniciando keepalive do Supabase...');

        // Query 1: Verificação de conectividade básica
        console.log('📡 Testando conectividade...');
        const connectionStart = Date.now();
        const { data: connectionTest, error: connectionError } = await supabase
            .from('clientes')
            .select('count')
            .limit(1);

        const connectionDuration = Date.now() - connectionStart;

        results.queries.push({
            name: 'connection_test',
            success: !connectionError,
            error: connectionError?.message || null,
            duration: connectionDuration,
            description: 'Teste de conectividade básica'
        });

        if (connectionError) {
            results.success = false;
            results.errors.push(`Connection test failed: ${connectionError.message}`);
        }

        // Query 2: Verificação de tabelas principais
        console.log('🗃️ Verificando tabelas...');
        const tables = ['clientes', 'produtos', 'servicos_contratados'];

        for (const table of tables) {
            try {
                const tableStart = Date.now();
                const { data, error } = await supabase
                    .from(table)
                    .select('id')
                    .limit(1);

                const tableDuration = Date.now() - tableStart;

                results.queries.push({
                    name: `table_check_${table}`,
                    success: !error,
                    error: error?.message || null,
                    duration: tableDuration,
                    description: `Verificação da tabela ${table}`
                });

                if (error) {
                    results.errors.push(`Table ${table} check failed: ${error.message}`);
                }
            } catch (err) {
                const tableDuration = Date.now() - Date.now();
                results.queries.push({
                    name: `table_check_${table}`,
                    success: false,
                    error: err.message,
                    duration: tableDuration,
                    description: `Verificação da tabela ${table}`
                });
                results.errors.push(`Table ${table} check failed: ${err.message}`);
            }
        }

        // Query 3: Teste de performance com query mais complexa
        console.log('⚡ Testando performance...');
        const perfStart = Date.now();
        const { data: perfTest, error: perfError } = await supabase
            .from('clientes')
            .select('id, nome, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        const perfDuration = Date.now() - perfStart;

        results.queries.push({
            name: 'performance_test',
            success: !perfError,
            error: perfError?.message || null,
            duration: perfDuration,
            recordCount: perfTest?.length || 0,
            description: 'Teste de performance com query complexa'
        });

        if (perfError) {
            results.success = false;
            results.errors.push(`Performance test failed: ${perfError.message}`);
        }

        // Calcular estatísticas de performance
        const totalDuration = Date.now() - startTime;
        const successfulQueries = results.queries.filter(q => q.success);
        const averageQueryTime = successfulQueries.length > 0
            ? successfulQueries.reduce((sum, q) => sum + q.duration, 0) / successfulQueries.length
            : 0;

        results.performance = {
            totalDuration,
            averageQueryTime: Math.round(averageQueryTime),
            successfulQueries: successfulQueries.length,
            totalQueries: results.queries.length
        };

        return results;

    } catch (error) {
        console.error('❌ Erro durante keepalive:', error);
        results.success = false;
        results.errors.push(`General error: ${error.message}`);
        results.performance.totalDuration = Date.now() - startTime;
        return results;
    }
}

// Função principal de teste
async function testKeepalive() {
    console.log('🧪 Testando função de keepalive do Supabase...');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🔧 Configurações:');
    console.log('   - Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
    console.log('   - Supabase Key:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado');
    console.log('');

    if (!supabase) {
        console.error('❌ Supabase não configurado!');
        console.log('📋 Verifique as variáveis de ambiente:');
        console.log('   - SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL');
        console.log('   - SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return;
    }

    try {
        const results = await executeKeepaliveQueries();

        console.log('');
        console.log('📊 RESULTADOS DO TESTE:');
        console.log('========================');
        console.log(`✅ Status: ${results.success ? 'SUCESSO' : 'ERRO'}`);
        console.log(`⏱️  Duração Total: ${results.performance.totalDuration}ms`);
        console.log(`📈 Duração Média: ${results.performance.averageQueryTime}ms`);
        console.log(`🔢 Queries Executadas: ${results.performance.totalQueries}`);
        console.log(`✅ Queries Bem-sucedidas: ${results.performance.successfulQueries}`);
        console.log(`❌ Erros: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('');
            console.log('🚨 ERROS ENCONTRADOS:');
            results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        console.log('');
        console.log('📋 DETALHES DAS QUERIES:');
        results.queries.forEach((query, index) => {
            const status = query.success ? '✅' : '❌';
            console.log(`   ${index + 1}. ${status} ${query.name} (${query.duration}ms)`);
            if (query.error) {
                console.log(`      Erro: ${query.error}`);
            }
        });

        console.log('');
        if (results.success) {
            console.log('🎉 Teste concluído com sucesso! O Supabase está funcionando corretamente.');
        } else {
            console.log('⚠️  Teste concluído com erros. Verifique a configuração do Supabase.');
        }

    } catch (error) {
        console.error('💥 Erro fatal durante o teste:', error);
    }
}

// Executar teste se chamado diretamente
if (process.argv[1] && process.argv[1].endsWith('test-keepalive.mjs')) {
    testKeepalive();
}

export { testKeepalive, executeKeepaliveQueries };



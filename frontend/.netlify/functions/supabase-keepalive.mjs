import { createClient } from '@supabase/supabase-js';
import type { Config } from '@netlify/functions';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente Supabase
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Função para executar queries de keepalive
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

        // Log dos resultados
        console.log('✅ Keepalive executado com sucesso:', {
            timestamp: results.timestamp,
            totalDuration: `${totalDuration}ms`,
            queriesExecuted: results.queries.length,
            successfulQueries: successfulQueries.length,
            success: results.success,
            errors: results.errors.length
        });

        return results;

    } catch (error) {
        console.error('❌ Erro durante keepalive:', error);
        results.success = false;
        results.errors.push(`General error: ${error.message}`);
        results.performance.totalDuration = Date.now() - startTime;
        return results;
    }
}

// Handler principal da scheduled function
export default async (req) => {
    try {
        // Para scheduled functions, o request body contém informações sobre a próxima execução
        const { next_run } = await req.json();

        console.log('🚀 Scheduled function executada!');
        console.log('⏰ Próxima execução:', next_run);
        console.log('🕐 Execução atual:', new Date().toISOString());

        // Executar keepalive
        const results = await executeKeepaliveQueries();

        // Log final
        if (results.success) {
            console.log('🎉 Keepalive concluído com sucesso!');
            console.log(`📊 Performance: ${results.performance.totalDuration}ms total, ${results.performance.averageQueryTime}ms média`);
        } else {
            console.error('⚠️ Keepalive concluído com erros:', results.errors);
        }

        // Scheduled functions não retornam response body, apenas logs
        return new Response(null, { status: 200 });

    } catch (error) {
        console.error('💥 Erro fatal na scheduled function:', error);
        return new Response(null, { status: 500 });
    }
};

// Configuração da scheduled function
// Executa a cada 10 minutos para manter o Supabase ativo
export const config = {
    schedule: '*/10 * * * *' // A cada 10 minutos
};



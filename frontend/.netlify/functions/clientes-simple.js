/**
 * 🍜 Função Simples para Clientes - Crispy Octo Spoon
 * 
 * Esta função é uma versão simplificada que conecta ao Supabase real
 * para funcionar no Netlify Functions.
 */

// Importar Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para validar token (simplificada)
function validarToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  // Por enquanto, aceita qualquer token que não seja vazio
  return token && token.length > 0;
}

// Função para formatar resposta
function formatarResposta(data, message = null, pagination = null) {
  const response = {
    success: true,
    data: data,
    metadata: {
      entity: 'cliente',
      operation: 'read',
      timestamp: new Date().toISOString()
    }
  };
  
  if (message) response.message = message;
  if (pagination) response.pagination = pagination;
  
  return response;
}

// Função para formatar erro
function formatarErro(message, statusCode = 400) {
  return {
    success: false,
    error: 'Error',
    message: message,
    code: `ERROR_${statusCode}`,
    timestamp: new Date().toISOString()
  };
}

// Função principal do Netlify
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Lidar com preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  try {
    // Verificar autenticação
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!validarToken(authHeader)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify(formatarErro('Token de autenticação necessário', 401))
      };
    }

    const path = event.path || event.rawUrl || '';
    const method = event.httpMethod;

    // Rota para estatísticas (DEVE VIR ANTES da rota de busca por ID)
    if (path.includes('/clientes-simple/stats/estatisticas') && method === 'GET') {
      try {
        // Buscar todos os clientes para estatísticas
        const { data: clientes, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('status', 'ativo');

        if (error) {
          console.error('Erro ao buscar clientes:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify(formatarErro('Erro ao buscar dados do banco'))
          };
        }

        const stats = {
          total: clientes.length,
          porStatus: {},
          porTipo: {},
          porEstado: {},
          porCidade: {}
        };

        clientes.forEach(cliente => {
          // Contar por status
          stats.porStatus[cliente.status] = (stats.porStatus[cliente.status] || 0) + 1;
          
          // Contar por tipo
          stats.porTipo[cliente.tipo_cliente] = (stats.porTipo[cliente.tipo_cliente] || 0) + 1;
          
          // Contar por estado
          if (cliente.estado) {
            stats.porEstado[cliente.estado] = (stats.porEstado[cliente.estado] || 0) + 1;
          }
          
          // Contar por cidade
          if (cliente.cidade) {
            stats.porCidade[cliente.cidade] = (stats.porCidade[cliente.cidade] || 0) + 1;
          }
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta(stats, 'Estatísticas obtidas'))
        };
      } catch (error) {
        console.error('Erro ao processar estatísticas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota para busca (DEVE VIR ANTES da rota de busca por ID)
    if (path.includes('/clientes-simple/search/buscar') && method === 'GET') {
      try {
        const queryParams = event.queryStringParameters || {};
        const q = queryParams.q || '';
        const limit = parseInt(queryParams.limit) || 10;
        const offset = parseInt(queryParams.offset) || 0;
        
        if (!q) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify(formatarErro('Parâmetro de busca "q" é obrigatório'))
          };
        }

        // Buscar no Supabase com filtros
        const { data: resultados, error, count } = await supabase
          .from('clientes')
          .select('*', { count: 'exact' })
          .or(`nome.ilike.%${q}%,email.ilike.%${q}%,cpf_cnpj.ilike.%${q}%`)
          .eq('status', 'ativo')
          .range(offset, offset + limit - 1)
          .order('nome');

        if (error) {
          console.error('Erro na busca:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify(formatarErro('Erro ao buscar no banco'))
          };
        }

        const pagination = {
          total: count || 0,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < (count || 0),
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil((count || 0) / limit)
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta(resultados || [], 'Busca executada', pagination))
        };
      } catch (error) {
        console.error('Erro ao processar busca:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota para cliente específico (DEVE VIR ANTES da rota de listagem)
    if (path.includes('/clientes-simple/') && method === 'GET') {
      try {
        const id = path.split('/').pop();
        
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .eq('status', 'ativo')
          .single();

        if (error || !cliente) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify(formatarErro('Cliente não encontrado', 404))
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta(cliente, 'Cliente encontrado'))
        };
      } catch (error) {
        console.error('Erro ao buscar cliente por ID:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota raiz (listagem completa)
    if (path.endsWith('/clientes-simple') && method === 'GET') {
      try {
        const queryParams = event.queryStringParameters || {};
        const limit = parseInt(queryParams.limit) || 10;
        const offset = parseInt(queryParams.offset) || 0;
        
        const { data: clientes, error, count } = await supabase
          .from('clientes')
          .select('*', { count: 'exact' })
          .eq('status', 'ativo')
          .range(offset, offset + limit - 1)
          .order('nome');

        if (error) {
          console.error('Erro ao listar clientes:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify(formatarErro('Erro ao buscar dados do banco'))
          };
        }

        const pagination = {
          total: count || 0,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < (count || 0),
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil((count || 0) / limit)
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta(clientes || [], 'Clientes listados com sucesso', pagination))
        };
      } catch (error) {
        console.error('Erro ao listar clientes:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota para criar cliente
    if (path.endsWith('/clientes-simple') && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      
      // Validação básica
      if (!body.nome || !body.cpf_cnpj || !body.tipo_cliente) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify(formatarErro('Campos obrigatórios: nome, cpf_cnpj, tipo_cliente'))
        };
      }

      try {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{
            nome: body.nome,
            email: body.email || null,
            cpf_cnpj: body.cpf_cnpj,
            tipo_cliente: body.tipo_cliente,
            telefone: body.telefone || null,
            endereco: body.endereco || null,
            cidade: body.cidade || null,
            estado: body.estado || null,
            cep: body.cep || null,
            observacoes: body.observacoes || null,
            status: body.status || 'ativo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar cliente:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify(formatarErro('Erro ao salvar no banco'))
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(formatarResposta(data, 'Cliente criado com sucesso'))
        };
      } catch (error) {
        console.error('Erro ao processar criação de cliente:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota para atualizar cliente
    if (path.includes('/clientes-simple/') && method === 'PUT') {
      const id = path.split('/').pop();
      const body = JSON.parse(event.body || '{}');
      
      try {
        const { data, error } = await supabase
          .from('clientes')
          .update({
            nome: body.nome || undefined,
            email: body.email || undefined,
            cpf_cnpj: body.cpf_cnpj || undefined,
            tipo_cliente: body.tipo_cliente || undefined,
            telefone: body.telefone || undefined,
            endereco: body.endereco || undefined,
            cidade: body.cidade || undefined,
            estado: body.estado || undefined,
            cep: body.cep || undefined,
            observacoes: body.observacoes || undefined,
            status: body.status || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error || !data) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify(formatarErro('Cliente não encontrado', 404))
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta(data, 'Cliente atualizado com sucesso'))
        };
      } catch (error) {
        console.error('Erro ao processar atualização de cliente:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota para deletar cliente
    if (path.includes('/clientes-simple/') && method === 'DELETE') {
      const id = path.split('/').pop();
      
      try {
        const { error } = await supabase
          .from('clientes')
          .update({ status: 'inativo', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar cliente:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify(formatarErro('Erro ao deletar no banco'))
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formatarResposta({ id }, 'Cliente removido com sucesso'))
        };
      } catch (error) {
        console.error('Erro ao processar deleção de cliente:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify(formatarErro('Erro interno do servidor'))
        };
      }
    }

    // Rota não encontrada
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify(formatarErro('Rota não encontrada', 404))
    };

  } catch (error) {
    console.error('Erro na função:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(formatarErro('Erro interno do servidor', 500))
    };
  }
};

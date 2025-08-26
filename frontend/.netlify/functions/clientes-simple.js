/**
 * 🍜 Função Simples para Clientes - Crispy Octo Spoon
 * 
 * Esta função é uma versão simplificada que não depende do Express
 * para funcionar no Netlify Functions.
 */

// Simular dados de clientes para teste
const mockClientes = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@email.com',
    cpf_cnpj: '123.456.789-00',
    telefone: '(11) 99999-9999',
    cidade: 'São Paulo',
    estado: 'SP',
    tipo_cliente: 'pessoa_fisica',
    status: 'ativo',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@email.com',
    cpf_cnpj: '987.654.321-00',
    telefone: '(11) 88888-8888',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    tipo_cliente: 'pessoa_fisica',
    status: 'ativo',
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z'
  }
];

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

    // Rota para cliente específico (DEVE VIR ANTES da rota de listagem)
    if (path.includes('/clientes-simple/') && method === 'GET') {
      const id = path.split('/').pop();
      const cliente = mockClientes.find(c => c.id === id);
      
      if (!cliente) {
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
    }

    // Rota raiz (listagem completa)
    if (path.endsWith('/clientes-simple') && method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      const limit = parseInt(queryParams.limit) || 10;
      const offset = parseInt(queryParams.offset) || 0;
      
      const clientesFiltrados = mockClientes.slice(offset, offset + limit);
      
      const pagination = {
        total: mockClientes.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < mockClientes.length,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(mockClientes.length / limit)
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formatarResposta(clientesFiltrados, 'Clientes listados com sucesso', pagination))
      };
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

      const novoCliente = {
        id: (mockClientes.length + 1).toString(),
        ...body,
        status: body.status || 'ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Simular adição ao array
      mockClientes.push(novoCliente);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(formatarResposta(novoCliente, 'Cliente criado com sucesso'))
      };
    }

    // Rota para atualizar cliente
    if (path.includes('/clientes-simple/') && method === 'PUT') {
      const id = path.split('/').pop();
      const body = JSON.parse(event.body || '{}');
      
      const clienteIndex = mockClientes.findIndex(c => c.id === id);
      
      if (clienteIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify(formatarErro('Cliente não encontrado', 404))
        };
      }

      const clienteAtualizado = {
        ...mockClientes[clienteIndex],
        ...body,
        updated_at: new Date().toISOString()
      };

      // Simular atualização
      mockClientes[clienteIndex] = clienteAtualizado;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formatarResposta(clienteAtualizado, 'Cliente atualizado com sucesso'))
      };
    }

    // Rota para deletar cliente
    if (path.includes('/clientes-simple/') && method === 'DELETE') {
      const id = path.split('/').pop();
      const clienteIndex = mockClientes.findIndex(c => c.id === id);
      
      if (clienteIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify(formatarErro('Cliente não encontrado', 404))
        };
      }

      // Soft delete - marca como inativo
      mockClientes[clienteIndex].status = 'inativo';
      mockClientes[clienteIndex].updated_at = new Date().toISOString();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formatarResposta(mockClientes[clienteIndex], 'Cliente removido com sucesso'))
      };
    }

    // Rota para estatísticas
    if (path.includes('/clientes-simple/stats/estatisticas') && method === 'GET') {
      const stats = {
        total: mockClientes.length,
        porStatus: {},
        porTipo: {},
        porEstado: {},
        porCidade: {}
      };

      mockClientes.forEach(cliente => {
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
    }

    // Rota para busca
    if (path.includes('/clientes-simple/search/buscar') && method === 'GET') {
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

      const resultados = mockClientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(q.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(q.toLowerCase()) ||
        cliente.cpf_cnpj.includes(q)
      );

      const resultadosPaginados = resultados.slice(offset, offset + limit);
      
      const pagination = {
        total: resultados.length,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < resultados.length,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(resultados.length / limit)
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formatarResposta(resultadosPaginados, 'Busca executada', pagination))
      };
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

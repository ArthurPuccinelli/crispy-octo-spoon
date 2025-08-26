const { createClient } = require('@supabase/supabase-js');
const { config: supabaseConfig } = require('../config/supabase');

class ClientesService {
  constructor() {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    this.tableName = supabaseConfig.tables.clientes;
  }

  /**
   * Lista todos os clientes com paginação e filtros
   * Compatível com DocuSign Data IO Read
   */
  async listarClientes(options = {}) {
    try {
      const {
        limit = supabaseConfig.pagination.defaultLimit,
        offset = 0,
        status,
        tipo_cliente,
        cidade,
        estado,
        search
      } = options;

      // Validar limite máximo
      const validLimit = Math.min(limit, supabaseConfig.pagination.maxLimit);

      // Construir query base
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + validLimit - 1);

      // Aplicar filtros
      if (status) {
        query = query.eq('status', status);
      }

      if (tipo_cliente) {
        query = query.eq('tipo_cliente', tipo_cliente);
      }

      if (cidade) {
        query = query.ilike('cidade', `%${cidade}%`);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      // Busca por texto (nome, email, cpf_cnpj)
      if (search) {
        query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`);
      }

      // Executar query
      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }

      // Calcular paginação
      const total = count || data.length;
      const hasMore = offset + validLimit < total;

      // Formatar resposta compatível com DocuSign Data IO
      const response = {
        success: true,
        data: data || [],
        pagination: {
          total,
          limit: validLimit,
          offset,
          hasMore,
          page: Math.floor(offset / validLimit) + 1,
          totalPages: Math.ceil(total / validLimit)
        },
        metadata: {
          entity: 'cliente',
          operation: 'read',
          timestamp: new Date().toISOString()
        }
      };

      // Log da query se habilitado
      if (supabaseConfig.logging.enableQueryLog) {
        console.log('🔍 Query executada:', {
          table: this.tableName,
          filters: { status, tipo_cliente, cidade, estado, search },
          pagination: { limit: validLimit, offset },
          resultCount: data?.length || 0
        });
      }

      return response;

    } catch (error) {
      console.error('Erro no serviço de clientes (listar):', error);
      throw new Error(`Falha ao listar clientes: ${error.message}`);
    }
  }

  /**
   * Busca cliente por ID
   * Compatível com DocuSign Data IO Read
   */
  async buscarClientePorId(id) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Cliente não encontrado');
        }
        throw new Error(`Erro ao buscar cliente: ${error.message}`);
      }

      // Formatar resposta compatível com DocuSign Data IO
      const response = {
        success: true,
        data: data,
        metadata: {
          entity: 'cliente',
          operation: 'read_by_id',
          id,
          timestamp: new Date().toISOString()
        }
      };

      return response;

    } catch (error) {
      console.error('Erro no serviço de clientes (buscar por ID):', error);
      throw new Error(`Falha ao buscar cliente: ${error.message}`);
    }
  }

  /**
   * Cria novo cliente
   * Compatível com DocuSign Data IO Write
   */
  async criarCliente(clienteData) {
    try {
      // Validar dados obrigatórios
      this.validarDadosCliente(clienteData, 'create');

      // Preparar dados para inserção
      const dadosParaInserir = {
        ...clienteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Remover campos que não devem ser inseridos
      delete dadosParaInserir.id;

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(dadosParaInserir)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }

      // Formatar resposta compatível com DocuSign Data IO
      const response = {
        success: true,
        data: data,
        message: 'Cliente criado com sucesso',
        metadata: {
          entity: 'cliente',
          operation: 'create',
          timestamp: new Date().toISOString()
        }
      };

      return response;

    } catch (error) {
      console.error('Erro no serviço de clientes (criar):', error);
      throw new Error(`Falha ao criar cliente: ${error.message}`);
    }
  }

  /**
   * Atualiza cliente existente
   * Compatível com DocuSign Data IO Write
   */
  async atualizarCliente(id, clienteData) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      // Validar dados obrigatórios
      this.validarDadosCliente(clienteData, 'update');

      // Verificar se o cliente existe
      const clienteExistente = await this.buscarClientePorId(id);
      if (!clienteExistente.success) {
        throw new Error('Cliente não encontrado');
      }

      // Preparar dados para atualização
      const dadosParaAtualizar = {
        ...clienteData,
        updated_at: new Date().toISOString()
      };

      // Remover campos que não devem ser atualizados
      delete dadosParaAtualizar.id;
      delete dadosParaAtualizar.created_at;

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(dadosParaAtualizar)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      }

      // Formatar resposta compatível com DocuSign Data IO
      const response = {
        success: true,
        data: data,
        message: 'Cliente atualizado com sucesso',
        metadata: {
          entity: 'cliente',
          operation: 'update',
          id,
          timestamp: new Date().toISOString()
        }
      };

      return response;

    } catch (error) {
      console.error('Erro no serviço de clientes (atualizar):', error);
      throw new Error(`Falha ao atualizar cliente: ${error.message}`);
    }
  }

  /**
   * Remove cliente (soft delete)
   * Compatível com DocuSign Data IO Write
   */
  async removerCliente(id) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      // Verificar se o cliente existe
      const clienteExistente = await this.buscarClientePorId(id);
      if (!clienteExistente.success) {
        throw new Error('Cliente não encontrado');
      }

      // Soft delete - apenas marca como inativo
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ 
          status: 'inativo',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao remover cliente: ${error.message}`);
      }

      // Formatar resposta compatível com DocuSign Data IO
      const response = {
        success: true,
        data: data,
        message: 'Cliente removido com sucesso',
        metadata: {
          entity: 'cliente',
          operation: 'delete',
          id,
          timestamp: new Date().toISOString()
        }
      };

      return response;

    } catch (error) {
      console.error('Erro no serviço de clientes (remover):', error);
      throw new Error(`Falha ao remover cliente: ${error.message}`);
    }
  }

  /**
   * Valida dados do cliente
   */
  validarDadosCliente(clienteData, operation = 'create') {
    const errors = [];

    // Campos obrigatórios para criação
    if (operation === 'create') {
      if (!clienteData.nome) {
        errors.push('Nome é obrigatório');
      }
      if (!clienteData.cpf_cnpj) {
        errors.push('CPF/CNPJ é obrigatório');
      }
      if (!clienteData.tipo_cliente) {
        errors.push('Tipo de cliente é obrigatório');
      }
    }

    // Validações de formato
    if (clienteData.email && !this.isValidEmail(clienteData.email)) {
      errors.push('Email inválido');
    }

    if (clienteData.tipo_cliente && !['pessoa_fisica', 'pessoa_juridica'].includes(clienteData.tipo_cliente)) {
      errors.push('Tipo de cliente inválido');
    }

    if (clienteData.status && !['ativo', 'inativo', 'suspenso'].includes(clienteData.status)) {
      errors.push('Status inválido');
    }

    // Validação de CPF/CNPJ
    if (clienteData.cpf_cnpj && !this.isValidCpfCnpj(clienteData.cpf_cnpj)) {
      errors.push('CPF/CNPJ inválido');
    }

    if (errors.length > 0) {
      throw new Error(`Validação falhou: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de CPF/CNPJ
   */
  isValidCpfCnpj(cpfCnpj) {
    // Remove caracteres especiais
    const clean = cpfCnpj.replace(/[^\d]/g, '');
    
    // Validação básica de tamanho
    if (clean.length !== 11 && clean.length !== 14) {
      return false;
    }

    // Validação básica de formato
    if (clean.length === 11) {
      // CPF: não pode ter todos os dígitos iguais
      if (/^(\d)\1*$/.test(clean)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Formata CPF/CNPJ para exibição
   */
  formatarCpfCnpj(cpfCnpj) {
    const clean = cpfCnpj.replace(/[^\d]/g, '');
    
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cpfCnpj;
  }

  /**
   * Obtém estatísticas dos clientes
   */
  async obterEstatisticas() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('status, tipo_cliente, cidade, estado');

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats = {
        total: data.length,
        porStatus: {},
        porTipo: {},
        porEstado: {},
        porCidade: {}
      };

      data.forEach(cliente => {
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
        success: true,
        data: stats,
        metadata: {
          entity: 'cliente',
          operation: 'statistics',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Falha ao obter estatísticas: ${error.message}`);
    }
  }
}

module.exports = ClientesService;

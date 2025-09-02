export interface Cliente {
    id: string
    nome: string
    email?: string
    cpf_cnpj: string
    telefone?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
    tipo_cliente: 'pessoa_fisica' | 'pessoa_juridica'
    status: 'ativo' | 'inativo' | 'suspenso'
    observacoes?: string
    created_at: string
    updated_at: string
}

export interface Produto {
    id: string
    nome: string
    descricao: string
    valor: number
    tipo: 'servico' | 'produto'
    status: 'ativo' | 'inativo'
    periodo_cobranca?: 'mensal' | 'anual' | 'unico'
    created_at: string
    updated_at: string
}

export interface ServicoContratado {
    id: string
    cliente_id: string
    produto_id: string
    data_contratacao: string
    data_proxima_cobranca: string
    valor_contratado: number
    status: 'ativo' | 'cancelado' | 'suspenso'
    created_at: string
    updated_at: string
    // Campos expandidos para exibição
    cliente?: Cliente
    produto?: Produto
}

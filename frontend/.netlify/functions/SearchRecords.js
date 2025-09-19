// DocuSign DataIO Version6.SearchRecords
// Searches records using DocuSign custom query language; maps to Supabase for Cliente

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: JSON.stringify({}) };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ code: 'BAD_METHOD', message: 'Method Not Allowed' }) };
    }
    if (!supabase) {
        return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: 'Supabase not configured' }) };
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Invalid JSON body' }) };
    }

    const { query, pagination } = payload || {};
    if (!query || typeof query !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Missing query object' }) };
    }

    const from = query.from;
    if (!from || String(from).toLowerCase() !== 'cliente') {
        // Only our Cliente type is supported
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Unsupported from type. Use "Cliente".' }) };
    }

    // attributesToSelect may be ignored; we'll return full Cliente info as requested

    // Map DataIO attribute names to DB columns
    const attrToColumn = (attr) => {
        const a = String(attr);
        switch (a) {
            case 'Id':
            case 'id':
                return 'id';
            case 'Name':
            case 'nome':
            case 'Nome':
                return 'nome';
            case 'Email':
            case 'email':
                return 'email';
            case 'CpfCnpj':
            case 'cpf_cnpj':
                return 'cpf_cnpj';
            case 'Telefone':
            case 'telefone':
                return 'telefone';
            case 'Endereco':
            case 'endereco':
                return 'endereco';
            case 'Cidade':
            case 'cidade':
                return 'cidade';
            case 'Estado':
            case 'estado':
                return 'estado';
            case 'Cep':
            case 'cep':
                return 'cep';
            case 'TipoCliente':
            case 'tipo_cliente':
                return 'tipo_cliente';
            case 'Status':
            case 'status':
                return 'status';
            case 'Observacoes':
            case 'observacoes':
                return 'observacoes';
            case 'CreatedAt':
            case 'created_at':
                return 'created_at';
            case 'UpdatedAt':
            case 'updated_at':
                return 'updated_at';
            default:
                return null; // unsupported
        }
    };

    // Build base query
    let dbQuery = supabase.from('clientes').select('*');

    // Apply filter (support simple ComparisonOperation with EQUALS)
    const filter = query.queryFilter && query.queryFilter.operation;
    if (filter && filter.operator === 'EQUALS') {
        const left = filter.leftOperand;
        const right = filter.rightOperand;
        if (left && right) {
            const fieldName = left.name;
            const literal = right.name;
            const column = attrToColumn(fieldName);
            if (column) {
                dbQuery = dbQuery.eq(column, literal);
            }
        }
    }

    // Pagination
    const limit = pagination && Number.isFinite(pagination.limit) ? Math.max(1, Math.min(100, pagination.limit)) : 10;
    const skip = pagination && Number.isFinite(pagination.skip) ? Math.max(0, pagination.skip) : 0;
    dbQuery = dbQuery.range(skip, skip + limit - 1);

    // Execute
    const { data: rows, error } = await dbQuery;
    if (error) {
        console.error('SearchRecords query error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: 'Unknown error when trying to search records' }) };
    }

    // Return full Cliente info per record
    const records = (rows || []).map((r) => ({
        Id: r.id,
        Name: r.nome,
        Email: r.email,
        CpfCnpj: r.cpf_cnpj,
        Telefone: r.telefone,
        Endereco: r.endereco,
        Cidade: r.cidade,
        Estado: r.estado,
        Cep: r.cep,
        TipoCliente: r.tipo_cliente,
        Status: r.status,
        Observacoes: r.observacoes,
        CreatedAt: r.created_at,
        UpdatedAt: r.updated_at
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ records }) };
};

// DocuSign DataIO Version6.SearchRecords
// Searches records using DocuSign custom query language; maps to Supabase for Cliente
// Implements proper DocuSign DataIO query structure and single record limitation for Maestro workflows

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
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
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Unsupported from type. Use "Cliente".' }) };
    }

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

    // Apply DocuSign DataIO query filter structure
    if (query.queryFilter && query.queryFilter.operation) {
        const operation = query.queryFilter.operation;

        // Handle ComparisonOperation
        if (operation.operator === 'EQUALS') {
            const left = operation.leftOperand;
            const right = operation.rightOperand;
            if (left && right) {
                const fieldName = left.name;
                const literal = right.name;
                const column = attrToColumn(fieldName);
                if (column) {
                    dbQuery = dbQuery.eq(column, literal);
                }
            }
        }
        // Handle other operators
        else if (operation.operator === 'NOT_EQUALS') {
            const left = operation.leftOperand;
            const right = operation.rightOperand;
            if (left && right) {
                const fieldName = left.name;
                const literal = right.name;
                const column = attrToColumn(fieldName);
                if (column) {
                    dbQuery = dbQuery.neq(column, literal);
                }
            }
        }
        else if (operation.operator === 'CONTAINS') {
            const left = operation.leftOperand;
            const right = operation.rightOperand;
            if (left && right) {
                const fieldName = left.name;
                const literal = right.name;
                const column = attrToColumn(fieldName);
                if (column) {
                    dbQuery = dbQuery.ilike(column, `%${literal}%`);
                }
            }
        }
        else if (operation.operator === 'STARTS_WITH') {
            const left = operation.leftOperand;
            const right = operation.rightOperand;
            if (left && right) {
                const fieldName = left.name;
                const literal = right.name;
                const column = attrToColumn(fieldName);
                if (column) {
                    dbQuery = dbQuery.ilike(column, `${literal}%`);
                }
            }
        }
        else if (operation.operator === 'ENDS_WITH') {
            const left = operation.leftOperand;
            const right = operation.rightOperand;
            if (left && right) {
                const fieldName = left.name;
                const literal = right.name;
                const column = attrToColumn(fieldName);
                if (column) {
                    dbQuery = dbQuery.ilike(column, `%${literal}`);
                }
            }
        }
    }

    // Handle attributesToSelect - if specified, only select those fields
    if (query.attributesToSelect && Array.isArray(query.attributesToSelect) && query.attributesToSelect.length > 0) {
        const selectFields = query.attributesToSelect.map(attr => attrToColumn(attr)).filter(col => col !== null);
        if (selectFields.length > 0) {
            dbQuery = dbQuery.select(selectFields.join(', '));
        }
    }

    // Pagination - limit to 1 for Maestro compatibility
    const limit = 1; // Maestro workflows require single record response
    const skip = pagination && Number.isFinite(pagination.skip) ? Math.max(0, pagination.skip) : 0;
    dbQuery = dbQuery.range(skip, skip + limit - 1);

    // Execute query
    const { data: rows, error } = await dbQuery;
    if (error) {
        console.error('SearchRecords query error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: 'Unknown error when trying to search records' }) };
    }

    // Return records in DocuSign DataIO format
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

    // Maestro workflows require single record - return error if multiple found
    if (records.length > 1) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                code: 'MULTIPLE_RECORDS_FOUND',
                message: 'Search query returned multiple records. Maestro workflows require single record responses. Please refine your search criteria.'
            })
        };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ records }) };
};

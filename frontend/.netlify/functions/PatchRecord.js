// DocuSign DataIO Version6.PatchRecord
// Updates an existing Cliente record in Supabase using CPF/CNPJ as identifier

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const idemCache = new Map();

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

    const { typeName, idempotencyKey, recordId, data } = payload || {};
    if (!typeName || String(typeName).toLowerCase() !== 'cliente') {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Unsupported or missing typeName. Use "Cliente".' }) };
    }

    if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'data object is required' }) };
    }

    // Extract identifier from recordId or data
    let identifier = recordId;
    if (!identifier && data && (data.cpf_cnpj || data.CpfCnpj)) {
        identifier = data.cpf_cnpj || data.CpfCnpj;
    }
    // If still no identifier, try to use id field
    if (!identifier && data && (data.id || data.Id)) {
        identifier = data.id || data.Id;
    }

    if (!identifier) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'recordId or identifier field is required' }) };
    }

    const idemKey = idempotencyKey || event.headers['idempotency-key'] || event.headers['Idempotency-Key'];
    if (idemKey && idemCache.has(idemKey)) {
        return { statusCode: 200, headers, body: JSON.stringify(idemCache.get(idemKey)) };
    }

    const update = {};
    const mapIfPresent = (targetKey, ...aliases) => {
        for (const a of aliases) {
            if (Object.prototype.hasOwnProperty.call(data, a) && data[a] != null) {
                update[targetKey] = data[a];
                return;
            }
        }
    };

    mapIfPresent('nome', 'Nome', 'nome');
    mapIfPresent('email', 'Email', 'email');
    mapIfPresent('cpf_cnpj', 'CpfCnpj', 'cpf_cnpj');
    mapIfPresent('telefone', 'Telefone', 'telefone');
    mapIfPresent('endereco', 'Endereco', 'endereco');
    mapIfPresent('cidade', 'Cidade', 'cidade');
    mapIfPresent('estado', 'Estado', 'estado');
    mapIfPresent('cep', 'Cep', 'cep');
    mapIfPresent('tipo_cliente', 'TipoCliente', 'tipo_cliente');
    mapIfPresent('status', 'Status', 'status');
    mapIfPresent('observacoes', 'Observacoes', 'observacoes');

    update.updated_at = new Date().toISOString();

    try {
        // Determine if identifier is UUID or CPF/CNPJ
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

        // First, check if the record exists
        let checkQuery = supabase.from('clientes').select('id, cpf_cnpj, nome');
        if (isUuid) {
            checkQuery = checkQuery.eq('id', identifier);
        } else {
            checkQuery = checkQuery.eq('cpf_cnpj', identifier);
        }

        const { data: existingRecord, error: checkError } = await checkQuery.single();

        if (checkError) {
            console.error('PatchRecord check error:', checkError);
            // If it's a "not found" error, return 404
            if (checkError.code === 'PGRST116' || checkError.message?.includes('No rows found')) {
                return { statusCode: 404, headers, body: JSON.stringify({ code: 'NOT_FOUND', message: 'No record was found for the provided identifier' }) };
            }
            const message = checkError.message || 'Unknown error when checking record existence';
            return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message }) };
        }

        if (!existingRecord) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 'NOT_FOUND', message: 'No record was found for the provided identifier' }) };
        }

        // Now perform the update
        let updateQuery = supabase.from('clientes').update(update);
        if (isUuid) {
            updateQuery = updateQuery.eq('id', identifier);
        } else {
            updateQuery = updateQuery.eq('cpf_cnpj', identifier);
        }

        const { data: updated, error: updateError } = await updateQuery
            .select('id, cpf_cnpj, nome')
            .single();

        if (updateError) {
            console.error('PatchRecord update error:', updateError);
            const message = updateError.message || 'Unknown error when trying to update record';
            return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message }) };
        }

        if (!updated) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 'NOT_FOUND', message: 'No record was found for the provided identifier' }) };
        }

        const response = { success: true };
        if (idemKey) idemCache.set(idemKey, response);
        return { statusCode: 200, headers, body: JSON.stringify(response) };
    } catch (e) {
        console.error('PatchRecord unexpected error:', e);
        return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error when trying to update record' }) };
    }
};

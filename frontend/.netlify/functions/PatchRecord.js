// DocuSign DataIO Version6.PatchRecord
// Updates an existing Cliente record in Supabase

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
    if (!recordId) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'recordId is required' }) };
    }
    if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 'BAD_REQUEST', message: 'data object is required' }) };
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
    mapIfPresent('cidade', 'Cidade', 'cidade');
    mapIfPresent('estado', 'Estado', 'estado');
    mapIfPresent('tipo_cliente', 'TipoCliente', 'tipo_cliente');
    mapIfPresent('status', 'Status', 'status');

    update.updated_at = new Date().toISOString();

    try {
        const { data: updated, error } = await supabase
            .from('clientes')
            .update(update)
            .eq('id', recordId)
            .select('id')
            .single();

        if (error) {
            console.error('PatchRecord update error:', error);
            const message = error.message || 'Unknown error when trying to update record';
            return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message }) };
        }
        if (!updated) {
            return { statusCode: 404, headers, body: JSON.stringify({ code: 'NOT_FOUND', message: 'No record was found for the provided recordId' }) };
        }

        const response = { success: true };
        if (idemKey) idemCache.set(idemKey, response);
        return { statusCode: 200, headers, body: JSON.stringify(response) };
    } catch (e) {
        console.error('PatchRecord unexpected error:', e);
        return { statusCode: 500, headers, body: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error when trying to update record' }) };
    }
};

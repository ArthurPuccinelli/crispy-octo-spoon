// DocuSign DataIO Version6.CreateRecord
// Creates a record in our external system (Supabase) for type Cliente

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Simple in-memory idempotency store for function cold starts (Netlify instances)
// For production, replace with durable store (e.g., Supabase table keyed by idempotencyKey)
const idemCache = new Map();

function isUuidV4(value) {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!supabase) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { typeName, idempotencyKey, recordId, data } = payload;

    const typeNorm = String(typeName || '').toLowerCase();
    if (!typeName || typeNorm !== 'cliente') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported or missing typeName. Use "Cliente".' }) };
    }
    if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing data object' }) };
    }

    // Idempotency
    const idemKey = idempotencyKey || event.headers['idempotency-key'] || event.headers['Idempotency-Key'];
    if (idemKey && idemCache.has(idemKey)) {
        return { statusCode: 200, headers, body: JSON.stringify(idemCache.get(idemKey)) };
    }

    const now = new Date().toISOString();

    // Map fields from potential PascalCase to our schema
    const mapped = {
        id: recordId && isUuidV4(recordId) ? recordId : undefined,
        nome: data.Nome ?? data.nome ?? null,
        email: data.Email ?? data.email ?? null,
        cpf_cnpj: data.CpfCnpj ?? data.cpf_cnpj ?? null,
        telefone: data.Telefone ?? data.telefone ?? null,
        cidade: data.Cidade ?? data.cidade ?? null,
        estado: data.Estado ?? data.estado ?? null,
        tipo_cliente: data.TipoCliente ?? data.tipo_cliente ?? null,
        status: data.Status ?? data.status ?? 'ativo',
        created_at: now,
        updated_at: now
    };

    if (!mapped.nome || !mapped.cpf_cnpj) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Fields "Nome/nome" and "CpfCnpj/cpf_cnpj" are required' }) };
    }

    try {
        const { data: inserted, error } = await supabase
            .from('clientes')
            .insert([mapped])
            .select('id')
            .single();

        if (error) {
            console.error('CreateRecord insert error:', error);
            // Common cause: invalid UUID provided
            const message = error.message || 'Failed to create record';
            const status = /uuid/i.test(message) ? 400 : 500;
            return { statusCode: status, headers, body: JSON.stringify({ error: message }) };
        }

        const response = { recordId: inserted.id };
        if (idemKey) {
            idemCache.set(idemKey, response);
        }
        return { statusCode: 200, headers, body: JSON.stringify(response) };
    } catch (e) {
        console.error('CreateRecord unexpected error:', e);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unexpected error creating record' }) };
    }
};

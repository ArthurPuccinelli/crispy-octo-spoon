// DocuSign DataIO Version6.CreateRecord
// Creates a record in our external system (Supabase) for type Cliente

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Simple in-memory idempotency store for function cold starts (Netlify instances)
// For production, replace with durable store (e.g., Supabase table keyed by idempotencyKey)
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

    // Validate
    if (!typeName || String(typeName).toLowerCase() !== 'cliente') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported or missing typeName' }) };
    }
    if (!data || typeof data !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing data object' }) };
    }

    // Idempotency
    const idemKey = idempotencyKey || event.headers['idempotency-key'] || event.headers['Idempotency-Key'];
    if (idemKey && idemCache.has(idemKey)) {
        return { statusCode: 200, headers, body: JSON.stringify(idemCache.get(idemKey)) };
    }

    // Map Data IO field names (potentially PascalCase) to our DB schema (snake_case)
    // Expecting fields aligned with our Cliente definition
    const now = new Date().toISOString();
    const newRecord = {
        id: recordId || undefined,
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

    // Basic required checks
    if (!newRecord.nome || !newRecord.cpf_cnpj) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'nome and cpf_cnpj are required' }) };
    }

    const insertPayload = [{ ...newRecord }];

    const { data: inserted, error } = await supabase
        .from('clientes')
        .insert(insertPayload)
        .select('id')
        .single();

    if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create record' }) };
    }

    const response = { recordId: inserted.id };

    if (idemKey) {
        idemCache.set(idemKey, response);
    }

    return { statusCode: 200, headers, body: JSON.stringify(response) };
};

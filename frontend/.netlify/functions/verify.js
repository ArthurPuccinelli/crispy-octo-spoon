// ConnectedFields Version1.Verify
// Verifies a set of fields for a given entity against our platform

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
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const auth = event.headers.authorization || event.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (!supabase) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
    }

    const req = JSON.parse(event.body || '{}');
    // Expected: { typeName: 'Cliente', data: { ...fields } }
    const { typeName, data } = req;
    if (typeName !== 'Cliente' || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid payload' }) };
    }

    // Basic verification examples: verify cpf_cnpj uniqueness or match existing record by id/email
    const queries = [];
    if (data.id) {
        queries.push(supabase.from('clientes').select('*').eq('id', data.id).limit(1));
    }
    if (data.cpf_cnpj) {
        queries.push(supabase.from('clientes').select('*').eq('cpf_cnpj', data.cpf_cnpj).limit(1));
    }
    if (data.email) {
        queries.push(supabase.from('clientes').select('*').eq('email', data.email).limit(1));
    }

    const results = [];
    for (const q of queries) {
        const { data: rows, error } = await q;
        if (!error && rows && rows.length) {
            results.push(rows[0]);
        }
    }

    const isValid = results.length > 0;
    return { statusCode: 200, headers, body: JSON.stringify({ valid: isValid, matches: results }) };
};



// DocuSign DataIO Version6.GetTypeNames
// Returns array of available type names for our platform

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

    // Minimal token header check (Auth0 token verification happens at gateway / DocuSign)
    const auth = event.headers.authorization || event.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = {
        typeNames: [
            // Core customer entity
            'Cliente'
        ]
    };

    return { statusCode: 200, headers, body: JSON.stringify(body) };
};



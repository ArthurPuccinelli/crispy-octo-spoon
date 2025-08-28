// DocuSign DataIO Version6.GetTypeNames
// Returns array of available type names for our platform

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: JSON.stringify({}) };
    }

    // Accept POST (spec) and GET (console probes)
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Per Data IO contract, typeNames must be objects (not strings)
    const body = {
        typeNames: [
            { name: 'Cliente' }
        ]
    };

    return { statusCode: 200, headers, body: JSON.stringify(body) };
};



// DocuSign DataIO Version6.GetTypeDefinitions
// Returns type definition schema for a given type name

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

    const req = JSON.parse(event.body || '{}');
    const { typeNames } = req;
    const requested = Array.isArray(typeNames) && typeNames.length ? typeNames : ['Cliente'];

    const defs = requested.map((name) => {
        if (name === 'Cliente') {
            return {
                typeName: 'Cliente',
                attributes: [
                    { name: 'id', type: 'STRING', isPrimaryKey: true },
                    { name: 'nome', type: 'STRING' },
                    { name: 'email', type: 'STRING' },
                    { name: 'cpf_cnpj', type: 'STRING' },
                    { name: 'telefone', type: 'STRING' },
                    { name: 'cidade', type: 'STRING' },
                    { name: 'estado', type: 'STRING' },
                    { name: 'tipo_cliente', type: 'STRING' },
                    { name: 'status', type: 'STRING' }
                ]
            };
        }
        return { typeName: name, attributes: [] };
    });

    return { statusCode: 200, headers, body: JSON.stringify({ typeDefinitions: defs }) };
};



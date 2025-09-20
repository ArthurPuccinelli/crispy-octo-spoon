// DocuSign DataIO Version6.GetTypeDefinitions
// Returns Concerto metamodel declarations for requested types

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

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const typeNames = Array.isArray(payload.typeNames) ? payload.typeNames : [];

    // Map of supported types (case-insensitive) to declaration builders
    const supported = new Map();

    supported.set('cliente', () => buildClienteConcept());

    const declarations = [];
    const errors = [];

    if (typeNames.length === 0) {
        // If none provided, return our primary type
        declarations.push(buildClienteConcept());
    } else {
        for (const name of typeNames) {
            const key = String(name || '').toLowerCase();
            const builder = supported.get(key);
            if (builder) {
                declarations.push(builder());
            } else {
                errors.push({
                    typeName: name,
                    code: 'schemaRetrievalFailed',
                    message: `Failed to fetch the schema of ${name} from the external system of record`
                });
            }
        }
    }

    const body = { declarations };
    if (errors.length) body.errors = errors;

    return { statusCode: 200, headers, body: JSON.stringify(body) };
};

function buildClienteConcept() {
    // ConceptDeclaration for Cliente with CRUD decorators and identified by id
    return {
        "$class": "concerto.metamodel@1.0.0.ConceptDeclaration",
        "name": "Cliente",
        "isAbstract": false,
        "decorators": [
            {
                "$class": "concerto.metamodel@1.0.0.Decorator",
                "name": "Term",
                "arguments": [
                    { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Cliente" }
                ]
            },
            {
                "$class": "concerto.metamodel@1.0.0.Decorator",
                "name": "Crud",
                "arguments": [
                    { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                ]
            }
        ],
        "identified": {
            "$class": "concerto.metamodel@1.0.0.IdentifiedBy",
            "name": "id"
        },
        "properties": [
            // id (String, required, Readable)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "id",
                "isOptional": false,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Cliente ID" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Readable" }
                        ]
                    }
                ]
            },
            // nome (String, required, CRU)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "nome",
                "isOptional": false,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Nome" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // email (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "email",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Email" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // cpf_cnpj (String, required, CRU)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "cpf_cnpj",
                "isOptional": false,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "CPF/CNPJ" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // telefone (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "telefone",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Telefone" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // cidade (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "cidade",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Cidade" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // estado (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "estado",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Estado" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // tipo_cliente (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "tipo_cliente",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Tipo de Cliente" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // status (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "status",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Status" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // endereco (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "endereco",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Endereço" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // cep (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "cep",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "CEP" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            },
            // observacoes (String, optional, CRUD)
            {
                "$class": "concerto.metamodel@1.0.0.StringProperty",
                "name": "observacoes",
                "isOptional": true,
                "isArray": false,
                "decorators": [
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Term",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Observações" }
                        ]
                    },
                    {
                        "$class": "concerto.metamodel@1.0.0.Decorator",
                        "name": "Crud",
                        "arguments": [
                            { "$class": "concerto.metamodel@1.0.0.DecoratorString", "value": "Createable,Readable,Updateable" }
                        ]
                    }
                ]
            }
        ]
    };
}

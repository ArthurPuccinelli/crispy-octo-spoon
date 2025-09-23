require('dotenv').config();

const docusignConfig = {
  // Configurações da API DocuSign
  api: {
    baseUrl: process.env.DOCUSIGN_API_BASE_URL || process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi',
    accountId: process.env.DOCUSIGN_ACCOUNT_ID,
    userId: process.env.DOCUSIGN_USER_ID,
    integrationKey: process.env.DOCUSIGN_IK || process.env.DOCUSIGN_INTEGRATION_KEY,
    rsaPrivateKey: (process.env.DOCUSIGN_RSA_PEM_AS_BASE64
      ? Buffer.from(process.env.DOCUSIGN_RSA_PEM_AS_BASE64, 'base64').toString('utf8')
      : process.env.DOCUSIGN_RSA_PRIVATE_KEY),
    oauthBasePath: process.env.DOCUSIGN_AUTH_SERVER || process.env.DOCUSIGN_OAUTH_BASE_PATH || 'account-d.docusign.com'
  },

  // Configurações do Extension App
  extensionApp: {
    name: 'Crispy Octo Spoon - Clientes Data IO',
    version: '1.0.0',
    festPath: './docusign-extension-app-fest.json',
    capabilities: ['data:read', 'data:write'],
    maxRecordsPerRequest: 100,
    timeout: 30000
  },

  // Configurações de autenticação
  auth: {
    grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    scope: process.env.DOCUSIGN_IAM_SCOPES || 'signature impersonation',
    tokenExpiration: 3600, // 1 hora
    refreshThreshold: 300 // 5 minutos antes de expirar
  },

  // Configurações de Data IO
  dataIO: {
    entities: {
      cliente: {
        name: 'cliente',
        displayName: 'Cliente',
        description: 'Informações do cliente',
        fields: [
          'id', 'nome', 'email', 'cpf_cnpj', 'telefone',
          'cidade', 'estado', 'tipo_cliente', 'status',
          'created_at', 'updated_at'
        ],
        requiredFields: ['nome', 'email', 'tipo_cliente'],
        searchableFields: ['nome', 'email', 'cpf_cnpj', 'cidade', 'estado']
      },
      produto: {
        name: 'produto',
        displayName: 'Produto',
        description: 'Informações do produto',
        fields: [
          'id', 'nome', 'descricao', 'preco', 'categoria',
          'status', 'created_at', 'updated_at'
        ],
        requiredFields: ['nome', 'preco', 'categoria'],
        searchableFields: ['nome', 'categoria', 'status']
      },
      servico: {
        name: 'servico',
        displayName: 'Serviço',
        description: 'Informações do serviço',
        fields: [
          'id', 'nome', 'descricao', 'preco', 'tipo',
          'status', 'created_at', 'updated_at'
        ],
        requiredFields: ['nome', 'preco', 'tipo'],
        searchableFields: ['nome', 'tipo', 'status']
      }
    },
    operations: {
      read: true,
      write: true,
      delete: false,
      query: true
    }
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true',
    logDocuSignRequests: process.env.LOG_DOCUSIGN_REQUESTS === 'true'
  },

  // Configurações de segurança
  security: {
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 100,
    enableCORS: process.env.ENABLE_CORS === 'true',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  }
};

// Validação das configurações obrigatórias
const validateConfig = () => {
  const requiredFields = [
    'DOCUSIGN_ACCOUNT_ID',
    'DOCUSIGN_USER_ID',
    'DOCUSIGN_INTEGRATION_KEY'
  ];

  const missingFields = requiredFields.filter(field => !process.env[field]);

  if (missingFields.length > 0) {
    console.warn('⚠️  Configurações DocuSign ausentes:', missingFields);
    console.warn('   Algumas funcionalidades podem não funcionar corretamente');
  }

  return missingFields.length === 0;
};

// Verificar se estamos em modo de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('🔧 Modo de desenvolvimento ativado');
  console.log('📋 Configurações DocuSign carregadas:', {
    baseUrl: docusignConfig.api.baseUrl,
    hasAccountId: !!docusignConfig.api.accountId,
    hasUserId: !!docusignConfig.api.userId,
    hasIntegrationKey: !!docusignConfig.api.integrationKey
  });
}

module.exports = {
  config: docusignConfig,
  validateConfig,
  isDevelopment
};

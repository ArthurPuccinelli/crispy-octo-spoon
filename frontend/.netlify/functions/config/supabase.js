require('dotenv').config();

const supabaseConfig = {
  // Configurações do Supabase
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Configurações de tabelas
  tables: {
    clientes: 'clientes',
    produtos: 'produtos',
    servicos_contratados: 'servicos_contratados'
  },

  // Configurações de paginação
  pagination: {
    defaultLimit: 50,
    maxLimit: 100
  },

  // Configurações de cache
  cache: {
    enabled: process.env.ENABLE_CACHE === 'true',
    ttl: parseInt(process.env.CACHE_TTL) || 300 // 5 minutos
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableQueryLog: process.env.ENABLE_QUERY_LOG === 'true'
  }
};

// Validação das configurações obrigatórias
const validateConfig = () => {
  const requiredFields = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  
  const missingFields = requiredFields.filter(field => {
    const envValue = process.env[field] || process.env[`NEXT_PUBLIC_${field}`];
    return !envValue;
  });
  
  if (missingFields.length > 0) {
    console.warn('⚠️  Configurações Supabase ausentes:', missingFields);
    console.warn('   As funcionalidades de clientes podem não funcionar corretamente');
  }

  return missingFields.length === 0;
};

// Verificar se estamos em modo de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('🔧 Modo de desenvolvimento ativado');
  console.log('📋 Configurações Supabase carregadas:', {
    hasUrl: !!supabaseConfig.url,
    hasAnonKey: !!supabaseConfig.anonKey,
    tables: supabaseConfig.tables
  });
}

module.exports = {
  config: supabaseConfig,
  validateConfig,
  isDevelopment
};

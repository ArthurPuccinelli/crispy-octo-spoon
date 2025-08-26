const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rotas
const docusignRoutes = require('./routes/docusign');
const clientesRoutes = require('./routes/clientes');

const app = express();

// Configuração do CORS para Netlify
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como mobile apps)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3002',
      'https://crispy-octo-spoon.netlify.app',
      'https://*.netlify.app'
    ];
    
    // Verificar se a origem está permitida
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        return origin.includes(allowedOrigin.replace('*', ''));
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configuração do Helmet para Netlify
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para adicionar headers CORS em todas as respostas
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Bem-vindo ao Crispy Octo Spoon API!',
    version: '1.0.0',
    status: 'online',
    environment: 'netlify-functions'
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions'
  });
});

// Rotas do DocuSign
app.use('/docusign', docusignRoutes);

// Rotas de Clientes (compatível com DocuSign Data IO)
app.use('/clientes', clientesRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: err.message
  });
});

// Rota 404 para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Exportar para Netlify Functions
exports.handler = app;

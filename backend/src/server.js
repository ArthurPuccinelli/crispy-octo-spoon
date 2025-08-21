const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS mais permissiva para desenvolvimento
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configuração do Helmet menos restritiva para desenvolvimento
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para desenvolvimento
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para adicionar headers CORS em todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Bem-vindo ao Crispy Octo Spoon API!',
    version: '1.0.0',
    status: 'online'
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota de exemplo para clientes
app.get('/api/clientes', (req, res) => {
  res.json({
    message: 'Lista de clientes',
    data: [
      { id: 1, nome: 'João Silva', email: 'joao@email.com' },
      { id: 2, nome: 'Maria Santos', email: 'maria@email.com' }
    ]
  });
});

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

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

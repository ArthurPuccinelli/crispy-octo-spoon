#!/bin/bash

echo "🍜 Iniciando Crispy Octo Spoon..."
echo "=================================="

# Verificar se as portas estão disponíveis
echo "🔍 Verificando portas..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Porta 3000 (frontend) já está em uso"
    exit 1
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Porta 3001 (backend) já está em uso"
    exit 1
fi

echo "✅ Portas disponíveis"

# Instalar dependências se necessário
echo "📦 Verificando dependências..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

echo "✅ Dependências instaladas"

# Iniciar serviços
echo "🚀 Iniciando serviços..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "Health:   http://localhost:3001/health"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"
echo "=================================="

# Iniciar frontend e backend em paralelo
npm run dev

#!/bin/bash

# Script para configurar ambiente de desenvolvimento local
# Este script cria o arquivo .env.local baseado no template

echo "🚀 Configurando ambiente de desenvolvimento local..."

# Verificar se estamos no diretório correto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto (onde está o frontend/)"
    exit 1
fi

# Navegar para o diretório frontend
cd frontend

# Verificar se o template existe
if [ ! -f "env.local.template" ]; then
    echo "❌ Erro: Arquivo env.local.template não encontrado"
    exit 1
fi

# Verificar se .env.local já existe
if [ -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local já existe"
    read -p "Deseja sobrescrever? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

# Copiar template para .env.local
cp env.local.template .env.local

echo "✅ Arquivo .env.local criado com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Edite o arquivo frontend/.env.local"
echo "2. Configure as variáveis do Supabase (obrigatório):"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo ""
echo "3. (Opcional) Configure as variáveis do DocuSign se necessário"
echo "4. Execute: npm run dev"
echo ""
echo "📚 Para mais informações, consulte: ENV_VARIABLES_GUIDE.md"

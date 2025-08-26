#!/bin/bash

echo "🚀 Iniciando build do Crispy Octo Spoon..."

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Instalar dependências das funções do Netlify
echo "🔧 Instalando dependências das funções..."
cd .netlify/functions
npm install
cd ../..

# Build do Next.js
echo "🏗️  Fazendo build do Next.js..."
npm run build

echo "✅ Build concluído com sucesso!"
echo "🌐 Frontend será publicado em: .next"
echo "⚡ Funções serão publicadas em: .netlify/functions"

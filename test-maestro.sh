#!/bin/bash

echo "🧪 Testando função Maestro após deploy..."

BASE_URL="https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro"

echo ""
echo "1️⃣ Testando diagnóstico..."
curl -s -X GET "$BASE_URL/diag" | jq '.'

echo ""
echo "2️⃣ Testando autenticação JWT..."
curl -s -X GET "$BASE_URL/test-auth" | jq '.'

echo ""
echo "3️⃣ Testando trigger de workflow..."
curl -s -X POST "$BASE_URL/trigger" \
  -H "Content-Type: application/json" \
  -d '{"workflowKey": "emprestimos", "inputs": {}}' | jq '.'

echo ""
echo "✅ Testes concluídos!"

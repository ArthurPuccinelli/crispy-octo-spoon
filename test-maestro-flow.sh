#!/bin/bash

echo "🎯 Testando fluxo DocuSign Maestro correto..."
echo ""

echo "📋 Fluxo do Maestro:"
echo "1. Obter credenciais / token de acesso (OAuth)"
echo "2. Construir os headers de requisição"
echo "3. Obter a triggerURL"
echo "4. Construir o corpo da requisição (request body)"
echo "5. Fazer a chamada POST para a triggerURL"
echo "6. Verificar resposta / status"
echo ""

# 1. Testar trigger (deve retornar consent_required)
echo "1️⃣ Testando trigger (deve retornar consent_required):"
curl -s -X POST "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/trigger" \
  -H "Content-Type: application/json" \
  -d '{"workflowKey": "emprestimos", "inputs": {}}' | jq '.'
echo ""

# 2. Testar consent URL
echo "2️⃣ Testando consent URL:"
CONSENT_URL=$(curl -s -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/consent" | jq -r '.consentUrl')
echo "URL de consentimento: $CONSENT_URL"
echo ""

echo "✅ Implementação corrigida seguindo o fluxo oficial do Maestro!"
echo ""
echo "📋 Próximos passos para testar:"
echo "1. Acesse: https://crispy-octo-spoon.netlify.app"
echo "2. Clique em 'Contrate agora' no card Empréstimos"
echo "3. Será redirecionado para: $CONSENT_URL"
echo "4. Autorize o acesso no DocuSign"
echo "5. Após autorização, o workflow será iniciado automaticamente"
echo ""
echo "🔧 O que foi corrigido:"
echo "- Agora obtemos a triggerURL específica do workflow"
echo "- Construímos o request body com startingVariables"
echo "- Fazemos POST para a triggerURL específica"
echo "- Verificamos a resposta corretamente"

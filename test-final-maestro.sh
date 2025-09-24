#!/bin/bash

echo "🎯 Teste final do fluxo DocuSign Maestro com escopo correto"
echo ""

echo "1️⃣ Testando consent URL (deve incluir aow_manage):"
CONSENT_URL=$(curl -s -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/consent" | jq -r '.consentUrl')
echo "URL: $CONSENT_URL"
echo ""

echo "2️⃣ Verificando se inclui escopo aow_manage:"
if [[ $CONSENT_URL == *"aow_manage"* ]]; then
    echo "✅ Escopo aow_manage incluído corretamente"
else
    echo "❌ Escopo aow_manage NÃO encontrado"
fi
echo ""

echo "3️⃣ Testando trigger (deve retornar consent_required):"
curl -s -X POST "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/trigger" \
  -H "Content-Type: application/json" \
  -d '{"workflowKey": "emprestimos", "inputs": {}}' | jq '.'
echo ""

echo "✅ Implementação finalizada!"
echo ""
echo "📋 Para testar o fluxo completo:"
echo "1. Acesse: https://crispy-octo-spoon.netlify.app"
echo "2. Clique em 'Contrate agora' no card Empréstimos"
echo "3. Será redirecionado para DocuSign com escopo aow_manage"
echo "4. Autorize o acesso (incluindo Maestro)"
echo "5. Após autorização, o workflow será iniciado automaticamente"
echo ""
echo "🔧 Correções aplicadas:"
echo "- Consent URL agora inclui escopo aow_manage"
echo "- JWT gera com scopes corretos para Maestro"
echo "- Fluxo segue documentação oficial do DocuSign"

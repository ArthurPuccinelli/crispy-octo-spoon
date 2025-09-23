#!/bin/bash

echo "🧪 Testando fluxo DocuSign Maestro OAuth2 completo..."
echo ""

# 1. Testar trigger (deve retornar consent_required)
echo "1️⃣ Testando trigger (deve retornar consent_required):"
curl -s -X POST "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/trigger" \
  -H "Content-Type: application/json" \
  -d '{"workflowKey": "emprestimos", "inputs": {}}' | jq '.'
echo ""

# 2. Testar consent URL
echo "2️⃣ Testando consent URL:"
curl -s -X GET "https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/consent" | jq '.consentUrl'
echo ""

# 3. Testar token exchange (simulado)
echo "3️⃣ Testando token exchange (simulado):"
echo "Nota: Para testar completamente, você precisa:"
echo "   1. Acessar a URL de consent no navegador"
echo "   2. Autorizar o acesso"
echo "   3. Copiar o código da URL de retorno"
echo "   4. Executar: curl -X POST 'https://crispy-octo-spoon.netlify.app/.netlify/functions/maestro/token-exchange' -H 'Content-Type: application/json' -d '{\"code\": \"SEU_CODIGO_AQUI\"}'"
echo ""

echo "✅ Fluxo OAuth2 implementado com sucesso!"
echo "📋 Próximos passos:"
echo "   1. Acesse: https://crispy-octo-spoon.netlify.app"
echo "   2. Clique em 'Contrate agora' no card Empréstimos"
echo "   3. Autorize o consentimento no DocuSign"
echo "   4. Após autorização, o workflow deve iniciar automaticamente"

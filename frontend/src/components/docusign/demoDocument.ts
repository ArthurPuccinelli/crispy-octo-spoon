// Utilitários compartilhados das demos DocuSign

/** Documento HTML de demonstração com âncora \saes\ para posicionamento da assinatura */
export const createDemoDocument = (name: string, email: string, cpf: string, phone?: string) => {
    const phoneText = phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ''
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contrato de Fornecimento - Fontara</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { margin: 20px 0; }
    .signature-area { margin-top: 50px; text-align: center; }
    .anchor { color: #ffffff; font-size: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE FORNECIMENTO</h1>
    <h2>Fontara Financial</h2>
  </div>

  <div class="content">
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>CPF:</strong> ${cpf}</p>
    ${phoneText}

    <h3>Termos e Condições:</h3>
    <p>Este contrato estabelece os termos de fornecimento de serviços financeiros pela Fontara Financial.</p>
    <p>O cliente concorda com todos os termos e condições estabelecidos neste documento.</p>
    <p>Este documento foi gerado automaticamente através de nossa plataforma de assinatura eletrônica.</p>
  </div>

  <div class="signature-area">
    <p><strong>Assinatura do Cliente:</strong></p>
    <span class="anchor">\\saes\\</span>
  </div>
</body>
</html>`
}

/** Validação de CPF (dígitos verificadores) */
export const validateCpf = (cpfRaw: string): boolean => {
    const cpf = cpfRaw.replace(/[^0-9]/g, '')
    if (!cpf || cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false
    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
    let rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(cpf.charAt(9))) return false
    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
    rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    return rev === parseInt(cpf.charAt(10))
}

/** Codifica HTML em base64 (UTF-8 safe) */
export const htmlToBase64 = (html: string): string =>
    typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(html))) : ''

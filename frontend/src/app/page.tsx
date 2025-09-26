
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [creatingEnvelope, setCreatingEnvelope] = useState(false)
  const [startingLoanFlow, setStartingLoanFlow] = useState(false)
  const [showPixEnvelope, setShowPixEnvelope] = useState(false)
  const [pixEnvelopeUrl, setPixEnvelopeUrl] = useState('')
  const [showMaestro, setShowMaestro] = useState(false)
  const [maestroUrl, setMaestroUrl] = useState('')
  const [showAdvancedSignature, setShowAdvancedSignature] = useState(false)
  const [advancedName, setAdvancedName] = useState('')
  const [advancedEmail, setAdvancedEmail] = useState('')
  const [advancedCpf, setAdvancedCpf] = useState('')
  const [advancedPhone, setAdvancedPhone] = useState('')
  const [advancedSubmitting, setAdvancedSubmitting] = useState(false)
  const [advancedDeliveryMethod, setAdvancedDeliveryMethod] = useState<'now' | 'whatsapp'>('now')

  // Função para criar documento HTML de demonstração com âncora \saes\
  const createDemoDocument = (name: string, email: string, cpf: string, phone?: string) => {
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

  const validateCpf = (cpfRaw: string): boolean => {
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

  const handlePixConhecaMais = async () => {
    if (creatingEnvelope) return
    setCreatingEnvelope(true)
    try {
      // Usar documento de demonstração com âncora \\saes\\
      const html = createDemoDocument('Teste PIX', 'teste@fontara.com', '00000000000')
      const base64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(html))) : ''

      const res = await fetch('/.netlify/functions/docusign-actions/envelopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailSubject: 'Envelope de Teste - PIX',
          emailBlurb: 'Teste de criação de envelope via botão PIX',
          status: 'sent', // Mudando para 'sent' para permitir assinatura
          documents: [
            { name: 'pix-teste.html', fileExtension: 'html', base64 }
          ],
          recipients: {
            signers: [
              {
                email: 'signer@example.com',
                name: 'Signer Teste',
                routingOrder: 1,
                tabs: {
                  signHereTabs: [
                    {
                      documentId: '1',
                      pageNumber: '1',
                      anchorString: "\\saes\\",
                      anchorUnits: 'pixels',
                      anchorXOffset: '0',
                      anchorYOffset: '0',
                      anchorIgnoreIfNotPresent: true,
                      anchorMatchWholeWord: false,
                      anchorCaseSensitive: false
                    }
                  ]
                }
              }
            ]
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data?.message === 'object' ? JSON.stringify(data.message) : (data?.message || data?.error)
        alert(`Falha ao criar envelope: ${msg || 'erro desconhecido'}`)
      } else {
        const envelopeId = data.envelopeId || data?.data?.envelopeId

        // Obter URL de embed para o envelope
        const embedRes = await fetch('/.netlify/functions/docusign-actions/envelopes/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            envelopeId,
            returnUrl: window.location.href
          })
        })

        const embedData = await embedRes.json()
        if (embedRes.ok && embedData.url) {
          setPixEnvelopeUrl(embedData.url)
          setShowPixEnvelope(true)
        } else {
          alert(`Envelope criado (ID: ${envelopeId}), mas falha ao obter URL de embed`)
        }
      }
    } catch (e: any) {
      alert(`Erro ao criar envelope: ${e?.message || 'desconhecido'}`)
    } finally {
      setCreatingEnvelope(false)
    }
  }

  const handleLoansContrateAgora = async () => {
    if (startingLoanFlow) return
    setStartingLoanFlow(true)
    try {
      const res = await fetch('/.netlify/functions/maestro/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} })
      })
      const data = await res.json()

      // Check for consent required error or HTML response (indicates consent needed)
      if (!res.ok && (data?.error === 'consent_required' || data?.message?.error === 'consent_required' ||
        (data?.data && typeof data.data === 'string' && data.data.includes('<!DOCTYPE html>')))) {

        // Check if consent was recently given
        const consentGiven = localStorage.getItem('docusign_consent_given')
        const consentTime = localStorage.getItem('docusign_consent_time')
        const now = Date.now()

        if (consentGiven && consentTime && (now - parseInt(consentTime)) < 300000) { // 5 minutes
          // Consent was given recently, try again with fresh JWT
          console.log('Consent was given recently, retrying...')
          // Clear old consent flag and try again
          localStorage.removeItem('docusign_consent_given')
          localStorage.removeItem('docusign_consent_time')

          // Retry the request
          const retryRes = await fetch('/.netlify/functions/maestro/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: {} })
          })
          const retryData = await retryRes.json()

          if (retryRes.ok && (retryData.workflowInstanceUrl || retryData?.data?.workflowInstanceUrl || retryData?.instanceUrl)) {
            const url = retryData.workflowInstanceUrl || retryData?.data?.workflowInstanceUrl || retryData?.instanceUrl
            window.location.href = url
            return
          }
        }

        // Clear any existing tokens and get consent
        localStorage.removeItem('docusign_access_token')
        localStorage.removeItem('docusign_token_expires')
        localStorage.removeItem('docusign_consent_given')
        localStorage.removeItem('docusign_consent_time')

        // Get consent URL
        const consentRes = await fetch('/.netlify/functions/maestro/consent', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const consentData = await consentRes.json()
        if (consentRes.ok && consentData.consentUrl) {
          // Redirect to consent page
          window.location.href = consentData.consentUrl
          return
        } else {
          throw new Error('Falha ao obter URL de consentimento')
        }
      }

      if (!res.ok) {
        // show diagnostics via alert only
        const diag = data?.diagnostics ? `\nDiagnostics: ${JSON.stringify(data.diagnostics)}` : ''
        throw new Error(((typeof data?.message === 'object' ? JSON.stringify(data.message) : (data?.message || 'Falha ao iniciar workflow'))) + diag)
      }

      const instanceId = data.instanceId || data?.data?.instanceId || data?.data?.id
      const workflowInstanceUrl = data.workflowInstanceUrl || data?.data?.workflowInstanceUrl || data?.instanceUrl || data?.data?.instanceUrl
      if (!instanceId || !workflowInstanceUrl) {
        const diag = data?.diagnostics ? `\nDiagnostics: ${JSON.stringify(data.diagnostics)}` : ''
        throw new Error('Dados do workflow não retornados' + diag)
      }

      // Abrir embed em modal (iframe)
      setMaestroUrl(workflowInstanceUrl)
      setShowMaestro(true)
    } catch (e: any) {
      alert(`Erro ao iniciar fluxo de Empréstimos: ${e?.message || 'desconhecido'}`)
    } finally {
      setStartingLoanFlow(false)
    }
  }

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-3">
              <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <div className="relative p-1">
                  <Image
                    src="/logo-fontara-final.svg"
                    alt="Fontara Financial"
                    width={200}
                    height={50}
                    className="h-10 w-auto"
                  />
                </div>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 text-sm">Início</a>
              <a href="/clientes" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 text-sm">Clientes</a>
              <a href="/admin" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 text-sm">Administração</a>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-teal-500/25 text-sm animate-pulse">
                Abra sua conta
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Hero Content */}
            <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                    Fontara
                  </span>
                  <br />
                  <span className="text-white/90">
                    Financial
                  </span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-4xl mx-auto leading-relaxed">
                Sua plataforma financeira completa. Gerencie clientes, produtos e serviços com tecnologia de ponta e segurança bancária.
              </p>
            </div>

            {/* Produtos e Serviços Financeiros */}
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Conta Digital */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-teal-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Conta Digital</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Abra sua conta digital em minutos, sem burocracia. Transfira, pague e invista com total segurança.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sem anuidade
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      TED gratuita
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Cartão sem taxa
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-teal-500/25 animate-pulse">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Abra sua conta
                    </span>
                  </button>
                </div>
              </div>

              {/* Investimentos */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Investimentos</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Invista em fundos, ações e títulos com a menor taxa do mercado. Comece com apenas R$ 1,00.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Taxa zero de corretagem
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      A partir de R$ 1,00
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Análise de IA
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 animate-pulse">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Conheça Mais
                    </span>
                  </button>
                </div>
              </div>

              {/* Empréstimos */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Empréstimos</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Empréstimo pessoal com as melhores taxas do mercado. Aprovação em até 24 horas.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Até R$ 50.000
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Aprovação em 24h
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sem IOF
                    </div>
                  </div>
                  <button onClick={handleLoansContrateAgora} disabled={startingLoanFlow} className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 animate-pulse disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {startingLoanFlow ? 'Iniciando...' : 'Contrate agora'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Seguros */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Seguros</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Proteja o que é importante para você. Seguros de vida, auto, residencial e muito mais.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Vida, Auto, Residencial
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Cobertura 24/7
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Até 30% de desconto
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 animate-pulse">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Conheça Mais
                    </span>
                  </button>
                </div>
              </div>

              {/* PIX */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">PIX</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Transfira dinheiro instantaneamente a qualquer hora. PIX gratuito e ilimitado.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Transferência instantânea
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      24 horas por dia
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completamente gratuito
                    </div>
                  </div>
                  <button onClick={handlePixConhecaMais} disabled={creatingEnvelope} className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 animate-pulse disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {creatingEnvelope ? 'Criando envelope...' : 'Conheça Mais'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Cartão de Crédito */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Cartão de Crédito</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Cartão sem anuidade com cashback e programa de pontos. Aprovação em minutos.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sem anuidade
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      1% de cashback
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <svg className="w-4 h-4 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Programa de pontos
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 animate-pulse">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Conheça Mais
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className={`grid md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Segurança */}
              <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Segurança Bancária</h3>
                <p className="text-white/60 leading-relaxed">
                  Proteção de dados com criptografia de nível bancário e conformidade com regulamentações financeiras
                </p>
              </div>

              {/* Tecnologia */}
              <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Tecnologia Avançada</h3>
                <p className="text-white/60 leading-relaxed">
                  Plataforma moderna com inteligência artificial e análise de dados em tempo real
                </p>
              </div>

              {/* Suporte */}
              <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Suporte 24/7</h3>
                <p className="text-white/60 leading-relaxed">
                  Atendimento especializado disponível 24 horas por dia, 7 dias por semana
                </p>
              </div>

              {/* Assinatura Avançada */}
              <div
                className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 cursor-pointer"
                onClick={() => setShowAdvancedSignature(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAdvancedSignature(true) } }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20.25h6a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25h-6M9.75 17.25H6A2.25 2.25 0 013.75 15V6A2.25 2.25 0 016 3.75h6A2.25 2.25 0 0114.25 6v9a2.25 2.25 0 01-2.25 2.25H9.75zM8.25 12.75h3M8.25 9.75h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Assinatura Avançada</h3>
                <p className="text-white/60 leading-relaxed">
                  Assinatura eletrônica com múltiplos signatários, templates e trilha de auditoria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Image
                src="/logo-fontara-final.svg"
                alt="Fontara Financial"
                width={200}
                height={50}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Transformando o futuro das finanças com tecnologia inovadora e segurança incomparável
            </p>
            <div className="flex justify-center space-x-8 text-sm text-white/60">
              <a href="/" className="hover:text-white transition-colors hover:scale-105">Início</a>
              <a href="/clientes" className="hover:text-white transition-colors hover:scale-105">Clientes</a>
              <a href="/admin" className="hover:text-white transition-colors hover:scale-105">Administração</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal do Envelope PIX */}
      {showPixEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowPixEnvelope(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Iframe do Envelope */}
            <div className="h-full">
              {pixEnvelopeUrl && (
                <iframe
                  src={pixEnvelopeUrl}
                  className="w-full h-full border-0"
                  title="Envelope PIX - DocuSign"
                  allow="camera; microphone; fullscreen"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal do Maestro */}
      {showMaestro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowMaestro(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="h-full">
              {maestroUrl && (
                <iframe
                  src={maestroUrl}
                  className="w-full h-full border-0"
                  title="Workflow Maestro - DocuSign"
                  allow="camera; microphone; fullscreen"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Assinatura Avançada */}
      {showAdvancedSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowAdvancedSignature(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Assinatura Avançada</h2>
              {/* Opções de entrega */}
              <div className="mb-4 flex items-center space-x-6">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="delivery_method"
                    value="now"
                    checked={advancedDeliveryMethod === 'now'}
                    onChange={() => setAdvancedDeliveryMethod('now')}
                    className="h-4 w-4 text-emerald-600"
                  />
                  <span className="text-slate-700">Assinar agora</span>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="delivery_method"
                    value="whatsapp"
                    checked={advancedDeliveryMethod === 'whatsapp'}
                    onChange={() => setAdvancedDeliveryMethod('whatsapp')}
                    className="h-4 w-4 text-emerald-600"
                  />
                  <span className="text-slate-700">Receber por WhatsApp</span>
                </label>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget as HTMLFormElement
                  if (!form.checkValidity()) {
                    form.reportValidity()
                    return
                  }
                  try {
                    setAdvancedSubmitting(true)
                    const cleanCpf = advancedCpf.replace(/[^0-9]/g, '')
                    const cleanPhone = advancedPhone.replace(/[^0-9]/g, '')

                    if (!validateCpf(cleanCpf)) {
                      alert('CPF inválido. Verifique os 11 dígitos e tente novamente.')
                      return
                    }
                    if (advancedDeliveryMethod === 'whatsapp') {
                      // Telefone obrigatório apenas para WhatsApp
                      const phoneRegex = /^[1-9]\d{10,14}$/
                      if (!phoneRegex.test(cleanPhone)) {
                        alert('Telefone inválido. Use apenas dígitos com DDI (ex.: 5511999999999).')
                        return
                      }
                    }

                    // Usar documento de demonstração com âncora \\saes\\
                    const html = createDemoDocument(advancedName, advancedEmail, cleanCpf, advancedDeliveryMethod === 'whatsapp' ? advancedPhone : undefined)
                    const documentBase64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(html))) : ''

                    // Base do payload comum
                    const payload: any = {
                      emailSubject: 'Exemplo de Envio via API com Assinatura Avançada',
                      emailBlurb: 'Por favor assine o documento clicando no botão acima. Este email foi gerado através de uma chamada API.',
                      status: 'sent',
                      documents: [
                        { name: 'Contrato de Fornecimento', fileExtension: 'html', base64: documentBase64 }
                      ],
                      recipients: { signers: [] as any[] }
                    }

                    if (advancedDeliveryMethod === 'now') {
                      payload.recipients.signers.push({
                        email: advancedEmail,
                        name: advancedName,
                        recipientId: '1',
                        recipientSignatureProviders: [
                          {
                            signatureProviderName: 'tsp_confia_br_advanced_dev',
                            signatureProviderOptions: { oneTimePassword: cleanCpf }
                          }
                        ],
                        routingOrder: '1',
                        tabs: {
                          signHereTabs: [
                            { documentId: '1', pageNumber: '1', anchorString: "\\saes\\", anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '0', anchorIgnoreIfNotPresent: true, anchorMatchWholeWord: false, anchorCaseSensitive: false }
                          ]
                        }
                      })
                    } else {
                      // WhatsApp: separar DDI e número
                      const countryCode = cleanPhone.substring(0, 2)
                      const number = cleanPhone.substring(2)
                      payload.recipients.signers.push({
                        name: advancedName,
                        email: advancedEmail,
                        recipientId: '1',
                        routingOrder: '1',
                        deliveryMethod: 'whatsapp',
                        phoneNumber: { countryCode, number },
                        recipientSignatureProviders: [
                          {
                            signatureProviderName: 'tsp_confia_br_advanced_dev',
                            signatureProviderOptions: { oneTimePassword: cleanCpf }
                          }
                        ],
                        tabs: {
                          signHereTabs: [
                            { documentId: '1', pageNumber: '1', anchorString: "\\saes\\", anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '0', anchorIgnoreIfNotPresent: true, anchorMatchWholeWord: false, anchorCaseSensitive: false }
                          ]
                        }
                      })
                    }

                    const res = await fetch('/.netlify/functions/docusign-actions/envelopes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      const msg = typeof data?.message === 'object' ? JSON.stringify(data.message) : (data?.message || data?.error)
                      throw new Error(msg || 'Falha ao criar envelope')
                    }

                    const envelopeId = data.envelopeId || data?.data?.envelopeId
                    if (!envelopeId) throw new Error('EnvelopeId não retornado')

                    if (advancedDeliveryMethod === 'now') {
                      const embedRes = await fetch('/.netlify/functions/docusign-actions/envelopes/embed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ envelopeId, returnUrl: window.location.href })
                      })
                      const embedData = await embedRes.json()
                      if (!embedRes.ok || !embedData.url) throw new Error('Falha ao obter URL de assinatura')
                      alert(`Envelope criado com sucesso. ID: ${envelopeId}`)
                      window.open(embedData.url, '_blank', 'noopener,noreferrer')
                    } else {
                      alert(`Envelope criado com sucesso. ID: ${envelopeId}. Você receberá o link pelo WhatsApp informado.`)
                    }

                    setShowAdvancedSignature(false)
                    setAdvancedName('')
                    setAdvancedEmail('')
                    setAdvancedCpf('')
                    setAdvancedPhone('')
                  } catch (err: any) {
                    alert(`Erro: ${err?.message || 'desconhecido'}`)
                  } finally {
                    setAdvancedSubmitting(false)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={advancedName}
                    onChange={(e) => setAdvancedName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={advancedEmail}
                    onChange={(e) => setAdvancedEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="voce@exemplo.com"
                  />
                </div>
                {advancedDeliveryMethod === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      aria-label="Telefone com DDI (11 a 15 dígitos)"
                      value={advancedPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, '')
                        setAdvancedPhone(digits.slice(0, 15))
                      }}
                      required={advancedDeliveryMethod === 'whatsapp'}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="5511999999999"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="CPF com 11 dígitos"
                    value={advancedCpf}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '')
                      setAdvancedCpf(digits.slice(0, 11))
                    }}
                    maxLength={11}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="00000000000"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSignature(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={advancedSubmitting}
                    className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {advancedSubmitting ? 'Enviando...' : 'Continuar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

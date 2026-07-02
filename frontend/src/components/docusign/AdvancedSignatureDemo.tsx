'use client'

// Demo Assinatura Avançada — envelope com provedor de assinatura avançada (Confia),
// entrega imediata (embed), por WhatsApp ou SMS.

import { useState, ReactNode } from 'react'
import { createDemoDocument, validateCpf, htmlToBase64 } from './demoDocument'

type DeliveryMethod = 'now' | 'whatsapp' | 'sms'

export function useAdvancedSignatureDemo() {
    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [cpf, setCpf] = useState('')
    const [phone, setPhone] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('now')

    const openAdvancedSignature = () => setShowModal(true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        if (!form.checkValidity()) {
            form.reportValidity()
            return
        }
        try {
            setSubmitting(true)
            const cleanCpf = cpf.replace(/[^0-9]/g, '')
            const cleanPhone = phone.replace(/[^0-9]/g, '')
            let normalizedPhone = cleanPhone

            if (!validateCpf(cleanCpf)) {
                alert('CPF inválido. Verifique os 11 dígitos e tente novamente.')
                return
            }
            if (deliveryMethod !== 'now') {
                // Telefone obrigatório para WhatsApp ou SMS (Brasil, E.164 sem símbolos)
                if (!normalizedPhone.startsWith('55') && (normalizedPhone.length >= 10 && normalizedPhone.length <= 11)) {
                    normalizedPhone = `55${normalizedPhone}`
                }
                const brE164 = /^55\d{10,13}$/
                if (!brE164.test(normalizedPhone)) {
                    alert('Telefone inválido. Use DDI Brasil 55 + número (ex.: 5511999999999).')
                    return
                }
            }

            // Usar documento de demonstração com âncora \saes\
            const html = createDemoDocument(name, email, cleanCpf, deliveryMethod === 'whatsapp' ? phone : undefined)
            const documentBase64 = htmlToBase64(html)

            // Base do payload comum
            const payload: any = {
                emailSubject: 'Exemplo de Envio via API com Assinatura Avançada',
                emailBlurb: 'Documento de demonstração Fontara Financial.',
                status: 'sent',
                documents: [
                    { name: 'Contrato de Fornecimento', fileExtension: 'html', base64: documentBase64 }
                ],
                recipients: { signers: [] as any[] }
            }

            if (deliveryMethod === 'now') {
                payload.recipients.signers.push({
                    email,
                    name,
                    recipientId: '1',
                    clientUserId: 'ADV-1',
                    recipientSignatureProviders: [
                        {
                            signatureProviderName: 'tsp_confia_br_advanced_dev',
                            signatureProviderOptions: { oneTimePassword: cleanCpf }
                        }
                    ],
                    routingOrder: '1',
                    tabs: {
                        signHereTabs: [
                            { documentId: '1', pageNumber: '1', anchorString: "\\saes\\", anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '0', anchorIgnoreIfNotPresent: true, anchorMatchWholeWord: true, anchorCaseSensitive: true }
                        ]
                    }
                })
            } else {
                // WhatsApp ou SMS: separar DDI e número (suportado: BR -> 55)
                const countryCode = '55'
                const number = normalizedPhone.substring(countryCode.length)
                payload.recipients.signers.push({
                    name,
                    email,
                    recipientId: '1',
                    routingOrder: '1',
                    deliveryMethod: deliveryMethod === 'sms' ? 'sms' : 'whatsapp',
                    phoneNumber: { countryCode, number },
                    recipientSignatureProviders: [
                        {
                            signatureProviderName: 'tsp_confia_br_advanced_dev',
                            signatureProviderOptions: { oneTimePassword: cleanCpf }
                        }
                    ],
                    tabs: {
                        signHereTabs: [
                            { documentId: '1', pageNumber: '1', anchorString: "\\saes\\", anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '0', anchorIgnoreIfNotPresent: true, anchorMatchWholeWord: true, anchorCaseSensitive: true }
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

            if (deliveryMethod === 'now') {
                const embedRes = await fetch('/.netlify/functions/docusign-actions/envelopes/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        envelopeId,
                        returnUrl: window.location.href,
                        signer: {
                            clientUserId: 'ADV-1',
                            userName: name,
                            email
                        }
                    })
                })
                const embedData = await embedRes.json()
                if (!embedRes.ok || !embedData.url) throw new Error('Falha ao obter URL de assinatura')
                alert(`Envelope criado com sucesso. ID: ${envelopeId}`)
                window.open(embedData.url, '_blank', 'noopener,noreferrer')
            } else {
                const channel = deliveryMethod === 'sms' ? 'SMS' : 'WhatsApp'
                alert(`Envelope criado com sucesso. ID: ${envelopeId}. Você receberá o link por ${channel} no telefone informado.`)
            }

            setShowModal(false)
            setName('')
            setEmail('')
            setCpf('')
            setPhone('')
        } catch (err: any) {
            alert(`Erro: ${err?.message || 'desconhecido'}`)
        } finally {
            setSubmitting(false)
        }
    }

    const modal: ReactNode = showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <button
                    onClick={() => setShowModal(false)}
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
                    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <label className="inline-flex items-center space-x-2">
                            <input
                                type="radio"
                                name="delivery_method"
                                value="now"
                                checked={deliveryMethod === 'now'}
                                onChange={() => setDeliveryMethod('now')}
                                className="h-4 w-4"
                            />
                            <span className="text-slate-700">Assinar agora</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                            <input
                                type="radio"
                                name="delivery_method"
                                value="whatsapp"
                                checked={deliveryMethod === 'whatsapp'}
                                onChange={() => setDeliveryMethod('whatsapp')}
                                className="h-4 w-4"
                            />
                            <span className="text-slate-700">Receber por WhatsApp</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                            <input
                                type="radio"
                                name="delivery_method"
                                value="sms"
                                checked={deliveryMethod === 'sms'}
                                onChange={() => setDeliveryMethod('sms')}
                                className="h-4 w-4"
                            />
                            <span className="text-slate-700">Receber por SMS</span>
                        </label>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="voce@exemplo.com"
                            />
                        </div>
                        {(deliveryMethod === 'whatsapp' || deliveryMethod === 'sms') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    aria-label="Telefone com DDI Brasil em formato E.164 para WhatsApp ou SMS (ex.: 5511999999999)"
                                    value={phone}
                                    onChange={(e) => {
                                        // Normaliza entrada: somente dígitos, no máx. 15
                                        let digits = e.target.value.replace(/[^0-9]/g, '')
                                        // Se usuário digitou 10-11 dígitos sem DDI, prefixamos 55 para BR
                                        if (!digits.startsWith('55') && (digits.length >= 10 && digits.length <= 11)) {
                                            digits = `55${digits}`
                                        }
                                        setPhone(digits.slice(0, 15))
                                    }}
                                    required={deliveryMethod === 'whatsapp' || deliveryMethod === 'sms'}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
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
                                value={cpf}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '')
                                    setCpf(digits.slice(0, 11))
                                }}
                                maxLength={11}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="00000000000"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg text-white brand-gradient hover:opacity-90 shadow disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Enviando...' : 'Continuar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    ) : null

    return { openAdvancedSignature, modal }
}

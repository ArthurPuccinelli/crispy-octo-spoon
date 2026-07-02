'use client'

// Demo PIX — cria envelope DocuSign via API e abre assinatura embutida (iframe)

import { useState, ReactNode } from 'react'
import { createDemoDocument, htmlToBase64 } from './demoDocument'

export function usePixSigningDemo() {
    const [creating, setCreating] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [envelopeUrl, setEnvelopeUrl] = useState('')

    const startPixDemo = async () => {
        if (creating) return
        setCreating(true)
        try {
            // Usar documento de demonstração com âncora \saes\
            const html = createDemoDocument('Teste PIX', 'teste@fontara.com', '00000000000')
            const base64 = htmlToBase64(html)

            const res = await fetch('/.netlify/functions/docusign-actions/envelopes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailSubject: 'Envelope de Teste - PIX',
                    emailBlurb: 'Teste de criação de envelope via botão PIX',
                    status: 'sent',
                    documents: [
                        { name: 'pix-teste.html', fileExtension: 'html', base64 }
                    ],
                    recipients: {
                        signers: [
                            {
                                email: 'signer@example.com',
                                name: 'Signer Teste',
                                routingOrder: 1,
                                clientUserId: '1000',
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
                                            anchorMatchWholeWord: true,
                                            anchorCaseSensitive: true
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
                        returnUrl: window.location.href,
                        signer: {
                            clientUserId: '1000',
                            userName: 'Signer Teste',
                            email: 'signer@example.com'
                        }
                    })
                })

                const embedData = await embedRes.json()
                if (embedRes.ok && embedData.url) {
                    setEnvelopeUrl(embedData.url)
                    setShowModal(true)
                } else {
                    alert(`Envelope criado (ID: ${envelopeId}), mas falha ao obter URL de embed`)
                }
            }
        } catch (e: any) {
            alert(`Erro ao criar envelope: ${e?.message || 'desconhecido'}`)
        } finally {
            setCreating(false)
        }
    }

    const modal: ReactNode = showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full transition-colors"
                    aria-label="Fechar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="h-full">
                    {envelopeUrl && (
                        <iframe
                            src={envelopeUrl}
                            className="w-full h-full border-0"
                            title="Termo de adesão ao Pix"
                            allow="camera; microphone; fullscreen"
                        />
                    )}
                </div>
            </div>
        </div>
    ) : null

    return { startPixDemo, creating, modal }
}

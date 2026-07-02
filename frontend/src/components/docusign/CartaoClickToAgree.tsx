'use client'

// Demo Cartão de Crédito — Click to Agree via DocuSign JS (Focused View).
// Fluxo: formulário → assinatura embutida → sucesso.

import { useState, useEffect, ReactNode } from 'react'

type CartaoStep = 'form' | 'signing' | 'success'

export function useCartaoClickToAgree() {
    const [showModal, setShowModal] = useState(false)
    const [step, setStep] = useState<CartaoStep>('form')
    const [url, setUrl] = useState('')
    const [integrationKey, setIntegrationKey] = useState('')
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [cpf, setCpf] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Retorno do redirect pós-assinatura (?cartao=signed)
    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cartao') === 'signed') {
            setStep('success')
            setShowModal(true)
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    const openCartaoModal = () => {
        setStep('form')
        setUrl('')
        setIntegrationKey('')
        setNome('')
        setEmail('')
        setCpf('')
        setError('')
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nome.trim() || !email.trim()) return
        setSubmitting(true)
        setError('')
        try {
            const res = await fetch('/.netlify/functions/docusign-actions/cartao-adesao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, cpf, returnUrl: window.location.origin + window.location.pathname + '?cartao=signed' }),
            })
            const data = await res.json()
            if (!res.ok || !data.url) {
                const msg = typeof data?.message === 'object' ? JSON.stringify(data.message) : (data?.message || data?.error || 'Erro desconhecido')
                setError(msg)
            } else {
                setUrl(data.url)
                setIntegrationKey(data.integrationKey || '')
                setStep('signing')
            }
        } catch (e: any) {
            setError(e?.message || 'Erro ao conectar com o servidor')
        } finally {
            setSubmitting(false)
        }
    }

    // Monta o DocuSign JS (focused view / click-to-agree) quando entra na etapa de assinatura
    useEffect(() => {
        if (step !== 'signing' || !url || !integrationKey) return

        let signing: any = null
        let script: HTMLScriptElement | null = null

        const brandPrimary = typeof document !== 'undefined'
            ? (getComputedStyle(document.documentElement).getPropertyValue('--brand-primary-hex').trim() || '#4f46e5')
            : '#4f46e5'

        const mountDocuSign = async () => {
            try {
                const docusign = await (window as any).DocuSign.loadDocuSign(integrationKey)
                signing = docusign.signing({
                    url,
                    displayFormat: 'focused',
                    style: {
                        branding: { primaryButton: { backgroundColor: brandPrimary, color: '#fff' } },
                        signingNavigationButton: { finishText: 'Concluir', belowFinish: false },
                    },
                })
                signing.on('ready', () => { /* widget pronto */ })
                signing.on('sessionEnd', (eventData: any) => {
                    // O DocuSign JS retorna sessionEndType diretamente ou dentro de .type
                    const endType: string = eventData?.sessionEndType || eventData?.type || ''
                    if (endType === 'signing_complete') {
                        setStep('success')
                    } else if (['cancel', 'decline', 'exception', 'session_timeout', 'ttl_expired', 'viewing_complete'].includes(endType)) {
                        setStep('form')
                    }
                })
                signing.mount('#docusign-click-container')
            } catch (err) {
                console.error('DocuSign JS mount error:', err)
            }
        }

        if ((window as any).DocuSign) {
            mountDocuSign()
        } else {
            script = document.createElement('script')
            // js-d.docusign.com = ambiente demo; produção usa js.docusign.com
            script.src = 'https://js-d.docusign.com/bundle.js'
            script.onload = mountDocuSign
            document.head.appendChild(script)
        }

        return () => {
            try { signing?.unmount?.() } catch (_) { }
            if (script && document.head.contains(script)) document.head.removeChild(script)
        }
    }, [step, url, integrationKey])

    const modal: ReactNode = showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in ${step === 'signing' ? 'w-full max-w-5xl h-[90vh] flex flex-col' : 'w-full max-w-md'}`}>
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 z-10 p-2 bg-black/10 hover:bg-black/20 text-black rounded-full transition-colors"
                    aria-label="Fechar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Step 1 – Formulário */}
                {step === 'form' && (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Solicitar Cartão de Crédito</h2>
                                <p className="text-sm text-slate-500">Sem anuidade · 1% cashback · Aprovação em minutos</p>
                            </div>
                        </div>

                        <div className="brand-gradient-soft border border-brand/20 rounded-xl p-4 mb-6 text-sm text-slate-700">
                            Preencha seus dados para assinar o <strong>Termo de Adesão</strong> e ativar seu cartão.
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={e => setNome(e.target.value)}
                                    required
                                    placeholder="Seu nome completo"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={e => setCpf(e.target.value)}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !nome.trim() || !email.trim()}
                                className="w-full py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Preparando documento...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Assinar Termo de Adesão
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-xs text-slate-400 text-center mt-4">
                            Assinatura eletrônica com validade jurídica
                        </p>
                    </div>
                )}

                {/* Step 2 – DocuSign JS Focused View (Click to Agree) */}
                {step === 'signing' && (
                    <>
                        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Termo de Adesão – Cartão de Crédito Fontara</p>
                                <p className="text-xs text-slate-400">Leia o documento e conclua a adesão</p>
                            </div>
                        </div>
                        {/* DocuSign JS monta o widget aqui — flex-1 + min-h-0 garante preenchimento total */}
                        <div id="docusign-click-container" className="flex-1 min-h-0 w-full" />
                    </>
                )}

                {/* Step 3 – Sucesso */}
                {step === 'success' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Termo Assinado!</h2>
                        <p className="text-slate-500 mb-6">
                            Sua adesão ao <strong>Cartão de Crédito Fontara</strong> foi registrada com sucesso.
                            Em breve você receberá as instruções de ativação por e-mail.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700 text-left space-y-1">
                            <p>✓ Documento assinado eletronicamente com validade jurídica</p>
                            <p>✓ Registro de auditoria gerado</p>
                            <p>✓ Cópia enviada para seu e-mail</p>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-8 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200"
                        >
                            Concluir
                        </button>
                    </div>
                )}
            </div>
        </div>
    ) : null

    return { openCartaoModal, modal }
}

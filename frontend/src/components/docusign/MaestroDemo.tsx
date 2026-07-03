'use client'

// Fluxos Maestro — dispara um workflow e abre a jornada embutida em um modal amplo.
// Trata o fluxo de consentimento OAuth quando necessário.
// O workflow é resolvido no backend: chave conhecida ('emprestimos', 'cartao') → env var
// do Netlify, ou UUID direto.

import { useState, ReactNode } from 'react'

export type MaestroFlowOptions = {
    /** Chave do workflow ('emprestimos' | 'cartao') ou UUID. Padrão: workflow default do backend. */
    workflow?: string
    /** Título mostrado no cabeçalho do modal. */
    title?: string
    /** Subtítulo do cabeçalho do modal. */
    subtitle?: string
    /** Nome da jornada usado nas mensagens de erro. */
    errorLabel?: string
}

export function useMaestroFlow(options: MaestroFlowOptions = {}) {
    const [starting, setStarting] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [maestroUrl, setMaestroUrl] = useState('')

    const triggerBody = JSON.stringify({ workflow: options.workflow, inputs: {} })

    const start = async () => {
        if (starting) return
        setStarting(true)
        try {
            const res = await fetch('/.netlify/functions/maestro/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: triggerBody
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
                    localStorage.removeItem('docusign_consent_given')
                    localStorage.removeItem('docusign_consent_time')

                    const retryRes = await fetch('/.netlify/functions/maestro/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: triggerBody
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

                const consentRes = await fetch('/.netlify/functions/maestro/consent', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
                const consentData = await consentRes.json()
                if (consentRes.ok && consentData.consentUrl) {
                    window.location.href = consentData.consentUrl
                    return
                } else {
                    throw new Error('Falha ao obter URL de consentimento')
                }
            }

            if (!res.ok) {
                const diag = data?.diagnostics ? `\nDiagnostics: ${JSON.stringify(data.diagnostics)}` : ''
                throw new Error(((typeof data?.message === 'object' ? JSON.stringify(data.message) : (data?.message || 'Falha ao iniciar a contratação'))) + diag)
            }

            const instanceId = data.instanceId || data?.data?.instanceId || data?.data?.id
            const workflowInstanceUrl = data.workflowInstanceUrl || data?.data?.workflowInstanceUrl || data?.instanceUrl || data?.data?.instanceUrl
            if (!instanceId || !workflowInstanceUrl) {
                const diag = data?.diagnostics ? `\nDiagnostics: ${JSON.stringify(data.diagnostics)}` : ''
                throw new Error('Dados da contratação não retornados' + diag)
            }

            // Abrir a jornada embutida no modal
            setMaestroUrl(workflowInstanceUrl)
            setShowModal(true)
        } catch (e: any) {
            alert(`Erro ao iniciar ${options.errorLabel || 'a contratação'}: ${e?.message || 'desconhecido'}`)
        } finally {
            setStarting(false)
        }
    }

    const modal: ReactNode = showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6">
            <div className="relative flex flex-col w-full h-full max-w-7xl max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Cabeçalho */}
                <div className="relative flex items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-surface flex-shrink-0">
                    <div className="absolute inset-0 brand-mesh opacity-60 pointer-events-none" />
                    <div className="relative z-10 min-w-0">
                        <p className="text-white font-bold text-base sm:text-lg truncate">
                            {options.title || 'Contratação digital'}
                        </p>
                        <p className="text-white/50 text-xs sm:text-sm truncate">
                            {options.subtitle || 'Jornada 100% digital, com assinatura eletrônica ao final'}
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                            Ambiente seguro
                        </span>
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            aria-label="Fechar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Jornada embutida */}
                <div className="flex-1 min-h-0 bg-slate-50">
                    {maestroUrl && (
                        <iframe
                            src={maestroUrl}
                            className="w-full h-full border-0"
                            title={options.title || 'Contratação digital'}
                            allow="camera; microphone; fullscreen"
                        />
                    )}
                </div>
            </div>
        </div>
    ) : null

    return { start, starting, modal }
}

// Jornada de Empréstimos (workflow padrão) — mantém a API usada nas páginas existentes.
export function useMaestroDemo() {
    const flow = useMaestroFlow({
        workflow: 'emprestimos',
        title: 'Contratação de Empréstimo',
        subtitle: 'Simule, envie seus dados e assine — tudo aqui, sem sair da sua conta',
        errorLabel: 'a contratação do empréstimo',
    })
    return { startLoanFlow: flow.start, starting: flow.starting, modal: flow.modal }
}

// Jornada de contratação/upgrade de cartão — usa o workflow definido na env var
// DOCUSIGN_MAESTRO_CARTAO_WORKFLOW_ID do Netlify.
export function useCartaoMaestroFlow() {
    const flow = useMaestroFlow({
        workflow: 'cartao',
        title: 'Contratação do novo cartão',
        subtitle: 'Análise, proposta e assinatura em uma única jornada digital',
        errorLabel: 'a contratação do cartão',
    })
    return { startCartaoFlow: flow.start, starting: flow.starting, modal: flow.modal }
}

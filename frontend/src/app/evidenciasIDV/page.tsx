'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AuditEvent {
    eventFields?: Array<{
        name?: string
        value?: string
    }>
    eventType?: string
    eventDescription?: string
    eventDate?: string
    eventStatus?: string
    user?: {
        userId?: string
        userName?: string
        email?: string
    }
}

interface AuditEventsResponse {
    auditEvents?: AuditEvent[]
}

interface IDEvidenceEvent {
    id?: string
    eventId?: string
    type?: string
    status?: string
    timestamp?: string
    recipientIdGuid?: string
    recipientName?: string
    recipientEmail?: string
    [key: string]: any
}

interface IDEvidenceMedia {
    eventId?: string
    recipientIdGuid?: string
    recipientName?: string
    recipientEmail?: string
    base64?: string
    contentType?: string
    size?: number
}

interface IDEvidenceResponse {
    events?: IDEvidenceEvent[]
    media?: IDEvidenceMedia[]
}

export default function EvidenciasIDVPage() {
    const [envelopeId, setEnvelopeId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [auditEvents, setAuditEvents] = useState<AuditEvent[] | null>(null)
    const [idEvidenceData, setIdEvidenceData] = useState<IDEvidenceResponse | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!envelopeId.trim()) {
            setError('Por favor, insira um envelope ID')
            return
        }

        setLoading(true)
        setError(null)
        setAuditEvents(null)
        setIdEvidenceData(null)

        try {
            // Buscar audit events e ID Evidence events em paralelo
            const [auditResponse, idEvidenceResponse] = await Promise.allSettled([
                fetch(`/.netlify/functions/docusign-actions/envelopes/${envelopeId.trim()}/audit_events`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`/.netlify/functions/docusign-actions/envelopes/${envelopeId.trim()}/idevidence`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            ])

            // Processar audit events
            if (auditResponse.status === 'fulfilled' && auditResponse.value.ok) {
                const auditData: AuditEventsResponse = await auditResponse.value.json()
                setAuditEvents(auditData.auditEvents || [])
            } else if (auditResponse.status === 'rejected') {
                console.error('Erro ao buscar audit events:', auditResponse.reason)
            } else if (auditResponse.status === 'fulfilled' && !auditResponse.value.ok) {
                console.error('Erro ao buscar audit events:', auditResponse.value.status)
            }

            // Processar ID Evidence events
            if (idEvidenceResponse.status === 'fulfilled' && idEvidenceResponse.value.ok) {
                const idEvidenceData: IDEvidenceResponse = await idEvidenceResponse.value.json()
                setIdEvidenceData(idEvidenceData)
            } else if (idEvidenceResponse.status === 'rejected') {
                console.error('Erro ao buscar ID Evidence:', idEvidenceResponse.reason)
            } else if (idEvidenceResponse.status === 'fulfilled' && !idEvidenceResponse.value.ok) {
                // Se não houver ID Evidence habilitado, não é um erro crítico
                const errorData = await idEvidenceResponse.value.json().catch(() => ({}))
                if (!errorData.message?.includes('404')) {
                    console.error('Erro ao buscar ID Evidence:', errorData)
                }
            }

            // Verificar se pelo menos uma das requisições foi bem-sucedida
            const hasAuditEvents = auditResponse.status === 'fulfilled' && auditResponse.value.ok
            const hasIDEvidence = idEvidenceResponse.status === 'fulfilled' && idEvidenceResponse.value.ok

            if (!hasAuditEvents && !hasIDEvidence) {
                throw new Error('Não foi possível buscar evidências do envelope')
            }
        } catch (err) {
            console.error('Erro ao buscar evidências:', err)
            setError(err instanceof Error ? err.message : 'Erro ao buscar evidências do envelope')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        } catch {
            return dateString
        }
    }

    const getEventTypeLabel = (eventType?: string) => {
        if (!eventType) return 'Evento Desconhecido'

        const typeMap: Record<string, string> = {
            'DocumentUpload': 'Upload de Documento',
            'SignComplete': 'Assinatura Completa',
            'RecipientSent': 'Enviado para Destinatário',
            'RecipientDelivered': 'Entregue ao Destinatário',
            'RecipientView': 'Visualizado pelo Destinatário',
            'RecipientDecline': 'Recusado pelo Destinatário',
            'RecipientSentAuthenticationFailed': 'Falha na Autenticação',
            'EnvelopeSent': 'Envelope Enviado',
            'EnvelopeComplete': 'Envelope Completo',
            'EnvelopeVoided': 'Envelope Cancelado',
            'PrintAndSign': 'Imprimir e Assinar',
            'OfflineSigning': 'Assinatura Offline',
        }

        return typeMap[eventType] || eventType
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <a href="/">
                                <Image
                                    src="/logo-fontara-final.svg"
                                    alt="Fontara Financial"
                                    width={200}
                                    height={50}
                                    className="h-10 w-auto"
                                />
                            </a>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6">
                            <a href="/" className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105 text-sm">
                                Início
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Evidências IDV
                        </h1>
                        <p className="text-white/70 text-lg">
                            Consulte as evidências de um envelope DocuSign através do seu ID
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="glass-dark rounded-2xl p-8 mb-8 backdrop-blur-lg border border-white/10 shadow-2xl">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label htmlFor="envelopeId" className="block text-sm font-medium text-white/90 mb-2">
                                    Envelope ID
                                </label>
                                <input
                                    id="envelopeId"
                                    type="text"
                                    value={envelopeId}
                                    onChange={(e) => setEnvelopeId(e.target.value)}
                                    placeholder="Digite o ID do envelope"
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !envelopeId.trim()}
                                className="w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Buscando...
                                    </span>
                                ) : (
                                    'Buscar Evidências'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    {(auditEvents !== null || idEvidenceData !== null) && (
                        <div className="space-y-8">
                            {/* Audit Events Section */}
                            {auditEvents !== null && (
                                <div className="glass-dark rounded-2xl p-8 backdrop-blur-lg border border-white/10 shadow-2xl">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Eventos de Auditoria do Envelope
                                        </h2>
                                        <p className="text-white/70">
                                            {auditEvents.length} {auditEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {auditEvents.map((event, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-1">
                                                            {getEventTypeLabel(event.eventType)}
                                                        </h3>
                                                        {event.eventDescription && (
                                                            <p className="text-white/70 text-sm">
                                                                {event.eventDescription}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {event.eventStatus && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.eventStatus === 'success' || event.eventStatus === 'completed'
                                                            ? 'bg-green-500/20 text-green-300'
                                                            : event.eventStatus === 'failed'
                                                                ? 'bg-red-500/20 text-red-300'
                                                                : 'bg-yellow-500/20 text-yellow-300'
                                                            }`}>
                                                            {event.eventStatus}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-white/50 text-xs mb-1">Data/Hora</p>
                                                        <p className="text-white font-medium">
                                                            {formatDate(event.eventDate)}
                                                        </p>
                                                    </div>
                                                    {event.user && (
                                                        <div>
                                                            <p className="text-white/50 text-xs mb-1">Usuário</p>
                                                            <p className="text-white font-medium">
                                                                {event.user.userName || event.user.email || event.user.userId || 'N/A'}
                                                            </p>
                                                            {event.user.email && event.user.userName && event.user.email !== event.user.userName && (
                                                                <p className="text-white/60 text-sm mt-1">
                                                                    {event.user.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {event.eventFields && event.eventFields.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-white/10">
                                                        <p className="text-white/50 text-xs mb-2">Detalhes Adicionais</p>
                                                        <div className="space-y-2">
                                                            {event.eventFields.map((field, fieldIndex) => (
                                                                field.name && field.value && (
                                                                    <div key={fieldIndex} className="flex justify-between items-start">
                                                                        <span className="text-white/70 text-sm font-medium">
                                                                            {field.name}:
                                                                        </span>
                                                                        <span className="text-white text-sm text-right ml-4 flex-1">
                                                                            {field.value}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {auditEvents.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-white/70">
                                                Nenhum evento de auditoria encontrado para este envelope.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ID Evidence Events Section */}
                            {idEvidenceData !== null && (
                                <div className="glass-dark rounded-2xl p-8 backdrop-blur-lg border border-white/10 shadow-2xl">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Eventos de ID Verification
                                        </h2>
                                        <p className="text-white/70">
                                            {idEvidenceData.events?.length || 0} {idEvidenceData.events?.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                                            {idEvidenceData.media && idEvidenceData.media.length > 0 && (
                                                <> • {idEvidenceData.media.length} {idEvidenceData.media.length === 1 ? 'imagem encontrada' : 'imagens encontradas'}</>
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {idEvidenceData.events && idEvidenceData.events.length > 0 ? (
                                            idEvidenceData.events.map((event, index) => {
                                                // Encontrar mídia associada a este evento
                                                const eventMedia = idEvidenceData.media?.filter(
                                                    m => m.eventId === (event.id || event.eventId)
                                                ) || []

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                                    {event.type || 'Evento de ID Verification'}
                                                                </h3>
                                                                {event.status && (
                                                                    <p className="text-white/60 text-sm mt-1">
                                                                        Status: {event.status}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {event.status && (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'success' || event.status === 'completed' || event.status === 'passed'
                                                                        ? 'bg-green-500/20 text-green-300'
                                                                        : event.status === 'failed' || event.status === 'rejected'
                                                                            ? 'bg-red-500/20 text-red-300'
                                                                            : 'bg-yellow-500/20 text-yellow-300'
                                                                    }`}>
                                                                    {event.status}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <p className="text-white/50 text-xs mb-1">Data/Hora</p>
                                                                <p className="text-white font-medium">
                                                                    {formatDate(event.timestamp)}
                                                                </p>
                                                            </div>
                                                            {(event.recipientName || event.recipientEmail) && (
                                                                <div>
                                                                    <p className="text-white/50 text-xs mb-1">Destinatário</p>
                                                                    <p className="text-white font-medium">
                                                                        {event.recipientName || event.recipientEmail || 'N/A'}
                                                                    </p>
                                                                    {event.recipientEmail && event.recipientName && (
                                                                        <p className="text-white/60 text-sm mt-1">
                                                                            {event.recipientEmail}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Exibir campos adicionais do evento */}
                                                        {Object.keys(event).filter(key =>
                                                            !['id', 'eventId', 'type', 'status', 'timestamp', 'recipientIdGuid', 'recipientName', 'recipientEmail'].includes(key)
                                                        ).length > 0 && (
                                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                                    <p className="text-white/50 text-xs mb-2">Detalhes Adicionais</p>
                                                                    <div className="space-y-2">
                                                                        {Object.entries(event)
                                                                            .filter(([key]) => !['id', 'eventId', 'type', 'status', 'timestamp', 'recipientIdGuid', 'recipientName', 'recipientEmail'].includes(key))
                                                                            .map(([key, value]) => (
                                                                                <div key={key} className="flex justify-between items-start">
                                                                                    <span className="text-white/70 text-sm font-medium">
                                                                                        {key}:
                                                                                    </span>
                                                                                    <span className="text-white text-sm text-right ml-4 flex-1">
                                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* Exibir imagens associadas */}
                                                        {eventMedia.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                                <p className="text-white/50 text-xs mb-3">Evidências Visuais</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {eventMedia.map((media, mediaIndex) => (
                                                                        <div key={mediaIndex} className="relative">
                                                                            {media.base64 && (
                                                                                <img
                                                                                    src={`data:${media.contentType || 'image/jpeg'};base64,${media.base64}`}
                                                                                    alt={`Evidência ${mediaIndex + 1}`}
                                                                                    className="w-full rounded-lg border border-white/20 max-h-64 object-contain bg-white/5"
                                                                                />
                                                                            )}
                                                                            {media.size && (
                                                                                <p className="text-white/50 text-xs mt-2">
                                                                                    Tamanho: {(media.size / 1024).toFixed(2)} KB
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-white/70">
                                                    Nenhum evento de ID Verification encontrado para este envelope.
                                                </p>
                                                <p className="text-white/50 text-sm mt-2">
                                                    ID Evidence pode não estar habilitado para este envelope.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

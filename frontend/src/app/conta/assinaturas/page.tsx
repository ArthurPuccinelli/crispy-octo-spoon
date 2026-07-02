'use client'

// Central de assinaturas — documentos do cliente + demo de Assinatura Avançada.

import { useAdvancedSignatureDemo } from '@/components/docusign/AdvancedSignatureDemo'

const DOCUMENTOS = [
    { id: 1, nome: 'Termo de Adesão — Conta Digital', data: '12 mai 2026', status: 'Assinado' },
    { id: 2, nome: 'Contrato de Cartão de Crédito', data: '03 jun 2026', status: 'Assinado' },
    { id: 3, nome: 'Termo de Adesão — Pix', data: '03 jun 2026', status: 'Assinado' },
    { id: 4, nome: 'Contrato de Empréstimo Pessoal', data: 'Hoje', status: 'Aguardando' },
]

export default function AssinaturasPage() {
    const advanced = useAdvancedSignatureDemo()

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Assinaturas digitais</h1>
                <p className="text-slate-500 text-sm">Seus contratos e termos, assinados eletronicamente com validade jurídica.</p>
            </div>

            {/* Banner Assinatura Avançada */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 animate-fade-in-up">
                <div className="absolute inset-0 brand-mesh opacity-70" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                    <div>
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">Assinatura Avançada</p>
                        <h2 className="text-xl font-bold text-white mb-2">Assinatura com validação reforçada</h2>
                        <p className="text-white/60 text-sm max-w-md">
                            Assinatura eletrônica avançada com código de segurança vinculado ao seu CPF,
                            com opção de entrega por WhatsApp ou SMS.
                        </p>
                    </div>
                    <button
                        onClick={advanced.openAdvancedSignature}
                        className="flex-shrink-0 px-8 py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.03] transition-all duration-300"
                    >
                        Assinar documento
                    </button>
                </div>
            </div>

            {/* Lista de documentos */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Meus documentos</h2>
                </div>
                <ul className="divide-y divide-slate-100">
                    {DOCUMENTOS.map(d => (
                        <li key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl brand-gradient-soft border border-brand/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-800 text-sm font-medium truncate">{d.nome}</p>
                                    <p className="text-slate-400 text-xs">{d.data}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${d.status === 'Assinado'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                                }`}>
                                {d.status}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {advanced.modal}
        </div>
    )
}

'use client'

// Área Pix — chaves, limites e ativação com assinatura embutida (demo DocuSign).

import { usePixSigningDemo } from '@/components/docusign/PixSigningDemo'

const CHAVES = [
    { tipo: 'CPF', valor: '•••.456.789-••', icone: '🪪' },
    { tipo: 'Celular', valor: '+55 (11) 9••••-4321', icone: '📱' },
    { tipo: 'E-mail', valor: 'c•••••@fontara.com', icone: '✉️' },
]

export default function PixPage() {
    const pix = usePixSigningDemo()

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Área Pix</h1>
                <p className="text-slate-500 text-sm">Transferências instantâneas, 24 horas, todos os dias.</p>
            </div>

            {/* Banner de ativação do Pix */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 animate-fade-in-up">
                <div className="absolute inset-0 brand-mesh opacity-70" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                    <div>
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">Ativação em segundos</p>
                        <h2 className="text-xl font-bold text-white mb-2">Ative o Pix da sua conta</h2>
                        <p className="text-white/60 text-sm max-w-md">
                            Assine o termo de adesão ao Pix sem sair do site — leva menos de
                            um minuto e vale na hora.
                        </p>
                    </div>
                    <button
                        onClick={pix.startPixDemo}
                        disabled={pix.creating}
                        className="flex-shrink-0 px-8 py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.03] transition-all duration-300 disabled:opacity-60"
                    >
                        {pix.creating ? 'Preparando termo...' : 'Assinar termo de adesão'}
                    </button>
                </div>
            </div>

            {/* Minhas chaves */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Minhas chaves</h2>
                </div>
                <ul className="divide-y divide-slate-100">
                    {CHAVES.map(c => (
                        <li key={c.tipo} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{c.icone}</span>
                                <div>
                                    <p className="text-slate-800 text-sm font-medium">{c.tipo}</p>
                                    <p className="text-slate-400 text-xs">{c.valor}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">Ativa</span>
                        </li>
                    ))}
                </ul>
                <div className="px-6 py-4 bg-slate-50">
                    <button className="text-brand font-semibold text-sm hover:opacity-80">+ Cadastrar nova chave</button>
                </div>
            </div>

            {/* Limites */}
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-slate-400 text-xs mb-1">Limite diurno</p>
                    <p className="text-slate-900 text-xl font-bold">R$ 20.000,00</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full w-1/3 brand-gradient rounded-full" />
                    </div>
                    <p className="text-slate-400 text-xs mt-2">R$ 6.430,00 usados hoje</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-slate-400 text-xs mb-1">Limite noturno</p>
                    <p className="text-slate-900 text-xl font-bold">R$ 1.000,00</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full w-0 brand-gradient rounded-full" />
                    </div>
                    <p className="text-slate-400 text-xs mt-2">Nenhum uso esta noite</p>
                </div>
            </div>

            {pix.modal}
        </div>
    )
}

'use client'

// Cartões — cartão virtual + contratação de novo cartão via jornada guiada (Maestro).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BankSession, getBankSession, firstName } from '@/lib/bankSession'
import { useCartaoMaestroFlow } from '@/components/docusign/MaestroDemo'

export default function CartoesPage() {
    const [session, setSession] = useState<BankSession | null>(null)
    const cartao = useCartaoMaestroFlow()

    useEffect(() => {
        setSession(getBankSession())
    }, [])

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Meus cartões</h1>
                <p className="text-slate-500 text-sm">Gerencie seus cartões físicos e virtuais.</p>
            </div>

            {/* Propaganda — nova categoria liberada */}
            <div className="relative overflow-hidden rounded-3xl bg-surface animate-fade-in-up">
                <div className="absolute inset-0 brand-mesh opacity-80" />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full brand-gradient opacity-20 blur-3xl" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-8">
                    <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-accent text-[11px] font-bold uppercase tracking-widest mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                            Nova categoria liberada para você
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                            {firstName(session)}, seu upgrade para o
                            <span className="gradient-text"> Fontara Platinum</span> foi aprovado
                        </h2>
                        <p className="text-white/60 text-sm">
                            Limite pré-aprovado de <strong className="text-white">R$ 15.000</strong>, sem anuidade e com
                            2% de cashback. Oferta válida até o fim do mês.
                        </p>
                        {session && !session.cpf && (
                            <p className="mt-3 text-xs text-white/50">
                                💡 <Link href="/conta/dados" className="text-brand-accent font-semibold hover:underline">Complete seus dados</Link> para
                                uma contratação instantânea, já preenchida com suas informações.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={cartao.startCartaoFlow}
                        disabled={cartao.starting}
                        className="flex-shrink-0 px-7 py-3.5 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.03] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {cartao.starting ? 'Preparando...' : 'Contratar agora'}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Cartão atual */}
                <div className="space-y-4 animate-fade-in-up">
                    <div className="bank-card rounded-3xl p-6 flex flex-col justify-between min-h-[210px]">
                        <div className="flex justify-between items-start">
                            <span className="text-white/90 font-bold tracking-widest text-sm">FONTARA</span>
                            <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold uppercase">Virtual</span>
                        </div>
                        <div>
                            <div className="bank-card-chip w-11 h-8 rounded-md mb-3" />
                            <p className="text-white/90 font-mono tracking-[0.2em] text-lg">•••• 4829</p>
                            <div className="flex justify-between items-end mt-2">
                                <p className="text-white/70 text-xs uppercase truncate max-w-[70%]">{session?.name || 'Cliente Demo'}</p>
                                <p className="text-white/70 text-xs">12/29</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {['Bloquear', 'Ver dados', 'Ajustar limite'].map(a => (
                            <button key={a} className="py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:border-brand/50 hover:text-brand transition-all">
                                {a}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm">Fatura atual</p>
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">Aberta</span>
                        </div>
                        <p className="text-slate-900 text-2xl font-bold mb-3">R$ 1.842,73</p>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full w-[37%] brand-gradient rounded-full" />
                        </div>
                        <p className="text-slate-400 text-xs mt-2">Limite disponível: R$ 3.157,27 de R$ 5.000,00</p>
                    </div>
                </div>

                {/* Novo cartão — jornada guiada de contratação */}
                <div className="relative overflow-hidden rounded-3xl bg-surface p-8 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="absolute inset-0 brand-mesh opacity-70" />
                    <div className="relative z-10">
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-3">Upgrade de categoria</p>
                        <h2 className="text-2xl font-bold text-white mb-3">Cartão Fontara Platinum</h2>
                        <ul className="space-y-2 text-white/60 text-sm mb-8">
                            <li className="flex items-center gap-2">
                                <span className="text-brand-accent">✓</span> Sem anuidade para sempre
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand-accent">✓</span> 2% de cashback em tudo
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand-accent">✓</span> Programa de pontos que não expiram
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-brand-accent">✓</span> Contratação 100% digital, com assinatura eletrônica
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={cartao.startCartaoFlow}
                        disabled={cartao.starting}
                        className="relative z-10 w-full py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {cartao.starting ? 'Preparando sua proposta...' : 'Solicitar novo cartão'}
                    </button>
                </div>
            </div>

            {cartao.modal}
        </div>
    )
}

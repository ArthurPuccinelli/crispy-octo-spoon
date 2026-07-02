'use client'

// Empréstimos — simulador + contratação via DocuSign Maestro (demo).

import { useState } from 'react'
import { useMaestroDemo } from '@/components/docusign/MaestroDemo'

const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function EmprestimosPage() {
    const [valor, setValor] = useState(15000)
    const [parcelas, setParcelas] = useState(24)
    const maestro = useMaestroDemo()

    // Simulação com juros de 1,79% a.m. (Price)
    const taxa = 0.0179
    const parcela = (valor * taxa) / (1 - Math.pow(1 + taxa, -parcelas))

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Empréstimos</h1>
                <p className="text-slate-500 text-sm">Crédito pessoal com contratação 100% digital.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Simulador */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Simule seu empréstimo</h2>

                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-slate-500">Valor</label>
                            <span className="text-slate-900 font-bold">{fmtBRL(valor)}</span>
                        </div>
                        <input
                            type="range"
                            min={1000}
                            max={50000}
                            step={500}
                            value={valor}
                            onChange={e => setValor(Number(e.target.value))}
                            className="w-full accent-[var(--brand-primary-hex)]"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>R$ 1.000</span>
                            <span>R$ 50.000</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-slate-500">Parcelas</label>
                            <span className="text-slate-900 font-bold">{parcelas}x</span>
                        </div>
                        <input
                            type="range"
                            min={6}
                            max={60}
                            step={6}
                            value={parcelas}
                            onChange={e => setParcelas(Number(e.target.value))}
                            className="w-full accent-[var(--brand-primary-hex)]"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>6x</span>
                            <span>60x</span>
                        </div>
                    </div>

                    <div className="brand-gradient-soft rounded-2xl p-5 border border-brand/20">
                        <p className="text-slate-500 text-xs mb-1">Parcela estimada</p>
                        <p className="text-slate-900 text-2xl font-bold">{fmtBRL(parcela)}<span className="text-sm font-medium text-slate-500">/mês</span></p>
                        <p className="text-slate-400 text-xs mt-1">Taxa de 1,79% a.m. · CET 24,1% a.a. · Sem IOF na promoção</p>
                    </div>
                </div>

                {/* Contratação — demo Maestro */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="absolute inset-0 brand-mesh opacity-70" />
                    <div className="relative z-10">
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-3">Contratação 100% digital</p>
                        <h2 className="text-2xl font-bold text-white mb-3">Do pedido à assinatura, em uma única jornada</h2>
                        <p className="text-white/60 text-sm leading-relaxed mb-6">
                            Ao contratar, nossa jornada guiada conduz tudo:
                            verificação de identidade, geração do contrato e assinatura — em uma única experiência.
                        </p>
                        <ul className="space-y-2 text-white/60 text-sm mb-8">
                            <li className="flex items-center gap-2"><span className="text-brand-accent">1.</span> Dados e verificação de identidade</li>
                            <li className="flex items-center gap-2"><span className="text-brand-accent">2.</span> Contrato gerado automaticamente</li>
                            <li className="flex items-center gap-2"><span className="text-brand-accent">3.</span> Assinatura eletrônica no mesmo fluxo</li>
                        </ul>
                    </div>
                    <button
                        onClick={maestro.startLoanFlow}
                        disabled={maestro.starting}
                        className="relative z-10 w-full py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60"
                    >
                        {maestro.starting ? 'Preparando sua proposta...' : `Contratar ${fmtBRL(valor)}`}
                    </button>
                </div>
            </div>

            {maestro.modal}
        </div>
    )
}

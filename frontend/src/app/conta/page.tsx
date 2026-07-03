'use client'

// Dashboard da área logada — visão geral estilo internet banking.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BankSession, getBankSession, firstName } from '@/lib/bankSession'
import { usePixSigningDemo } from '@/components/docusign/PixSigningDemo'
import { useMaestroDemo } from '@/components/docusign/MaestroDemo'
import { useCartaoClickToAgree } from '@/components/docusign/CartaoClickToAgree'
import { useAdvancedSignatureDemo } from '@/components/docusign/AdvancedSignatureDemo'

const SALDO = 12847.32

const TRANSACOES = [
    { id: 1, desc: 'Pix recebido — Maria Santos', valor: 1250.0, data: 'Hoje, 09:41', tipo: 'in' as const },
    { id: 2, desc: 'Supermercado Pão Dourado', valor: -287.45, data: 'Hoje, 08:15', tipo: 'out' as const },
    { id: 3, desc: 'Salário — Acme Tecnologia LTDA', valor: 8500.0, data: 'Ontem', tipo: 'in' as const },
    { id: 4, desc: 'Netflix.com', valor: -55.9, data: 'Ontem', tipo: 'out' as const },
    { id: 5, desc: 'Pix enviado — João Pereira', valor: -430.0, data: '28 jun', tipo: 'out' as const },
    { id: 6, desc: 'Rendimento CDB Fontara', valor: 94.17, data: '27 jun', tipo: 'in' as const },
]

const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ContaDashboard() {
    const [session, setSession] = useState<BankSession | null>(null)
    const [showBalance, setShowBalance] = useState(true)

    const pix = usePixSigningDemo()
    const maestro = useMaestroDemo()
    const cartao = useCartaoClickToAgree()
    const advanced = useAdvancedSignatureDemo()

    useEffect(() => {
        setSession(getBankSession())
    }, [])

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            {/* Saudação */}
            <div className="animate-fade-in-up">
                <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Olá, {firstName(session)} 👋
                </h1>
            </div>

            {/* Saldo + cartão */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-surface p-8 animate-fade-in-up">
                    <div className="absolute inset-0 brand-mesh opacity-70" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white/50 text-sm">Saldo disponível</p>
                            <button
                                onClick={() => setShowBalance(v => !v)}
                                className="p-2 text-white/40 hover:text-white transition-colors"
                                aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                            >
                                {showBalance ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-4xl font-bold text-white mb-8 tabular-nums">
                            {showBalance ? fmtBRL(SALDO) : 'R$ ••••••'}
                        </p>

                        {/* Ações rápidas */}
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={pix.startPixDemo} disabled={pix.creating} className="flex flex-col items-center gap-2 py-4 rounded-2xl glass border border-white/10 hover:border-brand/50 hover:scale-[1.04] transition-all duration-200 disabled:opacity-60">
                                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-white text-xs font-medium">{pix.creating ? 'Criando...' : 'Pix'}</span>
                            </button>
                            <Link href="/conta/cartoes" className="flex flex-col items-center gap-2 py-4 rounded-2xl glass border border-white/10 hover:border-brand/50 hover:scale-[1.04] transition-all duration-200">
                                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span className="text-white text-xs font-medium">Cartões</span>
                            </Link>
                            <Link href="/conta/emprestimos" className="flex flex-col items-center gap-2 py-4 rounded-2xl glass border border-white/10 hover:border-brand/50 hover:scale-[1.04] transition-all duration-200">
                                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span className="text-white text-xs font-medium">Empréstimo</span>
                            </Link>
                            <Link href="/conta/assinaturas" className="flex flex-col items-center gap-2 py-4 rounded-2xl glass border border-white/10 hover:border-brand/50 hover:scale-[1.04] transition-all duration-200">
                                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span className="text-white text-xs font-medium">Assinar</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cartão virtual */}
                <div className="bank-card rounded-3xl p-6 flex flex-col justify-between min-h-[220px] animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex justify-between items-start">
                        <span className="text-white/90 font-bold tracking-widest text-sm">FONTARA</span>
                        <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeWidth={2} d="M8.5 14.5A5.5 5.5 0 0112 9.6a5.5 5.5 0 013.5 4.9M5.6 17a9 9 0 0112.8 0M2.8 19.5a13 13 0 0118.4 0" transform="rotate(90 12 12)" />
                        </svg>
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
            </div>

            {/* Propaganda — upgrade de cartão */}
            <Link
                href="/conta/cartoes"
                className="group relative overflow-hidden rounded-3xl bg-surface flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 sm:p-7 animate-fade-in-up hover:scale-[1.01] transition-transform duration-300"
                style={{ animationDelay: '0.2s' }}
            >
                <div className="absolute inset-0 brand-mesh opacity-80" />
                <div className="absolute -right-10 -bottom-14 w-56 h-56 rounded-full brand-gradient opacity-20 blur-3xl" />
                <div className="relative z-10 w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                    <p className="text-brand-accent text-[11px] font-bold uppercase tracking-widest mb-1">Novo · Categoria liberada</p>
                    <p className="text-white font-bold text-base sm:text-lg">
                        Você foi pré-aprovado para o Cartão Fontara Platinum
                    </p>
                    <p className="text-white/50 text-sm">Limite de R$ 15.000, sem anuidade e 2% de cashback. Faça o upgrade agora.</p>
                </div>
                <span className="relative z-10 flex-shrink-0 px-6 py-3 brand-gradient text-white font-bold text-sm rounded-2xl brand-glow group-hover:opacity-90 transition-opacity">
                    Contratar agora →
                </span>
            </Link>

            {/* Ofertas contextualizadas */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Contratações digitais para você</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <button
                        onClick={maestro.startLoanFlow}
                        disabled={maestro.starting}
                        className="group text-left bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
                    >
                        <div className="w-11 h-11 brand-chip rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-900 mb-1">Crédito pré-aprovado</p>
                        <p className="text-slate-500 text-sm mb-3">Até R$ 50.000 com contratação guiada 100% digital.</p>
                        <span className="text-brand font-semibold text-sm">{maestro.starting ? 'Iniciando...' : 'Contratar agora →'}</span>
                    </button>

                    <button
                        onClick={cartao.openCartaoModal}
                        className="group text-left bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="w-11 h-11 brand-chip rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-900 mb-1">Cartão sem anuidade</p>
                        <p className="text-slate-500 text-sm mb-3">Adesão em 1 clique, com assinatura eletrônica no ato.</p>
                        <span className="text-brand font-semibold text-sm">Pedir cartão →</span>
                    </button>

                    <button
                        onClick={advanced.openAdvancedSignature}
                        className="group text-left bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="w-11 h-11 brand-chip rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="font-bold text-slate-900 mb-1">Assinatura avançada</p>
                        <p className="text-slate-500 text-sm mb-3">OTP por CPF com entrega por WhatsApp ou SMS.</p>
                        <span className="text-brand font-semibold text-sm">Experimentar →</span>
                    </button>
                </div>
            </div>

            {/* Extrato */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Últimas movimentações</h2>
                    <span className="text-brand text-sm font-semibold cursor-pointer hover:opacity-80">Ver extrato completo</span>
                </div>
                <ul className="divide-y divide-slate-100">
                    {TRANSACOES.map(t => (
                        <li key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.tipo === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {t.tipo === 'in' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-800 text-sm font-medium truncate">{t.desc}</p>
                                    <p className="text-slate-400 text-xs">{t.data}</p>
                                </div>
                            </div>
                            <p className={`text-sm font-bold tabular-nums flex-shrink-0 ${t.tipo === 'in' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                {showBalance ? `${t.valor > 0 ? '+' : ''}${fmtBRL(t.valor)}` : '••••'}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modais das demos */}
            {pix.modal}
            {maestro.modal}
            {cartao.modal}
            {advanced.modal}
        </div>
    )
}

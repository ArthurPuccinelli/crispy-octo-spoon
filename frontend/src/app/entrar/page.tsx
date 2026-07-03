'use client'

// Login do cliente (simulado) — qualquer usuário e senha são aceitos.
// Cria uma sessão local e leva para a área logada (/conta).

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBankSession } from '@/lib/bankSession'

export default function EntrarPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !password.trim()) return
        setLoading(true)
        // Simula validação de credenciais (demo: qualquer usuário/senha entra)
        await new Promise(r => setTimeout(r, 900))
        createBankSession(email)
        router.push('/conta')
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
            {/* Painel esquerdo — branding */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 brand-mesh" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/25 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow" />

                <Link href="/" className="relative z-10">
                    <Image
                        src="/logo-fontara-final.svg"
                        alt="Fontara Financial"
                        width={200}
                        height={50}
                        className="h-10 w-auto"
                    />
                </Link>

                <div className="relative z-10">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                        O banco digital
                        <br />
                        <span className="gradient-text">que assina com você.</span>
                    </h1>
                    <p className="text-white/50 max-w-md leading-relaxed">
                        Pix, cartão, empréstimos e investimentos — com toda contratação
                        assinada eletronicamente, sem papel e sem fila.
                    </p>

                    <div className="flex items-center gap-6 mt-10">
                        <div className="glass-dark border border-white/10 rounded-2xl px-5 py-4 animate-float">
                            <p className="text-white/40 text-xs mb-1">Contratos assinados hoje</p>
                            <p className="text-white text-xl font-bold">12.408</p>
                        </div>
                        <div className="glass-dark border border-white/10 rounded-2xl px-5 py-4 animate-float" style={{ animationDelay: '1s' }}>
                            <p className="text-white/40 text-xs mb-1">Tempo médio de adesão</p>
                            <p className="text-white text-xl font-bold">38 segundos</p>
                        </div>
                    </div>
                </div>

                <p className="relative z-10 text-white/30 text-xs">
                    © 2026 Fontara Financial S.A.
                </p>
            </div>

            {/* Painel direito — formulário */}
            <div className="relative flex items-center justify-center px-4 py-16 sm:px-12">
                <div className="lg:hidden absolute inset-0 brand-mesh pointer-events-none" />
                <div className="relative w-full max-w-md animate-fade-in-up">
                    <div className="lg:hidden mb-10 text-center">
                        <Link href="/">
                            <Image
                                src="/logo-fontara-final.svg"
                                alt="Fontara Financial"
                                width={180}
                                height={45}
                                className="h-9 w-auto mx-auto"
                            />
                        </Link>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta 👋</h2>
                    <p className="text-white/50 text-sm mb-10">
                        Acesse sua conta para gerenciar seu dinheiro.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                                Email ou CPF
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border-0 text-sm shadow-inner focus:ring-2 focus:ring-brand transition-shadow"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-white/70">
                                    Senha
                                </label>
                                <span className="text-xs text-brand-accent/80 cursor-pointer hover:text-brand-accent">Esqueci minha senha</span>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border-0 text-sm shadow-inner focus:ring-2 focus:ring-brand transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 brand-gradient text-white font-bold rounded-xl brand-glow hover:opacity-90 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Entrando com segurança...
                                </>
                            ) : 'Entrar'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-xs">ainda não é cliente?</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <Link
                        href="/entrar"
                        onClick={(e) => { e.preventDefault(); setEmail('cliente.demo@fontara.com'); setPassword('demo123') }}
                        className="block w-full py-3.5 border border-white/15 text-white text-center font-semibold rounded-xl hover:bg-white/5 hover:border-brand/50 transition-all duration-300"
                    >
                        Abrir minha conta grátis
                    </Link>

                    <p className="text-white/25 text-xs text-center mt-8">
                        🔒 Ambiente de demonstração — qualquer usuário e senha acessam a conta simulada.
                    </p>

                    <div className="text-center mt-4">
                        <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                            ← Voltar para o site
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

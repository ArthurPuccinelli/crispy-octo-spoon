'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { signIn, user, loading: authLoading } = useAuth()
    const router = useRouter()

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/admin')
        }
    }, [user, authLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await signIn(email, password)

            if (error) {
                setError('Credenciais inválidas. Verifique e tente novamente.')
            } else {
                setTimeout(() => {
                    router.push('/admin')
                }, 100)
            }
        } catch (err) {
            console.error('❌ Erro inesperado no login:', err)
            setError('Erro inesperado ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-white/60">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    if (user) {
        return null
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Fundo animado */}
            <div className="absolute inset-0 brand-mesh" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow" />

            <div className="relative z-10 max-w-md w-full animate-fade-in-up">
                <div className="glass-dark rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center brand-glow mb-6">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                            Área Administrativa
                        </h2>
                        <p className="mt-2 text-sm text-white/50">
                            Fontara Financial · Acesso restrito
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-0 text-sm shadow-inner focus:ring-2 focus:ring-brand transition-shadow"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-0 text-sm shadow-inner focus:ring-2 focus:ring-brand transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 brand-gradient text-white font-semibold rounded-xl brand-glow hover:opacity-90 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                            ← Voltar para o site
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

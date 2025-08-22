'use client'

import { useState, useEffect } from 'react'
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
            // Usuário já logado, redirecionando para admin
            router.push('/admin')
        }
    }, [user, authLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Tentando login
            const { error } = await signIn(email, password)

            if (error) {
                console.error('❌ Erro no login:', error)
                setError(error.message)
            } else {
                // Login bem-sucedido, redirecionando
                // Aguardar um pouco para o estado ser atualizado
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

    // Se ainda estiver carregando a autenticação, mostrar loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    // Se já estiver logado, não mostrar nada (será redirecionado)
    if (user) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Acesse sua conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Fontara Financial
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Para fins de demonstração, use:
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Email: admin@fontara.com<br />
                        Senha: admin123
                    </p>
                </div>
            </div>
        </div>
    )
}

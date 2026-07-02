'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function AdminNavBar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut } = useAuth()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isActive = (path: string) => {
        return pathname?.startsWith(path)
    }

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            // Iniciando logout

            // Chamar signOut do AuthContext (que já faz o redirecionamento)
            await signOut()

            // O redirecionamento será feito pelo AuthContext
            // Logout concluído

        } catch (error) {
            console.error('❌ Erro no logout:', error)
            setIsLoggingOut(false)

            // Em caso de erro, forçar redirecionamento
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        }
    }

    return (
        <nav className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/admin" className="text-white font-bold text-lg flex items-center">
                                <div className="relative mr-2">
                                    <Image
                                        src="/logo-fontara-final.svg"
                                        alt="Fontara Financial"
                                        width={120}
                                        height={40}
                                        className="h-6 w-auto"
                                    />
                                </div>
                                Fontara Financial
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/admin"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') && !isActive('/admin/')
                                        ? 'brand-gradient text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/clientes"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/clientes')
                                        ? 'brand-gradient text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    Clientes
                                </Link>
                                <Link
                                    href="/admin/produtos"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/produtos')
                                        ? 'brand-gradient text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    Produtos
                                </Link>
                                <Link
                                    href="/admin/servicos"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/servicos')
                                        ? 'brand-gradient text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    Serviços
                                </Link>
                                <Link
                                    href="/admin/tema"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/tema')
                                        ? 'brand-gradient text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    🎨 Tema
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            type="button"
                            aria-label="Abrir menu"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen(v => !v)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                        <div className="hidden md:flex items-center space-x-4">
                            {user && (
                                <div className="text-white/60 text-sm">
                                    Olá, {user.email}
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`text-white/60 hover:bg-white/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoggingOut ? 'Saindo...' : 'Sair'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile menu panel */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="/admin"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin') && !isActive('/admin/') ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/clientes"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/clientes') ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Clientes
                        </Link>
                        <Link
                            href="/admin/produtos"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/produtos') ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Produtos
                        </Link>
                        <Link
                            href="/admin/servicos"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/servicos') ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Serviços
                        </Link>
                        <Link
                            href="/admin/tema"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin/tema') ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            🎨 Tema
                        </Link>
                    </div>
                    <div className="border-t border-white/10 px-2 py-3">
                        {user && (
                            <div className="px-3 pb-2 text-sm text-white/60">Olá, {user.email}</div>
                        )}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

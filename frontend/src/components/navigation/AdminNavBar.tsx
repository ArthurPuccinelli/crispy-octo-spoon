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
        <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
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
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/clientes"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/clientes')
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    Clientes
                                </Link>
                                <Link
                                    href="/admin/produtos"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/produtos')
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    Produtos
                                </Link>
                                <Link
                                    href="/admin/servicos"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/servicos')
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    Serviços
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user && (
                            <div className="text-gray-300 text-sm">
                                Olá, {user.email}
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNavBar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname?.startsWith(path)
    }

    return (
        <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/admin" className="text-white font-bold text-xl flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                                    <span className="text-white font-bold text-sm">F</span>
                                </div>
                                Fontara Financial
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/admin"
                                    className={`${isActive('/admin') && !isActive('/admin/clientes') && !isActive('/admin/produtos') && !isActive('/admin/servicos')
                                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                                >
                                    📊 Dashboard
                                </Link>
                                <Link
                                    href="/admin/clientes"
                                    className={`${isActive('/admin/clientes')
                                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                                >
                                    👥 Clientes
                                </Link>
                                <Link
                                    href="/admin/produtos"
                                    className={`${isActive('/admin/produtos')
                                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                                >
                                    📦 Produtos
                                </Link>
                                <Link
                                    href="/admin/servicos"
                                    className={`${isActive('/admin/servicos')
                                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                                >
                                    📋 Serviços
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            🏠 Voltar ao Site
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}

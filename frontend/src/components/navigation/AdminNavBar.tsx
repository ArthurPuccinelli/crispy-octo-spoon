'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNavBar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname?.startsWith(path)
    }

    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-white font-bold text-xl">
                                Fontara
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/admin/clientes"
                                    className={`${isActive('/admin/clientes')
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                >
                                    Clientes
                                </Link>
                                <Link
                                    href="/admin/produtos"
                                    className={`${isActive('/admin/produtos')
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                >
                                    Produtos
                                </Link>
                                <Link
                                    href="/admin/servicos"
                                    className={`${isActive('/admin/servicos')
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium`}
                                >
                                    Serviços Contratados
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

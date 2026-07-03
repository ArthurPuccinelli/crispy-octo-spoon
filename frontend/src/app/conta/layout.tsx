'use client'

// Layout da área logada do cliente — internet banking de demonstração.
// Sidebar fixa no desktop, header compacto no mobile.

import { ReactNode, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BankSession, getBankSession, clearBankSession, firstName } from '@/lib/bankSession'

const NAV_ITEMS = [
    {
        href: '/conta', label: 'Início', exact: true,
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    },
    {
        href: '/conta/pix', label: 'Pix',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    },
    {
        href: '/conta/cartoes', label: 'Cartões',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    },
    {
        href: '/conta/emprestimos', label: 'Empréstimos',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />,
    },
    {
        href: '/conta/assinaturas', label: 'Assinaturas',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
    },
]

export default function ContaLayout({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<BankSession | null>(null)
    const [checked, setChecked] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const s = getBankSession()
        if (!s) {
            router.replace('/entrar')
            return
        }
        setSession(s)
        setChecked(true)
    }, [router])

    const handleLogout = () => {
        clearBankSession()
        router.push('/')
    }

    if (!checked || !session) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-white/50">Abrindo sua conta...</p>
                </div>
            </div>
        )
    }

    const isActive = (item: typeof NAV_ITEMS[number]) =>
        item.exact ? pathname === item.href : pathname?.startsWith(item.href)

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-white/5 fixed inset-y-0 z-30">
                <div className="p-6 border-b border-white/5">
                    <Link href="/">
                        <Image src="/logo-fontara-final.svg" alt="Fontara Financial" width={160} height={40} className="h-8 w-auto" />
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item)
                                ? 'brand-gradient text-white brand-glow'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-white text-sm font-bold">
                            {firstName(session).charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{session.name}</p>
                            <p className="text-white/40 text-xs truncate">{session.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair da conta
                    </button>
                </div>
            </aside>

            {/* Conteúdo */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Header mobile */}
                <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-white/5">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/conta">
                            <Image src="/logo-fontara-final.svg" alt="Fontara" width={130} height={32} className="h-7 w-auto" />
                        </Link>
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label="Abrir menu"
                            className="p-2 text-white/70 hover:text-white"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                    {mobileOpen && (
                        <nav className="border-t border-white/5 px-3 py-3 space-y-1 bg-surface">
                            {NAV_ITEMS.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive(item) ? 'brand-gradient text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sair da conta
                            </button>
                        </nav>
                    )}
                </header>

                <main className="flex-1">
                    {children}
                </main>

                <footer className="px-6 py-4 text-center">
                    <p className="text-slate-400 text-xs">
                        © 2026 Fontara Financial S.A. · Central de atendimento 0800 000 0000 · Ouvidoria 0800 000 0001
                    </p>
                </footer>
            </div>
        </div>
    )
}

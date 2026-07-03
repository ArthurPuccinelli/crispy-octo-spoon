'use client'

import AdminNavBar from '@/components/navigation/AdminNavBar'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

export default function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (!isAdmin) {
                router.push('/')
            }
        }
    }, [user, loading, isAdmin, router])

    if (loading) {
        return (
            <div className="relative min-h-screen bg-surface flex items-center justify-center">
                <div className="absolute inset-0 brand-mesh pointer-events-none" />
                <div className="relative text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent mx-auto mb-6"></div>
                    <p className="text-white/70 text-lg">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    if (!user || !isAdmin) {
        return null // Será redirecionado pelo useEffect
    }

    return (
        <div className="relative min-h-screen bg-surface">
            <div className="absolute inset-0 brand-mesh pointer-events-none" />
            <div className="relative">
                <AdminNavBar />
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

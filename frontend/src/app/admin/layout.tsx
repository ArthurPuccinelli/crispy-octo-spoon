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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    if (!user || !isAdmin) {
        return null // Será redirecionado pelo useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
            <AdminNavBar />
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    )
}

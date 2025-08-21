import AdminNavBar from '@/components/navigation/AdminNavBar'
import { ReactNode } from 'react'

export default function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
            <AdminNavBar />
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    )
}

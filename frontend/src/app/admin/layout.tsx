import AdminNavBar from '@/components/navigation/AdminNavBar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <AdminNavBar />
            <main>{children}</main>
        </div>
    )
}

interface PageHeaderProps {
    title: string
    actionLabel?: string
    onAction?: () => void
}

export function PageHeader({ title, actionLabel, onAction }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

interface PageContainerProps {
    children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
    return <div className="max-w-7xl mx-auto p-6">{children}</div>
}

interface DataTableProps {
    children: React.ReactNode
}

export function DataTable({ children }: DataTableProps) {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">{children}</table>
        </div>
    )
}

interface TableHeaderProps {
    children: React.ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
    return (
        <thead className="bg-gray-50">
            <tr>{children}</tr>
        </thead>
    )
}

interface TableColumnHeaderProps {
    label: string
}

export function TableColumnHeader({ label }: TableColumnHeaderProps) {
    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
        </th>
    )
}

interface TableBodyProps {
    children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
    return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
}

interface TableCellProps {
    children: React.ReactNode
}

export function TableCell({ children }: TableCellProps) {
    return <td className="px-6 py-4">{children}</td>
}

interface TableActionsCellProps {
    children: React.ReactNode
}

export function TableActionsCell({ children }: TableActionsCellProps) {
    return <td className="px-6 py-4 text-sm font-medium">{children}</td>
}

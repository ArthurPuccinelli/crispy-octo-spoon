export function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
}

interface ErrorMessageProps {
    message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {message}
        </div>
    )
}

interface EmptyStateProps {
    message: string
    description?: string
}

export function EmptyState({ message, description }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">{message}</h3>
            {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        </div>
    )
}

interface StatusBadgeProps {
    status: 'ativo' | 'inativo' | 'suspenso' | 'cancelado'
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        ativo: 'bg-green-100 text-green-800',
        inativo: 'bg-red-100 text-red-800',
        suspenso: 'bg-yellow-100 text-yellow-800',
        cancelado: 'bg-gray-100 text-gray-800'
    }

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status]}`}>
            {status}
        </span>
    )
}

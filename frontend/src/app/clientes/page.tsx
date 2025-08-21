import ClientesList from '@/components/ClientesList'

export default function ClientesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            👥 Gestão de Clientes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Visualize e gerencie todos os clientes da sua aplicação
          </p>
        </div>
        
        <ClientesList />
        
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            ← Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  )
}

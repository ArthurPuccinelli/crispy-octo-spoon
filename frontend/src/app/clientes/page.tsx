import ClientesList from '@/components/ClientesList'
import Link from 'next/link'

export default function ClientesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                Fontara Financial
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors">Início</Link>
              <Link href="/clientes" className="text-teal-600 font-medium">Clientes</Link>
              <Link href="/admin" className="text-gray-700 hover:text-teal-600 transition-colors">Administração</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            👥 Nossos Clientes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça nossa base de clientes e descubra como podemos ajudar sua empresa financeira
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl text-white">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parcerias Financeiras</h3>
            <p className="text-gray-600 text-sm">
              Trabalhamos com empresas de diversos segmentos financeiros, criando soluções personalizadas
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl text-white">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Crescimento Sustentável</h3>
            <p className="text-gray-600 text-sm">
              Nossos clientes crescem conosco, com soluções financeiras escaláveis e suporte contínuo
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl text-white">⭐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfação Garantida</h3>
            <p className="text-gray-600 text-sm">
              Alta taxa de satisfação e retenção de clientes com nossos serviços financeiros
            </p>
          </div>
        </div>

        <ClientesList />

        <div className="mt-12 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-2xl mx-auto border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quer ser nosso cliente?
            </h2>
            <p className="text-gray-600 mb-6">
              Entre em contato conosco e descubra como podemos ajudar sua empresa financeira a crescer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
              >
                📞 Fale Conosco
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-teal-300 hover:text-teal-600 transition-all duration-200"
              >
                ← Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-xl font-semibold">Fontara Financial</span>
            </div>
            <p className="text-gray-400 mb-6">
              Plataforma financeira completa e moderna
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <Link href="/clientes" className="hover:text-white transition-colors">Clientes</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Administração</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

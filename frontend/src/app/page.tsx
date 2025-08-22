

export default function Home() {
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
              <a href="/" className="text-gray-700 hover:text-teal-600 transition-colors">Início</a>
              <a href="/clientes" className="text-gray-700 hover:text-teal-600 transition-colors">Clientes</a>
              <a href="/admin" className="text-gray-700 hover:text-teal-600 transition-colors">Administração</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Fontara Financial
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Plataforma financeira completa para gestão de clientes, produtos e serviços
            </p>

            {/* Main Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* Área Pública */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl text-white">👥</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Área Pública</h3>
                <p className="text-gray-600 mb-6">
                  Visualize informações públicas sobre clientes e serviços financeiros disponíveis
                </p>
                <div className="space-y-3">
                  <a
                    href="/clientes"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    👥 Ver Clientes
                  </a>
                </div>
              </div>

              {/* Área Administrativa */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl text-white">⚙️</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Administração</h3>
                <p className="text-gray-600 mb-6">
                  Gerencie clientes, produtos financeiros, serviços e contratos do sistema
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    ⚙️ Acessar Admin
                  </a>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
              {/* Frontend Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">⚛️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Frontend</h3>
                <p className="text-gray-600 text-sm">
                  Next.js 14 com React 18, TypeScript e Tailwind CSS para uma experiência de usuário excepcional
                </p>
              </div>

              {/* Backend Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Backend</h3>
                <p className="text-gray-600 text-sm">
                  Node.js com Express, CORS, Helmet e Morgan para uma API robusta e segura
                </p>
              </div>

              {/* Database Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🗄️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Banco de Dados</h3>
                <p className="text-gray-600 text-sm">
                  Supabase integrado para gerenciamento de dados financeiros em tempo real
                </p>
              </div>

              {/* Deploy Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Deploy</h3>
                <p className="text-gray-600 text-sm">
                  Vercel para frontend e Railway para backend com CI/CD automatizado
                </p>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">📊 Status dos Serviços</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900">Frontend</span>
                  </div>
                  <span className="text-sm text-teal-600 font-mono">http://localhost:3000</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900">Backend</span>
                  </div>
                  <span className="text-sm text-teal-600 font-mono">http://localhost:3001</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </main>

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
              <a href="/" className="hover:text-white transition-colors">Início</a>
              <a href="/clientes" className="hover:text-white transition-colors">Clientes</a>
              <a href="/admin" className="hover:text-white transition-colors">Administração</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

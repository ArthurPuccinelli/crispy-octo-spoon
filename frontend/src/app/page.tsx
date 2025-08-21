export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍜</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Crispy Octo Spoon
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Início</a>
              <a href="/clientes" className="text-gray-700 hover:text-blue-600 transition-colors">Clientes</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Sobre</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              🍜 Crispy Octo Spoon
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Aplicação full-stack moderna construída com Next.js, React, TypeScript e Node.js
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/clientes"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                👥 Ver Clientes
              </a>
              <a
                href="#"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                📚 Documentação
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {/* Frontend Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Frontend</h3>
              <p className="text-gray-600 text-sm">
                Next.js 14 com React 18, TypeScript e Tailwind CSS para uma experiência de usuário excepcional
              </p>
            </div>

            {/* Backend Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Backend</h3>
              <p className="text-gray-600 text-sm">
                Node.js com Express, CORS, Helmet e Morgan para uma API robusta e segura
              </p>
            </div>

            {/* Database Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🗄️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Banco de Dados</h3>
              <p className="text-gray-600 text-sm">
                Supabase integrado para gerenciamento de dados em tempo real
              </p>
            </div>

            {/* Deploy Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deploy</h3>
              <p className="text-gray-600 text-sm">
                Vercel para frontend e Railway para backend com CI/CD automatizado
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="mt-20 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">📊 Status dos Serviços</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Frontend</span>
                </div>
                <span className="text-sm text-green-600 font-mono">http://localhost:3000</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Backend</span>
                </div>
                <span className="text-sm text-green-600 font-mono">http://localhost:3001</span>
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
              <span className="text-2xl">🍜</span>
              <span className="text-xl font-semibold">Crispy Octo Spoon</span>
            </div>
            <p className="text-gray-400 mb-6">
              Aplicação full-stack moderna e escalável
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">Início</a>
              <a href="/clientes" className="hover:text-white transition-colors">Clientes</a>
              <a href="#" className="hover:text-white transition-colors">Sobre</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

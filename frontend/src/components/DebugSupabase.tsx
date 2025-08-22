'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugSupabase() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar variáveis de ambiente
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    }

    setDebugInfo(envVars)
  }, [])

  const testSupabaseConnection = async () => {
    setLoading(true)
    try {
      console.log('🔍 Testando conexão Supabase no frontend...')

      // Teste 1: Verificar se o cliente foi criado
      console.log('📱 Cliente Supabase:', supabase)

      // Teste 2: Consultar clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .limit(3)

      console.log('👥 Resultado clientes:', { data: clientes, error: clientesError })

      // Teste 3: Consultar produtos
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .limit(3)

      console.log('📦 Resultado produtos:', { data: produtos, error: produtosError })

      setTestResult({
        clientes: { data: clientes, error: clientesError },
        produtos: { data: produtos, error: produtosError },
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('❌ Erro no teste:', error)
      setTestResult({ error: error.message, timestamp: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Debug Supabase</h2>

      {/* Variáveis de Ambiente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Variáveis de Ambiente</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL:</span>
            <span className="font-mono text-sm text-blue-600">
              {debugInfo.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
            <span className="font-mono text-sm text-blue-600">
              {debugInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY ?
                `${debugInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...` :
                'NÃO DEFINIDA'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-sm">NODE_ENV:</span>
            <span className="font-mono text-sm text-blue-600">
              {debugInfo.NODE_ENV || 'NÃO DEFINIDA'}
            </span>
          </div>
        </div>
      </div>

      {/* Botão de Teste */}
      <div className="mb-6">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 mr-4"
        >
          {loading ? '🔄 Testando...' : '🧪 Testar Conexão Supabase'}
        </button>

        <button
          onClick={() => {
            console.log('🔍 Estado atual da autenticação:')
            console.log('localStorage:', Object.keys(localStorage))
            console.log('sessionStorage:', Object.keys(sessionStorage))
            console.log('Cookies:', document.cookie)
          }}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg"
        >
          🔍 Verificar Estado Auth
        </button>
      </div>

      {/* Resultados do Teste */}
      {testResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Resultados do Teste</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Como usar</h3>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
          <li>Abra o console do navegador (F12)</li>
          <li>Clique no botão "Testar Conexão Supabase"</li>
          <li>Verifique os logs no console</li>
          <li>Compare com os resultados exibidos aqui</li>
        </ol>
      </div>
    </div>
  )
}

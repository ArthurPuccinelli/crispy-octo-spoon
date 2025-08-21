'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

interface Cliente {
  id: number
  nome: string
  email: string
  created_at?: string
  updated_at?: string
}

export default function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchClientesFromSupabase = useCallback(async () => {
    // Evitar múltiplas requisições simultâneas
    if (loading) return

    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Consultando tabela clientes no Supabase...')

      // Consulta direta na tabela clientes
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError)
        throw new Error(`Erro do Supabase: ${supabaseError.message}`)
      }

      console.log('✅ Dados recebidos do Supabase:', data)

      if (data && Array.isArray(data)) {
        setClientes(data)
        setHasLoaded(true)
        console.log(`🎯 ${data.length} clientes carregados do Supabase!`)
      } else {
        console.log('📝 Nenhum cliente encontrado na tabela')
        setClientes([])
        setHasLoaded(true)
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Teste automático ao montar o componente
  useEffect(() => {
    console.log('🚀 Componente montado, conectando com Supabase...')
    fetchClientesFromSupabase()
  }, [fetchClientesFromSupabase])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">📋 Lista de Clientes (Supabase)</h2>

      {/* Status da conexão */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
        <p className="text-blue-800">
          {hasLoaded ? '✅ Conectado ao Supabase!' : '⏳ Conectando com Supabase...'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          {supabaseUrl ? '🔗 URL configurada' : '❌ URL não configurada'}
        </p>
      </div>

      {/* Botão de recarregar */}
      <div className="text-center">
        <button
          onClick={fetchClientesFromSupabase}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Consultando...' : '🔄 Recarregar do Supabase'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Consultando tabela clientes...</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Erro:</strong> {error}
          <div className="mt-2">
            <button
              onClick={fetchClientesFromSupabase}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      {clientes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center text-gray-700">
            📊 Total de Clientes: {clientes.length}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{cliente.nome}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">ID: {cliente.id}</span>
                </div>
                <p className="text-gray-600 flex items-center mb-2">
                  <span className="mr-2">📧</span>
                  {cliente.email}
                </p>
                {cliente.created_at && (
                  <p className="text-xs text-gray-500">
                    Criado: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {hasLoaded ? 'Nenhum cliente encontrado na tabela clientes do Supabase.' : 'Aguardando consulta ao Supabase...'}
        </div>
      )}

      {/* Informações de debug */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          <strong>Debug:</strong> Supabase URL: {supabaseUrl ? '✅ Configurada' : '❌ Não configurada'}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Status:</strong> {hasLoaded ? 'Conectado' : 'Conectando...'} |
          <strong>Clientes:</strong> {clientes.length}
        </p>
      </div>

      {/* Botão de recarregar página */}
      <div className="text-center pt-4 border-t">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          🔄 Recarregar Página
        </button>
      </div>
    </div>
  )
}

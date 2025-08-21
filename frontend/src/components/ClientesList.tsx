'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

interface Cliente {
  id: string
  nome: string
  email: string
  cpf_cnpj?: string
  telefone?: string
  cidade?: string
  estado?: string
  tipo_cliente: 'pessoa_fisica' | 'pessoa_juridica'
  status: 'ativo' | 'inativo' | 'suspenso'
  created_at: string
  updated_at: string
}

export default function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchClientesFromSupabase = async () => {
    // Evitar múltiplas requisições simultâneas
    if (loading) return

    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Consultando tabela clientes no Supabase...')

      // Consulta direta na tabela clientes da Fontara
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
  }

  // Executar apenas uma vez ao montar o componente
  useEffect(() => {
    console.log('🚀 Componente montado, conectando com Supabase Fontara...')
    fetchClientesFromSupabase()
  }, []) // Array vazio para executar apenas uma vez

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">🏦 Fontara - Gestão de Clientes</h2>

      {/* Status da conexão */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">
          {hasLoaded ? '✅ Conectado ao Supabase Fontara!' : '⏳ Conectando com Supabase...'}
        </h3>
        <p className="text-blue-600">
          {supabaseUrl ? '🔗 URL configurada' : '❌ URL não configurada'}
        </p>
        <p className="text-sm text-blue-500 mt-1">
          Plataforma Financeira - Gestão Completa de Clientes e Produtos
        </p>
      </div>

      {/* Botão de recarregar */}
      <div className="text-center">
        <button
          onClick={fetchClientesFromSupabase}
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? '⏳ Consultando...' : '🔄 Recarregar do Supabase'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Consultando tabela clientes da Fontara...</span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <strong className="font-bold text-lg">❌ Erro de Conexão:</strong>
          <p className="mt-2">{error}</p>
          <div className="mt-4">
            <button
              onClick={fetchClientesFromSupabase}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      {clientes.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              📊 Dashboard de Clientes - Total: {clientes.length}
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-800">{cliente.nome}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
                      cliente.status === 'suspenso' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {cliente.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-600 flex items-center">
                      <span className="mr-2">📧</span>
                      {cliente.email}
                    </p>

                    {cliente.telefone && (
                      <p className="text-gray-600 flex items-center">
                        <span className="mr-2">📱</span>
                        {cliente.telefone}
                      </p>
                    )}

                    {cliente.cidade && cliente.estado && (
                      <p className="text-gray-600 flex items-center">
                        <span className="mr-2">📍</span>
                        {cliente.cidade} - {cliente.estado}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${cliente.tipo_cliente === 'pessoa_fisica' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                        {cliente.tipo_cliente === 'pessoa_fisica' ? '👤 PF' : '🏢 PJ'}
                      </span>

                      <span className="text-xs text-gray-500">
                        Criado: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          {hasLoaded ? (
            <div className="space-y-4">
              <p className="text-xl">Nenhum cliente encontrado na tabela clientes da Fontara.</p>
              <p className="text-sm text-gray-400">Execute o script SQL para criar os dados iniciais.</p>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-yellow-800 font-semibold">📋 Próximo Passo:</p>
                <p className="text-yellow-700 text-sm mt-2">
                  1. Acesse o Supabase<br />
                  2. Execute o script SQL da Fontara<br />
                  3. Recarregue esta página
                </p>
              </div>
            </div>
          ) : (
            <p className="text-lg">Aguardando consulta ao Supabase...</p>
          )}
        </div>
      )}

      {/* Informações de debug */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-center text-gray-700 mb-4">🔧 Informações de Debug</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-600">Supabase URL:</p>
            <p className={supabaseUrl ? 'text-green-600' : 'text-red-600'}>
              {supabaseUrl ? '✅ Configurada' : '❌ Não configurada'}
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600">Status:</p>
            <p className={hasLoaded ? 'text-green-600' : 'text-yellow-600'}>
              {hasLoaded ? 'Conectado' : 'Conectando...'}
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600">Clientes:</p>
            <p className="text-blue-600">{clientes.length}</p>
          </div>
        </div>
      </div>

      {/* Botão de recarregar página */}
      <div className="text-center pt-6 border-t">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
        >
          🔄 Recarregar Página
        </button>
      </div>
    </div>
  )
}

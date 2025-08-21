'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
}

export default function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw new Error(`Erro ao carregar clientes: ${supabaseError.message}`)
      }

      setClientes(data || [])
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-lg text-gray-600">Carregando clientes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar clientes</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchClientes}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-gray-100">
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">👥</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
        <p className="text-gray-600">
          Nossa base de clientes está sendo atualizada. Volte em breve!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Nossa Base de Clientes
          </h3>
          <p className="text-gray-600">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} ativo{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros e estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">
              {clientes.filter(c => c.tipo_cliente === 'pessoa_fisica').length}
            </div>
            <div className="text-sm text-blue-600">Pessoas Físicas</div>
          </div>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-4 text-center border border-teal-100">
            <div className="text-2xl font-bold text-teal-600">
              {clientes.filter(c => c.tipo_cliente === 'pessoa_juridica').length}
            </div>
            <div className="text-sm text-teal-600">Pessoas Jurídicas</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 text-center border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-600">
              {clientes.filter(c => c.cidade && c.estado).length}
            </div>
            <div className="text-sm text-emerald-600">Com Localização</div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {cliente.nome}
                </h4>
                <p className="text-sm text-gray-500">
                  {cliente.tipo_cliente === 'pessoa_fisica' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border border-teal-200">
                  ✅ Ativo
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📧</span>
                <span className="truncate">{cliente.email}</span>
              </div>

              {cliente.telefone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📱</span>
                  <span>{cliente.telefone}</span>
                </div>
              )}

              {cliente.cidade && cliente.estado && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{cliente.cidade}, {cliente.estado}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

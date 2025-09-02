'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'

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
      // Erro ao carregar clientes
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">
              {clientes.filter(c => c.tipo_cliente === 'pessoa_fisica' || !c.tipo_cliente).length}
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
              {clientes.filter(c => c.endereco || (c.cidade && c.estado)).length}
            </div>
            <div className="text-sm text-emerald-600">Com Endereço</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {clientes.filter(c => c.observacoes).length}
            </div>
            <div className="text-sm text-purple-600">Com Observações</div>
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
            {/* Header do Cliente */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {cliente.nome}
                </h4>
                <p className="text-sm text-gray-500">
                  {cliente.tipo_cliente === 'pessoa_fisica' ? '👤 Pessoa Física' :
                    cliente.tipo_cliente === 'pessoa_juridica' ? '🏢 Pessoa Jurídica' :
                      '👤 Pessoa Física'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cliente.status === 'ativo'
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
                    : cliente.status === 'suspenso'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200'
                      : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
                  }`}>
                  {cliente.status === 'ativo' ? '✅ Ativo' : cliente.status === 'suspenso' ? '⚠️ Suspenso' : '❌ Inativo'}
                </span>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="space-y-3">
              {/* Documento */}
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🆔</span>
                <span className="font-mono font-medium">{cliente.cpf_cnpj}</span>
              </div>

              {/* Email */}
              {cliente.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📧</span>
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}

              {/* Telefone */}
              {cliente.telefone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📱</span>
                  <span>{cliente.telefone}</span>
                </div>
              )}

              {/* Endereço Completo */}
              {(cliente.endereco || cliente.cidade || cliente.estado || cliente.cep) && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Endereço</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {cliente.endereco && (
                      <div className="text-sm text-gray-600">
                        {cliente.endereco}
                      </div>
                    )}
                    {(cliente.cidade || cliente.estado) && (
                      <div className="text-sm text-gray-600">
                        {cliente.cidade && cliente.estado
                          ? `${cliente.cidade}, ${cliente.estado}`
                          : cliente.cidade || cliente.estado
                        }
                      </div>
                    )}
                    {cliente.cep && (
                      <div className="text-sm text-gray-500 font-mono">
                        CEP: {cliente.cep}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observações */}
              {cliente.observacoes && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📝</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observações</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                      {cliente.observacoes}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer com datas */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  {cliente.updated_at !== cliente.created_at && (
                    <span>
                      Atualizado em {new Date(cliente.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

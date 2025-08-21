'use client'

import { useState, useEffect } from 'react'
import ClienteForm from '@/components/forms/ClienteForm'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

export default function GestaoClientesPage() {
    const [showForm, setShowForm] = useState(false)
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchClientes = async () => {
        try {
            setLoading(true)
            const { data, error: supabaseError } = await supabase
                .from('clientes')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            setClientes(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return

        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchClientes()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir cliente')
        }
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setSelectedCliente(null)
        fetchClientes()
    }

    useEffect(() => {
        fetchClientes()
    }, [])

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <Link href="/admin" className="hover:text-teal-600">Dashboard</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Clientes</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
                        <p className="text-gray-600 mt-2">Gerencie todos os clientes da plataforma financeira</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
                    >
                        + Novo Cliente
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500">
                            <span className="text-2xl text-white">👥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-semibold text-gray-900">{clientes.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500">
                            <span className="text-2xl text-white">✅</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ativos</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {clientes.filter(c => c.status === 'ativo').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                            <span className="text-2xl text-white">⚠️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Suspensos</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {clientes.filter(c => c.status === 'suspenso').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500">
                            <span className="text-2xl text-white">❌</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Inativos</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {clientes.filter(c => c.status === 'inativo').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        {error}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <ClienteForm
                        onSuccess={handleFormSuccess}
                        clienteToEdit={selectedCliente}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-lg text-gray-600">Carregando clientes...</span>
                </div>
            ) : (
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                        <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contato
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Localização
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {cliente.nome.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {cliente.tipo_cliente === 'pessoa_fisica' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
                                                    </div>
                                                    {cliente.cpf_cnpj && (
                                                        <div className="text-xs text-gray-400">{cliente.cpf_cnpj}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{cliente.email}</div>
                                            {cliente.telefone && (
                                                <div className="text-sm text-gray-500">{cliente.telefone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {cliente.cidade && cliente.estado ? `${cliente.cidade}, ${cliente.estado}` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                ${cliente.status === 'ativo' ? 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border border-teal-200' :
                                                    cliente.status === 'suspenso' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                                                        'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'}`}>
                                                {cliente.status === 'ativo' ? '✅ Ativo' :
                                                    cliente.status === 'suspenso' ? '⚠️ Suspenso' : '❌ Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedCliente(cliente)
                                                    setShowForm(true)
                                                }}
                                                className="text-teal-600 hover:text-teal-900 mr-4 transition-colors"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cliente.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                            >
                                                🗑️ Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

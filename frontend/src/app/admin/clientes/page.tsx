'use client'

import { useState, useEffect } from 'react'
import ClienteForm from '@/components/forms/ClienteForm'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    // Fetch clients on component mount
    useEffect(() => {
        fetchClientes()
    }, [])

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Novo Cliente
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mb-6">
                    <ClienteForm
                        onSuccess={handleFormSuccess}
                        clienteToEdit={selectedCliente}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
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
                                <tr key={cliente.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                                                <div className="text-sm text-gray-500">{cliente.cpf_cnpj}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{cliente.email}</div>
                                        <div className="text-sm text-gray-500">{cliente.telefone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {cliente.cidade && cliente.estado ? `${cliente.cidade} - ${cliente.estado}` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${cliente.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                                cliente.status === 'suspenso' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {cliente.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedCliente(cliente)
                                                setShowForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cliente.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

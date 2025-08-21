'use client'

import { useEffect, useState } from 'react'
import ProdutoForm from '@/components/forms/ProdutoForm'
import { supabase } from '@/lib/supabase'

// Supabase client compartilhado via '@/lib/supabase'

interface Produto {
    id: string
    nome: string
    descricao: string
    valor: number
    tipo: 'servico' | 'produto'
    status: 'ativo' | 'inativo'
    periodo_cobranca?: 'mensal' | 'anual' | 'unico'
    created_at: string
}

export default function GestaoProdutosPage() {
    const [showForm, setShowForm] = useState(false)
    const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProdutos = async () => {
        try {
            setLoading(true)
            const { data, error: supabaseError } = await supabase
                .from('produtos')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            setProdutos(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return

        try {
            const { error } = await supabase
                .from('produtos')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchProdutos()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir produto')
        }
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setSelectedProduto(null)
        fetchProdutos()
    }

    useEffect(() => {
        fetchProdutos()
    }, [])

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Produtos</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Novo Produto
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mb-6">
                    <ProdutoForm
                        onSuccess={handleFormSuccess}
                        produtoToEdit={selectedProduto}
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
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Período
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
                            {produtos.map((produto) => (
                                <tr key={produto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                                                <div className="text-sm text-gray-500">{produto.descricao}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${produto.tipo === 'servico' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                                        >
                                            {produto.tipo === 'servico' ? 'Serviço' : 'Produto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(produto.valor)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {produto.periodo_cobranca === 'mensal' ? 'Mensal' :
                                                produto.periodo_cobranca === 'anual' ? 'Anual' : 'Pagamento Único'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${produto.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {produto.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedProduto(produto)
                                                setShowForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(produto.id)}
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

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente, Produto, ServicoContratado } from '@/types'

// Tipos locais alinhados ao schema atual do banco (contratos, clientes, produtos)
interface Contrato {
    id: string
    cliente_id: string
    produto_id: string
    data_inicio: string
    data_fim?: string | null
    valor_contratado: number
    status: 'ativo' | 'cancelado' | 'suspenso' | 'expirado'
    created_at: string
    updated_at: string
    cliente?: Cliente
    produto?: Produto
}

// Supabase client compartilhado via '@/lib/supabase'

export default function ServicosContratadosPage() {
    const [servicos, setServicos] = useState<Contrato[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [showForm, setShowForm] = useState(false)
    const [selectedServico, setSelectedServico] = useState<Contrato | null>(null)

    const fetchServicos = async () => {
        try {
            setLoading(true)
            const { data: servicosData, error: servicosError } = await supabase
                .from('contratos')
                .select(`
          *,
          cliente:clientes(*),
          produto:produtos(*)
        `)
                .order('created_at', { ascending: false })

            if (servicosError) throw servicosError

            setServicos(servicosData || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar serviços')
        } finally {
            setLoading(false)
        }
    }

    const fetchClientesEProdutos = async () => {
        try {
            const [{ data: clientesData }, { data: produtosData }] = await Promise.all([
                supabase.from('clientes').select('*'),
                supabase.from('produtos').select('*')
            ])

            setClientes(clientesData || [])
            setProdutos(produtosData || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        }
    }

    const handleContratarServico = async (
        clienteId: string,
        produtoId: string,
        valorContratado: number
    ) => {
        try {
            const hoje = new Date()
            const dataInicio = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()))
                .toISOString()
                .slice(0, 10) // YYYY-MM-DD

            const { error } = await supabase.from('contratos').insert([
                {
                    cliente_id: clienteId,
                    produto_id: produtoId,
                    valor_contratado: valorContratado,
                    status: 'ativo',
                    data_inicio: dataInicio
                }
            ])

            if (error) throw error

            setShowForm(false)
            fetchServicos()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao contratar serviço')
        }
    }

    const handleCancelarServico = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja cancelar este serviço?')) return

        try {
            const { error } = await supabase
                .from('contratos')
                .update({ status: 'cancelado' })
                .eq('id', id)

            if (error) throw error

            fetchServicos()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao cancelar serviço')
        }
    }

    useEffect(() => {
        fetchServicos()
        fetchClientesEProdutos()
    }, [])

    const calcularProximaCobranca = (servico: Contrato): string => {
        const baseDate = servico.data_inicio ? new Date(servico.data_inicio) : null
        const periodicidade = servico.produto?.periodo_cobranca

        if (!baseDate || !periodicidade || periodicidade === 'unico') {
            return '—'
        }

        const proxima = new Date(baseDate)
        switch (periodicidade) {
            case 'mensal':
                proxima.setMonth(proxima.getMonth() + 1)
                break
            case 'anual':
                proxima.setFullYear(proxima.getFullYear() + 1)
                break
            default:
                return '—'
        }

        return proxima.toLocaleDateString('pt-BR')
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Serviços Contratados</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Contratar Novo Serviço
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mb-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Contratar Novo Serviço</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            const clienteId = formData.get('cliente_id') as string
                            const produtoId = formData.get('produto_id') as string
                            const valor = parseFloat(formData.get('valor') as string)
                            handleContratarServico(clienteId, produtoId, valor)
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cliente</label>
                            <select
                                name="cliente_id"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                            >
                                <option value="">Selecione um cliente</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Produto/Serviço</label>
                            <select
                                name="produto_id"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                            >
                                <option value="">Selecione um produto</option>
                                {produtos.map((produto) => (
                                    <option key={produto.id} value={produto.id}>
                                        {produto.nome} - R$ {produto.valor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor Contratado</label>
                            <input
                                type="number"
                                name="valor"
                                required
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Contratar
                            </button>
                        </div>
                    </form>
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
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produto/Serviço
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Próxima Cobrança
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {servicos.map((servico) => (
                                <tr key={servico.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {servico.cliente?.nome}
                                        </div>
                                        <div className="text-sm text-gray-500">{servico.cliente?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {servico.produto?.nome}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {servico.produto?.tipo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(servico.valor_contratado)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${servico.status === 'ativo'
                                                ? 'bg-green-100 text-green-800'
                                                : servico.status === 'suspenso'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {servico.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {calcularProximaCobranca(servico)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {servico.status === 'ativo' && (
                                            <button
                                                onClick={() => handleCancelarServico(servico.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Cancelar
                                            </button>
                                        )}
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

'use client'

import { useClientes, useProdutos, useServicosContratados } from '@/hooks/useData'
import { formatCurrency } from '@/lib/supabase'

export default function DashboardStats() {
    const { clientes } = useClientes()
    const { produtos } = useProdutos()
    const { servicos } = useServicosContratados()

    const totalClientes = clientes.length
    const clientesAtivos = clientes.filter(c => c.status === 'ativo').length
    const totalProdutos = produtos.length
    const servicosAtivos = servicos.filter(s => s.status === 'ativo').length

    const receitaMensal = servicos
        .filter(s => s.status === 'ativo' && s.produto?.periodo_cobranca === 'mensal')
        .reduce((total, servico) => total + (servico.valor_contratado || 0), 0)

    const stats = [
        {
            name: 'Total de Clientes',
            value: totalClientes,
            description: `${clientesAtivos} ativos`
        },
        {
            name: 'Produtos/Serviços',
            value: totalProdutos,
            description: 'no catálogo'
        },
        {
            name: 'Serviços Ativos',
            value: servicosAtivos,
            description: 'contratações'
        },
        {
            name: 'Receita Mensal',
            value: formatCurrency(receitaMensal),
            description: 'recorrente'
        }
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
                <div
                    key={item.name}
                    className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                >
                    <dt>
                        <div className="absolute bg-blue-500 rounded-md p-3">
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                        <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                            {item.name}
                        </p>
                    </dt>
                    <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                        <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                        <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                            {item.description}
                        </p>
                    </dd>
                </div>
            ))}
        </div>
    )
}

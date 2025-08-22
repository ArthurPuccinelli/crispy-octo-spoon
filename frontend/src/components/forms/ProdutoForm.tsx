'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Supabase client compartilhado via '@/lib/supabase'

interface ProdutoFormProps {
    onSuccess: () => void
    produtoToEdit?: Produto | null
}

interface Produto {
    id?: string
    nome: string
    descricao: string
    preco: number
    tipo_produto: 'servico' | 'produto' | 'assinatura'
    ativo: boolean
    periodicidade?: 'unico' | 'mensal' | 'trimestral' | 'semestral' | 'anual'
}

export default function ProdutoForm({ onSuccess, produtoToEdit }: ProdutoFormProps) {
    const [formData, setFormData] = useState<Produto>(
        produtoToEdit || {
            nome: '',
            descricao: '',
            preco: 0,
            tipo_produto: 'servico',
            ativo: true,
            periodicidade: 'mensal'
        }
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (produtoToEdit?.id) {
                const { error } = await supabase
                    .from('produtos')
                    .update(formData)
                    .eq('id', produtoToEdit.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('produtos')
                    .insert([formData])

                if (error) throw error
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        let value: any = e.target.value

        if (e.target.name === 'preco') {
            value = parseFloat(e.target.value) || 0
        } else if (e.target.name === 'ativo') {
            value = e.target.value === 'true'
        }

        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                    <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Preço</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">R$</span>
                        </div>
                        <input
                            type="number"
                            name="preco"
                            value={formData.preco}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        name="tipo_produto"
                        value={formData.tipo_produto}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="servico">Serviço</option>
                        <option value="produto">Produto</option>
                        <option value="assinatura">Assinatura</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Período de Cobrança</label>
                    <select
                        name="periodicidade"
                        value={formData.periodicidade}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="mensal">Mensal</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                        <option value="unico">Pagamento Único</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="ativo"
                        value={formData.ativo.toString()}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => onSuccess()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : produtoToEdit ? 'Atualizar' : 'Criar'}
                </button>
            </div>
        </form>
    )
}

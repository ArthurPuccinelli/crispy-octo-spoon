'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'

interface ClienteFormProps {
    onSuccess: () => void
    clienteToEdit?: Cliente | null
}

// Tipo para o formulário (sem campos obrigatórios do banco)
type ClienteFormData = Omit<Cliente, 'id' | 'created_at' | 'updated_at'>

export default function ClienteForm({ onSuccess, clienteToEdit }: ClienteFormProps) {
    const [formData, setFormData] = useState<ClienteFormData>(
        clienteToEdit ? {
            nome: clienteToEdit.nome,
            email: clienteToEdit.email || '',
            cpf_cnpj: clienteToEdit.cpf_cnpj,
            telefone: clienteToEdit.telefone || '',
            cidade: clienteToEdit.cidade || '',
            estado: clienteToEdit.estado || '',
            tipo_cliente: clienteToEdit.tipo_cliente,
            status: clienteToEdit.status
        } : {
            nome: '',
            email: '',
            cpf_cnpj: '',
            telefone: '',
            cidade: '',
            estado: '',
            tipo_cliente: 'pessoa_fisica' as const,
            status: 'ativo' as const
        }
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Função para validar CPF/CNPJ
    const validateCPFCNPJ = (value: string): boolean => {
        const cleanValue = value.replace(/\D/g, '')
        return cleanValue.length === 11 || cleanValue.length === 14
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validação do CPF/CNPJ
        if (!validateCPFCNPJ(formData.cpf_cnpj)) {
            setError('CPF/CNPJ deve ter 11 ou 14 dígitos')
            setLoading(false)
            return
        }

        try {
            if (clienteToEdit?.id) {
                // Update existing client
                const { error } = await supabase
                    .from('clientes')
                    .update(formData)
                    .eq('id', clienteToEdit.id)

                if (error) throw error
            } else {
                // Create new client
                const { error } = await supabase
                    .from('clientes')
                    .insert([formData])

                if (error) throw error
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar cliente')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    // Função para formatar CPF/CNPJ
    const formatCPFCNPJ = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        if (cleanValue.length <= 11) {
            // Formato CPF: XXX.XXX.XXX-XX
            return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        } else {
            // Formato CNPJ: XX.XXX.XXX/XXXX-XX
            return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        }
    }

    const handleCPFCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCPFCNPJ(e.target.value)
        setFormData(prev => ({
            ...prev,
            cpf_cnpj: formattedValue
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
                    <input
                        type="text"
                        name="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={handleCPFCNPJChange}
                        placeholder={formData.tipo_cliente === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.tipo_cliente === 'pessoa_fisica' ? 'CPF (11 dígitos)' : 'CNPJ (14 dígitos)'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">Opcional</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <input
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Cliente</label>
                    <select
                        name="tipo_cliente"
                        value={formData.tipo_cliente}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="pessoa_fisica">Pessoa Física</option>
                        <option value="pessoa_juridica">Pessoa Jurídica</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="suspenso">Suspenso</option>
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
                    {loading ? 'Salvando...' : clienteToEdit ? 'Atualizar' : 'Criar'}
                </button>
            </div>
        </form>
    )
}

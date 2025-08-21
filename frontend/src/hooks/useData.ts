'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente, Produto, ServicoContratado } from '@/types'

export const useClientes = () => {
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

    useEffect(() => {
        fetchClientes()
    }, [])

    return { clientes, loading, error, refetch: fetchClientes }
}

export const useProdutos = () => {
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

    useEffect(() => {
        fetchProdutos()
    }, [])

    return { produtos, loading, error, refetch: fetchProdutos }
}

export const useServicosContratados = () => {
    const [servicos, setServicos] = useState<ServicoContratado[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchServicos = async () => {
        try {
            setLoading(true)
            const { data, error: supabaseError } = await supabase
                .from('servicos_contratados')
                .select(`
          *,
          cliente:clientes(*),
          produto:produtos(*)
        `)
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError
            setServicos(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar serviços')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServicos()
    }, [])

    return { servicos, loading, error, refetch: fetchServicos }
}

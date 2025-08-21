'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
    totalClientes: number
    totalProdutos: number
    totalServicos: number
    servicosAtivos: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalClientes: 0,
        totalProdutos: 0,
        totalServicos: 0,
        servicosAtivos: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientes, produtos, servicos] = await Promise.all([
                    supabase.from('clientes').select('*', { count: 'exact' }),
                    supabase.from('produtos').select('*', { count: 'exact' }),
                    supabase.from('contratos').select('*', { count: 'exact' }),
                    supabase.from('contratos').select('*', { count: 'exact' }).eq('status', 'ativo')
                ])

                setStats({
                    totalClientes: clientes.count || 0,
                    totalProdutos: produtos.count || 0,
                    totalServicos: servicos.count || 0,
                    servicosAtivos: servicos.count || 0
                })
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const adminModules = [
        {
            title: '👥 Gestão de Clientes',
            description: 'Cadastre, edite e gerencie todos os clientes do sistema financeiro',
            href: '/admin/clientes',
            color: 'from-blue-500 to-teal-500',
            icon: '👥'
        },
        {
            title: '📦 Gestão de Produtos',
            description: 'Gerencie produtos e serviços financeiros oferecidos pela empresa',
            href: '/admin/produtos',
            color: 'from-teal-500 to-emerald-500',
            icon: '📦'
        },
        {
            title: '📋 Serviços Contratados',
            description: 'Acompanhe contratos e serviços financeiros ativos dos clientes',
            href: '/admin/servicos',
            color: 'from-emerald-500 to-blue-500',
            icon: '📋'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                            <p className="text-gray-600 mt-2">Gerencie todos os aspectos da sua plataforma financeira</p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            ← Voltar ao Início
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500">
                                    <span className="text-2xl text-white">👥</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.totalClientes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500">
                                    <span className="text-2xl text-white">📦</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProdutos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500">
                                    <span className="text-2xl text-white">📋</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.totalServicos}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
                                    <span className="text-2xl text-white">✅</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Serviços Ativos</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.servicosAtivos}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Modules */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminModules.map((module, index) => (
                        <Link
                            key={index}
                            href={module.href}
                            className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <span className="text-2xl text-white">{module.icon}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {module.description}
                                </p>
                                <div className="mt-4 flex items-center text-teal-600 font-medium text-sm">
                                    Acessar módulo
                                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link
                            href="/admin/clientes"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-colors"
                        >
                            <span className="text-2xl mr-3">➕</span>
                            <div>
                                <p className="font-medium text-gray-900">Adicionar Cliente</p>
                                <p className="text-sm text-gray-600">Cadastrar novo cliente</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/produtos"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-colors"
                        >
                            <span className="text-2xl mr-3">➕</span>
                            <div>
                                <p className="font-medium text-gray-900">Adicionar Produto</p>
                                <p className="text-sm text-gray-600">Cadastrar novo produto/serviço financeiro</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/servicos"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-colors"
                        >
                            <span className="text-2xl mr-3">➕</span>
                            <div>
                                <p className="font-medium text-gray-900">Contratar Serviço</p>
                                <p className="text-sm text-gray-600">Vincular cliente a serviço financeiro</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

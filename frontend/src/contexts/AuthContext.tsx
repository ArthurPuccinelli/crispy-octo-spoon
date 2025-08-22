'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Verificar sessão atual
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                console.log('🔍 Sessão atual:', session?.user?.email || 'Nenhuma')
                setUser(session?.user ?? null)
                if (session?.user) {
                    await checkUserRole(session.user)
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error)
                setUser(null)
                setIsAdmin(false)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Escutar mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: any, session: any) => {
                console.log('🔐 Auth state change:', event, session?.user?.email || 'Nenhum usuário')

                // Tratar eventos específicos
                if (event === 'SIGNED_OUT') {
                    console.log('🚪 Usuário fez logout, limpando estado...')
                    setUser(null)
                    setIsAdmin(false)
                    setLoading(false)
                    return
                }

                if (event === 'SIGNED_IN' && session?.user) {
                    console.log('🔑 Usuário fez login:', session.user.email)
                    setUser(session.user)
                    await checkUserRole(session.user)
                    setLoading(false)
                    return
                }

                if (event === 'TOKEN_REFRESHED' && session?.user) {
                    console.log('🔄 Token renovado para:', session.user.email)
                    setUser(session.user)
                    await checkUserRole(session.user)
                    setLoading(false)
                    return
                }

                // Para outros eventos, atualizar estado normalmente
                setUser(session?.user ?? null)
                if (session?.user) {
                    await checkUserRole(session.user)
                } else {
                    setIsAdmin(false)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const checkUserRole = async (user: User) => {
        try {
            console.log('🔍 Verificando role do usuário:', user.email)

            // Verificar se o usuário tem role admin no JWT
            if (user.user_metadata?.role === 'admin') {
                console.log('✅ Usuário é admin (JWT)')
                setIsAdmin(true)
                return
            }

            // Verificar na tabela de usuários se existir
            const { data: profile, error } = await supabase
                .from('usuarios')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error) {
                console.log('⚠️ Tabela usuarios não encontrada, verificando JWT...')
                // Se não houver tabela usuarios, verificar se é o usuário admin padrão
                if (user.email === 'admin@fontara.com') {
                    console.log('✅ Usuário admin padrão detectado')
                    setIsAdmin(true)
                    return
                }
            } else if (profile?.role === 'admin') {
                console.log('✅ Usuário é admin (tabela)')
                setIsAdmin(true)
                return
            }

            console.log('❌ Usuário não é admin')
            setIsAdmin(false)
        } catch (error) {
            console.error('❌ Erro ao verificar role:', error)
            setIsAdmin(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            console.log('🔐 Tentando login:', email)
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                console.error('❌ Erro no login:', error)
            } else {
                console.log('✅ Login bem-sucedido')
            }

            return { error }
        } catch (error) {
            console.error('❌ Erro inesperado no login:', error)
            return { error }
        }
    }

    const signOut = async () => {
        try {
            console.log('🚪 Fazendo logout...')

            // Limpar estado local primeiro
            setUser(null)
            setIsAdmin(false)

            // Fazer logout no Supabase
            const { error } = await supabase.auth.signOut()

            if (error) {
                console.error('❌ Erro no logout do Supabase:', error)
                throw error
            }

            console.log('✅ Logout bem-sucedido')

            // Limpar localStorage manualmente para garantir
            if (typeof window !== 'undefined') {
                localStorage.removeItem('supabase.auth.token')
                localStorage.removeItem('supabase.auth.expires_at')
                localStorage.removeItem('supabase.auth.refresh_token')
            }

            // Redirecionar para home usando window.location para garantir
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }

        } catch (error) {
            console.error('❌ Erro no logout:', error)
            // Mesmo com erro, limpar estado e redirecionar
            setUser(null)
            setIsAdmin(false)
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        }
    }

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAdmin
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

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
                // Sessão atual verificada
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
                // Auth state change detected

                // Tratar eventos específicos
                if (event === 'SIGNED_OUT') {
                    // Usuário fez logout, limpando estado
                    setUser(null)
                    setIsAdmin(false)
                    setLoading(false)
                    return
                }

                if (event === 'SIGNED_IN' && session?.user) {
                    // Usuário fez login
                    setUser(session.user)
                    await checkUserRole(session.user)
                    setLoading(false)
                    return
                }

                if (event === 'TOKEN_REFRESHED' && session?.user) {
                    // Token renovado
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
            // Verificando role do usuário

            // Verificar se o usuário tem role admin no JWT
            if (user.user_metadata?.role === 'admin') {
                // Usuário é admin (JWT)
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
                // Tabela usuarios não encontrada, verificando JWT
                // Se não houver tabela usuarios, verificar se é o usuário admin padrão
                if (user.email === 'admin@fontara.com') {
                    // Usuário admin padrão detectado
                    setIsAdmin(true)
                    return
                }
            } else if (profile?.role === 'admin') {
                // Usuário é admin (tabela)
                setIsAdmin(true)
                return
            }

            // Usuário não é admin
            setIsAdmin(false)
        } catch (error) {
            console.error('❌ Erro ao verificar role:', error)
            setIsAdmin(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            // Tentando login
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                console.error('❌ Erro no login:', error)
            } else {
                // Login bem-sucedido
            }

            return { error }
        } catch (error) {
            console.error('❌ Erro inesperado no login:', error)
            return { error }
        }
    }

    const signOut = async () => {
        try {
            // Fazendo logout

            // Limpar estado local primeiro
            setUser(null)
            setIsAdmin(false)

            // Fazer logout no Supabase
            const { error } = await supabase.auth.signOut()

            if (error) {
                console.error('❌ Erro no logout do Supabase:', error)
                throw error
            }

            // Logout bem-sucedido

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

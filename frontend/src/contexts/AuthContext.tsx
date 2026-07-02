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

// Usuários master da demo — funcionam mesmo sem existirem no Supabase Auth
// (fallback simulado; o site é de demonstração)
const MASTER_USERS: { email: string; password: string }[] = [
    { email: 'admin@fontara.com', password: 'admin123' },
    { email: 'arthurdocusign@gmail.com', password: 'Arthurdocusign1!' },
]

const MASTER_ADMIN_EMAILS = MASTER_USERS.map(u => u.email)

const MASTER_SESSION_KEY = 'fontara_master_session'

function buildMasterUser(email: string): User {
    // Objeto mínimo compatível com o shape de User do Supabase
    return {
        id: `master-${email}`,
        aud: 'authenticated',
        role: 'authenticated',
        email,
        app_metadata: { provider: 'demo' },
        user_metadata: { role: 'admin' },
        created_at: new Date().toISOString(),
    } as unknown as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Verificar sessão atual
        const getSession = async () => {
            try {
                // Sessão master simulada tem prioridade (sobrevive a refresh via sessionStorage)
                const masterEmail = typeof window !== 'undefined' ? sessionStorage.getItem(MASTER_SESSION_KEY) : null
                if (masterEmail && MASTER_ADMIN_EMAILS.includes(masterEmail)) {
                    setUser(buildMasterUser(masterEmail))
                    setIsAdmin(true)
                    setLoading(false)
                    return
                }

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

            // Usuários master são sempre admin
            if (user.email && MASTER_ADMIN_EMAILS.includes(user.email)) {
                setIsAdmin(true)
                return
            }

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
                // Se não houver tabela usuarios, verificar se é um dos usuários master
                if (user.email && MASTER_ADMIN_EMAILS.includes(user.email)) {
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
        const normalizedEmail = email.trim().toLowerCase()
        try {
            // Tentando login via Supabase Auth
            const { error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password
            })

            if (!error) {
                return { error: null }
            }

            // Fallback: usuários master simulados (site de demonstração)
            const master = MASTER_USERS.find(u => u.email === normalizedEmail && u.password === password)
            if (master) {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(MASTER_SESSION_KEY, master.email)
                }
                setUser(buildMasterUser(master.email))
                setIsAdmin(true)
                setLoading(false)
                return { error: null }
            }

            console.error('❌ Erro no login:', error)
            return { error }
        } catch (error) {
            // Supabase indisponível — ainda permite login master
            const master = MASTER_USERS.find(u => u.email === normalizedEmail && u.password === password)
            if (master) {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(MASTER_SESSION_KEY, master.email)
                }
                setUser(buildMasterUser(master.email))
                setIsAdmin(true)
                setLoading(false)
                return { error: null }
            }
            console.error('❌ Erro inesperado no login:', error)
            return { error }
        }
    }

    const signOut = async () => {
        try {
            // Fazendo logout

            // Limpar sessão master simulada
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem(MASTER_SESSION_KEY)
            }

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

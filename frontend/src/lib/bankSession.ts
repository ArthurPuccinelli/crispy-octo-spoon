// Sessão simulada da área do cliente (internet banking de demonstração).
// Qualquer usuário/senha é aceito — os dados vivem apenas no navegador.
// O perfil (nome, CPF, celular) é persistido por e-mail e reaproveitado
// em logins futuros; ele alimenta as contratações digitais (ex.: Maestro).

export interface BankSession {
    name: string
    email: string
    loginAt: string
    cpf?: string
    phone?: string
}

export interface ClientProfile {
    name?: string
    cpf?: string
    phone?: string
}

const BANK_SESSION_KEY = 'fontara_client_session'
const PROFILES_KEY = 'fontara_client_profiles'

export function getBankSession(): BankSession | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(BANK_SESSION_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as BankSession
        return parsed?.email ? parsed : null
    } catch {
        return null
    }
}

export function createBankSession(email: string, name?: string): BankSession {
    const normalizedEmail = email.trim().toLowerCase()
    const profile = getProfile(normalizedEmail)
    const displayName = profile?.name || name?.trim() || deriveNameFromEmail(normalizedEmail)
    const session: BankSession = {
        name: displayName,
        email: normalizedEmail,
        loginAt: new Date().toISOString(),
        cpf: profile?.cpf,
        phone: profile?.phone,
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(BANK_SESSION_KEY, JSON.stringify(session))
    }
    return session
}

/**
 * Atualiza a sessão ativa e grava o perfil por e-mail (reaproveitado em
 * logins futuros). Se o e-mail mudar, o perfil é re-chaveado.
 */
export function updateBankSession(partial: Partial<Pick<BankSession, 'name' | 'email' | 'cpf' | 'phone'>>): BankSession | null {
    const current = getBankSession()
    if (!current) return null

    const newEmail = (partial.email ?? current.email).trim().toLowerCase()
    const session: BankSession = {
        ...current,
        ...partial,
        email: newEmail,
        name: (partial.name ?? current.name).trim() || deriveNameFromEmail(newEmail),
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem(BANK_SESSION_KEY, JSON.stringify(session))
        const profiles = readProfiles()
        if (newEmail !== current.email) delete profiles[current.email]
        profiles[newEmail] = { name: session.name, cpf: session.cpf, phone: session.phone }
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    }
    return session
}

export function getProfile(email: string): ClientProfile | null {
    const profiles = readProfiles()
    return profiles[email.trim().toLowerCase()] || null
}

function readProfiles(): Record<string, ClientProfile> {
    if (typeof window === 'undefined') return {}
    try {
        return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}') as Record<string, ClientProfile>
    } catch {
        return {}
    }
}

export function clearBankSession() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(BANK_SESSION_KEY)
    }
}

function deriveNameFromEmail(email: string): string {
    const prefix = email.split('@')[0] || 'Cliente'
    return prefix
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Cliente'
}

/** Primeiro nome para saudações */
export function firstName(session: BankSession | null): string {
    return session?.name?.split(' ')[0] || 'Cliente'
}

// Sessão simulada da área do cliente (internet banking de demonstração).
// Qualquer usuário/senha é aceito — os dados vivem apenas no navegador.

export interface BankSession {
    name: string
    email: string
    loginAt: string
}

const BANK_SESSION_KEY = 'fontara_client_session'

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
    const displayName = name?.trim() || deriveNameFromEmail(email)
    const session: BankSession = {
        name: displayName,
        email: email.trim().toLowerCase(),
        loginAt: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(BANK_SESSION_KEY, JSON.stringify(session))
    }
    return session
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

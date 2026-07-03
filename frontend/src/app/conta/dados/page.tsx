'use client'

// Meus dados — perfil do cliente usado nas contratações digitais.
// Salvo por e-mail no navegador e reaproveitado em logins futuros.

import { useEffect, useState } from 'react'
import { BankSession, getBankSession, updateBankSession } from '@/lib/bankSession'

function maskCpf(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function maskPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{4})$/, '$1-$2')
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2')
}

export default function DadosPage() {
    const [session, setSession] = useState<BankSession | null>(null)
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [cpf, setCpf] = useState('')
    const [phone, setPhone] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const s = getBankSession()
        setSession(s)
        if (s) {
            setNome(s.name)
            setEmail(s.email)
            setCpf(s.cpf || '')
            setPhone(s.phone || '')
        }
    }, [])

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSaved(false)

        if (!nome.trim()) {
            setError('Informe seu nome completo.')
            return
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
            setError('Informe um e-mail válido.')
            return
        }
        const updated = updateBankSession({
            name: nome,
            email,
            cpf: cpf.trim() || undefined,
            phone: phone.trim() || undefined,
        })
        setSession(updated)
        setSaved(true)
        setTimeout(() => setSaved(false), 5000)
    }

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Meus dados</h1>
                <p className="text-slate-500 text-sm">
                    Suas informações pessoais — usadas para preencher automaticamente suas contratações digitais.
                </p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 animate-fade-in-up">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                    <input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1.5">CPF</label>
                        <input
                            id="cpf"
                            type="text"
                            inputMode="numeric"
                            value={cpf}
                            onChange={e => setCpf(maskCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Celular</label>
                        <input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={e => setPhone(maskPhone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}
                {saved && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                        ✓ Dados salvos — eles preenchem automaticamente suas próximas contratações digitais.
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-slate-400 text-xs max-w-xs">
                        Os dados ficam salvos neste navegador e são reaproveitados quando você entrar de novo com o mesmo e-mail.
                    </p>
                    <button
                        type="submit"
                        className="flex-shrink-0 px-8 py-3 brand-gradient text-white font-bold rounded-xl brand-glow hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                    >
                        Salvar dados
                    </button>
                </div>
            </form>
        </div>
    )
}

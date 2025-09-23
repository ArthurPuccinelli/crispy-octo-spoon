'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function MaestroConsentCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code')
                const error = searchParams.get('error')

                if (error) {
                    setStatus('error')
                    setMessage(`Erro de consentimento: ${error}`)
                    return
                }

                if (!code) {
                    setStatus('error')
                    setMessage('Código de autorização não encontrado')
                    return
                }

                // Here you would typically exchange the code for tokens
                // For now, we'll just show success and redirect back
                setStatus('success')
                setMessage('Consentimento concedido com sucesso! Redirecionando...')

                // Redirect back to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/'
                }, 2000)

            } catch (error: any) {
                setStatus('error')
                setMessage(`Erro: ${error.message}`)
            }
        }

        handleCallback()
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md mx-4">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Processando Consentimento</h2>
                            <p className="text-white/70">Aguarde enquanto processamos sua autorização...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Sucesso!</h2>
                            <p className="text-white/70">{message}</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Erro</h2>
                            <p className="text-white/70 mb-6">{message}</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                            >
                                Voltar ao Início
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

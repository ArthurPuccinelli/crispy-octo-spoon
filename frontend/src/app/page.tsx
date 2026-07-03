'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePixSigningDemo } from '@/components/docusign/PixSigningDemo'
import { useMaestroDemo } from '@/components/docusign/MaestroDemo'
import { useCartaoClickToAgree } from '@/components/docusign/CartaoClickToAgree'
import { useAdvancedSignatureDemo } from '@/components/docusign/AdvancedSignatureDemo'

const CHECK_ICON = (
  <svg className="w-4 h-4 mr-2 text-brand-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pix = usePixSigningDemo()
  const maestro = useMaestroDemo()
  const cartao = useCartaoClickToAgree()
  const advanced = useAdvancedSignatureDemo()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Fundo: mesh da marca + orbes animados */}
      <div className="fixed inset-0 brand-mesh pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-brand-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <Link href="/">
                <Image
                  src="/logo-fontara-final.svg"
                  alt="Fontara Financial"
                  width={200}
                  height={50}
                  className="h-9 w-auto"
                />
              </Link>
            </div>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#produtos" className="text-white/70 hover:text-white transition-all duration-300 text-sm">Produtos</a>
              <a href="#vantagens" className="text-white/70 hover:text-white transition-all duration-300 text-sm">Vantagens</a>
              <a href="#digital" className="text-white/70 hover:text-white transition-all duration-300 text-sm">Assinatura Digital</a>
              <Link
                href="/entrar"
                className="px-4 py-2 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 hover:border-brand/60 transition-all duration-300 text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/entrar"
                className="px-4 py-2 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-300 brand-glow text-sm"
              >
                Abra sua conta
              </Link>
            </nav>
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile nav panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-surface/90 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              <a href="#produtos" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10">Produtos</a>
              <a href="#vantagens" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10">Vantagens</a>
              <a href="#digital" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10">Assinatura Digital</a>
              <Link href="/entrar" className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10">Entrar</Link>
              <Link href="/entrar" className="block w-full mt-2 px-4 py-2 brand-gradient text-white text-center font-semibold rounded-lg">
                Abra sua conta
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* ============ HERO ============ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <div className={`transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand/30 text-brand-accent text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                Novo: contratação 100% digital, sem papelada
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">Seu dinheiro,</span>
                <br />
                <span className="gradient-text">sem fricção.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                Conta digital completa, cartão sem anuidade, Pix ilimitado e crédito na hora —
                tudo com contratação assinada digitalmente em segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/entrar"
                  className="px-8 py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-center"
                >
                  Acessar minha conta
                </Link>
                <a
                  href="#produtos"
                  className="px-8 py-4 border border-white/15 text-white font-semibold rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all duration-300 text-center"
                >
                  Conhecer produtos
                </a>
              </div>
              {/* Social proof */}
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <p className="text-2xl font-bold text-white">4,2M+</p>
                  <p className="text-xs text-white/40">clientes ativos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">R$ 18bi</p>
                  <p className="text-xs text-white/40">transacionados/ano</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">99,99%</p>
                  <p className="text-xs text-white/40">disponibilidade</p>
                </div>
              </div>
            </div>

            {/* Cartão 3D + widgets flutuantes */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative mx-auto w-[420px] h-[420px]">
                {/* Cartão */}
                <div className="absolute top-16 left-6 w-80 h-48 bank-card rounded-3xl p-6 animate-card-tilt z-20">
                  <div className="flex justify-between items-start">
                    <span className="text-white/90 font-bold tracking-widest text-sm">FONTARA</span>
                    <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeWidth={2} d="M8.5 14.5A5.5 5.5 0 0112 9.6a5.5 5.5 0 013.5 4.9M5.6 17a9 9 0 0112.8 0M2.8 19.5a13 13 0 0118.4 0" transform="rotate(90 12 12)" />
                    </svg>
                  </div>
                  <div className="bank-card-chip w-11 h-8 rounded-md mt-4" />
                  <p className="text-white/90 font-mono tracking-[0.2em] mt-3 text-lg">•••• 4829</p>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-white/70 text-xs uppercase">Cliente Demo</p>
                    <p className="text-white/70 text-xs">12/29</p>
                  </div>
                </div>
                {/* Widget Pix */}
                <div className="absolute top-0 right-0 glass-dark border border-white/10 rounded-2xl px-5 py-4 animate-float z-30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Pix recebido</p>
                      <p className="text-brand-accent text-xs font-bold">+ R$ 1.250,00</p>
                    </div>
                  </div>
                </div>
                {/* Widget assinatura */}
                <div className="absolute bottom-6 right-8 glass-dark border border-white/10 rounded-2xl px-5 py-4 animate-float z-30" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Contrato assinado</p>
                      <p className="text-white/40 text-xs">assinado digitalmente · agora</p>
                    </div>
                  </div>
                </div>
                {/* Widget saldo */}
                <div className="absolute bottom-24 -left-4 glass-dark border border-white/10 rounded-2xl px-5 py-4 animate-float z-10" style={{ animationDelay: '0.8s' }}>
                  <p className="text-white/40 text-xs mb-1">Saldo disponível</p>
                  <p className="text-white text-xl font-bold">R$ 12.847,32</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRODUTOS ============ */}
        <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Tudo que um banco tem.
              <span className="gradient-text"> Sem ser um banco chato.</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Contrate qualquer produto em minutos, do primeiro clique à assinatura — tudo online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Conta Digital */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Conta Digital</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Abra sua conta em minutos, sem burocracia. Transfira, pague e invista com segurança.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Sem anuidade</div>
                  <div className="flex items-center">{CHECK_ICON}TED gratuita</div>
                  <div className="flex items-center">{CHECK_ICON}Cartão sem taxa</div>
                </div>
                <Link href="/entrar" className="block w-full px-6 py-3 brand-gradient text-white text-center font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300">
                  Abra sua conta
                </Link>
              </div>
            </div>

            {/* Empréstimos — Maestro */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Empréstimos</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Crédito pessoal com as melhores taxas. Jornada de contratação 100% digital, do pedido à assinatura.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Até R$ 50.000</div>
                  <div className="flex items-center">{CHECK_ICON}Aprovação em 24h</div>
                  <div className="flex items-center">{CHECK_ICON}Contratação guiada</div>
                </div>
                <button onClick={maestro.startLoanFlow} disabled={maestro.starting} className="w-full px-6 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  {maestro.starting ? 'Iniciando...' : 'Contrate agora'}
                </button>
              </div>
            </div>

            {/* Cartão de Crédito — Click to Agree */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Cartão de Crédito</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Sem anuidade, com cashback. Adesão com um clique, direto no site.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Sem anuidade</div>
                  <div className="flex items-center">{CHECK_ICON}1% de cashback</div>
                  <div className="flex items-center">{CHECK_ICON}Adesão em 1 clique</div>
                </div>
                <button onClick={cartao.openCartaoModal} className="w-full px-6 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300">
                  Solicitar Cartão
                </button>
              </div>
            </div>

            {/* PIX — Envelope embed */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">PIX</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Transferências instantâneas 24/7. Termo de adesão com assinatura embutida no site.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Instantâneo</div>
                  <div className="flex items-center">{CHECK_ICON}Gratuito e ilimitado</div>
                  <div className="flex items-center">{CHECK_ICON}Adesão assinada no site</div>
                </div>
                <button onClick={pix.startPixDemo} disabled={pix.creating} className="w-full px-6 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  {pix.creating ? 'Preparando adesão...' : 'Ativar Pix'}
                </button>
              </div>
            </div>

            {/* Investimentos */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Investimentos</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Fundos, ações e títulos com a menor taxa do mercado. Comece com R$ 1,00.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Corretagem zero</div>
                  <div className="flex items-center">{CHECK_ICON}A partir de R$ 1,00</div>
                  <div className="flex items-center">{CHECK_ICON}Análise com IA</div>
                </div>
                <Link href="/entrar" className="block w-full px-6 py-3 border border-white/15 text-white text-center font-semibold rounded-xl hover:bg-white/5 hover:border-brand/50 transition-all duration-300">
                  Conheça Mais
                </Link>
              </div>
            </div>

            {/* Assinatura Avançada */}
            <div className="group relative glass-dark rounded-3xl p-8 border border-white/10 hover:border-brand/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 brand-gradient-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 brand-chip rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Assinatura Avançada</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Assinatura eletrônica avançada com OTP por CPF, entrega por WhatsApp ou SMS.
                </p>
                <div className="space-y-2 mb-6 text-sm text-white/50">
                  <div className="flex items-center">{CHECK_ICON}Validade jurídica</div>
                  <div className="flex items-center">{CHECK_ICON}WhatsApp e SMS</div>
                  <div className="flex items-center">{CHECK_ICON}Trilha de auditoria</div>
                </div>
                <button onClick={advanced.openAdvancedSignature} className="w-full px-6 py-3 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-300">
                  Experimentar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ VANTAGENS ============ */}
        <section id="vantagens" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group glass-dark rounded-2xl p-6 border border-white/10 hover:border-brand/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="w-14 h-14 brand-chip rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Segurança Bancária</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Criptografia de nível bancário e conformidade com regulamentações financeiras.
              </p>
            </div>
            <div className="group glass-dark rounded-2xl p-6 border border-white/10 hover:border-brand/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="w-14 h-14 brand-chip rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tecnologia Avançada</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Plataforma moderna com inteligência artificial e análise de dados em tempo real.
              </p>
            </div>
            <div className="group glass-dark rounded-2xl p-6 border border-white/10 hover:border-brand/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="w-14 h-14 brand-chip rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Suporte 24/7</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Atendimento especializado disponível 24 horas por dia, 7 dias por semana.
              </p>
            </div>
          </div>
        </section>

        {/* ============ CONTRATAÇÃO DIGITAL ============ */}
        <section id="digital" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative glass-dark border border-white/10 rounded-3xl p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 brand-gradient-soft" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-brand-accent text-sm font-bold uppercase tracking-widest mb-3">Assinatura digital</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Do primeiro clique à assinatura, sem sair daqui
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Abra conta, contrate crédito, peça seu cartão e assine qualquer contrato
                  com validade jurídica — direto no site ou no app, em segundos, com
                  verificação de identidade e trilha de auditoria completa.
                </p>
                <Link
                  href="/entrar"
                  className="inline-block px-8 py-4 brand-gradient text-white font-bold rounded-2xl brand-glow hover:opacity-90 hover:scale-[1.03] transition-all duration-300"
                >
                  Acessar minha conta →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Assinatura no site', desc: 'Assine contratos sem sair da página, em poucos cliques', action: pix.startPixDemo },
                  { title: 'Contratação guiada', desc: 'Jornada de crédito completa, do pedido à assinatura', action: maestro.startLoanFlow },
                  { title: 'Adesão em 1 clique', desc: 'Aceite termos e produtos com um único clique', action: cartao.openCartaoModal },
                  { title: 'Assinatura Avançada', desc: 'OTP por CPF + entrega WhatsApp/SMS', action: advanced.openAdvancedSignature },
                ].map((demo) => (
                  <button
                    key={demo.title}
                    onClick={demo.action}
                    className="text-left glass rounded-2xl p-5 border border-white/10 hover:border-brand/50 hover:scale-[1.03] transition-all duration-300"
                  >
                    <p className="text-white font-semibold text-sm mb-1">{demo.title}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{demo.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo-fontara-final.svg"
                alt="Fontara Financial"
                width={200}
                height={50}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/50 mb-8 max-w-2xl mx-auto text-sm">
              Transformando o futuro das finanças com tecnologia inovadora e segurança incomparável.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-white/50">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <Link href="/entrar" className="hover:text-white transition-colors">Minha Conta</Link>
              <Link href="/clientes" className="hover:text-white transition-colors">Clientes</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Administração</Link>
            </div>
            <p className="text-white/20 text-xs mt-8">
              © 2026 Fontara Financial S.A. · Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>

      {/* Modais das demos */}
      {cartao.modal}
      {pix.modal}
      {maestro.modal}
      {advanced.modal}
    </div>
  )
}

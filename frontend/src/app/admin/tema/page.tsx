'use client'

// Admin › Tema do site — troca as cores predominantes do portal para
// alinhar com a identidade visual do cliente da demo.

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { THEME_PRESETS, ThemeColors } from '@/lib/themes'

export default function TemaPage() {
    const { colors, activePresetId, setPreset, setCustomColors, savedGlobally } = useTheme()
    const [custom, setCustom] = useState<ThemeColors>(colors)
    const [saving, setSaving] = useState(false)
    const [savedMsg, setSavedMsg] = useState<string | null>(null)

    const notifySaved = () => {
        setSavedMsg(savedGlobally
            ? 'Tema salvo — aplicado para todos os visitantes.'
            : 'Tema aplicado neste navegador. (Para persistência global, crie a tabela site_settings no Supabase — veja supabase/migrations.)')
        setTimeout(() => setSavedMsg(null), 6000)
    }

    const handlePreset = async (presetId: string) => {
        const preset = THEME_PRESETS.find(p => p.id === presetId)
        if (!preset) return
        setSaving(true)
        await setPreset(preset)
        setCustom(preset.colors)
        setSaving(false)
        notifySaved()
    }

    const handleCustomApply = async () => {
        setSaving(true)
        await setCustomColors(custom)
        setSaving(false)
        notifySaved()
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Tema do site</h1>
                <p className="text-white/60 text-sm max-w-2xl">
                    Ajuste as cores predominantes do portal para a identidade visual do cliente da demonstração.
                    A mudança vale para todo o site: landing, área do cliente, administração e modais de assinatura.
                </p>
            </div>

            {savedMsg && (
                <div className="glass border border-brand/40 text-white rounded-xl px-4 py-3 text-sm animate-fade-in">
                    ✓ {savedMsg}
                </div>
            )}

            {/* Presets */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4">Temas prontos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEME_PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => handlePreset(preset.id)}
                            disabled={saving}
                            className={`text-left glass-dark rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.03] disabled:opacity-60 ${activePresetId === preset.id
                                ? 'border-white/60 ring-2 ring-white/30'
                                : 'border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="flex gap-2 mb-3">
                                <span className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: preset.colors.primary }} />
                                <span className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: preset.colors.secondary }} />
                                <span className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: preset.colors.accent }} />
                                <span className="w-8 h-8 rounded-lg shadow-lg border border-white/20" style={{ backgroundColor: preset.colors.surface }} />
                            </div>
                            <p className="text-white font-semibold text-sm">{preset.name}</p>
                            <p className="text-white/40 text-xs">{preset.description}</p>
                            {activePresetId === preset.id && (
                                <p className="text-brand-accent text-xs font-bold mt-2">✓ Ativo</p>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Cores customizadas */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4">Cores personalizadas</h2>
                <div className="glass-dark rounded-2xl border border-white/10 p-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {([
                            { key: 'primary', label: 'Cor principal', hint: 'Botões, links e destaques' },
                            { key: 'secondary', label: 'Cor secundária', hint: 'Par do gradiente da marca' },
                            { key: 'accent', label: 'Cor de acento', hint: 'Badges, ícones e detalhes' },
                            { key: 'surface', label: 'Cor de fundo', hint: 'Painéis escuros — hero, sidebar e banners. Prefira tons escuros' },
                        ] as const).map(({ key, label, hint }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={custom[key]}
                                        onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))}
                                        className="w-12 h-12 rounded-xl border-0 cursor-pointer bg-transparent"
                                        style={{ backgroundColor: 'transparent' }}
                                    />
                                    <input
                                        type="text"
                                        value={custom[key]}
                                        onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))}
                                        className="w-28 px-3 py-2 rounded-lg text-sm font-mono"
                                        maxLength={7}
                                    />
                                </div>
                                <p className="text-white/30 text-xs mt-2">{hint}</p>
                            </div>
                        ))}
                    </div>

                    {/* Preview ao vivo */}
                    <div className="rounded-2xl border border-white/10 p-6 mb-6" style={{
                        background: `linear-gradient(135deg, ${custom.primary}22, ${custom.secondary}22), ${custom.surface}`,
                    }}>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Pré-visualização</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${custom.primary}, ${custom.secondary})` }}
                            >
                                Botão principal
                            </button>
                            <span
                                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: custom.accent }}
                            >
                                Badge de acento
                            </span>
                            <span
                                className="text-xl font-bold"
                                style={{
                                    background: `linear-gradient(135deg, ${custom.primary}, ${custom.secondary}, ${custom.accent})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Texto em gradiente
                            </span>
                            <div
                                className="w-24 h-14 rounded-xl shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${custom.primary}, ${custom.secondary} 60%, ${custom.accent} 130%)` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCustomApply}
                        disabled={saving}
                        className="px-8 py-3 brand-gradient text-white font-bold rounded-xl brand-glow hover:opacity-90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60"
                    >
                        {saving ? 'Aplicando...' : 'Aplicar cores personalizadas'}
                    </button>
                </div>
            </section>
        </div>
    )
}

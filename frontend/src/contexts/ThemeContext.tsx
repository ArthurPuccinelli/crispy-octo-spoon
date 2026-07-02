'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Theme,
    ThemeColors,
    DEFAULT_THEME,
    THEME_PRESETS,
    THEME_STORAGE_KEY,
    applyTheme,
} from '@/lib/themes'

interface ThemeContextType {
    /** Cores atualmente aplicadas */
    colors: ThemeColors
    /** Id do preset ativo ('custom' quando cores livres) */
    activePresetId: string
    /** Aplica e persiste um preset */
    setPreset: (theme: Theme) => Promise<void>
    /** Aplica e persiste cores customizadas */
    setCustomColors: (colors: ThemeColors) => Promise<void>
    /** true enquanto carrega o tema salvo */
    loading: boolean
    /** true se a última gravação foi persistida no Supabase (global); false = só localStorage */
    savedGlobally: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface StoredTheme {
    presetId: string
    colors: ThemeColors
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME.colors)
    const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_THEME.id)
    const [loading, setLoading] = useState(true)
    const [savedGlobally, setSavedGlobally] = useState(false)

    // Carrega: localStorage primeiro (instantâneo, evita flash), depois Supabase (fonte global)
    useEffect(() => {
        const local = readLocal()
        if (local) {
            setColors(local.colors)
            setActivePresetId(local.presetId)
            applyTheme(local.colors)
        } else {
            applyTheme(DEFAULT_THEME.colors)
        }

        const loadRemote = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'theme')
                    .single()
                if (!error && data?.value) {
                    const stored = data.value as StoredTheme
                    if (stored?.colors?.primary) {
                        setColors(stored.colors)
                        setActivePresetId(stored.presetId || 'custom')
                        applyTheme(stored.colors)
                        writeLocal(stored)
                        setSavedGlobally(true)
                    }
                }
            } catch {
                // Tabela site_settings pode não existir — segue com localStorage
            } finally {
                setLoading(false)
            }
        }
        loadRemote()
    }, [])

    const persist = useCallback(async (stored: StoredTheme) => {
        writeLocal(stored)
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({ key: 'theme', value: stored, updated_at: new Date().toISOString() }, { onConflict: 'key' })
            setSavedGlobally(!error)
        } catch {
            setSavedGlobally(false)
        }
    }, [])

    const setPreset = useCallback(async (theme: Theme) => {
        setColors(theme.colors)
        setActivePresetId(theme.id)
        applyTheme(theme.colors)
        await persist({ presetId: theme.id, colors: theme.colors })
    }, [persist])

    const setCustomColors = useCallback(async (custom: ThemeColors) => {
        setColors(custom)
        setActivePresetId('custom')
        applyTheme(custom)
        await persist({ presetId: 'custom', colors: custom })
    }, [persist])

    return (
        <ThemeContext.Provider value={{ colors, activePresetId, setPreset, setCustomColors, loading, savedGlobally }}>
            {children}
        </ThemeContext.Provider>
    )
}

function readLocal(): StoredTheme | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as StoredTheme
        return parsed?.colors?.primary ? parsed : null
    } catch {
        return null
    }
}

function writeLocal(stored: StoredTheme) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(stored))
    } catch {
        // storage cheio/bloqueado — ignora
    }
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export { THEME_PRESETS }

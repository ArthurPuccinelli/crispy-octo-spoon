// Sistema de temas do site — cores predominantes configuráveis pelo admin.
// As cores são aplicadas como CSS variables (RGB triplet) para funcionar com
// as utilities `brand-*` do Tailwind (com suporte a alpha).

export interface ThemeColors {
    /** Cor principal da marca (botões, links, destaques) */
    primary: string
    /** Segunda cor do gradiente da marca */
    secondary: string
    /** Cor de acento (badges, detalhes, glow) */
    accent: string
}

export interface Theme {
    id: string
    name: string
    description: string
    colors: ThemeColors
}

/** Converte #rrggbb em "r g b" (triplet usado nas CSS variables) */
export function hexToRgbTriplet(hex: string): string {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
    const num = parseInt(full, 16)
    if (isNaN(num) || full.length !== 6) return '20 184 166' // fallback teal
    return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`
}

/** Aplica o tema no documento via CSS variables */
export function applyTheme(colors: ThemeColors) {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--brand-primary', hexToRgbTriplet(colors.primary))
    root.style.setProperty('--brand-secondary', hexToRgbTriplet(colors.secondary))
    root.style.setProperty('--brand-accent', hexToRgbTriplet(colors.accent))
    root.style.setProperty('--brand-primary-hex', colors.primary)
    root.style.setProperty('--brand-secondary-hex', colors.secondary)
    root.style.setProperty('--brand-accent-hex', colors.accent)
}

/** Presets prontos — id visual de marcas comuns em demos */
export const THEME_PRESETS: Theme[] = [
    {
        id: 'fontara',
        name: 'Fontara',
        description: 'Tema padrão — teal & cyan',
        colors: { primary: '#14b8a6', secondary: '#06b6d4', accent: '#34d399' },
    },
    {
        id: 'roxo',
        name: 'Roxo Fintech',
        description: 'Estilo Nubank',
        colors: { primary: '#820ad1', secondary: '#a855f7', accent: '#e879f9' },
    },
    {
        id: 'laranja',
        name: 'Laranja Vibrante',
        description: 'Estilo Itaú / Inter',
        colors: { primary: '#ec7000', secondary: '#f97316', accent: '#fbbf24' },
    },
    {
        id: 'vermelho',
        name: 'Vermelho Clássico',
        description: 'Estilo Bradesco / Santander',
        colors: { primary: '#cc092f', secondary: '#ef4444', accent: '#f87171' },
    },
    {
        id: 'azul',
        name: 'Azul Corporativo',
        description: 'Estilo Caixa / BB',
        colors: { primary: '#1d4ed8', secondary: '#3b82f6', accent: '#60a5fa' },
    },
    {
        id: 'dourado',
        name: 'Preto & Dourado',
        description: 'Estilo XP / private',
        colors: { primary: '#b45309', secondary: '#f59e0b', accent: '#fcd34d' },
    },
    {
        id: 'verde',
        name: 'Verde Natureza',
        description: 'Estilo Sicredi / Stone',
        colors: { primary: '#15803d', secondary: '#22c55e', accent: '#86efac' },
    },
    {
        id: 'rosa',
        name: 'Rosa Moderno',
        description: 'Estilo C6 Mel / Will',
        colors: { primary: '#db2777', secondary: '#ec4899', accent: '#f9a8d4' },
    },
]

export const DEFAULT_THEME = THEME_PRESETS[0]

export const THEME_STORAGE_KEY = 'fontara_theme'

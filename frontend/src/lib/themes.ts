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
    /** Cor de fundo dos painéis escuros (hero, sidebar, banners) */
    surface: string
}

/** Fundo padrão — grafite azulado, mais suave que preto puro */
export const DEFAULT_SURFACE = '#101c2c'

/** Completa temas salvos antes da cor de fundo existir */
export function normalizeColors(colors: Partial<ThemeColors> | null | undefined): ThemeColors {
    return {
        primary: colors?.primary || DEFAULT_THEME.colors.primary,
        secondary: colors?.secondary || DEFAULT_THEME.colors.secondary,
        accent: colors?.accent || DEFAULT_THEME.colors.accent,
        surface: colors?.surface || DEFAULT_SURFACE,
    }
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

/** Clareia um triplet "r g b" somando `amount` a cada canal */
function lightenTriplet(triplet: string, amount: number): string {
    return triplet
        .split(' ')
        .map(c => Math.min(255, parseInt(c, 10) + amount))
        .join(' ')
}

/** Aplica o tema no documento via CSS variables */
export function applyTheme(partial: ThemeColors | Partial<ThemeColors>) {
    if (typeof document === 'undefined') return
    const colors = normalizeColors(partial)
    const root = document.documentElement
    root.style.setProperty('--brand-primary', hexToRgbTriplet(colors.primary))
    root.style.setProperty('--brand-secondary', hexToRgbTriplet(colors.secondary))
    root.style.setProperty('--brand-accent', hexToRgbTriplet(colors.accent))
    root.style.setProperty('--brand-primary-hex', colors.primary)
    root.style.setProperty('--brand-secondary-hex', colors.secondary)
    root.style.setProperty('--brand-accent-hex', colors.accent)

    const surface = hexToRgbTriplet(colors.surface)
    root.style.setProperty('--surface', surface)
    root.style.setProperty('--surface-hex', colors.surface)
    // Variante levemente mais clara para camadas sobrepostas (cards, headers)
    root.style.setProperty('--surface-raised', lightenTriplet(surface, 14))
}

/** Presets prontos — id visual de marcas comuns em demos */
export const THEME_PRESETS: Theme[] = [
    {
        id: 'fontara',
        name: 'Fontara',
        description: 'Tema padrão — teal & cyan',
        colors: { primary: '#14b8a6', secondary: '#06b6d4', accent: '#34d399', surface: '#101c2c' },
    },
    {
        id: 'roxo',
        name: 'Roxo Fintech',
        description: 'Estilo Nubank',
        colors: { primary: '#820ad1', secondary: '#a855f7', accent: '#e879f9', surface: '#171026' },
    },
    {
        id: 'laranja',
        name: 'Laranja Vibrante',
        description: 'Estilo Itaú / Inter',
        colors: { primary: '#ec7000', secondary: '#f97316', accent: '#fbbf24', surface: '#1d1510' },
    },
    {
        id: 'vermelho',
        name: 'Vermelho Clássico',
        description: 'Estilo Bradesco / Santander',
        colors: { primary: '#cc092f', secondary: '#ef4444', accent: '#f87171', surface: '#1d1014' },
    },
    {
        id: 'azul',
        name: 'Azul Corporativo',
        description: 'Estilo Caixa / BB',
        colors: { primary: '#1d4ed8', secondary: '#3b82f6', accent: '#60a5fa', surface: '#0e1626' },
    },
    {
        id: 'dourado',
        name: 'Preto & Dourado',
        description: 'Estilo XP / private',
        colors: { primary: '#b45309', secondary: '#f59e0b', accent: '#fcd34d', surface: '#1a1510' },
    },
    {
        id: 'verde',
        name: 'Verde Natureza',
        description: 'Estilo Sicredi / Stone',
        colors: { primary: '#15803d', secondary: '#22c55e', accent: '#86efac', surface: '#0f1a15' },
    },
    {
        id: 'rosa',
        name: 'Rosa Moderno',
        description: 'Estilo C6 Mel / Will',
        colors: { primary: '#db2777', secondary: '#ec4899', accent: '#f9a8d4', surface: '#1c1018' },
    },
]

export const DEFAULT_THEME = THEME_PRESETS[0]

export const THEME_STORAGE_KEY = 'fontara_theme'

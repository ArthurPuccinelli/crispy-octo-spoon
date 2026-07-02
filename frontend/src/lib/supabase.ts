import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Avisa (sem quebrar o site) se as envs estiverem faltando — o portal ainda
// carrega e os recursos que dependem do Supabase degradam graciosamente.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars ausentes. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

// Utility function for formatting currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Exemplo de uso:
// const { data, error } = await supabase
//   .from('clientes')
//   .select('*')

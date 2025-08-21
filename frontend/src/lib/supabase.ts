import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug: Log environment variables (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Environment Variables:')
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
}

// Create a mock client during build time if env vars are not available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time
    console.warn('⚠️ Supabase environment variables not found. Using mock client for build.')

    // Create a more compatible mock client
    const mockTable = () => ({
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options: any) => Promise.resolve({ data: [], error: null }),
          then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
        }),
        order: (column: string, options: any) => Promise.resolve({ data: [], error: null }),
        then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    })

    return {
      from: mockTable,
      // Add other Supabase methods that might be used
      auth: {
        signIn: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ data: null, error: null }),
        getUser: () => Promise.resolve({ data: null, error: null })
      }
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

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

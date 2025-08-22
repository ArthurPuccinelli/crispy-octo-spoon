import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug: Log environment variables (always, not just in development)
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Environment Variables Check:')
  console.log('URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing')
  console.log('ANON_KEY:', supabaseAnonKey ? `✅ Set (${supabaseAnonKey.substring(0, 30)}...)` : '❌ Missing')
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined')
  console.log('Current URL:', window.location.href)
}

// Create a mock client during build time if env vars are not available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time
    console.warn('⚠️ Supabase environment variables not found. Using mock client for build.')
    console.warn('🔧 Please check Netlify environment variables configuration.')
    console.warn('📋 Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
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
  
  console.log('✅ Supabase client created successfully with environment variables')
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

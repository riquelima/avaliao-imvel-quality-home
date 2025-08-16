import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frsaogezzueyapkecbda.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2FvZ2V6enVleWFwa2VjYmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTY4MTMsImV4cCI6MjA3MDg5MjgxM30.4yj790DQWMrgo6Q6Bifvq0PdlH7jCHWuPTTVGJQOklQ'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      property_evaluations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          // Personal Information
          name: string
          phone: string
          email: string
          // Property Details
          address: string
          property_type: string
          total_area: number | null
          private_area: number | null
          bedrooms: number | null
          bathrooms: number | null
          parking_spaces: number | null
          // Construction Information
          construction_year: number | null
          condition: string
          occupancy_status: string
          // Documentation
          property_deed: boolean
          registration: boolean
          iptu: boolean
          condominium_slip: boolean
          floor_plan: boolean
          // Evaluation Purpose
          evaluation_purpose: string
          additional_details: string | null
          // Media
          external_photos: string | null
          internal_photos: string | null
          // Condominium Information
          has_condominium: boolean
          condominium_name: string | null
          floor: number | null
          unit: string | null
          condominium_fee: number | null
          common_areas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          phone: string
          email: string
          address: string
          property_type: string
          total_area?: number | null
          private_area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          construction_year?: number | null
          condition: string
          occupancy_status: string
          property_deed?: boolean
          registration?: boolean
          iptu?: boolean
          condominium_slip?: boolean
          floor_plan?: boolean
          evaluation_purpose: string
          additional_details?: string | null
          external_photos?: string | null
          internal_photos?: string | null
          has_condominium?: boolean
          condominium_name?: string | null
          floor?: number | null
          unit?: string | null
          condominium_fee?: number | null
          common_areas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          phone?: string
          email?: string
          address?: string
          property_type?: string
          total_area?: number | null
          private_area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          construction_year?: number | null
          condition?: string
          occupancy_status?: string
          property_deed?: boolean
          registration?: boolean
          iptu?: boolean
          condominium_slip?: boolean
          floor_plan?: boolean
          evaluation_purpose?: string
          additional_details?: string | null
          external_photos?: string | null
          internal_photos?: string | null
          has_condominium?: boolean
          condominium_name?: string | null
          floor?: number | null
          unit?: string | null
          condominium_fee?: number | null
          common_areas?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type PropertyEvaluation = Database['public']['Tables']['property_evaluations']['Row']
export type PropertyEvaluationInsert = Database['public']['Tables']['property_evaluations']['Insert']
export type PropertyEvaluationUpdate = Database['public']['Tables']['property_evaluations']['Update']

// Property Types
export const PropertyTypes = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Comercial',
  LAND: 'Terreno',
  RURAL: 'Rural'
} as const

export const PropertyConditions = {
  NEW: 'Novo',
  EXCELLENT: 'Excelente',
  GOOD: 'Bom',
  REGULAR: 'Regular',
  NEEDS_RENOVATION: 'Precisa de Reforma'
} as const

export const OccupancyStatus = {
  OCCUPIED: 'Ocupado',
  VACANT: 'Vago',
  RENTED: 'Alugado'
} as const

export const EvaluationPurposes = {
  SALE: 'Venda',
  PURCHASE: 'Compra',
  FINANCING: 'Financiamento',
  INSURANCE: 'Seguro',
  LEGAL: 'Judicial',
  OTHER: 'Outros'
} as const
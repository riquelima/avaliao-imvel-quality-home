export interface SelectOption {
  label: string;
  value: string;
}

export interface FormData {
  whatsapp: string;
  nome_completo: string;
  tipo_cliente: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  tipo_imovel: string;
  area_terreno: number | null;
  area_construida: number | null;
  area_terreno_na: boolean;
  area_construida_na: boolean;
  idade_construcao: number | null;
  estado_geral: string;
  ocupado: string;
  documentos_disponiveis: string[];
  situacao_documentos: string;
  finalidade: string;
  nome_condominio: string;
  condominio_na: boolean;
  detalhes_adicionais: string;
}

// Auto-generated Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avaliacoes_imoveis: {
        Row: {
          area_construida: number | null
          area_construida_na: boolean | null
          area_terreno: number | null
          area_terreno_na: boolean | null
          condominio_na: boolean | null
          created_at: string
          detalhes_adicionais: string | null
          documentos_disponiveis: string[] | null
          endereco_completo: string | null
          estado_geral: string | null
          finalidade: string | null
          id: number
          idade_construcao: number | null
          laudo_id: string
          links_fotos: string[] | null
          nome_completo: string | null
          nome_condominio: string | null
          ocupado: string | null
          pdf_url: string | null
          situacao_documentos: string | null
          tipo_cliente: string | null
          tipo_imovel: string | null
          whatsapp: string | null
        }
        Insert: {
          area_construida?: number | null
          area_construida_na?: boolean | null
          area_terreno?: number | null
          area_terreno_na?: boolean | null
          condominio_na?: boolean | null
          created_at?: string
          detalhes_adicionais?: string | null
          documentos_disponiveis?: string[] | null
          endereco_completo?: string | null
          estado_geral?: string | null
          finalidade?: string | null
          id?: number
          idade_construcao?: number | null
          laudo_id: string
          links_fotos?: string[] | null
          nome_completo?: string | null
          nome_condominio?: string | null
          ocupado?: string | null
          pdf_url?: string | null
          situacao_documentos?: string | null
          tipo_cliente?: string | null
          tipo_imovel?: string | null
          whatsapp?: string | null
        }
        Update: {
          area_construida?: number | null
          area_construida_na?: boolean | null
          area_terreno?: number | null
          area_terreno_na?: boolean | null
          condominio_na?: boolean | null
          created_at?: string
          detalhes_adicionais?: string | null
          documentos_disponiveis?: string[] | null
          endereco_completo?: string | null
          estado_geral?: string | null
          finalidade?: string | null
          id?: number
          idade_construcao?: number | null
          laudo_id?: string
          links_fotos?: string[] | null
          nome_completo?: string | null
          nome_condominio?: string | null
          ocupado?: string | null
          pdf_url?: string | null
          situacao_documentos?: string | null
          tipo_cliente?: string | null
          tipo_imovel?: string | null
          whatsapp?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
export interface FormData {
  solicitanteNome: string;
  whatsapp: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  tipoImovel: string;
  areaTerreno: string;
  areaConstruida: string;
  idadeConstrucao: string;
  estadoGeral: string;
  documentosDisponiveis: string;
  situacaoDocumentos: string;
  finalidadeAvaliacao: string;
  linksFotos: string;
  ocupacao: string;
  nomeCondominio: string;
  detalhesAdicionais: string;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

export interface Database {
  public: {
    Tables: {
      avaliacoes_imoveis: {
        Row: {
          id: number;
          created_at: string;
          nome_completo: string;
          whatsapp: string;
          endereco_completo: string;
          tipo_imovel: string;
          area_terreno: number | null;
          area_terreno_na: boolean;
          area_construida: number | null;
          area_construida_na: boolean;
          idade_construcao: number | null;
          estado_geral: string;
          ocupado: string;
          documentos_disponiveis: string[] | null;
          situacao_documentos: string;
          finalidade: string;
          links_fotos: string[] | null;
          nome_condominio: string | null;
          condominio_na: boolean;
          detalhes_adicionais: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          nome_completo: string;
          whatsapp: string;
          endereco_completo: string;
          tipo_imovel: string;
          area_terreno?: number | null;
          area_terreno_na: boolean;
          area_construida?: number | null;
          area_construida_na: boolean;
          idade_construcao?: number | null;
          estado_geral: string;
          ocupado: string;
          documentos_disponiveis?: string[] | null;
          situacao_documentos: string;
          finalidade: string;
          links_fotos?: string[] | null;
          nome_condominio?: string | null;
          condominio_na: boolean;
          detalhes_adicionais?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          nome_completo?: string;
          whatsapp?: string;
          endereco_completo?: string;
          tipo_imovel?: string;
          area_terreno?: number | null;
          area_terreno_na?: boolean;
          area_construida?: number | null;
          area_construida_na?: boolean;
          idade_construcao?: number | null;
          estado_geral?: string;
          ocupado?: string;
          documentos_disponiveis?: string[] | null;
          situacao_documentos?: string;
          finalidade?: string;
          links_fotos?: string[] | null;
          nome_condominio?: string | null;
          condominio_na?: boolean;
          detalhes_adicionais?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}


export interface FormData {
  nomeSolicitante: string;
  whatsapp: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  tipoImovel: 'urbano' | 'rural' | 'comercial' | 'terreno' | 'misto' | '';
  areaTerreno: string;
  areaTerrenoNA: boolean;
  areaConstruida: string;
  areaConstruidaNA: boolean;
  idadeConstrucao: string;
  estadoGeral: string;
  documentosDisponiveis: string[];
  situacaoDocumentos: 'regular' | 'pendente' | 'outro' | '';
  finalidade: 'venda' | 'partilha' | 'judicial' | 'outro' | '';
  linksFotos: string;
  ocupado: 'ocupado' | 'desocupado' | '';
  nomeCondominio: string;
  condominioNA: boolean;
  detalhesAdicionais: string;
}

export type FormStatus = {
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
};

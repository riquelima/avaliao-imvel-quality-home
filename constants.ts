import type { SelectOption } from './types';

export const TIPOS_CLIENTE: SelectOption[] = [
  { label: 'Proprietário de imóvel', value: 'proprietario_de_imovel' },
  { label: 'Corretor com CNAI', value: 'corretor_com_cnai' },
  { label: 'Corretor sem CNAI', value: 'corretor_sem_cnai' },
  { label: 'Advogado', value: 'advogado' },
];

export const TIPOS_IMOVEL: SelectOption[] = [
  { label: 'Urbano', value: 'urbano' },
  { label: 'Rural', value: 'rural' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Terreno', value: 'terreno' },
  { label: 'Misto', value: 'misto' },
];

export const OCUPACAO_OPCOES: SelectOption[] = [
  { label: 'Ocupado', value: 'ocupado' },
  { label: 'Desocupado', value: 'desocupado' },
];

export const SITUACOES_DOCUMENTOS: SelectOption[] = [
  { label: 'Regular', value: 'regular' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Outro', value: 'outro' },
];

export const FINALIDADES: SelectOption[] = [
  { label: 'Venda', value: 'venda' },
  { label: 'Partilha de Bens', value: 'partilha_de_bens' },
  { label: 'Processo Judicial', value: 'processo_judicial' },
  { label: 'Outro', value: 'outro' },
];

export const DOCUMENTOS_DISPONIVEIS = ['Matrícula', 'IPTU', 'Planta', 'Nenhum'];
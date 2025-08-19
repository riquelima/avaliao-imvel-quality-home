import React, { useState } from 'react';
import type { FormData } from './types';
import { supabase } from './services/supabase';
import { FormSection } from './components/FormSection';
import { InputField } from './components/InputField';
import { SelectField } from './components/SelectField';
import { CheckboxGroup } from './components/CheckboxGroup';
import { TextAreaField } from './components/TextAreaField';
import { FileUpload } from './components/FileUpload';
import { 
  TIPOS_CLIENTE, 
  TIPOS_IMOVEL, 
  OCUPACAO_OPCOES,
  SITUACOES_DOCUMENTOS, 
  FINALIDADES, 
  DOCUMENTOS_DISPONIVEIS 
} from './constants';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


const initialState: FormData = {
  whatsapp: '',
  nome_completo: '',
  tipo_cliente: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  tipo_imovel: '',
  area_terreno: null,
  area_construida: null,
  area_terreno_na: false,
  area_construida_na: false,
  idade_construcao: null,
  estado_geral: '',
  ocupado: '',
  documentos_disponiveis: [],
  situacao_documentos: '',
  finalidade: '',
  nome_condominio: '',
  condominio_na: false,
  detalhes_adicionais: '',
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formView, setFormView] = useState<'form' | 'confirmation'>('form');
  const [submittedLaudoId, setSubmittedLaudoId] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
        if(name === 'area_terreno_na' && checked) setFormData(prev => ({...prev, area_terreno: null}));
        if(name === 'area_construida_na' && checked) setFormData(prev => ({...prev, area_construida: null}));
        if(name === 'condominio_na' && checked) setFormData(prev => ({...prev, nome_condominio: ''}));
    } else {
        const isNumeric = ['area_terreno', 'area_construida', 'idade_construcao'].includes(name);
        setFormData(prev => ({
            ...prev,
            [name]: isNumeric ? (value === '' ? null : Number(value)) : value,
        }));
    }
  };

  const handleCheckboxGroupChange = (selected: string[]) => {
    setFormData(prev => ({ ...prev, documentos_disponiveis: selected }));
  };
  
  const generateLaudoId = async (): Promise<string> => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    const { count, error } = await supabase
        .from('avaliacoes_imoveis')
        .select('*', { count: 'exact', head: true })
        .like('laudo_id', `QH-${datePrefix}-%`);

    if(error) {
        console.error("Error fetching count for laudo_id", error);
        return `QH-${datePrefix}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    }

    const newSequence = String((count ?? 0) + 1).padStart(4, '0');
    return `QH-${datePrefix}-${newSequence}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${Date.now()}-${photo.name}`;
        const { data, error: uploadError } = await supabase.storage.from('quallity-home').upload(fileName, photo);
        if (uploadError) throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('quallity-home').getPublicUrl(data.path);
        photoUrls.push(publicUrl);
      }

      const laudoId = await generateLaudoId();

      const enderecoCompleto = `${formData.logradouro}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.uf}, ${formData.cep}`;
      
      const submissionData = {
        laudo_id: laudoId,
        whatsapp: formData.whatsapp,
        nome_completo: formData.nome_completo,
        tipo_cliente: formData.tipo_cliente,
        endereco_completo: enderecoCompleto,
        tipo_imovel: formData.tipo_imovel,
        area_terreno: formData.area_terreno,
        area_construida: formData.area_construida,
        area_terreno_na: formData.area_terreno_na,
        area_construida_na: formData.area_construida_na,
        idade_construcao: formData.idade_construcao,
        estado_geral: formData.estado_geral,
        ocupado: formData.ocupado,
        documentos_disponiveis: formData.documentos_disponiveis,
        situacao_documentos: formData.situacao_documentos,
        finalidade: formData.finalidade,
        links_fotos: photoUrls,
        nome_condominio: formData.nome_condominio,
        condominio_na: formData.condominio_na,
        detalhes_adicionais: formData.detalhes_adicionais,
      };

      const { error: insertError } = await supabase.from('avaliacoes_imoveis').insert(submissionData);
      if (insertError) throw new Error(`Erro ao salvar os dados: ${insertError.message}`);

      const webhookUrl = 'https://n8n.intelektus.tech/webhook/formulario';
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
        } catch (webhookError: any) {
            console.error('Failed to send data to webhook:', webhookError.message);
        }

      setSubmittedLaudoId(laudoId);
      setFormView('confirmation');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <header className="text-center mb-12">
            <img src="https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/refs/heads/main/logoTransparente2.png" alt="Quality Home Avalia Logo" className="mx-auto h-24" />
            <p className="mt-4 text-slate-600 text-lg">Formulário de Solicitação de Avaliação de Imóvel</p>
          </header>
          
          {formView === 'form' ? (
             <form onSubmit={handleSubmit} className="space-y-4">

                <FormSection title="Informações do Solicitante" icon={<UserIcon />}>
                    <InputField label="Nome Completo do Solicitante" id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required className="md:col-span-3" />
                    <InputField label="Whatsapp" id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" required className="md:col-span-3"/>
                    <SelectField label="Tipo de Cliente" id="tipo_cliente" name="tipo_cliente" value={formData.tipo_cliente} onChange={handleChange} options={TIPOS_CLIENTE} required className="md:col-span-6"/>
                </FormSection>

                <FormSection title="Endereço do Imóvel" icon={<HomeIcon />}>
                    <InputField label="Logradouro (Rua, Av.)" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} required className="md:col-span-4" />
                    <InputField label="Número" id="numero" name="numero" value={formData.numero} onChange={handleChange} required className="md:col-span-2" />
                    <InputField label="Bairro" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required className="md:col-span-2" />
                    <InputField label="Cidade" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required className="md:col-span-2" />
                    <InputField label="UF" id="uf" name="uf" value={formData.uf} onChange={handleChange} required className="md:col-span-1" />
                    <InputField label="CEP" id="cep" name="cep" value={formData.cep} onChange={handleChange} required className="md:col-span-1" />
                </FormSection>

                <FormSection title="Detalhes do Imóvel" icon={<BuildingIcon />}>
                    <SelectField label="Tipo de Imóvel" id="tipo_imovel" name="tipo_imovel" value={formData.tipo_imovel} onChange={handleChange} options={TIPOS_IMOVEL} required className="md:col-span-3" />
                    <InputField label="Idade da Construção (anos)" id="idade_construcao" name="idade_construcao" type="number" value={formData.idade_construcao ?? ''} onChange={handleChange} placeholder="Aproximada" className="md:col-span-3" />
                    
                    <div className="md:col-span-3">
                        <InputField label="Área do Terreno (m²)" id="area_terreno" name="area_terreno" type="number" value={formData.area_terreno ?? ''} onChange={handleChange} disabled={formData.area_terreno_na} />
                        <div className="flex items-center mt-2">
                            <input type="checkbox" id="area_terreno_na" name="area_terreno_na" checked={formData.area_terreno_na} onChange={handleChange} className="h-4 w-4 rounded-sm border-slate-400 bg-slate-50 text-orange-600 focus:ring-orange-500" />
                            <label htmlFor="area_terreno_na" className="ml-2 text-sm text-slate-600">Não se aplica</label>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <InputField label="Área Construída (m²)" id="area_construida" name="area_construida" type="number" value={formData.area_construida ?? ''} onChange={handleChange} disabled={formData.area_construida_na} />
                        <div className="flex items-center mt-2">
                            <input type="checkbox" id="area_construida_na" name="area_construida_na" checked={formData.area_construida_na} onChange={handleChange} className="h-4 w-4 rounded-sm border-slate-400 bg-slate-50 text-orange-600 focus:ring-orange-500" />
                            <label htmlFor="area_construida_na" className="ml-2 text-sm text-slate-600">Não se aplica</label>
                        </div>
                    </div>
                    
                    <SelectField label="Ocupação" id="ocupado" name="ocupado" value={formData.ocupado} onChange={handleChange} options={OCUPACAO_OPCOES} required className="md:col-span-3"/>

                    <div className="md:col-span-3">
                        <InputField label="Nome do Condomínio" id="nome_condominio" name="nome_condominio" value={formData.nome_condominio} onChange={handleChange} disabled={formData.condominio_na} />
                        <div className="flex items-center mt-2">
                            <input type="checkbox" id="condominio_na" name="condominio_na" checked={formData.condominio_na} onChange={handleChange} className="h-4 w-4 rounded-sm border-slate-400 bg-slate-50 text-orange-600 focus:ring-orange-500" />
                            <label htmlFor="condominio_na" className="ml-2 text-sm text-slate-600">Não se aplica</label>
                        </div>
                    </div>
                    
                    <TextAreaField label="Estado Geral do Imóvel" id="estado_geral" name="estado_geral" value={formData.estado_geral} onChange={handleChange} placeholder="Descrição das condições gerais, como pintura, estrutura, acabamentos, etc." className="md:col-span-6" />
                </FormSection>
                
                <FormSection title="Documentação e Finalidade" icon={<DocumentIcon />}>
                    <CheckboxGroup label="Documentos Disponíveis" name="documentos_disponiveis" options={DOCUMENTOS_DISPONIVEIS} selectedOptions={formData.documentos_disponiveis} onChange={handleCheckboxGroupChange} className="md:col-span-2" />
                    <SelectField label="Situação dos Documentos" id="situacao_documentos" name="situacao_documentos" value={formData.situacao_documentos} onChange={handleChange} options={SITUACOES_DOCUMENTOS} required className="md:col-span-2" />
                    <SelectField label="Finalidade da Avaliação" id="finalidade" name="finalidade" value={formData.finalidade} onChange={handleChange} options={FINALIDADES} required className="md:col-span-2" />
                </FormSection>
                
                <div className="space-y-6">
                    <FileUpload onFilesChange={setPhotos} />
                    <TextAreaField label="Detalhes Adicionais" id="detalhes_adicionais" name="detalhes_adicionais" value={formData.detalhes_adicionais} onChange={handleChange} placeholder="Informe aqui qualquer detalhe relevante sobre o imóvel, vizinhança, etc." />
                </div>

                <div className="pt-6">
                    {error && <div className="mb-4 p-4 text-center text-red-800 bg-red-100 border border-red-300 rounded-lg">{error}</div>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-3 bg-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 ease-in-out text-lg shadow-lg disabled:bg-orange-400 disabled:cursor-wait"
                    >
                        {isLoading ? <><Spinner/> Processando...</> : 'Enviar Avaliação'}
                    </button>
                </div>
            </form>
          ) : (
            <div className="p-8 md:p-16 text-center rounded-lg">
                <CheckCircleIcon />
                <h2 className="text-3xl font-bold text-blue-900 mt-4">Dados Enviados com Sucesso!</h2>
                <p className="mt-2 text-slate-600">Sua solicitação de avaliação foi recebida e já estamos processando.</p>
                
                <div className="mt-8 bg-slate-50 border border-orange-300 rounded-lg p-4 inline-block">
                    <p className="text-slate-600">Seu código de laudo é:</p>
                    <p className="text-2xl font-bold text-orange-600 tracking-wider mt-1">{submittedLaudoId}</p>
                </div>

                <p className="mt-8 text-sm text-slate-500">Obrigado por escolher a Quality Home Avalia.</p>
            </div>
          )}
        </div>
    </div>
  );
}

export default App;

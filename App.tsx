
import React, { useState, useCallback } from 'react';
import { supabase } from './services/supabaseClient';
import { FormData, FormStatus } from './types';
import { TIPO_IMOVEL_OPTIONS, SITUACAO_DOCUMENTOS_OPTIONS, FINALIDADE_AVALIACAO_OPTIONS, OCUPADO_OPTIONS, DOCUMENTOS_OPTIONS } from './constants';
import { UserIcon, PhoneIcon, HomeIcon, BuildingIcon, DocumentIcon, CameraIcon, InfoIcon, SpinnerIcon } from './components/Icons';
import FormControl from './components/FormControl';

const initialFormData: FormData = {
  nomeSolicitante: '',
  whatsapp: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  tipoImovel: '',
  areaTerreno: '',
  areaTerrenoNA: false,
  areaConstruida: '',
  areaConstruidaNA: false,
  idadeConstrucao: '',
  estadoGeral: '',
  documentosDisponiveis: [],
  situacaoDocumentos: '',
  finalidade: '',
  linksFotos: '',
  ocupado: '',
  nomeCondominio: '',
  condominioNA: false,
  detalhesAdicionais: '',
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: 'idle', message: '' });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  }, []);

  const handleMultiCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const currentDocs = prev.documentosDisponiveis;
        if (checked) {
            return { ...prev, documentosDisponiveis: [...currentDocs, value] };
        } else {
            return { ...prev, documentosDisponiveis: currentDocs.filter(doc => doc !== value) };
        }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', message: 'Enviando...' });

    // This object matches the Supabase table schema provided in the image.
    const submissionData = {
        nome_completo: formData.nomeSolicitante, // Corrected column name from 'nome_solicitante'
        endereco_completo: `${formData.logradouro}, nº ${formData.numero}, ${formData.bairro}, ${formData.cidade} - ${formData.uf}, CEP: ${formData.cep}`,
        tipo_imovel: formData.tipoImovel,
        area_terreno: formData.areaTerrenoNA ? null : Number(formData.areaTerreno) || null,
        area_construida: formData.areaConstruidaNA ? null : Number(formData.areaConstruida) || null,
        area_terreno_na: formData.areaTerrenoNA,
        area_construida_na: formData.areaConstruidaNA,
        idade_construcao: Number(formData.idadeConstrucao) || null,
        estado_geral: formData.estadoGeral,
        ocupado: formData.ocupado,
        documentos_disponiveis: formData.documentosDisponiveis,
        situacao_documentos: formData.situacaoDocumentos,
        finalidade: formData.finalidade,
        links_fotos: formData.linksFotos.split('\n').filter(link => link.trim() !== ''),
        nome_condominio: formData.condominioNA ? null : formData.nomeCondominio,
        condominio_na: formData.condominioNA,
        // The 'whatsapp' field is not in the schema, so we prepend it to 'detalhes_adicionais' to avoid losing the data.
        detalhes_adicionais: `Whatsapp: ${formData.whatsapp}${formData.detalhesAdicionais ? `\n\n${formData.detalhesAdicionais}` : ''}`,
    };
    
    // The correct table name is 'avaliacoes_imoveis'
    const { error } = await supabase.from('avaliacoes_imoveis').insert([submissionData]);

    if (error) {
        setFormStatus({ type: 'error', message: `Erro ao salvar no banco de dados: ${error.message}` });
        return;
    }

    // After successful Supabase submission, send to webhook
    try {
        const webhookResponse = await fetch('https://primary-production-76569.up.railway.app/webhook/formulario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        });

        if (!webhookResponse.ok) {
            // Log webhook error but still show success to the user as the data was saved
            console.error('Webhook failed:', webhookResponse.statusText);
            setFormStatus({ type: 'success', message: 'Formulário enviado com sucesso, mas houve um problema na notificação. Já recebemos seus dados.' });
        } else {
             setFormStatus({ type: 'success', message: 'Formulário enviado com sucesso! Entraremos em contato em breve.' });
        }
    } catch (webhookError) {
        console.error('Error sending to webhook:', webhookError);
        setFormStatus({ type: 'success', message: 'Formulário enviado com sucesso, mas houve um problema na notificação. Já recebemos seus dados.' });
    }
    
    setFormData(initialFormData);
  };
  
  const inputStyles = "w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 p-2.5";
  const selectStyles = inputStyles + " appearance-none";
  const sectionTitleStyles = "text-xl font-bold text-purple-300 border-b-2 border-purple-500/30 pb-2 mb-6 flex items-center gap-3";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-900/20 border border-purple-500/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">Quality Home Avalia</h1>
          <p className="text-purple-300 mt-2">Formulário de Solicitação de Avaliação de Imóvel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção de Contato */}
          <section>
            <h2 className={sectionTitleStyles}><UserIcon />Informações do Solicitante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormControl label="Nome Completo do Solicitante" htmlFor="nomeSolicitante">
                <input type="text" id="nomeSolicitante" name="nomeSolicitante" value={formData.nomeSolicitante} onChange={handleChange} className={inputStyles} required />
              </FormControl>
              <FormControl label="Whatsapp" htmlFor="whatsapp">
                <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputStyles} placeholder="(XX) XXXXX-XXXX" required />
              </FormControl>
            </div>
          </section>

          {/* Seção de Endereço */}
          <section>
            <h2 className={sectionTitleStyles}><HomeIcon />Endereço do Imóvel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FormControl label="Logradouro (Rua, Av.)" htmlFor="logradouro">
                  <input type="text" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} className={inputStyles} required />
                </FormControl>
              </div>
              <FormControl label="Número" htmlFor="numero">
                <input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} className={inputStyles} required />
              </FormControl>
              <FormControl label="Bairro" htmlFor="bairro">
                <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} className={inputStyles} required />
              </FormControl>
              <FormControl label="Cidade" htmlFor="cidade">
                <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} className={inputStyles} required />
              </FormControl>
              <div className="grid grid-cols-2 gap-4">
                 <FormControl label="UF" htmlFor="uf">
                  <input type="text" id="uf" name="uf" value={formData.uf} onChange={handleChange} className={inputStyles} maxLength={2} required />
                </FormControl>
                <FormControl label="CEP" htmlFor="cep">
                  <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} className={inputStyles} required />
                </FormControl>
              </div>
            </div>
          </section>

          {/* Detalhes do Imóvel */}
          <section>
             <h2 className={sectionTitleStyles}><BuildingIcon />Detalhes do Imóvel</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                <FormControl label="Tipo de Imóvel" htmlFor="tipoImovel">
                    <select id="tipoImovel" name="tipoImovel" value={formData.tipoImovel} onChange={handleChange} className={selectStyles} required>
                        <option value="" disabled>Selecione...</option>
                        {TIPO_IMOVEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </FormControl>
                <FormControl label="Área do Terreno (m²)" htmlFor="areaTerreno">
                  <input type="number" id="areaTerreno" name="areaTerreno" value={formData.areaTerreno} onChange={handleChange} className={inputStyles} disabled={formData.areaTerrenoNA} />
                   <div className="flex items-center mt-2">
                      <input type="checkbox" id="areaTerrenoNA" name="areaTerrenoNA" checked={formData.areaTerrenoNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500" />
                      <label htmlFor="areaTerrenoNA" className="ml-2 block text-sm text-gray-300">Não se aplica</label>
                  </div>
                </FormControl>
                 <FormControl label="Área Construída (m²)" htmlFor="areaConstruida">
                    <input type="number" id="areaConstruida" name="areaConstruida" value={formData.areaConstruida} onChange={handleChange} className={inputStyles} disabled={formData.areaConstruidaNA} />
                    <div className="flex items-center mt-2">
                       <input type="checkbox" id="areaConstruidaNA" name="areaConstruidaNA" checked={formData.areaConstruidaNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500" />
                       <label htmlFor="areaConstruidaNA" className="ml-2 block text-sm text-gray-300">Não se aplica</label>
                   </div>
                 </FormControl>
                 <FormControl label="Idade da Construção (anos)" htmlFor="idadeConstrucao">
                    <input type="number" id="idadeConstrucao" name="idadeConstrucao" value={formData.idadeConstrucao} onChange={handleChange} className={inputStyles} placeholder="Aproximada" />
                </FormControl>
                <FormControl label="Ocupação" htmlFor="ocupado">
                    <select id="ocupado" name="ocupado" value={formData.ocupado} onChange={handleChange} className={selectStyles} required>
                        <option value="" disabled>Selecione...</option>
                        {OCUPADO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </FormControl>
                <FormControl label="Nome do Condomínio" htmlFor="nomeCondominio">
                    <input type="text" id="nomeCondominio" name="nomeCondominio" value={formData.nomeCondominio} onChange={handleChange} className={inputStyles} disabled={formData.condominioNA} />
                    <div className="flex items-center mt-2">
                        <input type="checkbox" id="condominioNA" name="condominioNA" checked={formData.condominioNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="condominioNA" className="ml-2 block text-sm text-gray-300">Não se aplica</label>
                    </div>
                </FormControl>
                <div className="md:col-span-2 lg:col-span-3">
                  <FormControl label="Estado Geral do Imóvel" htmlFor="estadoGeral">
                      <textarea id="estadoGeral" name="estadoGeral" value={formData.estadoGeral} onChange={handleChange} rows={3} className={inputStyles} placeholder="Descrição das condições gerais, como pintura, estrutura, acabamentos, etc."></textarea>
                  </FormControl>
                </div>
             </div>
          </section>

          {/* Documentação */}
          <section>
            <h2 className={sectionTitleStyles}><DocumentIcon />Documentação e Finalidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormControl label="Documentos Disponíveis" htmlFor="documentosDisponiveis">
                    <div className="space-y-2 bg-gray-700/50 p-3 rounded-md">
                        {DOCUMENTOS_OPTIONS.map(doc => (
                           <div key={doc} className="flex items-center">
                               <input id={`doc-${doc}`} type="checkbox" value={doc} onChange={handleMultiCheckboxChange} checked={formData.documentosDisponiveis.includes(doc)} className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500"/>
                               <label htmlFor={`doc-${doc}`} className="ml-2 text-sm text-gray-200">{doc}</label>
                           </div>
                        ))}
                    </div>
                </FormControl>
                <FormControl label="Situação dos Documentos" htmlFor="situacaoDocumentos">
                    <select id="situacaoDocumentos" name="situacaoDocumentos" value={formData.situacaoDocumentos} onChange={handleChange} className={selectStyles} required>
                        <option value="" disabled>Selecione...</option>
                        {SITUACAO_DOCUMENTOS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </FormControl>
                <FormControl label="Finalidade da Avaliação" htmlFor="finalidade">
                    <select id="finalidade" name="finalidade" value={formData.finalidade} onChange={handleChange} className={selectStyles} required>
                        <option value="" disabled>Selecione...</option>
                        {FINALIDADE_AVALIACAO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </FormControl>
            </div>
          </section>

           {/* Informações Adicionais */}
           <section>
              <h2 className={sectionTitleStyles}><InfoIcon />Informações Adicionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormControl label="Links de Fotos do Imóvel" htmlFor="linksFotos" icon={<CameraIcon/>}>
                    <textarea id="linksFotos" name="linksFotos" value={formData.linksFotos} onChange={handleChange} rows={4} className={inputStyles} placeholder="Cole um link por linha (ex: Google Drive, Dropbox) ou informe 'nenhum'"></textarea>
                 </FormControl>
                 <FormControl label="Detalhes Adicionais (Opcional)" htmlFor="detalhesAdicionais" icon={<InfoIcon/>}>
                    <textarea id="detalhesAdicionais" name="detalhesAdicionais" value={formData.detalhesAdicionais} onChange={handleChange} rows={4} className={inputStyles} placeholder="Qualquer outra informação relevante que deseje incluir."></textarea>
                 </FormControl>
              </div>
           </section>

          {/* Botão de Envio */}
          <div className="text-center pt-4">
              {formStatus.message && (
                  <div className={`p-4 mb-4 text-sm rounded-lg ${
                      formStatus.type === 'success' ? 'bg-green-800 text-green-200' :
                      formStatus.type === 'error' ? 'bg-red-800 text-red-200' : 'bg-blue-800 text-blue-200'
                  }`} role="alert">
                      {formStatus.message}
                  </div>
              )}
            <button type="submit" disabled={formStatus.type === 'loading'} className="inline-flex items-center justify-center w-full md:w-auto px-12 py-3 text-lg font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:bg-purple-800 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30">
              {formStatus.type === 'loading' ? <><SpinnerIcon /> Enviando...</> : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

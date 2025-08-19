"use client";

import React, { useState } from 'react';
import type { FormData, Database } from '@/types';
import { UF_OPTIONS, TIPO_IMOVEL_OPTIONS, SITUACAO_DOCUMENTOS_OPTIONS, FINALIDADE_AVALIACAO_OPTIONS, OCUPADO_OPTIONS } from '@/constants';
import FormField from '@/components/FormControl';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Textarea from '@/components/Textarea';
import { supabase } from '@/lib/supabase';


const Home: React.FC = () => {
  const initialFormData: FormData = {
    solicitanteNome: '',
    whatsapp: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    cep: '',
    tipoImovel: 'Urbano',
    areaTerreno: '',
    areaConstruida: '',
    idadeConstrucao: '',
    estadoGeral: '',
    documentosDisponiveis: '',
    situacaoDocumentos: 'Regular',
    finalidadeAvaliacao: 'Venda',
    linksFotos: '',
    ocupacao: 'Desocupado',
    nomeCondominio: '',
    detalhesAdicionais: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setFormData(prevState => ({
      ...prevState,
      whatsapp: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    setErrorMessage('');

    try {
      const {
        areaTerreno,
        areaConstruida,
        idadeConstrucao,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        whatsapp,
        documentosDisponiveis,
        linksFotos,
        nomeCondominio,
        tipoImovel,
        ocupacao,
        situacaoDocumentos,
        finalidadeAvaliacao,
        solicitanteNome,
        estadoGeral,
        detalhesAdicionais,
      } = formData;

      // Helper function to parse numbers, returning null for invalid/empty inputs
      const parseNumber = (value: string): number | null => {
        const cleaned = value.trim().toLowerCase();
        if (cleaned === '' || cleaned === 'não se aplica') return null;
        const num = parseFloat(cleaned.replace(',', '.'));
        return isNaN(num) ? null : num;
      };

      const areaTerrenoNum = parseNumber(areaTerreno);
      const areaConstruidaNum = parseNumber(areaConstruida);
      const idadeConstrucaoNum = parseNumber(idadeConstrucao);

      // Construct full address
      const endereco_completo = `${logradouro}, ${numero} - ${bairro}, ${cidade} - ${uf}, CEP: ${cep}`;
      
      // Sanitize WhatsApp number (store only digits)
      const whatsapp_clean = whatsapp.replace(/\D/g, '');

      // Split strings into arrays, returning null for empty/whitespace input
      const splitAndTrim = (str: string): string[] | null => {
        if (!str || !str.trim()) {
          return null;
        }
        const arr = str.split(',').map(item => item.trim()).filter(Boolean);
        return arr.length > 0 ? arr : null;
      };
      const documentos_disponiveis_arr = splitAndTrim(documentosDisponiveis);
      const links_fotos_arr = splitAndTrim(linksFotos);

      // Handle optional condo name
      const nome_condominio_final = nomeCondominio.trim().toLowerCase();
      const finalCondoName = ['n/a', 'nao se aplica', ''].includes(nome_condominio_final) ? null : nomeCondominio;

      const dataToSubmit: Database['public']['Tables']['avaliacoes_imoveis']['Insert'] = {
        nome_completo: solicitanteNome,
        whatsapp: whatsapp_clean,
        endereco_completo: endereco_completo,
        tipo_imovel: tipoImovel.toLowerCase(),
        area_terreno: areaTerrenoNum,
        area_terreno_na: areaTerrenoNum === null,
        area_construida: areaConstruidaNum,
        area_construida_na: areaConstruidaNum === null,
        idade_construcao: idadeConstrucaoNum,
        idade_construcao_na: idadeConstrucaoNum === null,
        estado_geral: estadoGeral,
        ocupado: ocupacao.toLowerCase(),
        documentos_disponiveis: documentos_disponiveis_arr,
        situacao_documentos: situacaoDocumentos.toLowerCase(),
        finalidade: finalidadeAvaliacao.toLowerCase(),
        links_fotos: links_fotos_arr,
        nome_condominio: finalCondoName,
        condominio_na: finalCondoName === null,
        detalhes_adicionais: detalhesAdicionais.trim() || null,
      };
      
      const { error } = await supabase
        .from('avaliacoes_imoveis')
        .insert(dataToSubmit);

      if (error) {
        throw error;
      }

      // Acionar o webhook após o sucesso do Supabase
      const webhookUrl = 'https://primary-production-76569.up.railway.app/webhook/formulario';
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        });

        if (!webhookResponse.ok) {
          // Log do erro sem interromper o fluxo de sucesso do usuário
          console.error('Webhook failed:', webhookResponse.statusText, await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Error calling webhook:', webhookError);
      }

      setSubmissionStatus('success');
      setTimeout(() => setSubmissionStatus('idle'), 5000); // Reset after 5 seconds
      setFormData(initialFormData); // Reset form on success
    } catch (error: any) {
      setSubmissionStatus('error');
      console.error('Supabase submission error:', error);

      let displayMessage = 'Ocorreu um erro inesperado ao enviar o formulário.';

      if (error && error.message) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes('failed to fetch')) {
          displayMessage = "Erro de Conexão: Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
        } else if (lowerCaseMessage.includes('invalid api key') || lowerCaseMessage.includes('jwt')) {
          displayMessage = "Erro de Configuração: A chave de API do Supabase é inválida. Por favor, verifique o arquivo de configuração.";
        } else {
          displayMessage = `Erro no envio: ${error.message}`;
        }
      } else {
        // Fallback for non-standard errors
        displayMessage = 'Ocorreu um erro desconhecido. Verifique o console para mais detalhes.';
      }
      
      setErrorMessage(displayMessage);
    }
  };

  const renderSubmitButtonContent = () => {
    switch (submissionStatus) {
      case 'submitting':
        return (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </>
        );
      case 'success':
        return 'Enviado com Sucesso!';
      case 'error':
        return 'Tentar Novamente';
      default:
        return 'Salvar e Enviar Solicitação';
    }
  };

  return (
    <main>
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-900/50 p-6 sm:p-8 md:p-10">
            <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-400">
                Quality Home Avalia
            </h1>
            <p className="text-slate-400 mt-2">
                Preencha o formulário abaixo para solicitar sua avaliação de imóvel.
            </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
            
            <fieldset className="border border-slate-700 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-cyan-400">Informações do Solicitante</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nome Completo do Solicitante" htmlFor="solicitanteNome">
                    <Input type="text" id="solicitanteNome" name="solicitanteNome" value={formData.solicitanteNome} onChange={handleChange} required />
                </FormField>
                <FormField label="WhatsApp para Contato" htmlFor="whatsapp">
                    <Input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleWhatsAppChange} placeholder="(XX) XXXXX-XXXX" required />
                </FormField>
                </div>
            </fieldset>
            
            <fieldset className="border border-slate-700 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-cyan-400">Endereço do Imóvel</legend>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <FormField label="Logradouro" htmlFor="logradouro" className="md:col-span-4">
                    <Input type="text" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Número" htmlFor="numero" className="md:col-span-2">
                    <Input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Bairro" htmlFor="bairro" className="md:col-span-3">
                    <Input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Cidade" htmlFor="cidade" className="md:col-span-3">
                    <Input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required />
                    </FormField>
                    <FormField label="UF" htmlFor="uf" className="md:col-span-1">
                    <Select id="uf" name="uf" value={formData.uf} onChange={handleChange} required>
                       {UF_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select>
                    </FormField>
                    <FormField label="CEP" htmlFor="cep" className="md:col-span-2">
                    <Input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} required />
                    </FormField>
                </div>
            </fieldset>

            <fieldset className="border border-slate-700 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-cyan-400">Detalhes do Imóvel</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Tipo de Imóvel" htmlFor="tipoImovel">
                    <Select id="tipoImovel" name="tipoImovel" value={formData.tipoImovel} onChange={handleChange} required>
                    {TIPO_IMOVEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                   </Select>
                </FormField>
                <FormField label="Área do Terreno (m²)" htmlFor="areaTerreno">
                    <Input type="text" id="areaTerreno" name="areaTerreno" value={formData.areaTerreno} onChange={handleChange} placeholder='Ex: 300 ou "não se aplica"' />
                </FormField>
                <FormField label="Área Construída (m²)" htmlFor="areaConstruida">
                    <Input type="text" id="areaConstruida" name="areaConstruida" value={formData.areaConstruida} onChange={handleChange} placeholder='Ex: 150 ou "não se aplica"' />
                </FormField>
                <FormField label="Idade da Construção (anos)" htmlFor="idadeConstrucao">
                    <Input type="text" id="idadeConstrucao" name="idadeConstrucao" value={formData.idadeConstrucao} onChange={handleChange} placeholder="Aproximada" />
                </FormField>
                <FormField label="O Imóvel está Ocupado ou Desocupado?" htmlFor="ocupacao">
                    <Select id="ocupacao" name="ocupacao" value={formData.ocupacao} onChange={handleChange} required>
                    {OCUPADO_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select>
                </FormField>
                <FormField label="Nome do Condomínio" htmlFor="nomeCondominio">
                    <Input type="text" id="nomeCondominio" name="nomeCondominio" value={formData.nomeCondominio} onChange={handleChange} placeholder='"N/A" se não se aplica' />
                </FormField>
                <FormField label="Estado Geral do Imóvel" htmlFor="estadoGeral" className="md:col-span-3">
                    <Textarea id="estadoGeral" name="estadoGeral" value={formData.estadoGeral} onChange={handleChange} placeholder="Descrição das condições gerais, conservação, etc." required />
                </FormField>
                </div>
            </fieldset>

            <fieldset className="border border-slate-700 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-cyan-400">Documentação e Finalidade</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Documentos Disponíveis" htmlFor="documentosDisponiveis">
                    <Input type="text" id="documentosDisponiveis" name="documentosDisponiveis" value={formData.documentosDisponiveis} onChange={handleChange} placeholder='Ex: Matrícula, IPTU (separados por vírgula)' />
                </FormField>
                <FormField label="Situação dos Documentos" htmlFor="situacaoDocumentos">
                    <Select id="situacaoDocumentos" name="situacaoDocumentos" value={formData.situacaoDocumentos} onChange={handleChange} required>
                    {SITUACAO_DOCUMENTOS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select>
                </FormField>
                <FormField label="Finalidade da Avaliação" htmlFor="finalidadeAvaliacao" className="md:col-span-2">
                    <Select id="finalidadeAvaliacao" name="finalidadeAvaliacao" value={formData.finalidadeAvaliacao} onChange={handleChange} required>
                    {FINALIDADE_AVALIACAO_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select>
                </FormField>
                </div>
            </fieldset>
            
            <fieldset className="border border-slate-700 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-cyan-400">Informações Adicionais</legend>
                <div className="grid grid-cols-1 gap-6">
                <FormField label="Links de Fotos do Imóvel" htmlFor="linksFotos">
                    <Input type="text" id="linksFotos" name="linksFotos" value={formData.linksFotos} onChange={handleChange} placeholder='Cole os links aqui, separados por vírgula' />
                </FormField>
                <FormField label="Detalhes Adicionais (opcional)" htmlFor="detalhesAdicionais">
                    <Textarea id="detalhesAdicionais" name="detalhesAdicionais" value={formData.detalhesAdicionais} onChange={handleChange} placeholder="Inclua qualquer outra informação que julgar relevante."/>
                </FormField>
                </div>
            </fieldset>
            
            <div className="flex flex-col items-center gap-4 pt-4">
                {submissionStatus === 'error' && (
                <p className="text-red-400 bg-red-900/30 px-4 py-2 rounded-lg text-center">{errorMessage}</p>
                )}
                {submissionStatus === 'success' && (
                <p className="text-green-400 bg-green-900/30 px-4 py-2 rounded-lg text-center">Formulário enviado com sucesso! Entraremos em contato em breve.</p>
                )}

                <button
                type="submit"
                disabled={submissionStatus === 'submitting'}
                className={`w-full max-w-md flex items-center justify-center font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    submissionStatus === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                    submissionStatus === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                    'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/30'
                }`}
                >
                {renderSubmitButtonContent()}
                </button>
            </div>
            </form>
        </div>
        </div>
    </main>
  );
};

export default Home;
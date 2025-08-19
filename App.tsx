

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { FormData, FormStatus } from './types';
import { TIPO_IMOVEL_OPTIONS, SITUACAO_DOCUMENTOS_OPTIONS, FINALIDADE_AVALIACAO_OPTIONS, OCUPADO_OPTIONS, DOCUMENTOS_OPTIONS, TIPO_CLIENTE_OPTIONS, UF_OPTIONS } from './constants';
import { UserIcon, PhoneIcon, HomeIcon, BuildingIcon, DocumentIcon, CameraIcon, InfoIcon, SpinnerIcon, CheckCircleIcon, UploadIcon, TrashIcon } from './components/Icons';
import FormControl from './components/FormControl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialFormData: FormData = {
  nomeSolicitante: '',
  whatsapp: '',
  tipoCliente: '',
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
  ocupado: '',
  nomeCondominio: '',
  condominioNA: false,
  detalhesAdicionais: '',
};

const getBase64Image = (url: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Use a CORS proxy if the image is on a different domain and has CORS issues
            const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = () => reject(new Error('Failed to convert image to base64: ' + reader.error));
        } catch (err) {
            reject(new Error('Failed to fetch image: ' + String(err)));
        }
    });
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: 'idle', message: '' });
  const [submittedLaudoId, setSubmittedLaudoId] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [pdfMessage, setPdfMessage] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [finalImageUrls, setFinalImageUrls] = useState<string[]>([]);


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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const newFiles = Array.from(e.dataTransfer.files);
          setImageFiles(prev => [...prev, ...newFiles]);
          e.dataTransfer.clearData();
      }
  }, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ type: 'loading', message: 'Enviando...' });

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const prefix = `QH-${dateString}-`;

    const { count, error: countError } = await supabase
        .from('avaliacoes_imoveis')
        .select('laudo_id', { count: 'exact', head: true })
        .like('laudo_id', `${prefix}%`);

    if (countError) {
        setFormStatus({ type: 'error', message: `Erro ao gerar ID do laudo: ${countError.message}` });
        return;
    }

    const newSequence = String((count ?? 0) + 1).padStart(4, '0');
    const laudoId = `${prefix}${newSequence}`;
    
    let publicUrls: string[] = [];
    if(imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => {
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.name}`;
            const filePath = `fotos_imoveis/${laudoId}/${uniqueFileName}`;
            return supabase.storage.from('quallity-home').upload(filePath, file);
        });

        const uploadResults = await Promise.all(uploadPromises);
        const uploadErrors = uploadResults.filter(result => result.error);

        if (uploadErrors.length > 0) {
            setFormStatus({ type: 'error', message: `Falha no upload de uma ou mais imagens: ${uploadErrors.map(e => e.error?.message).join(', ')}` });
            return;
        }
        
        const urlResults = uploadResults.map(result => {
             if(result.data?.path) {
                return supabase.storage.from('quallity-home').getPublicUrl(result.data.path).data.publicUrl;
            }
            return null;
        });

        publicUrls = urlResults.filter((url): url is string => url !== null);
        setFinalImageUrls(publicUrls);
    }


    const submissionData = {
        laudo_id: laudoId,
        whatsapp: formData.whatsapp,
        nome_completo: formData.nomeSolicitante,
        tipo_cliente: formData.tipoCliente,
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
        links_fotos: publicUrls,
        nome_condominio: formData.condominioNA ? null : formData.nomeCondominio,
        condominio_na: formData.condominioNA,
        detalhes_adicionais: formData.detalhesAdicionais,
    };
    
    const { error } = await supabase.from('avaliacoes_imoveis').insert([submissionData]);

    if (error) {
        setFormStatus({ type: 'error', message: `Erro ao salvar no banco de dados: ${error.message}` });
        return;
    }

    try {
        const webhookResponse = await fetch('https://n8n.intelektus.tech/webhook/formulario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        });

        if (!webhookResponse.ok) {
            console.error('Webhook failed:', webhookResponse.statusText);
        }
    } catch (webhookError) {
        console.error('Error sending to webhook:', webhookError);
    }
    
    setSubmittedLaudoId(laudoId);
    setFormStatus({ type: 'success', message: 'Formulário enviado com sucesso! Entraremos em contato em breve.' });
  };
  
  const handleResetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormStatus({ type: 'idle', message: '' });
    setSubmittedLaudoId(null);
    setPdfStatus('idle');
    setPdfMessage('');
    setImageFiles([]);
    setFinalImageUrls([]);
  }, []);

  const handleGenerateAndSavePdf = async () => {
      if (!submittedLaudoId) return;
      setPdfStatus('generating');
      setPdfMessage('Gerando PDF, por favor aguarde...');

      try {
          const doc = new jsPDF();
          const logoUrl = 'https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/refs/heads/main/logoTransparente2.png';
          
          try {
            const logoBase64 = await getBase64Image(logoUrl);
            doc.addImage(logoBase64, 'PNG', 15, 10, 50, 15);
          } catch(e) {
            console.error("Could not add logo to PDF:", e);
          }

          doc.setFontSize(18);
          doc.text('Relatório de Solicitação de Avaliação', 105, 22, { align: 'center' });
          doc.setFontSize(12);
          doc.text(`ID do Laudo: ${submittedLaudoId}`, 105, 30, { align: 'center' });

          const finalY = (doc as any).lastAutoTable.finalY || 40;

          autoTable(doc, {
              startY: finalY,
              head: [['Informações do Solicitante']],
              body: [
                  [{ content: 'Nome Completo', styles: { fontStyle: 'bold' } }, formData.nomeSolicitante],
                  [{ content: 'Whatsapp', styles: { fontStyle: 'bold' } }, formData.whatsapp],
                  [{ content: 'Tipo de Cliente', styles: { fontStyle: 'bold' } }, TIPO_CLIENTE_OPTIONS.find(o => o.value === formData.tipoCliente)?.label ?? ''],
              ],
              theme: 'striped',
              headStyles: { fillColor: [245, 158, 11] }
          });

          autoTable(doc, {
              head: [['Endereço do Imóvel']],
              body: [
                  [{ content: 'Logradouro', styles: { fontStyle: 'bold' } }, formData.logradouro],
                  [{ content: 'Número', styles: { fontStyle: 'bold' } }, formData.numero],
                  [{ content: 'Bairro', styles: { fontStyle: 'bold' } }, formData.bairro],
                  [{ content: 'Cidade/UF', styles: { fontStyle: 'bold' } }, `${formData.cidade}/${formData.uf}`],
                  [{ content: 'CEP', styles: { fontStyle: 'bold' } }, formData.cep],
              ],
              theme: 'striped',
              headStyles: { fillColor: [245, 158, 11] }
          });

          autoTable(doc, {
              head: [['Detalhes do Imóvel']],
              body: [
                  [{ content: 'Tipo de Imóvel', styles: { fontStyle: 'bold' } }, TIPO_IMOVEL_OPTIONS.find(o=>o.value === formData.tipoImovel)?.label ?? ''],
                  [{ content: 'Área do Terreno', styles: { fontStyle: 'bold' } }, formData.areaTerrenoNA ? 'N/A' : `${formData.areaTerreno} m²`],
                  [{ content: 'Área Construída', styles: { fontStyle: 'bold' } }, formData.areaConstruidaNA ? 'N/A' : `${formData.areaConstruida} m²`],
                  [{ content: 'Idade da Construção', styles: { fontStyle: 'bold' } }, formData.idadeConstrucao ? `${formData.idadeConstrucao} anos` : 'N/A'],
                  [{ content: 'Ocupação', styles: { fontStyle: 'bold' } }, OCUPADO_OPTIONS.find(o=>o.value === formData.ocupado)?.label ?? ''],
                  [{ content: 'Condomínio', styles: { fontStyle: 'bold' } }, formData.condominioNA ? 'N/A' : formData.nomeCondominio],
                  [{ content: 'Estado Geral', styles: { fontStyle: 'bold' } }, formData.estadoGeral],
              ],
              theme: 'striped',
              headStyles: { fillColor: [245, 158, 11] }
          });

           autoTable(doc, {
              head: [['Documentação e Finalidade']],
              body: [
                  [{ content: 'Documentos Disponíveis', styles: { fontStyle: 'bold' } }, formData.documentosDisponiveis.join(', ')],
                  [{ content: 'Situação Documentos', styles: { fontStyle: 'bold' } }, SITUACAO_DOCUMENTOS_OPTIONS.find(o=>o.value===formData.situacaoDocumentos)?.label ?? ''],
                  [{ content: 'Finalidade', styles: { fontStyle: 'bold' } }, FINALIDADE_AVALIACAO_OPTIONS.find(o=>o.value===formData.finalidade)?.label ?? ''],
              ],
              theme: 'striped',
              headStyles: { fillColor: [245, 158, 11] }
          });

          if (finalImageUrls.length > 0) {
              autoTable(doc, {
                  head: [['Links das Fotos do Imóvel']],
                  body: finalImageUrls.map(url => [{ content: url, styles: { textColor: [43, 108, 176], fontStyle: 'italic' } }]),
                  theme: 'striped',
                  headStyles: { fillColor: [245, 158, 11] }
              });
          }

          const pdfBlob = doc.output('blob');

          const filePath = `${submittedLaudoId}.pdf`;
          const { error: uploadError } = await supabase.storage
              .from('laudos_pdf')
              .upload(filePath, pdfBlob, {
                  contentType: 'application/pdf',
                  upsert: true,
              });

          if (uploadError) throw new Error(`Erro no upload do PDF: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
              .from('laudos_pdf')
              .getPublicUrl(filePath);

          if (!publicUrl) throw new Error('Não foi possível obter a URL pública do PDF.');

          const { error: updateError } = await supabase
              .from('avaliacoes_imoveis')
              .update({ pdf_url: publicUrl })
              .eq('laudo_id', submittedLaudoId);

          if (updateError) throw new Error(`Erro ao salvar URL no banco: ${updateError.message}`);

          setPdfStatus('success');
          setPdfMessage('PDF gerado e salvo com sucesso! O download iniciará em breve.');
          
          doc.save(`${submittedLaudoId}.pdf`);

      } catch (error) {
          console.error("PDF Generation/Upload Error:", error);
          setPdfStatus('error');
          setPdfMessage(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao gerar o PDF.');
      }
  };

  const inputStyles = "w-full bg-white border border-gray-300 text-gray-900 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 p-2.5";
  const selectStyles = inputStyles + " appearance-none";
  const sectionTitleStyles = "text-xl font-bold text-gray-800 border-b-2 border-amber-200 pb-2 mb-6 flex items-center gap-3 text-amber-500";

  if (formStatus.type === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
              <CheckCircleIcon className="w-24 h-24 text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Concluído! ✅</h1>
          <p className="text-gray-600 text-lg mb-8">
            {formStatus.message}
          </p>
          <div className="bg-gray-100 p-6 rounded-lg mt-8">
              <h2 className="text-lg font-bold text-gray-800">Seu Laudo (#{submittedLaudoId})</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200/80">
        <div className="text-center mb-10">
          <img src="https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/refs/heads/main/logoTransparente2.png" alt="Quality Home Avalia Logo" className="mx-auto h-32 sm:h-44 w-auto mb-4" />
          <p className="text-gray-600 text-lg">Formulário de Solicitação de Avaliação de Imóvel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
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
              <div className="md:col-span-2">
                <FormControl label="Tipo de Cliente" htmlFor="tipoCliente">
                    <select id="tipoCliente" name="tipoCliente" value={formData.tipoCliente} onChange={handleChange} className={selectStyles} required>
                        <option value="" disabled>Selecione...</option>
                        {TIPO_CLIENTE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </FormControl>
              </div>
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
                  <select id="uf" name="uf" value={formData.uf} onChange={handleChange} className={selectStyles} required>
                    <option value="" disabled>Selecione...</option>
                    {UF_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
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
                      <input type="checkbox" id="areaTerrenoNA" name="areaTerrenoNA" checked={formData.areaTerrenoNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                      <label htmlFor="areaTerrenoNA" className="ml-2 block text-sm text-gray-700">Não se aplica</label>
                  </div>
                </FormControl>
                 <FormControl label="Área Construída (m²)" htmlFor="areaConstruida">
                    <input type="number" id="areaConstruida" name="areaConstruida" value={formData.areaConstruida} onChange={handleChange} className={inputStyles} disabled={formData.areaConstruidaNA} />
                    <div className="flex items-center mt-2">
                       <input type="checkbox" id="areaConstruidaNA" name="areaConstruidaNA" checked={formData.areaConstruidaNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                       <label htmlFor="areaConstruidaNA" className="ml-2 block text-sm text-gray-700">Não se aplica</label>
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
                        <input type="checkbox" id="condominioNA" name="condominioNA" checked={formData.condominioNA} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                        <label htmlFor="condominioNA" className="ml-2 block text-sm text-gray-700">Não se aplica</label>
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
                    <div className="space-y-2 bg-gray-100 p-3 rounded-md">
                        {DOCUMENTOS_OPTIONS.map(doc => (
                           <div key={doc} className="flex items-center">
                               <input id={`doc-${doc}`} type="checkbox" value={doc} onChange={handleMultiCheckboxChange} checked={formData.documentosDisponiveis.includes(doc)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                               <label htmlFor={`doc-${doc}`} className="ml-2 text-sm text-gray-700">{doc}</label>
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

           {/* Fotos do Imóvel */}
            <section>
                <h2 className={sectionTitleStyles}><CameraIcon />Fotos do Imóvel</h2>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/50'}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-center text-gray-600">
                        <span className="font-semibold text-amber-600">Clique para selecionar</span> ou arraste e solte as fotos aqui.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Formatos suportados: PNG, JPG, JPEG, WEBP</p>
                </div>
                {imageFiles.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imageFiles.map((file, index) => (
                            <div key={index} className="relative group aspect-w-1 aspect-h-1">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${file.name}`}
                                    className="w-full h-full object-cover rounded-md shadow-md"
                                    onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-md">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-75 transition-all duration-300"
                                        aria-label="Remover imagem"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

           {/* Informações Adicionais */}
           <section>
              <h2 className={sectionTitleStyles}><InfoIcon />Informações Adicionais</h2>
                 <FormControl label="Detalhes Adicionais (Opcional)" htmlFor="detalhesAdicionais" icon={<InfoIcon/>}>
                    <textarea id="detalhesAdicionais" name="detalhesAdicionais" value={formData.detalhesAdicionais} onChange={handleChange} rows={4} className={inputStyles} placeholder="Qualquer outra informação relevante que deseje incluir."></textarea>
                 </FormControl>
           </section>

          {/* Botão de Envio */}
          <div className="text-center pt-4">
              {(formStatus.type === 'loading' || formStatus.type === 'error') && formStatus.message && (
                  <div className={`p-4 mb-4 text-sm rounded-lg ${
                      formStatus.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`} role="alert">
                      {formStatus.message}
                  </div>
              )}
            <button type="submit" disabled={formStatus.type === 'loading'} className="inline-flex items-center justify-center w-full md:w-auto px-12 py-3 text-lg font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/30">
              {formStatus.type === 'loading' ? <><SpinnerIcon /> Enviando...</> : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
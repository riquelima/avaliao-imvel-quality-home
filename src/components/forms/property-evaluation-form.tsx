"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Plus, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  nomeCompleto: string
  whatsapp: string
  endereco: string
  tipoImovel: string
  areaTerreno: string
  areaConstruida: string
  idadeConstrucao: string
  estadoGeral: string
  ocupado: string
  documentos: string[]
  situacaoDocumentos: string
  finalidade: string
  linksfotos: string[]
  nomeCondominio: string
  detalhesAdicionais: string
  areaTerrenoNA: boolean
  areaConstruidaNA: boolean
  condominioNA: boolean
}

export default function PropertyEvaluationForm() {
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    whatsapp: "",
    endereco: "",
    tipoImovel: "",
    areaTerreno: "",
    areaConstruida: "",
    idadeConstrucao: "",
    estadoGeral: "",
    ocupado: "",
    documentos: [],
    situacaoDocumentos: "",
    finalidade: "",
    linksfotos: [""],
    nomeCondominio: "",
    detalhesAdicionais: "",
    areaTerrenoNA: false,
    areaConstruidaNA: false,
    condominioNA: false,
  })

  const [focusedField, setFocusedField] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleDocumentChange = useCallback((documento: string, checked: boolean) => {
    const updatedDocumentos = checked 
      ? [...formData.documentos, documento]
      : formData.documentos.filter(doc => doc !== documento)
    handleInputChange("documentos", updatedDocumentos)
  }, [formData.documentos, handleInputChange])

  const addPhotoLink = useCallback(() => {
    handleInputChange("linksfotos", [...formData.linksfotos, ""])
  }, [formData.linksfotos, handleInputChange])

  const removePhotoLink = useCallback((index: number) => {
    const newLinks = formData.linksfotos.filter((_, i) => i !== index)
    handleInputChange("linksfotos", newLinks)
  }, [formData.linksfotos, handleInputChange])

  const updatePhotoLink = useCallback((index: number, value: string) => {
    const newLinks = [...formData.linksfotos]
    newLinks[index] = value
    handleInputChange("linksfotos", newLinks)
  }, [formData.linksfotos, handleInputChange])

  const formatWhatsApp = useCallback((value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '')
    
    // Aplica a máscara (xx) xxxxxxxxx
    if (cleanValue.length <= 2) {
      return cleanValue
    } else if (cleanValue.length <= 11) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`
    } else {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 11)}`
    }
  }, [])

  const handleWhatsAppChange = useCallback((value: string) => {
    const formatted = formatWhatsApp(value)
    handleInputChange("whatsapp", formatted)
  }, [formatWhatsApp, handleInputChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.nomeCompleto || !formData.endereco || !formData.tipoImovel) {
      toast.error("Por favor, preencha os campos obrigatórios: Nome, Endereço e Tipo de Imóvel")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for webhook
      const webhookData = {
        nomeCompleto: formData.nomeCompleto,
        whatsapp: formData.whatsapp || null,
        endereco: formData.endereco,
        tipoImovel: formData.tipoImovel,
        areaTerreno: formData.areaTerrenoNA ? null : formData.areaTerreno || null,
        areaConstruida: formData.areaConstruidaNA ? null : formData.areaConstruida || null,
        areaTerrenoNA: formData.areaTerrenoNA,
        areaConstruidaNA: formData.areaConstruidaNA,
        idadeConstrucao: formData.idadeConstrucao || null,
        estadoGeral: formData.estadoGeral,
        ocupado: formData.ocupado,
        documentos: formData.documentos,
        situacaoDocumentos: formData.situacaoDocumentos,
        finalidade: formData.finalidade,
        linksfotos: formData.linksfotos.filter(link => link.trim() !== ""),
        nomeCondominio: formData.condominioNA ? null : formData.nomeCondominio || null,
        condominioNA: formData.condominioNA,
        detalhesAdicionais: formData.detalhesAdicionais || null,
        dataEnvio: new Date().toISOString()
      }

      // Send to webhook
      const response = await fetch('https://primary-production-76569.up.railway.app/webhook/formulario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Webhook response:', result)
      
      toast.success("Avaliação enviada com sucesso! Entraremos em contato em breve.")
      
      // Reset form
      setFormData({
        nomeCompleto: "",
        whatsapp: "",
        endereco: "",
        tipoImovel: "",
        areaTerreno: "",
        areaConstruida: "",
        idadeConstrucao: "",
        estadoGeral: "",
        ocupado: "",
        documentos: [],
        situacaoDocumentos: "",
        finalidade: "",
        linksfotos: [""],
        nomeCondominio: "",
        detalhesAdicionais: "",
        areaTerrenoNA: false,
        areaConstruidaNA: false,
        condominioNA: false,
      })

    } catch (error) {
      console.error('Erro ao enviar para o webhook:', error)
      toast.error("Erro ao enviar avaliação. Verifique sua conexão e tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const FloatingInput = useCallback(({ 
    id, 
    type = "text", 
    placeholder, 
    value, 
    onChange, 
    disabled = false,
    className = ""
  }: {
    id: string
    type?: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
  }) => {
    const isFilled = value.length > 0
    const isFocused = focusedField === id

    return (
      <div className={`relative ${className}`}>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField("")}
          disabled={disabled}
          className="bg-input border-border text-foreground placeholder:text-transparent peer pt-6 pb-2 px-3 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Label
          htmlFor={id}
          className={`absolute left-3 transition-all duration-300 pointer-events-none text-muted-foreground
            ${isFocused || isFilled 
              ? "top-2 text-xs text-primary" 
              : "top-1/2 -translate-y-1/2 text-sm"
            }`}
        >
          {placeholder}
        </Label>
      </div>
    )
  }, [focusedField])

  const FloatingTextarea = useCallback(({ 
    id, 
    placeholder, 
    value, 
    onChange, 
    rows = 3,
    className = ""
  }: {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    rows?: number
    className?: string
  }) => {
    const isFilled = value.length > 0
    const isFocused = focusedField === id

    return (
      <div className={`relative ${className}`}>
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField("")}
          rows={rows}
          className="bg-input border-border text-foreground placeholder:text-transparent peer pt-6 pb-2 px-3 resize-none transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Label
          htmlFor={id}
          className={`absolute left-3 transition-all duration-300 pointer-events-none text-muted-foreground
            ${isFocused || isFilled 
              ? "top-2 text-xs text-primary" 
              : "top-6 text-sm"
            }`}
        >
          {placeholder}
        </Label>
      </div>
    )
  }, [focusedField])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-lg p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Formulário de Avaliação
            </h1>
            <p className="text-muted-foreground">
              Preencha as informações do imóvel para solicitar uma avaliação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Informações Pessoais
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <FloatingInput
                  id="nomeCompleto"
                  placeholder="Nome completo do solicitante *"
                  value={formData.nomeCompleto}
                  onChange={(value) => handleInputChange("nomeCompleto", value)}
                />
                <FloatingInput
                  id="whatsapp"
                  placeholder="WhatsApp com DDD - Ex: (71) 985431158"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                />
              </div>
            </section>

            {/* Property Details Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Detalhes do Imóvel
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <FloatingTextarea
                  id="endereco"
                  placeholder="Endereço completo do imóvel *"
                  value={formData.endereco}
                  onChange={(value) => handleInputChange("endereco", value)}
                  rows={3}
                  className="lg:col-span-2"
                />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Tipo de imóvel *</Label>
                  <Select value={formData.tipoImovel} onValueChange={(value) => handleInputChange("tipoImovel", value)}>
                    <SelectTrigger className="bg-input border-border text-foreground transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="urbano">Urbano</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="misto">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="areaTerrenoNA"
                        checked={formData.areaTerrenoNA}
                        onCheckedChange={(checked) => handleInputChange("areaTerrenoNA", checked as boolean)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="areaTerrenoNA" className="text-sm text-muted-foreground">
                        Não se aplica
                      </Label>
                    </div>
                    <FloatingInput
                      id="areaTerreno"
                      type="number"
                      placeholder="Área do terreno em m²"
                      value={formData.areaTerreno}
                      onChange={(value) => handleInputChange("areaTerreno", value)}
                      disabled={formData.areaTerrenoNA}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="areaConstruidaNA"
                        checked={formData.areaConstruidaNA}
                        onCheckedChange={(checked) => handleInputChange("areaConstruidaNA", checked as boolean)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label htmlFor="areaConstruidaNA" className="text-sm text-muted-foreground">
                        Não se aplica
                      </Label>
                    </div>
                    <FloatingInput
                      id="areaConstruida"
                      type="number"
                      placeholder="Área construída em m²"
                      value={formData.areaConstruida}
                      onChange={(value) => handleInputChange("areaConstruida", value)}
                      disabled={formData.areaConstruidaNA}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Construction Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Informações da Construção
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <FloatingInput
                  id="idadeConstrucao"
                  type="number"
                  placeholder="Idade da construção em anos"
                  value={formData.idadeConstrucao}
                  onChange={(value) => handleInputChange("idadeConstrucao", value)}
                />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">O imóvel está ocupado?</Label>
                  <RadioGroup 
                    value={formData.ocupado} 
                    onValueChange={(value) => handleInputChange("ocupado", value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ocupado" id="ocupado" className="border-border text-primary" />
                      <Label htmlFor="ocupado" className="text-sm text-foreground">Ocupado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="desocupado" id="desocupado" className="border-border text-primary" />
                      <Label htmlFor="desocupado" className="text-sm text-foreground">Desocupado</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <FloatingTextarea
                  id="estadoGeral"
                  placeholder="Estado geral do imóvel"
                  value={formData.estadoGeral}
                  onChange={(value) => handleInputChange("estadoGeral", value)}
                  rows={4}
                  className="lg:col-span-2"
                />
              </div>
            </section>

            {/* Documentation Section */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Documentação
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-foreground">Documentos disponíveis</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Matrícula", "IPTU", "Escritura", "Planta aprovada", "Nenhum", "Outros"].map((doc) => (
                      <div key={doc} className="flex items-center space-x-2">
                        <Checkbox
                          id={doc}
                          checked={formData.documentos.includes(doc)}
                          onCheckedChange={(checked) => handleDocumentChange(doc, checked as boolean)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={doc} className="text-sm text-foreground">{doc}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Situação dos documentos</Label>
                  <Select value={formData.situacaoDocumentos} onValueChange={(value) => handleInputChange("situacaoDocumentos", value)}>
                    <SelectTrigger className="bg-input border-border text-foreground transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Evaluation Purpose */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Finalidade da Avaliação
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Finalidade</Label>
                  <Select value={formData.finalidade} onValueChange={(value) => handleInputChange("finalidade", value)}>
                    <SelectTrigger className="bg-input border-border text-foreground transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                      <SelectValue placeholder="Selecione a finalidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="partilha">Partilha</SelectItem>
                      <SelectItem value="judicial">Judicial</SelectItem>
                      <SelectItem value="financiamento">Financiamento</SelectItem>
                      <SelectItem value="seguro">Seguro</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Media & Additional Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-display font-semibold text-foreground border-b border-border/30 pb-2">
                Mídia e Informações Adicionais
              </h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Links de fotos do imóvel</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhotoLink}
                      className="bg-secondary border-border text-foreground hover:bg-secondary/80 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar link
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.linksfotos.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <FloatingInput
                          id={`foto-${index}`}
                          placeholder={`Link da foto ${index + 1}`}
                          value={link}
                          onChange={(value) => updatePhotoLink(index, value)}
                          className="flex-1"
                        />
                        {formData.linksfotos.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePhotoLink(index)}
                            className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20 transition-all duration-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="condominioNA"
                      checked={formData.condominioNA}
                      onCheckedChange={(checked) => handleInputChange("condominioNA", checked as boolean)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="condominioNA" className="text-sm text-muted-foreground">
                      N/A
                    </Label>
                  </div>
                  <FloatingInput
                    id="nomeCondominio"
                    placeholder="Nome do condomínio"
                    value={formData.nomeCondominio}
                    onChange={(value) => handleInputChange("nomeCondominio", value)}
                    disabled={formData.condominioNA}
                  />
                </div>
                
                <FloatingTextarea
                  id="detalhesAdicionais"
                  placeholder="Detalhes adicionais (opcional)"
                  value={formData.detalhesAdicionais}
                  onChange={(value) => handleInputChange("detalhesAdicionais", value)}
                  rows={5}
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:brightness-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Salvar Avaliação
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
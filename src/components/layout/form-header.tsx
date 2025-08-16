"use client"

import { Home, Star } from "lucide-react"

export default function FormHeader() {
  return (
    <div className="bg-slate-900 border-b border-slate-600">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 pointer-events-none" />
      
      <div className="relative container max-w-4xl mx-auto px-6 py-8">
        {/* Company Branding */}
        <div className="text-center mb-8">
          {/* Logo and Company Name */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Home className="w-10 h-10 text-blue-500" />
              <Star className="w-4 h-4 text-violet-500 absolute -top-1 -right-1" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl font-bold text-slate-50 tracking-tight">
                Quality Home Avalia
              </h1>
              <p className="font-body text-sm text-slate-300 font-medium">
                Avaliações Imobiliárias Profissionais
              </p>
            </div>
          </div>
          
          {/* Decorative separator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent w-24" />
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent w-24" />
          </div>
        </div>

        {/* Form Title Section */}
        <div className="text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold text-slate-50">
            Formulário de Solicitação de Avaliação
          </h2>
          <p className="font-body text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Preencha os dados do imóvel para iniciar sua avaliação profissional. 
            Nossa equipe especializada analisará todas as informações para fornecer 
            uma avaliação precisa e confiável.
          </p>
        </div>

        {/* Subtle pattern decoration */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
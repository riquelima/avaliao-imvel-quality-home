"use client"

import { useState } from "react"
import FormHeader from "@/components/layout/form-header"
import PropertyEvaluationForm from "@/components/forms/property-evaluation-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <FormHeader />
      <PropertyEvaluationForm />
    </div>
  )
}
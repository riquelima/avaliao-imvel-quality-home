import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulário - Quality Home Avalia",
  description: "An elegant and intuitive dark-mode form for submitting real estate appraisal requests to Quality Home Avalia. It captures detailed property information and saves it directly to a Supabase database.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Quality Home Avalia',
  description: 'Um formulário intuitivo e elegante para coleta de dados para avaliação de imóveis, com um design moderno em modo escuro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}

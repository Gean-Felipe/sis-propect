import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'GFSites Prospect Intelligence | CRM & Prospecção Comercial',
  description: 'Sistema inteligente de descoberta de potenciais clientes e identificação de empresas sem site.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#090D16] text-gray-100 antialiased flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}

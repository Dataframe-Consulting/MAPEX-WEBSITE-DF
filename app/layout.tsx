import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/layout/SiteShell';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: {
    default: 'MAPEX - Pinturas y Recubrimientos | Distribuidor Oficial Sherwin Williams',
    template: '%s | MAPEX Pinturas',
  },
  description:
    'MAPEX es distribuidor oficial de Sherwin Williams en Hermosillo, Sonora. Pinturas, esmaltes, impermeabilizantes y más. Entrega a domicilio en todo Hermosillo.',
  keywords: ['pinturas', 'Sherwin Williams', 'Hermosillo', 'Sonora', 'recubrimientos', 'impermeabilizantes', 'MAPEX'],
  openGraph: {
    title: 'MAPEX - Pinturas y Recubrimientos',
    description: 'Distribuidor oficial Sherwin Williams en Hermosillo, Sonora.',
    locale: 'es_MX',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}

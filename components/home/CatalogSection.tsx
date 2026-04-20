import Link from 'next/link';
import { FileText, Download, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const catalogs = [
  {
    id: 'sw',
    name: 'Catálogo Sherwin Williams',
    description: 'Toda la línea de productos Sherwin Williams: pinturas, acabados, colores y soluciones técnicas.',
    file: '/catalogo-sherwin-williams.pdf',
    badge: 'Distribuidor Oficial',
    badgeColor: 'bg-[#E8462A] text-white',
    pages: '200+ páginas',
    year: '2026',
    /*
      IMAGEN PORTADA CATÁLOGO SW
      Tamaño: 320 × 200 px
      Sugerencia: Captura de la portada del PDF del catálogo Sherwin Williams
      Reemplaza con: <Image src="/images/portada-sw.jpg" ... />
    */
    image: null,
  },
  {
    id: 'boden',
    name: 'Catálogo Boden 2026',
    description: 'Línea completa de productos Boden: pinturas, esmaltes, impermeabilizantes y acabados decorativos.',
    file: '/catalogo-boden-2026.pdf',
    badge: 'Edición 2026',
    badgeColor: 'bg-[#F5A623] text-white',
    pages: '150+ páginas',
    year: '2026',
    image: null,
  },
];

export function CatalogSection() {
  return (
    <section id="catalogos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Catálogos de Productos
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Explora Nuestros <span className="gradient-text">Catálogos</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Descarga o consulta en línea nuestros catálogos completos con toda la información de productos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Preview area */}
              <div className="relative bg-gray-50 h-48 flex items-center justify-center border-b border-gray-100">
                {catalog.image ? (
                  <img src={catalog.image} alt={catalog.name} className="h-full object-cover w-full" />
                ) : (
                  <div className="text-center">
                    <FileText className="h-14 w-14 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Portada del catálogo</p>
                    <p className="text-xs text-gray-300 mt-1">320 × 200 px</p>
                  </div>
                )}
                <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${catalog.badgeColor}`}>
                  {catalog.badge}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{catalog.name}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{catalog.pages}</span>
                    <span className="text-xs text-gray-400">{catalog.year}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{catalog.description}</p>

                <div className="flex gap-3">
                  <a
                    href={catalog.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 h-10 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver en línea
                  </a>
                  <a
                    href={catalog.file}
                    download
                    className="flex-1 flex items-center justify-center gap-2 h-10 border-2 border-[#E8462A] text-[#E8462A] rounded-xl text-sm font-semibold hover:bg-[#E8462A] hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/catalogos">
              Ver página de catálogos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

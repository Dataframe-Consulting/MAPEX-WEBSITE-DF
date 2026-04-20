import type { Metadata } from 'next';
import { FileText, Download, Eye, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Catálogos de Productos',
  description: 'Descarga nuestros catálogos oficiales de Sherwin Williams y Boden.',
};

const catalogs = [
  {
    id: 'sherwin-williams',
    name: 'Catálogo Sherwin Williams',
    subtitle: 'Línea completa de pinturas y recubrimientos',
    description: 'El catálogo oficial de Sherwin Williams incluye toda la línea de pinturas para interior y exterior, esmaltes, impermeabilizantes, primers y herramientas. Encuentra información técnica, fichas de seguridad y la paleta completa de colores.',
    file: '/catalogo-sherwin-williams.pdf',
    badge: 'Distribuidor Oficial',
    badgeColor: 'bg-[#E8462A]',
    features: [
      'Pinturas de interior y exterior Premium',
      'Línea Duration® con garantía extendida',
      'Paleta de más de 1,500 colores',
      'Fichas técnicas y de seguridad',
      'Guía de acabados y aplicación',
      'Productos para proyectos industriales',
    ],
  },
  {
    id: 'boden',
    name: 'Catálogo Boden 2026',
    subtitle: 'Pinturas, esmaltes e impermeabilizantes',
    description: 'El catálogo Boden 2026 presenta la línea actualizada de productos nacionales de alta calidad: pinturas vinílicas, esmaltes, impermeabilizantes, selladores y la colección de acabados decorativos texturizados.',
    file: '/catalogo-boden-2026.pdf',
    badge: 'Edición 2026',
    badgeColor: 'bg-[#F5A623]',
    features: [
      'Pinturas vinílicas lavables',
      'Esmaltes de alta resistencia',
      'Impermeabilizantes para clima extremo',
      'Acabados decorativos y texturas',
      'Selladores y primers especializados',
      'Productos para uso en exterior',
    ],
  },
];

export default function CatalogsPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-[#1C1C2E] text-white">
        <div className="rainbow-bar" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="h-7 w-7 text-[#F5A623]" />
          </div>
          <h1 className="text-4xl font-black mb-3">
            Catálogos de <span className="gradient-text">Productos</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Consulta o descarga nuestros catálogos oficiales con información completa
            de todos los productos que manejamos.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {catalogs.map((catalog) => (
          <div key={catalog.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
              {/* Preview */}
              <div className="md:col-span-2 bg-gray-50 flex flex-col items-center justify-center p-8 min-h-64 border-b md:border-b-0 md:border-r border-gray-100">
                {/*
                  PORTADA DEL CATÁLOGO
                  Coloca aquí la imagen de portada del PDF correspondiente:
                  - Sherwin Williams: /images/portada-sw.jpg
                  - Boden: /images/portada-boden.jpg
                  Tamaño: 280 × 360 px (proporción A4)
                */}
                <div className="w-40 h-52 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 text-center px-3">Portada del catálogo<br />280×360px</p>
                </div>
                <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${catalog.badgeColor}`}>
                  {catalog.badge}
                </span>
              </div>

              {/* Info */}
              <div className="md:col-span-3 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-1">{catalog.name}</h2>
                <p className="text-[#E8462A] font-semibold text-sm mb-4">{catalog.subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{catalog.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
                  {catalog.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#E8462A] flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={catalog.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-11 px-6 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver en línea
                  </a>
                  <a
                    href={catalog.file}
                    download
                    className="flex items-center justify-center gap-2 h-11 px-6 border-2 border-[#E8462A] text-[#E8462A] rounded-xl text-sm font-semibold hover:bg-[#E8462A] hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">¿Buscas un producto específico?</p>
            <p className="text-sm text-blue-700">
              Si no encuentras el producto que buscas en nuestro catálogo en línea, contáctanos directamente.
              Tenemos acceso a toda la línea de Sherwin Williams y podemos hacer pedidos especiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

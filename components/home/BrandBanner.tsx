import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BrandBanner() {
  return (
    <section className="py-20 section-pattern bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Nuestras <span className="gradient-text">Marcas</span>
          </h2>
          <p className="text-gray-500">Representamos las mejores marcas del mercado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sherwin Williams card */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E8462A] opacity-5 rounded-full -translate-x-10 -translate-y-10 blur-xl" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-[#E8462A] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Distribuidor Oficial</p>
                  <h3 className="text-xl font-black text-gray-900">Sherwin Williams</h3>
                </div>
              </div>

              {/*
                LOGO SHERWIN WILLIAMS
                Tamaño: 200 × 60 px aprox.
                Coloca aquí el logo oficial de Sherwin Williams
                Reemplaza con: <Image src="/images/sherwin-williams-logo.png" ... />
              */}
              <div className="h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
                <p className="text-xs text-gray-400">Logo Sherwin Williams · 200×60px</p>
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                La marca número 1 en pinturas del mundo. Con más de 150 años de experiencia,
                Sherwin Williams ofrece una paleta de más de 1,500 colores y la mejor tecnología
                en recubrimientos.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Pinturas de interior y exterior premium',
                  'Tecnología Duration® con protección extrema',
                  'Sistema de mezcla de color en tienda',
                  'Garantía de calidad certificada',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E8462A] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="primary" asChild>
                <Link href="/productos?marca=sherwin-williams">
                  Ver productos SW <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Boden card */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F5A623] opacity-10 rounded-full -translate-x-10 -translate-y-10 blur-xl" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-[#F5A623] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Distribuidor Autorizado</p>
                  <h3 className="text-xl font-black text-gray-900">Boden</h3>
                </div>
              </div>

              {/*
                LOGO BODEN
                Tamaño: 200 × 60 px aprox.
                Coloca aquí el logo oficial de Boden
                Reemplaza con: <Image src="/images/boden-logo.png" ... />
              */}
              <div className="h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
                <p className="text-xs text-gray-400">Logo Boden · 200×60px</p>
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Marca nacional de alta calidad con una amplia gama de pinturas, esmaltes
                e impermeabilizantes diseñados para el clima mexicano. Excelente relación
                calidad-precio.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'Pinturas y esmaltes de larga duración',
                  'Impermeabilizantes para clima extremo',
                  'Línea decorativa con texturas únicas',
                  'Ideal para proyectos residenciales',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#F5A623] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="outline" asChild>
                <Link href="/productos?marca=boden">
                  Ver productos Boden <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

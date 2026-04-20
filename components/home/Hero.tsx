'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Star, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient min-h-[88vh] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#E8462A] opacity-10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-2 text-sm mb-6">
              <Shield className="h-4 w-4 text-[#F5A623]" />
              Distribuidor Oficial Sherwin Williams
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Donde la <span className="gradient-text">calidad</span>
              <br />
              pinta primero
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              En MAPEX encontrarás las mejores pinturas y recubrimientos en Hermosillo.
              Distribuidores oficiales Sherwin Williams con entrega a domicilio.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button variant="primary" size="xl" asChild>
                <Link href="/productos">
                  Compra Ahora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="white" size="xl" asChild>
                <Link href="/catalogos">
                  <Palette className="h-5 w-5" />
                  Ver Catálogos
                </Link>
              </Button>
            </div>

          </div>

          {/* Hero image / Visual */}
          <div className="relative hidden lg:block">
            {/* Main image container */}
            <div className="relative">
              <div className="w-full h-[480px] rounded-2xl overflow-hidden">
                <Image
                  src="/Imagenes/SW-RENDER.jpg"
                  alt="Sherwin Williams - MAPEX"
                  width={560}
                  height={480}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Floating card - SW */}
              <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 shadow-2xl w-48">
                <Image src="/Imagenes/SW-LOGO.png" alt="Sherwin Williams" width={72} height={36} className="absolute -top-20 -right-4 object-contain drop-shadow-md" />
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Sherwin Williams</p>
                    <p className="text-xs text-gray-500">Dist. Oficial</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Rating */}
              <div className="absolute -top-6 -right-4 bg-white rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3.5 w-3.5 text-[#F5A623] fill-[#F5A623]" />
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-900">Calificación 5/5</p>
                <p className="text-xs text-gray-500">+200 reseñas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

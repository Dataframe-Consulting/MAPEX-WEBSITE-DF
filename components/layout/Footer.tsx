import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, Mail, Share2, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1C1C2E] text-gray-300">
      <div className="rainbow-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/logo-mapex.png"
              alt="MAPEX"
              width={140}
              height={56}
              className="h-12 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Distribuidora oficial de Sherwin Williams en Hermosillo, Sonora.
              Calidad, variedad y atención personalizada para todos tus proyectos.
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Distribuidor Oficial</span>
            </div>
            {/* SW logo placeholder */}
            <div className="mt-3 px-3 py-1.5 border border-gray-600 rounded-lg inline-block">
              <span className="text-xs text-gray-400 font-semibold tracking-wide">SHERWIN WILLIAMS</span>
            </div>

            <div className="flex gap-3 mt-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#E8462A] transition-colors"
                aria-label="Facebook"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#E8462A] transition-colors"
                aria-label="Instagram"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Productos</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/productos?categoria=pinturas-interiores', label: 'Pinturas de Interior' },
                { href: '/productos?categoria=pinturas-exteriores', label: 'Pinturas de Exterior' },
                { href: '/productos?categoria=impermeabilizantes', label: 'Impermeabilizantes' },
                { href: '/productos?categoria=esmaltes', label: 'Esmaltes' },
                { href: '/productos?categoria=recubrimientos', label: 'Recubrimientos Especiales' },
                { href: '/productos?categoria=accesorios', label: 'Accesorios' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F5A623] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Empresa</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/#nosotros', label: 'Nosotros' },
                { href: '/catalogos', label: 'Catálogos' },
                { href: '/#servicios', label: 'Servicios' },
                { href: '/cuenta', label: 'Mi Cuenta' },
                { href: '/cuenta/pedidos', label: 'Mis Pedidos' },
                { href: '/#contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F5A623] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-4 w-4 text-[#E8462A] flex-shrink-0 mt-0.5" />
                <div>
                  <p>Nayarit #116 Int. 2</p>
                  <p>Esq. con Reyes</p>
                  <p>Hermosillo, Sonora</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="h-4 w-4 text-[#E8462A] flex-shrink-0" />
                <a href="tel:+526621234567" className="hover:text-[#F5A623] transition-colors">
                  (662) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4 text-[#E8462A] flex-shrink-0" />
                <a href="mailto:contacto@mapex.mx" className="hover:text-[#F5A623] transition-colors">
                  contacto@mapex.mx
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Clock className="h-4 w-4 text-[#E8462A] flex-shrink-0 mt-0.5" />
                <div>
                  <p>Lunes – Viernes: 8am – 6pm</p>
                  <p>Sábado: 8am – 2pm</p>
                  <p className="text-gray-500">Domingo: Cerrado</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MAPEX. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/privacidad" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-gray-300 transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

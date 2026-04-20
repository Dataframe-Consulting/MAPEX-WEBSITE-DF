import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Política de Privacidad' };

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#E8462A] mb-4 inline-block">← Volver al inicio</Link>
          <h1 className="text-4xl font-black text-gray-900">Política de Privacidad</h1>
          <p className="text-gray-500 mt-2">Última actualización: enero 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Responsable del tratamiento</h2>
            <p>MAPEX Pinturas y Recubrimientos, con domicilio en Nayarit #116 Int. 2, Hermosillo, Sonora, México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo y datos de contacto (correo electrónico, teléfono)</li>
              <li>Dirección de entrega</li>
              <li>Historial de compras y preferencias de productos</li>
              <li>Datos de navegación (cookies técnicas)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">3. Finalidad del tratamiento</h2>
            <p>Utilizamos sus datos para: procesar y entregar sus pedidos, comunicarnos sobre el estado de su compra, mejorar nuestros servicios, y cumplir con obligaciones legales. No vendemos ni compartimos sus datos con terceros para fines de marketing.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Pagos seguros</h2>
            <p>Los pagos con tarjeta son procesados por Stripe Inc., cumpliendo con el estándar PCI DSS. MAPEX no almacena datos de tarjetas de crédito o débito en sus sistemas.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Derechos ARCO</h2>
            <p>Usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición al tratamiento de sus datos. Para ejercerlos, envíe una solicitud a <a href="mailto:contacto@mapex.mx" className="text-[#E8462A] hover:underline">contacto@mapex.mx</a>.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Cambios a esta política</h2>
            <p>MAPEX se reserva el derecho de modificar esta política en cualquier momento. Los cambios se publicarán en esta página.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Contacto</h2>
            <p>Para preguntas sobre esta política: <a href="mailto:contacto@mapex.mx" className="text-[#E8462A] hover:underline">contacto@mapex.mx</a> o llámenos al (662) 123-4567.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

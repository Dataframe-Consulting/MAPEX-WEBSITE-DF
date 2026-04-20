import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Términos y Condiciones' };

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#E8462A] mb-4 inline-block">← Volver al inicio</Link>
          <h1 className="text-4xl font-black text-gray-900">Términos y Condiciones</h1>
          <p className="text-gray-500 mt-2">Última actualización: enero 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Aceptación de términos</h2>
            <p>Al realizar una compra en MAPEX, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo, le pedimos no utilizar nuestros servicios.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Productos y precios</h2>
            <p>Todos los precios están expresados en pesos mexicanos (MXN) e incluyen IVA. MAPEX se reserva el derecho de modificar precios sin previo aviso. El precio aplicable es el vigente al momento de confirmar su pedido.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">3. Proceso de compra</h2>
            <p>Al confirmar su pedido usted se compromete a proporcionar datos verídicos de entrega. El pedido se considerará confirmado una vez que reciba la llamada de confirmación de nuestro equipo.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Métodos de pago</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Efectivo contra entrega:</strong> Pago al recibir el pedido.</li>
              <li><strong>Transferencia bancaria:</strong> Debe enviarse el comprobante antes de procesar el envío.</li>
              <li><strong>Tarjeta en línea:</strong> Procesado de forma segura mediante Stripe. El cargo aplica al confirmar.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Entregas</h2>
            <p>Entregamos únicamente en Hermosillo, Sonora. El tiempo estimado de entrega es de 24 a 48 horas hábiles. El envío es gratis en pedidos mayores a $1,500 MXN. Para pedidos menores, se aplica una tarifa de $80 MXN.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Devoluciones y cambios</h2>
            <p>Aceptamos devoluciones dentro de los 7 días naturales posteriores a la entrega, siempre que el producto esté sin abrir y en su empaque original. Para iniciar una devolución, contáctenos al (662) 123-4567.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Limitación de responsabilidad</h2>
            <p>MAPEX no se hace responsable por daños derivados del uso incorrecto de los productos. Las especificaciones técnicas son orientativas; consulte con nuestros asesores para proyectos específicos.</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-3">8. Contacto</h2>
            <p>Para cualquier duda: <a href="mailto:contacto@mapex.mx" className="text-[#E8462A] hover:underline">contacto@mapex.mx</a> o (662) 123-4567.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { Truck, Palette, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Entrega a Domicilio',
    description: 'Llevamos tu pedido hasta tu puerta en todo Hermosillo. Envío gratis en compras mayores a $1,500.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Palette,
    title: 'Asesoría de Color',
    description: 'Nuestros expertos te ayudan a elegir el color y acabado perfecto para tu proyecto.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Clock,
    title: 'Servicio Rápido',
    description: 'Procesamos y enviamos tu pedido el mismo día si haces tu compra antes de la 1pm.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Users,
    title: 'Atención Personalizada',
    description: 'Equipo capacitado para asesorarte en cada etapa de tu proyecto de pintura.',
    color: 'bg-orange-100 text-orange-600',
  },
];

export function WhyMapex() {
  return (
    <section id="nosotros" className="py-20 bg-[#F8F8F8] section-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-block bg-[#E8462A] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            ¿Por qué elegirnos?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            La Mejor Experiencia en <span className="gradient-text">Pintura</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            En MAPEX no solo vendemos pintura. Ofrecemos una experiencia completa,
            desde la asesoría hasta la entrega en tu hogar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* About section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
              Sobre <span className="gradient-text">MAPEX</span>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              MAPEX es una empresa hermosillense fundada con la misión de llevar los mejores
              productos de pintura y recubrimientos a los hogares y negocios de Sonora.
              Somos distribuidores oficiales de Sherwin Williams y contamos con un amplio
              catálogo de marcas complementarias.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nuestra sucursal está ubicada en el centro de Hermosillo, en Nayarit #116 Int. 2,
              esquina con Reyes. Contamos con atención personalizada y un equipo de expertos
              listos para asesorarte en tu próximo proyecto.
            </p>
          </div>

          {/*
            IMAGEN SOBRE NOSOTROS
            Tamaño: 560 × 360 px aprox.
            Sugerencia: Foto del equipo MAPEX en la tienda, o foto exterior de la sucursal,
            o foto de un asesor con clientes.
            Reemplaza con: <Image src="/images/sobre-nosotros.jpg" ... />
          */}
          <div className="h-72 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Foto del equipo / sucursal</p>
              <p className="text-xs mt-1">560 × 360 px</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

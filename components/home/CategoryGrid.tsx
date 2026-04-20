import Link from 'next/link';
import { Paintbrush, Home, Droplets, Wrench, Layers, Package } from 'lucide-react';

const categories = [
  {
    name: 'Pinturas Interior',
    description: 'Colores y acabados para cada habitación',
    href: '/productos?categoria=pinturas-interiores',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
  },
  {
    name: 'Pinturas Exterior',
    description: 'Resistencia y durabilidad para exteriores',
    href: '/productos?categoria=pinturas-exteriores',
    icon: Paintbrush,
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
  },
  {
    name: 'Impermeabilizantes',
    description: 'Protección total contra humedad',
    href: '/productos?categoria=impermeabilizantes',
    icon: Droplets,
    color: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    name: 'Esmaltes',
    description: 'Acabado brillante y duradero',
    href: '/productos?categoria=esmaltes',
    icon: Layers,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
  },
  {
    name: 'Recubrimientos',
    description: 'Soluciones especiales de alta resistencia',
    href: '/productos?categoria=recubrimientos',
    icon: Package,
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
  },
  {
    name: 'Herramientas',
    description: 'Todo para aplicar pintura perfectamente',
    href: '/productos?categoria=accesorios',
    icon: Wrench,
    color: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-50',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Nuestras <span className="gradient-text">Categorías</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Encuentra exactamente lo que necesitas para tu proyecto de pintura
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group flex flex-col items-center p-5 rounded-2xl ${cat.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 hidden sm:block">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Correo verificado' };

export default function CorreoVerificadoPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo-mapex.png" alt="MAPEX" width={160} height={64} className="h-16 w-auto mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">¡Correo verificado!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión y comenzar a comprar.
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full" asChild>
              <Link href="/productos">
                <ShoppingBag className="h-4 w-4" />
                Explorar tienda
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="w-full" asChild>
              <Link href="/login">
                <User className="h-4 w-4" />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-[#E8462A] transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

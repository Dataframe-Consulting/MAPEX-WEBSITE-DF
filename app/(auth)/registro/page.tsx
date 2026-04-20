'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Este correo ya está registrado. Intenta iniciar sesión.'
        : 'Error al crear la cuenta. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    router.push(`/verificar-correo?email=${encodeURIComponent(form.email)}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo-mapex.png" alt="MAPEX" width={160} height={64} className="h-16 w-auto mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-6">Únete a MAPEX y compra desde tu casa</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre completo *" placeholder="Juan Pérez" value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                icon={<User className="h-4 w-4" />} required />
              <Input label="Teléfono" type="tel" placeholder="(662) 000-0000" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                icon={<Phone className="h-4 w-4" />} />
            </div>
            <Input label="Correo electrónico *" type="email" placeholder="correo@ejemplo.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              icon={<Mail className="h-4 w-4" />} required />
            <div className="relative">
              <Input label="Contraseña *" type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                icon={<Lock className="h-4 w-4" />} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input label="Confirmar contraseña *" type="password" placeholder="Repite tu contraseña"
              value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              error={error} icon={<Lock className="h-4 w-4" />} required />

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#E8462A] font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

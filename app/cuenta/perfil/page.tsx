'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function PerfilPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || '');
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '' });
        });
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (error) showToast('Error al guardar', 'error');
    else { showToast('Perfil actualizado', 'success'); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (passwords.new !== passwords.confirm) { setPassError('Las contraseñas no coinciden'); return; }
    if (passwords.new.length < 6) { setPassError('Mínimo 6 caracteres'); return; }
    setSavingPass(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) setPassError('No se pudo actualizar. Intenta cerrar sesión y usar "Olvidé mi contraseña".');
    else { showToast('Contraseña actualizada', 'success'); setPasswords({ current: '', new: '', confirm: '' }); }
    setSavingPass(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A] mb-3">
            <ArrowLeft className="h-4 w-4" /> Mi cuenta
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Mi <span className="gradient-text">Perfil</span></h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile info */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
            <User className="h-5 w-5 text-[#E8462A]" /> Información personal
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" /> Correo electrónico
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">{email}</p>
              <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar desde aquí.</p>
            </div>
            <Input label="Nombre completo" placeholder="Juan Pérez" value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              icon={<User className="h-4 w-4" />} />
            <Input label="Teléfono" type="tel" placeholder="(662) 000-0000" value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              icon={<Phone className="h-4 w-4" />} />
          </div>
          <Button type="submit" variant="primary" size="md" className="mt-5" loading={loading}>
            {saved ? <><CheckCircle className="h-4 w-4" /> Guardado</> : <><Save className="h-4 w-4" /> Guardar cambios</>}
          </Button>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#E8462A]" /> Cambiar contraseña
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <Input label="Nueva contraseña" type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres" value={passwords.new}
                onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input label="Confirmar contraseña" type="password" placeholder="Repite la nueva contraseña"
              value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              error={passError} />
          </div>
          <Button type="submit" variant="outline" size="md" className="mt-5" loading={savingPass}>
            <Lock className="h-4 w-4" /> Actualizar contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        avatar_url: '',
    });

    useEffect(() => {
        if (user) {
            async function getProfile() {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user!.id)
                    .single();

                if (data) {
                    setFormData({
                        full_name: data.full_name || '',
                        avatar_url: data.avatar_url || '',
                    });
                }
            }
            getProfile();
        }
    }, [user]);



    // ...

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const toastId = toast.loading('Caricamento avatar...');

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success('Avatar caricato!', { id: toastId });
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Errore upload: ' + error.message, { id: toastId });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', user?.id);

            if (error) throw error;
            toast.success('Profilo aggiornato con successo!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Errore aggiornamento profilo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Il mio Profilo</h1>

            <div className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="flex items-center justify-center mb-8">
                        <label className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-50 shadow-sm group-hover:border-primary transition-colors">
                                <img
                                    src={formData.avatar_url || `https://ui-avatars.com/api/?name=${formData.full_name}&background=F97316&color=fff`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold flex items-center">
                                    <Loader2 className="w-4 h-4 mr-1" /> Cambia
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-gray-50 text-[var(--text-secondary)] cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">L'email non può essere modificata.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>


                    </div>

                    {/* Success message removed (handled by toast) */}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            <span>Salva Modifiche</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Sicurezza</h2>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newPassword = formData.get('newPassword') as string;
                    const confirmPassword = formData.get('confirmPassword') as string;

                    if (newPassword.length < 6) {
                        toast.error('La password deve avere almeno 6 caratteri');
                        return;
                    }

                    if (newPassword !== confirmPassword) {
                        toast.error('Le password non coincidono');
                        return;
                    }

                    const toastId = toast.loading('Aggiornamento password...');
                    try {
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        if (error) throw error;
                        toast.success('Password aggiornata con successo!', { id: toastId });
                        (e.target as HTMLFormElement).reset();
                    } catch (error: any) {
                        toast.error('Errore: ' + error.message, { id: toastId });
                    }
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nuova Password</label>
                        <input
                            name="newPassword"
                            type="password"
                            required
                            placeholder="Minimo 6 caratteri"
                            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Conferma Nuova Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="Ripeti la password"
                            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-gray-700 border border-[var(--border-color)] px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                        Aggiorna Password
                    </button>
                </form>
            </div>
        </div>
    );
}

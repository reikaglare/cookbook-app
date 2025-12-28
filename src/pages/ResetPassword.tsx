import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChefHat, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Check if we have a session (hash fragment from email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, it might be invalid link or flow. 
                // For simplicity allow rendering but error on submit if no user.
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError('La password deve avere almeno 6 caratteri.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-background">
            {/* Visual Side (Left) */}
            <div className="hidden md:flex flex-col justify-center items-center bg-orange-50 p-12 text-center">
                <div className="max-w-md space-y-6">
                    <img
                        src="/src/assets/auth/recovery.png"
                        alt="Nuova Password"
                        className="rounded-3xl shadow-2xl mb-8 transform rotate-1 hover:rotate-0 transition-all duration-500"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">Quasi fatto! 🔐</h2>
                    <p className="text-[var(--text-secondary)]">
                        Scegli una nuova password sicura per proteggere i tuoi segreti culinari.
                    </p>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="flex items-center justify-center p-8 bg-[var(--bg-surface)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-primary mb-6">
                            <ChefHat className="w-8 h-8" />
                            <span className="text-2xl font-bold">CookBook</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Nuova Password</h1>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            Inserisci la tua nuova password sicura.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center animate-bounce">
                                <CheckCircle className="w-12 h-12 mb-3" />
                                <p className="font-bold text-lg">Password Aggiornata!</p>
                                <p className="text-sm">Reindirizzamento alla dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm animate-shake">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nuova Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="Minimo 6 caratteri"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Aggiornamento...
                                    </>
                                ) : (
                                    'Aggiorna Password'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChefHat, Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSuccess(true);
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
                        alt="Recupero account"
                        className="rounded-3xl shadow-2xl mb-8 transform -rotate-1 hover:rotate-0 transition-all duration-500"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">Recupero Account 🧩</h2>
                    <p className="text-[var(--text-secondary)]">
                        Non preoccuparti, capita a tutti. Ti aiuteremo a tornare in cucina in un attimo!
                    </p>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="flex items-center justify-center p-8 bg-[var(--bg-surface)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 text-primary mb-6 hover:opacity-80 transition-opacity">
                            <ChefHat className="w-8 h-8" />
                            <span className="text-2xl font-bold">CookBook</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Password Dimenticata?</h1>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            Inserisci la tua email e ti invieremo le istruzioni per reimpostarla.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center">
                                <CheckCircle className="w-12 h-12 mb-3" />
                                <p className="font-bold text-lg">Email inviata!</p>
                                <p className="text-sm">Controlla la tua casella di posta per procedere.</p>
                            </div>
                            <Link to="/login" className="block w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                                Torna al Login
                            </Link>
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
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="tua@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        Invio in corso...
                                    </>
                                ) : (
                                    'Invia Istruzioni'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="text-center">
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Torna al login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

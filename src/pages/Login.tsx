import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChefHat, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import loginImg from '../assets/auth/login.png';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Credenziali non valide.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-background">
            {/* Visual Side */}
            <div className="hidden md:flex flex-col justify-center items-center bg-orange-50 p-12 text-center">
                <div className="max-w-md space-y-6">
                    <img
                        src={loginImg}
                        alt="Bentornato Chef"
                        className="rounded-3xl shadow-2xl mb-8 transform rotate-3 hover:rotate-0 transition-all duration-500"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">Bentornato Chef! 👨‍🍳</h2>
                    <p className="text-[var(--text-secondary)]">
                        Le tue ricette ti stanno aspettando. Accedi per continuare a creare capolavori culinari.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 text-primary mb-6 hover:opacity-80 transition-opacity">
                            <ChefHat className="w-8 h-8" />
                            <span className="text-2xl font-bold">CookBook</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Accedi al tuo account</h1>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            Non hai ancora un account?{' '}
                            <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Registrati gratis
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="tua@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="text-right mt-1">
                                    <Link to="/forgot-password" className="text-sm font-medium text-[var(--text-secondary)] hover:text-primary transition-colors">
                                        Password dimenticata?
                                    </Link>
                                </div>
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
                                    Accesso in corso...
                                </>
                            ) : (
                                'Accedi'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

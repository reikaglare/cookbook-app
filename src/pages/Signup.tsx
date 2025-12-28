import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChefHat, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import signupImg from '../assets/auth/signup.png';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Le password non corrispondono.');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La password deve avere almeno 6 caratteri.');
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Show success message instead of redirecting
            setRegisteredEmail(formData.email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: registeredEmail,
            });

            if (error) throw error;

            setError(null);
            // Show a temporary success message
            alert('Email di verifica inviata! Controlla la tua casella di posta.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-background">
            {/* Visual Side (Left now) */}
            <div className="hidden md:flex flex-col justify-center items-center bg-orange-50 p-12 text-center">
                <div className="max-w-md space-y-6">
                    <img
                        src={signupImg}
                        alt="Unisciti a CookBook"
                        className="rounded-3xl shadow-2xl mb-8 transform -rotate-2 hover:rotate-0 transition-all duration-500"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">Inizia il tuo viaggio 🚀</h2>
                    <p className="text-[var(--text-secondary)]">
                        Unisciti ad altri chef appassionati. Organizza le tue ricette e scopri il piacere di avere tutto a portata di mano.
                    </p>
                </div>
            </div>

            {/* Form Side (Right now) */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 text-primary mb-6 hover:opacity-80 transition-opacity">
                            <ChefHat className="w-8 h-8" />
                            <span className="text-2xl font-bold">CookBook</span>
                        </Link>
                        {/* ... success logic stays same ... */}
                        {!success ? (
                            <>
                                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Crea un account</h1>
                                <p className="mt-2 text-[var(--text-secondary)]">
                                    Unisciti alla nostra community di appassionati. <br />
                                    Hai già un account?{' '}
                                    <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                        Accedi
                                    </Link>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Verifica la tua email</h1>
                                <p className="mt-2 text-[var(--text-secondary)]">
                                    Abbiamo inviato un'email di verifica a <strong className="text-[var(--text-primary)]">{registeredEmail}</strong>
                                </p>
                            </>
                        )}
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
                                <p className="font-semibold mb-2">📧 Controlla la tua casella di posta</p>
                                <p>
                                    Clicca sul link nell'email per verificare il tuo account.
                                    Se non trovi l'email, controlla anche la cartella spam.
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Non hai ricevuto l'email?
                                </p>
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendLoading}
                                    className="text-primary hover:text-primary/80 font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    {resendLoading ? 'Invio in corso...' : 'Reinvia email di verifica'}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <Link
                                    to="/login"
                                    className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl"
                                >
                                    Vai al Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm animate-shake">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            placeholder="Mario Rossi"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>

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
                                            placeholder="Minimo 6 caratteri"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Conferma Password</label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            placeholder="Ripeti password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-primary focus:ring-primary border-[var(--border-color)] rounded cursor-pointer"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-[var(--text-primary)] cursor-pointer">
                                    Accetto i{' '}
                                    <Link
                                        to="/terms"
                                        className="text-primary hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Termini e Condizioni
                                    </Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Creazione account...
                                    </>
                                ) : (
                                    'Registrati'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

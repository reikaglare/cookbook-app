import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, Users, ChefHat, Loader2, AlertCircle, Share2, ExternalLink } from 'lucide-react';

export default function PublicRecipe() {
    const { token } = useParams();
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPublicRecipe() {
            try {
                if (!token) return;

                const { data, error } = await supabase
                    .from('recipes')
                    .select('*, categories(*), profiles(full_name, avatar_url)')
                    .eq('share_token', token)
                    .eq('is_public', true)
                    .single();

                if (error) throw error;
                setRecipe(data);
            } catch (err: any) {
                console.error('Error fetching public recipe:', err);
                setError('Ricetta non trovata o non più disponibile.');
            } finally {
                setLoading(false);
            }
        }
        fetchPublicRecipe();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-[var(--text-secondary)] animate-pulse">Caricamento ricetta...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
                <div className="bg-red-100 p-4 rounded-full mb-6 text-red-600">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Ops! Qualcosa è andato storto</h1>
                <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
                    {error}
                </p>
                <Link to="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Torna alla Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Public Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 text-primary">
                        <ChefHat className="w-6 h-6" />
                        <span className="font-bold text-lg">CookBook</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <span className="hidden sm:inline text-xs text-gray-400 bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100 font-medium">
                            Ricetta Condivisa
                        </span>
                        <Link to="/signup" className="text-xs font-bold text-primary hover:underline">
                            Crea il tuo ricettario →
                        </Link>
                    </div>
                </div>
            </div>

            <div id="recipe-container" className="max-w-4xl mx-auto mt-8 px-4">
                {/* Recipe Hero */}
                <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-xl mb-8 group">
                    <img
                        src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821378-860052605bf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {recipe.categories?.icon} {recipe.categories?.name}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md
                                ${recipe.difficulty === 'Easy' ? 'bg-green-500/80' :
                                    recipe.difficulty === 'Medium' ? 'bg-yellow-500/80' :
                                        'bg-red-500/80'}`}>
                                {recipe.difficulty === 'Easy' ? 'Facile' : recipe.difficulty === 'Medium' ? 'Media' : 'Difficile'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{recipe.title}</h1>
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                <Clock className="w-4 h-4 mr-2 text-primary-200" />
                                <span>{recipe.prep_time + recipe.cook_time} min</span>
                            </div>
                            <div className="flex items-center bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                <Users className="w-4 h-4 mr-2 text-primary-200" />
                                <span>{recipe.servings} Porzioni</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Author attribution */}
                <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                            {recipe.profiles?.avatar_url ? (
                                <img src={recipe.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <ChefHat className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Autore</p>
                            <p className="font-bold text-[var(--text-primary)]">{recipe.profiles?.full_name || 'Chef Anonimo'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Data</p>
                        <p className="font-bold text-[var(--text-primary)]">{new Date(recipe.created_at).toLocaleDateString('it-IT')}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar: Ingredients */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
                                    <ChefHat className="w-5 h-5" />
                                </div>
                                Ingredienti
                            </h2>
                            <ul className="space-y-4">
                                {recipe.ingredients?.map((ing: any, i: number) => (
                                    <li key={i} className="flex items-center p-2 rounded-xl border border-transparent hover:border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-3 flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-[var(--text-primary)] block">
                                                {ing.quantity} {ing.unit}
                                            </span>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {ing.item}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content: Instructions */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">Procedimento</h2>
                            <div className="space-y-10">
                                {recipe.instructions?.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center font-black text-xl border border-orange-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            {i + 1}
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[var(--text-primary)] leading-relaxed text-lg font-medium opacity-90">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {recipe.description && (
                            <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                                <h3 className="font-bold text-primary mb-3 flex items-center">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Introduzione
                                </h3>
                                <p className="text-[var(--text-secondary)] italic leading-relaxed text-lg">
                                    "{recipe.description}"
                                </p>
                            </div>
                        )}

                        {/* CTA Footer for Public Viewers */}
                        <div className="bg-gradient-to-r from-primary to-orange-500 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="relative z-10 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">Ti piace questa ricetta?</h3>
                                <p className="opacity-90">Unisciti a CookBook per creare e organizzare il tuo ricettario personale.</p>
                            </div>
                            <Link to="/signup" className="relative z-10 bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center">
                                Registrati Ora
                                <ExternalLink className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

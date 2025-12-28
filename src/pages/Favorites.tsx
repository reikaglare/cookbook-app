import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Heart, Loader2 } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';

export default function Favorites() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState<any[]>([]);

    useEffect(() => {
        async function fetchFavorites() {
            try {
                if (!user) return;

                const { data } = await supabase
                    .from('recipes')
                    .select('*, categories(*)')
                    .eq('user_id', user.id)
                    .eq('is_favorite', true)
                    .order('created_at', { ascending: false });

                setRecipes(data || []);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFavorites();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">I miei Preferiti</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-color)]">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-[var(--text-secondary)] mb-4 text-lg">Non hai ancora ricette preferite.</p>
                    <Link to="/my-recipes" className="text-primary hover:underline font-medium">
                        Sfoglia le tue ricette e aggiungine qualcuna!
                    </Link>
                </div>
            )}
        </div>
    );
}

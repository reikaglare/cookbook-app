import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import CategorySelect from '../components/CategorySelect';

export default function MyRecipes() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!user) return;

                // Fetch categories
                const { data: categoriesData } = await supabase
                    .from('categories')
                    .select('*')
                    .order('display_order', { ascending: true });
                setCategories(categoriesData || []);

                // Fetch recipes with category info
                const { data: recipesData } = await supabase
                    .from('recipes')
                    .select('*, categories(*)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                setRecipes(recipesData || []);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || recipe.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Le mie Ricette</h1>
                <Link
                    to="/add-recipe"
                    className="flex items-center justify-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-shadow shadow-md hover:shadow-lg font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Aggiungi Ricetta</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[var(--bg-surface)] p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cerca tra le tue ricette..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 min-w-[200px]">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <CategorySelect
                        value={categoryFilter}
                        onChange={(value) => setCategoryFilter(value)}
                        categories={[{ id: 'all', name: 'Tutte le categorie' }, ...categories]}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Recipes Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-color)]">
                    <p className="text-[var(--text-secondary)] mb-4">Nessuna ricetta trovata.</p>
                    {searchTerm || categoryFilter !== 'all' ? (
                        <button
                            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                            className="text-primary hover:underline font-medium"
                        >
                            Rimuovi filtri
                        </button>
                    ) : (
                        <Link to="/add-recipe" className="text-primary hover:underline font-medium">
                            Crea la tua prima ricetta
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

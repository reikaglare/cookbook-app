import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Heart, Clock, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecipes: 0,
        favorites: 0,
        categoriesCount: 0
    });
    const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                if (!user) return;

                // Fetch Total Recipes
                const { count: totalRecipes } = await supabase
                    .from('recipes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // Fetch Favorites
                const { count: favorites } = await supabase
                    .from('recipes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_favorite', true);

                // Fetch Categories
                const { data: categoriesData, count: categoriesCount } = await supabase
                    .from('categories')
                    .select('*', { count: 'exact' })
                    .order('display_order', { ascending: true });

                // Fetch Recent Recipes
                const { data: recipes } = await supabase
                    .from('recipes')
                    .select('id, title, image_url, cook_time, difficulty, is_favorite')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(3);

                setStats({
                    totalRecipes: totalRecipes || 0,
                    favorites: favorites || 0,
                    categoriesCount: categoriesCount || 0
                });
                setCategories(categoriesData || []);
                setRecentRecipes(recipes || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [user]);

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-[var(--border-color)] flex items-center space-x-4">
            <div className={`p-4 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">{label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Ciao, {user?.user_metadata?.full_name?.split(' ')[0] || 'Chef'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Ecco un riepilogo della tua cucina digitale.
                    </p>
                </div>
                <Link
                    to="/add-recipe"
                    className="hidden md:flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-shadow shadow-md hover:shadow-lg font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuova Ricetta</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={BookOpen}
                    label="Ricette Totali"
                    value={stats.totalRecipes}
                    color="bg-blue-500 shadow-blue-200"
                />
                <StatCard
                    icon={Heart}
                    label="Preferiti"
                    value={stats.favorites}
                    color="bg-pink-500 shadow-pink-200"
                />
                <StatCard
                    icon={Clock}
                    label="Categorie attive"
                    value={stats.categoriesCount}
                    color="bg-orange-500 shadow-orange-200"
                />
            </div>

            {/* Categories Quick View */}
            {categories.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Esplora Categorie</h2>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <div key={cat.id}
                                className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-surface)] rounded-full border border-[var(--border-color)] shadow-sm"
                                style={{ borderLeft: `4px solid ${cat.color}` }}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Recipes */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Ricette Recenti</h2>
                    <Link to="/my-recipes" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">
                        Vedi tutte <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : recentRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentRecipes.map((recipe) => (
                            <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group bg-[var(--bg-surface)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[var(--border-color)]">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821378-860052605bf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {recipe.is_favorite && (
                                        <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500 shadow-sm backdrop-blur-sm">
                                            <Heart className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 truncate">{recipe.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {recipe.cook_time} min</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {recipe.difficulty === 'Easy' ? 'Facile' :
                                                recipe.difficulty === 'Medium' ? 'Media' :
                                                    recipe.difficulty === 'Hard' ? 'Difficile' : 'Esperto'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-color)]">
                        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Il tuo ricettario è vuoto</h3>
                        <p className="text-[var(--text-secondary)] mb-6">Inizia aggiungendo la tua prima ricetta speciale!</p>
                        <Link to="/add-recipe" className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Crea Ricetta
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

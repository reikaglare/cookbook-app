import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clock, Users, ArrowLeft, Edit2, Trash2, Heart, Share2, ChefHat, Loader2, Calculator, ShoppingBag, RefreshCw } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import toast from 'react-hot-toast';
import { getSubstitutes, calculateNutrition, type SubstitutionGroup, type Substitute, type NutritionData } from '../lib/nutrition';

export default function RecipeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [substitutions, setSubstitutions] = useState<Record<number, Substitute>>({});
    const [currentNutrition, setCurrentNutrition] = useState<NutritionData | null>(null);
    const [showSubModal, setShowSubModal] = useState<{ index: number, group: SubstitutionGroup } | null>(null);

    useEffect(() => {
        async function fetchRecipe() {
            try {
                if (!user || !id) return;

                const { data, error } = await supabase
                    .from('recipes')
                    .select('*, categories(*)')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                setRecipe(data);
            } catch (error) {
                console.error('Error fetching recipe:', error);
                navigate('/my-recipes'); // Redirect if not found/unauthorized
            } finally {
                setLoading(false);
            }
        }
        fetchRecipe();
    }, [id, user, navigate]);

    useEffect(() => {
        if (!recipe) return;

        const updateNutrition = async () => {
            const modifiedIngredients = recipe.ingredients.map((ing: any, index: number) => {
                const sub = substitutions[index];
                if (sub) {
                    const qty = parseFloat(ing.quantity);
                    return {
                        ...ing,
                        item: sub.name,
                        quantity: isNaN(qty) ? ing.quantity : (qty * sub.ratio).toString()
                    };
                }
                return ing;
            });

            const newData = await calculateNutrition(recipe.title, modifiedIngredients);
            setCurrentNutrition(newData);
        };

        if (Object.keys(substitutions).length > 0) {
            updateNutrition();
        } else {
            setCurrentNutrition(recipe.nutrition);
        }
    }, [recipe, substitutions]);

    const handleDelete = async () => {
        if (confirm('Sei sicuro di voler eliminare questa ricetta?')) {
            await supabase.from('recipes').delete().eq('id', id);
            navigate('/my-recipes');
        }
    };

    const toggleFavorite = async () => {
        const newVal = !recipe.is_favorite;
        setRecipe({ ...recipe, is_favorite: newVal });
        await supabase.from('recipes').update({ is_favorite: newVal }).eq('id', id);
    };

    const addToShoppingList = async () => {
        if (!user || !recipe.ingredients) return;

        const toastId = toast.loading('Aggiunta in corso...');
        try {
            const itemsToAdd = recipe.ingredients.map((ing: any) => ({
                user_id: user.id,
                item: ing.item,
                quantity: ing.quantity,
                unit: ing.unit,
                recipe_id: recipe.id
            }));

            const { error } = await supabase
                .from('shopping_list')
                .insert(itemsToAdd);

            if (error) throw error;
            toast.success('Ingredienti aggiunti alla lista spesa!', { id: toastId });
        } catch (error) {
            console.error('Error adding to shopping list:', error);
            toast.error('Errore nell\'aggiunta alla lista', { id: toastId });
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!recipe) return null;

    return (
        <div id="recipe-container" className="max-w-4xl mx-auto pb-20">
            {/* Header Image */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8">
                <img
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821378-860052605bf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                />
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                    <button onClick={() => navigate(-1)} className="bg-[var(--bg-surface)]/20 hover:bg-[var(--bg-surface)]/40 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="bg-[var(--bg-surface)]/20 hover:bg-[var(--bg-surface)]/40 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                        >
                            <Share2 className="w-6 h-6" />
                        </button>
                        <button onClick={toggleFavorite} className={`p-2 rounded-full backdrop-blur-md transition-colors ${recipe.is_favorite ? 'bg-red-500 text-white' : 'bg-[var(--bg-surface)]/20 hover:bg-[var(--bg-surface)]/40 text-white'}`}>
                            <Heart className={`w-6 h-6 ${recipe.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                        <Link to={`/edit-recipe/${id}`} className="bg-[var(--bg-surface)]/20 hover:bg-[var(--bg-surface)]/40 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                            <Edit2 className="w-6 h-6" />
                        </Link>
                        <button onClick={handleDelete} className="bg-[var(--bg-surface)]/20 hover:bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                    <div className="flex items-center space-x-2 mb-2 text-primary-100">
                        <span className="bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                            {recipe.categories?.icon} {recipe.categories?.name}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm
               ${recipe.difficulty === 'Easy' ? 'bg-green-500/80' :
                                recipe.difficulty === 'Medium' ? 'bg-yellow-500/80' :
                                    'bg-red-500/80'}`}>
                            {recipe.difficulty === 'Easy' ? 'Facile' : recipe.difficulty === 'Medium' ? 'Media' : 'Difficile'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{recipe.title}</h1>

                    <div className="flex items-center space-x-8 text-sm md:text-base">
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            <span>Prep: {recipe.prep_time}m</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            <span>Cottura: {recipe.cook_time}m</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            <span>{recipe.servings} Porzioni</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-2 md:px-0">
                {/* Ingredients Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-2 text-green-600">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            Ingredienti
                        </h2>
                        <button
                            onClick={addToShoppingList}
                            className="w-full mb-4 flex items-center justify-center space-x-2 bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition-all font-medium text-sm border border-primary/20"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Aggiungi alla lista spesa</span>
                        </button>
                        <ul className="space-y-3">
                            {recipe.ingredients?.map((ing: any, i: number) => {
                                const subGroup = getSubstitutes(ing.item);
                                const currentSub = substitutions[i];
                                const displayQty = currentSub ? (parseFloat(ing.quantity) * currentSub.ratio).toFixed(1).replace(/\.0$/, '') : ing.quantity;
                                const displayItem = currentSub ? currentSub.name : ing.item;

                                return (
                                    <li key={i} className="flex flex-col border-b last:border-0 border-gray-50 py-3">
                                        <div className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <span className="text-[var(--text-primary)]">
                                                    <span className="font-bold text-[var(--text-primary)]">{displayQty} {ing.unit}</span> {displayItem}
                                                </span>
                                                {currentSub && (
                                                    <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center">
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        Sostituito da: {ing.item}
                                                    </p>
                                                )}
                                                {subGroup && (
                                                    <button
                                                        onClick={() => setShowSubModal({ index: i, group: subGroup })}
                                                        className="mt-2 text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary/70 flex items-center bg-primary/5 px-2 py-1 rounded"
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        {currentSub ? 'Cambia / Ripristina' : 'Sostituisci'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {recipe.nutrition && (
                        <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-gray-100 sticky top-[28rem]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                                <div className="bg-orange-100 p-2 rounded-lg mr-2 text-orange-600">
                                    <Calculator className="w-5 h-5" />
                                </div>
                                Nutrizione
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <span className="text-[var(--text-secondary)] font-medium">Calorie</span>
                                    <span className="text-xl font-bold text-primary">{Math.round(currentNutrition?.calories || recipe.nutrition.calories)} kcal</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                    {(currentNutrition?.totalNutrients.CHOCDF || recipe.nutrition.totalNutrients.CHOCDF) && (
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="text-sm font-bold text-[var(--text-primary)]">{Math.round((currentNutrition || recipe.nutrition).totalNutrients.CHOCDF.quantity)}g</div>
                                            <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Carbo</div>
                                        </div>
                                    )}
                                    {(currentNutrition?.totalNutrients.PROCNT || recipe.nutrition.totalNutrients.PROCNT) && (
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="text-sm font-bold text-[var(--text-primary)]">{Math.round((currentNutrition || recipe.nutrition).totalNutrients.PROCNT.quantity)}g</div>
                                            <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Proteine</div>
                                        </div>
                                    )}
                                    {(currentNutrition?.totalNutrients.FAT || recipe.nutrition.totalNutrients.FAT) && (
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="text-sm font-bold text-[var(--text-primary)]">{Math.round((currentNutrition || recipe.nutrition).totalNutrients.FAT.quantity)}g</div>
                                            <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Grassi</div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-center text-[var(--text-secondary)] italic pt-2 border-t border-gray-50">
                                    Valori indicativi per l'intera ricetta
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions Column */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Procedimento</h2>
                        <div className="space-y-8">
                            {recipe.instructions?.map((step: string, i: number) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-primary)] leading-relaxed text-lg">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-2">Note dello Chef</h3>
                        <p className="text-orange-700 italic">{recipe.description || 'Nessuna descrizione.'}</p>
                    </div>
                </div>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                recipe={recipe}
                onUpdate={(updatedRecipe) => setRecipe(updatedRecipe)}
            />

            {/* Substitution Modal */}
            {showSubModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-surface)] rounded-2xl w-full max-w-sm shadow-2xl border border-[var(--border-color)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border-color)] bg-primary/5">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Sostituisci {recipe.ingredients[showSubModal.index].item}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Scegli un'alternativa per questa ricetta</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {/* Reset Option */}
                            {substitutions[showSubModal.index] && (
                                <button
                                    onClick={() => {
                                        const newSubs = { ...substitutions };
                                        delete newSubs[showSubModal.index];
                                        setSubstitutions(newSubs);
                                        setShowSubModal(null);
                                    }}
                                    className="w-full text-left p-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Ripristina originale ({recipe.ingredients[showSubModal.index].item})
                                </button>
                            )}

                            {showSubModal.group.substitutes.map((sub, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSubstitutions({ ...substitutions, [showSubModal.index]: sub });
                                        setShowSubModal(null);
                                    }}
                                    className="w-full text-left p-4 rounded-xl border border-[var(--border-color)] hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors">{sub.name}</span>
                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Rapporto {sub.ratio}x</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">"{sub.note}"</p>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50">
                            <button
                                onClick={() => setShowSubModal(null)}
                                className="w-full py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

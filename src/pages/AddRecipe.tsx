import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Calculator, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import CategorySelect from '../components/CategorySelect';
import type { NutritionData } from '../lib/nutrition';
import { calculateNutrition } from '../lib/nutrition';
import { UNIT_OPTIONS } from '../lib/constants';



export default function AddRecipe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [categories, setCategories] = useState<any[]>([]);
    const [showUrlInput, setShowUrlInput] = useState(false);

    const [recipe, setRecipe] = useState({
        title: '',
        description: '',
        category_id: '',
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        difficulty: 'Medium',
        image_url: '',
        ingredients: [{ item: '', quantity: '', unit: '' }],
        instructions: [''],
        variants_and_tips: '',
        nutrition: null as NutritionData | null,
    });

    useEffect(() => {
        async function init() {
            // Fetch categories
            const { data: catData } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
            setCategories(catData || []);

            if (isEditing && user) {
                const { data } = await supabase
                    .from('recipes')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setRecipe({
                        ...data,
                        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [{ item: '', quantity: '', unit: '' }],
                        instructions: Array.isArray(data.instructions) ? data.instructions : [''],
                    });
                } else {
                    navigate('/dashboard'); // Not found or not authorized
                }
                setFetching(false);
            }
        }
        init();
    }, [id, user, isEditing, navigate]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const toastId = toast.loading('Caricamento immagine...');

        try {
            const { error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('recipe-images')
                .getPublicUrl(filePath);

            setRecipe(prev => ({ ...prev, image_url: publicUrl }));
            toast.success('Immagine caricata!', { id: toastId });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Errore upload: ' + error.message, { id: toastId });
        }
    };

    const handleIngredientChange = (index: number, field: string, value: string) => {
        const newIngredients: any[] = [...recipe.ingredients];
        newIngredients[index][field] = value;
        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { item: '', quantity: '', unit: '' }] });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        setRecipe({ ...recipe, ingredients: newIngredients });
    };

    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...recipe.instructions];
        newInstructions[index] = value;
        setRecipe({ ...recipe, instructions: newInstructions });
    };

    const addInstruction = () => {
        setRecipe({ ...recipe, instructions: [...recipe.instructions, ''] });
    };

    const removeInstruction = (index: number) => {
        const newInstructions = recipe.instructions.filter((_, i) => i !== index);
        setRecipe({ ...recipe, instructions: newInstructions });
    };

    const handleCalculateNutrition = async () => {
        if (!recipe.title || recipe.ingredients.some(i => !i.item)) {
            toast.error('Inserisci un titolo e gli ingredienti prima di calcolare');
            return;
        }

        setCalculating(true);
        const toastId = toast.loading('Calcolo valori nutrizionali...');

        try {
            const data = await calculateNutrition(recipe.title, recipe.ingredients);
            if (data) {
                setRecipe(prev => ({ ...prev, nutrition: data }));

                if (data.missingIngredients.length > 0) {
                    toast.error(`Alcuni ingredienti non trovati: ${data.missingIngredients.join(', ')}`, {
                        id: toastId,
                        duration: 5000
                    });
                } else {
                    toast.success('Analisi completata!', { id: toastId });
                }
            }
        } catch (error: any) {
            console.error('Nutrition Analysis Error:', error);
            toast.error('Errore nell\'analisi. Controlla formati e API Key.', { id: toastId });
        } finally {
            setCalculating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const recipeData = {
                ...recipe,
                user_id: user?.id,
                updated_at: new Date().toISOString(),
            };

            if (isEditing) {
                await supabase
                    .from('recipes')
                    .update(recipeData)
                    .eq('id', id)
                    .eq('user_id', user?.id);
            } else {
                await supabase
                    .from('recipes')
                    .insert(recipeData);
            }

            toast.success(isEditing ? 'Ricetta aggiornata!' : 'Ricetta creata con successo! 🎉');
            navigate('/my-recipes');
        } catch (error) {
            console.error('Error saving recipe:', error);
            toast.error('Errore nel salvataggio della ricetta');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">{isEditing ? 'Modifica Ricetta' : 'Nuova Ricetta'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Informazioni Base</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Titolo Ricetta</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                value={recipe.title}
                                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                                placeholder="Es. Spaghetti alla Carbonara"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Foto del Piatto</label>

                            {!recipe.image_url ? (
                                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors group">
                                    <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <label className="cursor-pointer bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-shadow shadow-md hover:shadow-lg font-medium flex items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleUpload}
                                            />
                                            <Upload className="w-5 h-5 mr-2" /> Carica una foto
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowUrlInput(!showUrlInput)}
                                            className="text-sm text-[var(--text-secondary)] hover:text-primary underline mt-2"
                                        >
                                            oppure incolla un URL
                                        </button>
                                    </div>

                                    {showUrlInput && (
                                        <input
                                            type="url"
                                            autoFocus
                                            className="mt-4 w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all animate-in fade-in slide-in-from-top-2"
                                            value={recipe.image_url}
                                            onChange={(e) => setRecipe({ ...recipe, image_url: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group border border-[var(--border-color)] shadow-md aspect-video">
                                    <img
                                        src={recipe.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <label className="cursor-pointer bg-[var(--bg-surface)] text-[var(--text-primary)] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg transform hover:-translate-y-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleUpload}
                                            />
                                            Cambia
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setRecipe({ ...recipe, image_url: '' })}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg transform hover:-translate-y-1"
                                        >
                                            Rimuovi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Descrizione</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-24"
                                value={recipe.description}
                                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                                placeholder="Breve storia o descrizione del piatto..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Categoria</label>
                            <CategorySelect
                                value={recipe.category_id}
                                onChange={(value) => setRecipe({ ...recipe, category_id: value })}
                                categories={categories}
                                placeholder="Seleziona Categoria"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Difficoltà</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-[var(--bg-surface)]"
                                value={recipe.difficulty}
                                onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
                            >
                                <option value="Easy">Facile</option>
                                <option value="Medium">Media</option>
                                <option value="Hard">Difficile</option>
                                <option value="Expert">Esperto</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4 col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Prep (min)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    value={recipe.prep_time}
                                    onChange={(e) => setRecipe({ ...recipe, prep_time: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cottura (min)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    value={recipe.cook_time}
                                    onChange={(e) => setRecipe({ ...recipe, cook_time: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Porzioni</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    value={recipe.servings}
                                    onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Ingredienti</h2>
                        <button type="button" onClick={addIngredient} className="text-primary hover:bg-orange-50 p-2 rounded-full transition-colors font-medium text-sm flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Aggiungi
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recipe.ingredients.map((ing: any, index: number) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-grow grid grid-cols-6 gap-2">
                                    <input
                                        placeholder="Ingrediente (es. Farina)"
                                        className="col-span-3 px-3 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={ing.item}
                                        onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                                        required
                                    />
                                    <input
                                        placeholder="Q.tà"
                                        className="col-span-1 px-3 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={ing.quantity}
                                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                    />
                                    <select
                                        className="col-span-2 px-3 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent bg-[var(--bg-surface)]"
                                        value={ing.unit}
                                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                        required
                                    >
                                        <option value="">Unità</option>
                                        {UNIT_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    disabled={recipe.ingredients.length === 1}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {recipe.nutrition && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                            <div>
                                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-1">Valori per Ricetta</h3>
                                <div className="flex gap-4 text-orange-900">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold">{Math.round(recipe.nutrition.calories)}</span>
                                        <span className="text-xs opacity-70">Calorie</span>
                                    </div>
                                    {recipe.nutrition.totalNutrients.CHOCDF && (
                                        <div className="flex flex-col border-l border-orange-200 pl-4">
                                            <span className="text-lg font-bold">{Math.round(recipe.nutrition.totalNutrients.CHOCDF.quantity)}g</span>
                                            <span className="text-xs opacity-70">Carbo</span>
                                        </div>
                                    )}
                                    {recipe.nutrition.totalNutrients.PROCNT && (
                                        <div className="flex flex-col border-l border-orange-200 pl-4">
                                            <span className="text-lg font-bold">{Math.round(recipe.nutrition.totalNutrients.PROCNT.quantity)}g</span>
                                            <span className="text-xs opacity-70">Proteine</span>
                                        </div>
                                    )}
                                    {recipe.nutrition.totalNutrients.FAT && (
                                        <div className="flex flex-col border-l border-orange-200 pl-4">
                                            <span className="text-lg font-bold">{Math.round(recipe.nutrition.totalNutrients.FAT.quantity)}g</span>
                                            <span className="text-xs opacity-70">Grassi</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Calculator className="w-8 h-8 text-orange-300" />
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleCalculateNutrition}
                            disabled={calculating}
                            className="flex items-center space-x-2 text-primary hover:bg-orange-50 px-4 py-2 rounded-lg transition-all font-bold border-2 border-primary/20 hover:border-primary disabled:opacity-50"
                        >
                            {calculating ? <Loader2 className="animate-spin w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                            <span>Automatizza Calcolo Calorie</span>
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-[var(--bg-surface)] p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Procedimento</h2>
                        <button type="button" onClick={addInstruction} className="text-primary hover:bg-orange-50 p-2 rounded-full transition-colors font-medium text-sm flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Aggiungi Step
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recipe.instructions.map((step: string, index: number) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-20"
                                        value={step}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        placeholder="Descrivi questo passaggio..."
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeInstruction(index)}
                                    className="self-start p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                                    disabled={recipe.instructions.length === 1}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-1"
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                        <span>{isEditing ? 'Salva Modifiche' : 'Crea Ricetta'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

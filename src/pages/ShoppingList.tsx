import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    ShoppingBag,
    Trash2,
    CheckCircle2,
    Circle,
    Plus,
    Loader2,
    ShoppingBasket
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ShoppingItem {
    id: string;
    item: string;
    quantity: string;
    unit: string;
    is_bought: boolean;
}

export default function ShoppingList() {
    const { user } = useAuth();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ item: '', quantity: '', unit: '' });
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [user]);

    async function fetchItems() {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('shopping_list')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
            toast.error('Errore nel caricamento della lista');
        } finally {
            setLoading(false);
        }
    }

    const addItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.item || !user) return;

        setAdding(true);
        try {
            const { data, error } = await supabase
                .from('shopping_list')
                .insert([{ ...newItem, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setItems([data, ...items]);
            setNewItem({ item: '', quantity: '', unit: '' });
            toast.success('Aggiunto!');
        } catch (error) {
            toast.error('Errore nell\'aggiunta');
        } finally {
            setAdding(false);
        }
    };

    const toggleBought = async (item: ShoppingItem) => {
        try {
            const { error } = await supabase
                .from('shopping_list')
                .update({ is_bought: !item.is_bought })
                .eq('id', item.id);

            if (error) throw error;
            setItems(items.map(i => i.id === item.id ? { ...i, is_bought: !i.is_bought } : i));
        } catch (error) {
            toast.error('Errore nell\'aggiornamento');
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const { error } = await supabase
                .from('shopping_list')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            toast.error('Errore nell\'eliminazione');
        }
    };

    const clearList = async () => {
        if (!confirm('Vuoi davvero svuotare tutta la lista?')) return;
        try {
            const { error } = await supabase
                .from('shopping_list')
                .delete()
                .eq('user_id', user?.id);

            if (error) throw error;
            setItems([]);
            toast.success('Lista svuotata');
        } catch (error) {
            toast.error('Errore nello svuotamento');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Lista della Spesa</h1>
                        <p className="text-[var(--text-secondary)]">Gestisci i tuoi ingredienti</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={clearList}
                        className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Svuota tutto
                    </button>
                )}
            </div>

            {/* Add Section */}
            <form onSubmit={addItem} className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Cosa ti serve?"
                            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={newItem.item}
                            onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Qty"
                            className="w-16 px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Unità"
                            className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adding || !newItem.item}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                    >
                        {adding ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border-2 border-dashed border-[var(--border-color)]">
                        <ShoppingBasket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">La tua lista è vuota!🥕</p>
                        <p className="text-sm text-gray-400">Aggiungi qualcosa qui sopra o da una ricetta</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className={clsx(
                                "flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-xl border transition-all duration-300 group",
                                item.is_bought ? "border-green-100 bg-green-50/30 opacity-75" : "border-[var(--border-color)] hover:border-primary/30"
                            )}
                        >
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => toggleBought(item)}
                                    className={clsx(
                                        "transition-colors",
                                        item.is_bought ? "text-green-500" : "text-gray-300 hover:text-primary"
                                    )}
                                >
                                    {item.is_bought ? <CheckCircle2 className="w-6 h-6 fill-current bg-white rounded-full" /> : <Circle className="w-6 h-6" />}
                                </button>
                                <div>
                                    <span className={clsx(
                                        "text-lg font-medium block",
                                        item.is_bought ? "text-gray-400 line-through" : "text-[var(--text-primary)]"
                                    )}>
                                        {item.item}
                                    </span>
                                    {(item.quantity || item.unit) && (
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            {item.quantity} {item.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

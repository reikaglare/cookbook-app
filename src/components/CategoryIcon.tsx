import {
    Utensils,
    UtensilsCrossed,
    Drumstick,
    Salad,
    Cake,
    Coffee,
    Pizza,
    Fish,
    Sandwich,
    Croissant,
    Soup,
    LayoutGrid
} from 'lucide-react';

interface CategoryIconProps {
    name: string;
    className?: string;
    showDefault?: boolean;
}

export default function CategoryIcon({ name, className = "w-5 h-5", showDefault = true }: CategoryIconProps) {
    if (!name) return null;

    const normalized = name.toLowerCase().trim();

    // Map categories to Lucide icons
    if (normalized.includes('tutt') || normalized.includes('all')) return <LayoutGrid className={className} />;
    if (normalized.includes('antipast') || normalized.includes('starter')) return <Utensils className={className} />;
    if (normalized.includes('primi') || normalized.includes('pasta') || normalized.includes('zupp')) return <UtensilsCrossed className={className} />;
    if (normalized.includes('second') || normalized.includes('carne') || normalized.includes('main')) return <Drumstick className={className} />;
    if (normalized.includes('pesce') || normalized.includes('sea')) return <Fish className={className} />;
    if (normalized.includes('contorn') || normalized.includes('salad') || normalized.includes('vege')) return <Salad className={className} />;
    if (normalized.includes('dolc') || normalized.includes('dessert') || normalized.includes('tort')) return <Cake className={className} />;
    if (normalized.includes('bevand') || normalized.includes('drink') || normalized.includes('cocktail')) return <Coffee className={className} />;
    if (normalized.includes('pizza') || normalized.includes('focaccia')) return <Pizza className={className} />;
    if (normalized.includes('panin') || normalized.includes('burger')) return <Sandwich className={className} />;
    if (normalized.includes('colazion') || normalized.includes('brioche')) return <Croissant className={className} />;
    if (normalized.includes('salse') || normalized.includes('sughi') || normalized.includes('condimenti')) return <Soup className={className} />;

    // Fallback: if we can't map it, show a generic icon if requested
    if (showDefault) {
        return <Utensils className={className} />;
    }

    return null;
}

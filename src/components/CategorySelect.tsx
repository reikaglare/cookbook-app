import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

interface Category {
    id: string;
    name: string;
    icon?: string; // The old emoji icon, we might ignore this in favor of CategoryIcon
}

interface CategorySelectProps {
    categories: Category[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function CategorySelect({
    categories,
    value,
    onChange,
    placeholder = "Seleziona Categoria",
    className = "",
    required = false
}: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCategory = categories.find(c => c.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 rounded-lg border text-left flex items-center justify-between transition-all bg-[var(--bg-surface)]
                    ${isOpen ? 'ring-2 ring-primary border-transparent' : 'border-[var(--border-color)]'}
                    ${!selectedCategory ? 'text-gray-500' : 'text-[var(--text-primary)]'}
                `}
            >
                <div className="flex items-center gap-2">
                    {selectedCategory ? (
                        <>
                            <CategoryIcon name={selectedCategory.name} className="w-5 h-5 text-primary" />
                            <span>{selectedCategory.name}</span>
                        </>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Hidden select for form validation if needed, though mostly handled by state in parent */}
            <select
                className="sr-only"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                tabIndex={-1}
            >
                <option value="">{placeholder}</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-lg max-h-60 overflow-auto p-1">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                                onChange(category.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                ${value === category.id
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-[var(--text-primary)] hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <CategoryIcon name={category.name} className={`w-4 h-4 ${value === category.id ? 'text-primary' : 'text-gray-400'}`} />
                                <span>{category.name}</span>
                            </div>
                            {value === category.id && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

interface RecipeCardProps {
    recipe: any;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link
            to={`/recipe/${recipe.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821378-860052605bf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                    {recipe.is_favorite && (
                        <div className="bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm backdrop-blur-sm">
                            <Heart className="w-4 h-4 fill-current" />
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white 
            ${recipe.difficulty === 'Easy' ? 'bg-green-500/80' :
                            recipe.difficulty === 'Medium' ? 'bg-yellow-500/80' :
                                'bg-red-500/80'}`}>
                        {recipe.difficulty === 'Easy' ? 'Facile' : recipe.difficulty === 'Medium' ? 'Media' : 'Difficile'}
                    </span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>

                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {recipe.cook_time + (recipe.prep_time || 0)} min
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {recipe.servings}
                    </div>
                </div>

                {recipe.categories && (
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center text-xs text-gray-500">
                        <CategoryIcon name={recipe.categories.name} className="w-4 h-4 mr-1.5 text-primary" />
                        {recipe.categories.name}
                    </div>
                )}
            </div>
        </Link>
    );
}

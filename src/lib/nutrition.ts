import nutritionDb from './nutrition_db.json';
import substitutionsDb from './substitutions_db.json';

export interface NutritionData {
  calories: number;
  totalWeight: number;
  totalNutrients: {
    ENERC_KCAL: Nutrient;
    FAT: Nutrient;
    CHOCDF: Nutrient;
    PROCNT: Nutrient;
  };
  missingIngredients: string[];
}

interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

export interface IngredientDB {
  name: string;
  calories_per_100g: number;
  carbs_per_100g: number;
  proteins_per_100g: number;
  fat_per_100g: number;
}

const db = nutritionDb as IngredientDB[];

export async function calculateNutrition(_title: string, ingredients: { item: string; quantity: string; unit: string }[]) {
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProteins = 0;
  let totalFat = 0;
  let totalWeight = 0;
  const missingIngredients: string[] = [];

  for (const ing of ingredients) {
    if (!ing.item || !ing.quantity) continue;

    // Numerical quantity
    const qty = parseFloat(ing.quantity);
    if (isNaN(qty)) continue;

    // Unit conversion to grams (simplified)
    let weightInGrams = qty;
    const unit = ing.unit.toLowerCase().trim();

    if (unit === 'kg') weightInGrams = qty * 1000;
    else if (unit === 'hg') weightInGrams = qty * 100;
    else if (unit === 'uovo' || unit === 'uova') weightInGrams = qty * 50; // average egg
    else if (unit === 'cucchiaio') weightInGrams = qty * 15;
    else if (unit === 'cucchiaino') weightInGrams = qty * 5;
    else if (unit === 'ml' || unit === 'l') {
      // Assume density of water/milk for simplicity
      weightInGrams = unit === 'l' ? qty * 1000 : qty;
    }

    // Search in DB (fuzzy match or simple includes)
    const match = db.find(item =>
      ing.item.toLowerCase().includes(item.name.toLowerCase()) ||
      item.name.toLowerCase().includes(ing.item.toLowerCase())
    );

    if (match) {
      const factor = weightInGrams / 100;
      totalCalories += match.calories_per_100g * factor;
      totalCarbs += match.carbs_per_100g * factor;
      totalProteins += match.proteins_per_100g * factor;
      totalFat += match.fat_per_100g * factor;
      totalWeight += weightInGrams;
    } else {
      missingIngredients.push(ing.item);
    }
  }

  const data: NutritionData = {
    calories: totalCalories,
    totalWeight,
    totalNutrients: {
      ENERC_KCAL: { label: 'Energy', quantity: totalCalories, unit: 'kcal' },
      FAT: { label: 'Fat', quantity: totalFat, unit: 'g' },
      CHOCDF: { label: 'Carbs', quantity: totalCarbs, unit: 'g' },
      PROCNT: { label: 'Protein', quantity: totalProteins, unit: 'g' }
    },
    missingIngredients
  };

  return data;
}

export interface Substitute {
  name: string;
  ratio: number;
  note: string;
}

export interface SubstitutionGroup {
  original: string;
  substitutes: Substitute[];
}

const subDb = substitutionsDb as SubstitutionGroup[];

export function getSubstitutes(ingredientName: string): SubstitutionGroup | undefined {
  if (!ingredientName) return undefined;
  const search = ingredientName.toLowerCase().trim();

  return subDb.find(group => {
    const original = group.original.toLowerCase();
    // Match "Uova" with "Uovo" or "Zucchero a velo" with "Zucchero"
    return search.includes(original) || original.includes(search) ||
      (original === 'uovo' && search.includes('uova'));
  });
}


import { Ingredient } from './fileParser';
import { Meal } from './mealTypes';
import { generateMealName } from './nameGenerator';
import { isMealCompatible } from './compatibilityUtils';

export const generateMeal = (
  protein: Ingredient,
  grain: Ingredient,
  vegetable: Ingredient,
  sauce: Ingredient
): Meal => {
  const cost = protein.cost + grain.cost + vegetable.cost + sauce.cost;
  
  const meal: Meal = {
    id: `meal-${Math.random().toString(36).substring(2, 9)}`,
    protein,
    grain,
    vegetable,
    sauce,
    cost: parseFloat(cost.toFixed(2)),
    name: ''
  };
  
  meal.name = generateMealName(meal);
  
  return meal;
};

export const calculateOptimizationScore = (
  ingredient: Ingredient,
  usedIngredients: Map<string, number>,
  weeklyUsedIngredients: Set<string>,
  favoriteIngredients?: Set<string>
): number => {
  let score = 0;
  
  if (usedIngredients.has(ingredient.id)) {
    const usageCount = usedIngredients.get(ingredient.id) || 0;
    
    if (usageCount >= 1 && usageCount <= 2) {
      score += 10;
    } else if (usageCount > 2) {
      score -= 5 * (usageCount - 2);
    }
  } else {
    score += 2;
  }
  
  if (weeklyUsedIngredients.has(ingredient.id)) {
    score -= 15;
  }
  
  if (favoriteIngredients?.has(ingredient.id)) {
    score += 20;
  }
  
  return score;
};

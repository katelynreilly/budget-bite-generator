
import { Ingredient, ParsedData } from './fileParser';

export interface Meal {
  id: string;
  name: string;
  protein: Ingredient;
  grain: Ingredient;
  vegetable: Ingredient;
  sauce: Ingredient;
  cost: number;
  nutritionScore?: number;
}

export interface WeeklyPlan {
  weekNumber: number;
  meals: Meal[];
}

export interface MealPlan {
  planId: string;
  weeks: WeeklyPlan[];
  totalCost: number;
}

export interface ShoppingList {
  weekNumber: number;
  items: ShoppingItem[];
  totalCost: number;
}

export interface ShoppingItem {
  ingredient: Ingredient;
  quantity: number;
  cost: number;
}

// Helper function to check if two ingredients' flavors are compatible
const areFlavorProfilesCompatible = (
  item1: Ingredient,
  item2: Ingredient
): boolean => {
  // Some flavors are always compatible with anything
  const universalFlavors = ['mild', 'neutral', 'savory'];
  
  // Check if either item has universal flavors
  const item1HasUniversal = item1.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  const item2HasUniversal = item2.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  // If either has universal flavors, they're compatible
  if (item1HasUniversal || item2HasUniversal) return true;
  
  // Check for shared flavors
  return item1.flavorProfile.some(flavor => 
    item2.flavorProfile.includes(flavor)
  );
};

// Helper to check if a meal has compatible ingredients
const isMealCompatible = (
  protein: Ingredient, 
  grain: Ingredient,
  vegetable: Ingredient,
  sauce: Ingredient
): boolean => {
  // Check compatibility between each pair
  return (
    areFlavorProfilesCompatible(protein, sauce) &&
    areFlavorProfilesCompatible(grain, sauce) &&
    areFlavorProfilesCompatible(vegetable, sauce) &&
    areFlavorProfilesCompatible(protein, vegetable)
  );
};

// Generate a catchy meal name
const generateMealName = (meal: Partial<Meal>): string => {
  const adjectives = ['Simple', 'Hearty', 'Fresh', 'Homestyle', 'Classic', 'Vibrant', 'Quick'];
  const methods = ['Roasted', 'Pan-Seared', 'Grilled', 'Sautéed', 'Baked', 'Stir-Fried'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomMethod = methods[Math.floor(Math.random() * methods.length)];
  
  // Construct meal name with the format: "[Method] [Protein] with [Sauce] [Vegetable] and [Grain]"
  return `${randomMethod} ${meal.protein?.name} with ${meal.sauce?.name} ${meal.vegetable?.name} and ${meal.grain?.name}`;
};

// Generate a single meal from ingredients
const generateMeal = (
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
    name: '' // Placeholder that will be filled below
  };
  
  meal.name = generateMealName(meal);
  
  return meal;
};

// Calculate an optimization score to prioritize reusing ingredients
const calculateOptimizationScore = (
  ingredient: Ingredient,
  usedIngredients: Map<string, number>,
  weeklyUsedIngredients: Set<string>
): number => {
  // Base score - initially neutral
  let score = 0;
  
  // Prioritize ingredients that have been used in other meals this week
  // but not too many times (avoid repetition)
  if (usedIngredients.has(ingredient.id)) {
    const usageCount = usedIngredients.get(ingredient.id) || 0;
    
    // If used 1-2 times, boost the score (ideal reuse)
    if (usageCount >= 1 && usageCount <= 2) {
      score += 10;
    } 
    // If used too many times already, reduce score (avoid overuse)
    else if (usageCount > 2) {
      score -= 5 * (usageCount - 2); // Progressive penalty for overuse
    }
  } 
  // Small bonus for totally new ingredients to maintain variety
  else {
    score += 2;
  }
  
  // Penalize ingredients already used this week in this specific meal slot
  if (weeklyUsedIngredients.has(ingredient.id)) {
    score -= 15;
  }
  
  return score;
};

// Generate 4 meals for a week, ensuring they're compatible and optimized for shopping
const generateWeeklyMeals = (
  data: ParsedData,
  weekNumber: number,
  usedIngredients: Map<string, number>,
  budgetPerWeek?: number
): WeeklyPlan => {
  const meals: Meal[] = [];
  const weeklyUsedIngredients = new Map<string, Set<string>>();
  
  // Initialize sets for tracking ingredient usage by type
  ['protein', 'grain', 'vegetable', 'sauce'].forEach(type => {
    weeklyUsedIngredients.set(type, new Set<string>());
  });
  
  // Try to use different ingredients for variety within this week
  for (let i = 0; i < 4; i++) {
    let attempts = 0;
    let foundCompatibleMeal = false;
    let meal: Meal | null = null;
    
    while (!foundCompatibleMeal && attempts < 20) {
      // Get used ingredient sets for each type
      const usedProteins = weeklyUsedIngredients.get('protein') || new Set<string>();
      const usedGrains = weeklyUsedIngredients.get('grain') || new Set<string>();
      const usedVegetables = weeklyUsedIngredients.get('vegetable') || new Set<string>();
      const usedSauces = weeklyUsedIngredients.get('sauce') || new Set<string>();
      
      // Score and sort ingredients to prioritize reuse while maintaining variety
      const scoredProteins = data.proteins.map(protein => ({
        ingredient: protein,
        score: calculateOptimizationScore(protein, usedIngredients, usedProteins)
      })).sort((a, b) => b.score - a.score);
      
      const scoredGrains = data.grains.map(grain => ({
        ingredient: grain,
        score: calculateOptimizationScore(grain, usedIngredients, usedGrains)
      })).sort((a, b) => b.score - a.score);
      
      const scoredVegetables = data.vegetables.map(vegetable => ({
        ingredient: vegetable,
        score: calculateOptimizationScore(vegetable, usedIngredients, usedVegetables)
      })).sort((a, b) => b.score - a.score);
      
      const scoredSauces = data.sauces.map(sauce => ({
        ingredient: sauce,
        score: calculateOptimizationScore(sauce, usedIngredients, usedSauces)
      })).sort((a, b) => b.score - a.score);
      
      // Take the top ingredients but introduce some randomness
      // to avoid always picking the same top-scored items
      const getRandomTopIngredient = <T extends { score: number }>(items: T[]): T => {
        // Take from top 3 scoring ingredients
        const topCount = Math.min(3, items.length);
        const randomIndex = Math.floor(Math.random() * topCount);
        return items[randomIndex];
      };
      
      const protein = getRandomTopIngredient(scoredProteins).ingredient;
      const grain = getRandomTopIngredient(scoredGrains).ingredient;
      const vegetable = getRandomTopIngredient(scoredVegetables).ingredient;
      const sauce = getRandomTopIngredient(scoredSauces).ingredient;
      
      // Check if ingredients go well together
      if (isMealCompatible(protein, grain, vegetable, sauce)) {
        meal = generateMeal(protein, grain, vegetable, sauce);
        
        // If we have a budget and this meal would put us over, try again
        const currentTotalCost = meals.reduce((sum, m) => sum + m.cost, 0);
        if (budgetPerWeek && currentTotalCost + meal.cost > budgetPerWeek) {
          attempts++;
          continue;
        }
        
        foundCompatibleMeal = true;
        
        // Update used ingredients counts globally
        [protein, grain, vegetable, sauce].forEach(ingredient => {
          const currentCount = usedIngredients.get(ingredient.id) || 0;
          usedIngredients.set(ingredient.id, currentCount + 1);
        });
        
        // Mark as used for this week to avoid too much repetition in the same week
        weeklyUsedIngredients.get('protein')?.add(protein.id);
        weeklyUsedIngredients.get('grain')?.add(grain.id);
        weeklyUsedIngredients.get('vegetable')?.add(vegetable.id);
        weeklyUsedIngredients.get('sauce')?.add(sauce.id);
      }
      
      attempts++;
    }
    
    if (meal) {
      meals.push(meal);
    } else {
      // Fallback: if we couldn't find a compatible meal with optimization,
      // just pick random ingredients that are compatible
      let fallbackFound = false;
      let fallbackAttempts = 0;
      
      while (!fallbackFound && fallbackAttempts < 10) {
        const protein = data.proteins[Math.floor(Math.random() * data.proteins.length)];
        const grain = data.grains[Math.floor(Math.random() * data.grains.length)];
        const vegetable = data.vegetables[Math.floor(Math.random() * data.vegetables.length)];
        const sauce = data.sauces[Math.floor(Math.random() * data.sauces.length)];
        
        if (isMealCompatible(protein, grain, vegetable, sauce)) {
          meals.push(generateMeal(protein, grain, vegetable, sauce));
          fallbackFound = true;
          
          // Update used ingredients counts
          [protein, grain, vegetable, sauce].forEach(ingredient => {
            const currentCount = usedIngredients.get(ingredient.id) || 0;
            usedIngredients.set(ingredient.id, currentCount + 1);
          });
        }
        
        fallbackAttempts++;
      }
      
      // Last resort
      if (!fallbackFound) {
        const protein = data.proteins[Math.floor(Math.random() * data.proteins.length)];
        const grain = data.grains[Math.floor(Math.random() * data.grains.length)];
        const vegetable = data.vegetables[Math.floor(Math.random() * data.vegetables.length)];
        const sauce = data.sauces[Math.floor(Math.random() * data.sauces.length)];
        
        meals.push(generateMeal(protein, grain, vegetable, sauce));
      }
    }
  }
  
  return {
    weekNumber,
    meals
  };
};

// Generate a monthly meal plan (4 weeks, 4 meals per week)
export const generateMealPlan = (
  data: ParsedData,
  options?: {
    weeksCount?: number;
    mealsPerWeek?: number;
    budgetPerWeek?: number;
  }
): MealPlan => {
  const weeksCount = options?.weeksCount || 4; // Default to 4 weeks
  const weeks: WeeklyPlan[] = [];
  
  // Track used ingredients across all weeks to optimize the shopping list
  const usedIngredients = new Map<string, number>();
  
  for (let weekNumber = 1; weekNumber <= weeksCount; weekNumber++) {
    const weeklyPlan = generateWeeklyMeals(data, weekNumber, usedIngredients, options?.budgetPerWeek);
    weeks.push(weeklyPlan);
  }
  
  const totalCost = weeks.reduce(
    (sum, week) => sum + week.meals.reduce((mealSum, meal) => mealSum + meal.cost, 0), 
    0
  );
  
  return {
    planId: `plan-${Date.now()}`,
    weeks,
    totalCost: parseFloat(totalCost.toFixed(2))
  };
};

// Generate a shopping list for a specific week in the meal plan
export const generateShoppingList = (weeklyPlan: WeeklyPlan): ShoppingList => {
  const itemMap = new Map<string, ShoppingItem>();
  
  // Collect all ingredients from meals
  weeklyPlan.meals.forEach(meal => {
    const ingredients = [meal.protein, meal.grain, meal.vegetable, meal.sauce];
    
    ingredients.forEach(ingredient => {
      if (itemMap.has(ingredient.id)) {
        // Increment the quantity if we already have this ingredient
        const item = itemMap.get(ingredient.id)!;
        item.quantity += 1;
        item.cost = parseFloat((ingredient.cost * item.quantity).toFixed(2));
      } else {
        // Add the ingredient to our shopping list
        itemMap.set(ingredient.id, {
          ingredient,
          quantity: 1,
          cost: ingredient.cost
        });
      }
    });
  });
  
  // Convert the map to an array
  const items = Array.from(itemMap.values());
  
  // Calculate total cost
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  
  return {
    weekNumber: weeklyPlan.weekNumber,
    items,
    totalCost: parseFloat(totalCost.toFixed(2))
  };
};

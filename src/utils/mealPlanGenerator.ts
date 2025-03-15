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

const areFlavorProfilesCompatible = (
  item1: Ingredient,
  item2: Ingredient
): boolean => {
  const universalFlavors = ['mild', 'neutral', 'savory'];
  
  const item1HasUniversal = item1.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  const item2HasUniversal = item2.flavorProfile.some(flavor => 
    universalFlavors.includes(flavor.toLowerCase())
  );
  
  if (item1HasUniversal || item2HasUniversal) return true;
  
  return item1.flavorProfile.some(flavor => 
    item2.flavorProfile.includes(flavor)
  );
};

const isMealCompatible = (
  protein: Ingredient, 
  grain: Ingredient,
  vegetable: Ingredient,
  sauce: Ingredient
): boolean => {
  return (
    areFlavorProfilesCompatible(protein, sauce) &&
    areFlavorProfilesCompatible(grain, sauce) &&
    areFlavorProfilesCompatible(vegetable, sauce) &&
    areFlavorProfilesCompatible(protein, vegetable)
  );
};

const cookingMethods = [
  'grilled', 'baked', 'air-fried', 'pan-seared', 'slow-cooked', 
  'steamed', 'poached', 'stir-fried', 'roasted', 'sautéed'
];

const generateMealName = (meal: Partial<Meal>): string => {
  if (!meal.protein || !meal.vegetable || !meal.grain || !meal.sauce) {
    return "Incomplete Meal";
  }
  
  const proteinName = meal.protein.name;
  const vegetableName = meal.vegetable.name;
  const grainName = meal.grain.name;
  
  const hasExistingCookingMethod = cookingMethods.some(method => 
    proteinName.toLowerCase().includes(method.toLowerCase())
  );
  
  let finalProteinName = proteinName;
  
  if (!hasExistingCookingMethod) {
    const randomMethod = ['Roasted', 'Grilled', 'Pan-Seared'][Math.floor(Math.random() * 3)];
    finalProteinName = `${randomMethod} ${proteinName}`;
  }
  
  return `${finalProteinName} with ${meal.sauce.name} ${vegetableName} and ${grainName}`;
};

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
    name: ''
  };
  
  meal.name = generateMealName(meal);
  
  return meal;
};

const calculateOptimizationScore = (
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

const generateWeeklyMeals = (
  data: ParsedData,
  weekNumber: number,
  usedIngredients: Map<string, number>,
  favoriteRecipes: Meal[] = [],
  budgetPerWeek?: number
): WeeklyPlan => {
  const meals: Meal[] = [];
  const weeklyUsedIngredients = new Map<string, Set<string>>();
  
  ['protein', 'grain', 'vegetable', 'sauce'].forEach(type => {
    weeklyUsedIngredients.set(type, new Set<string>());
  });
  
  const favoriteProteins = new Set<string>();
  const favoriteGrains = new Set<string>();
  const favoriteVegetables = new Set<string>();
  const favoriteSauces = new Set<string>();
  
  favoriteRecipes.forEach(recipe => {
    favoriteProteins.add(recipe.protein.id);
    favoriteGrains.add(recipe.grain.id);
    favoriteVegetables.add(recipe.vegetable.id);
    favoriteSauces.add(recipe.sauce.id);
  });
  
  for (let i = 0; i < 4; i++) {
    if (favoriteRecipes.length > 0 && Math.random() < 0.3) {
      const favoriteIndex = Math.floor(Math.random() * favoriteRecipes.length);
      const favoriteRecipe = favoriteRecipes[favoriteIndex];
      
      const proteinUsed = weeklyUsedIngredients.get('protein')?.has(favoriteRecipe.protein.id) || false;
      const grainUsed = weeklyUsedIngredients.get('grain')?.has(favoriteRecipe.grain.id) || false;
      const vegetableUsed = weeklyUsedIngredients.get('vegetable')?.has(favoriteRecipe.vegetable.id) || false;
      const sauceUsed = weeklyUsedIngredients.get('sauce')?.has(favoriteRecipe.sauce.id) || false;
      
      if (!(proteinUsed && grainUsed && vegetableUsed && sauceUsed)) {
        const recipeCopy: Meal = {
          ...favoriteRecipe,
          id: `meal-${Math.random().toString(36).substring(2, 9)}`
        };
        
        meals.push(recipeCopy);
        
        [recipeCopy.protein, recipeCopy.grain, recipeCopy.vegetable, recipeCopy.sauce].forEach(ingredient => {
          const currentCount = usedIngredients.get(ingredient.id) || 0;
          usedIngredients.set(ingredient.id, currentCount + 1);
        });
        
        weeklyUsedIngredients.get('protein')?.add(recipeCopy.protein.id);
        weeklyUsedIngredients.get('grain')?.add(recipeCopy.grain.id);
        weeklyUsedIngredients.get('vegetable')?.add(recipeCopy.vegetable.id);
        weeklyUsedIngredients.get('sauce')?.add(recipeCopy.sauce.id);
        
        continue;
      }
    }
    
    let attempts = 0;
    let foundCompatibleMeal = false;
    let meal: Meal | null = null;
    
    while (!foundCompatibleMeal && attempts < 20) {
      const usedProteins = weeklyUsedIngredients.get('protein') || new Set<string>();
      const usedGrains = weeklyUsedIngredients.get('grain') || new Set<string>();
      const usedVegetables = weeklyUsedIngredients.get('vegetable') || new Set<string>();
      const usedSauces = weeklyUsedIngredients.get('sauce') || new Set<string>();
      
      const scoredProteins = data.proteins.map(protein => ({
        ingredient: protein,
        score: calculateOptimizationScore(protein, usedIngredients, usedProteins, favoriteProteins)
      })).sort((a, b) => b.score - a.score);
      
      const scoredGrains = data.grains.map(grain => ({
        ingredient: grain,
        score: calculateOptimizationScore(grain, usedIngredients, usedGrains, favoriteGrains)
      })).sort((a, b) => b.score - a.score);
      
      const scoredVegetables = data.vegetables.map(vegetable => ({
        ingredient: vegetable,
        score: calculateOptimizationScore(vegetable, usedIngredients, usedVegetables, favoriteVegetables)
      })).sort((a, b) => b.score - a.score);
      
      const scoredSauces = data.sauces.map(sauce => ({
        ingredient: sauce,
        score: calculateOptimizationScore(sauce, usedIngredients, usedSauces, favoriteSauces)
      })).sort((a, b) => b.score - a.score);
      
      const getRandomTopIngredient = <T extends { score: number }>(items: T[]): T => {
        const topCount = Math.min(3, items.length);
        const randomIndex = Math.floor(Math.random() * topCount);
        return items[randomIndex];
      };
      
      const protein = getRandomTopIngredient(scoredProteins).ingredient;
      const grain = getRandomTopIngredient(scoredGrains).ingredient;
      const vegetable = getRandomTopIngredient(scoredVegetables).ingredient;
      const sauce = getRandomTopIngredient(scoredSauces).ingredient;
      
      if (isMealCompatible(protein, grain, vegetable, sauce)) {
        meal = generateMeal(protein, grain, vegetable, sauce);
        
        const currentTotalCost = meals.reduce((sum, m) => sum + m.cost, 0);
        if (budgetPerWeek && currentTotalCost + meal.cost > budgetPerWeek) {
          attempts++;
          continue;
        }
        
        foundCompatibleMeal = true;
        
        [protein, grain, vegetable, sauce].forEach(ingredient => {
          const currentCount = usedIngredients.get(ingredient.id) || 0;
          usedIngredients.set(ingredient.id, currentCount + 1);
        });
        
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
          
          [protein, grain, vegetable, sauce].forEach(ingredient => {
            const currentCount = usedIngredients.get(ingredient.id) || 0;
            usedIngredients.set(ingredient.id, currentCount + 1);
          });
        }
        
        fallbackAttempts++;
      }
      
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

export const generateMealPlan = (
  data: ParsedData,
  options?: {
    weeksCount?: number;
    mealsPerWeek?: number;
    budgetPerWeek?: number;
    favoriteRecipes?: Meal[];
  }
): MealPlan => {
  const weeksCount = options?.weeksCount || 4;
  const weeks: WeeklyPlan[] = [];
  const favoriteRecipes = options?.favoriteRecipes || [];
  
  const usedIngredients = new Map<string, number>();
  
  for (let weekNumber = 1; weekNumber <= weeksCount; weekNumber++) {
    const weeklyPlan = generateWeeklyMeals(
      data, 
      weekNumber, 
      usedIngredients, 
      favoriteRecipes, 
      options?.budgetPerWeek
    );
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

export const generateShoppingList = (weeklyPlan: WeeklyPlan): ShoppingList => {
  const itemMap = new Map<string, ShoppingItem>();
  
  weeklyPlan.meals.forEach(meal => {
    const ingredients = [meal.protein, meal.grain, meal.vegetable, meal.sauce];
    
    ingredients.forEach(ingredient => {
      if (itemMap.has(ingredient.id)) {
        const item = itemMap.get(ingredient.id)!;
        item.quantity += 1;
        item.cost = parseFloat((ingredient.cost * item.quantity).toFixed(2));
      } else {
        itemMap.set(ingredient.id, {
          ingredient,
          quantity: 1,
          cost: ingredient.cost
        });
      }
    });
  });
  
  const items = Array.from(itemMap.values());
  
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  
  return {
    weekNumber: weeklyPlan.weekNumber,
    items,
    totalCost: parseFloat(totalCost.toFixed(2))
  };
};

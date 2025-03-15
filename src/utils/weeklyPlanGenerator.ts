
import { ParsedData } from './fileParser';
import { Meal, WeeklyPlan } from './mealTypes';
import { generateMeal, calculateOptimizationScore } from './mealGenerator';
import { isMealCompatible } from './compatibilityUtils';

export const generateWeeklyMeals = (
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

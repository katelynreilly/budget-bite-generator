
import { ParsedData } from './fileParser';
import { Meal, MealPlan, WeeklyPlan } from './mealTypes';
import { generateWeeklyMeals } from './weeklyPlanGenerator';
import { generateShoppingList } from './shoppingListGenerator';

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

// Re-export everything needed from the utility files
export * from './mealTypes';
export { generateShoppingList } from './shoppingListGenerator';

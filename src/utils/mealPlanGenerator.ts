
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

// Generate 4 meals for a week, ensuring they're compatible and under budget
const generateWeeklyMeals = (
  data: ParsedData,
  weekNumber: number,
  budgetPerWeek?: number
): WeeklyPlan => {
  const meals: Meal[] = [];
  const usedIngredients = new Set<string>();
  
  // Try to use different ingredients for variety
  for (let i = 0; i < 4; i++) {
    let attempts = 0;
    let foundCompatibleMeal = false;
    let meal: Meal | null = null;
    
    while (!foundCompatibleMeal && attempts < 20) {
      // Randomly select ingredients
      const protein = data.proteins[Math.floor(Math.random() * data.proteins.length)];
      const grain = data.grains[Math.floor(Math.random() * data.grains.length)];
      const vegetable = data.vegetables[Math.floor(Math.random() * data.vegetables.length)];
      const sauce = data.sauces[Math.floor(Math.random() * data.sauces.length)];
      
      // Check if we've already used these ingredients too much this week
      const mealKey = `${protein.id}-${grain.id}-${vegetable.id}-${sauce.id}`;
      if (usedIngredients.has(mealKey)) {
        attempts++;
        continue;
      }
      
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
        usedIngredients.add(mealKey);
      }
      
      attempts++;
    }
    
    if (meal) {
      meals.push(meal);
    } else {
      // If we couldn't find a compatible meal after many attempts, just pick random ingredients
      const protein = data.proteins[Math.floor(Math.random() * data.proteins.length)];
      const grain = data.grains[Math.floor(Math.random() * data.grains.length)];
      const vegetable = data.vegetables[Math.floor(Math.random() * data.vegetables.length)];
      const sauce = data.sauces[Math.floor(Math.random() * data.sauces.length)];
      
      meals.push(generateMeal(protein, grain, vegetable, sauce));
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
  
  for (let weekNumber = 1; weekNumber <= weeksCount; weekNumber++) {
    const weeklyPlan = generateWeeklyMeals(data, weekNumber, options?.budgetPerWeek);
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

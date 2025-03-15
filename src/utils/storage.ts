
import { MealPlan, Meal } from './mealPlanGenerator';
import { ParsedData } from './fileParser';
import { SavedMealPlan } from '@/components/MealPlanLibrary';
import { getUserStorageKey } from './auth';

// Keys for localStorage (these will be prefixed with user ID)
const SAVED_MEAL_PLANS_KEY = 'mealPlanner_savedPlans';
const SAVED_INGREDIENTS_KEY = 'mealPlanner_savedIngredients';
const FAVORITE_RECIPES_KEY = 'mealPlanner_favoriteRecipes';

// Save a meal plan to localStorage
export const saveMealPlan = (plan: MealPlan, name: string): SavedMealPlan => {
  const savedPlans = getSavedMealPlans();
  
  const newPlan: SavedMealPlan = {
    id: `plan_${Date.now()}`,
    plan,
    name,
    date: new Date().toLocaleDateString(),
  };
  
  savedPlans.push(newPlan);
  localStorage.setItem(getUserStorageKey(SAVED_MEAL_PLANS_KEY), JSON.stringify(savedPlans));
  
  return newPlan;
};

// Get all saved meal plans from localStorage
export const getSavedMealPlans = (): SavedMealPlan[] => {
  try {
    const plansJson = localStorage.getItem(getUserStorageKey(SAVED_MEAL_PLANS_KEY));
    return plansJson ? JSON.parse(plansJson) : [];
  } catch (error) {
    console.error('Error retrieving saved meal plans:', error);
    return [];
  }
};

// Delete a saved meal plan
export const deleteSavedMealPlan = (id: string): void => {
  const savedPlans = getSavedMealPlans().filter(plan => plan.id !== id);
  localStorage.setItem(getUserStorageKey(SAVED_MEAL_PLANS_KEY), JSON.stringify(savedPlans));
};

// Save ingredient data for later use
export const saveIngredientData = (data: ParsedData): void => {
  localStorage.setItem(getUserStorageKey(SAVED_INGREDIENTS_KEY), JSON.stringify(data));
};

// Get saved ingredient data
export const getSavedIngredientData = (): ParsedData | null => {
  try {
    const dataJson = localStorage.getItem(getUserStorageKey(SAVED_INGREDIENTS_KEY));
    return dataJson ? JSON.parse(dataJson) : null;
  } catch (error) {
    console.error('Error retrieving saved ingredient data:', error);
    return null;
  }
};

// Save a recipe as a favorite
export const saveFavoriteRecipe = (recipe: Meal): void => {
  const favorites = getFavoriteRecipes();
  
  // Only add if it's not already in favorites
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem(getUserStorageKey(FAVORITE_RECIPES_KEY), JSON.stringify(favorites));
  }
};

// Remove a recipe from favorites
export const removeFavoriteRecipe = (recipeId: string): void => {
  const favorites = getFavoriteRecipes().filter(recipe => recipe.id !== recipeId);
  localStorage.setItem(getUserStorageKey(FAVORITE_RECIPES_KEY), JSON.stringify(favorites));
};

// Get all favorite recipes
export const getFavoriteRecipes = (): Meal[] => {
  try {
    const recipesJson = localStorage.getItem(getUserStorageKey(FAVORITE_RECIPES_KEY));
    return recipesJson ? JSON.parse(recipesJson) : [];
  } catch (error) {
    console.error('Error retrieving favorite recipes:', error);
    return [];
  }
};

// Check if a recipe is a favorite
export const isRecipeFavorite = (recipeId: string): boolean => {
  const favorites = getFavoriteRecipes();
  return favorites.some(recipe => recipe.id === recipeId);
};


import { MealPlan } from './mealPlanGenerator';
import { ParsedData } from './fileParser';
import { SavedMealPlan } from '@/components/MealPlanLibrary';

// Keys for localStorage
const SAVED_MEAL_PLANS_KEY = 'mealPlanner_savedPlans';
const SAVED_INGREDIENTS_KEY = 'mealPlanner_savedIngredients';

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
  localStorage.setItem(SAVED_MEAL_PLANS_KEY, JSON.stringify(savedPlans));
  
  return newPlan;
};

// Get all saved meal plans from localStorage
export const getSavedMealPlans = (): SavedMealPlan[] => {
  try {
    const plansJson = localStorage.getItem(SAVED_MEAL_PLANS_KEY);
    return plansJson ? JSON.parse(plansJson) : [];
  } catch (error) {
    console.error('Error retrieving saved meal plans:', error);
    return [];
  }
};

// Delete a saved meal plan
export const deleteSavedMealPlan = (id: string): void => {
  const savedPlans = getSavedMealPlans().filter(plan => plan.id !== id);
  localStorage.setItem(SAVED_MEAL_PLANS_KEY, JSON.stringify(savedPlans));
};

// Save ingredient data for later use
export const saveIngredientData = (data: ParsedData): void => {
  localStorage.setItem(SAVED_INGREDIENTS_KEY, JSON.stringify(data));
};

// Get saved ingredient data
export const getSavedIngredientData = (): ParsedData | null => {
  try {
    const dataJson = localStorage.getItem(SAVED_INGREDIENTS_KEY);
    return dataJson ? JSON.parse(dataJson) : null;
  } catch (error) {
    console.error('Error retrieving saved ingredient data:', error);
    return null;
  }
};

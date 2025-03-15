
import { Ingredient } from './fileParser';

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

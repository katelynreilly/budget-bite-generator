
import { WeeklyPlan, ShoppingList, ShoppingItem } from './mealTypes';

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

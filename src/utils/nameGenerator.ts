
import { Meal } from './mealTypes';

export const cookingMethods = [
  'grilled', 'baked', 'air-fried', 'pan-seared', 'slow-cooked', 
  'steamed', 'poached', 'stir-fried', 'roasted', 'sautéed'
];

export const generateMealName = (meal: Partial<Meal>): string => {
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

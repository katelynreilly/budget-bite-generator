
import { Meal } from './mealTypes';

export const cookingMethods = [
  'grilled', 'baked', 'air-fried', 'pan-seared', 'slow-cooked', 
  'steamed', 'poached', 'stir-fried', 'roasted', 'sautéed'
];

export const generateMealName = (meal: Partial<Meal>): string => {
  if (!meal.protein || !meal.vegetable || !meal.grain || !meal.sauce) {
    return "Incomplete Meal";
  }
  
  // Extract the base protein name without any cooking method
  const proteinName = cleanIngredientName(meal.protein.name);
  const vegetableName = meal.vegetable.name;
  const grainName = meal.grain.name;
  
  // Check if the protein has attributes (cooking method)
  let cookingMethod = "";
  if (meal.protein.attributes && meal.protein.attributes.length > 0) {
    cookingMethod = meal.protein.attributes[0];
  }
  
  // If no cooking method is specified, randomly assign one
  if (!cookingMethod) {
    cookingMethod = ['Roasted', 'Grilled', 'Pan-Seared'][Math.floor(Math.random() * 3)];
  }
  
  // Format the final meal name
  return `${cookingMethod} ${proteinName} with ${meal.sauce.name} ${vegetableName} and ${grainName}`;
};

// Function to clean ingredient names by removing any existing cooking methods
export const cleanIngredientName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  for (const method of cookingMethods) {
    // Check if the name starts with the cooking method
    if (lowerName.startsWith(method.toLowerCase())) {
      // Remove the cooking method and any leading spaces
      return name.substring(method.length).trim();
    }
    
    // Also check for capitalized versions (e.g., "Grilled")
    const capitalizedMethod = method.charAt(0).toUpperCase() + method.slice(1);
    if (name.startsWith(capitalizedMethod)) {
      return name.substring(capitalizedMethod.length).trim();
    }
  }
  
  return name;
};

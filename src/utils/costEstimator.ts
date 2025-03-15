
// This is a simplified cost estimation utility that provides reasonable
// cost estimates for different ingredient categories.

type IngredientCategory = 'protein' | 'grain' | 'vegetable' | 'sauce';

// Database of common ingredients and their estimated costs per unit
const costDatabase = {
  // Proteins (cost per pound or package)
  protein: {
    'chicken': 3.99,
    'chicken breast': 4.99,
    'chicken thigh': 3.49,
    'ground beef': 5.99,
    'beef': 7.99,
    'steak': 9.99,
    'pork': 4.49,
    'pork chop': 4.99,
    'bacon': 6.99,
    'tofu': 2.99,
    'tempeh': 3.99,
    'salmon': 9.99,
    'tuna': 7.99,
    'shrimp': 8.99,
    'fish': 7.99,
    'turkey': 4.49,
    'ground turkey': 4.99,
    'eggs': 3.49,
    'lentils': 1.99,
    'beans': 1.49,
    'chickpeas': 1.99,
    'seitan': 4.99,
  },
  
  // Grains (cost per pound or package)
  grain: {
    'rice': 0.99,
    'brown rice': 1.49,
    'white rice': 0.99,
    'quinoa': 3.99,
    'pasta': 1.29,
    'spaghetti': 1.29,
    'noodles': 1.49,
    'bread': 2.99,
    'tortilla': 2.49,
    'pita': 2.99,
    'couscous': 2.49,
    'barley': 1.99,
    'farro': 3.49,
    'oats': 2.49,
    'polenta': 2.99,
    'potato': 0.79,
    'sweet potato': 1.29,
  },
  
  // Vegetables (cost per pound or bunch)
  vegetable: {
    'broccoli': 1.99,
    'spinach': 2.99,
    'kale': 2.49,
    'lettuce': 1.99,
    'tomato': 1.79,
    'carrot': 1.29,
    'onion': 0.99,
    'garlic': 0.79,
    'bell pepper': 1.49,
    'cucumber': 1.29,
    'zucchini': 1.49,
    'squash': 1.99,
    'eggplant': 2.49,
    'mushroom': 3.49,
    'cabbage': 1.49,
    'cauliflower': 2.99,
    'corn': 0.99,
    'green beans': 2.49,
    'peas': 1.99,
    'asparagus': 3.99,
    'brussels sprouts': 3.49,
  },
  
  // Sauces (cost per jar or bottle)
  sauce: {
    'marinara': 2.99,
    'tomato sauce': 1.99,
    'pesto': 3.99,
    'alfredo': 3.49,
    'soy sauce': 2.49,
    'teriyaki': 3.49,
    'bbq': 2.99,
    'hot sauce': 2.49,
    'sriracha': 2.99,
    'salsa': 2.99,
    'hummus': 3.49,
    'guacamole': 3.99,
    'olive oil': 4.99,
    'vinegar': 2.49,
    'mayo': 2.99,
    'ketchup': 1.99,
    'mustard': 1.49,
    'honey': 3.99,
    'maple syrup': 5.99,
    'curry': 2.99,
    'coconut milk': 2.49,
  },
};

// Default costs by category if specific ingredient not found
const defaultCosts = {
  protein: 4.99,
  grain: 1.99,
  vegetable: 2.49,
  sauce: 2.99,
};

// Find the most similar item in our database
const findSimilarItem = (name: string, category: IngredientCategory): string | null => {
  const normalizedName = name.toLowerCase().trim();
  const categoryDb = costDatabase[category];
  
  // First try exact match
  if (categoryDb[normalizedName]) {
    return normalizedName;
  }
  
  // Then try partial match
  for (const item in categoryDb) {
    if (normalizedName.includes(item) || item.includes(normalizedName)) {
      return item;
    }
  }
  
  return null;
};

/**
 * Estimates the cost of an ingredient based on its name and category.
 * This is a simplified implementation that could be replaced with a more
 * sophisticated API or ML-based solution in a production environment.
 */
export const estimateIngredientCost = async (
  ingredientName: string,
  category: IngredientCategory
): Promise<number> => {
  // In a real application, this might call an AI service or API
  // For this demo, we'll use a lookup table with some fuzzy matching
  
  const similarItem = findSimilarItem(ingredientName, category);
  
  if (similarItem) {
    return costDatabase[category][similarItem];
  }
  
  // If no match found, return a reasonable default cost for the category
  return defaultCosts[category];
};

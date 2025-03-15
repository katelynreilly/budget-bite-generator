
// This utility provides AI-based flavor profile estimation for ingredients
// based on their names and categories.

type IngredientCategory = 'protein' | 'grain' | 'vegetable' | 'sauce';

// Database of common ingredients and their flavor profiles
const flavorDatabase = {
  // Proteins
  protein: {
    'chicken': ['mild', 'savory'],
    'chicken breast': ['mild', 'lean'],
    'chicken thigh': ['rich', 'savory'],
    'ground beef': ['rich', 'savory', 'umami'],
    'beef': ['rich', 'savory', 'umami'],
    'steak': ['rich', 'savory', 'umami'],
    'pork': ['mild', 'savory'],
    'pork chop': ['mild', 'savory'],
    'bacon': ['smoky', 'salty', 'rich'],
    'tofu': ['mild', 'neutral'],
    'tempeh': ['nutty', 'earthy', 'fermented'],
    'salmon': ['rich', 'buttery', 'oceanic'],
    'tuna': ['meaty', 'oceanic', 'savory'],
    'shrimp': ['sweet', 'oceanic', 'delicate'],
    'fish': ['mild', 'oceanic'],
    'turkey': ['mild', 'lean', 'savory'],
    'ground turkey': ['mild', 'lean'],
    'eggs': ['mild', 'versatile', 'rich'],
    'lentils': ['earthy', 'nutty', 'mild'],
    'beans': ['earthy', 'mild', 'starchy'],
    'chickpeas': ['nutty', 'earthy', 'mild'],
    'seitan': ['savory', 'chewy', 'mild'],
  },
  
  // Grains
  grain: {
    'rice': ['mild', 'neutral', 'starchy'],
    'brown rice': ['nutty', 'earthy', 'mild'],
    'white rice': ['mild', 'neutral', 'starchy'],
    'quinoa': ['nutty', 'earthy', 'mild'],
    'pasta': ['mild', 'neutral', 'starchy'],
    'spaghetti': ['mild', 'neutral', 'starchy'],
    'noodles': ['mild', 'neutral', 'versatile'],
    'bread': ['yeasty', 'mild', 'versatile'],
    'tortilla': ['mild', 'neutral', 'versatile'],
    'pita': ['mild', 'neutral', 'versatile'],
    'couscous': ['mild', 'neutral', 'starchy'],
    'barley': ['chewy', 'nutty', 'earthy'],
    'farro': ['nutty', 'earthy', 'chewy'],
    'oats': ['mild', 'earthy', 'hearty'],
    'polenta': ['creamy', 'corn-like', 'mild'],
    'potato': ['starchy', 'mild', 'earthy'],
    'sweet potato': ['sweet', 'starchy', 'earthy'],
  },
  
  // Vegetables
  vegetable: {
    'broccoli': ['earthy', 'green', 'mild'],
    'spinach': ['green', 'mild', 'earthy'],
    'kale': ['bitter', 'green', 'earthy'],
    'lettuce': ['crisp', 'watery', 'mild'],
    'tomato': ['sweet', 'acidic', 'juicy'],
    'carrot': ['sweet', 'earthy', 'crunchy'],
    'onion': ['pungent', 'savory', 'aromatic'],
    'garlic': ['pungent', 'spicy', 'aromatic'],
    'bell pepper': ['sweet', 'crisp', 'juicy'],
    'cucumber': ['cool', 'crisp', 'watery'],
    'zucchini': ['mild', 'tender', 'versatile'],
    'squash': ['sweet', 'earthy', 'starchy'],
    'eggplant': ['mild', 'earthy', 'meaty'],
    'mushroom': ['umami', 'earthy', 'meaty'],
    'cabbage': ['crisp', 'mild', 'slightly bitter'],
    'cauliflower': ['mild', 'nutty', 'versatile'],
    'corn': ['sweet', 'juicy', 'starchy'],
    'green beans': ['green', 'snappy', 'mild'],
    'peas': ['sweet', 'green', 'starchy'],
    'asparagus': ['earthy', 'grassy', 'slightly bitter'],
    'brussels sprouts': ['nutty', 'cabbage-like', 'slightly bitter'],
  },
  
  // Sauces
  sauce: {
    'marinara': ['tangy', 'savory', 'herby'],
    'tomato sauce': ['tangy', 'savory', 'slightly sweet'],
    'pesto': ['herby', 'garlicky', 'savory'],
    'alfredo': ['creamy', 'rich', 'savory'],
    'soy sauce': ['salty', 'umami', 'fermented'],
    'teriyaki': ['sweet', 'salty', 'savory'],
    'bbq': ['sweet', 'smoky', 'tangy'],
    'hot sauce': ['spicy', 'tangy', 'pungent'],
    'sriracha': ['spicy', 'garlicky', 'sweet-tangy'],
    'salsa': ['spicy', 'tangy', 'fresh'],
    'hummus': ['nutty', 'garlicky', 'creamy'],
    'guacamole': ['creamy', 'fresh', 'tangy'],
    'olive oil': ['fruity', 'rich', 'mild'],
    'vinegar': ['acidic', 'tangy', 'sharp'],
    'mayo': ['creamy', 'tangy', 'rich'],
    'ketchup': ['sweet', 'tangy', 'tomatoey'],
    'mustard': ['tangy', 'spicy', 'pungent'],
    'honey': ['sweet', 'floral', 'sticky'],
    'maple syrup': ['sweet', 'woody', 'rich'],
    'curry': ['spicy', 'aromatic', 'complex'],
    'coconut milk': ['creamy', 'sweet', 'tropical'],
  },
};

// Default flavor profiles by category if specific ingredient not found
const defaultFlavorProfiles = {
  protein: ['mild', 'savory'],
  grain: ['mild', 'starchy'],
  vegetable: ['fresh', 'mild'],
  sauce: ['flavorful', 'complementary'],
};

// Find the most similar item in our database
const findSimilarItem = (name: string, category: IngredientCategory): string | null => {
  const normalizedName = name.toLowerCase().trim();
  const categoryDb = flavorDatabase[category];
  
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
 * Estimates the flavor profile of an ingredient based on its name and category.
 * This is a simplified implementation that could be replaced with a more
 * sophisticated API or ML-based solution in a production environment.
 */
export const estimateFlavorProfile = (
  ingredientName: string,
  category: IngredientCategory
): string[] => {
  // In a real application, this might call an AI service or API
  // For this demo, we'll use a lookup table with some fuzzy matching
  
  const similarItem = findSimilarItem(ingredientName, category);
  
  if (similarItem) {
    return flavorDatabase[category][similarItem];
  }
  
  // If no match found, return a reasonable default flavor profile for the category
  return defaultFlavorProfiles[category];
};

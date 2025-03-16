
// A utility to check if a string likely represents a food item
// This implementation uses multiple heuristics to improve accuracy

// Common non-food words that might be entered but should be rejected
const commonNonFoodWords = [
  'the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this',
  'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your',
  'test', 'example', 'item', 'sample', 'my', 'stuff', 'thing', 'random', 'placeholder',
  'something', 'blah', 'xyz', 'abc', '123', 'todo', 'none', 'n/a', 'na', 'nil',
  'hello', 'world', 'foo', 'bar', 'baz', 'qux', 'dummy', 'temp', 'temporary',
  'unknown', 'undefined', 'null', 'empty', 'blank', 'tbd', 'xxx', 'aaa', 'zzz'
];

// Common food-related terms that strengthen the likelihood that an input is a food item
const foodRelatedTerms = [
  'fresh', 'organic', 'roasted', 'grilled', 'baked', 'fried', 'steamed', 'boiled',
  'sautéed', 'braised', 'stewed', 'smoked', 'cured', 'pickled', 'fermented',
  'juice', 'puree', 'sauce', 'soup', 'stew', 'salad', 'dish', 'meal', 'snack',
  'breakfast', 'lunch', 'dinner', 'dessert', 'appetizer', 'side'
];

// Common food categories and types
const foodCategories = [
  'fruit', 'vegetable', 'meat', 'fish', 'seafood', 'dairy', 'grain', 'nut',
  'seed', 'herb', 'spice', 'bread', 'pasta', 'rice', 'bean', 'legume', 'oil',
  'cheese', 'yogurt', 'milk', 'cream', 'butter', 'egg', 'chicken', 'beef',
  'pork', 'lamb', 'turkey', 'duck', 'tofu', 'tempeh', 'seitan'
];

/**
 * Checks if a string likely represents a food item
 * @param input The string to check
 * @returns boolean indicating whether the input is likely a food item
 */
export function isFoodItem(input: string): boolean {
  // Return false for blank or very short inputs
  if (!input || input.length < 2) {
    return false;
  }
  
  // Clean and prepare the input
  const normalizedInput = input.trim().toLowerCase();
  
  // Check for common non-food words
  if (commonNonFoodWords.includes(normalizedInput)) {
    return false;
  }
  
  // Check for numeric/special character only entries (likely not food)
  if (/^[^a-zA-Z]*$/.test(normalizedInput)) {
    return false;
  }
  
  // If the input is very long, it's less likely to be a food item
  if (normalizedInput.length > 50) {
    return false;
  }
  
  // Positive signals: check if input contains known food categories
  for (const category of foodCategories) {
    if (normalizedInput.includes(category)) {
      return true;
    }
  }
  
  // Check if input contains food-related terms
  for (const term of foodRelatedTerms) {
    if (normalizedInput.includes(term)) {
      return true;
    }
  }
  
  // Additional heuristic: most short, simple words with alphabetic characters are likely food items
  // This is a fairly permissive check since we want to avoid false negatives
  if (normalizedInput.length <= 15 && /^[a-z\s]+$/.test(normalizedInput)) {
    return true;
  }
  
  // If none of our heuristic checks passed or failed definitively,
  // we'll default to true to avoid frustrating users with false negatives
  return true;
}

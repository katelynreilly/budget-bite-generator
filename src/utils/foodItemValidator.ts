
// A simple utility to check if a string likely represents a food item
// This is a basic implementation that could be enhanced with more sophisticated checks

const commonNonFoodWords = [
  'the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this',
  'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your',
  'test', 'example', 'item', 'sample', 'my', 'stuff', 'thing', 'random', 'placeholder',
  'something', 'blah', 'xyz', 'abc', '123', 'todo', 'none', 'n/a', 'na', 'nil'
];

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
  
  // If none of our heuristic checks failed, let's assume it's a food item
  return true;
}

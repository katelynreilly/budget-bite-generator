
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IngredientItem } from './IngredientItem';

interface IngredientSuggestionsProps {
  suggestions: IngredientItem[];
  onAddSuggestion: (suggestion: IngredientItem) => void;
}

export const IngredientSuggestions: React.FC<IngredientSuggestionsProps> = ({ 
  suggestions, 
  onAddSuggestion 
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-secondary/30 p-3 rounded-md">
      <p className="text-xs font-medium mb-2">Suggestions (click to add):</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion, idx) => (
          <Badge 
            key={idx}
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onAddSuggestion(suggestion)}
          >
            {suggestion.name}
            {suggestion.cookingMethod && ` (${suggestion.cookingMethod})`}
          </Badge>
        ))}
      </div>
    </div>
  );
};

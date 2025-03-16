
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { IngredientItem } from './IngredientItem';
import { IngredientSuggestions } from './IngredientSuggestions';

interface IngredientCategoryProps {
  title: string;
  items: IngredientItem[];
  category: 'proteins' | 'grains' | 'vegetables' | 'sauces';
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onCookingMethodChange?: (index: number, value: string) => void;
  cookingMethods?: string[];
  suggestions?: IngredientItem[];
  onAddSuggestion?: (suggestion: IngredientItem) => void;
}

export const IngredientCategory: React.FC<IngredientCategoryProps> = ({
  title,
  items,
  category,
  onChange,
  onRemove,
  onAdd,
  onCookingMethodChange,
  cookingMethods,
  suggestions,
  onAddSuggestion,
}) => {
  const singleName = category === 'proteins' ? 'Protein' : 
                    category === 'grains' ? 'Grain' : 
                    category === 'vegetables' ? 'Vegetable' : 'Sauce';

  return (
    <div className="mb-3">
      <div className="mb-2">
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      
      {suggestions && onAddSuggestion && (
        <IngredientSuggestions 
          suggestions={suggestions} 
          onAddSuggestion={onAddSuggestion} 
        />
      )}
      
      <div className="grid grid-cols-1 gap-2">
        {items.map((item, index) => (
          <IngredientItem
            key={index}
            item={item}
            index={index}
            onChange={(value) => onChange(index, value)}
            onRemove={() => onRemove(index)}
            onCookingMethodChange={onCookingMethodChange ? 
              (value) => onCookingMethodChange(index, value) : 
              undefined
            }
            cookingMethods={cookingMethods}
          />
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full border-dashed"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {singleName}
      </Button>
    </div>
  );
};

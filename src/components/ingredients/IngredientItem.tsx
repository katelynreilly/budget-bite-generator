
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface IngredientItemProps {
  item: IngredientItem;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  onCookingMethodChange?: (value: string) => void;
  cookingMethods?: string[];
}

export interface IngredientItem {
  name: string;
  cookingMethod?: string;
  isValid?: boolean;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({
  item,
  index,
  onChange,
  onRemove,
  onCookingMethodChange,
  cookingMethods,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-secondary/20 rounded-md p-2">
      <div className={`flex-grow ${cookingMethods ? 'min-w-[180px]' : 'min-w-[250px]'}`}>
        <div className="relative">
          <Input
            value={item.name}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Item ${index + 1}`}
            className={`h-8 text-sm ${!item.isValid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {!item.isValid && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        {!item.isValid && (
          <p className="text-xs text-red-500 mt-1">This doesn't appear to be a food item</p>
        )}
      </div>
      
      {cookingMethods && onCookingMethodChange && (
        <div className="w-[130px]">
          <Select
            value={item.cookingMethod || "none"}
            onValueChange={(value) => 
              onCookingMethodChange(value === "none" ? "" : value)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Cooking method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preference</SelectItem>
              {cookingMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 shrink-0"
        onClick={onRemove}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

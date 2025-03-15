import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ChevronDown, ChevronUp, BookmarkPlus } from 'lucide-react';
import { ParsedData } from '@/utils/fileParser';
import { estimateIngredientCost } from '@/utils/costEstimator';
import { estimateFlavorProfile } from '@/utils/flavorProfileEstimator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSavedIngredientData, saveIngredientData } from '@/utils/storage';
import { suggestedIngredients } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ManualIngredientFormProps {
  onDataSubmitted: (data: ParsedData) => void;
  isLoading: boolean;
  suggestedIngredients?: {
    proteins: IngredientItem[];
    grains: IngredientItem[];
    vegetables: IngredientItem[];
    sauces: IngredientItem[];
  };
}

interface IngredientItem {
  name: string;
  cookingMethod?: string;
}

const PROTEIN_COOKING_METHODS = ['Grilled', 'Baked', 'Air-fried', 'Pan-seared', 'Slow-cooked', 'Steamed', 'Poached', 'Stir-fried', 'Roasted'];
const VEGETABLE_COOKING_METHODS = ['Roasted', 'Steamed', 'Sautéed', 'Grilled', 'Raw', 'Stir-fried', 'Blanched'];

const ManualIngredientForm: React.FC<ManualIngredientFormProps> = ({ 
  onDataSubmitted, 
  isLoading,
  suggestedIngredients 
}) => {
  const createEmptyItems = () => Array(3).fill({ name: '', cookingMethod: '' });
  
  const [proteins, setProteins] = useState<IngredientItem[]>(createEmptyItems());
  const [grains, setGrains] = useState<IngredientItem[]>(createEmptyItems());
  const [vegetables, setVegetables] = useState<IngredientItem[]>(createEmptyItems());
  const [sauces, setSauces] = useState<IngredientItem[]>(createEmptyItems());

  useEffect(() => {
    const savedData = getSavedIngredientData();
    if (savedData) {
      const parseToFormItems = (items: any[], cookingMethodNeeded: boolean) => {
        return items.map(item => {
          const name = item.name;
          let cookingMethod = '';
          
          if (cookingMethodNeeded && item.attributes && item.attributes.length > 0) {
            cookingMethod = item.attributes[0];
          }
          
          return { name, cookingMethod };
        });
      };
      
      if (savedData.proteins.length > 0) {
        setProteins(parseToFormItems(savedData.proteins, true));
      }
      
      if (savedData.grains.length > 0) {
        setGrains(parseToFormItems(savedData.grains, false));
      }
      
      if (savedData.vegetables.length > 0) {
        setVegetables(parseToFormItems(savedData.vegetables, true));
      }
      
      if (savedData.sauces.length > 0) {
        setSauces(parseToFormItems(savedData.sauces, false));
      }
    }
  }, []);

  const handleAddItem = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => [...prev, { name: '', cookingMethod: '' }]);
  };

  const handleRemoveItem = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    index: number,
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, name: value } : item
      )
    );
  };

  const handleCookingMethodChange = (
    category: 'proteins' | 'vegetables',
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, cookingMethod: value } : item
      )
    );
  };
  
  const handleAddSuggestion = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    suggestion: IngredientItem,
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => {
      if (prev.some(item => item.name === suggestion.name)) {
        return prev;
      }
      
      const emptyIndex = prev.findIndex(item => item.name === '');
      
      if (emptyIndex !== -1) {
        return prev.map((item, i) => 
          i === emptyIndex ? suggestion : item
        );
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parseItems = async (items: IngredientItem[], category: 'protein' | 'grain' | 'vegetable' | 'sauce') => {
      const parsedItems = [];
      
      for (const item of items) {
        if (item.name.trim() !== '') {
          const estimatedCost = await estimateIngredientCost(item.name.trim(), category);
          const flavorProfile = estimateFlavorProfile(item.name.trim(), category);
          
          const name = item.cookingMethod 
            ? `${item.cookingMethod} ${item.name.trim()}`
            : item.name.trim();
          
          parsedItems.push({
            id: `manual-${category}-${parsedItems.length}`,
            name,
            category,
            cost: estimatedCost,
            flavorProfile,
            attributes: item.cookingMethod ? [item.cookingMethod] : undefined
          });
        }
      }
      
      return parsedItems;
    };
    
    try {
      const parsedData: ParsedData = {
        proteins: await parseItems(proteins, 'protein'),
        grains: await parseItems(grains, 'grain'),
        vegetables: await parseItems(vegetables, 'vegetable'),
        sauces: await parseItems(sauces, 'sauce'),
      };
      
      saveIngredientData(parsedData);
      
      onDataSubmitted(parsedData);
    } catch (error) {
      console.error('Error estimating costs:', error);
    }
  };

  const renderIngredientFields = (
    items: IngredientItem[],
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>,
    label: string
  ) => {
    const singleName = category === 'proteins' ? 'Protein' : 
                        category === 'grains' ? 'Grain' : 
                        category === 'vegetables' ? 'Vegetable' : 'Sauce';
    
    const needsCookingMethod = category === 'proteins' || category === 'vegetables';
    const cookingMethods = category === 'proteins' ? PROTEIN_COOKING_METHODS : VEGETABLE_COOKING_METHODS;
    
    return (
      <div className="mb-3">
        <div className="mb-2">
          <h3 className="text-base font-medium">{label}</h3>
        </div>
        
        {suggestedIngredients && (
          <div className="mb-4 bg-secondary/30 p-3 rounded-md">
            <p className="text-xs font-medium mb-2">Suggestions (click to add):</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedIngredients[category].map((suggestion, idx) => (
                <Badge 
                  key={idx}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAddSuggestion(category, suggestion, setter)}
                >
                  {suggestion.name}
                  {suggestion.cookingMethod && ` (${suggestion.cookingMethod})`}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 bg-secondary/20 rounded-md p-2">
              <div className={`flex-grow ${needsCookingMethod ? 'min-w-[180px]' : 'min-w-[250px]'}`}>
                <Input
                  value={item.name}
                  onChange={(e) => handleItemChange(category, index, e.target.value, setter)}
                  placeholder={`${singleName} ${index + 1}`}
                  className="h-8 text-sm"
                />
              </div>
              
              {needsCookingMethod && (
                <div className="w-[130px]">
                  <Select
                    value={item.cookingMethod || "none"}
                    onValueChange={(value) => 
                      handleCookingMethodChange(
                        category as 'proteins' | 'vegetables', 
                        index, 
                        value === "none" ? "" : value, 
                        setter
                      )
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
                onClick={() => handleRemoveItem(category, index, setter)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full border-dashed"
          onClick={() => handleAddItem(category, setter)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {singleName}
        </Button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="text-sm mb-4 p-3 bg-accent rounded-lg">
        <p className="font-medium">Enter your preferred ingredients in each category:</p>
        <p className="text-xs text-muted-foreground mt-1">For proteins and vegetables, you can also select your preferred cooking method.</p>
        <p className="text-xs text-muted-foreground mt-1"><strong>Important:</strong> Please include at least one item in each category for the best meal plan results.</p>
        {suggestedIngredients && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs font-medium">Suggestions:</span>
            <Badge variant="outline" className="text-xs">Click on any suggestion to add it</Badge>
          </div>
        )}
      </div>
      
      <Accordion type="single" collapsible defaultValue="proteins" className="space-y-2">
        <AccordionItem value="proteins" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Proteins</AccordionTrigger>
          <AccordionContent>
            {renderIngredientFields(proteins, 'proteins', setProteins, 'Proteins')}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="grains" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Grains</AccordionTrigger>
          <AccordionContent>
            {renderIngredientFields(grains, 'grains', setGrains, 'Grains')}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="vegetables" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Vegetables</AccordionTrigger>
          <AccordionContent>
            {renderIngredientFields(vegetables, 'vegetables', setVegetables, 'Vegetables')}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sauces" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Sauces</AccordionTrigger>
          <AccordionContent>
            {renderIngredientFields(sauces, 'sauces', setSauces, 'Sauces')}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isLoading}
      >
        Generate Meal Plan
      </Button>
    </form>
  );
};

export default ManualIngredientForm;

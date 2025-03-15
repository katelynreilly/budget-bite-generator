
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { ParsedData } from '@/utils/fileParser';
import { estimateIngredientCost } from '@/utils/costEstimator';
import { estimateFlavorProfile } from '@/utils/flavorProfileEstimator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManualIngredientFormProps {
  onDataSubmitted: (data: ParsedData) => void;
  isLoading: boolean;
}

interface IngredientItem {
  name: string;
  cookingMethod?: string;
}

const PROTEIN_COOKING_METHODS = ['Grilled', 'Baked', 'Air-fried', 'Pan-seared', 'Slow-cooked', 'Steamed', 'Poached', 'Stir-fried'];
const VEGETABLE_COOKING_METHODS = ['Roasted', 'Steamed', 'Sautéed', 'Grilled', 'Raw', 'Stir-fried', 'Blanched'];

const ManualIngredientForm: React.FC<ManualIngredientFormProps> = ({ 
  onDataSubmitted, 
  isLoading 
}) => {
  // Initialize with 5 empty items in each category
  const createEmptyItems = () => Array(5).fill({ name: '', cookingMethod: '' });
  
  const [proteins, setProteins] = useState<IngredientItem[]>(createEmptyItems());
  const [grains, setGrains] = useState<IngredientItem[]>(createEmptyItems());
  const [vegetables, setVegetables] = useState<IngredientItem[]>(createEmptyItems());
  const [sauces, setSauces] = useState<IngredientItem[]>(createEmptyItems());

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
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-medium">{label}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleAddItem(category, setter)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
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
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="text-sm mb-4 p-3 bg-accent rounded-lg">
        <p className="font-medium">Enter your preferred ingredients in each category:</p>
        <p className="text-xs text-muted-foreground mt-1">For proteins and vegetables, you can also select your preferred cooking method.</p>
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

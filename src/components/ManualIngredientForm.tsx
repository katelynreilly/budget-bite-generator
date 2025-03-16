
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ParsedData } from '@/utils/fileParser';
import { estimateIngredientCost } from '@/utils/costEstimator';
import { estimateFlavorProfile } from '@/utils/flavorProfileEstimator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getSavedIngredientData, saveIngredientData } from '@/utils/storage';
import { cleanIngredientName } from '@/utils/nameGenerator';
import { isFoodItem } from '@/utils/foodItemValidator';
import { IngredientCategory } from './ingredients/IngredientCategory';
import { FormInstructions } from './ingredients/FormInstructions';
import { IngredientItem as IngredientItemType } from './ingredients/IngredientItem';

interface ManualIngredientFormProps {
  onDataSubmitted: (data: ParsedData) => void;
  isLoading: boolean;
  suggestedIngredients?: {
    proteins: IngredientItemType[];
    grains: IngredientItemType[];
    vegetables: IngredientItemType[];
    sauces: IngredientItemType[];
  };
}

const PROTEIN_COOKING_METHODS = ['Grilled', 'Baked', 'Air-fried', 'Pan-seared', 'Slow-cooked', 'Steamed', 'Poached', 'Stir-fried', 'Roasted'];
const VEGETABLE_COOKING_METHODS = ['Roasted', 'Steamed', 'Sautéed', 'Grilled', 'Raw', 'Stir-fried', 'Blanched'];

const ManualIngredientForm: React.FC<ManualIngredientFormProps> = ({ 
  onDataSubmitted, 
  isLoading,
  suggestedIngredients 
}) => {
  const createEmptyItems = () => Array(3).fill({ name: '', cookingMethod: '', isValid: true });
  
  const [proteins, setProteins] = useState<IngredientItemType[]>(createEmptyItems());
  const [grains, setGrains] = useState<IngredientItemType[]>(createEmptyItems());
  const [vegetables, setVegetables] = useState<IngredientItemType[]>(createEmptyItems());
  const [sauces, setSauces] = useState<IngredientItemType[]>(createEmptyItems());

  useEffect(() => {
    const savedData = getSavedIngredientData();
    if (savedData) {
      const parseToFormItems = (items: any[], cookingMethodNeeded: boolean) => {
        return items.map(item => {
          const name = cleanIngredientName(item.name);
          let cookingMethod = '';
          
          if (cookingMethodNeeded && item.attributes && item.attributes.length > 0) {
            cookingMethod = item.attributes[0];
          }
          
          return { name, cookingMethod, isValid: true };
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
    setter: React.Dispatch<React.SetStateAction<IngredientItemType[]>>
  ) => {
    setter(prev => [...prev, { name: '', cookingMethod: '', isValid: true }]);
  };

  const handleRemoveItem = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    index: number,
    setter: React.Dispatch<React.SetStateAction<IngredientItemType[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<IngredientItemType[]>>
  ) => {
    setter(prev => 
      prev.map((item, i) => {
        if (i === index) {
          const isValid = value.trim() === '' || isFoodItem(value);
          return { ...item, name: value, isValid };
        }
        return item;
      })
    );
  };

  const handleCookingMethodChange = (
    category: 'proteins' | 'vegetables',
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<IngredientItemType[]>>
  ) => {
    setter(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, cookingMethod: value } : item
      )
    );
  };
  
  const handleAddSuggestion = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    suggestion: IngredientItemType,
    setter: React.Dispatch<React.SetStateAction<IngredientItemType[]>>
  ) => {
    setter(prev => {
      if (prev.some(item => item.name === suggestion.name)) {
        return prev;
      }
      
      const emptyIndex = prev.findIndex(item => item.name === '');
      
      if (emptyIndex !== -1) {
        return prev.map((item, i) => 
          i === emptyIndex ? { ...suggestion, isValid: true } : item
        );
      } else {
        return [...prev, { ...suggestion, isValid: true }];
      }
    });
  };

  const validateInputs = () => {
    let hasInvalidItems = false;
    
    // Check proteins
    setProteins(prev => prev.map(item => {
      const isValid = item.name.trim() === '' || isFoodItem(item.name);
      if (!isValid) hasInvalidItems = true;
      return { ...item, isValid };
    }));
    
    // Check grains
    setGrains(prev => prev.map(item => {
      const isValid = item.name.trim() === '' || isFoodItem(item.name);
      if (!isValid) hasInvalidItems = true;
      return { ...item, isValid };
    }));
    
    // Check vegetables
    setVegetables(prev => prev.map(item => {
      const isValid = item.name.trim() === '' || isFoodItem(item.name);
      if (!isValid) hasInvalidItems = true;
      return { ...item, isValid };
    }));
    
    // Check sauces
    setSauces(prev => prev.map(item => {
      const isValid = item.name.trim() === '' || isFoodItem(item.name);
      if (!isValid) hasInvalidItems = true;
      return { ...item, isValid };
    }));
    
    return !hasInvalidItems;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate all inputs
    if (!validateInputs()) {
      return;
    }
    
    const parseItems = async (items: IngredientItemType[], category: 'protein' | 'grain' | 'vegetable' | 'sauce') => {
      const parsedItems = [];
      
      for (const item of items) {
        if (item.name.trim() !== '') {
          const estimatedCost = await estimateIngredientCost(item.name.trim(), category);
          const flavorProfile = estimateFlavorProfile(item.name.trim(), category);
          
          const cleanName = cleanIngredientName(item.name.trim());
          
          parsedItems.push({
            id: `manual-${category}-${parsedItems.length}`,
            name: cleanName,
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

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <FormInstructions hasSuggestions={!!suggestedIngredients} />
      
      <Accordion type="single" collapsible defaultValue="proteins" className="space-y-2">
        <AccordionItem value="proteins" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Proteins</AccordionTrigger>
          <AccordionContent>
            <IngredientCategory
              title="Proteins"
              items={proteins}
              category="proteins"
              onChange={(index, value) => handleItemChange('proteins', index, value, setProteins)}
              onRemove={(index) => handleRemoveItem('proteins', index, setProteins)}
              onAdd={() => handleAddItem('proteins', setProteins)}
              onCookingMethodChange={(index, value) => 
                handleCookingMethodChange('proteins', index, value, setProteins)
              }
              cookingMethods={PROTEIN_COOKING_METHODS}
              suggestions={suggestedIngredients?.proteins}
              onAddSuggestion={(suggestion) => 
                handleAddSuggestion('proteins', suggestion, setProteins)
              }
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="grains" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Grains</AccordionTrigger>
          <AccordionContent>
            <IngredientCategory
              title="Grains"
              items={grains}
              category="grains"
              onChange={(index, value) => handleItemChange('grains', index, value, setGrains)}
              onRemove={(index) => handleRemoveItem('grains', index, setGrains)}
              onAdd={() => handleAddItem('grains', setGrains)}
              suggestions={suggestedIngredients?.grains}
              onAddSuggestion={(suggestion) => 
                handleAddSuggestion('grains', suggestion, setGrains)
              }
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="vegetables" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Vegetables</AccordionTrigger>
          <AccordionContent>
            <IngredientCategory
              title="Vegetables"
              items={vegetables}
              category="vegetables"
              onChange={(index, value) => handleItemChange('vegetables', index, value, setVegetables)}
              onRemove={(index) => handleRemoveItem('vegetables', index, setVegetables)}
              onAdd={() => handleAddItem('vegetables', setVegetables)}
              onCookingMethodChange={(index, value) => 
                handleCookingMethodChange('vegetables', index, value, setVegetables)
              }
              cookingMethods={VEGETABLE_COOKING_METHODS}
              suggestions={suggestedIngredients?.vegetables}
              onAddSuggestion={(suggestion) => 
                handleAddSuggestion('vegetables', suggestion, setVegetables)
              }
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sauces" className="border rounded-lg px-3 py-2">
          <AccordionTrigger className="py-2">Sauces</AccordionTrigger>
          <AccordionContent>
            <IngredientCategory
              title="Sauces"
              items={sauces}
              category="sauces"
              onChange={(index, value) => handleItemChange('sauces', index, value, setSauces)}
              onRemove={(index) => handleRemoveItem('sauces', index, setSauces)}
              onAdd={() => handleAddItem('sauces', setSauces)}
              suggestions={suggestedIngredients?.sauces}
              onAddSuggestion={(suggestion) => 
                handleAddSuggestion('sauces', suggestion, setSauces)
              }
            />
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

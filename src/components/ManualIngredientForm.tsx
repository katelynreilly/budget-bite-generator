
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { ParsedData } from '@/utils/fileParser';
import { estimateIngredientCost } from '@/utils/costEstimator';
import { estimateFlavorProfile } from '@/utils/flavorProfileEstimator';

interface ManualIngredientFormProps {
  onDataSubmitted: (data: ParsedData) => void;
  isLoading: boolean;
}

interface IngredientItem {
  name: string;
}

const ManualIngredientForm: React.FC<ManualIngredientFormProps> = ({ 
  onDataSubmitted, 
  isLoading 
}) => {
  const [proteins, setProteins] = useState<IngredientItem[]>([{ name: '' }]);
  const [grains, setGrains] = useState<IngredientItem[]>([{ name: '' }]);
  const [vegetables, setVegetables] = useState<IngredientItem[]>([{ name: '' }]);
  const [sauces, setSauces] = useState<IngredientItem[]>([{ name: '' }]);
  
  const [expandedSections, setExpandedSections] = useState({
    proteins: true,
    grains: true,
    vegetables: true,
    sauces: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddItem = (
    category: 'proteins' | 'grains' | 'vegetables' | 'sauces',
    setter: React.Dispatch<React.SetStateAction<IngredientItem[]>>
  ) => {
    setter(prev => [...prev, { name: '' }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parseItems = async (items: IngredientItem[], category: 'protein' | 'grain' | 'vegetable' | 'sauce') => {
      const parsedItems = [];
      
      for (const item of items) {
        if (item.name.trim() !== '') {
          const estimatedCost = await estimateIngredientCost(item.name.trim(), category);
          const flavorProfile = estimateFlavorProfile(item.name.trim(), category);
          
          parsedItems.push({
            id: `manual-${category}-${parsedItems.length}`,
            name: item.name.trim(),
            category,
            cost: estimatedCost,
            flavorProfile,
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
    isExpanded: boolean
  ) => {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    const singleName = category === 'proteins' ? 'Protein' : 
                      category === 'grains' ? 'Grain' : 
                      category === 'vegetables' ? 'Vegetable' : 'Sauce';
    
    return (
      <div className="mb-6 border rounded-lg p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection(category)}
        >
          <h3 className="text-lg font-medium">{categoryTitle}</h3>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        
        {isExpanded && (
          <>
            {items.map((item, index) => (
              <div key={index} className="mb-4 p-3 bg-secondary/30 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{singleName} #{index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleRemoveItem(category, index, setter)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor={`${category}-${index}-name`}>{singleName} Name</Label>
                    <Input
                      id={`${category}-${index}-name`}
                      value={item.name}
                      onChange={(e) => handleItemChange(category, index, e.target.value, setter)}
                      placeholder={`Enter ${singleName.toLowerCase()} name`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => handleAddItem(category, setter)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {singleName}
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="text-sm mb-4 p-4 bg-accent rounded-lg">
        <p className="mb-2 font-medium">Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Add at least one item in each category</li>
          <li>Just enter the names - we'll estimate costs and flavor profiles automatically</li>
          <li>The more specific you are with ingredient names, the better our estimates will be</li>
        </ul>
      </div>
      
      {renderIngredientFields(proteins, 'proteins', setProteins, expandedSections.proteins)}
      {renderIngredientFields(grains, 'grains', setGrains, expandedSections.grains)}
      {renderIngredientFields(vegetables, 'vegetables', setVegetables, expandedSections.vegetables)}
      {renderIngredientFields(sauces, 'sauces', setSauces, expandedSections.sauces)}
      
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


import React, { useState } from 'react';
import { ShoppingList as ShoppingListType, ShoppingItem } from '@/utils/mealPlanGenerator';
import { Check, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ShoppingListProps {
  shoppingList: ShoppingListType;
}

const ShoppingList = ({ shoppingList }: ShoppingListProps) => {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };
  
  const handlePrintList = () => {
    window.print();
    toast({
      title: "Printing Shopping List",
      description: "Your shopping list is being sent to your printer!"
    });
  };
  
  const handleClearList = () => {
    setCheckedItems(new Set());
    toast({
      title: "List Cleared",
      description: "All items have been unchecked."
    });
  };
  
  // Group items by category for better organization
  const groupedItems: Record<string, ShoppingItem[]> = {};
  
  shoppingList.items.forEach(item => {
    const category = item.ingredient.category;
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });
  
  const categories = Object.keys(groupedItems).sort();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Week {shoppingList.weekNumber} Shopping List</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearList}
            disabled={checkedItems.size === 0}
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintList}
          >
            Print
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border divide-y">
        {categories.map(category => (
          <div key={category} className="animate-slide-up">
            <div className="bg-secondary/40 px-4 py-2 font-medium capitalize">
              {category}s
            </div>
            <ul className="divide-y">
              {groupedItems[category].map(item => (
                <li 
                  key={item.ingredient.id}
                  className={`px-4 py-3 flex items-center justify-between transition-all ${
                    checkedItems.has(item.ingredient.id) ? 'bg-secondary/20' : ''
                  }`}
                >
                  <button 
                    className="flex items-center gap-3 w-full text-left"
                    onClick={() => toggleItem(item.ingredient.id)}
                  >
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                      checkedItems.has(item.ingredient.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {checkedItems.has(item.ingredient.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className={`flex-1 ${
                      checkedItems.has(item.ingredient.id) ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {item.ingredient.name} × {item.quantity}
                    </span>
                    <span className={`text-sm ${
                      checkedItems.has(item.ingredient.id) ? 'text-muted-foreground' : ''
                    }`}>
                      ${item.cost.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-accent/50 text-accent-foreground">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total:</span>
          <span className="font-semibold">${shoppingList.totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;

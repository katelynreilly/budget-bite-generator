
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Meal } from '@/utils/mealTypes';
import { Utensils, Wheat, Salad, Droplets, Heart, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFavoriteRecipe, removeFavoriteRecipe, isRecipeFavorite } from '@/utils/storage';

interface MealCardProps {
  meal: Meal;
}

const MealCard = ({ meal }: MealCardProps) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    setIsFavorite(isRecipeFavorite(meal.id));
  }, [meal.id]);
  
  const gradientIndex = parseInt(meal.id.replace(/\D/g, ''), 10) % 5;
  const gradients = [
    'bg-gradient-to-br from-amber-50 to-orange-100',
    'bg-gradient-to-br from-blue-50 to-indigo-100',
    'bg-gradient-to-br from-emerald-50 to-teal-100',
    'bg-gradient-to-br from-rose-50 to-pink-100',
    'bg-gradient-to-br from-violet-50 to-purple-100'
  ];
  
  const gradient = gradients[gradientIndex];
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavoriteRecipe(meal.id);
      setIsFavorite(false);
      toast({
        title: "Recipe Removed",
        description: "Recipe removed from your favorites."
      });
    } else {
      saveFavoriteRecipe(meal);
      setIsFavorite(true);
      toast({
        title: "Recipe Saved",
        description: "Recipe saved to your favorites. It will influence future meal plans."
      });
    }
  };
  
  return (
    <Card className={`meal-card overflow-hidden transition-all hover:shadow-lg ${gradient} border-0 relative`}>
      <CardContent className="p-5">
        <button 
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isFavorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <h3 className="font-semibold text-lg leading-tight mb-3">{meal.name}</h3>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Utensils className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm truncate" title={meal.protein.name}>{meal.protein.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-amber-100">
              <Wheat className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-sm truncate" title={meal.grain.name}>{meal.grain.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-emerald-100">
              <Salad className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-sm truncate" title={meal.vegetable.name}>{meal.vegetable.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-indigo-100">
              <Droplets className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-sm truncate" title={meal.sauce.name}>{meal.sauce.name}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm pt-3 border-t">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            <span>Est. Cost:</span>
          </div>
          <span className="font-medium">${meal.cost.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;

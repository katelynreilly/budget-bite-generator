
import React, { useState } from 'react';
import { Meal, WeeklyPlan, MealPlan as MealPlanType, generateShoppingList } from '@/utils/mealPlanGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CalendarDays, ShoppingCart, DollarSign } from 'lucide-react';
import ShoppingList from './ShoppingList';

interface MealPlanProps {
  mealPlan: MealPlanType;
  onRegeneratePlan: () => void;
  isLoading: boolean;
}

const MealCard = ({ meal }: { meal: Meal }) => {
  // Generate a predictable but random-looking image based on meal ID
  const imageId = parseInt(meal.id.replace(/\D/g, ''), 10) % 15 + 1;
  const imageUrl = `https://source.unsplash.com/collection/4318479/600x400?sig=${imageId}`;
  
  return (
    <div className="meal-card rounded-xl overflow-hidden bg-white card-shadow transition-all">
      <div className="overflow-hidden">
        <img 
          src={imageUrl} 
          alt={meal.name} 
          className="meal-image w-full h-40 object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-base leading-tight mb-2">{meal.name}</h3>
        <div className="text-xs text-muted-foreground mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-primary">Protein:</span>
            <span>{meal.protein.name}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-primary">Grain:</span>
            <span>{meal.grain.name}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-primary">Vegetable:</span>
            <span>{meal.vegetable.name}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-primary">Sauce:</span>
            <span>{meal.sauce.name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            <span>Est. Cost:</span>
          </div>
          <span className="font-medium">${meal.cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const WeeklyView = ({ weeklyPlan }: { weeklyPlan: WeeklyPlan }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {weeklyPlan.meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-accent/50 text-accent-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1.5" />
            <span className="font-medium">Weekly Total Cost:</span>
          </div>
          <span className="font-semibold">
            ${weeklyPlan.meals.reduce((sum, meal) => sum + meal.cost, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const MealPlan = ({ mealPlan, onRegeneratePlan, isLoading }: MealPlanProps) => {
  const { toast } = useToast();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('meals');
  
  const currentWeek = mealPlan.weeks[currentWeekIndex];
  const [shoppingList, setShoppingList] = useState(generateShoppingList(currentWeek));
  
  const handleWeekChange = (index: number) => {
    if (index >= 0 && index < mealPlan.weeks.length) {
      setCurrentWeekIndex(index);
      setShoppingList(generateShoppingList(mealPlan.weeks[index]));
    }
  };
  
  const handleRegeneratePlan = () => {
    if (isLoading) return;
    
    onRegeneratePlan();
    toast({
      title: "Generating New Meal Plan",
      description: "Creating a fresh meal plan with new recipes!"
    });
  };

  return (
    <div className="relative max-w-3xl mx-auto animate-scale-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Monthly Meal Plan</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-7 mt-1">
            4 weeks, 16 meals total
          </p>
        </div>
        
        <Button 
          onClick={handleRegeneratePlan}
          disabled={isLoading}
          variant="outline"
          className="transition-all"
        >
          Regenerate Plan
        </Button>
      </div>
      
      <div className="p-5 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWeekChange(currentWeekIndex - 1)}
              disabled={currentWeekIndex === 0}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-all"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium">Week {currentWeek.weekNumber}</h3>
            
            <button
              onClick={() => handleWeekChange(currentWeekIndex + 1)}
              disabled={currentWeekIndex === mealPlan.weeks.length - 1}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-all"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="meals">Meals</TabsTrigger>
              <TabsTrigger value="shopping">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Shopping List</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          {activeTab === 'meals' ? (
            <WeeklyView weeklyPlan={currentWeek} />
          ) : (
            <ShoppingList shoppingList={shoppingList} />
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-accent/70 text-accent-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1.5" />
            <span className="font-medium">Total Monthly Cost:</span>
          </div>
          <span className="font-semibold">${mealPlan.totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;

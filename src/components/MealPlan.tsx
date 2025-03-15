import React, { useState } from 'react';
import { Meal, WeeklyPlan, MealPlan as MealPlanType, generateShoppingList } from '@/utils/mealPlanGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CalendarDays, ShoppingCart, DollarSign, Utensils, Wheat, Salad, Droplets } from 'lucide-react';
import ShoppingList from './ShoppingList';
import { Card, CardContent } from '@/components/ui/card';

interface MealPlanProps {
  mealPlan: MealPlanType;
  onRegeneratePlan: () => void;
  isLoading: boolean;
}

const MealCard = ({ meal }: { meal: Meal }) => {
  // Generate a predictable but random-looking image based on meal ID
  const imageId = parseInt(meal.id.replace(/\D/g, ''), 10) % 15 + 1;
  const imageUrl = `https://source.unsplash.com/collection/4318479/600x400?sig=${imageId}`;
  
  // Generate a gradient background color based on meal ID for consistency
  const gradientIndex = parseInt(meal.id.replace(/\D/g, ''), 10) % 5;
  const gradients = [
    'bg-gradient-to-br from-amber-50 to-orange-100', // Warm gradient
    'bg-gradient-to-br from-blue-50 to-indigo-100',  // Cool gradient
    'bg-gradient-to-br from-emerald-50 to-teal-100', // Fresh gradient
    'bg-gradient-to-br from-rose-50 to-pink-100',    // Sweet gradient
    'bg-gradient-to-br from-violet-50 to-purple-100' // Rich gradient
  ];
  
  const gradient = gradients[gradientIndex];
  
  return (
    <Card className={`meal-card overflow-hidden transition-all hover:shadow-lg ${gradient} border-0`}>
      <div className="overflow-hidden rounded-t-xl">
        <img 
          src={imageUrl} 
          alt={meal.name} 
          className="meal-image w-full h-48 object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-5">
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

const WeeklyView = ({ weeklyPlan }: { weeklyPlan: WeeklyPlan }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {weeklyPlan.meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 text-accent-foreground">
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
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
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
      
      <Card className="p-5 rounded-xl shadow-sm bg-gradient-to-b from-white to-card/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleWeekChange(currentWeekIndex - 1)}
              disabled={currentWeekIndex === 0}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h3 className="text-lg font-medium">Week {currentWeek.weekNumber}</h3>
            
            <Button
              onClick={() => handleWeekChange(currentWeekIndex + 1)}
              disabled={currentWeekIndex === mealPlan.weeks.length - 1}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-[300px]">
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
      </Card>
      
      <div className="mt-6 p-5 rounded-lg shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">Total Monthly Cost:</span>
          </div>
          <span className="font-semibold text-lg">${mealPlan.totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;


import React, { useState, useEffect } from 'react';
import { MealPlan as MealPlanType, WeeklyPlan, generateShoppingList } from '@/utils/mealPlanGenerator';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveMealPlan, getFavoriteRecipes } from '@/utils/storage';
import WeeklyView from './WeeklyView';
import ShoppingList from './ShoppingList';
import MealPlanHeader from './MealPlanHeader';
import WeekNavigation from './WeekNavigation';
import SaveMealPlanDialog from './SaveMealPlanDialog';

interface MealPlanProps {
  mealPlan: MealPlanType;
  onRegeneratePlan: () => void;
  onReenterIngredients: () => void;
  isLoading: boolean;
  onOpenLibrary: () => void;
}

const MealPlan = ({ 
  mealPlan, 
  onRegeneratePlan, 
  onReenterIngredients,
  isLoading, 
  onOpenLibrary 
}: MealPlanProps) => {
  const { toast } = useToast();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('meals');
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  
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

  const handleSavePlan = () => {
    if (!saveName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your meal plan",
        variant: "destructive"
      });
      return;
    }
    
    saveMealPlan(mealPlan, saveName.trim());
    setSaveDialogOpen(false);
    setSaveName('');
    
    toast({
      title: "Meal Plan Saved",
      description: "Your meal plan has been saved to your library"
    });
  };

  return (
    <div className="relative max-w-3xl mx-auto animate-scale-in">
      <MealPlanHeader 
        setSaveDialogOpen={setSaveDialogOpen}
        onOpenLibrary={onOpenLibrary}
        handleRegeneratePlan={handleRegeneratePlan}
        onReenterIngredients={onReenterIngredients}
        isLoading={isLoading}
      />
      
      <Card className="p-5 rounded-xl shadow-sm bg-gradient-to-b from-white to-card/40">
        <WeekNavigation
          currentWeekIndex={currentWeekIndex}
          weekNumber={currentWeek.weekNumber}
          weeksCount={mealPlan.weeks.length}
          activeTab={activeTab}
          onWeekChange={handleWeekChange}
          setActiveTab={setActiveTab}
        />
        
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
            <span className="font-medium">Total Monthly Cost:</span>
          </div>
          <span className="font-semibold text-lg">${mealPlan.totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <SaveMealPlanDialog
        open={isSaveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        saveName={saveName}
        setSaveName={setSaveName}
        handleSavePlan={handleSavePlan}
      />
    </div>
  );
};

export default MealPlan;

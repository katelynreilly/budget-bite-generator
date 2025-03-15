
import React from 'react';
import { Meal, WeeklyPlan } from '@/utils/mealTypes';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import MealCard from './MealCard';

interface WeeklyViewProps {
  weeklyPlan: WeeklyPlan;
}

const WeeklyView = ({ weeklyPlan }: WeeklyViewProps) => {
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

export default WeeklyView;

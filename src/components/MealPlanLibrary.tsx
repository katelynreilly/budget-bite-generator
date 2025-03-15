
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MealPlan } from '@/utils/mealPlanGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Library, Calendar, ShoppingCart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MealPlanLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedPlans: SavedMealPlan[];
  onLoadPlan: (plan: MealPlan) => void;
  onDeletePlan: (id: string) => void;
}

export interface SavedMealPlan {
  id: string;
  plan: MealPlan;
  name: string;
  date: string;
}

const MealPlanLibrary: React.FC<MealPlanLibraryProps> = ({
  open,
  onOpenChange,
  savedPlans,
  onLoadPlan,
  onDeletePlan
}) => {
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleLoadPlan = (plan: MealPlan) => {
    onLoadPlan(plan);
    onOpenChange(false);
    toast({
      title: "Meal Plan Loaded",
      description: "Your saved meal plan has been loaded successfully."
    });
  };

  const handleDeletePlan = (id: string) => {
    if (confirmDelete === id) {
      onDeletePlan(id);
      setConfirmDelete(null);
      toast({
        title: "Meal Plan Deleted",
        description: "Your saved meal plan has been deleted."
      });
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            <span>Your Saved Meal Plans</span>
          </DialogTitle>
        </DialogHeader>

        {savedPlans.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Library className="h-6 w-6 text-secondary-foreground/60" />
            </div>
            <h3 className="font-medium mb-1">No saved meal plans</h3>
            <p className="text-sm text-muted-foreground">
              When you save a meal plan, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedPlans.map((savedPlan) => (
              <Card key={savedPlan.id} className="relative group overflow-hidden">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => handleDeletePlan(savedPlan.id)}
                    >
                      {confirmDelete === savedPlan.id ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-1">{savedPlan.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{savedPlan.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{savedPlan.plan.weeks.length * 4} meals</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {savedPlan.plan.weeks[0].meals.slice(0, 3).map((meal) => (
                      <div 
                        key={meal.id} 
                        className="text-xs bg-secondary/50 px-2 py-1 rounded-full truncate max-w-[120px]"
                        title={meal.name}
                      >
                        {meal.name}
                      </div>
                    ))}
                    {savedPlan.plan.weeks[0].meals.length > 3 && (
                      <div className="text-xs bg-secondary/50 px-2 py-1 rounded-full">
                        +{savedPlan.plan.weeks[0].meals.length - 3} more
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleLoadPlan(savedPlan.plan)}
                  >
                    Load Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanLibrary;

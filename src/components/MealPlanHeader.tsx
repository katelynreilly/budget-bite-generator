
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Library } from 'lucide-react';

interface MealPlanHeaderProps {
  setSaveDialogOpen: (open: boolean) => void;
  onOpenLibrary: () => void;
  handleRegeneratePlan: () => void;
  isLoading: boolean;
}

const MealPlanHeader = ({
  setSaveDialogOpen,
  onOpenLibrary,
  handleRegeneratePlan,
  isLoading
}: MealPlanHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Monthly Meal Plan</h2>
        </div>
        <p className="text-sm text-muted-foreground ml-1 mt-1">
          4 weeks, 16 meals total
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => setSaveDialogOpen(true)}
          variant="outline"
          className="transition-all gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
        
        <Button
          onClick={onOpenLibrary}
          variant="outline"
          className="transition-all gap-1.5"
        >
          <Library className="h-4 w-4" />
          <span>Library</span>
        </Button>
        
        <Button 
          onClick={handleRegeneratePlan}
          disabled={isLoading}
          variant="outline"
          className="transition-all"
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
};

export default MealPlanHeader;

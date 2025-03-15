
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SaveMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saveName: string;
  setSaveName: (name: string) => void;
  handleSavePlan: () => void;
}

const SaveMealPlanDialog = ({
  open,
  onOpenChange,
  saveName,
  setSaveName,
  handleSavePlan
}: SaveMealPlanDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Save Meal Plan</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name your meal plan</Label>
            <Input
              id="name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Family Dinner Plan, Budget Meals"
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSavePlan}>
            Save Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMealPlanDialog;


import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FormInstructionsProps {
  hasSuggestions: boolean;
}

export const FormInstructions: React.FC<FormInstructionsProps> = ({ hasSuggestions }) => {
  return (
    <div className="text-sm mb-4 p-3 bg-accent rounded-lg">
      <p className="font-medium">Enter your preferred ingredients in each category:</p>
      <p className="text-xs text-muted-foreground mt-1">For proteins and vegetables, you can also select your preferred cooking method.</p>
      <p className="text-xs text-muted-foreground mt-1"><strong>Important:</strong> Please include at least one item in each category for the best meal plan results.</p>
      {hasSuggestions && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs font-medium">Suggestions:</span>
          <Badge variant="outline" className="text-xs">Click on any suggestion to add it</Badge>
        </div>
      )}
    </div>
  );
};

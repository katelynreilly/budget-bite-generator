
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeekNavigationProps {
  currentWeekIndex: number;
  weekNumber: number;
  weeksCount: number;
  activeTab: string;
  onWeekChange: (index: number) => void;
  setActiveTab: (value: string) => void;
}

const WeekNavigation = ({
  currentWeekIndex,
  weekNumber,
  weeksCount,
  activeTab,
  onWeekChange,
  setActiveTab
}: WeekNavigationProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onWeekChange(currentWeekIndex - 1)}
          disabled={currentWeekIndex === 0}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h3 className="text-lg font-medium">Week {weekNumber}</h3>
        
        <Button
          onClick={() => onWeekChange(currentWeekIndex + 1)}
          disabled={currentWeekIndex === weeksCount - 1}
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
              <span>Shopping List</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default WeekNavigation;

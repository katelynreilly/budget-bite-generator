
import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ManualIngredientForm from '@/components/ManualIngredientForm';
import MealPlan from '@/components/MealPlan';
import MealPlanLibrary, { SavedMealPlan } from '@/components/MealPlanLibrary';
import { ParsedData, getFallbackData } from '@/utils/fileParser';
import { MealPlan as MealPlanType, generateMealPlan } from '@/utils/mealPlanGenerator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  Utensils, 
  Calendar, 
  FileSpreadsheet, 
  ShoppingCart,
  FileUp,
  FileDown,
  FormInput,
  Calculator,
  Library
} from 'lucide-react';
import { downloadTemplateFile } from '@/utils/templateGenerator';
import { getSavedMealPlans, deleteSavedMealPlan } from '@/utils/storage';

const Index = () => {
  const isMobile = useIsMobile();
  const [ingredientData, setIngredientData] = useState<ParsedData | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('manual');
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Load saved meal plans on component mount
  useEffect(() => {
    setSavedPlans(getSavedMealPlans());
  }, []);

  const handleDataParsed = (data: ParsedData) => {
    setIngredientData(data);
    generatePlan(data);
  };

  const handleRegeneratePlan = () => {
    if (ingredientData) {
      generatePlan(ingredientData);
    } else if (useFallbackData) {
      generatePlan(getFallbackData());
    }
  };

  const generatePlan = (data: ParsedData) => {
    setIsGenerating(true);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      const newPlan = generateMealPlan(data, {
        weeksCount: 4,
        mealsPerWeek: 4,
      });
      
      setMealPlan(newPlan);
      setIsGenerating(false);
    }, 1000);
  };

  const handleUseSampleData = () => {
    setUseFallbackData(true);
    const fallbackData = getFallbackData();
    setIngredientData(fallbackData);
    generatePlan(fallbackData);
  };
  
  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadTemplateFile();
  };

  const handleLoadSavedPlan = (plan: MealPlanType) => {
    setMealPlan(plan);
    setIsLibraryOpen(false);
  };

  const handleDeleteSavedPlan = (id: string) => {
    deleteSavedMealPlan(id);
    setSavedPlans(getSavedMealPlans());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-6">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Utensils className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Budget Meal Planner</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {mealPlan ? (
                <div className="hidden md:flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full gap-1.5"
                    onClick={() => setIsLibraryOpen(true)}
                  >
                    <Library className="h-4 w-4" />
                    <span>Library</span>
                  </Button>
                </div>
              ) : (
                savedPlans.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full gap-1.5"
                    onClick={() => setIsLibraryOpen(true)}
                  >
                    <Library className="h-4 w-4" />
                    <span>Library</span>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8 container max-w-6xl">
        {!mealPlan ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-semibold mb-3">Create Your Monthly Meal Plan</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your ingredients or upload a spreadsheet to generate a custom meal plan optimized for taste and budget.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 text-sm text-primary">
                <Calculator className="h-4 w-4" />
                <span>Costs are automatically estimated</span>
              </div>
            </div>
            
            <div className="mb-8 flex justify-center gap-4">
              <Button
                variant={inputMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setInputMethod('manual')}
                className="gap-2"
              >
                <FormInput className="h-4 w-4" />
                <span>Manual Entry</span>
              </Button>
              
              <Button
                variant={inputMethod === 'upload' ? 'default' : 'outline'}
                onClick={() => setInputMethod('upload')}
                className="gap-2"
              >
                <FileUp className="h-4 w-4" />
                <span>Upload Spreadsheet</span>
              </Button>
            </div>
            
            <div className="space-y-8">
              {inputMethod === 'manual' ? (
                <div className="border rounded-lg p-6">
                  <ManualIngredientForm
                    onDataSubmitted={handleDataParsed}
                    isLoading={isGenerating}
                  />
                </div>
              ) : (
                <>
                  <FileUpload 
                    onDataParsed={handleDataParsed} 
                    isLoading={isGenerating}
                  />
                  
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-secondary/70 px-4 py-2 rounded-full text-sm">
                      <FileDown className="h-4 w-4" />
                      <a href="#" onClick={handleDownloadTemplate} className="text-primary font-medium hover:underline">
                        Download template spreadsheet
                      </a>
                    </div>
                    
                    <div>
                      <div className="mb-2 text-sm text-muted-foreground">
                        Don't have a spreadsheet ready?
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleUseSampleData}
                        disabled={isGenerating}
                        className="gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Use Sample Data</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {isGenerating && (
                <div className="text-center py-4 animate-pulse">
                  <div className="text-sm text-muted-foreground">
                    Generating your meal plan...
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <MealPlan 
            mealPlan={mealPlan} 
            onRegeneratePlan={handleRegeneratePlan}
            isLoading={isGenerating}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />
        )}
      </main>
      
      {/* Meal Plan Library Dialog */}
      <MealPlanLibrary
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        savedPlans={savedPlans}
        onLoadPlan={handleLoadSavedPlan}
        onDeletePlan={handleDeleteSavedPlan}
      />
      
      <footer className="border-t py-6">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <div>
              Budget Meal Planner &copy; {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Help</a>
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import * as XLSX from 'xlsx';
import { estimateFlavorProfile } from './flavorProfileEstimator';
import { estimateIngredientCost } from './costEstimator';

// Define the structure of our ingredient data
export interface Ingredient {
  id: string;
  name: string;
  category: 'protein' | 'grain' | 'vegetable' | 'sauce';
  cost: number;
  flavorProfile: string[];
  attributes?: string[];
}

export interface ParsedData {
  proteins: Ingredient[];
  grains: Ingredient[];
  vegetables: Ingredient[];
  sauces: Ingredient[];
}

export const parseExcelFile = async (
  file: File
): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet name
        const firstSheetName = workbook.SheetNames[0];
        
        // Get the worksheet
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const proteins: Ingredient[] = [];
        const grains: Ingredient[] = [];
        const vegetables: Ingredient[] = [];
        const sauces: Ingredient[] = [];
        
        // Process the JSON data
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          // Extract relevant data from the row
          const name = row.Name || row.name || '';
          const category = (row.Category || row.category || '').toLowerCase();
          
          // Skip empty rows
          if (!name || !category) continue;
          
          // Determine the category
          let typedCategory: 'protein' | 'grain' | 'vegetable' | 'sauce' = 'protein';
          if (category === 'grain') typedCategory = 'grain';
          else if (category === 'vegetable') typedCategory = 'vegetable';
          else if (category === 'sauce') typedCategory = 'sauce';
          
          // Get cost and flavor profile estimations if they're not provided
          const cost = row.Cost || row.cost || await estimateIngredientCost(name, typedCategory);
          
          // Use provided flavor profile or estimate it
          let flavorProfile: string[] = [];
          if (row.FlavorProfile || row['Flavor Profile'] || row.flavorProfile) {
            const flavorString = row.FlavorProfile || row['Flavor Profile'] || row.flavorProfile || '';
            flavorProfile = flavorString.split(',').map((flavor: string) => flavor.trim());
          } else {
            flavorProfile = estimateFlavorProfile(name, typedCategory);
          }
          
          const ingredient: Ingredient = {
            id: `${i}`,
            name,
            category: typedCategory,
            cost: Number(cost),
            flavorProfile,
            attributes: row.Attributes ? 
              row.Attributes.split(',').map((attr: string) => attr.trim()) : 
              undefined
          };
          
          // Add to the corresponding category
          switch (ingredient.category) {
            case 'protein':
              proteins.push(ingredient);
              break;
            case 'grain':
              grains.push(ingredient);
              break;
            case 'vegetable':
              vegetables.push(ingredient);
              break;
            case 'sauce':
              sauces.push(ingredient);
              break;
          }
        }
        
        resolve({ proteins, grains, vegetables, sauces });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Fallback data for demonstration purposes
export const getFallbackData = (): ParsedData => {
  return {
    proteins: [
      { id: '1', name: 'Chicken Breast', category: 'protein', cost: 3.99, flavorProfile: ['mild', 'savory'] },
      { id: '2', name: 'Ground Beef', category: 'protein', cost: 4.99, flavorProfile: ['rich', 'savory'] },
      { id: '3', name: 'Tofu', category: 'protein', cost: 2.49, flavorProfile: ['mild', 'neutral'] },
      { id: '4', name: 'Salmon', category: 'protein', cost: 8.99, flavorProfile: ['rich', 'savory'] },
      { id: '5', name: 'Chickpeas', category: 'protein', cost: 1.49, flavorProfile: ['nutty', 'mild'] },
    ],
    grains: [
      { id: '6', name: 'Brown Rice', category: 'grain', cost: 0.99, flavorProfile: ['nutty', 'mild'] },
      { id: '7', name: 'Pasta', category: 'grain', cost: 1.29, flavorProfile: ['mild', 'neutral'] },
      { id: '8', name: 'Quinoa', category: 'grain', cost: 3.99, flavorProfile: ['nutty', 'mild'] },
      { id: '9', name: 'Couscous', category: 'grain', cost: 2.49, flavorProfile: ['mild', 'neutral'] },
      { id: '10', name: 'Bread', category: 'grain', cost: 2.99, flavorProfile: ['mild', 'neutral'] },
    ],
    vegetables: [
      { id: '11', name: 'Broccoli', category: 'vegetable', cost: 1.99, flavorProfile: ['earthy', 'mild'] },
      { id: '12', name: 'Bell Peppers', category: 'vegetable', cost: 1.49, flavorProfile: ['sweet', 'fresh'] },
      { id: '13', name: 'Spinach', category: 'vegetable', cost: 2.99, flavorProfile: ['earthy', 'mild'] },
      { id: '14', name: 'Carrots', category: 'vegetable', cost: 0.99, flavorProfile: ['sweet', 'earthy'] },
      { id: '15', name: 'Zucchini', category: 'vegetable', cost: 1.29, flavorProfile: ['mild', 'fresh'] },
    ],
    sauces: [
      { id: '16', name: 'Tomato Sauce', category: 'sauce', cost: 1.99, flavorProfile: ['tangy', 'savory'] },
      { id: '17', name: 'Soy Sauce', category: 'sauce', cost: 2.49, flavorProfile: ['salty', 'umami'] },
      { id: '18', name: 'Pesto', category: 'sauce', cost: 3.99, flavorProfile: ['herby', 'savory'] },
      { id: '19', name: 'Curry Sauce', category: 'sauce', cost: 2.99, flavorProfile: ['spicy', 'aromatic'] },
      { id: '20', name: 'Teriyaki Sauce', category: 'sauce', cost: 3.49, flavorProfile: ['sweet', 'salty'] },
    ],
  };
};

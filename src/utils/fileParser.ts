
import * as XLSX from 'xlsx';

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
    
    reader.onload = (e) => {
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
        jsonData.forEach((row, index) => {
          // Extract relevant data from the row
          const ingredient: Ingredient = {
            id: `${index}`,
            name: row.Name || row.name || '',
            category: (row.Category || row.category || '').toLowerCase(),
            cost: Number(row.Cost || row.cost || 0),
            flavorProfile: (row.FlavorProfile || row['Flavor Profile'] || row.flavorProfile || '')
              .split(',')
              .map((flavor: string) => flavor.trim()),
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
            default:
              // Try to guess the category based on name if not specified
              if (
                ingredient.name.toLowerCase().includes('chicken') || 
                ingredient.name.toLowerCase().includes('beef') || 
                ingredient.name.toLowerCase().includes('tofu')
              ) {
                ingredient.category = 'protein';
                proteins.push(ingredient);
              } else if (
                ingredient.name.toLowerCase().includes('rice') || 
                ingredient.name.toLowerCase().includes('pasta') || 
                ingredient.name.toLowerCase().includes('bread')
              ) {
                ingredient.category = 'grain';
                grains.push(ingredient);
              } else if (
                ingredient.name.toLowerCase().includes('sauce') || 
                ingredient.name.toLowerCase().includes('dressing')
              ) {
                ingredient.category = 'sauce';
                sauces.push(ingredient);
              } else {
                // Default to vegetable if we can't determine
                ingredient.category = 'vegetable';
                vegetables.push(ingredient);
              }
          }
        });
        
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

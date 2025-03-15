
import * as XLSX from 'xlsx';

export const generateTemplateFile = (): Blob => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Define the template data with headers and example rows (removing cost column)
  const data = [
    ['Name', 'Category', 'FlavorProfile', 'Attributes'],
    ['Chicken Breast', 'protein', 'mild, savory', 'lean, high-protein'],
    ['Ground Beef', 'protein', 'rich, savory', 'versatile'],
    ['Tofu', 'protein', 'mild, neutral', 'vegetarian'],
    ['Brown Rice', 'grain', 'nutty, mild', 'whole-grain'],
    ['Quinoa', 'grain', 'nutty, mild', 'high-protein'],
    ['Pasta', 'grain', 'mild, neutral', 'versatile'],
    ['Broccoli', 'vegetable', 'earthy, mild', 'cruciferous'],
    ['Bell Peppers', 'vegetable', 'sweet, fresh', 'colorful'],
    ['Spinach', 'vegetable', 'earthy, mild', 'leafy-green'],
    ['Tomato Sauce', 'sauce', 'tangy, savory', 'acidic'],
    ['Soy Sauce', 'sauce', 'salty, umami', 'fermented'],
    ['Pesto', 'sauce', 'herby, savory', 'italian'],
  ];
  
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // Name
    { wch: 10 }, // Category
    { wch: 20 }, // FlavorProfile
    { wch: 20 }, // Attributes
  ];
  
  ws['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients');
  
  // Generate the Excel file as a blob
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadTemplateFile = () => {
  const blob = generateTemplateFile();
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meal_planner_template.xlsx';
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

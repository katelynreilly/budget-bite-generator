
import * as XLSX from 'xlsx';

export const generateTemplateFile = (): Blob => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Define the template data with headers and example rows
  const data = [
    ['Name', 'Category', 'Cost', 'FlavorProfile', 'Attributes'],
    ['Chicken Breast', 'protein', '3.99', 'mild, savory', 'lean, high-protein'],
    ['Ground Beef', 'protein', '4.99', 'rich, savory', 'versatile'],
    ['Tofu', 'protein', '2.49', 'mild, neutral', 'vegetarian'],
    ['Brown Rice', 'grain', '0.99', 'nutty, mild', 'whole-grain'],
    ['Quinoa', 'grain', '3.99', 'nutty, mild', 'high-protein'],
    ['Pasta', 'grain', '1.29', 'mild, neutral', 'versatile'],
    ['Broccoli', 'vegetable', '1.99', 'earthy, mild', 'cruciferous'],
    ['Bell Peppers', 'vegetable', '1.49', 'sweet, fresh', 'colorful'],
    ['Spinach', 'vegetable', '2.99', 'earthy, mild', 'leafy-green'],
    ['Tomato Sauce', 'sauce', '1.99', 'tangy, savory', 'acidic'],
    ['Soy Sauce', 'sauce', '2.49', 'salty, umami', 'fermented'],
    ['Pesto', 'sauce', '3.99', 'herby, savory', 'italian'],
  ];
  
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // Name
    { wch: 10 }, // Category
    { wch: 8 },  // Cost
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

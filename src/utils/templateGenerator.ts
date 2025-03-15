
import * as XLSX from 'xlsx';

export const generateTemplateFile = (): Blob => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Define the template data with headers and example rows (removing flavor profile column)
  const data = [
    ['Name', 'Category'],
    ['Chicken Breast', 'protein'],
    ['Ground Beef', 'protein'],
    ['Tofu', 'protein'],
    ['Brown Rice', 'grain'],
    ['Quinoa', 'grain'],
    ['Pasta', 'grain'],
    ['Broccoli', 'vegetable'],
    ['Bell Peppers', 'vegetable'],
    ['Spinach', 'vegetable'],
    ['Tomato Sauce', 'sauce'],
    ['Soy Sauce', 'sauce'],
    ['Pesto', 'sauce'],
  ];
  
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 20 }, // Name
    { wch: 15 }, // Category
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

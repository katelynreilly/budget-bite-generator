
import { useState, useRef } from 'react';
import { parseExcelFile } from '@/utils/fileParser';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Check } from 'lucide-react';

interface FileUploadProps {
  onDataParsed: (data: any) => void;
  isLoading: boolean;
}

const FileUpload = ({ onDataParsed, isLoading }: FileUploadProps) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    try {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Format",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        return;
      }

      setFileName(file.name);
      
      const data = await parseExcelFile(file);
      
      // Validate that we have data in all categories
      if (
        data.proteins.length === 0 || 
        data.grains.length === 0 || 
        data.vegetables.length === 0 || 
        data.sauces.length === 0
      ) {
        toast({
          title: "Missing Data",
          description: "Your spreadsheet must contain at least one item in each category: protein, grain, vegetable, and sauce",
          variant: "destructive"
        });
        return;
      }
      
      onDataParsed(data);
      setFileUploaded(true);
      
      toast({
        title: "File Processed Successfully",
        description: `${data.proteins.length} proteins, ${data.grains.length} grains, ${data.vegetables.length} vegetables, and ${data.sauces.length} sauces found.`
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error Processing File",
        description: "There was an error processing your spreadsheet. Please check the format and try again.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form
        className={`relative rounded-xl ${
          dragActive ? 'border-primary' : 'border-border'
        } border-2 border-dashed p-8 transition-all duration-200 ease-in-out animate-fade-in`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept=".xlsx,.xls"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {fileUploaded ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center animate-scale-in">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium mt-2">File Uploaded</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{fileName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onButtonClick}
                className="mt-3"
                disabled={isLoading}
              >
                Replace File
              </Button>
            </div>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Upload className="h-7 w-7 text-primary animate-slide-down" />
              </div>
              <h3 className="text-lg font-medium">Upload Your Ingredients Spreadsheet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Excel file (.xlsx, .xls) with protein, grain, vegetable, and sauce options
              </p>
              <Button 
                onClick={onButtonClick} 
                disabled={isLoading}
                className="transition-all"
              >
                Select File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                or drag and drop your file here
              </p>
            </>
          )}
        </div>
        
        {/* Drag overlay */}
        {dragActive && (
          <div
            className="absolute inset-0 rounded-xl bg-primary/5 flex items-center justify-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="font-medium">Drop your file here</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FileUpload;

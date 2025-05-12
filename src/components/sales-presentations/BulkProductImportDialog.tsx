
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText, X, Download, Loader2 } from 'lucide-react';
import { parseISBNsFromCSV, createSampleCSVContent } from '@/utils/csv-parser';
import { fetchProductsByISBN } from '@/api/salesPresentations/fetchProductsByISBN';
import { useOrganization } from '@/context/OrganizationContext';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (products: Product[]) => void;
}

export function BulkProductImportDialog({
  open,
  onOpenChange,
  onImportComplete
}: BulkProductImportDialogProps) {
  const { currentOrganization } = useOrganization();
  const [file, setFile] = useState<File | null>(null);
  const [parsedISBNs, setParsedISBNs] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  
  // Reset the dialog state when it opens/closes
  const resetState = () => {
    setFile(null);
    setParsedISBNs([]);
    setProducts([]);
    setSelectedProducts(new Set());
    setLoading(false);
    setError(null);
    setStep('upload');
  };
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      setError(null);
      setLoading(true);
      
      const file = acceptedFiles[0];
      setFile(file);
      
      // Read the file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          // Parse ISBNs from the CSV content
          const isbns = parseISBNsFromCSV(content);
          setParsedISBNs(isbns);
          
          if (isbns.length === 0) {
            setError('No valid ISBN-13 numbers found in the file.');
            setLoading(false);
            return;
          }
          
          // Fetch products by ISBN
          if (currentOrganization) {
            const fetchedProducts = await fetchProductsByISBN(isbns, currentOrganization.id);
            setProducts(fetchedProducts);
            
            // Pre-select all products
            const productIds = new Set(fetchedProducts.map(p => p.id));
            setSelectedProducts(productIds);
            
            setStep('preview');
          }
        } catch (err) {
          setError('Error processing file. Please ensure it contains valid ISBN-13 values.');
          console.error('File processing error:', err);
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setLoading(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error in file drop handler:', err);
      setLoading(false);
    }
  }, [currentOrganization]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: loading
  });
  
  const handleImport = () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    onImportComplete(selectedProductsList);
    onOpenChange(false);
  };
  
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };
  
  const selectAll = () => {
    setSelectedProducts(new Set(products.map(p => p.id)));
  };
  
  const deselectAll = () => {
    setSelectedProducts(new Set());
  };
  
  const handleDownloadSample = () => {
    const csvContent = createSampleCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_isbn_import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const foundCount = products.length;
  const notFoundCount = parsedISBNs.length - foundCount;
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetState();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Products by ISBN</DialogTitle>
        </DialogHeader>
        
        {step === 'upload' && (
          <div className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              {loading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Processing file...</p>
                </div>
              ) : (
                <>
                  <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? "Drop the file here..."
                      : "Drag & drop a CSV file with ISBN-13 values, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: .csv, .txt
                  </p>
                </>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                type="button"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </Button>
              
              <p className="text-xs text-muted-foreground">
                One ISBN-13 per line or in a column
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  Found {foundCount} product{foundCount !== 1 ? 's' : ''}
                </p>
                {notFoundCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {notFoundCount} ISBN{notFoundCount !== 1 ? 's' : ''} couldn't be matched
                  </p>
                )}
              </div>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  type="button"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  type="button"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            {products.length > 0 ? (
              <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>ISBN-13</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.isbn13}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center">
                <p className="text-muted-foreground">No products found with the provided ISBNs.</p>
              </div>
            )}
            
            {notFoundCount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Some ISBNs not found</AlertTitle>
                <AlertDescription>
                  {notFoundCount} ISBN{notFoundCount !== 1 ? 's' : ''} couldn't be matched to products in your catalog.
                  This may be because they don't exist in your organization or there may be formatting issues.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {step === 'preview' && products.length > 0 && (
            <Button 
              onClick={handleImport} 
              disabled={selectedProducts.size === 0}
            >
              Import {selectedProducts.size} Products
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

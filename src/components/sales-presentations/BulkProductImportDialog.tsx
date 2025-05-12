
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { useOrganization } from '@/context/OrganizationContext';
import { fetchProductsByISBN } from '@/api/salesPresentations/fetchProductsByISBN';
import { createSampleCSVContent, parseISBNsFromCSV } from '@/utils/csv-parser';
import { Product } from '@/types/product';
import { Loader2, AlertCircle, DownloadCloud, Upload, CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from '@/components/ui/img';

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
  const [isLoading, setIsLoading] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [isbnList, setIsbnList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('upload');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setProducts([]);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const content = await readFileAsText(file);
      setCsvContent(content);
      
      // Parse ISBN values from CSV
      const isbns = parseISBNsFromCSV(content);
      setIsbnList(isbns);
      
      if (isbns.length === 0) {
        setError('No valid ISBN-13 values found in the CSV file');
        setIsLoading(false);
        return;
      }
      
      // Fetch products by ISBN
      if (currentOrganization) {
        const foundProducts = await fetchProductsByISBN(isbns, currentOrganization.id);
        setProducts(foundProducts);
        
        // Auto-select all found products
        const ids = new Set(foundProducts.map(p => p.id));
        setSelectedProductIds(ids);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the CSV file');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);
  
  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1 
  });
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  const downloadSampleCSV = () => {
    const content = createSampleCSVContent();
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isbn_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProductIds);
    
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    
    setSelectedProductIds(newSelection);
  };
  
  const handleImport = () => {
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    onImportComplete(selectedProducts);
    onOpenChange(false);
    
    // Reset state
    setProducts([]);
    setCsvContent(null);
    setIsbnList([]);
    setSelectedProductIds(new Set());
  };
  
  const foundCount = products.length;
  const notFoundCount = isbnList.length - foundCount;
  const selectedCount = selectedProductIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 mt-4">
            {!csvContent ? (
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag & drop a CSV file here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  The CSV should contain ISBN-13 values in a column
                </p>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleCSV();
                  }}
                >
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-gray-600">Searching for products...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Results</h3>
                        <p className="text-sm text-muted-foreground">
                          Found {foundCount} of {isbnList.length} products
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setCsvContent(null);
                          setIsbnList([]);
                          setProducts([]);
                          setSelectedProductIds(new Set());
                        }}
                      >
                        Upload Different File
                      </Button>
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {notFoundCount > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {notFoundCount} ISBN{notFoundCount !== 1 ? 's' : ''} could not be found in your products.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="border rounded-md max-h-[300px] overflow-y-auto">
                      {products.length > 0 ? (
                        <ul className="divide-y">
                          {products.map(product => {
                            const isSelected = selectedProductIds.has(product.id);
                            
                            return (
                              <li 
                                key={product.id}
                                className={`flex items-center p-3 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                onClick={() => toggleProductSelection(product.id)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 mr-3">
                                  {isSelected ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                  ) : (
                                    <div className="w-6 h-6 border border-gray-300 rounded-full" />
                                  )}
                                </div>
                                
                                {product.cover_image_url && (
                                  <div className="flex-shrink-0 w-12 h-16 mr-3 overflow-hidden">
                                    <Image
                                      src={product.cover_image_url}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{product.title}</p>
                                  <div className="text-xs text-muted-foreground">
                                    <span>ISBN: {product.isbn13 || 'N/A'}</span>
                                    {product.publisher_name && (
                                      <span className="ml-2">• {product.publisher_name}</span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No products found matching the ISBN values
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="prose prose-sm max-w-none">
              <h3>How to Import Products</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Prepare a CSV file with ISBN-13 values</li>
                <li>Upload the CSV file using the "Upload CSV" tab</li>
                <li>The system will match ISBNs to products in your database</li>
                <li>Select the products you want to import</li>
                <li>Click "Import Selected Products" to add them to your presentation</li>
              </ol>
              
              <h3 className="mt-6">CSV Format Requirements</h3>
              <p>Your CSV file should:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Contain ISBN-13 values (13 digits)</li>
                <li>Either have a header row with "ISBN-13" or just list ISBNs one per line</li>
                <li>Hyphens or spaces in ISBNs are automatically removed</li>
              </ul>
              
              <h3 className="mt-6">Sample CSV Format</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                ISBN-13<br/>
                9781234567890<br/>
                9780987654321<br/>
                9782468013579
              </pre>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleCSV}
                className="mt-4"
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <div>
            {csvContent && products.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} of {foundCount} products selected
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleImport}
              disabled={isLoading || selectedProductIds.size === 0}
            >
              Import Selected Products
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

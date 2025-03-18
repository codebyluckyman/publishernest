
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

export function APIDocumentation() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const apiEndpoint = `${window.location.origin}/api/update-stock`;
  
  const exampleRequest = JSON.stringify({
    updates: [
      {
        product_id: "123e4567-e89b-12d3-a456-426614174000",
        warehouse_id: "123e4567-e89b-12d3-a456-426614174001",
        quantity: 10,
        operation: "set"
      },
      {
        product_id: "123e4567-e89b-12d3-a456-426614174002",
        warehouse_id: "123e4567-e89b-12d3-a456-426614174001",
        quantity: 5,
        operation: "add"
      }
    ]
  }, null, 2);
  
  const exampleResponse = JSON.stringify({
    results: [
      {
        product_id: "123e4567-e89b-12d3-a456-426614174000",
        warehouse_id: "123e4567-e89b-12d3-a456-426614174001",
        status: "success",
        operation: "set",
        quantity: 10
      },
      {
        product_id: "123e4567-e89b-12d3-a456-426614174002",
        warehouse_id: "123e4567-e89b-12d3-a456-426614174001",
        status: "success",
        operation: "add",
        quantity: 5
      }
    ]
  }, null, 2);
  
  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '${JSON.stringify({
    updates: [
      {
        product_id: "YOUR_PRODUCT_ID",
        warehouse_id: "YOUR_WAREHOUSE_ID",
        quantity: 10,
        operation: "set"
      }
    ]
  })}'`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={18} />
          API Documentation
        </CardTitle>
        <CardDescription>
          Learn how to use the Stock Update API to integrate with external systems
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="endpoint">
            <AccordionTrigger>API Endpoint</AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                <code className="text-sm font-mono">{apiEndpoint}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiEndpoint)}>
                  <Copy size={14} />
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send POST requests to this endpoint with your API key to update stock quantities.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="authentication">
            <AccordionTrigger>Authentication</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Include your API key in the request headers:</p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <p>x-api-key: YOUR_API_KEY</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                API keys are specific to your organization and can be managed in the API Keys section.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="request">
            <AccordionTrigger>Request Format</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Send a JSON object with an "updates" array:</p>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-md overflow-auto text-sm">{exampleRequest}</pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(exampleRequest)}
                >
                  <Copy size={14} />
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <p className="font-medium">Operation Types:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><code className="bg-muted px-1 rounded">set</code> - Set the stock quantity to the specified value</li>
                  <li><code className="bg-muted px-1 rounded">add</code> - Add to the current stock quantity</li>
                  <li><code className="bg-muted px-1 rounded">subtract</code> - Subtract from the current stock quantity (won't go below 0)</li>
                </ul>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                You can update multiple products in a single request. If the operation is omitted, it defaults to "set".
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="response">
            <AccordionTrigger>Response Format</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">The API returns a JSON object with results for each update:</p>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-md overflow-auto text-sm">{exampleResponse}</pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(exampleResponse)}
                >
                  <Copy size={14} />
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Each item in the results array indicates whether the update was successful or includes an error message.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="example">
            <AccordionTrigger>Example cURL Request</AccordionTrigger>
            <AccordionContent>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-md overflow-auto text-sm whitespace-pre-wrap">{curlExample}</pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(curlExample)}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="errors">
            <AccordionTrigger>Error Handling</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">HTTP Status Codes:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                    <li><code className="bg-muted px-1 rounded">200</code> - Request processed successfully (some updates may still have errors)</li>
                    <li><code className="bg-muted px-1 rounded">400</code> - Invalid request format</li>
                    <li><code className="bg-muted px-1 rounded">401</code> - Invalid or missing API key</li>
                    <li><code className="bg-muted px-1 rounded">500</code> - Server error</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Error Messages:</p>
                  <p className="text-sm">Each update in the results array includes a status field that indicates success or failure:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                    <li>"Product not found or not accessible"</li>
                    <li>"Warehouse not found or not accessible"</li>
                    <li>"Missing required fields"</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { SupplierQuoteFormat } from '@/types/supplierQuote';
import { useFormatDetails } from '@/hooks/format/useFormatDetails';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatNumber } from '@/utils/productUtils';

interface FormatDetailsPanelProps {
  format: SupplierQuoteFormat;
  expanded?: boolean;
}

export function FormatDetailsPanel({ format, expanded = false }: FormatDetailsPanelProps) {
  const { data: formatDetails, isLoading } = useFormatDetails(format.format_id);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading format details...</span>
      </div>
    );
  }
  
  if (!formatDetails) {
    return (
      <div className="p-2">
        <span className="text-sm text-muted-foreground">No detailed specifications available</span>
      </div>
    );
  }
  
  // Basic display for compact view
  if (!expanded) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {formatDetails.tps_height_mm && formatDetails.tps_width_mm && (
            <Badge variant="outline" className="font-normal">
              {formatNumber(formatDetails.tps_height_mm)} × {formatNumber(formatDetails.tps_width_mm)} mm
              {formatDetails.tps_depth_mm && <> × {formatNumber(formatDetails.tps_depth_mm)} mm</>}
            </Badge>
          )}
          
          {formatDetails.extent && (
            <Badge variant="outline" className="font-normal">
              {formatDetails.extent} pp
            </Badge>
          )}
          
          {formatDetails.binding_type && (
            <Badge variant="outline" className="font-normal">
              {formatDetails.binding_type}
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  // Full display for expanded view
  return (
    <div className="space-y-3 p-1">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {formatDetails.tps_height_mm && formatDetails.tps_width_mm && (
          <div>
            <p className="text-muted-foreground">Dimensions (HxW):</p>
            <p>
              {formatNumber(formatDetails.tps_height_mm)} × {formatNumber(formatDetails.tps_width_mm)} mm
              {formatDetails.tps_depth_mm && <> × {formatNumber(formatDetails.tps_depth_mm)} mm</>}
            </p>
          </div>
        )}
        
        {formatDetails.tps_plc_height_mm && formatDetails.tps_plc_width_mm && (
          <div>
            <p className="text-muted-foreground">PLC Dimensions (HxW):</p>
            <p>
              {formatNumber(formatDetails.tps_plc_height_mm)} × {formatNumber(formatDetails.tps_plc_width_mm)} mm
              {formatDetails.tps_plc_depth_mm && <> × {formatNumber(formatDetails.tps_plc_depth_mm)} mm</>}
            </p>
          </div>
        )}
        
        {formatDetails.extent && (
          <div>
            <p className="text-muted-foreground">Extent:</p>
            <p>{formatDetails.extent}</p>
          </div>
        )}
        
        {formatDetails.binding_type && (
          <div>
            <p className="text-muted-foreground">Binding:</p>
            <p>{String(formatDetails.binding_type)}</p>
          </div>
        )}
        
        {formatDetails.cover_stock_print && (
          <div>
            <p className="text-muted-foreground">Cover:</p>
            <p>{formatDetails.cover_stock_print}</p>
          </div>
        )}
        
        {formatDetails.internal_stock_print && (
          <div>
            <p className="text-muted-foreground">Internal:</p>
            <p>{formatDetails.internal_stock_print}</p>
          </div>
        )}
      </div>
    </div>
  );
}

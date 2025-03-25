
import { Format } from "@/components/format/types/FormatTypes";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/productUtils";

export interface FormatSpecificationsProps {
  format: Format | null;
  isLoading: boolean;
}

export function FormatSpecifications({ format, isLoading }: FormatSpecificationsProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-50 w-full">
        <CardContent className="p-3">
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading format specifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!format) {
    return null;
  }

  return (
    <Card className="bg-slate-50 w-full">
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm mb-2">Format Specifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {format.tps_height_mm && format.tps_width_mm && (
            <div>
              <p className="text-muted-foreground">Dimensions (HxW):</p>
              <p>{formatNumber(format.tps_height_mm)} × {formatNumber(format.tps_width_mm)} mm</p>
              {format.tps_depth_mm && (
                <p>Depth: {formatNumber(format.tps_depth_mm)} mm</p>
              )}
            </div>
          )}
          
          {format.tps_plc_height_mm && format.tps_plc_width_mm && (
            <div>
              <p className="text-muted-foreground">PLC Dimensions (HxW):</p>
              <p>{formatNumber(format.tps_plc_height_mm)} × {formatNumber(format.tps_plc_width_mm)} mm</p>
              {format.tps_plc_depth_mm && (
                <p>PLC Depth: {formatNumber(format.tps_plc_depth_mm)} mm</p>
              )}
            </div>
          )}
          
          {format.extent && (
            <div>
              <p className="text-muted-foreground">Extent:</p>
              <p>{format.extent}</p>
            </div>
          )}
          
          {format.binding_type && (
            <div>
              <p className="text-muted-foreground">Binding:</p>
              <p>{String(format.binding_type)}</p>
            </div>
          )}
          
          {format.cover_stock_print && (
            <div>
              <p className="text-muted-foreground">Cover:</p>
              <p>{format.cover_stock_print}</p>
            </div>
          )}
          
          {format.internal_stock_print && (
            <div>
              <p className="text-muted-foreground">Internal:</p>
              <p>{format.internal_stock_print}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

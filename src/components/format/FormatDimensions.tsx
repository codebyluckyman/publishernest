
import { Format } from "./types/FormatTypes";

interface FormatDimensionsProps {
  format: Format;
  type: "text" | "plc";
}

export function FormatDimensions({ format, type }: FormatDimensionsProps) {
  if (type === "text") {
    return <>{formatTextDimensions(format)}</>;
  }
  
  return <>{formatPlcDimensions(format)}</>;
}

function formatTextDimensions(format: Format) {
  if (!format.tps_height_mm && !format.tps_width_mm && !format.tps_depth_mm) {
    return "N/A";
  }
  
  const height = format.tps_height_mm + 'mm';
  const width = format.tps_width_mm + 'mm';
  
  if (format.tps_depth_mm) {
    return `${height} × ${width} × ${format.tps_depth_mm}mm`;
  }
  
  return `${height} × ${width}`;
}

function formatPlcDimensions(format: Format) {
  if (!format.tps_plc_height_mm && !format.tps_plc_width_mm && !format.tps_plc_depth_mm) {
    return "N/A";
  }
  
  const height = format.tps_plc_height_mm + 'mm';
  const width = format.tps_plc_width_mm + 'mm';
  
  if (format.tps_plc_depth_mm) {
    return `${height} × ${width} × ${format.tps_plc_depth_mm}mm`;
  }
  
  return `${height} × ${width}`;
}

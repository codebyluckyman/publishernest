
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormatFormValues } from "@/hooks/useFormatForm";

interface FormatFormFieldsProps {
  form: UseFormReturn<FormatFormValues>;
  readOnly?: boolean;
}

export function FormatFormFields({ form, readOnly = false }: FormatFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="format_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Format Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Paperback 6x9" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tps"
        render={({ field }) => (
          <FormItem>
            <FormLabel>TPS (Total Pages)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 240 pages" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="extent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Extent</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 6x9 inches" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cover_stock_print"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Stock/Print</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g., 12pt C1S, 4-color process + matte lamination" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="internal_stock_print"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Stock/Print</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g., 60# white offset, 1-color black" {...field} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Customer } from "@/types/customer";

// Import the section components
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { ContactInfoSection } from "./form-sections/ContactInfoSection";
import { AddressSection } from "./form-sections/AddressSection";
import { RequirementsSection } from "./form-sections/RequirementsSection";

// Define validation schema
const customerFormSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  contact_name: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().optional(),
  status: z.string().default("active"),
  notes: z.string().optional(),
  file_approval_required: z.boolean().default(false),
  advance_payment_required: z.boolean().default(false),
  packaging_requirements: z.string().optional(),
  carton_marking_requirements: z.string().optional(),
  freight_forwarder: z.string().optional(),
  delivery_address: z.string().optional(),
  document_notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit: (data: CustomerFormValues) => void;
  isSubmitting?: boolean;
}

export function CustomerForm({ defaultValues, onSubmit, isSubmitting = false }: CustomerFormProps) {
  // Initialize the form with default values
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customer_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      address: "",
      status: "active",
      notes: "",
      file_approval_required: false,
      advance_payment_required: false,
      packaging_requirements: "",
      carton_marking_requirements: "",
      freight_forwarder: "",
      delivery_address: "",
      document_notes: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <BasicInfoSection form={form} />
          
          {/* Contact Information */}
          <ContactInfoSection form={form} />
        </div>
        
        {/* Address */}
        <AddressSection form={form} />
        
        {/* Requirements */}
        <RequirementsSection form={form} />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

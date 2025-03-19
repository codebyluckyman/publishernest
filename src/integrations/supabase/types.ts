export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          created_by: string | null
          id: string
          last_used_at: string | null
          name: string
          organization_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          organization_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey1"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      format_component_links: {
        Row: {
          component_id: string
          created_at: string
          format_id: string
          id: string
          notes: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          component_id: string
          created_at?: string
          format_id: string
          id?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          component_id?: string
          created_at?: string
          format_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "format_component_links_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "format_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "format_component_links_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
        ]
      }
      format_components: {
        Row: {
          component_name: string
          created_at: string
          description: string | null
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          component_name: string
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          component_name?: string
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "format_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      formats: {
        Row: {
          binding_type: string | null
          cover_material: string | null
          cover_stock_print: string | null
          created_at: string
          extent: string | null
          format_name: string
          id: string
          internal_material: string | null
          internal_stock_print: string | null
          organization_id: string
          orientation: string | null
          tps_depth_mm: number | null
          tps_height_mm: number | null
          tps_plc_depth_mm: number | null
          tps_plc_height_mm: number | null
          tps_plc_width_mm: number | null
          tps_width_mm: number | null
          updated_at: string
        }
        Insert: {
          binding_type?: string | null
          cover_material?: string | null
          cover_stock_print?: string | null
          created_at?: string
          extent?: string | null
          format_name: string
          id?: string
          internal_material?: string | null
          internal_stock_print?: string | null
          organization_id: string
          orientation?: string | null
          tps_depth_mm?: number | null
          tps_height_mm?: number | null
          tps_plc_depth_mm?: number | null
          tps_plc_height_mm?: number | null
          tps_plc_width_mm?: number | null
          tps_width_mm?: number | null
          updated_at?: string
        }
        Update: {
          binding_type?: string | null
          cover_material?: string | null
          cover_stock_print?: string | null
          created_at?: string
          extent?: string | null
          format_name?: string
          id?: string
          internal_material?: string | null
          internal_stock_print?: string | null
          organization_id?: string
          orientation?: string | null
          tps_depth_mm?: number | null
          tps_height_mm?: number | null
          tps_plc_depth_mm?: number | null
          tps_plc_height_mm?: number | null
          tps_plc_width_mm?: number | null
          tps_width_mm?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_default_price_breaks: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_default_price_breaks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          auth_user_id: string
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          id?: string
          organization_id: string
          role: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          default_extra_costs: Json | null
          default_num_products: number
          id: string
          logo_url: string | null
          name: string
          organization_type: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_extra_costs?: Json | null
          default_num_products?: number
          id?: string
          logo_url?: string | null
          name: string
          organization_type?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_extra_costs?: Json | null
          default_num_products?: number
          id?: string
          logo_url?: string | null
          name?: string
          organization_type?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_prices: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          is_default: boolean | null
          organization_id: string
          price: number | null
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          id?: string
          is_default?: boolean | null
          organization_id: string
          price?: number | null
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          is_default?: boolean | null
          organization_id?: string
          price?: number | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age_range: string | null
          carton_height_mm: number | null
          carton_length_mm: number | null
          carton_quantity: number | null
          carton_weight_kg: number | null
          carton_width_mm: number | null
          cover_image_url: string | null
          created_at: string
          currency_code: string | null
          edition_number: number | null
          format_extra_comments: string | null
          format_extras: Json | null
          format_id: string | null
          height_measurement: number | null
          id: string
          internal_images: string[] | null
          isbn10: string | null
          isbn13: string | null
          language_code: string | null
          license: string | null
          list_price: number | null
          organization_id: string
          page_count: number | null
          product_availability_code: string | null
          product_form: string | null
          product_form_detail: string | null
          publication_date: string | null
          publisher_name: string | null
          series_name: string | null
          subject_code: string | null
          subtitle: string | null
          synopsis: string | null
          thickness_measurement: number | null
          title: string
          updated_at: string
          weight_measurement: number | null
          width_measurement: number | null
        }
        Insert: {
          age_range?: string | null
          carton_height_mm?: number | null
          carton_length_mm?: number | null
          carton_quantity?: number | null
          carton_weight_kg?: number | null
          carton_width_mm?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency_code?: string | null
          edition_number?: number | null
          format_extra_comments?: string | null
          format_extras?: Json | null
          format_id?: string | null
          height_measurement?: number | null
          id?: string
          internal_images?: string[] | null
          isbn10?: string | null
          isbn13?: string | null
          language_code?: string | null
          license?: string | null
          list_price?: number | null
          organization_id: string
          page_count?: number | null
          product_availability_code?: string | null
          product_form?: string | null
          product_form_detail?: string | null
          publication_date?: string | null
          publisher_name?: string | null
          series_name?: string | null
          subject_code?: string | null
          subtitle?: string | null
          synopsis?: string | null
          thickness_measurement?: number | null
          title: string
          updated_at?: string
          weight_measurement?: number | null
          width_measurement?: number | null
        }
        Update: {
          age_range?: string | null
          carton_height_mm?: number | null
          carton_length_mm?: number | null
          carton_quantity?: number | null
          carton_weight_kg?: number | null
          carton_width_mm?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency_code?: string | null
          edition_number?: number | null
          format_extra_comments?: string | null
          format_extras?: Json | null
          format_id?: string | null
          height_measurement?: number | null
          id?: string
          internal_images?: string[] | null
          isbn10?: string | null
          isbn13?: string | null
          language_code?: string | null
          license?: string | null
          list_price?: number | null
          organization_id?: string
          page_count?: number | null
          product_availability_code?: string | null
          product_form?: string | null
          product_form_detail?: string | null
          publication_date?: string | null
          publisher_name?: string | null
          series_name?: string | null
          subject_code?: string | null
          subtitle?: string | null
          synopsis?: string | null
          thickness_measurement?: number | null
          title?: string
          updated_at?: string
          weight_measurement?: number | null
          width_measurement?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_audit: {
        Row: {
          action: string
          changed_by: string | null
          changes: Json | null
          created_at: string
          id: string
          quote_request_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          quote_request_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          quote_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_audit_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_extra_costs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quote_request_id: string
          unit_of_measure: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quote_request_id: string
          unit_of_measure?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quote_request_id?: string
          unit_of_measure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_extra_costs_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_format_price_breaks: {
        Row: {
          created_at: string
          id: string
          num_products: number
          quantity: number
          quote_request_format_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          num_products?: number
          quantity: number
          quote_request_format_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          num_products?: number
          quantity?: number
          quote_request_format_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_format_price_breaks_quote_request_format_id_fkey"
            columns: ["quote_request_format_id"]
            isOneToOne: false
            referencedRelation: "quote_request_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_format_products: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          quote_request_format_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number
          quote_request_format_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          quote_request_format_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_format_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_request_format_products_quote_request_format_id_fkey"
            columns: ["quote_request_format_id"]
            isOneToOne: false
            referencedRelation: "quote_request_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_formats: {
        Row: {
          created_at: string
          format_id: string
          id: string
          notes: string | null
          num_products: number
          quantity: number
          quote_request_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          format_id: string
          id?: string
          notes?: string | null
          num_products?: number
          quantity?: number
          quote_request_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          format_id?: string
          id?: string
          notes?: string | null
          num_products?: number
          quantity?: number
          quote_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_formats_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_request_formats_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          products: Json | null
          quantities: Json | null
          requested_at: string
          requested_by: string
          status: string
          supplier_id: string | null
          supplier_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          products?: Json | null
          quantities?: Json | null
          requested_at?: string
          requested_by: string
          status?: string
          supplier_id?: string | null
          supplier_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          products?: Json | null
          quantities?: Json | null
          requested_at?: string
          requested_by?: string
          status?: string
          supplier_id?: string | null
          supplier_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_on_hand: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          product_id: string
          quantity: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          product_id: string
          quantity?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_on_hand_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_on_hand_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_on_hand_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          status: string | null
          supplier_name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          status?: string | null
          supplier_name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          status?: string | null
          supplier_name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organizations: {
        Args: {
          user_id?: string
        }
        Returns: string[]
      }
      has_organization_role: {
        Args: {
          org_id: string
          required_role: string
          user_id?: string
        }
        Returns: boolean
      }
      insert_quote_request_format_products: {
        Args: {
          products_data: Json
        }
        Returns: undefined
      }
      is_organization_admin: {
        Args: {
          org_id: string
          user_id?: string
        }
        Returns: boolean
      }
      is_organization_member: {
        Args: {
          org_id: string
          user_id?: string
        }
        Returns: boolean
      }
      update_quote_request_format_products: {
        Args: {
          format_id: string
          products_data: Json
        }
        Returns: undefined
      }
      validate_api_key: {
        Args: {
          key: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

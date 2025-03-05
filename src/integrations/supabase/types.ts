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
      formats: {
        Row: {
          cover_stock_print: string | null
          created_at: string
          extent: string | null
          format_name: string
          id: string
          internal_stock_print: string | null
          organization_id: string
          tps: string | null
          updated_at: string
        }
        Insert: {
          cover_stock_print?: string | null
          created_at?: string
          extent?: string | null
          format_name: string
          id?: string
          internal_stock_print?: string | null
          organization_id: string
          tps?: string | null
          updated_at?: string
        }
        Update: {
          cover_stock_print?: string | null
          created_at?: string
          extent?: string | null
          format_name?: string
          id?: string
          internal_stock_print?: string | null
          organization_id?: string
          tps?: string | null
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
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
          format_id: string | null
          height_measurement: number | null
          id: string
          internal_images: string[] | null
          isbn10: string | null
          isbn13: string | null
          language_code: string | null
          license: string | null
          list_price: number | null
          long_description: string | null
          organization_id: string
          page_count: number | null
          product_availability_code: string | null
          product_form: string | null
          product_form_detail: string | null
          publication_date: string | null
          publisher_name: string | null
          series_name: string | null
          short_description: string | null
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
          format_id?: string | null
          height_measurement?: number | null
          id?: string
          internal_images?: string[] | null
          isbn10?: string | null
          isbn13?: string | null
          language_code?: string | null
          license?: string | null
          list_price?: number | null
          long_description?: string | null
          organization_id: string
          page_count?: number | null
          product_availability_code?: string | null
          product_form?: string | null
          product_form_detail?: string | null
          publication_date?: string | null
          publisher_name?: string | null
          series_name?: string | null
          short_description?: string | null
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
          format_id?: string | null
          height_measurement?: number | null
          id?: string
          internal_images?: string[] | null
          isbn10?: string | null
          isbn13?: string | null
          language_code?: string | null
          license?: string | null
          list_price?: number | null
          long_description?: string | null
          organization_id?: string
          page_count?: number | null
          product_availability_code?: string | null
          product_form?: string | null
          product_form_detail?: string | null
          publication_date?: string | null
          publisher_name?: string | null
          series_name?: string | null
          short_description?: string | null
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

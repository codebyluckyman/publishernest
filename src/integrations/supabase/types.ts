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
      communications: {
        Row: {
          attachment: string | null
          created_at: string
          id: string
          message: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          attachment?: string | null
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          attachment?: string | null
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_id: string | null
          last_message_read_id: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_id?: string | null
          last_message_read_id?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_id?: string | null
          last_message_read_id?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_delivery_locations: {
        Row: {
          address: string
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          location_name: string
          notes: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          location_name: string
          notes?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          location_name?: string
          notes?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_delivery_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_requirements: {
        Row: {
          created_at: string
          customer_id: string
          description: string
          id: string
          is_mandatory: boolean
          requirement_type: Database["public"]["Enums"]["requirement_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description: string
          id?: string
          is_mandatory?: boolean
          requirement_type: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          is_mandatory?: boolean
          requirement_type?: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_requirements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          advance_payment_required: boolean
          carton_marking_requirements: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          customer_name: string
          delivery_address: string | null
          document_notes: string | null
          file_approval_required: boolean
          freight_forwarder: string | null
          id: string
          notes: string | null
          organization_id: string
          packaging_requirements: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          advance_payment_required?: boolean
          carton_marking_requirements?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_name: string
          delivery_address?: string | null
          document_notes?: string | null
          file_approval_required?: boolean
          freight_forwarder?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          packaging_requirements?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          advance_payment_required?: boolean
          carton_marking_requirements?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_name?: string
          delivery_address?: string | null
          document_notes?: string | null
          file_approval_required?: boolean
          freight_forwarder?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          packaging_requirements?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_costs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_extra_costs_unit_of_measure"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
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
          end_papers_material: string | null
          end_papers_print: string | null
          extent: string | null
          format_name: string
          id: string
          internal_material: string | null
          internal_stock_print: string | null
          organization_id: string
          orientation: string | null
          spacers_material: string | null
          spacers_stock_print: string | null
          sticker_material: string | null
          sticker_stock_print: string | null
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
          end_papers_material?: string | null
          end_papers_print?: string | null
          extent?: string | null
          format_name: string
          id?: string
          internal_material?: string | null
          internal_stock_print?: string | null
          organization_id: string
          orientation?: string | null
          spacers_material?: string | null
          spacers_stock_print?: string | null
          sticker_material?: string | null
          sticker_stock_print?: string | null
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
          end_papers_material?: string | null
          end_papers_print?: string | null
          extent?: string | null
          format_name?: string
          id?: string
          internal_material?: string | null
          internal_stock_print?: string | null
          organization_id?: string
          orientation?: string | null
          spacers_material?: string | null
          spacers_stock_print?: string | null
          sticker_material?: string | null
          sticker_stock_print?: string | null
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
          member_type: string | null
          organization_id: string
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          id?: string
          member_type?: string | null
          organization_id: string
          role: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          id?: string
          member_type?: string | null
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
      organization_product_fields: {
        Row: {
          created_at: string
          display_order: number
          field_key: string
          field_name: string
          field_type: string
          id: string
          is_required: boolean
          options: Json | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_key: string
          field_name: string
          field_type: string
          id?: string
          is_required?: boolean
          options?: Json | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          field_key?: string
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_product_fields_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_production_steps: {
        Row: {
          created_at: string
          description: string | null
          estimated_days: number | null
          id: string
          is_active: boolean
          order_number: number
          organization_id: string
          step_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          is_active?: boolean
          order_number: number
          organization_id: string
          step_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          is_active?: boolean
          order_number?: number
          organization_id?: string
          step_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_production_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_purchase_order_counters: {
        Row: {
          next_po_number: number
          organization_id: string
        }
        Insert: {
          next_po_number?: number
          organization_id: string
        }
        Update: {
          next_po_number?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_purchase_order_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_quote_counters: {
        Row: {
          next_quote_number: number
          organization_id: string
        }
        Insert: {
          next_quote_number?: number
          organization_id: string
        }
        Update: {
          next_quote_number?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_quote_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_quote_request_counters: {
        Row: {
          next_quote_number: number
          organization_id: string
        }
        Insert: {
          next_quote_number?: number
          organization_id: string
        }
        Update: {
          next_quote_number?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_quote_request_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_sales_order_counters: {
        Row: {
          next_so_number: number
          organization_id: string
        }
        Insert: {
          next_so_number?: number
          organization_id: string
        }
        Update: {
          next_so_number?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_sales_order_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
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
          default_savings: Json | null
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
          default_savings?: Json | null
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
          default_savings?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          organization_type?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      presentation_analytics: {
        Row: {
          id: string
          items_viewed: Json | null
          last_activity: string
          presentation_id: string
          sections_viewed: Json | null
          view_date: string
          view_duration: number | null
          view_id: string
          viewer_device: string | null
          viewer_ip: string | null
          viewer_location: string | null
        }
        Insert: {
          id?: string
          items_viewed?: Json | null
          last_activity?: string
          presentation_id: string
          sections_viewed?: Json | null
          view_date?: string
          view_duration?: number | null
          view_id: string
          viewer_device?: string | null
          viewer_ip?: string | null
          viewer_location?: string | null
        }
        Update: {
          id?: string
          items_viewed?: Json | null
          last_activity?: string
          presentation_id?: string
          sections_viewed?: Json | null
          view_date?: string
          view_duration?: number | null
          view_id?: string
          viewer_device?: string | null
          viewer_ip?: string | null
          viewer_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_analytics_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "sales_presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_items: {
        Row: {
          created_at: string
          currency: string | null
          custom_content: Json | null
          custom_price: number | null
          description: string | null
          display_order: number
          id: string
          item_id: string | null
          item_type: string
          section_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          custom_content?: Json | null
          custom_price?: number | null
          description?: string | null
          display_order?: number
          id?: string
          item_id?: string | null
          item_type: string
          section_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          custom_content?: Json | null
          custom_price?: number | null
          description?: string | null
          display_order?: number
          id?: string
          item_id?: string | null
          item_type?: string
          section_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presentation_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "presentation_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_sections: {
        Row: {
          content: Json | null
          created_at: string
          description: string | null
          id: string
          presentation_id: string
          section_order: number
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          presentation_id: string
          section_order?: number
          section_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          presentation_id?: string
          section_order?: number
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presentation_sections_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "sales_presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_shares: {
        Row: {
          access_count: number | null
          expires_at: string | null
          id: string
          last_accessed: string | null
          presentation_id: string
          share_link: string
          share_token: string
          shared_at: string
          shared_by: string
          shared_with: string | null
        }
        Insert: {
          access_count?: number | null
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          presentation_id: string
          share_link: string
          share_token: string
          shared_at?: string
          shared_by: string
          shared_with?: string | null
        }
        Update: {
          access_count?: number | null
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          presentation_id?: string
          share_link?: string
          share_token?: string
          shared_at?: string
          shared_by?: string
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_shares_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "sales_presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      print_runs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          organization_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          organization_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_custom_field_values: {
        Row: {
          created_at: string
          field_id: string
          field_value: Json | null
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_id: string
          field_value?: Json | null
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_id?: string
          field_value?: Json | null
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "organization_product_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_custom_field_values_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      product_saved_views: {
        Row: {
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          search_query: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filters: Json
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          search_query?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          search_query?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_saved_views_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          selling_points: string | null
          series_name: string | null
          status: string
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
          selling_points?: string | null
          series_name?: string | null
          status?: string
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
          selling_points?: string | null
          series_name?: string | null
          status?: string
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
          job_title: string | null
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
          job_title?: string | null
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
          job_title?: string | null
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
      purchase_order_audit: {
        Row: {
          action: string
          changed_by: string | null
          changes: Json | null
          created_at: string
          id: string
          purchase_order_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          purchase_order_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          purchase_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_audit_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_line_items: {
        Row: {
          created_at: string
          format_id: string | null
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          format_id?: string | null
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          format_id?: string | null
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_line_items_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_line_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          awaiting_shipment_at: string | null
          awaiting_shipment_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          currency: string
          delivery_date: string | null
          goods_checked_at: string | null
          goods_checked_by: string | null
          id: string
          issue_date: string | null
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          organization_id: string
          payment_terms: string | null
          po_number: string
          print_run_id: string
          production_completed_at: string | null
          production_completed_by: string | null
          production_started_at: string | null
          production_started_by: string | null
          received_at: string | null
          received_by: string | null
          scheduled_at: string | null
          scheduled_by: string | null
          shipped_at: string | null
          shipped_by: string | null
          shipping_address: string | null
          shipping_method: string | null
          status: string
          status_code: string
          supplier_id: string
          supplier_quote_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          awaiting_shipment_at?: string | null
          awaiting_shipment_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          currency?: string
          delivery_date?: string | null
          goods_checked_at?: string | null
          goods_checked_by?: string | null
          id?: string
          issue_date?: string | null
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id: string
          payment_terms?: string | null
          po_number: string
          print_run_id: string
          production_completed_at?: string | null
          production_completed_by?: string | null
          production_started_at?: string | null
          production_started_by?: string | null
          received_at?: string | null
          received_by?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          status_code?: string
          supplier_id: string
          supplier_quote_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          awaiting_shipment_at?: string | null
          awaiting_shipment_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          delivery_date?: string | null
          goods_checked_at?: string | null
          goods_checked_by?: string | null
          id?: string
          issue_date?: string | null
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          po_number?: string
          print_run_id?: string
          production_completed_at?: string | null
          production_completed_by?: string | null
          production_started_at?: string | null
          production_started_by?: string | null
          received_at?: string | null
          received_by?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          status_code?: string
          supplier_id?: string
          supplier_quote_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_print_run_id_fkey"
            columns: ["print_run_id"]
            isOneToOne: false
            referencedRelation: "print_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_attachments: {
        Row: {
          created_at: string
          file_key: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          quote_request_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_key: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          quote_request_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_key?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          quote_request_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_attachments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
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
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quote_request_id: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quote_request_id?: string
          unit_of_measure_id?: string | null
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
          {
            foreignKeyName: "quote_request_extra_costs_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
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
      quote_request_savings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quote_request_id: string
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quote_request_id: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quote_request_id?: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_savings_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_request_savings_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          currency: string
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          production_schedule_requested: boolean
          products: Json | null
          quantities: Json | null
          reference_id: string | null
          requested_at: string
          requested_by: string
          required_step_date: string | null
          required_step_id: string | null
          status: string
          supplier_id: string | null
          supplier_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          production_schedule_requested?: boolean
          products?: Json | null
          quantities?: Json | null
          reference_id?: string | null
          requested_at?: string
          requested_by: string
          required_step_date?: string | null
          required_step_id?: string | null
          status?: string
          supplier_id?: string | null
          supplier_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          production_schedule_requested?: boolean
          products?: Json | null
          quantities?: Json | null
          reference_id?: string | null
          requested_at?: string
          requested_by?: string
          required_step_date?: string | null
          required_step_id?: string | null
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
            foreignKeyName: "quote_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_required_step_id_fkey"
            columns: ["required_step_id"]
            isOneToOne: false
            referencedRelation: "organization_production_steps"
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
      sales_order_audit: {
        Row: {
          action: string
          changed_by: string | null
          changes: Json | null
          created_at: string
          id: string
          sales_order_id: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          sales_order_id: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          sales_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_audit_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_charges: {
        Row: {
          amount: number
          charge_type: string
          created_at: string
          description: string
          id: string
          sales_order_id: string
          taxable: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          charge_type: string
          created_at?: string
          description: string
          id?: string
          sales_order_id: string
          taxable?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          charge_type?: string
          created_at?: string
          description?: string
          id?: string
          sales_order_id?: string
          taxable?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_charges_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_line_items: {
        Row: {
          created_at: string
          format_id: string | null
          id: string
          product_id: string
          purchase_order_line_item_id: string | null
          quantity: number
          sales_order_id: string
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          format_id?: string | null
          id?: string
          product_id: string
          purchase_order_line_item_id?: string | null
          quantity: number
          sales_order_id: string
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          format_id?: string | null
          id?: string
          product_id?: string
          purchase_order_line_item_id?: string | null
          quantity?: number
          sales_order_id?: string
          total_cost?: number
          total_price?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_line_items_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_line_items_purchase_order_line_item_id_fkey"
            columns: ["purchase_order_line_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_line_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_requirements: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          requirement_id: string
          sales_order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          requirement_id: string
          sales_order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          requirement_id?: string
          sales_order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_requirements_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "customer_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_requirements_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          advance_payment_status: string | null
          approved_at: string | null
          approved_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string
          currency: string
          customer_id: string
          delivery_date: string | null
          delivery_location_id: string | null
          file_approval_status: string | null
          grand_total: number | null
          id: string
          issue_date: string | null
          notes: string | null
          organization_id: string
          payment_terms: string | null
          print_run_id: string | null
          so_number: string
          status: string
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          advance_payment_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by: string
          currency?: string
          customer_id: string
          delivery_date?: string | null
          delivery_location_id?: string | null
          file_approval_status?: string | null
          grand_total?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          organization_id: string
          payment_terms?: string | null
          print_run_id?: string | null
          so_number: string
          status?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          advance_payment_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          customer_id?: string
          delivery_date?: string | null
          delivery_location_id?: string | null
          file_approval_status?: string | null
          grand_total?: number | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          print_run_id?: string | null
          so_number?: string
          status?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "customer_delivery_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_print_run_id_fkey"
            columns: ["print_run_id"]
            isOneToOne: false
            referencedRelation: "print_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_presentations: {
        Row: {
          access_code: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          display_settings: Json | null
          expires_at: string | null
          id: string
          organization_id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          display_settings?: Json | null
          expires_at?: string | null
          id?: string
          organization_id: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          display_settings?: Json | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_presentations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      savings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
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
      supplier_communications: {
        Row: {
          communication_date: string
          communication_type: string
          created_at: string
          created_by: string
          id: string
          message: string
          purchase_order_id: string
          receiver_id: string | null
        }
        Insert: {
          communication_date?: string
          communication_type: string
          created_at?: string
          created_by: string
          id?: string
          message: string
          purchase_order_id: string
          receiver_id?: string | null
        }
        Update: {
          communication_date?: string
          communication_type?: string
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          purchase_order_id?: string
          receiver_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_communications_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_attachments: {
        Row: {
          created_at: string
          file_key: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          supplier_quote_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_key: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          supplier_quote_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_key?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          supplier_quote_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_attachments_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_attachments_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_attachments_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_audit: {
        Row: {
          action: string
          changed_by: string | null
          changes: Json | null
          created_at: string
          id: string
          supplier_quote_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          supplier_quote_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          changes?: Json | null
          created_at?: string
          id?: string
          supplier_quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_audit_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_audit_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_audit_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_extra_cost_price_breaks: {
        Row: {
          created_at: string
          extra_cost_id: string | null
          id: string
          quantity: number | null
          supplier_quote_id: string | null
          unit_cost: number | null
          unit_cost_1: number | null
          unit_cost_10: number | null
          unit_cost_2: number | null
          unit_cost_3: number | null
          unit_cost_4: number | null
          unit_cost_5: number | null
          unit_cost_6: number | null
          unit_cost_7: number | null
          unit_cost_8: number | null
          unit_cost_9: number | null
          unit_of_measure_id: string | null
        }
        Insert: {
          created_at?: string
          extra_cost_id?: string | null
          id?: string
          quantity?: number | null
          supplier_quote_id?: string | null
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
        }
        Update: {
          created_at?: string
          extra_cost_id?: string | null
          id?: string
          quantity?: number | null
          supplier_quote_id?: string | null
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_extra_cost_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_cost_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_cost_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_extra_costs: {
        Row: {
          created_at: string
          extra_cost_id: string
          id: string
          price_break_id: string | null
          quote_price_break_each_id: string | null
          supplier_quote_id: string
          unit_cost: number | null
          unit_cost_1: number | null
          unit_cost_10: number | null
          unit_cost_2: number | null
          unit_cost_3: number | null
          unit_cost_4: number | null
          unit_cost_5: number | null
          unit_cost_6: number | null
          unit_cost_7: number | null
          unit_cost_8: number | null
          unit_cost_9: number | null
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          extra_cost_id: string
          id?: string
          price_break_id?: string | null
          quote_price_break_each_id?: string | null
          supplier_quote_id: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          extra_cost_id?: string
          id?: string
          price_break_id?: string | null
          quote_price_break_each_id?: string | null
          supplier_quote_id?: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_extra_costs_extra_cost_id_fkey"
            columns: ["extra_cost_id"]
            isOneToOne: false
            referencedRelation: "quote_request_extra_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_price_break_id_fkey"
            columns: ["price_break_id"]
            isOneToOne: false
            referencedRelation: "quote_request_format_price_breaks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_extra_costs_price_breaks: {
        Row: {
          created_at: string
          extra_cost_id: string
          id: string
          price_break_id: string
          supplier_quote_id: string
          unit_cost: number | null
          unit_cost_1: number | null
          unit_cost_10: number | null
          unit_cost_2: number | null
          unit_cost_3: number | null
          unit_cost_4: number | null
          unit_cost_5: number | null
          unit_cost_6: number | null
          unit_cost_7: number | null
          unit_cost_8: number | null
          unit_cost_9: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          extra_cost_id: string
          id?: string
          price_break_id: string
          supplier_quote_id: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          extra_cost_id?: string
          id?: string
          price_break_id?: string
          supplier_quote_id?: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_extra_costs_price_breaks_extra_cost_id_fkey"
            columns: ["extra_cost_id"]
            isOneToOne: false
            referencedRelation: "extra_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_price_breaks_price_break_id_fkey"
            columns: ["price_break_id"]
            isOneToOne: false
            referencedRelation: "quote_request_format_price_breaks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_extra_costs_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_formats: {
        Row: {
          created_at: string
          format_id: string
          id: string
          quote_request_format_id: string | null
          supplier_quote_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          format_id: string
          id?: string
          quote_request_format_id?: string | null
          supplier_quote_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          format_id?: string
          id?: string
          quote_request_format_id?: string | null
          supplier_quote_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_formats_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_formats_quote_request_format_id_fkey"
            columns: ["quote_request_format_id"]
            isOneToOne: false
            referencedRelation: "quote_request_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_formats_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_formats_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_formats_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_price_breaks: {
        Row: {
          created_at: string
          format_id: string | null
          id: string
          price_break_id: string
          product_id: string | null
          quantity: number
          quote_request_format_id: string
          supplier_quote_id: string
          unit_cost: number | null
          unit_cost_1: number | null
          unit_cost_10: number | null
          unit_cost_2: number | null
          unit_cost_3: number | null
          unit_cost_4: number | null
          unit_cost_5: number | null
          unit_cost_6: number | null
          unit_cost_7: number | null
          unit_cost_8: number | null
          unit_cost_9: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          format_id?: string | null
          id?: string
          price_break_id: string
          product_id?: string | null
          quantity: number
          quote_request_format_id: string
          supplier_quote_id: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          format_id?: string | null
          id?: string
          price_break_id?: string
          product_id?: string | null
          quantity?: number
          quote_request_format_id?: string
          supplier_quote_id?: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_price_breaks_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_price_break_id_fkey"
            columns: ["price_break_id"]
            isOneToOne: false
            referencedRelation: "quote_request_format_price_breaks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_quote_request_format_id_fkey"
            columns: ["quote_request_format_id"]
            isOneToOne: false
            referencedRelation: "quote_request_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_price_breaks_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_savings: {
        Row: {
          created_at: string
          id: string
          price_break_id: string | null
          saving_id: string
          supplier_quote_id: string
          unit_cost: number | null
          unit_cost_1: number | null
          unit_cost_10: number | null
          unit_cost_2: number | null
          unit_cost_3: number | null
          unit_cost_4: number | null
          unit_cost_5: number | null
          unit_cost_6: number | null
          unit_cost_7: number | null
          unit_cost_8: number | null
          unit_cost_9: number | null
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_break_id?: string | null
          saving_id: string
          supplier_quote_id: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price_break_id?: string | null
          saving_id?: string
          supplier_quote_id?: string
          unit_cost?: number | null
          unit_cost_1?: number | null
          unit_cost_10?: number | null
          unit_cost_2?: number | null
          unit_cost_3?: number | null
          unit_cost_4?: number | null
          unit_cost_5?: number | null
          unit_cost_6?: number | null
          unit_cost_7?: number | null
          unit_cost_8?: number | null
          unit_cost_9?: number | null
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_savings_price_break_id_fkey"
            columns: ["price_break_id"]
            isOneToOne: false
            referencedRelation: "quote_request_format_price_breaks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_savings_saving_id_fkey"
            columns: ["saving_id"]
            isOneToOne: false
            referencedRelation: "quote_request_savings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_savings_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_savings_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "supplier_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_savings_supplier_quote_id_fkey"
            columns: ["supplier_quote_id"]
            isOneToOne: false
            referencedRelation: "test_quote_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quote_savings_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "unit_of_measures"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          organization_id: string
          packaging_carton_height: number | null
          packaging_carton_length: number | null
          packaging_carton_quantity: number | null
          packaging_carton_volume: number | null
          packaging_carton_weight: number | null
          packaging_carton_width: number | null
          packaging_cartons_per_pallet: number | null
          packaging_copies_per_20ft_palletized: number | null
          packaging_copies_per_20ft_unpalletized: number | null
          packaging_copies_per_40ft_palletized: number | null
          packaging_copies_per_40ft_unpalletized: number | null
          production_schedule: Json | null
          quote_request_id: string
          reference: string | null
          reference_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          remarks: string | null
          status: string
          submitted_at: string | null
          supplier_id: string
          terms: string | null
          total_cost: number | null
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          organization_id: string
          packaging_carton_height?: number | null
          packaging_carton_length?: number | null
          packaging_carton_quantity?: number | null
          packaging_carton_volume?: number | null
          packaging_carton_weight?: number | null
          packaging_carton_width?: number | null
          packaging_cartons_per_pallet?: number | null
          packaging_copies_per_20ft_palletized?: number | null
          packaging_copies_per_20ft_unpalletized?: number | null
          packaging_copies_per_40ft_palletized?: number | null
          packaging_copies_per_40ft_unpalletized?: number | null
          production_schedule?: Json | null
          quote_request_id: string
          reference?: string | null
          reference_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          status?: string
          submitted_at?: string | null
          supplier_id: string
          terms?: string | null
          total_cost?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          organization_id?: string
          packaging_carton_height?: number | null
          packaging_carton_length?: number | null
          packaging_carton_quantity?: number | null
          packaging_carton_volume?: number | null
          packaging_carton_weight?: number | null
          packaging_carton_width?: number | null
          packaging_cartons_per_pallet?: number | null
          packaging_copies_per_20ft_palletized?: number | null
          packaging_copies_per_20ft_unpalletized?: number | null
          packaging_copies_per_40ft_palletized?: number | null
          packaging_copies_per_40ft_unpalletized?: number | null
          production_schedule?: Json | null
          quote_request_id?: string
          reference?: string | null
          reference_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          status?: string
          submitted_at?: string | null
          supplier_id?: string
          terms?: string | null
          total_cost?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
          profile_id: string | null
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
          profile_id?: string | null
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
          profile_id?: string | null
          status?: string | null
          supplier_name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_of_measures: {
        Row: {
          abbreviation: string | null
          created_at: string
          id: string
          is_inventory_unit: boolean
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          is_inventory_unit?: boolean
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          is_inventory_unit?: boolean
          name?: string
          organization_id?: string
          updated_at?: string
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
      quote_management_view: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          formats: Json | null
          id: string | null
          notes: string | null
          organization_id: string | null
          packaging_carton_height: number | null
          packaging_carton_length: number | null
          packaging_carton_quantity: number | null
          packaging_carton_volume: number | null
          packaging_carton_weight: number | null
          packaging_carton_width: number | null
          packaging_cartons_per_pallet: number | null
          packaging_copies_per_20ft_palletized: number | null
          packaging_copies_per_20ft_unpalletized: number | null
          packaging_copies_per_40ft_palletized: number | null
          packaging_copies_per_40ft_unpalletized: number | null
          production_schedule: Json | null
          quote_request: Json | null
          quote_request_id: string | null
          reference: string | null
          reference_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          remarks: string | null
          status: string | null
          submitted_at: string | null
          supplier: Json | null
          supplier_id: string | null
          supplier_name: string | null
          terms: string | null
          title: string | null
          total_cost: number | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      test_quote_management_view: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          extra_costs: Json | null
          formats: Json | null
          id: string | null
          notes: string | null
          organization_id: string | null
          packaging_carton_height: number | null
          packaging_carton_length: number | null
          packaging_carton_quantity: number | null
          packaging_carton_volume: number | null
          packaging_carton_weight: number | null
          packaging_carton_width: number | null
          packaging_cartons_per_pallet: number | null
          packaging_copies_per_20ft_palletized: number | null
          packaging_copies_per_20ft_unpalletized: number | null
          packaging_copies_per_40ft_palletized: number | null
          packaging_copies_per_40ft_unpalletized: number | null
          production_schedule: Json | null
          production_schedule_requested: boolean | null
          products: Json | null
          quantities: Json | null
          quote_request: Json | null
          reference: string | null
          reference_id: string | null
          remarks: string | null
          requested_at: string | null
          requested_by: string | null
          required_step: Json | null
          required_step_date: string | null
          required_step_id: string | null
          savings: Json | null
          status: string | null
          supplier_id: string | null
          supplier_ids: string[] | null
          supplier_name: string | null
          supplier_names: Json | null
          terms: string | null
          title: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_required_step_id_fkey"
            columns: ["required_step_id"]
            isOneToOne: false
            referencedRelation: "organization_production_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_quote_attachment: {
        Args: {
          p_supplier_quote_id: string
          p_file_name: string
          p_file_key: string
          p_file_size: number
          p_file_type: string
          p_uploaded_by: string
        }
        Returns: string
      }
      delete_quote_attachment: {
        Args: { attachment_id: string }
        Returns: undefined
      }
      delete_unused_price_breaks: {
        Args: { format_id: string; preserved_ids: string[] }
        Returns: undefined
      }
      fetch_shared_presentation: {
        Args: { access_code: string }
        Returns: {
          id: string
          title: string
          description: string
          cover_image_url: string
          display_settings: Json
          created_at: string
          published_at: string
          expires_at: string
        }[]
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_presentation_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_price_break_for_quantity: {
        Args: {
          p_supplier_quote_id: string
          p_format_id: string
          p_quantity: number
        }
        Returns: number
      }
      get_public_presentation: {
        Args: { access_code: string }
        Returns: {
          id: string
          title: string
          description: string
          cover_image_url: string
          display_settings: Json
          created_at: string
          published_at: string
          expires_at: string
          organization_id: string
          allow_downloads: boolean
        }[]
      }
      get_purchase_order_status_name: {
        Args: { status_code: string }
        Returns: string
      }
      get_quote_attachments: {
        Args: { quote_id: string }
        Returns: {
          created_at: string
          file_key: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          supplier_quote_id: string
          updated_at: string
          uploaded_by: string | null
        }[]
      }
      get_user_organizations: {
        Args: { user_id?: string }
        Returns: string[]
      }
      has_organization_role: {
        Args: { org_id: string; required_role: string; user_id?: string }
        Returns: boolean
      }
      increment_presentation_share_access: {
        Args: { code: string }
        Returns: undefined
      }
      insert_quote_request_format_products: {
        Args: { products_data: Json }
        Returns: undefined
      }
      is_organization_admin: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      record_purchase_order_audit: {
        Args: {
          p_purchase_order_id: string
          p_changed_by: string
          p_action: string
          p_changes: Json
        }
        Returns: string
      }
      record_sales_order_audit: {
        Args: {
          p_sales_order_id: string
          p_changed_by: string
          p_action: string
          p_changes: Json
        }
        Returns: string
      }
      record_supplier_communication: {
        Args: {
          p_purchase_order_id: string
          p_created_by: string
          p_message: string
          p_communication_type: string
        }
        Returns: string
      }
      search_quotes: {
        Args: {
          search_title?: string
          filter_supplier_name?: string
          filter_format_id?: string
        }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          formats: Json | null
          id: string | null
          notes: string | null
          organization_id: string | null
          packaging_carton_height: number | null
          packaging_carton_length: number | null
          packaging_carton_quantity: number | null
          packaging_carton_volume: number | null
          packaging_carton_weight: number | null
          packaging_carton_width: number | null
          packaging_cartons_per_pallet: number | null
          packaging_copies_per_20ft_palletized: number | null
          packaging_copies_per_20ft_unpalletized: number | null
          packaging_copies_per_40ft_palletized: number | null
          packaging_copies_per_40ft_unpalletized: number | null
          production_schedule: Json | null
          quote_request: Json | null
          quote_request_id: string | null
          reference: string | null
          reference_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          remarks: string | null
          status: string | null
          submitted_at: string | null
          supplier: Json | null
          supplier_id: string | null
          supplier_name: string | null
          terms: string | null
          title: string | null
          total_cost: number | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }[]
      }
      test_search_quotes: {
        Args: {
          search_title?: string
          filter_supplier_name?: string
          filter_format_id?: string
        }
        Returns: {
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          extra_costs: Json | null
          formats: Json | null
          id: string | null
          notes: string | null
          organization_id: string | null
          packaging_carton_height: number | null
          packaging_carton_length: number | null
          packaging_carton_quantity: number | null
          packaging_carton_volume: number | null
          packaging_carton_weight: number | null
          packaging_carton_width: number | null
          packaging_cartons_per_pallet: number | null
          packaging_copies_per_20ft_palletized: number | null
          packaging_copies_per_20ft_unpalletized: number | null
          packaging_copies_per_40ft_palletized: number | null
          packaging_copies_per_40ft_unpalletized: number | null
          production_schedule: Json | null
          production_schedule_requested: boolean | null
          products: Json | null
          quantities: Json | null
          quote_request: Json | null
          reference: string | null
          reference_id: string | null
          remarks: string | null
          requested_at: string | null
          requested_by: string | null
          required_step: Json | null
          required_step_date: string | null
          required_step_id: string | null
          savings: Json | null
          status: string | null
          supplier_id: string | null
          supplier_ids: string[] | null
          supplier_name: string | null
          supplier_names: Json | null
          terms: string | null
          title: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }[]
      }
      track_presentation_public_access: {
        Args: { p_presentation_id: string; p_view_id: string }
        Returns: undefined
      }
      update_format_price_breaks: {
        Args: { formatid: string; pricebreaks: Json; numproducts?: number }
        Returns: undefined
      }
      update_quote_request_format_products: {
        Args: { format_id: string; products_data: Json }
        Returns: undefined
      }
      validate_api_key: {
        Args: { key: string }
        Returns: string
      }
    }
    Enums: {
      requirement_type:
        | "packaging"
        | "shipping"
        | "quality"
        | "documentation"
        | "approval"
        | "payment"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      requirement_type: [
        "packaging",
        "shipping",
        "quality",
        "documentation",
        "approval",
        "payment",
        "other",
      ],
    },
  },
} as const

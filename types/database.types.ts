export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          id: string
          pharmacy_id: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          id?: string
          pharmacy_id: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          id?: string
          pharmacy_id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          pharmacy_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pharmacy_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pharmacy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          pharmacy_id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          pharmacy_id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          pharmacy_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          pharmacy_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          pharmacy_id: string
          role: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          pharmacy_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          barcode: string | null
          batch_number: string | null
          category_id: string | null
          created_at: string
          deleted_at: string | null
          expiry_date: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          name: string
          pharmacy_id: string
          prescription_required: boolean
          purchase_price: number | null
          reorder_level: number
          sale_price: number
          stock_quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          batch_number?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          pharmacy_id: string
          prescription_required?: boolean
          purchase_price?: number | null
          reorder_level?: number
          sale_price: number
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          batch_number?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          pharmacy_id?: string
          prescription_required?: boolean
          purchase_price?: number | null
          reorder_level?: number
          sale_price?: number
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicines_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          gst_number: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          receipt_footer: string | null
          tax_rate: number
          timezone: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          receipt_footer?: string | null
          tax_rate?: number
          timezone?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          receipt_footer?: string | null
          tax_rate?: number
          timezone?: string
        }
        Relationships: []
      }
      pharmacy_invites: {
        Row: {
          accepted: boolean
          created_at: string | null
          id: string
          invited_by: string | null
          invited_email: string
          pharmacy_id: string
          role: string
        }
        Insert: {
          accepted?: boolean
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email: string
          pharmacy_id: string
          role: string
        }
        Update: {
          accepted?: boolean
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string
          pharmacy_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_invites_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          customer_id: string | null
          doctor_name: string | null
          id: string
          image_url: string | null
          notes: string | null
          pharmacy_id: string
          prescription_date: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          doctor_name?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          pharmacy_id: string
          prescription_date?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          doctor_name?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          pharmacy_id?: string
          prescription_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          pharmacy_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          pharmacy_id?: string | null
          role: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          pharmacy_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          id: string
          medicine_id: string
          pharmacy_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          id?: string
          medicine_id: string
          pharmacy_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          id?: string
          medicine_id?: string
          pharmacy_id?: string
          purchase_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          paid_amount: number
          payment_status: string
          pharmacy_id: string
          supplier_id: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          paid_amount?: number
          payment_status?: string
          pharmacy_id: string
          supplier_id?: string | null
          total_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          paid_amount?: number
          payment_status?: string
          pharmacy_id?: string
          supplier_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          discount: number
          id: string
          medicine_id: string
          pharmacy_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Insert: {
          discount?: number
          id?: string
          medicine_id: string
          pharmacy_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Update: {
          discount?: number
          id?: string
          medicine_id?: string
          pharmacy_id?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cashier_id: string | null
          created_at: string
          customer_id: string | null
          discount: number
          id: string
          invoice_number: string | null
          payment_method: string
          pharmacy_id: string
          prescription_id: string | null
          sale_date: string
          subtotal: number
          tax: number
          total: number
        }
        Insert: {
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          invoice_number?: string | null
          payment_method?: string
          pharmacy_id: string
          prescription_id?: string | null
          sale_date?: string
          subtotal?: number
          tax?: number
          total?: number
        }
        Update: {
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          invoice_number?: string | null
          payment_method?: string
          pharmacy_id?: string
          prescription_id?: string | null
          sale_date?: string
          subtotal?: number
          tax?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          name: string
          pharmacy_id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          pharmacy_id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          pharmacy_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invite: { Args: { p_full_name?: string }; Returns: string }
      checkout_sale: {
        Args: {
          p_customer_id: string
          p_discount: number
          p_items: Json
          p_payment_method: string
          p_tax: number
        }
        Returns: string
      }
      create_purchase: {
        Args: {
          p_invoice_date: string
          p_invoice_number: string
          p_items: Json
          p_paid_amount: number
          p_pharmacy_id: string
          p_supplier_id: string
        }
        Returns: string
      }
      create_purchase_with_items: {
        Args: {
          p_invoice_date: string
          p_invoice_number: string
          p_items: Json
          p_paid_amount: number
          p_payment_status: string
          p_supplier_id: string
        }
        Returns: string
      }
      create_sale: {
        Args: {
          p_cashier_id: string
          p_customer_id: string
          p_discount: number
          p_invoice_number: string
          p_items: Json
          p_payment_method: string
          p_pharmacy_id: string
          p_tax: number
        }
        Returns: string
      }
      get_user_pharmacy_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      list_team_members: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          role: string
        }[]
      }
      remove_team_member: { Args: { p_profile_id: string }; Returns: undefined }
      report_expiring: {
        Args: { p_days?: number }
        Returns: {
          batch_number: string
          days_left: number
          expiry_date: string
          medicine_id: string
          medicine_name: string
          sale_price: number
          stock_quantity: number
        }[]
      }
      report_low_stock: {
        Args: never
        Returns: {
          medicine_id: string
          medicine_name: string
          reorder_level: number
          sale_price: number
          stock_quantity: number
          units_short: number
        }[]
      }
      report_profit_margin: {
        Args: { p_from: string; p_to: string }
        Returns: {
          cost: number
          gross_profit: number
          margin_pct: number
          medicine_id: string
          medicine_name: string
          revenue: number
          units_sold: number
        }[]
      }
      report_sales_daily: {
        Args: { p_from: string; p_to: string }
        Returns: {
          discount: number
          num_sales: number
          profit: number
          revenue: number
          sale_day: string
          tax: number
        }[]
      }
      report_supplier_purchases: {
        Args: { p_from: string; p_to: string }
        Returns: {
          num_invoices: number
          outstanding: number
          paid_amount: number
          supplier_id: string
          supplier_name: string
          total_amount: number
        }[]
      }
      report_top_medicines: {
        Args: { p_from: string; p_limit?: number; p_to: string }
        Returns: {
          avg_margin: number
          medicine_id: string
          medicine_name: string
          revenue: number
          units_sold: number
        }[]
      }
      update_team_member_role: {
        Args: { p_new_role: string; p_profile_id: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attendance_records: {
        Row: {
          clock_in: string;
          clock_out: string | null;
          created_at: string;
          employee_id: string;
          id: number;
          is_on_leave: boolean;
          lunch_in: string | null;
          lunch_out: string | null;
          remarks: string | null;
          updated_at: string;
          work_date: string;
          work_mode: Database['public']['Enums']['work_mode'];
        };
        Insert: {
          clock_in: string;
          clock_out?: string | null;
          created_at?: string;
          employee_id: string;
          id?: number;
          is_on_leave?: boolean;
          lunch_in?: string | null;
          lunch_out?: string | null;
          remarks?: string | null;
          updated_at?: string;
          work_date: string;
          work_mode: Database['public']['Enums']['work_mode'];
        };
        Update: {
          clock_in?: string;
          clock_out?: string | null;
          created_at?: string;
          employee_id?: string;
          id?: number;
          is_on_leave?: boolean;
          lunch_in?: string | null;
          lunch_out?: string | null;
          remarks?: string | null;
          updated_at?: string;
          work_date?: string;
          work_mode?: Database['public']['Enums']['work_mode'];
        };
        Relationships: [
          {
            foreignKeyName: 'attendance_records_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['employee_id'];
          },
        ];
      };
      attendance_summaries: {
        Row: {
          avg_daily_hours: number;
          employee_id: string | null;
          generated_at: string;
          id: number;
          month: number;
          total_days: number;
          total_hours: number;
          year: number;
        };
        Insert: {
          avg_daily_hours: number;
          employee_id?: string | null;
          generated_at?: string;
          id?: number;
          month: number;
          total_days: number;
          total_hours: number;
          year: number;
        };
        Update: {
          avg_daily_hours?: number;
          employee_id?: string | null;
          generated_at?: string;
          id?: number;
          month?: number;
          total_days?: number;
          total_hours?: number;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'attendance_summaries_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['employee_id'];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database['public']['Enums']['app_permission'];
          role: Database['public']['Enums']['app_roles'];
        };
        Insert: {
          id?: number;
          permission: Database['public']['Enums']['app_permission'];
          role: Database['public']['Enums']['app_roles'];
        };
        Update: {
          id?: number;
          permission?: Database['public']['Enums']['app_permission'];
          role?: Database['public']['Enums']['app_roles'];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: number;
          role: Database['public']['Enums']['app_roles'];
          user_id: string;
        };
        Insert: {
          id?: number;
          role: Database['public']['Enums']['app_roles'];
          user_id: string;
        };
        Update: {
          id?: number;
          role?: Database['public']['Enums']['app_roles'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          department: string;
          email: string;
          employee_id: string;
          full_name: string;
          id: string;
          update_at: string | null;
        };
        Insert: {
          created_at?: string;
          department: string;
          email: string;
          employee_id: string;
          full_name: string;
          id: string;
          update_at?: string | null;
        };
        Update: {
          created_at?: string;
          department?: string;
          email?: string;
          employee_id?: string;
          full_name?: string;
          id?: string;
          update_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      attendance_with_user: {
        Row: {
          clock_in: string | null;
          clock_out: string | null;
          department: string | null;
          employee_id: string | null;
          full_name: string | null;
          id: number | null;
          is_on_leave: boolean | null;
          lunch_in: string | null;
          lunch_out: string | null;
          remarks: string | null;
          work_date: string | null;
          work_mode: Database['public']['Enums']['work_mode'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'attendance_records_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['employee_id'];
          },
        ];
      };
    };
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database['public']['Enums']['app_permission'];
        };
        Returns: boolean;
      };
      create_user: {
        Args: { email: string };
        Returns: string;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
      delete_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      app_permission:
        | 'users.select'
        | 'users.delete'
        | 'attendance_records.select'
        | 'attendance_records.delete'
        | 'attendance_summaries.select'
        | 'attendance_summaries.delete'
        | 'attendance_records.update';
      app_roles: 'admin';
      work_mode: 'office' | 'home';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes'] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permission: [
        'users.select',
        'users.delete',
        'attendance_records.select',
        'attendance_records.delete',
        'attendance_summaries.select',
        'attendance_summaries.delete',
        'attendance_records.update',
      ],
      app_roles: ['admin'],
      work_mode: ['office', 'home'],
    },
  },
} as const;

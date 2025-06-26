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
          avg_lunch_minutes: number | null;
          created_at: string;
          employee_id: string | null;
          home_days: number;
          id: number;
          leave_dates: Json | null;
          leave_days: number | null;
          leave_rate: number | null;
          month: number;
          office_days: number;
          total_days: number;
          total_hours: number;
          updated_at: string | null;
          year: number;
        };
        Insert: {
          avg_daily_hours: number;
          avg_lunch_minutes?: number | null;
          created_at?: string;
          employee_id?: string | null;
          home_days?: number;
          id?: number;
          leave_dates?: Json | null;
          leave_days?: number | null;
          leave_rate?: number | null;
          month: number;
          office_days?: number;
          total_days: number;
          total_hours: number;
          updated_at?: string | null;
          year: number;
        };
        Update: {
          avg_daily_hours?: number;
          avg_lunch_minutes?: number | null;
          created_at?: string;
          employee_id?: string | null;
          home_days?: number;
          id?: number;
          leave_dates?: Json | null;
          leave_days?: number | null;
          leave_rate?: number | null;
          month?: number;
          office_days?: number;
          total_days?: number;
          total_hours?: number;
          updated_at?: string | null;
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
      cron_job_logs: {
        Row: {
          created_at: string;
          details: Json | null;
          duration_seconds: number | null;
          employees_processed: number | null;
          end_time: string | null;
          error_message: string | null;
          id: number;
          job_name: string;
          records_processed: number | null;
          start_time: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          details?: Json | null;
          duration_seconds?: number | null;
          employees_processed?: number | null;
          end_time?: string | null;
          error_message?: string | null;
          id?: number;
          job_name: string;
          records_processed?: number | null;
          start_time?: string;
          status: string;
        };
        Update: {
          created_at?: string;
          details?: Json | null;
          duration_seconds?: number | null;
          employees_processed?: number | null;
          end_time?: string | null;
          error_message?: string | null;
          id?: number;
          job_name?: string;
          records_processed?: number | null;
          start_time?: string;
          status?: string;
        };
        Relationships: [];
      };
      public_holidays: {
        Row: {
          created_at: string | null;
          date: string;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
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
      cron_job_logs_summary: {
        Row: {
          avg_duration_seconds: number | null;
          failed_runs: number | null;
          job_name: string | null;
          last_failed_run: string | null;
          last_run: string | null;
          last_successful_run: string | null;
          success_rate_percent: number | null;
          successful_runs: number | null;
          total_runs: number | null;
        };
        Relationships: [];
      };
      employee_analytics_summary_all_time_view: {
        Row: {
          attendance_rate: number | null;
          avg_clock_in_time: string | null;
          avg_clock_out_time: string | null;
          avg_daily_hours: number | null;
          avg_lunch_minutes: number | null;
          clock_in_consistency_minutes: number | null;
          employee_id: string | null;
          home_days: number | null;
          home_work_dates: Json | null;
          home_work_percentage: number | null;
          incomplete_records_dates: Json | null;
          leave_dates: Json | null;
          leave_days: number | null;
          leave_rate: number | null;
          office_days: number | null;
          office_work_dates: Json | null;
          office_work_percentage: number | null;
          preferred_home_days: Json | null;
          public_holidays_dates: Json | null;
          required_workdays: number | null;
          total_days: number | null;
          total_hours: number | null;
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
    };
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database['public']['Enums']['app_permission'];
        };
        Returns: boolean;
      };
      cleanup_cron_job_logs: {
        Args: { days_to_keep?: number };
        Returns: number;
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
      generate_attendance_seed: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_daily_hours_record: {
        Args: {
          p_employee_id: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: Json;
      };
      update_attendance_summaries: {
        Args: { p_employee_id?: string };
        Returns: undefined;
      };
      update_attendance_summaries_with_logging: {
        Args: { p_employee_id?: string };
        Returns: Json;
      };
      update_employee_monthly_summaries: {
        Args: { p_employee_id: string };
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
        | 'attendance_records.update'
        | 'attendance_summaries.update'
        | 'attendance_summaries.insert';
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
        'attendance_summaries.update',
        'attendance_summaries.insert',
      ],
      app_roles: ['admin'],
      work_mode: ['office', 'home'],
    },
  },
} as const;

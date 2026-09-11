export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_turns: {
        Row: {
          conversation_id: string;
          created_at: string;
          mode: string;
          request_hash: string;
          request_id: string;
          result: Json | null;
          status: string;
          topic: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          mode: string;
          request_hash: string;
          request_id: string;
          result?: Json | null;
          status?: string;
          topic: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          mode?: string;
          request_hash?: string;
          request_id?: string;
          result?: Json | null;
          status?: string;
          topic?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          created_at: string;
          id: string;
          listening_correct: number;
          listening_total: number;
          speaking_comfort: number;
          summary: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listening_correct: number;
          listening_total: number;
          speaking_comfort: number;
          summary: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listening_correct?: number;
          listening_total?: number;
          speaking_comfort?: number;
          summary?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      lesson_sessions: {
        Row: {
          completed_at: string;
          id: string;
          payload: Json;
          user_id: string;
        };
        Insert: {
          completed_at: string;
          id: string;
          payload: Json;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          id?: string;
          payload?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          settings: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          settings: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          settings?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      review_items: {
        Row: {
          corrected: string;
          due_at: string;
          explanation: string;
          id: string;
          original: string;
          repetitions: number;
          request_id: string;
          user_id: string;
        };
        Insert: {
          corrected: string;
          due_at?: string;
          explanation: string;
          id?: string;
          original: string;
          repetitions?: number;
          request_id: string;
          user_id: string;
        };
        Update: {
          corrected?: string;
          due_at?: string;
          explanation?: string;
          id?: string;
          original?: string;
          repetitions?: number;
          request_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_items_user_id_request_id_fkey";
            columns: ["user_id", "request_id"];
            isOneToOne: true;
            referencedRelation: "ai_turns";
            referencedColumns: ["user_id", "request_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      finish_ai_turn: {
        Args: { p_request: string; p_result: Json; p_user: string };
        Returns: undefined;
      };
      reserve_ai_turn: {
        Args: {
          p_conversation: string;
          p_hash: string;
          p_mode: string;
          p_request: string;
          p_topic: string;
          p_user: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      message_suggestions: {
        Row: {
          chunks_retrieved: Json | null
          created_at: string
          id: string
          message_id: string
          status: string
          suggestion_text: string
        }
        Insert: {
          chunks_retrieved?: Json | null
          created_at?: string
          id?: string
          message_id: string
          status?: string
          suggestion_text: string
        }
        Update: {
          chunks_retrieved?: Json | null
          created_at?: string
          id?: string
          message_id?: string
          status?: string
          suggestion_text?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          audio_url: string | null
          client_id: string
          content: string | null
          created_at: string
          direction: string
          id: string
          platform: string
          transcription: string | null
        }
        Insert: {
          audio_url?: string | null
          client_id: string
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          platform: string
          transcription?: string | null
        }
        Update: {
          audio_url?: string | null
          client_id?: string
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          platform?: string
          transcription?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge_chunks: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: knowledge_chunks
//   id: uuid (not null, default: gen_random_uuid())
//   content: text (not null)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   embedding: vector (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: message_suggestions
//   id: uuid (not null, default: gen_random_uuid())
//   message_id: text (not null)
//   suggestion_text: text (not null)
//   status: text (not null, default: 'pending'::text)
//   chunks_retrieved: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: text (not null)
//   platform: text (not null)
//   direction: text (not null)
//   content: text (nullable)
//   transcription: text (nullable)
//   audio_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: knowledge_chunks
//   PRIMARY KEY knowledge_chunks_pkey: PRIMARY KEY (id)
// Table: message_suggestions
//   PRIMARY KEY message_suggestions_pkey: PRIMARY KEY (id)
//   CHECK message_suggestions_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'edited'::text])))
// Table: messages
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: knowledge_chunks
//   Policy "authenticated_insert_chunks" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_chunks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_chunks" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: message_suggestions
//   Policy "authenticated_insert_suggestions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_suggestions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_suggestions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: messages
//   Policy "authenticated_insert_messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION match_knowledge_chunks(vector, double precision, integer)
//   CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(query_embedding vector, match_threshold double precision, match_count integer)
//    RETURNS TABLE(id uuid, content text, metadata jsonb, similarity double precision)
//    LANGUAGE sql
//    STABLE
//   AS $function$
//     SELECT
//       kc.id,
//       kc.content,
//       kc.metadata,
//       (1 - (kc.embedding <=> query_embedding))::float AS similarity
//     FROM public.knowledge_chunks kc
//     WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
//     ORDER BY kc.embedding <=> query_embedding
//     LIMIT match_count;
//   $function$
//

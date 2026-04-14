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
      calendar_events: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          end_time: string
          google_calendar_event_id: string | null
          id: string
          start_time: string
          sync_error: string | null
          sync_status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          start_time: string
          sync_error?: string | null
          sync_status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          start_time?: string
          sync_error?: string | null
          sync_status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'calendar_events_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          avatar: string | null
          behavioral_profile: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          pipeline_stage: string
          sentiment_tags: string[] | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          avatar?: string | null
          behavioral_profile?: string | null
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          pipeline_stage?: string
          sentiment_tags?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          avatar?: string | null
          behavioral_profile?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          pipeline_stage?: string
          sentiment_tags?: string[] | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      google_calendar_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: number | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      product_documents: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string | null
          size: number
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id?: string | null
          size?: number
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string | null
          size?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_documents_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          client_id: string
          created_at: string
          deleted_at: string | null
          expected_date: string
          id: string
          name: string
          stage: string
          start_date: string
          updated_at: string
          value: number
        }
        Insert: {
          client_id: string
          created_at?: string
          deleted_at?: string | null
          expected_date: string
          id?: string
          name: string
          stage: string
          start_date?: string
          updated_at?: string
          value?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          expected_date?: string
          id?: string
          name?: string
          stage?: string
          start_date?: string
          updated_at?: string
          value?: number
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
// Table: calendar_events
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   client_id: text (nullable)
//   title: text (not null)
//   description: text (nullable)
//   start_time: timestamp with time zone (not null)
//   end_time: timestamp with time zone (not null)
//   google_calendar_event_id: text (nullable)
//   sync_status: text (not null, default: 'pending'::text)
//   sync_error: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   status: text (not null, default: 'active'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: text (not null)
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   avatar: text (nullable)
//   status: text (not null, default: 'active'::text)
//   pipeline_stage: text (not null, default: 'Lead'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   behavioral_profile: text (nullable)
//   sentiment_tags: _text (nullable, default: '{}'::text[])
//   utm_campaign: text (nullable)
//   utm_source: text (nullable)
//   utm_medium: text (nullable)
// Table: google_calendar_credentials
//   user_id: uuid (not null)
//   access_token: text (nullable)
//   refresh_token: text (nullable)
//   expires_at: bigint (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: product_documents
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (nullable)
//   name: text (not null)
//   url: text (not null)
//   type: text (not null)
//   size: integer (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: text (not null)
//   name: text (not null)
//   value: numeric (not null, default: 0)
//   stage: text (not null)
//   start_date: timestamp with time zone (not null, default: now())
//   expected_date: timestamp with time zone (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   deleted_at: timestamp with time zone (nullable)

// --- CONSTRAINTS ---
// Table: calendar_events
//   FOREIGN KEY calendar_events_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY calendar_events_pkey: PRIMARY KEY (id)
//   FOREIGN KEY calendar_events_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: campaigns
//   PRIMARY KEY campaigns_pkey: PRIMARY KEY (id)
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: google_calendar_credentials
//   PRIMARY KEY google_calendar_credentials_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY google_calendar_credentials_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: knowledge_chunks
//   PRIMARY KEY knowledge_chunks_pkey: PRIMARY KEY (id)
// Table: message_suggestions
//   PRIMARY KEY message_suggestions_pkey: PRIMARY KEY (id)
//   CHECK message_suggestions_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'edited'::text])))
// Table: messages
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
// Table: product_documents
//   PRIMARY KEY product_documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY product_documents_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
//   CHECK products_stage_check: CHECK ((stage = ANY (ARRAY['Interesse'::text, 'Proposta'::text, 'Negociação'::text, 'Fechado'::text, 'Entregue'::text, 'Upsell'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: calendar_events
//   Policy "Users can manage their own calendar events" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: campaigns
//   Policy "authenticated_all_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: clients
//   Policy "authenticated_all_clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: google_calendar_credentials
//   Policy "Users can manage their own credentials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
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
// Table: product_documents
//   Policy "authenticated_all_documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: products
//   Policy "authenticated_all_products" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (deleted_at IS NULL)

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

// --- INDEXES ---
// Table: products
//   CREATE INDEX products_client_id_idx ON public.products USING btree (client_id)
//   CREATE INDEX products_stage_idx ON public.products USING btree (stage)

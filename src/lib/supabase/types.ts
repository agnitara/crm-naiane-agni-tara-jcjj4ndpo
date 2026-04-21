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
      client_suggestions: {
        Row: {
          client_id: string
          content: string
          created_at: string
          description: string
          id: string
          reason: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          description: string
          id?: string
          reason: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          description?: string
          id?: string
          reason?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_suggestions_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          avatar: string | null
          behavioral_profile: string | null
          created_at: string
          email: string | null
          id: string
          last_read_at: string
          name: string
          notes: string | null
          opt_out: boolean
          phone: string | null
          pipeline_stage: string
          sentiment_tags: string[] | null
          status: string
          updated_at: string
          user_id: string | null
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
          last_read_at?: string
          name: string
          notes?: string | null
          opt_out?: boolean
          phone?: string | null
          pipeline_stage?: string
          sentiment_tags?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
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
          last_read_at?: string
          name?: string
          notes?: string | null
          opt_out?: boolean
          phone?: string | null
          pipeline_stage?: string
          sentiment_tags?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
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
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
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
      meta_credentials: {
        Row: {
          created_at: string
          facebook_page_access_token: string | null
          facebook_page_id: string | null
          instagram_access_token: string | null
          instagram_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facebook_page_access_token?: string | null
          facebook_page_id?: string | null
          instagram_access_token?: string | null
          instagram_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facebook_page_access_token?: string | null
          facebook_page_id?: string | null
          instagram_access_token?: string | null
          instagram_account_id?: string | null
          updated_at?: string
          user_id?: string
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
      product_types: {
        Row: {
          created_at: string
          default_value: number
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          default_value?: number
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          default_value?: number
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          client_id: string | null
          created_at: string
          deleted_at: string | null
          expected_date: string | null
          id: string
          name: string
          stage: string
          start_date: string | null
          updated_at: string
          user_id: string | null
          value: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expected_date?: string | null
          id?: string
          name: string
          stage: string
          start_date?: string | null
          updated_at?: string
          user_id?: string | null
          value?: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expected_date?: string | null
          id?: string
          name?: string
          stage?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          browser_notifications_enabled: boolean
          created_at: string
          notification_sound_enabled: boolean
          pipeline_stages: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_notifications_enabled?: boolean
          created_at?: string
          notification_sound_enabled?: boolean
          pipeline_stages?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_notifications_enabled?: boolean
          created_at?: string
          notification_sound_enabled?: boolean
          pipeline_stages?: string[]
          updated_at?: string
          user_id?: string
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
//   user_id: text (not null)
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
// Table: client_suggestions
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: text (not null)
//   type: text (not null)
//   content: text (not null)
//   description: text (not null)
//   reason: text (not null)
//   status: text (not null, default: 'pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   notes: text (nullable)
//   opt_out: boolean (not null, default: false)
//   last_read_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable, default: auth.uid())
// Table: google_calendar_credentials
//   user_id: text (not null)
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
// Table: message_templates
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: text (not null)
//   name: text (not null)
//   content: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: text (not null)
//   platform: text (not null)
//   direction: text (not null)
//   content: text (nullable)
//   transcription: text (nullable)
//   audio_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: meta_credentials
//   user_id: text (not null)
//   facebook_page_id: text (nullable)
//   facebook_page_access_token: text (nullable)
//   instagram_account_id: text (nullable)
//   instagram_access_token: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: product_documents
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (nullable)
//   name: text (not null)
//   url: text (not null)
//   type: text (not null)
//   size: integer (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: product_types
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   default_value: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: text (nullable)
//   name: text (not null)
//   value: numeric (not null, default: 0)
//   stage: text (not null)
//   start_date: timestamp with time zone (nullable, default: now())
//   expected_date: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   deleted_at: timestamp with time zone (nullable)
//   user_id: uuid (nullable, default: auth.uid())
// Table: user_settings
//   user_id: text (not null)
//   pipeline_stages: _text (not null, default: ARRAY['Lead'::text, 'Prospect'::text, 'Qualificado'::text, 'Em Tratativa'::text, 'Proposta'::text, 'Negociação'::text, 'Ativo'::text, 'Concluído'::text, 'Inativo'::text])
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   notification_sound_enabled: boolean (not null, default: true)
//   browser_notifications_enabled: boolean (not null, default: false)

// --- CONSTRAINTS ---
// Table: calendar_events
//   FOREIGN KEY calendar_events_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY calendar_events_pkey: PRIMARY KEY (id)
// Table: campaigns
//   PRIMARY KEY campaigns_pkey: PRIMARY KEY (id)
// Table: client_suggestions
//   FOREIGN KEY client_suggestions_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY client_suggestions_pkey: PRIMARY KEY (id)
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: google_calendar_credentials
//   PRIMARY KEY google_calendar_credentials_pkey: PRIMARY KEY (user_id)
// Table: knowledge_chunks
//   PRIMARY KEY knowledge_chunks_pkey: PRIMARY KEY (id)
// Table: message_suggestions
//   PRIMARY KEY message_suggestions_pkey: PRIMARY KEY (id)
//   CHECK message_suggestions_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'edited'::text])))
// Table: message_templates
//   PRIMARY KEY message_templates_pkey: PRIMARY KEY (id)
// Table: messages
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
// Table: meta_credentials
//   PRIMARY KEY meta_credentials_pkey: PRIMARY KEY (user_id)
// Table: product_documents
//   PRIMARY KEY product_documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY product_documents_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
// Table: product_types
//   UNIQUE product_types_name_key: UNIQUE (name)
//   PRIMARY KEY product_types_pkey: PRIMARY KEY (id)
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
//   FOREIGN KEY products_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (user_id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: calendar_events
//   Policy "Users can manage their own calendar events" (ALL, PERMISSIVE) roles={public}
//     USING: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//     WITH CHECK: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//   Policy "authenticated_all_calendar_events" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: campaigns
//   Policy "authenticated_all_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_delete_campaigns" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_campaigns" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_campaigns" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_campaigns" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: client_suggestions
//   Policy "authenticated_all_client_suggestions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_delete_client_suggestions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_client_suggestions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_client_suggestions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_client_suggestions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clients
//   Policy "users_delete_own_clients" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "users_insert_own_clients" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "users_select_own_clients" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "users_update_own_clients" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: google_calendar_credentials
//   Policy "Users can manage their own credentials" (ALL, PERMISSIVE) roles={public}
//     USING: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//     WITH CHECK: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//   Policy "authenticated_all_google_calendar_credentials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: knowledge_chunks
//   Policy "authenticated_all_knowledge_chunks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_insert_chunks" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_chunks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_chunks" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: message_suggestions
//   Policy "authenticated_all_message_suggestions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_insert_suggestions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_suggestions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_suggestions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: message_templates
//   Policy "Users can manage their own templates" (ALL, PERMISSIVE) roles={public}
//     USING: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//     WITH CHECK: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//   Policy "authenticated_all_message_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: messages
//   Policy "authenticated_all_messages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_insert_messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: meta_credentials
//   Policy "Users can manage their own meta credentials" (ALL, PERMISSIVE) roles={public}
//     USING: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//     WITH CHECK: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//   Policy "authenticated_all_meta_credentials" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: product_documents
//   Policy "authenticated_all_product_documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_delete_documents" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_documents" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_documents" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_documents" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: product_types
//   Policy "authenticated_all_product_types" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_delete_product_types" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_product_types" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_product_types" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_product_types" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: products
//   Policy "users_delete_own_products" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "users_insert_own_products" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "users_select_own_products" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "users_update_own_products" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: user_settings
//   Policy "Users can manage their own settings" (ALL, PERMISSIVE) roles={public}
//     USING: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//     WITH CHECK: (((auth.uid())::text = user_id) OR (auth.role() = 'anon'::text) OR (user_id ~~ 'user_%'::text))
//   Policy "authenticated_all_user_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

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
// FUNCTION set_current_timestamp_updated_at()
//   CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: message_templates
//   set_updated_at: CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at()

// --- INDEXES ---
// Table: product_types
//   CREATE UNIQUE INDEX product_types_name_key ON public.product_types USING btree (name)
// Table: products
//   CREATE INDEX products_client_id_idx ON public.products USING btree (client_id)
//   CREATE INDEX products_stage_idx ON public.products USING btree (stage)

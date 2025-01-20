export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          user_id: string
          topic: string
          description: string
          status: 'active' | 'completed'
          expert_ids: string[]
          discussion_mode: 'sequential' | 'parallel'
          current_round: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          description: string
          status?: 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          description?: string
          status?: 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          discussion_id: string
          expert_role: string
          content: string
          round: number
          message_refs: Json
          metadata: Json
          response_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discussion_id: string
          expert_role: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discussion_id?: string
          expert_role?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          provider: 'claude' | 'openai'
          key: string
          name: string
          is_active: boolean
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'claude' | 'openai'
          key: string
          name: string
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'claude' | 'openai'
          key?: string
          name?: string
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
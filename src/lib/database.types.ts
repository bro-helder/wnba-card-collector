// Auto-maintained type definitions for the wnba_cards Supabase schema.
// Regenerate with: supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// Last updated: 2026-04-17 (Phase 2 complete)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  wnba_cards: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          ebay_alert_email: string | null;
          ebay_search_frequency: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
          ebay_alert_email?: string | null;
          ebay_search_frequency?: string;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['profiles']['Insert']>;
      };

      sets: {
        Row: {
          id: string;
          name: string;
          year: number;
          manufacturer: string | null;
          notes: string | null;
          needs_review: boolean;          // migration 00003
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          manufacturer?: string | null;
          notes?: string | null;
          needs_review?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['sets']['Insert']>;
      };

      parallels: {
        Row: {
          id: string;
          set_id: string | null;
          name: string;
          short_code: string | null;
          color_description: string | null;
          finish_description: string | null;
          print_run: number | null;
          is_numbered: boolean;
          is_base: boolean;
          sort_order: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          set_id?: string | null;
          name: string;
          short_code?: string | null;
          color_description?: string | null;
          finish_description?: string | null;
          print_run?: number | null;
          is_numbered?: boolean;
          is_base?: boolean;
          sort_order?: number;
          notes?: string | null;
        };
        Update: Partial<Database['wnba_cards']['Tables']['parallels']['Insert']>;
      };

      cards: {
        Row: {
          id: string;
          set_id: string | null;
          card_number: string;
          player_name: string;
          team: string | null;
          rookie_card: boolean;
          notes: string | null;
          needs_review: boolean;          // migration 00003
          created_at: string;
        };
        Insert: {
          id?: string;
          set_id?: string | null;
          card_number: string;
          player_name: string;
          team?: string | null;
          rookie_card?: boolean;
          notes?: string | null;
          needs_review?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['cards']['Insert']>;
      };

      collection: {
        Row: {
          id: string;
          user_id: string;
          card_id: string | null;
          parallel_id: string | null;
          serial_number: string | null;
          quantity: number;
          condition: string | null;
          cost_paid: number | null;
          acquisition_date: string | null;
          notes: string | null;
          scan_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id?: string | null;
          parallel_id?: string | null;
          serial_number?: string | null;
          quantity?: number;
          condition?: string | null;
          cost_paid?: number | null;
          acquisition_date?: string | null;
          notes?: string | null;
          scan_image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['collection']['Insert']>;
      };

      want_list: {
        Row: {
          id: string;
          user_id: string;
          card_id: string | null;
          parallel_id: string | null;
          status: string;
          max_price: number | null;
          priority: number;
          source: string | null;
          tracking_number: string | null;
          notes: string | null;
          ebay_alert_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id?: string | null;
          parallel_id?: string | null;
          status?: string;
          max_price?: number | null;
          priority?: number;
          source?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          ebay_alert_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['want_list']['Insert']>;
      };

      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal_type: string;
          set_id: string | null;
          insert_name: string | null;
          parallel_id: string | null;
          player_filter: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          goal_type: string;
          set_id?: string | null;
          insert_name?: string | null;
          parallel_id?: string | null;
          player_filter?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['goals']['Insert']>;
      };

      goal_cards: {
        Row: {
          id: string;
          goal_id: string;
          card_id: string | null;
          parallel_id: string | null;
        };
        Insert: {
          id?: string;
          goal_id: string;
          card_id?: string | null;
          parallel_id?: string | null;
        };
        Update: Partial<Database['wnba_cards']['Tables']['goal_cards']['Insert']>;
      };

      scan_sessions: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;               // stores front storage path
          front_image_path: string | null; // migration 00002 (may not exist yet)
          back_image_path: string | null;  // migration 00002 (may not exist yet)
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          front_image_path?: string | null;
          back_image_path?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['scan_sessions']['Insert']>;
      };

      scan_results: {
        Row: {
          id: string;
          session_id: string;
          rank: number;
          card_id: string | null;
          parallel_id: string | null;
          confidence: number | null;
          serial_detected: string | null;
          stage1_response: Json | null;
          stage2_response: Json | null;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          rank: number;
          card_id?: string | null;
          parallel_id?: string | null;
          confidence?: number | null;
          serial_detected?: string | null;
          stage1_response?: Json | null;
          stage2_response?: Json | null;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['scan_results']['Insert']>;
      };

      ebay_searches: {
        Row: {
          id: string;
          user_id: string;
          want_list_id: string;
          alert_type: string;
          last_run_at: string | null;
          last_result_count: number | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          want_list_id: string;
          alert_type?: string;
          last_run_at?: string | null;
          last_result_count?: number | null;
          active?: boolean;
        };
        Update: Partial<Database['wnba_cards']['Tables']['ebay_searches']['Insert']>;
      };

      ebay_alerts: {
        Row: {
          id: string;
          user_id: string;
          want_list_id: string;
          ebay_listing_id: string | null;
          listing_title: string | null;
          listing_price: number | null;
          last_seen_price: number | null;
          listing_url: string | null;
          alert_type: string | null;
          sent_at: string;
          last_checked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          want_list_id: string;
          ebay_listing_id?: string | null;
          listing_title?: string | null;
          listing_price?: number | null;
          last_seen_price?: number | null;
          listing_url?: string | null;
          alert_type?: string | null;
          sent_at?: string;
          last_checked_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['ebay_alerts']['Insert']>;
      };

      ebay_comps: {
        Row: {
          id: string;
          card_id: string | null;
          parallel_id: string | null;
          ebay_item_id: string;
          current_price: number | null;
          listing_type: string | null;
          listing_title: string | null;
          listing_url: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          card_id?: string | null;
          parallel_id?: string | null;
          ebay_item_id: string;
          current_price?: number | null;
          listing_type?: string | null;
          listing_title?: string | null;
          listing_url?: string | null;
          fetched_at?: string;
        };
        Update: Partial<Database['wnba_cards']['Tables']['ebay_comps']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row type aliases
export type Profile = Database['wnba_cards']['Tables']['profiles']['Row'];
export type Set = Database['wnba_cards']['Tables']['sets']['Row'];
export type Parallel = Database['wnba_cards']['Tables']['parallels']['Row'];
export type Card = Database['wnba_cards']['Tables']['cards']['Row'];
export type CollectionEntry = Database['wnba_cards']['Tables']['collection']['Row'];
export type WantListEntry = Database['wnba_cards']['Tables']['want_list']['Row'];
export type Goal = Database['wnba_cards']['Tables']['goals']['Row'];
export type GoalCard = Database['wnba_cards']['Tables']['goal_cards']['Row'];
export type ScanSession = Database['wnba_cards']['Tables']['scan_sessions']['Row'];
export type ScanResult = Database['wnba_cards']['Tables']['scan_results']['Row'];
export type EbaySearch = Database['wnba_cards']['Tables']['ebay_searches']['Row'];
export type EbayAlert = Database['wnba_cards']['Tables']['ebay_alerts']['Row'];
export type EbayComp = Database['wnba_cards']['Tables']['ebay_comps']['Row'];

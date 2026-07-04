// Generated-style TypeScript types for the Supabase schema.

export type Category = "sale" | "rental";

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          category: Category;
          title: string;
          description: string;
          price: number | null;
          rental_price: number | null;
          rental_duration: string | null;
          rank: string;
          heroes: number;
          skins: number;
          messenger_link: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: Category;
          title: string;
          description: string;
          price?: number | null;
          rental_price?: number | null;
          rental_duration?: string | null;
          rank: string;
          heroes: number;
          skins: number;
          messenger_link: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_images"]["Insert"]>;
      };
      buy_requests: {
        Row: {
          id: string;
          title: string;
          description: string;
          offered_price: number;
          rank: string;
          heroes: number;
          skins: number;
          messenger_link: string;
          images: string[];
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          offered_price: number;
          rank: string;
          heroes: number;
          skins: number;
          messenger_link: string;
          images?: string[];
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["buy_requests"]["Insert"]>;
      };
    };
  };
}

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingImageRow = Database["public"]["Tables"]["listing_images"]["Row"];
export type BuyRequestRow = Database["public"]["Tables"]["buy_requests"]["Row"];

export interface Listing extends ListingRow {
  images: ListingImageRow[];
}

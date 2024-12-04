export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      Community: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      Post: {
        Row: {
          body: string;
          community: number | null;
          created_at: string;
          creator: string;
          id: number;
        };
        Insert: {
          body: string;
          community?: number | null;
          created_at?: string;
          creator: string;
          id?: number;
        };
        Update: {
          body?: string;
          community?: number | null;
          created_at?: string;
          creator?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "Post_community_fkey";
            columns: ["community"];
            isOneToOne: false;
            referencedRelation: "Community";
            referencedColumns: ["id"];
          },
        ];
      };
      PostImage: {
        Row: {
          created_at: string;
          id: number;
          image_url: string;
          post: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image_url: string;
          post: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          image_url?: string;
          post?: number;
        };
        Relationships: [
          {
            foreignKeyName: "PostImage_post_fkey";
            columns: ["post"];
            isOneToOne: false;
            referencedRelation: "Post";
            referencedColumns: ["id"];
          },
        ];
      };
      Comment: {
        Row: {
          id: number;
          created_at: string;
          edited: boolean;
          body: string;
          Parent_post: number;
          Author: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          edited?: boolean;
          body: string;
          Parent_post: number;
          Author: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          edited?: boolean;
          body?: string;
          Parent_post?: number;
          Author?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Comment_Author_fkey";
            columns: ["Author"];
            isOneToOne: true;
            referencedRelation: "UserProfile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Comment_Parent_post_fkey";
            columns: ["Parent_post"];
            isOneToOne: true;
            referencedRelation: "Post";
            referencedColumns: ["user_id"];
          },
        ];
      };
      UserProfile: {
        Row: {
          banner_url: string | null;
          created_at: string;
          display_name: string;
          id: number;
          profile_picture_url: string | null;
          user_id: string;
          username: string;
        };
        Insert: {
          banner_url?: string | null;
          created_at?: string;
          display_name: string;
          id?: number;
          profile_picture_url?: string | null;
          user_id: string;
          username: string;
        };
        Update: {
          banner_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: number;
          profile_picture_url?: string | null;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
      Vehicle: {
        Row: {
          color: string | null;
          created_at: string;
          id: number;
          make: string;
          model: string;
          owner: string | null;
          year: number;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: number;
          make: string;
          model: string;
          owner?: string | null;
          year: number;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: number;
          make?: string;
          model?: string;
          owner?: string | null;
          year?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

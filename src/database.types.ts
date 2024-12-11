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
      Comment: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          edited: boolean;
          id: number;
          post_id: number;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          edited?: boolean;
          id?: number;
          post_id: number;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          edited?: boolean;
          id?: number;
          post_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "Comment_Author_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "UserProfile";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "Comment_Parent_post_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "Post";
            referencedColumns: ["id"];
          },
        ];
      };
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
      CommunityMember: {
        Row: {
          community_id: number;
          created_at: string;
          id: number;
          user_id: string;
        };
        Insert: {
          community_id: number;
          created_at?: string;
          id?: number;
          user_id: string;
        };
        Update: {
          community_id?: number;
          created_at?: string;
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "CommunityMember_community_id_fkey";
            columns: ["community_id"];
            isOneToOne: false;
            referencedRelation: "Community";
            referencedColumns: ["id"];
          },
        ];
      };
      Friends: {
        Row: {
          accepted: boolean;
          id: number;
          user_id1: string | null;
          user_id2: string | null;
        };
        Insert: {
          accepted: boolean;
          id?: number;
          user_id1?: string | null;
          user_id2?: string | null;
        };
        Update: {
          accepted?: boolean;
          id?: number;
          user_id1?: string | null;
          user_id2?: string | null;
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
      VehicleImage: {
        Row: {
          created_at: string;
          id: number;
          image_url: string;
          vehicle_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image_url: string;
          vehicle_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          image_url?: string;
          vehicle_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "VehicleImage_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "Vehicle";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      CommunityMemberWithProfile: {
        Row: {
          banner_url: string | null;
          community_id: number | null;
          created_at: string | null;
          display_name: string | null;
          id: number | null;
          profile_picture_url: string | null;
          user_id: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "CommunityMember_community_id_fkey";
            columns: ["community_id"];
            isOneToOne: false;
            referencedRelation: "Community";
            referencedColumns: ["id"];
          },
        ];
      };
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

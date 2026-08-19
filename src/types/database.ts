export type AppRole = "admin" | "sales_manager" | "sales_rep";

export type Profile = {
  id: string;
  full_name: string;
  role: AppRole;
  active: boolean;
  job_title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      admin_update_profile: {
        Args: { target_user_id: string; new_role: AppRole; is_active: boolean };
        Returns: undefined;
      };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<never, never>;
  };
};

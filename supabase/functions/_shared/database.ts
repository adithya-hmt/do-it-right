type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type MembershipRow = { id: string; space_id: string; user_id: string; role: string; status: string; joined_at: string | null; created_at: string; updated_at: string };
type InvitationRow = { id: string; space_id: string; email: string | null; role: string; invited_by: string; token_hash: string; expires_at: string; accepted_at: string | null; revoked_at: string | null; created_at: string };
type ProfileRow = { user_id: string; display_name: string; avatar_color: string; timezone: string; appearance: unknown; notification_preferences: unknown; created_at: string; updated_at: string };
type SpaceRow = { id: string; name: string; description: string; color: string; created_by: string; revision: number; created_at: string; updated_at: string; deleted_at: string | null };

export type DirDatabase = {
  public: {
    Tables: {
      dir_spaces: Table<SpaceRow>;
      dir_space_members: Table<MembershipRow, Pick<MembershipRow, 'id' | 'space_id' | 'user_id' | 'role' | 'status'> & Partial<MembershipRow>>;
      dir_invitations: Table<InvitationRow, Pick<InvitationRow, 'id' | 'space_id' | 'email' | 'role' | 'invited_by' | 'token_hash' | 'expires_at'> & Partial<InvitationRow>>;
      dir_profiles: Table<ProfileRow, Pick<ProfileRow, 'user_id' | 'display_name'> & Partial<ProfileRow>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

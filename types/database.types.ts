// Hand-written to match supabase/migrations/0001-0005 exactly.
// Once your Supabase project is linked, regenerate the authoritative version with:
//   npm run db:types
// and replace this file - the CLI output supersedes this manual copy.

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES'
  | 'MARKETING'
  | 'PROJECT_MANAGER'
  | 'RECRUITMENT'
  | 'FINANCE'
  | 'SUPPORT'
  | 'MEMBER';

export type AppPermission = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'APPROVE' | 'EXPORT' | 'MANAGE';

export type AppModule =
  | 'CRM'
  | 'DEALS'
  | 'CLIENTS'
  | 'PROJECTS'
  | 'TASKS'
  | 'CALENDAR'
  | 'COMMUNICATIONS'
  | 'CONTENT'
  | 'CAMPAIGNS'
  | 'CAREERS'
  | 'TEAM'
  | 'FINANCE'
  | 'INVOICES'
  | 'CONTRACTS'
  | 'DOCUMENTS'
  | 'GOALS'
  | 'ANALYTICS'
  | 'SUPPORT'
  | 'KNOWLEDGE'
  | 'SETTINGS'
  | 'AI';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          brand_primary_color: string;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['organizations']['Row']> & { name: string; slug: string };
        Update: Partial<Database['public']['Tables']['organizations']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          department: string | null;
          title: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      user_roles: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_roles']['Row']> & {
          organization_id: string;
          profile_id: string;
          role: AppRole;
        };
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
      role_permissions: {
        Row: {
          id: string;
          organization_id: string | null;
          role: AppRole;
          module: AppModule;
          permissions: AppPermission[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['role_permissions']['Row']> & {
          role: AppRole;
          module: AppModule;
        };
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          previous_value: Record<string, unknown> | null;
          new_value: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & {
          organization_id: string;
          action: string;
          entity_type: string;
        };
        Update: never; // audit_logs is append-only - enforced in DB too
      };
    };
    Functions: {
      auth_organization_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      auth_has_role: {
        Args: { check_role: AppRole };
        Returns: boolean;
      };
      auth_has_permission: {
        Args: { check_module: AppModule; check_permission: AppPermission };
        Returns: boolean;
      };
    };
  };
}

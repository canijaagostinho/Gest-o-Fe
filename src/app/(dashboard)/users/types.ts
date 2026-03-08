export type InstitutionUser = {
  id: string;
  full_name: string;
  email: string;
  role_id?: string;
  institution: {
    name: string;
  };
  role: {
    name: string;
  };
  created_at: string;
};

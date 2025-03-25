export interface TokenRefresh {
  refresh: string;
  access: string;
}

export interface TokenVerify {
  token: string;
}

export interface Project {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  owner: number;
  team: number;
  tags: number[];
  starred_by: number[];
}

export interface PaginatedProjectList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface AgentInstruction {
  id: number;
  instruction: string;
  category: string;
  is_enabled: boolean;
  is_global: boolean;
  user: number;
  agent: number;
  created_at: string;
  updated_at: string;
}

export interface PatchedProject extends Partial<Project> {}

export interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDocumentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Document[];
}

export interface PatchedDocument extends Partial<Document> {}

export interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedKnowledgeBaseList {
  count: number;
  next: string | null;
  previous: string | null;
  results: KnowledgeBase[];
}

export interface PatchedKnowledgeBase extends Partial<KnowledgeBase> {}

export interface StorageBucket {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedStorageBucketList {
  count: number;
  next: string | null;
  previous: string | null;
  results: StorageBucket[];
}

export interface PatchedStorageBucket extends Partial<StorageBucket> {}

export interface Team {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTeamList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Team[];
}

export interface PatchedTeam extends Partial<Team> {}

export interface Invitation {
  id: number;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedInvitationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invitation[];
}

export interface PatchedInvitation extends Partial<Invitation> {}

export interface Agent {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedAgentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Agent[];
}

export interface PatchedAgent extends Partial<Agent> {}

export interface DocumentTag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDocumentTagList {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentTag[];
}

export interface PatchedDocumentTag extends Partial<DocumentTag> {}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTagList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tag[];
}

export interface PatchedTag extends Partial<Tag> {}

export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  detail: string;
  jwt: JWT;
}

export interface Register {
  email: string;
  password1: string;
  password2: string;
}

export interface PasswordChange {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

export interface OtpRequest {
  otp: string;
}

export interface RestAuthDetail {
  detail: string;
}

export interface JWT {
  access: string;
  refresh: string;
  user: CustomUser;
}

export interface CustomUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  avatar_url: string;
  get_display_name: string;
  created_at: string;
  updated_at: string;
}

export interface PatchedCustomUser extends Partial<CustomUser> {}

export interface UserSignupStats {
  date: string;
  count: number;
}
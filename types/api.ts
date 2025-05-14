import { LucideIcon } from "lucide-react";

export interface TokenRefresh {
  refresh: string;
  access: string;
}

export interface TokenVerify {
  token: string;
}

export interface Project {
  id?: number;
  created_at?: string;
  updated_at?: string;
  name?: string;
  description?: string;
  owner?: number;
  team?: number;
  tags?: string[];
  starred_by?: number[];
  icon?: LucideIcon
  color?: string
  starred?: boolean
  lastUpdated?: string
  teamSize?: number
  chatCount?: number
  chatIcon?: LucideIcon
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

export interface TeamMember {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
}

export interface TeamInvitation {
  id: string;
  team: number;
  email: string;
  role: string;
  invited_by: string;
  is_accepted: boolean;
}

export interface SubscriptionPrice {
  id: string;
  product_name: string;
  human_readable_price: string;
  payment_amount: string;
  nickname: string;
  unit_amount: number;
}

export interface SubscriptionItem {
  id: string;
  price: SubscriptionPrice;
  quantity: number;
}

export interface TeamSubscription {
  id: string;
  display_name: string;
  start_date: string;
  billing_interval: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  status: string;
  quantity: number;
  items: SubscriptionItem[];
}

export interface Team {
  id: number;
  name: string;
  slug: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  dashboard_url: string;
  is_admin: boolean;
  subscription?: TeamSubscription;
  has_active_subscription: boolean;
  created_at: string;
  updated_at: string;
  is_current?: boolean;
}

export interface PaginatedTeamList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Team[];
}

export interface PatchedTeam extends Partial<Team> {}

export interface Invitation {
  id: string;
  team: number;
  email: string;
  role: string;
  invited_by: string;
  is_accepted: boolean;
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
  instructions: Instruction;
  expected_output: ExpectedOutput;
  name: string;
  description: string;
  unique_code: string;
  agent_id: string; 
  session_table: string;
  search_knowledge: boolean;
  add_datetime_to_instructions: boolean;
  show_tool_calls: boolean;
  markdown_enabled: boolean;
  debug_mode: boolean;
  num_history_responses: number;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  user: number;
  model: number;
  knowledge_base: number;
  team: number;
  subscriptions: number[];
}

export interface AgentCreate {
  name: string;
  description: string;
  category: number;
  model: number;
  instructions_id: number;
  custom_instruction: string;
  expected_output_id: number;
  custom_excpected_output: string;
  expected_output_data: {
    title: string;
    expected_output: string;
    category: string;
    is_enabled: boolean;
    is_global: boolean;
    user: number;
    agent: number;
  };
  knowledge_base: number;
  search_knowledge: boolean;
  cite_knowledge: boolean;
  add_datetime_to_instructions: boolean;
  show_tool_calls: boolean;
  markdown_enabled: boolean;
  debug_mode: boolean;
  num_history_responses: number;
  is_global: boolean;
  team: number;
  subscriptions: number[];
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
  user: User;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  avatar_url: string;
  get_display_name: string;
  created_at: string;
  updated_at: string;
  language?: string | 'en-US';
}

export interface PatchedUser extends Partial<User> {}

export interface UserSignupStats {
  date: string;
  count: number;
}

export interface PaginatedExpectedOutputs {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExpectedOutput[];
}

export interface AgentTemplateResponse {
  instructions: Instruction[];
  expected_outputs: ExpectedOutput[];
}

export interface Instruction {
  id: number;
  updated_at: string;
  title: string;
  instruction: string;
  category: string;
  is_template: boolean;
  is_enabled: boolean;
  is_global: boolean;
  is_system: boolean;
  created_at: string;
  user: number;
}

export interface ExpectedOutput {
  id: number;
  updated_at: string;
  title: string;
  expected_output: string;
  category: string;
  is_enabled: boolean;
  is_global: boolean;
  created_at: string;
  user: number;
  agent: number | null;
}
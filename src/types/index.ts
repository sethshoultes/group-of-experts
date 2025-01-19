export interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
}

export interface Message {
  id: string;
  discussion_id: string;
  expert_role: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Discussion {
  id: string;
  topic: string;
  description: string;
  status: 'active' | 'completed';
  messages: Array<Message & { timestamp: Date }>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: 'claude' | 'openai';
  key: string;
  name: string;
  is_active: boolean;
  last_used: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  apiKeys: ApiKey[];
  role?: 'admin' | 'user';
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface DebugState {
  enabled: boolean;
  panelVisible: boolean;
  logs: Array<{
    timestamp: Date;
    type: 'info' | 'error' | 'warn';
    message: string;
    data?: any;
  }>;
}
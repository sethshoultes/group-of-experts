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
  round: number;
  message_refs: Array<{
    messageId: string;
    expertId: string;
    quote: string;
  }>;
  metadata: {
    confidence?: number;
    agreementLevel?: number;
    contributionType?: 'primary' | 'supporting' | 'alternative';
  };
  created_at: string;
  updated_at: string;
}

export interface Discussion {
  id: string;
  topic: string;
  description: string;
  status: 'active' | 'completed';
  expert_ids: string[];
  discussion_mode: 'sequential' | 'parallel';
  current_round: number;
  messages: Array<Message & { timestamp: Date }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: 'openai';
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
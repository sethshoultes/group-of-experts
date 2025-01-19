export interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
}

export interface Message {
  id: string;
  expertId: string;
  content: string;
  timestamp: Date;
}

export interface Discussion {
  id: string;
  topic: string;
  description: string;
  status: 'active' | 'completed';
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
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
}
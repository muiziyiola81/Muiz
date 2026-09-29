export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  mimeType: string;
  size: number;
  url: string; // Object URL or Data URL for preview
  base64Data?: string; // base64 without prefix
  extractedContent?: string;
}

export interface Source {
  uri: string;
  title: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isThinking?: boolean;
  thinkingTime?: number;
  sources?: Source[];
  modelUsed?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  projectId?: string;
  assistantId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  customInstructions: string;
  createdAt: number;
  files?: Attachment[];
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatarIcon: string;
  category: 'Writing' | 'Coding' | 'Reasoning' | 'Productivity' | 'Custom';
  systemPrompt: string;
  tools: {
    webSearch: boolean;
    fileAnalysis: boolean;
    deepReasoning: boolean;
  };
  isCustom?: boolean;
}

export interface MemoryItem {
  id: string;
  content: string;
  createdAt: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  thinkModeDefault: boolean;
  webSearchDefault: boolean;
  responsePreference: 'concise' | 'balanced' | 'detailed' | 'creative';
  customInstructions: {
    aboutUser: string;
    responseStyle: string;
  };
  memoryEnabled: boolean;
  memories: MemoryItem[];
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  isPro: boolean;
  selectedModel: string;
  activeAssistantId: string | null;
}

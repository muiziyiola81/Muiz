import { Conversation, Project, Assistant, UserSettings } from '../types/chat';

const STORAGE_KEYS = {
  CONVERSATIONS: 'gpthub_conversations',
  ACTIVE_CONVERSATION_ID: 'gpthub_active_conversation_id',
  SETTINGS: 'gpthub_settings',
  PROJECTS: 'gpthub_projects',
  CUSTOM_ASSISTANTS: 'gpthub_custom_assistants',
};

export const DEFAULT_ASSISTANTS: Assistant[] = [
  {
    id: 'general',
    name: 'GPT Hub 4.5 Turbo',
    description: 'Flagship model for fast, comprehensive reasoning, writing, and problem-solving.',
    avatarIcon: 'Sparkles',
    category: 'Reasoning',
    systemPrompt: 'You are GPT Hub, a modern, highly capable, and articulate AI assistant. Provide thoughtful, well-structured, and accurate responses. When asked for code, write clean, production-ready code with concise explanations.',
    tools: { webSearch: true, fileAnalysis: true, deepReasoning: true },
  },
  {
    id: 'code-architect',
    name: 'Code Architect',
    description: 'Expert systems engineer specializing in clean code, TypeScript, debugging, and software design.',
    avatarIcon: 'Code2',
    category: 'Coding',
    systemPrompt: 'You are Code Architect, a senior software architect on GPT Hub. You excel in writing robust, modular, high-performance code across modern frameworks. Provide clean code snippets, analyze edge cases, and provide best practices.',
    tools: { webSearch: true, fileAnalysis: true, deepReasoning: true },
  },
  {
    id: 'deep-thinker',
    name: 'Deep Thinker',
    description: 'Rigorous analytical partner for STEM, mathematics, logic puzzles, and strategic decisions.',
    avatarIcon: 'Brain',
    category: 'Reasoning',
    systemPrompt: 'You are Deep Thinker on GPT Hub. You dissect complex logic, mathematical theorems, algorithms, and strategic problems systematically. Break down problems step-by-step and provide clear rationales.',
    tools: { webSearch: true, fileAnalysis: true, deepReasoning: true },
  },
  {
    id: 'creative-scribe',
    name: 'Creative Scribe',
    description: 'Nuanced writer for compelling storytelling, articles, pitch decks, and brand voice.',
    avatarIcon: 'PenTool',
    category: 'Writing',
    systemPrompt: 'You are Creative Scribe on GPT Hub. You produce vivid, emotionally resonant, and engaging prose, essays, scripts, and communications tailored to audience and tone.',
    tools: { webSearch: true, fileAnalysis: false, deepReasoning: false },
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Transforms numbers, CSV files, and datasets into actionable insights, tables, and trends.',
    avatarIcon: 'BarChart3',
    category: 'Productivity',
    systemPrompt: 'You are Data Analyst on GPT Hub. You specialize in interpreting structured datasets, spreadsheets, metrics, and quantitative trends. Provide crisp executive summaries, clean ASCII/markdown tables, and statistical observations.',
    tools: { webSearch: true, fileAnalysis: true, deepReasoning: true },
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  thinkModeDefault: false,
  webSearchDefault: false,
  responsePreference: 'balanced',
  customInstructions: {
    aboutUser: '',
    responseStyle: '',
  },
  memoryEnabled: true,
  memories: [
    {
      id: 'mem-1',
      content: 'Prefers modern TypeScript and React for web development queries.',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'mem-2',
      content: 'Values concise explanations with direct working code examples.',
      createdAt: Date.now() - 86400000,
    },
  ],
  voiceName: 'Kore',
  isPro: true, // Pro enabled for full capability demonstration
  selectedModel: 'gemini-3.8-flash',
  activeAssistantId: 'general',
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'GPT Hub Platform',
    description: 'Core application development, architecture design, and feature roadmap.',
    customInstructions: 'Focus on production-ready TypeScript, elegant dark green UI design, and responsive layouts.',
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const StorageService = {
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load conversations from storage:', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to storage:', e);
    }
  },

  getActiveConversationId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
    } catch {
      return null;
    }
  },

  setActiveConversationId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
      }
    } catch (e) {
      console.error('Failed to set active conversation ID:', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch (e) {
      console.error('Failed to load projects:', e);
      return DEFAULT_PROJECTS;
    }
  },

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  },

  getCustomAssistants(): Assistant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ASSISTANTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load custom assistants:', e);
      return [];
    }
  },

  saveCustomAssistants(assistants: Assistant[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ASSISTANTS, JSON.stringify(assistants));
    } catch (e) {
      console.error('Failed to save custom assistants:', e);
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_ASSISTANTS);
    } catch (e) {
      console.error('Failed to clear data:', e);
    }
  },
};

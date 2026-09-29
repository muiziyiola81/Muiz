import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEFAULT_SETTINGS, DEFAULT_ASSISTANTS } from '../services/storage';
import { Conversation, Message } from '../types/chat';

// In-memory mock for localStorage in Node test runner
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
(globalThis as any).localStorage = localStorageMock;

describe('GPT Hub Core Services & Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings when storage is empty', () => {
    const settings = StorageService.getSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.memoryEnabled).toBe(true);
    expect(settings.voiceName).toBe('Kore');
  });

  it('persists and retrieves conversations accurately', () => {
    const testConv: Conversation = {
      id: 'test-1',
      title: 'Testing GPT Hub Architecture',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: 'Hello GPT Hub!',
          timestamp: Date.now(),
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Hello! How can I assist your engineering goals today?',
          timestamp: Date.now() + 100,
        },
      ],
    };

    StorageService.saveConversations([testConv]);
    const retrieved = StorageService.getConversations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].title).toBe('Testing GPT Hub Architecture');
    expect(retrieved[0].messages).toHaveLength(2);
  });

  it('manages active conversation ID correctly', () => {
    expect(StorageService.getActiveConversationId()).toBeNull();
    StorageService.setActiveConversationId('conv-123');
    expect(StorageService.getActiveConversationId()).toBe('conv-123');
    StorageService.setActiveConversationId(null);
    expect(StorageService.getActiveConversationId()).toBeNull();
  });

  it('supports custom AI assistants persistence', () => {
    const custom = {
      id: 'custom-1',
      name: 'SQL Optimizer',
      description: 'Expert database tuner',
      avatarIcon: 'Database',
      category: 'Coding' as const,
      systemPrompt: 'You specialize in PostgreSQL and query plans.',
      tools: { webSearch: true, fileAnalysis: true, deepReasoning: true },
      isCustom: true,
    };

    StorageService.saveCustomAssistants([custom]);
    const retrieved = StorageService.getCustomAssistants();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].name).toBe('SQL Optimizer');
  });
});

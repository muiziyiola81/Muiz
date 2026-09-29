import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  User,
  Brain,
  Volume2,
  Database,
  Info,
  Trash2,
  Plus,
  Download,
  Check,
  Moon,
  Sun,
} from 'lucide-react';
import { UserSettings, MemoryItem } from '../../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onExportData: () => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportData,
  onClearAllChats,
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'personalization' | 'memory' | 'voice' | 'data' | 'about'
  >('general');

  const [formState, setFormState] = useState<UserSettings>({ ...settings });
  const [newMemoryText, setNewMemoryText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content: newMemoryText.trim(),
      createdAt: Date.now(),
    };
    setFormState((prev) => ({
      ...prev,
      memories: [...prev.memories, newMem],
    }));
    setNewMemoryText('');
  };

  const handleDeleteMemory = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleClearAllMemories = () => {
    setFormState((prev) => ({ ...prev, memories: [] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'personalization', label: 'Custom Instructions', icon: User },
    { id: 'memory', label: 'Memory & Notes', icon: Brain },
    { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
    { id: 'data', label: 'Data Controls', icon: Database },
    { id: 'about', label: 'About GPT Hub', icon: Info },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626] bg-[#171717]">
            <h2 className="text-base font-semibold text-white tracking-tight">
              Settings & Preferences
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[360px]">
            {/* Nav Tabs */}
            <div className="w-full md:w-48 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#262626] p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#171717] text-white font-semibold border border-[#333333]'
                        : 'text-[#858585] hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-sm text-[#d4d4d4]">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Theme
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, theme: 'dark' })}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer ${
                          formState.theme === 'dark'
                            ? 'bg-[#222222] border-[#525252] text-white font-medium'
                            : 'border-[#262626] text-[#858585] hover:text-white'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Monochrome Dark</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, theme: 'light' })}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs cursor-pointer ${
                          formState.theme === 'light'
                            ? 'bg-[#222222] border-[#525252] text-white font-medium'
                            : 'border-[#262626] text-[#858585] hover:text-white'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Monochrome Light</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#262626]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-white">Default Think Mode</p>
                        <p className="text-[11px] text-[#737373]">
                          Always initialize new conversations with deep reasoning enabled
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formState.thinkModeDefault}
                        onChange={(e) =>
                          setFormState({ ...formState, thinkModeDefault: e.target.checked })
                        }
                        className="rounded border-[#333333] bg-[#171717] text-white focus:ring-white h-4 w-4"
                      />
                    </label>
                  </div>

                  <div className="pt-3 border-t border-[#262626]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-white">Default Web Search</p>
                        <p className="text-[11px] text-[#737373]">
                          Always activate live Google search grounding by default
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formState.webSearchDefault}
                        onChange={(e) =>
                          setFormState({ ...formState, webSearchDefault: e.target.checked })
                        }
                        className="rounded border-[#333333] bg-[#171717] text-white focus:ring-white h-4 w-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Personalization Tab */}
              {activeTab === 'personalization' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Response Style Preference
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['concise', 'balanced', 'detailed', 'creative'] as const).map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => setFormState({ ...formState, responsePreference: pref })}
                          className={`p-2 rounded-xl border text-xs capitalize transition-all cursor-pointer ${
                            formState.responsePreference === pref
                              ? 'bg-[#222222] border-[#525252] text-white font-semibold'
                              : 'border-[#262626] text-[#858585] hover:text-white'
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      What would you like GPT Hub to know about you?
                    </label>
                    <textarea
                      rows={3}
                      value={formState.customInstructions.aboutUser}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          customInstructions: {
                            ...formState.customInstructions,
                            aboutUser: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Senior full-stack engineer building React and TypeScript applications."
                      className="w-full p-2.5 rounded-xl bg-[#171717] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      How would you like GPT Hub to respond?
                    </label>
                    <textarea
                      rows={3}
                      value={formState.customInstructions.responseStyle}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          customInstructions: {
                            ...formState.customInstructions,
                            responseStyle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Direct answers with concise code examples. Avoid excessive filler."
                      className="w-full p-2.5 rounded-xl bg-[#171717] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                    />
                  </div>
                </div>
              )}

              {/* Memory Tab */}
              {activeTab === 'memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                    <div>
                      <p className="text-xs font-semibold text-white">Personal Memory System</p>
                      <p className="text-[11px] text-[#737373]">
                        GPT Hub remembers key preferences across conversations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.memoryEnabled}
                        onChange={(e) =>
                          setFormState({ ...formState, memoryEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white" />
                    </label>
                  </div>

                  {/* Add memory item */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMemoryText}
                      onChange={(e) => setNewMemoryText(e.target.value)}
                      placeholder="Add a new custom memory note..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#171717] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
                    />
                    <button
                      type="button"
                      onClick={handleAddMemory}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#e5e5e5] text-black text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Memory Items List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formState.memories.length === 0 ? (
                      <p className="text-xs text-[#737373] italic text-center py-4">
                        No memories saved. Add notes above to personalize your assistant.
                      </p>
                    ) : (
                      formState.memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#171717] border border-[#262626] text-xs"
                        >
                          <span className="text-white truncate mr-2">{mem.content}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1 text-[#737373] hover:text-white transition-colors cursor-pointer"
                            title="Delete memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {formState.memories.length > 0 && (
                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={handleClearAllMemories}
                        className="text-xs text-[#a3a3a3] hover:text-white underline cursor-pointer"
                      >
                        Clear all memories
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-2">
                      Spoken AI Voice Personality
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: 'Kore', desc: 'Calm, refined, articulate' },
                        { name: 'Puck', desc: 'Warm, energetic, upbeat' },
                        { name: 'Charon', desc: 'Deep, authoritative, steady' },
                        { name: 'Fenrir', desc: 'Crisp, technical, precise' },
                        { name: 'Zephyr', desc: 'Gentle, thoughtful, modern' },
                      ].map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setFormState({ ...formState, voiceName: v.name as any })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            formState.voiceName === v.name
                              ? 'bg-[#222222] border-[#525252] text-white'
                              : 'border-[#262626] hover:bg-[#171717] text-[#d4d4d4]'
                          }`}
                        >
                          <p className="font-semibold text-xs text-white">{v.name}</p>
                          <p className="text-[11px] text-[#737373] mt-0.5">{v.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Export Conversation Data</p>
                      <p className="text-[11px] text-[#737373]">
                        Download all your chats and memories as JSON
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onExportData}
                      className="px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2b2b2b] border border-[#333333] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#171717] border border-[#333333] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Clear All Conversations</p>
                      <p className="text-[11px] text-[#737373]">
                        Permanently deletes your local conversation history
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete all conversations?')) {
                          onClearAllChats();
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#262626] hover:bg-[#333333] border border-[#404040] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#171717] border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-bold text-black text-xs">
                        G
                      </div>
                      <h3 className="font-semibold text-white text-sm">GPT Hub v4.5</h3>
                    </div>
                    <p className="text-xs text-[#a3a3a3] leading-relaxed">
                      GPT Hub is a premium conversational intelligence platform built with a refined monochrome interface. Features real-time response streaming, multimodal image analysis, live Google Search grounding, deep Think Mode reasoning, voice dictation, and workspaces.
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#262626] flex items-center gap-4 text-[11px] text-[#737373]">
                      <span>Model Engine: Gemini Series</span>
                      <span>·</span>
                      <span>Audio: Gemini TTS & Speech</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#262626] bg-[#171717]">
            <span className="text-xs text-[#737373]">
              {saveSuccess && <span className="text-white font-medium">Settings updated!</span>}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#e5e5e5] text-black text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

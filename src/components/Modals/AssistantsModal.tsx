import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Plus, Check, Brain, Code2, PenTool, BarChart3, Trash2 } from 'lucide-react';
import { Assistant } from '../../types/chat';

interface AssistantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistants: Assistant[];
  activeAssistant: Assistant;
  onSelectAssistant: (assistant: Assistant) => void;
  onCreateAssistant: (assistant: Assistant) => void;
  onDeleteAssistant: (id: string) => void;
}

export const AssistantsModal: React.FC<AssistantsModalProps> = ({
  isOpen,
  onClose,
  assistants,
  activeAssistant,
  onSelectAssistant,
  onCreateAssistant,
  onDeleteAssistant,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [webSearch, setWebSearch] = useState(true);
  const [fileAnalysis, setFileAnalysis] = useState(true);
  const [deepReasoning, setDeepReasoning] = useState(true);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;

    const newAst: Assistant = {
      id: `custom-ast-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom AI Assistant',
      avatarIcon: 'Sparkles',
      category: 'Custom',
      systemPrompt: systemPrompt.trim(),
      tools: {
        webSearch,
        fileAnalysis,
        deepReasoning,
      },
      isCustom: true,
    };

    onCreateAssistant(newAst);
    setName('');
    setDescription('');
    setSystemPrompt('');
    setIsCreating(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coding':
        return Code2;
      case 'Reasoning':
        return Brain;
      case 'Writing':
        return PenTool;
      case 'Productivity':
        return BarChart3;
      default:
        return Sparkles;
    }
  };

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
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                AI Assistants & GPTs
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isCreating ? (
              <div className="p-4 rounded-xl bg-[#171717] border border-[#404040] space-y-3">
                <p className="text-xs font-semibold text-white">Create Custom Assistant</p>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">Assistant Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Legal Contract Reviewer"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">Short Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly state what this assistant specializes in"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">
                    System Instructions (Persona & Guidelines)
                  </label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are an expert in... Analyze agreements for risk, highlight ambiguities, and suggest amendments."
                    className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] text-[#a3a3a3] mb-1.5">Enabled Tools</label>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <label className="flex items-center gap-1.5 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webSearch}
                        onChange={(e) => setWebSearch(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-white"
                      />
                      <span>Web Search</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fileAnalysis}
                        onChange={(e) => setFileAnalysis(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-white"
                      />
                      <span>Multimodal Files</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deepReasoning}
                        onChange={(e) => setDeepReasoning(e.target.checked)}
                        className="rounded border-[#333333] bg-[#0a0a0a] text-white"
                      />
                      <span>Deep Reasoning</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#a3a3a3] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#e5e5e5] text-black text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Create Assistant
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#333333] hover:border-[#525252] text-white hover:bg-[#171717] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Build a Custom Assistant</span>
              </button>
            )}

            {/* Assistants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assistants.map((ast) => {
                const Icon = getCategoryIcon(ast.category);
                const isActive = activeAssistant.id === ast.id;

                return (
                  <div
                    key={ast.id}
                    onClick={() => {
                      onSelectAssistant(ast);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isActive
                        ? 'bg-[#222222] border-[#525252] text-white shadow-md'
                        : 'bg-[#171717] border-[#262626] hover:border-[#404040] text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#333333] flex items-center justify-center text-white">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-xs text-white truncate max-w-[130px]">
                            {ast.name}
                          </span>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-white shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#a3a3a3] leading-relaxed line-clamp-2">
                        {ast.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#262626] text-[10px] text-[#737373]">
                      <span>{ast.category}</span>
                      {ast.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAssistant(ast.id);
                          }}
                          className="hover:text-white p-1 cursor-pointer"
                          title="Delete custom assistant"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

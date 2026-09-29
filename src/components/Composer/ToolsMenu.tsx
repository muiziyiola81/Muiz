import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Brain, FileSearch, Check } from 'lucide-react';

interface ToolsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  thinkMode: boolean;
  onToggleThinkMode: () => void;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  isOpen,
  onClose,
  webSearch,
  onToggleWebSearch,
  thinkMode,
  onToggleThinkMode,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl p-2 z-50 text-xs backdrop-blur-xl"
          >
            <div className="px-3 py-1.5 border-b border-[#262626] text-[11px] font-medium text-[#a3a3a3] uppercase tracking-wider">
              GPT Hub Intelligence Tools
            </div>

            <div className="space-y-1 mt-1">
              {/* Web Search Tool */}
              <button
                type="button"
                onClick={() => {
                  onToggleWebSearch();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  webSearch
                    ? 'bg-[#222222] border border-[#404040] text-white'
                    : 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${webSearch ? 'bg-[#333333] text-white' : 'bg-[#171717] text-[#737373]'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-white">Live Web Search</p>
                    <p className="text-[11px] text-[#737373]">Ground answers with real citations</p>
                  </div>
                </div>
                {webSearch && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Think Mode Tool */}
              <button
                type="button"
                onClick={() => {
                  onToggleThinkMode();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                  thinkMode
                    ? 'bg-[#222222] border border-[#404040] text-white'
                    : 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${thinkMode ? 'bg-[#333333] text-white' : 'bg-[#171717] text-[#737373]'}`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-white">Think Mode</p>
                    <p className="text-[11px] text-[#737373]">Deep reasoning for complex math & logic</p>
                  </div>
                </div>
                {thinkMode && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Multimodal Analysis Info */}
              <div className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] text-[11px] text-[#737373] flex items-start gap-2">
                <FileSearch className="w-4 h-4 text-[#a3a3a3] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#a3a3a3]">Multimodal Intelligence:</strong> Upload images, PDFs, CSV spreadsheets, and code to analyze context automatically.
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

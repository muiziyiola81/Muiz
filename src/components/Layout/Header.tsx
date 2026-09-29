import React, { useState } from 'react';
import {
  Menu,
  SquarePen,
  ChevronDown,
  Sparkles,
  FolderGit2,
  Crown,
  Check,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Assistant, Project } from '../../types/chat';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  assistants: Assistant[];
  activeAssistant: Assistant;
  onSelectAssistant: (assistant: Assistant) => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onOpenProjectsModal: () => void;
  onOpenAssistantsModal: () => void;
  onOpenProModal: () => void;
  onOpenAccountMenu: () => void;
  isPro: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  assistants,
  activeAssistant,
  onSelectAssistant,
  projects,
  activeProject,
  onSelectProject,
  onOpenProjectsModal,
  onOpenAssistantsModal,
  onOpenProModal,
  onOpenAccountMenu,
  isPro,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#262626] bg-[#000000]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Left: Sidebar toggle, Brand, Model Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#171717] transition-colors cursor-pointer"
          title="Toggle chat history"
          aria-label="Toggle chat history"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* New chat icon button */}
        <button
          type="button"
          onClick={onNewChat}
          className="p-2 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#171717] transition-colors cursor-pointer"
          title="New Chat"
          aria-label="New Chat"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        {/* Model / Assistant Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#171717] border border-transparent hover:border-[#262626] transition-all text-white font-medium text-sm cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-lg bg-[#171717] border border-[#333333] flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {activeAssistant.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#737373] group-hover:text-white transition-colors" />
          </button>

          <AnimatePresence>
            {isModelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                  onClick={() => setIsModelDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl p-2 z-50 text-xs backdrop-blur-xl"
                >
                  <div className="px-2 py-1.5 text-[10px] font-medium text-[#737373] uppercase tracking-wider">
                    AI Models & Assistants
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {assistants.map((ast) => (
                      <button
                        key={ast.id}
                        type="button"
                        onClick={() => {
                          onSelectAssistant(ast);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          activeAssistant.id === ast.id
                            ? 'bg-[#222222] border border-[#404040] text-white'
                            : 'hover:bg-[#171717] text-[#d4d4d4]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#171717] border border-[#2b2b2b] flex items-center justify-center shrink-0 text-white">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-xs truncate text-white">{ast.name}</p>
                            <p className="text-[10px] text-[#737373] truncate">
                              {ast.description}
                            </p>
                          </div>
                        </div>
                        {activeAssistant.id === ast.id && (
                          <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelDropdownOpen(false);
                        onOpenAssistantsModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white hover:bg-[#1c1c1c] font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Explore or Create Assistant</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace / Project Badge */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#111111] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#383838] transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-white" />
            <span className="truncate max-w-[120px]">
              {activeProject ? activeProject.name : 'Default Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#737373]" />
          </button>

          <AnimatePresence>
            {isProjectDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                  onClick={() => setIsProjectDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl p-2 z-50 text-xs backdrop-blur-xl"
                >
                  <div className="px-2 py-1 text-[10px] font-medium text-[#737373] uppercase tracking-wider">
                    Workspaces & Projects
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(null);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left cursor-pointer ${
                      activeProject === null
                        ? 'bg-[#222222] border border-[#404040] text-white'
                        : 'hover:bg-[#171717] text-[#d4d4d4]'
                    }`}
                  >
                    <span>General Workspace</span>
                    {activeProject === null && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        onSelectProject(proj);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left cursor-pointer ${
                        activeProject?.id === proj.id
                          ? 'bg-[#222222] border border-[#404040] text-white'
                          : 'hover:bg-[#171717] text-[#d4d4d4]'
                      }`}
                    >
                      <div className="truncate">
                        <p className="font-medium truncate">{proj.name}</p>
                      </div>
                      {activeProject?.id === proj.id && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="pt-2 mt-1 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        onOpenProjectsModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white hover:bg-[#1c1c1c] font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manage Projects</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Pro Upgrade Badge & Account Avatar */}
      <div className="flex items-center gap-2">
        {/* Pro status badge / Upgrade button */}
        <button
          type="button"
          onClick={onOpenProModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-[#171717] border border-[#333333] text-white hover:bg-[#222222] hover:border-[#525252] transition-all cursor-pointer shadow-sm"
          title="GPT Hub Pro Plan"
        >
          <Crown className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">Pro</span>
        </button>

        {/* Account Menu Trigger */}
        <button
          type="button"
          onClick={onOpenAccountMenu}
          className="w-8 h-8 rounded-full bg-[#171717] border border-[#333333] hover:border-[#525252] flex items-center justify-center text-xs font-semibold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
          title="Account profile & settings"
          aria-label="Account profile & settings"
        >
          M
        </button>
      </div>
    </header>
  );
};

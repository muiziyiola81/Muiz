import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SquarePen,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Archive,
  ArchiveRestore,
  Sparkles,
  Settings,
  Crown,
  FolderGit2,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { Conversation, Project } from '../../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onArchiveConversation: (id: string) => void;
  onRestoreConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenProModal: () => void;
  onOpenProjectsModal: () => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onArchiveConversation,
  onRestoreConversation,
  onOpenSettings,
  onOpenProModal,
  onOpenProjectsModal,
  projects,
  activeProject,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = useMemo(() => {
    let list = conversations.filter((c) => (showArchived ? c.isArchived : !c.isArchived));

    if (activeProject) {
      list = list.filter((c) => c.projectId === activeProject.id);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, showArchived, activeProject, searchQuery]);

  const groups = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    filteredConversations.forEach((conv) => {
      const diff = now - conv.updatedAt;
      if (diff < oneDay) {
        today.push(conv);
      } else if (diff < 2 * oneDay) {
        yesterday.push(conv);
      } else if (diff < 7 * oneDay) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return { today, yesterday, last7Days, older };
  }, [filteredConversations]);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-[#262626] flex flex-col transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-3 border-b border-[#262626]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#171717] border border-[#333333] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">GPT Hub</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-[#404040] text-white font-medium text-xs transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <SquarePen className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] text-[#737373] font-mono bg-[#111111] px-1.5 py-0.5 rounded border border-[#262626]">
              ⌘K
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#111111] border border-[#262626] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#525252]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Workspaces Filter bar */}
        <div className="px-3 py-1 flex items-center justify-between text-[11px] text-[#a3a3a3]">
          <button
            onClick={onOpenProjectsModal}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-3 h-3" />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              showArchived ? 'text-white font-medium underline' : 'hover:text-white'
            }`}
          >
            <Archive className="w-3 h-3" />
            <span>{showArchived ? 'Archived' : 'Archive'}</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-[#737373]">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30 text-white" />
              <p className="font-medium text-[#d4d4d4]">No conversations</p>
              <p className="mt-1 text-[11px]">
                {searchQuery ? 'Try a different search query.' : 'Start a new chat to begin.'}
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Today', groups.today)}
              {renderGroup('Yesterday', groups.yesterday)}
              {renderGroup('Previous 7 Days', groups.last7Days)}
              {renderGroup('Older', groups.older)}
            </>
          )}
        </div>

        {/* Bottom Panel: Pro Banner & Settings */}
        <div className="p-3 border-t border-[#262626] bg-[#000000] space-y-2">
          {/* Pro Banner */}
          <button
            type="button"
            onClick={onOpenProModal}
            className="w-full p-2.5 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#262626] hover:border-[#404040] text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white">Upgrade to Pro</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:translate-x-0.5 group-hover:text-white transition-transform" />
            </div>
            <p className="text-[10px] text-[#737373] mt-0.5">
              Unlimited Think Mode, search grounding & voices.
            </p>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#a3a3a3] hover:text-white hover:bg-[#171717] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </aside>
    </>
  );

  function renderGroup(title: string, list: Conversation[]) {
    if (list.length === 0) return null;

    return (
      <div key={title} className="space-y-0.5">
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#737373]">
          {title}
        </div>
        {list.map((conv) => {
          const isActive = conv.id === activeConversationId;
          const isRenaming = editingId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                if (window.innerWidth < 768) onClose();
              }}
              className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#1c1c1c] text-white border border-[#333333] font-medium'
                  : 'text-[#a3a3a3] hover:bg-[#141414] hover:text-white'
              }`}
            >
              {isRenaming ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full bg-[#111111] text-xs text-white px-2 py-1 rounded border border-[#525252] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={(e) => handleSaveRename(conv.id, e)}
                    className="p-1 text-white hover:text-[#d4d4d4]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCancelRename} className="p-1 text-[#737373] hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#737373]'}`} />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
                    <button
                      onClick={(e) => handleStartRename(conv, e)}
                      className="p-1 rounded hover:bg-[#262626] text-[#a3a3a3] hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {conv.isArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreConversation(conv.id);
                        }}
                        className="p-1 rounded hover:bg-[#262626] text-[#a3a3a3] hover:text-white"
                        title="Restore"
                      >
                        <ArchiveRestore className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveConversation(conv.id);
                        }}
                        className="p-1 rounded hover:bg-[#262626] text-[#a3a3a3] hover:text-white"
                        title="Archive"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded hover:bg-[#262626] text-[#a3a3a3] hover:text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }
};

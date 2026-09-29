import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FolderGit2, Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import { Project } from '../../types/chat';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  onCreateProject: (name: string, description: string, instructions: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateProject(name.trim(), description.trim(), instructions.trim());
    setName('');
    setDescription('');
    setInstructions('');
    setIsCreating(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-xl rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626] bg-[#171717]">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                Workspaces & Projects
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isCreating ? (
              <div className="p-4 rounded-xl bg-[#171717] border border-[#404040] space-y-3">
                <p className="text-xs font-semibold text-white">Create New Project</p>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">Project Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Next.js SaaS Architecture"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief overview of project goals"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a3a3a3] mb-1">
                    Custom Project Instructions (Included in all project chats)
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Focus on microservices and TypeScript. Avoid redundant boilerplate."
                    className="w-full p-2.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#525252]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
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
                    Save Project
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
                <span>Create New Project</span>
              </button>
            )}

            {/* General Workspace option */}
            <div
              onClick={() => {
                onSelectProject(null);
                onClose();
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                activeProject === null
                  ? 'bg-[#222222] border-[#525252] text-white'
                  : 'bg-[#171717] border-[#262626] hover:border-[#404040] text-white'
              }`}
            >
              <div>
                <p className="font-semibold text-xs text-white">General Workspace</p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  Standard global chat context without specialized project instructions.
                </p>
              </div>
              {activeProject === null && <Check className="w-4 h-4 text-white shrink-0" />}
            </div>

            {/* Existing Projects List */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider px-1">
                Your Projects ({projects.length})
              </p>
              {projects.map((proj) => {
                const isActive = activeProject?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between group ${
                      isActive
                        ? 'bg-[#222222] border-[#525252] text-white'
                        : 'bg-[#171717] border-[#262626] hover:border-[#404040] text-white'
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-white shrink-0" />
                        <span className="font-semibold text-xs text-white">{proj.name}</span>
                        {isActive && (
                          <span className="text-[10px] bg-[#333333] text-white px-1.5 py-0.5 rounded border border-[#525252]">
                            Active
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-[11px] text-[#a3a3a3] mt-1 line-clamp-1">
                          {proj.description}
                        </p>
                      )}
                      {proj.customInstructions && (
                        <p className="text-[10px] text-[#737373] mt-0.5 italic line-clamp-1">
                          "{proj.customInstructions}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 ml-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(proj);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-white hover:bg-[#2b2b2b] cursor-pointer"
                        title="Switch to this project"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project "${proj.name}"?`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#2b2b2b] cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

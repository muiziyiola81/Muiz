import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ConversationArea } from './components/Chat/ConversationArea';
import { Composer } from './components/Composer/Composer';
import { ImageViewerModal } from './components/Modals/ImageViewerModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ProjectsModal } from './components/Modals/ProjectsModal';
import { AssistantsModal } from './components/Modals/AssistantsModal';
import { ShareModal } from './components/Modals/ShareModal';
import { ProUpgradeModal } from './components/Modals/ProUpgradeModal';
import { AccountMenu } from './components/Modals/AccountMenu';
import { OfflineBanner } from './components/Common/OfflineBanner';

import {
  Conversation,
  Message,
  Attachment,
  Project,
  Assistant,
  UserSettings,
  Source,
} from './types/chat';
import {
  StorageService,
  DEFAULT_SETTINGS,
  DEFAULT_ASSISTANTS,
  DEFAULT_PROJECTS,
} from './services/storage';
import { ApiService } from './services/api';

export default function App() {
  // Core state from storage
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    StorageService.getConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() =>
    StorageService.getActiveConversationId()
  );
  const [settings, setSettings] = useState<UserSettings>(() =>
    StorageService.getSettings()
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    StorageService.getProjects()
  );
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>(() => {
    const custom = StorageService.getCustomAssistants();
    return [...DEFAULT_ASSISTANTS, ...custom];
  });
  const [activeAssistant, setActiveAssistant] = useState<Assistant>(() => {
    const savedId = StorageService.getSettings().activeAssistantId;
    return (
      DEFAULT_ASSISTANTS.find((a) => a.id === savedId) || DEFAULT_ASSISTANTS[0]
    );
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isAssistantsModalOpen, setIsAssistantsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Composer options
  const [thinkMode, setThinkMode] = useState(settings.thinkModeDefault);
  const [webSearch, setWebSearch] = useState(settings.webSearchDefault);
  const [isGenerating, setIsGenerating] = useState(false);

  // References
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state to local storage
  useEffect(() => {
    StorageService.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    StorageService.setActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    StorageService.saveSettings(settings);
    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings]);

  useEffect(() => {
    StorageService.saveProjects(projects);
  }, [projects]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for New Chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // New Chat
  const handleNewChat = () => {
    if (isGenerating) {
      handleStopGenerating();
    }
    setActiveConversationId(null);
  };

  // Build combined system prompt
  const buildSystemInstruction = () => {
    const parts: string[] = [];

    // Assistant Persona
    if (activeAssistant.systemPrompt) {
      parts.push(activeAssistant.systemPrompt);
    }

    // Project context
    if (activeProject?.customInstructions) {
      parts.push(`Project "${activeProject.name}" Instructions: ${activeProject.customInstructions}`);
    }

    // User Response Style Preference
    if (settings.responsePreference) {
      const prefs: Record<string, string> = {
        concise: 'Be concise, direct, and avoid unnecessary filler.',
        balanced: 'Provide well-balanced, clear, and comprehensive explanations.',
        detailed: 'Provide deep, thorough, and highly detailed technical explanations.',
        creative: 'Adopt a vivid, imaginative, and engaging narrative style.',
      };
      parts.push(`Response Preference: ${prefs[settings.responsePreference] || ''}`);
    }

    // Custom Instructions
    if (settings.customInstructions.aboutUser) {
      parts.push(`About the user: ${settings.customInstructions.aboutUser}`);
    }
    if (settings.customInstructions.responseStyle) {
      parts.push(`User response style guideline: ${settings.customInstructions.responseStyle}`);
    }

    // Memories
    if (settings.memoryEnabled && settings.memories.length > 0) {
      const memList = settings.memories.map((m) => `· ${m.content}`).join('\n');
      parts.push(`User preferences & memories:\n${memList}`);
    }

    return parts.join('\n\n');
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    attachments: Attachment[],
    options: { thinkMode: boolean; webSearch: boolean }
  ) => {
    if (isGenerating) return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    let targetConvId = activeConversationId;
    let updatedConversations = [...conversations];

    // If no active conversation, create one now
    if (!targetConvId || !activeConversation) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: content.slice(0, 36) || 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage],
        projectId: activeProject?.id,
        assistantId: activeAssistant.id,
      };
      targetConvId = newConv.id;
      updatedConversations = [newConv, ...conversations];
      setConversations(updatedConversations);
      setActiveConversationId(newConv.id);

      // Request descriptive title in background
      ApiService.generateChatTitle(content).then((generatedTitle) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newConv.id ? { ...c, title: generatedTitle } : c
          )
        );
      });
    } else {
      // Append user message to active conversation
      updatedConversations = updatedConversations.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      });
      setConversations(updatedConversations);
    }

    // Create placeholder AI assistant message
    const assistantMessageId = `msg-ai-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isThinking: options.thinkMode,
      isStreaming: true,
      sources: [],
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            messages: [...c.messages, assistantPlaceholder],
          };
        }
        return c;
      })
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentConv = updatedConversations.find((c) => c.id === targetConvId);
    const conversationHistory = currentConv ? currentConv.messages : [userMessage];
    const systemInstruction = buildSystemInstruction();
    const startTime = Date.now();

    await ApiService.streamChatMessage({
      messages: conversationHistory,
      systemInstruction,
      thinkMode: options.thinkMode,
      webSearch: options.webSearch,
      model: settings.selectedModel || 'gemini-3.1-flash-lite',
      signal: controller.signal,
      onChunk: (textChunk: string) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      content: m.content + textChunk,
                      isThinking: false,
                    };
                  }
                  return m;
                }),
              };
            }
            return c;
          })
        );
      },
      onSources: (sources: Source[]) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      sources,
                    };
                  }
                  return m;
                }),
              };
            }
            return c;
          })
        );
      },
      onError: (errorMessage: string) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      isThinking: false,
                      isStreaming: false,
                      error: errorMessage,
                    };
                  }
                  return m;
                }),
              };
            }
            return c;
          })
        );
        setIsGenerating(false);
      },
      onDone: (fullText: string) => {
        const thinkingTime = Math.round((Date.now() - startTime) / 1000);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      content: fullText || m.content,
                      isThinking: false,
                      isStreaming: false,
                      thinkingTime: options.thinkMode ? thinkingTime : undefined,
                    };
                  }
                  return m;
                }),
              };
            }
            return c;
          })
        );
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  // Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    // Mark any streaming assistant message as finished
    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map((m) => ({
                ...m,
                isThinking: false,
                isStreaming: false,
              })),
            };
          }
          return c;
        })
      );
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (!activeConversation || isGenerating) return;

    const msgs = [...activeConversation.messages];
    if (msgs.length === 0) return;

    // Pop the last assistant message
    if (msgs[msgs.length - 1].role === 'assistant') {
      msgs.pop();
    }

    // Find the last user message
    const lastUserMsg = msgs[msgs.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    // Set conversation without the last assistant message
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: msgs } : c))
    );

    // Re-trigger sending with the last user message
    handleSendMessage(
      lastUserMsg.content,
      lastUserMsg.attachments || [],
      { thinkMode, webSearch }
    );
  };

  // Edit and resend message
  const handleEditAndResend = (messageId: string, newContent: string) => {
    if (!activeConversation || isGenerating) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate messages to this point and update the message content
    const truncated = activeConversation.messages.slice(0, msgIndex);
    const updatedUserMsg: Message = {
      ...activeConversation.messages[msgIndex],
      content: newContent,
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...truncated, updatedUserMsg] }
          : c
      )
    );

    // Generate new AI response from this point
    handleSendMessage(
      updatedUserMsg.content,
      updatedUserMsg.attachments || [],
      { thinkMode, webSearch }
    );
  };

  // Conversation history actions
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const handleArchiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
    );
  };

  const handleRestoreConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: false } : c))
    );
  };

  // Project management
  const handleCreateProject = (
    name: string,
    description: string,
    customInstructions: string
  ) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      customInstructions,
      createdAt: Date.now(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
  };

  // Assistant management
  const handleCreateAssistant = (assistant: Assistant) => {
    setAssistants((prev) => [...prev, assistant]);
    const custom = StorageService.getCustomAssistants();
    StorageService.saveCustomAssistants([...custom, assistant]);
    setActiveAssistant(assistant);
  };

  const handleDeleteAssistant = (id: string) => {
    setAssistants((prev) => prev.filter((a) => a.id !== id));
    const custom = StorageService.getCustomAssistants().filter((a) => a.id !== id);
    StorageService.saveCustomAssistants(custom);
    if (activeAssistant.id === id) {
      setActiveAssistant(DEFAULT_ASSISTANTS[0]);
    }
  };

  // Data export
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: 'miizlake@gmail.com',
      conversations,
      projects,
      settings,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gpthub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAllChats = () => {
    setConversations([]);
    setActiveConversationId(null);
    StorageService.saveConversations([]);
    StorageService.setActiveConversationId(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-white">
      {/* Offline Status Toast */}
      <OfflineBanner />

      {/* History Drawer / Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onArchiveConversation={handleArchiveConversation}
        onRestoreConversation={handleRestoreConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProModal={() => setIsProModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
      />

      {/* Main Conversation Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          assistants={assistants}
          activeAssistant={activeAssistant}
          onSelectAssistant={(ast) => {
            setActiveAssistant(ast);
            setSettings((prev) => ({ ...prev, activeAssistantId: ast.id }));
          }}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
          onOpenAssistantsModal={() => setIsAssistantsModalOpen(true)}
          onOpenProModal={() => setIsProModalOpen(true)}
          onOpenAccountMenu={() => setIsAccountMenuOpen(true)}
          isPro={settings.isPro}
        />

        {/* Message Thread Area */}
        <ConversationArea
          conversation={activeConversation}
          isGenerating={isGenerating}
          voiceName={settings.voiceName}
          onSelectPrompt={(prompt, opts) => {
            handleSendMessage(
              prompt,
              [],
              {
                thinkMode: opts?.thinkMode ?? thinkMode,
                webSearch: opts?.webSearch ?? webSearch,
              }
            );
          }}
          onRegenerate={handleRegenerate}
          onEditAndResend={handleEditAndResend}
          onOpenImageViewer={setSelectedImageUrl}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          assistantName={activeAssistant.name}
        />

        {/* Floating Composer */}
        <Composer
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGenerating={handleStopGenerating}
          thinkMode={thinkMode}
          onToggleThinkMode={() => setThinkMode(!thinkMode)}
          webSearch={webSearch}
          onToggleWebSearch={() => setWebSearch(!webSearch)}
          onOpenImageViewer={setSelectedImageUrl}
        />
      </div>

      {/* Modals & Dialogs */}
      <ImageViewerModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onExportData={handleExportData}
        onClearAllChats={handleClearAllChats}
      />

      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      <AssistantsModal
        isOpen={isAssistantsModalOpen}
        onClose={() => setIsAssistantsModalOpen(false)}
        assistants={assistants}
        activeAssistant={activeAssistant}
        onSelectAssistant={(ast) => {
          setActiveAssistant(ast);
          setSettings((prev) => ({ ...prev, activeAssistantId: ast.id }));
        }}
        onCreateAssistant={handleCreateAssistant}
        onDeleteAssistant={handleDeleteAssistant}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        conversation={activeConversation}
      />

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={settings.isPro}
        onTogglePro={(status) => setSettings((s) => ({ ...s, isPro: status }))}
      />

      <AccountMenu
        isOpen={isAccountMenuOpen}
        onClose={() => setIsAccountMenuOpen(false)}
        isPro={settings.isPro}
        onOpenSettings={() => {
          setIsAccountMenuOpen(false);
          setIsSettingsOpen(true);
        }}
        onOpenProModal={() => {
          setIsAccountMenuOpen(false);
          setIsProModalOpen(true);
        }}
        conversationCount={conversations.length}
      />
    </div>
  );
}

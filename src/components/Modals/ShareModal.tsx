import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check, FileDown, FileText } from 'lucide-react';
import { Conversation } from '../../types/chat';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareableUrl = `${window.location.origin}/#share=${conversation.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const handleCopyMarkdown = async () => {
    let md = `# ${conversation.title}\n\n`;
    conversation.messages.forEach((msg) => {
      md += `### ${msg.role === 'user' ? 'User' : 'GPT Hub'}\n\n${msg.content}\n\n---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (e) {
      console.error('Failed to copy markdown:', e);
    }
  };

  const handleDownloadJson = () => {
    const sanitized = {
      title: conversation.title,
      createdAt: new Date(conversation.createdAt).toISOString(),
      messages: conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(sanitized, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626] bg-[#171717]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-white" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Share Conversation
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
          <div className="p-5 space-y-4 text-xs text-[#d4d4d4]">
            <div>
              <p className="font-semibold text-white mb-1">{conversation.title}</p>
              <p className="text-[11px] text-[#737373]">
                {conversation.messages.length} messages · Created on{' '}
                {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Share Link Box */}
            <div className="p-3 rounded-xl bg-[#171717] border border-[#262626] space-y-2">
              <label className="block text-[11px] text-[#a3a3a3] font-medium">
                Public Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#e5e5e5] text-black font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="p-3 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-[#404040] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-white mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-semibold">Markdown</span>
                </div>
                <p className="text-[11px] text-[#737373]">
                  {copiedMarkdown ? 'Copied to clipboard!' : 'Copy raw formatted text'}
                </p>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="p-3 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-[#404040] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-white mb-1">
                  <FileDown className="w-4 h-4" />
                  <span className="font-semibold">JSON Export</span>
                </div>
                <p className="text-[11px] text-[#737373]">Download clean chat file</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

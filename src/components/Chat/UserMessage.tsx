import React, { useState } from 'react';
import { Pencil, Check, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Message, Attachment } from '../../types/chat';

interface UserMessageProps {
  message: Message;
  onEditAndResend: (messageId: string, newContent: string) => void;
  onOpenImageViewer: (url: string) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  onEditAndResend,
  onOpenImageViewer,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== message.content) {
      onEditAndResend(message.id, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(message.content);
    setIsEditing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col items-end mb-6 group">
      {/* Attachments preview */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 mb-2 max-w-[85%] md:max-w-[70%]">
          {message.attachments.map((att: Attachment) => (
            <div key={att.id}>
              {att.type === 'image' ? (
                <button
                  type="button"
                  onClick={() => onOpenImageViewer(att.url)}
                  className="relative group/img overflow-hidden rounded-xl border border-[#262626] bg-[#111111] transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#171717] border border-[#262626] text-xs text-white">
                  <FileText className="w-4 h-4 text-[#a3a3a3] shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate max-w-[140px] font-medium">{att.name}</p>
                    <p className="text-[10px] text-[#737373]">{formatFileSize(att.size)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message bubble */}
      <div className="relative max-w-[85%] md:max-w-[70%]">
        {isEditing ? (
          <div className="p-3 bg-[#171717] rounded-2xl border border-[#404040] shadow-lg min-w-[280px] sm:min-w-[360px]">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-transparent text-sm text-white resize-none focus:outline-none min-h-[70px]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#262626]">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white text-black font-medium hover:bg-[#e5e5e5] transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Resend</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-[#171717] text-white px-4 py-3 rounded-2xl rounded-tr-sm border border-[#262626] text-[14.5px] leading-relaxed select-text shadow-sm">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* Quick edit button on hover */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -left-8 top-2.5 p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Edit message"
              aria-label="Edit message"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

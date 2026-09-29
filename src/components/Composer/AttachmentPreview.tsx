import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText } from 'lucide-react';
import { Attachment } from '../../types/chat';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  onOpenImageViewer: (url: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove,
  onOpenImageViewer,
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 pt-2.5 pb-1">
      <AnimatePresence>
        {attachments.map((att) => (
          <motion.div
            key={att.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative group rounded-xl bg-[#171717] border border-[#262626] overflow-hidden flex items-center shadow-sm"
          >
            {att.type === 'image' ? (
              <div className="flex items-center gap-2 pr-7 p-1">
                <button
                  type="button"
                  onClick={() => onOpenImageViewer(att.url)}
                  className="w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-medium text-white truncate max-w-[110px]">
                    {att.name}
                  </p>
                  <span className="text-[10px] text-[#737373]">Image</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 pr-7">
                <FileText className="w-4 h-4 text-[#a3a3a3] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate max-w-[130px]">
                    {att.name}
                  </p>
                  <span className="text-[10px] text-[#737373]">
                    {(att.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#222222] hover:bg-[#333333] text-[#a3a3a3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

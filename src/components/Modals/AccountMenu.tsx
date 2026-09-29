import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Crown,
  Settings,
  LogOut,
} from 'lucide-react';

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onOpenSettings: () => void;
  onOpenProModal: () => void;
  conversationCount: number;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isOpen,
  onClose,
  isPro,
  onOpenSettings,
  onOpenProModal,
  conversationCount,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-4 top-16 w-80 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl p-4 text-xs z-50 backdrop-blur-xl"
        >
          {/* User Info Card */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#262626]">
            <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#383838] flex items-center justify-center font-bold text-white text-sm shadow-sm">
              M
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white truncate text-sm">miizlake</span>
                {isPro && (
                  <span className="text-[10px] bg-[#222222] text-white px-1.5 py-0.2 rounded font-bold border border-[#333333]">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#737373] truncate">miizlake@gmail.com</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Metrics */}
          <div className="py-3 border-b border-[#262626] grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#171717] border border-[#262626]">
              <p className="text-[10px] text-[#737373]">Saved Chats</p>
              <p className="text-sm font-semibold text-white">{conversationCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-[#171717] border border-[#262626]">
              <p className="text-[10px] text-[#737373]">Subscription</p>
              <p className="text-sm font-semibold text-white">
                {isPro ? 'GPT Hub Pro' : 'Free Tier'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="pt-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProModal();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1a1a1a] text-white transition-colors text-left cursor-pointer"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>Manage Subscription</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1a1a1a] text-[#d4d4d4] hover:text-white transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#737373]" />
              <span>Settings & Preferences</span>
            </button>

            <div className="pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1a1a1a] text-[#737373] hover:text-white transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Signed in as miizlake@gmail.com</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

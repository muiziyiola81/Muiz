import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#171717] border border-[#404040] text-white text-xs shadow-xl flex items-center gap-2 backdrop-blur-md"
      >
        <WifiOff className="w-4 h-4 text-white shrink-0" />
        <span className="font-medium">
          Offline Mode: You are disconnected from the network. Stored chats remain accessible.
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

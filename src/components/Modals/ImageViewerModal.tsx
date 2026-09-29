import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  onClose,
}) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    setScale(1);
  }, [imageUrl]);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `gpthub-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Floating Top Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2.5 rounded-full bg-[#171717] hover:bg-[#222222] text-white border border-[#262626] transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="p-2.5 rounded-full bg-[#171717] hover:bg-[#222222] text-white border border-[#262626] transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-[#171717] hover:bg-[#222222] text-white border border-[#262626] transition-colors cursor-pointer"
            title="Download image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#171717] hover:bg-[#222222] text-white border border-[#262626] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl max-h-[85vh] z-0 select-none overflow-hidden rounded-2xl shadow-2xl"
        >
          <img
            src={imageUrl}
            alt="Viewed content"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-[#262626]"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

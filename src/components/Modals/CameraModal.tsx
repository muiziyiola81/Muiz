import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RotateCw, Check, AlertCircle } from 'lucide-react';
import { Attachment } from '../../types/chat';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (attachment: Attachment) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    stopCamera();
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported on this browser or device.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      if (mode === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          return;
        } catch {
          // fallthrough
        }
      }
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser settings.'
          : 'Unable to access camera on this device.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    const base64Data = capturedImage.split(',')[1];
    const attachment: Attachment = {
      id: `cam-${Date.now()}`,
      name: `Photo_${new Date().toISOString().slice(0, 10)}.jpg`,
      type: 'image',
      mimeType: 'image/jpeg',
      size: Math.round((base64Data.length * 3) / 4),
      url: capturedImage,
      base64Data,
    };

    onCapture(attachment);
    onClose();
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#171717]">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Camera className="w-4 h-4 text-white" />
              <span>Capture Photo for GPT Hub</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder / Captured preview */}
          <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
            {error ? (
              <div className="p-6 text-center text-sm text-[#a3a3a3] max-w-sm">
                <AlertCircle className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
                <p className="font-medium text-white mb-1">Camera Notice</p>
                <p className="text-xs text-[#737373] mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-medium cursor-pointer hover:bg-[#e5e5e5]"
                >
                  Retry Camera
                </button>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-4 bg-[#171717] border-t border-[#262626]">
            {!capturedImage && !error ? (
              <>
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="p-2.5 rounded-xl bg-[#222222] hover:bg-[#2b2b2b] text-white transition-colors cursor-pointer"
                  title="Flip camera"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="w-14 h-14 rounded-full border-4 border-[#333333] bg-white hover:bg-[#e5e5e5] transition-transform active:scale-95 shadow-lg flex items-center justify-center cursor-pointer"
                  title="Take photo"
                >
                  <div className="w-10 h-10 rounded-full bg-black" />
                </button>

                <div className="w-10" />
              </>
            ) : capturedImage ? (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#e5e5e5] text-black text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Photo</span>
                </button>
              </div>
            ) : (
              <div className="w-full text-center">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs text-[#a3a3a3] hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

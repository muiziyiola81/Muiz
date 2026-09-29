import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Zap, Sparkles, Brain, Globe, ShieldCheck } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: (status: boolean) => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onTogglePro,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTogglePro(true);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1200);
    }, 600);
  };

  const handleDowngrade = () => {
    onTogglePro(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626] bg-[#171717]">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                GPT Hub Plans & Upgrade
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center">
              <div className="flex items-center p-1 rounded-xl bg-[#0a0a0a] border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-[#222222] text-white border border-[#404040] shadow-sm'
                      : 'text-[#858585] hover:text-white'
                  }`}
                >
                  Monthly ($20/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-[#222222] text-white border border-[#404040] shadow-sm'
                      : 'text-[#858585] hover:text-white'
                  }`}
                >
                  <span>Yearly ($16/mo)</span>
                  <span className="text-[10px] bg-white text-black px-1.5 py-0.2 rounded font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  !isPro
                    ? 'bg-[#171717] border-[#404040]'
                    : 'bg-[#0f0f0f] border-[#262626] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white text-base">GPT Hub Free</h3>
                    {!isPro && (
                      <span className="text-[10px] bg-[#222222] text-[#a3a3a3] px-2 py-0.5 rounded border border-[#333333]">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#a3a3a3] mb-4">
                    Essential AI assistance for everyday questions and tasks.
                  </p>
                  <div className="text-2xl font-bold text-white mb-4">
                    $0 <span className="text-xs text-[#737373] font-normal">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#a3a3a3] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Standard chat responses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Image and document uploads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Basic conversation memory</span>
                    </li>
                  </ul>
                </div>

                {isPro && (
                  <button
                    type="button"
                    onClick={handleDowngrade}
                    className="w-full py-2 rounded-xl border border-[#262626] hover:bg-[#222222] text-[#a3a3a3] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Switch to Free
                  </button>
                )}
              </div>

              {/* Pro Plan */}
              <div
                className={`p-5 rounded-2xl border flex flex-col justify-between relative ${
                  isPro
                    ? 'bg-[#171717] border-[#666666] shadow-xl'
                    : 'bg-[#141414] border-[#383838] shadow-lg'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  PRO
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-white" />
                      <h3 className="font-semibold text-white text-base">GPT Hub Pro</h3>
                    </div>
                    {isPro && (
                      <span className="text-[10px] bg-[#222222] text-white px-2 py-0.5 rounded border border-[#404040]">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#a3a3a3] mb-4">
                    Maximum reasoning depth, real-time web citations, and high-fidelity voice.
                  </p>
                  <div className="text-2xl font-bold text-white mb-4">
                    {billingCycle === 'yearly' ? '$16' : '$20'}{' '}
                    <span className="text-xs text-[#737373] font-normal">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#d4d4d4] mb-6">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="font-medium text-white">Full Think Mode reasoning depth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Live Google Search grounding citations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Custom AI Assistant (GPT) creator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>High-fidelity spoken audio responses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Expanded memory & workspace projects</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isPro || isProcessing}
                  onClick={handleUpgrade}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isPro
                      ? 'bg-[#222222] text-white border border-[#404040] cursor-default'
                      : 'bg-white hover:bg-[#e5e5e5] text-black cursor-pointer'
                  }`}
                >
                  {isProcessing ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : isPro ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pro Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-3.5 h-3.5 fill-black" />
                      <span>Upgrade to GPT Hub Pro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {successMessage && (
              <p className="text-center text-xs text-white font-medium">
                Welcome to GPT Hub Pro! Your account has been upgraded.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

export const LanguagePopup: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if language has been selected before
    const hasSelectedLanguage = localStorage.getItem('i18nextLng');
    
    // We can also check a custom flag if i18nextLng is automatically set by detector
    // But typically if the user hasn't interacted, we might want to show this.
    // For now, let's use a session storage flag to only show it once per session if not set explicitly
    // Or better, check if we have a specific 'language_confirmed' flag.
    
    const isConfirmed = localStorage.getItem('language_confirmed');
    
    if (!isConfirmed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const selectLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language_confirmed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,102,255,0.2)] relative overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary-DEFAULT/20 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-primary-light">
                <Globe className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{t('common.select_language')}</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Please select your preferred language to continue.
                <br/>
                يرجى اختيار لغتك المفضلة للمتابعة.
                <br/>
                Veuillez sélectionner votre langue préférée pour continuer.
              </p>
              
              <div className="grid gap-3 w-full">
                <button
                  onClick={() => selectLanguage('ar')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-DEFAULT/30 transition-all duration-300 group"
                >
                  <span className="font-bold text-white group-hover:text-primary-light">العربية</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Arabic</span>
                </button>
                
                <button
                  onClick={() => selectLanguage('en')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-DEFAULT/30 transition-all duration-300 group"
                >
                  <span className="font-bold text-white group-hover:text-primary-light">English</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">English</span>
                </button>
                
                <button
                  onClick={() => selectLanguage('fr')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-DEFAULT/30 transition-all duration-300 group"
                >
                  <span className="font-bold text-white group-hover:text-primary-light">Français</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">French</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

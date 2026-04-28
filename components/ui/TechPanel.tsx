import React from 'react';
import { motion } from 'framer-motion';

interface TechPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle';
  animateScan?: boolean;
}

export const TechPanel: React.FC<TechPanelProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  animateScan = false
}) => {
  return (
    <div className={`relative group bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-tl-sm z-20" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-tr-sm z-20" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-bl-sm z-20" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-br-sm z-20" />

      {/* Optional Scanning Line */}
      {animateScan && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-DEFAULT/5 to-transparent pointer-events-none z-10"
          initial={{ translateY: '-100%' }}
          whileInView={{ translateY: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-primary-DEFAULT/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

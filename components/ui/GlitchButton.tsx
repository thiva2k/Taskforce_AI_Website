import React from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from './MagneticButton';
import { Zap } from 'lucide-react';

interface GlitchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  disabled?: boolean;
}

export const GlitchButton: React.FC<GlitchButtonProps> = ({ children, onClick, className = '', variant = 'primary', disabled }) => {
  return (
    <MagneticButton
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      variant={variant}
      disabled={disabled}
      overlay={
        <>
          {/* Glitch Layers (Hidden by default, visible on hover via CSS animations if we added complex keyframes, 
              but here we'll use Framer Motion for a cleaner controlled 'tech' pulse) */}
          <motion.div
             className="absolute inset-0 bg-white/20 translate-x-[-100%] pointer-events-none"
             variants={{
               hover: { 
                 translateX: ["100%", "-100%"],
               }
             }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          />
          
          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.1)_3px)] bg-[size:4px_4px] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity" />
          
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
        </>
      }
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </MagneticButton>
  );
};

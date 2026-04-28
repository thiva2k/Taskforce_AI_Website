import React from 'react';
import { motion } from 'framer-motion';

interface TechCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TechCard: React.FC<TechCardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      className={`relative group bg-black/40 border border-white/10 backdrop-blur-sm overflow-hidden ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent/50 group-hover:border-accent transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-accent/50 group-hover:border-accent transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-accent/50 group-hover:border-accent transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent/50 group-hover:border-accent transition-colors duration-300" />

      {/* Scanning Line Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500" />

      <div className="relative z-10 p-6 h-full">
        {children}
      </div>
    </motion.div>
  );
};

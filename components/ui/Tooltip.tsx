import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <div 
      className={`relative outline-none cursor-help ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-black/90 border border-white/20 rounded-lg text-xs text-gray-200 whitespace-nowrap z-50 shadow-xl backdrop-blur-md pointer-events-none"
          >
            {content}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
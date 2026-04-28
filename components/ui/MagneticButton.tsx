import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
  onClick?: () => void;
  overlay?: React.ReactNode;
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  overlay,
  disabled
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    const x = (clientX - (left + width / 2)) * 0.3; // Magnetic pull strength
    const y = (clientY - (top + height / 2)) * 0.3;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles = "relative group overflow-hidden rounded-full font-semibold transition-all duration-300 ease-out";
  
  const variants = {
    primary: "bg-brand-gradient text-white shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)]",
    secondary: "bg-transparent border border-secondary text-secondary hover:bg-secondary/10",
    ghost: "bg-transparent text-accent hover:text-white",
    outline: "bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40"
  };

  return (
    <motion.button
      ref={buttonRef}
      disabled={disabled}
      // Updated class order: Defaults first, then variant, then custom className
      // Adjusted default padding: px-5 for mobile (compact), px-8 for desktop
      className={`${baseStyles} px-5 py-3 md:px-8 md:py-4 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      animate={{ x: position.x, y: position.y }}
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {overlay}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {variant !== 'ghost' && (
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
        )}
      </span>
      {variant === 'primary' && (
        <div className="absolute inset-0 -z-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
      )}
    </motion.button>
  );
};
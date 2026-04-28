import React, { useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export const GlobalSpotlight: React.FC = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseX.set(touch.clientX);
      mouseY.set(touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 overflow-hidden">
      {/* 1. Spotlight Glow Gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 md:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.03),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* 2. Grid Reveal Pattern */}
      {/* This layer reveals a subtle technical grid only around the cursor */}
      <motion.div 
        className="absolute inset-0 opacity-0 md:opacity-100 transition-opacity duration-500"
        style={{
          maskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black,
              transparent
            )
          `,
        }}
      >
         {/* The Grid Pattern Itself */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </motion.div>
    </div>
  );
};
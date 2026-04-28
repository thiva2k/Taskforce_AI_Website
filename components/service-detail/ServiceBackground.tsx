
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const ServiceBackground: React.FC = () => {
  // Mouse Interaction State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoother, slower spring for premium feel
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform mouse values for different background layers (Parallax)
  const x1 = useTransform(smoothX, (val) => val / 20);
  const y1 = useTransform(smoothY, (val) => val / 20);
  
  const x2 = useTransform(smoothX, (val) => val / -30);
  const y2 = useTransform(smoothY, (val) => val / -30);

  const x3 = useTransform(smoothX, (val) => val / 25);
  const y3 = useTransform(smoothY, (val) => val / -25);
  
  const noiseX = useTransform(smoothX, (val) => val / -50);
  const noiseY = useTransform(smoothY, (val) => val / -50);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-dark-bg">
      {/* Orb 1 - Primary Blue (Top Left) */}
      <motion.div 
        style={{ x: x1, y: y1 }}
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.15, 0.25, 0.15],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-primary-DEFAULT rounded-full blur-[180px] opacity-20" 
      />

      {/* Orb 2 - Secondary Purple (Bottom Right) */}
      <motion.div 
        style={{ x: x2, y: y2 }}
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, -15, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-15%] right-[-5%] w-[800px] h-[800px] bg-secondary-DEFAULT rounded-full blur-[160px] opacity-15" 
      />
      
      {/* Orb 3 - Accent Cyan (Center/Top Right) */}
      <motion.div 
        style={{ x: x3, y: y3 }}
        animate={{ 
          scale: [1, 1.15, 1], 
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-accent rounded-full blur-[150px] opacity-10" 
      />
      
      {/* Interactive Noise Layer */}
      <motion.div 
        style={{ x: noiseX, y: noiseY }}
        className="absolute inset-[-50px] bg-[url('/noise.svg')] opacity-[0.15] mix-blend-overlay brightness-100 contrast-125" 
      />
      
      {/* Vignette Overlay for Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_100%)] opacity-60" />
    </div>
  );
};

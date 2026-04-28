import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';

export const InteractiveBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollY } = useScroll();

  // Smooth spring animation for fluid movement - optimized for background
  const springConfig = { damping: 25, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Center coordinate system
      mouseX.set(e.clientX - innerWidth / 2);
      mouseY.set(e.clientY - innerHeight / 2);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const { innerWidth, innerHeight } = window;
      const touch = e.touches[0];
      mouseX.set(touch.clientX - innerWidth / 2);
      mouseY.set(touch.clientY - innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mouseX, mouseY]);

  // Mouse Parallax transforms
  const mouseX1 = useTransform(smoothX, (val) => val * 0.08);
  const mouseY1 = useTransform(smoothY, (val) => val * 0.08);
  
  const mouseX2 = useTransform(smoothX, (val) => val * -0.06);
  const mouseY2 = useTransform(smoothY, (val) => val * -0.06);

  const mouseX3 = useTransform(smoothX, (val) => val * 0.04);
  const mouseY3 = useTransform(smoothY, (val) => val * 0.04);

  // Scroll Parallax transforms - subtle movement based on scroll position
  const scrollY1 = useTransform(scrollY, (val) => val * -0.2);
  const scrollY2 = useTransform(scrollY, (val) => val * -0.1);
  const scrollY3 = useTransform(scrollY, (val) => val * -0.15);

  // Combined transforms for Y axis
  const y1 = useTransform([mouseY1, scrollY1], ([mouse, scroll]) => (mouse as number) + (scroll as number));
  const y2 = useTransform([mouseY2, scrollY2], ([mouse, scroll]) => (mouse as number) + (scroll as number));
  const y3 = useTransform([mouseY3, scrollY3], ([mouse, scroll]) => (mouse as number) + (scroll as number));

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-dark-bg">
      {/* Global Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] opacity-60" />

      {/* Scanning Line */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20vh] w-full pointer-events-none"
        animate={{ top: ['-20%', '120%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Orb 1: Primary Blue - Follows mouse gently */}
      <motion.div 
        style={{ x: mouseX1, y: y1 }}
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[800px] h-[800px] bg-primary-DEFAULT/20 rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Orb 2: Secondary Purple - Opposes mouse gently */}
      <motion.div 
        style={{ x: mouseX2, y: y2 }}
        animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-secondary-DEFAULT/15 rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Orb 3: Accent Cyan - Center anchor */}
      <motion.div 
        style={{ x: mouseX3, y: y3 }}
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] mix-blend-screen"
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      
      {/* Vignette to focus center content */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_100%)] opacity-30" />
    </div>
  );
};
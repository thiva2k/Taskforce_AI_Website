import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Variants, useMotionValue, useSpring } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
  enableParallax?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = true,
  delay = 0,
  enableParallax = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const parallaxValue = 30 + (delay * 20);
  const yScroll = useTransform(scrollYProgress, [0, 1], [parallaxValue, -parallaxValue]);

  // Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hoverEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const touch = e.touches[0];
    
    const mouseXVal = touch.clientX - rect.left;
    const mouseYVal = touch.clientY - rect.top;
    
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Variants for the card container to handle entrance and staggering
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (d: number) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: d, 
        ease: "easeOut",
        when: "beforeChildren", 
        staggerChildren: 0.15 
      }
    })
  };

  return (
    <motion.div
      ref={ref}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardVariants}
      className={`h-full ${className}`}
    >
      <motion.div 
        style={enableParallax ? { y: yScroll } : undefined} 
        className="h-full perspective-[1000px]"
      >
        <motion.div
          whileHover={hoverEffect ? { y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" } : {}}
          whileTap={hoverEffect ? { scale: 0.98, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" } : {}}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleLeave}
          style={{
            rotateX: hoverEffect ? rotateX : 0,
            rotateY: hoverEffect ? rotateY : 0,
            transformStyle: "preserve-3d"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`
            relative overflow-hidden h-full
            bg-white/5 backdrop-blur-xl 
            border border-white/10 
            rounded-2xl p-8 
            shadow-lg
            flex flex-col
          `}
        >
          {hoverEffect && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          )}
          <div className="transform translate-z-[10px]">
             {children}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
import React from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export const TechScrollIndicator: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Create tick marks
  const ticks = Array.from({ length: 20 }).map((_, i) => i);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 h-[40vh] w-6 hidden lg:flex flex-col items-end justify-between z-40 pointer-events-none mix-blend-screen">
      {/* Top Bracket */}
      <div className="w-full h-px bg-white/20 relative">
        <div className="absolute right-0 top-0 h-2 w-px bg-white/20" />
      </div>

      {/* Track */}
      <div className="relative h-full w-full flex justify-end">
        {/* Ticks */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2">
            {ticks.map((i) => (
                <div 
                    key={i} 
                    className={`h-px bg-white/10 ${i % 5 === 0 ? 'w-3' : 'w-1.5'} transition-colors duration-300`} 
                />
            ))}
        </div>

        {/* Active Bar */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/5">
            <motion.div 
                style={{ scaleY, transformOrigin: "top" }}
                className="w-full h-full bg-primary-DEFAULT shadow-[0_0_10px_rgba(0,102,255,0.8)]"
            />
        </div>
        
        {/* Floating Indicator Label */}
        <motion.div 
            className="absolute right-6 top-0 text-[10px] font-mono text-primary-light tracking-widest rotate-90 origin-right translate-x-full"
            style={{ top: useTransform(scrollYProgress, (v) => `${v * 100}%`) }}
        >
            SCROLL_DEPTH
        </motion.div>
      </div>

      {/* Bottom Bracket */}
      <div className="w-full h-px bg-white/20 relative">
        <div className="absolute right-0 bottom-0 h-2 w-px bg-white/20" />
      </div>
    </div>
  );
};

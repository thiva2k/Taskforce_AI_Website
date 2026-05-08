
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Cpu } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Core Systems...");

  useEffect(() => {
    const duration = 2200; // total ms matching App.tsx timeout
    const interval = 40; // update frequency
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
            clearInterval(timer);
            return 100;
        }
        
        // Update status text based on progress thresholds
        if (next > 25 && next < 50) setStatus("Verifying Security Protocols...");
        if (next > 50 && next < 75) setStatus("Connecting to Neural Network...");
        if (next > 75 && next < 90) setStatus("Optimizing Assets...");
        if (next > 90) setStatus("Launching Interface...");
        
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        filter: "blur(20px)",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
    >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15)_0%,transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        
        {/* Grid Pattern - Subtle & Premium */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
            {/* Logo Animation */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-primary-DEFAULT/20 blur-2xl rounded-full animate-pulse" />
                <motion.div 
                    animate={{ 
                        boxShadow: [
                            "0 0 30px rgba(0,102,255,0.15)", 
                            "0 0 60px rgba(0,102,255,0.3)", 
                            "0 0 30px rgba(0,102,255,0.15)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-2xl border border-primary-DEFAULT/30 flex items-center justify-center relative bg-black/40 backdrop-blur-md"
                >
                    <div className="absolute inset-1 border border-primary-DEFAULT/10 rounded-xl" />
                    <motion.div
                        animate={{ scale: [0.9, 1.05, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center p-4"
                    >
                        <img 
                            src="/logo-icon.png" 
                            alt="AI TaskForce Logo" 
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,102,255,0.5)]"
                        />
                    </motion.div>
                </motion.div>
                
                {/* Orbiting Ring */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-[-15px] border border-white/5 rounded-full border-t-primary-DEFAULT/30 border-r-transparent"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-[-25px] border border-white/5 rounded-full border-b-primary-DEFAULT/20 border-l-transparent"
                />
            </div>

            {/* Typography */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
            >
                <img 
                    src="/logo-horizontal.png" 
                    alt="AI TaskForce" 
                    className="h-12 w-auto object-contain"
                />
            </motion.div>
            <div className="h-6 mb-8 flex items-center justify-center min-w-[240px]">
                <span className="text-xs font-mono text-primary-light/80 uppercase tracking-widest animate-pulse">
                    {status}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden relative mb-4">
                <motion.div 
                    className="h-full bg-gradient-to-r from-transparent via-primary-DEFAULT to-primary-light shadow-[0_0_20px_rgba(0,102,255,1)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            <div className="w-full flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-primary-DEFAULT" /> 
                    <span className="opacity-70">System Check</span>
                </span>
                <span className="tabular-nums opacity-70">{Math.round(progress)}%</span>
            </div>

            {/* Tech Decoration Footer */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 opacity-20">
                 <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /></div>
                 <div className="flex items-center gap-2"><Activity className="w-4 h-4" /></div>
            </div>
        </div>
    </motion.div>
  );
};

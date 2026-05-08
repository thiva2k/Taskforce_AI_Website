
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { GlitchButton } from '../ui/GlitchButton';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { ShieldCheck, Zap, Terminal, Cpu, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const ServiceCTA: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="px-6 py-32 relative overflow-hidden z-20">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-DEFAULT/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          style={{ y }}
          className="relative w-full"
          onMouseMove={handleMouseMove}
        >
          <TechPanel 
            className="rounded-2xl bg-[#0F1115]"
            animateScan={true}
          >
          {/* Spotlight Effect */}
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  650px circle at ${mouseX}px ${mouseY}px,
                  rgba(0, 102, 255, 0.1),
                  transparent 80%
                )
              `,
            }}
          />

          {/* Grid & Noise */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

          {/* Animated Gradient Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-DEFAULT to-transparent opacity-50" />

          <div className="relative p-12 md:p-24 flex flex-col items-center text-center">
            
            {/* Status Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  System Ready <span className="text-gray-600">|</span> v2.4.0
                </span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-none"
            >
              Initialize <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-accent">
                <ScrambleText text="Full Deployment" startDelay={500} />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Integrate this agent into your infrastructure today. Our architects provide 
              end-to-end implementation support to ensure zero-friction adoption.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col md:flex-row items-center gap-6 w-full justify-center mb-16"
            >
              <GlitchButton
                className="h-16 px-10 text-lg shadow-[0_0_50px_rgba(0,102,255,0.4)] hover:shadow-[0_0_80px_rgba(0,102,255,0.6)] border-0 min-w-[240px] justify-center"
                onClick={() => navigate('/book-demo')}
              >
                Start Integration
              </GlitchButton>
              
              <button 
                className="group flex items-center gap-3 px-8 py-5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 min-w-[240px] justify-center"
                onClick={() => navigate('/contact')}
              >
                <Terminal className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Contact Engineering</span>
              </button>
            </motion.div>

            {/* Tech Specs Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-12 border-t border-white/5 w-full max-w-4xl"
            >
              {[
                { icon: ShieldCheck, label: "Security", val: "SOC-2 Ready" },
                { icon: Zap, label: "Latency", val: "< 50ms Global" },
                { icon: Globe, label: "Region", val: "Multi-Zone" },
                { icon: Cpu, label: "Compute", val: "Auto-Scaling" }
              ].map((spec, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group/spec">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 group-hover/spec:bg-primary-DEFAULT/10 group-hover/spec:border-primary-DEFAULT/30 transition-colors">
                    <spec.icon className="w-5 h-5 text-gray-500 group-hover/spec:text-primary-light transition-colors" />
                  </div>
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-0.5">{spec.label}</div>
                  <div className="text-sm font-bold text-white">{spec.val}</div>
                </div>
              ))}
            </motion.div>

          </div>
          </TechPanel>
        </motion.div>
      </div>
    </section>
  );
};

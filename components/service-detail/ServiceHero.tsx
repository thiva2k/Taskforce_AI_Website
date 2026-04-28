import React from 'react';
import { motion } from 'framer-motion';
import { GlitchButton } from '../ui/GlitchButton';
import { ScrambleText } from '../ui/ScrambleText';
import { ServiceData } from '../../data/services';
import { Activity, Zap, Play, Terminal, Shield, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface ServiceHeroProps {
  service: ServiceData;
}

export const ServiceHero: React.FC<ServiceHeroProps> = ({ service }) => {
  const Icon = service.icon;
  const navigate = useNavigate();

  const handleNavigate = (link?: string, fallback?: string) => {
    const finalLink = link || fallback || '/contact';

    if (finalLink.startsWith('http') || finalLink.startsWith('mailto:')) {
      window.location.href = finalLink;
      return;
    }

    navigate(finalLink);
  };

  return (
    <section className="relative pt-10 pb-32 overflow-visible z-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
          <div className="flex-1 pt-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-accent mb-8 backdrop-blur-md"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </div>
              SYSTEM_CAPABILITY :: ONLINE
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 md:gap-5 mb-8"
            >
              <div className="p-3 md:p-4 rounded-2xl bg-gradient-to-br from-primary-DEFAULT/20 to-primary-dark/10 border border-primary-DEFAULT/30 text-primary-light shadow-[0_0_30px_rgba(0,102,255,0.15)]">
                <Icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                <ScrambleText text={service.title} />
              </h1>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-4xl font-bold leading-tight mb-6 max-w-2xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-light to-accent">
                {service.shortDesc}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-gray-400 leading-relaxed mb-10 max-w-xl border-l-2 border-white/10 pl-6"
            >
              {service.fullDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 w-full sm:w-auto"
            >
              <GlitchButton
                className="flex items-center gap-2 px-8 w-full sm:w-auto justify-center h-auto min-h-[50px]"
                onClick={() =>
                  handleNavigate(service.primaryButtonLink, '/book-demo')
                }
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                {service.primaryButtonText || 'Initialize Agent'}
              </GlitchButton>

              <GlitchButton
                variant="secondary"
                onClick={() =>
                  handleNavigate(
                    service.secondaryButtonLink,
                    `/contact?agent=${service.id}`
                  )
                }
                className="flex items-center gap-2 px-8 w-full sm:w-auto justify-center h-auto min-h-[50px] border-white/10 hover:bg-white/5"
              >
                <Mail className="w-4 h-4 group-hover:text-primary-light transition-colors shrink-0" />
                <span>{service.secondaryButtonText || 'Contact HQ'}</span>
              </GlitchButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-2 md:gap-4 max-w-lg"
            >
              {[
                { label: 'Encryption', val: 'AES-256', icon: Shield },
                { label: 'Latency', val: '<45ms', icon: Zap },
                { label: 'Uptime', val: '99.99%', icon: Activity },
              ].map((spec, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] md:text-xs font-mono mb-1 uppercase tracking-wider">
                    <spec.icon className="w-3 h-3" /> {spec.label}
                  </div>
                  <div className="text-white text-sm md:text-base font-semibold">
                    {spec.val}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="w-full lg:w-[45%] relative h-[350px] md:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-gradient opacity-10 blur-[100px] rounded-full transition-opacity duration-700 group-hover/vis:opacity-20" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md aspect-square group/vis"
            >
              <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite] group-hover/vis:border-white/20 transition-colors duration-500" />
              <div className="absolute inset-8 border border-dashed border-primary-DEFAULT/20 rounded-full animate-[spin_25s_linear_infinite_reverse] group-hover/vis:border-primary-DEFAULT/40 transition-colors duration-500" />
              <div className="absolute inset-16 border border-white/5 rounded-full group-hover/vis:scale-95 transition-transform duration-700 ease-in-out" />

              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary-DEFAULT/50 hover:shadow-[0_0_80px_rgba(0,102,255,0.4)] transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 z-10 pointer-events-none"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-DEFAULT/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-gradient" />

                  <div className="p-4 rounded-xl bg-white/5 mb-4 group-hover:scale-110 group-hover:bg-primary-DEFAULT/20 transition-all duration-500 border border-transparent group-hover:border-primary-DEFAULT/30 relative z-20">
                    <Terminal className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-primary-light transition-colors" />
                  </div>

                  <div className="font-mono text-xl md:text-2xl font-bold text-white tracking-widest mb-1 group-hover:text-primary-light transition-colors relative z-20">
                    AI-CORE
                  </div>
                  <div className="flex items-center gap-2 relative z-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
                      Operational
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 p-3 md:p-4 rounded-xl bg-dark-surface/80 backdrop-blur-md border border-white/10 shadow-xl group-hover/vis:border-primary-DEFAULT/30 transition-colors duration-500 scale-90 md:scale-100"
              >
                <div className="text-xs text-gray-400 font-mono mb-1">THREAD_COUNT</div>
                <div className="text-lg md:text-xl font-bold text-white">8,420</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-10 left-0 p-3 md:p-4 rounded-xl bg-dark-surface/80 backdrop-blur-md border border-white/10 shadow-xl group-hover/vis:border-primary-DEFAULT/30 transition-colors duration-500 scale-90 md:scale-100"
              >
                <div className="text-xs text-gray-400 font-mono mb-1">MODEL_VERSION</div>
                <div className="text-lg md:text-xl font-bold text-accent">v2.4.0</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
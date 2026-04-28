import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Activity, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { ServiceData } from '../../data/services';

interface ServiceDossierProps {
  service: ServiceData;
}

export const ServiceDossier: React.FC<ServiceDossierProps> = ({ service }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'benefits'>('features');

  return (
    <section className="px-4 md:px-6 py-16 md:py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,102,255,0.03),transparent)] pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[500px] bg-primary-DEFAULT/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-primary-light" />
              <span>INTELLIGENCE DOSSIER</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-white"><ScrambleText text="Capabilities" startDelay={500} /></span>
            </h2>
          </div>

          {/* Premium Tab Switcher - Scrollable on mobile */}
          <div className="flex-shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center backdrop-blur-md w-max">
                {[
                { id: 'features', label: 'Core Modules', icon: Cpu },
                { id: 'benefits', label: 'Performance Impact', icon: Activity }
                ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                    relative px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'}
                    `}
                >
                    {activeTab === tab.id && (
                    <motion.div
                        layoutId="dossierTab"
                        className="absolute inset-0 bg-primary-DEFAULT rounded-lg shadow-lg shadow-primary-DEFAULT/25"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    )}
                    <tab.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 font-mono tracking-wide whitespace-nowrap">{tab.label}</span>
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* FEATURES TAB */}
            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                {service.features.map((feature, index) => (
                  <TechPanel 
                    key={index}
                    className="bg-dark-surface/40 backdrop-blur-xl rounded-2xl hover:border-primary-DEFAULT/30 hover:shadow-[0_0_30px_rgba(0,102,255,0.1)] flex flex-col"
                  >
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="p-6 md:p-8 relative z-10 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-light group-hover:scale-110 group-hover:bg-primary-DEFAULT group-hover:text-white transition-all duration-300 shadow-inner">
                          <Layers className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] font-mono text-white/20 group-hover:text-primary-DEFAULT/50 transition-colors bg-white/5 px-2 py-1 rounded">
                          MOD_0{index + 1}
                        </span>
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed flex-grow">
                        {feature.description}
                      </p>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="h-px flex-1 bg-gradient-to-r from-primary-DEFAULT/50 to-transparent" />
                        <span className="text-[10px] font-mono text-primary-light uppercase">Active</span>
                      </div>
                    </div>
                  </TechPanel>
                ))}
              </motion.div>
            )}

            {/* BENEFITS TAB */}
            {activeTab === 'benefits' && (
              <motion.div
                key="benefits"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                {service.benefits.map((benefit, index) => {
                   // Parse metrics for highlighting
                   let number: string | null = null;
                   let text = benefit;
                   const startMatch = benefit.match(/^((?:up to )?[\d.,]+[%+]?(?:\/\d+)?)(.*)/i);
                   const middleMatch = benefit.match(/(.*)(\b(?:up to )?[\d.,]+[%+]?\b)(.*)/i);

                   if (startMatch && startMatch[1].length < 15) {
                     number = startMatch[1].trim();
                     text = startMatch[2].trim();
                   } else if (middleMatch && middleMatch[2].length < 15 && middleMatch[2].match(/\d/)) {
                      number = middleMatch[2].trim();
                      text = benefit; // Keep full text if in middle for context, but highlight card
                   }

                   // Determine if we should span columns for better layout
                   const isMetricCard = !!number;
                   
                   return (
                     <TechPanel 
                        key={index}
                        className={`
                          p-6 md:p-8 rounded-2xl bg-dark-surface/40 backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 hover:border-white/20
                          ${isMetricCard ? 'lg:col-span-2 bg-gradient-to-br from-white/5 to-transparent' : 'lg:col-span-1'}
                        `}
                     >
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02]" />
                        
                        {/* High-tech corners */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex items-center gap-3 mb-4 md:mb-6">
                              {isMetricCard 
                                ? <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"><Activity className="w-4 h-4 text-green-400" /></div>
                                : <div className="p-2 rounded-lg bg-primary-DEFAULT/10 border border-primary-DEFAULT/20"><CheckCircle2 className="w-4 h-4 text-primary-light" /></div>
                              }
                              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                                {isMetricCard ? 'Measured Impact' : 'Strategic Advantage'}
                              </span>
                           </div>

                           <div className="flex-1 flex flex-col justify-center">
                              {isMetricCard && (
                                <div className="mb-2 md:mb-4">
                                  <span className="text-4xl md:text-6xl font-bold text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                                    {number}
                                  </span>
                                </div>
                              )}
                              <p className={`text-base md:text-xl font-medium leading-relaxed ${isMetricCard ? 'text-gray-300' : 'text-white'}`}>
                                {text}
                              </p>
                           </div>

                           {/* Progress Bar Animation for metric cards */}
                           {isMetricCard && (
                             <div className="mt-6 md:mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 whileInView={{ width: "100%" }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="h-full bg-gradient-to-r from-green-500 to-primary-DEFAULT"
                               />
                             </div>
                           )}
                        </div>
                     </TechPanel>
                   );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
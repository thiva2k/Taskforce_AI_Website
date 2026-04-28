
import React from 'react';
import { motion } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { Database, Cpu, Zap, Search, PenTool, Rocket, Activity, RefreshCw, Layout, Layers, Shield, Network, Settings, Globe, BarChart, Smartphone, UserCheck, Key, FileCode } from 'lucide-react';
import { ServiceData } from '../../data/services';

interface ServiceWorkflowProps {
  workflow: ServiceData['workflow'];
}

// Extended Icon cycle for dynamic steps
const ICONS = [Search, PenTool, Network, Rocket, Activity, Smartphone, RefreshCw, Layout, Layers, Shield, Database, Cpu, Zap, Settings, Globe, BarChart, UserCheck, Key, FileCode];

export const ServiceWorkflow: React.FC<ServiceWorkflowProps> = ({ workflow }) => {
  if (!workflow) return null;

  return (
    <section className="px-6 mb-24 relative">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Workflow Architecture</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            <ScrambleText text="How It Works" startDelay={500} />
          </h2>
          <p className="text-gray-400 max-w-2xl text-lg">
            A systematic approach to deploying intelligence into your operations.
          </p>
        </div>

        <div className="relative">
          {/* Mobile connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-white/10 md:hidden" />

          {/* Responsive Grid Layout - Handles variable steps gracefully (3 columns for large screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
            {workflow.map((step, index) => {
              const Icon = ICONS[index % ICONS.length];
              
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex md:block h-full"
                >
                  {/* Mobile Step Indicator */}
                  <div className="md:hidden flex-shrink-0 w-16 flex justify-center pt-8 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-dark-bg border border-white/20 flex items-center justify-center text-xs font-mono font-bold text-primary-DEFAULT shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                      {index + 1}
                    </div>
                  </div>

                  <TechPanel 
                    className="flex-1 flex flex-col !p-8 !bg-dark-surface/40 !backdrop-blur-md border-white/10 group hover:border-primary-DEFAULT/30 transition-colors duration-500 h-full w-full rounded-2xl"
                    animateScan={false}
                  >
                    <div className="relative mb-6 flex justify-between items-start">
                      {/* Icon Container */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shrink-0">
                        <Icon className="w-8 h-8 text-white opacity-80 group-hover:text-primary-light transition-colors" />
                        <div className="absolute inset-0 bg-primary-DEFAULT/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                      </div>
                      
                      {/* Desktop Step Number */}
                      <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center text-sm font-mono font-bold text-gray-500 group-hover:text-white group-hover:border-primary-DEFAULT/50 transition-all shrink-0">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                    
                    {/* Decorative Bottom Bar */}
                    <div className="mt-auto pt-6">
                        <div className="h-0.5 w-8 bg-white/10 group-hover:w-full group-hover:bg-primary-DEFAULT/50 transition-all duration-700" />
                    </div>
                  </TechPanel>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

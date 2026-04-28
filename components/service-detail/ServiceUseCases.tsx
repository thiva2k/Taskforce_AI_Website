
import React from 'react';
import { motion } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { ServiceData } from '../../data/services';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ServiceUseCasesProps {
  service: ServiceData;
}

export const ServiceUseCases: React.FC<ServiceUseCasesProps> = ({ service }) => {
  return (
    <section className="px-6 py-24 relative z-10">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-DEFAULT/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        
        <div className="container mx-auto max-w-7xl relative">
            <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
                <div className="md:w-1/2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 text-primary-light text-xs font-mono uppercase tracking-widest mb-6"
                    >
                        <Target className="w-3 h-3" />
                        <span>Operational Applications</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Use Cases That <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            <ScrambleText text="Drive Action." startDelay={500} />
                        </span>
                    </motion.h2>
                </div>
                <div className="md:w-1/2 pt-2">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 leading-relaxed border-l-2 border-white/10 pl-6"
                    >
                        Real-world scenarios where {service.title} eliminates friction and accelerates growth. 
                        Deploy these configurations to solve specific operational headaches immediately.
                    </motion.p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.useCasesList.map((useCase, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <TechPanel 
                            className="p-8 border-white/5 hover:border-primary-DEFAULT/30 transition-colors duration-500 group h-full flex flex-col rounded-2xl"
                            animateScan={true}
                        >
                            <div className="flex items-start gap-6 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold text-gray-500 group-hover:text-primary-light group-hover:border-primary-DEFAULT/50 group-hover:bg-primary-DEFAULT/10 transition-all duration-300">
                                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors">
                                        {useCase.title}
                                    </h3>
                                </div>
                            </div>
                            
                            <p className="text-gray-400 leading-relaxed text-sm flex-1 pl-[4.5rem]">
                                {useCase.description}
                            </p>

                            <div className="mt-6 pl-[4.5rem] flex items-center gap-2 text-xs font-mono text-gray-600 group-hover:text-primary-light/70 transition-colors">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>DEPLOYABLE CONFIGURATION</span>
                            </div>
                            
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                 <ArrowRight className="w-5 h-5 text-primary-DEFAULT -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </TechPanel>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
};

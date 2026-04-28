import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Clock, Layers, Users, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

const challengesIcons = [
  { icon: Clock },
  { icon: Layers },
  { icon: Users },
  { icon: AlertTriangle }
];

export const Problem: React.FC = () => {
  const { t } = useTranslation();
  
  const challenges = challengesIcons.map((item, index) => ({
    ...item,
    title: t(`problem.challenges.${index}.title`),
    desc: t(`problem.challenges.${index}.desc`)
  }));

  return (
    <section id="process" className="py-32 relative snap-start">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
            <div className="lg:w-1/2">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-6"
                >
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        <Activity className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="font-mono text-red-400 text-xs tracking-widest uppercase">{t('problem.badge')}</span>
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    <Trans i18nKey="problem.title">
                        Legacy Operations <br />
                        <span className="text-gray-500">Are Failing You.</span>
                    </Trans>
                </h2>
            </div>
            <div className="lg:w-1/2 pt-4">
                <p className="text-xl text-gray-400 leading-relaxed">
                    {t('problem.description')}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((item, index) => (
            <GlassCard 
              key={index} 
              delay={index * 0.1} 
              className="group border-white/5 hover:border-red-500/30 transition-colors duration-500"
              enableParallax={true}
            >
              <div className="mb-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center group-hover:bg-red-500/10 transition-colors duration-500">
                <item.icon className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-red-100 transition-colors">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm group-hover:text-gray-400 transition-colors">{item.desc}</p>
              
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-red-500 group-hover:w-full transition-all duration-700 ease-out" />
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
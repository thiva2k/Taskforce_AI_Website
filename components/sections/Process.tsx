import React, { useEffect, useRef, useState } from 'react';
import { decode } from 'html-entities';
import {
  Search,
  PenTool,
  Network,
  Rocket,
  Activity,
  RefreshCw,
  ArrowRight,
  Zap,
  TrendingUp,
  LucideIcon
} from 'lucide-react';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { useTranslation } from 'react-i18next';
import { fetchHomePageAcf, fetchProcessSteps, WpProcessStep } from '../../lib/wordpress';

interface StepData {
  icon: LucideIcon;
  title: string;
  desc: string;
  highlight: string;
  stepNumber: string;
}

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  'pen-tool': PenTool,
  settings: PenTool,
  network: Network,
  link: Network,
  rocket: Rocket,
  activity: Activity,
  'trending-up': TrendingUp,
};

export const Process: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%']
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [header, setHeader] = useState({
    badge: t('process.subtitle'),
    title: "We Don't Just Build AI Automations - We Map, Design, Test, Deploy and Optimise Them.Here's How. ",
    description: t('process.description'),
  });

  const [steps, setSteps] = useState<StepData[]>([]);

  useEffect(() => {
    const loadProcess = async () => {
      try {
        const [homeAcf, processSteps] = await Promise.all([
          fetchHomePageAcf(),
          fetchProcessSteps(),
        ]);

        setHeader({
          badge: decode(homeAcf.process_section_badge || t('process.subtitle')),
          title: decode(homeAcf.process_section_title || "We Don't Just Build AI Automations - We Map, Design, Test, Deploy and Optimise Them.Here's How."),
          description: decode(homeAcf.process_section_description || t('process.description')),
        });

        const mappedSteps = processSteps
          .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
          .map((step: WpProcessStep, index) => ({
            icon: iconMap[step.acf?.icon_name?.toLowerCase?.() || ''] || Search,
            title: decode(step.title?.rendered || ''),
            desc: decode(step.acf?.short_description || ''),
            highlight: decode(step.acf?.small_label || ''),
            stepNumber: step.acf?.step_number || String(index + 1).padStart(2, '0'),
          }));

        setSteps(mappedSteps);
      } catch (error) {
        console.error('Failed to load process steps:', error);
      }
    };

    loadProcess();
  }, [t]);

  return (
    <section id="process" className="py-24 md:py-32 relative snap-start overflow-hidden">
      {/* Background Elements matching Hero style */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-primary-DEFAULT/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-secondary-DEFAULT/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10" ref={containerRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start md:items-end mb-20 md:mb-32">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-primary-DEFAULT/10 rounded-lg border border-primary-DEFAULT/20">
                <RefreshCw className="w-5 h-5 text-primary-light animate-[spin_10s_linear_infinite]" />
              </div>
              <span className="font-mono text-primary-light text-xs tracking-widest uppercase">
                {header.badge}
              </span>
            </motion.div>

{(() => {
  const splitIndex = header.title.indexOf("-");

  if (splitIndex === -1) {
    return (
      <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-white">
        {header.title}
      </h2>
    );
  }

  const main = header.title.substring(0, splitIndex).trim();
  const sub = header.title.substring(splitIndex + 1).trim();

  return (
    <div className="flex flex-col gap-3">
      
      {/* BIG PART */}
      <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-white">
        {main}
      </h2>

      {/* SMALL PART (BLUE) */}
      <h3 className="text-lg md:text-2xl font-semibold text-primary-light leading-relaxed">
        {sub}
      </h3>

    </div>
  );
})()}
          </div>

          <div className="lg:w-1/2 pb-2">
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed border-l-2 border-white/10 pl-6">
              {header.description}
            </p>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Vertical Timeline Line (Desktop) */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2 hidden md:block">
            <motion.div
              style={{ scaleY, originY: 0 }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary-DEFAULT via-accent to-secondary-DEFAULT w-full h-full shadow-[0_0_15px_rgba(0,102,255,0.5)]"
            />
          </div>

          {/* Mobile Line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-px bg-white/10 md:hidden">
            <motion.div
              style={{ scaleY, originY: 0 }}
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary-DEFAULT via-accent to-secondary-DEFAULT w-full h-full shadow-[0_0_15px_rgba(0,102,255,0.5)]"
            />
          </div>

          <div className="space-y-12 md:space-y-32 pb-24">
            {steps.map((step, index) => (
              <ProcessStep key={`${step.stepNumber}-${step.title}`} step={step} index={index} />
            ))}
          </div>

          {/* Final Node: Ongoing Support */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-20 mt-12 md:mt-20"
          >
            {/* Connector fade out */}
            <div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 -top-20 h-20 w-px bg-gradient-to-b from-secondary-DEFAULT to-transparent opacity-50" />

            <TechPanel className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 p-1 group hover:border-primary-DEFAULT/50 transition-colors duration-500 max-w-4xl mx-auto ml-16 md:ml-auto shadow-[0_0_40px_rgba(0,0,0,0.2)]" animateScan={true}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white/5 rounded-[1.8rem] p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-hidden">
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-DEFAULT/10 rounded-full blur-[80px]" />

                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform duration-500 shrink-0">
                  <div className="absolute inset-0 bg-primary-DEFAULT/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Zap className="w-8 h-8 md:w-10 md:h-10 text-primary-light relative z-10" />
                </div>

                <div className="flex-1 text-left z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono mb-4">
                    <Activity className="w-3 h-3" /> {t('process.final.status')}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white tracking-tight">
                    {t('process.final.title')}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-0 text-sm md:text-base">
                    {t('process.final.desc')}
                  </p>
                </div>

                <div className="z-10 hidden md:block">
                  <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary-light hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(0,102,255,0.4)]">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </TechPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface ProcessStepProps {
  step: StepData;
  index: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20% 0px -20% 0px', once: true });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col md:flex-row gap-4 md:gap-0 items-stretch relative min-h-[160px] md:min-h-[200px] ${!isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Connecting Line to Center */}
      <div className={`absolute top-1/2 hidden md:block w-20 h-px bg-gradient-to-r from-transparent via-primary-DEFAULT/50 to-transparent ${isEven ? 'right-[50%] translate-x-0' : 'left-[50%] translate-x-0'}`}>
        <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-light rounded-full shadow-[0_0_10px_rgba(0,102,255,0.8)] ${isEven ? 'right-0' : 'left-0'}`} />
      </div>

      {/* Content Side */}
      <div className={`md:w-1/2 pl-20 md:pl-0 flex items-center ${isEven ? 'md:pr-20 md:justify-end' : 'md:pl-20 md:justify-start'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <div className="group relative">
            {/* Card Background */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-DEFAULT/0 via-primary-DEFAULT/0 to-primary-DEFAULT/0 group-hover:via-primary-DEFAULT/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md" />

            <div className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden hover:border-white/10 transition-colors duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-[1px] border-l-[1px] border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-[1px] border-r-[1px] border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[1px] border-l-[1px] border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1px] border-r-[1px] border-primary-DEFAULT/30 group-hover:border-primary-DEFAULT transition-colors duration-300 rounded-br-sm" />

              {/* Step Number Watermark */}
              <div className="absolute -right-4 -top-4 text-[5rem] md:text-[8rem] font-bold text-white/[0.02] pointer-events-none select-none font-mono tracking-tighter leading-none">
                {step.stepNumber}
              </div>

              {/* Highlight Tag */}
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="h-px w-6 md:w-8 bg-primary-DEFAULT" />
                <span className="text-primary-light text-[10px] md:text-xs font-mono uppercase tracking-wider">
                  {step.highlight}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 group-hover:text-primary-light transition-colors tracking-tight">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Center Node */}
      <div className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-14 flex items-center justify-center z-20 pointer-events-none">
        <motion.div
          animate={isInView ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-14 h-14 flex items-center justify-center"
        >
          {/* Outer Pulse */}
          <div className={`absolute inset-0 rounded-full border border-primary-DEFAULT/30 ${isInView ? 'animate-ping opacity-20' : 'opacity-0'}`} />

          {/* Main Node Circle */}
          <div className={`w-12 h-12 rounded-full bg-dark-bg border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${isInView ? 'border-primary-DEFAULT shadow-[0_0_25px_rgba(0,102,255,0.6)] bg-primary-DEFAULT' : 'border-white/10 bg-dark-surface'}`}>
            <step.icon className={`w-5 h-5 transition-colors duration-500 ${isInView ? 'text-white' : 'text-gray-600'}`} />
          </div>

          {/* Connector Dots */}
          {isInView && (
            <div className={`absolute w-20 h-px bg-primary-DEFAULT/50 top-1/2 -translate-y-1/2 ${isEven ? 'right-full mr-2 bg-gradient-to-l' : 'left-full ml-2 bg-gradient-to-r'} from-primary-DEFAULT to-transparent hidden md:block`} />
          )}
        </motion.div>
      </div>

      {/* Empty Side */}
      <div className="hidden md:block md:w-1/2" />
    </motion.div>
  );
};
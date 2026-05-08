import React, { useEffect, useRef, useState } from 'react';
import { decode } from 'html-entities';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  Bot,
  Headphones,
  FileText,
  BarChart3,
  Code2,
  AppWindow,
  LucideIcon
} from 'lucide-react';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { useTranslation } from 'react-i18next';
import { fetchServices, parseCommaList, WpService } from '../../lib/wordpress';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    filter: 'blur(5px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  }
};

interface HomeServiceCard {
  id: string;
  title: string;
  icon: LucideIcon;
  shortDesc: string;
  useCasesList: string[];
  buttonText: string;
  buttonLink: string;
  statusText: string;
  unitCode: string;
  order: number;
}

const iconMap: Record<string, LucideIcon> = {
  briefcase: Bot,
  bot: Bot,
  mic: Headphones,
  headphones: Headphones,
  file: FileText,
  filetext: FileText,
  chart: BarChart3,
  code: Code2,
  app: AppWindow,
};

export const Services: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [servicesData, setServicesData] = useState<HomeServiceCard[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await fetchServices();

        const mapped = services
          .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
          .map((service: WpService, index) => {
            const isBookingAgents =
              service.slug === 'ai-booking-agents' ||
              decode(service.title.rendered).toLowerCase().includes('booking agent');

            return {
              id: isBookingAgents ? 'ai-booking-agents' : service.slug,
              title: decode(service.title.rendered),
              icon: iconMap[service.acf?.icon_name?.toLowerCase?.() || ''] || Bot,
              shortDesc: service.acf?.short_description || '',
              useCasesList: parseCommaList(service.acf?.top_use_cases).slice(0, 3),
              buttonText: service.acf?.button_text || t('services.full_spec'),
              buttonLink: isBookingAgents
                ? '/service/ai-booking-agents'
                : service.acf?.button_link || `/service/${service.slug}`,
              statusText: service.acf?.status_text || t('services.online'),
              unitCode: service.acf?.unit_code || `UNIT-${String(index + 1).padStart(2, '0')}`,
              order: service.menu_order ?? index + 1,
            };
          });

        setServicesData(mapped);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };

    loadServices();
  }, [t]);

  const handleNavigate = (link: string) => {
    if (!link) return;

    if (link.startsWith('http') || link.startsWith('mailto:')) {
      window.location.href = link;
      return;
    }

    navigate(link);
  };

  return (
    <section id="solutions" className="py-24 md:py-32 relative snap-start z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[100%] bg-primary-DEFAULT/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent font-mono text-xs tracking-[0.2em] uppercase">
                {t('services.subtitle')}
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              {t('services.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-white">
                <ScrambleText text={t('services.scramble_text')} startDelay={500} />
              </span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-5 bg-[#0A0A0A] px-6 py-3 rounded-full border border-white/10 mt-4 md:mt-0 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group relative overflow-hidden w-full md:w-auto justify-center md:justify-start"
          >
            <div className="absolute inset-0 rounded-full border border-primary-DEFAULT/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/5 to-transparent -skew-x-12 animate-[shimmer_3s_infinite]" />

            <div className="flex gap-3 items-center relative z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <Activity className="w-4 h-4 text-primary-light" />
            </div>

            <div className="flex flex-col relative z-10">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1.5 font-medium">
                {t('services.status_label')}
              </span>
              <span className="text-xs font-mono font-bold text-white leading-none tracking-wide">
                {t('services.status_value')} ({servicesData.length})
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {servicesData.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onNavigate={handleNavigate}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: HomeServiceCard;
  index: number;
  onNavigate: (link: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onNavigate }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['2.5deg', '-2.5deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-2.5deg', '2.5deg']);

  const spotlightX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const spotlightY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const xPct = (touch.clientX - rect.left) / rect.width - 0.5;
    const yPct = (touch.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      className="relative h-full group cursor-pointer z-10 perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
      onMouseLeave={handleLeave}
      onClick={() => onNavigate(service.buttonLink)}
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="h-full"
      >
        <TechPanel
          className="relative h-full bg-[#0A0A0A]/60 backdrop-blur-2xl border-white/5 rounded-3xl p-6 md:p-8 overflow-hidden transition-all duration-300 group-hover:border-primary-DEFAULT/50 group-hover:shadow-[0_20px_40px_rgba(0,102,255,0.15)] flex flex-col"
          animateScan={false}
        >
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-0"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  600px circle at ${spotlightX} ${spotlightY},
                  rgba(0, 102, 255, 0.1),
                  transparent 80%
                )
              `,
            }}
          />

          <div className="relative z-10 flex flex-col h-full transform-gpu translate-z-[20px]">
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary-DEFAULT/20 group-hover:border-primary-DEFAULT/50 transition-all duration-500 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] group-hover:scale-105">
                <service.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-light group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/5 border border-green-500/10">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  <span className="text-[9px] font-mono text-green-500 font-bold uppercase tracking-widest">
                    {service.statusText || t('services.online')}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-white/30 group-hover:text-white/70 transition-colors px-2 py-0.5">
                  {service.unitCode || `UNIT-${index < 9 ? `0${index + 1}` : index + 1}`}
                </span>
              </div>
            </div>

<h2 className="
  text-3xl md:text-4xl
  font-bold mb-4
  text-white tracking-tight leading-tight
  group-hover:text-transparent 
  group-hover:bg-clip-text 
  group-hover:bg-gradient-to-r 
  group-hover:from-white 
  group-hover:to-primary-light 
  transition-all duration-300
">
  {service.title}
</h2>

            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 group-hover:text-gray-300 transition-colors font-light">
              {service.shortDesc}
            </p>

            <div className="flex flex-col gap-2 mb-8 mt-auto">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">
                Top Use Cases
              </span>

              {service.useCasesList.slice(0, 3).map((useCase, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors">
                  <div className="w-1 h-1 rounded-full bg-primary-DEFAULT group-hover:shadow-[0_0_5px_#0066FF]" />
                  <span className="truncate">{useCase}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between group/btn">
          <motion.div
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.95 }}
  className="
    relative px-4 py-2 md:px-5 md:py-2.5
    rounded-full
    font-bold text-xs md:text-sm
    flex items-center gap-2
    cursor-pointer
    overflow-hidden
    transition-all duration-300
    text-white

    bg-gradient-to-r 
    from-[#0066FF] 
    via-[#3B82F6] 
    to-[#60A5FA]

    shadow-[0_0_12px_rgba(0,102,255,0.35)]
    hover:shadow-[0_0_25px_rgba(0,102,255,0.7)]
  "
>
  {/* 🔵 Soft inner glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)] opacity-0 hover:opacity-100 transition duration-500" />

  {/* ✨ Moving shine */}
  <div className="absolute inset-0 -skew-x-12 translate-x-[-150%] hover:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

  {/* TEXT */}
  <span className="relative z-10 flex items-center gap-2 tracking-wide">
    {service.buttonText || t('services.full_spec')}
    <ArrowRight className="w-4 h-4" />
  </span>
</motion.div>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-primary-DEFAULT group-hover:border-primary-DEFAULT group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,102,255,0.4)]">
                <ArrowRight className="w-5 h-5 -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </TechPanel>
      </motion.div>
    </motion.div>
  );
};
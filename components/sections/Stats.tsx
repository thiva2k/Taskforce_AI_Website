import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TechPanel } from '../ui/TechPanel';
import { fetchStats, WpStat } from '../../lib/wordpress';

const AnimatedCounter = ({ value }: { value: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const match = value.match(/(\d+)(.*)/);
  const number = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';

  const [displayString, setDisplayString] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      if (progress < 1) {
        const currentVal = Math.floor(ease * number);
        if (Math.random() > 0.7) {
          setDisplayString(`${Math.floor(Math.random() * Math.max(number, 1))}${suffix}`);
        } else {
          setDisplayString(`${currentVal}${suffix}`);
        }
        window.requestAnimationFrame(step);
      } else {
        setDisplayString(`${number}${suffix}`);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, number, suffix]);

  return <span ref={ref} className="font-mono">{displayString}</span>;
};

interface StatItem {
  value: string;
  label: string;
  sub: string;
  order: number;
}

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const wpStats = await fetchStats();

        const mapped = wpStats
          .sort((a: WpStat, b: WpStat) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
          .map((stat: WpStat) => ({
            value: stat.acf?.value || '',
            label: stat.acf?.title_text || '',
            sub: stat.acf?.subtitle || '',
            order: stat.menu_order ?? 0,
          }));

        setStats(mapped);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <section id="results" className="py-24 md:py-32 relative overflow-hidden snap-start">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-no-repeat bg-contain contrast-0 brightness-200 invert" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(0,102,255,0.1)_360deg)] animate-[spin_10s_linear_infinite] rounded-full scale-150" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <TechPanel
                key={`${stat.order}-${stat.label}`}
                className="relative p-6 md:p-8 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl border-white/5 group overflow-hidden hover:border-primary-DEFAULT/30 hover:shadow-[0_0_30px_rgba(0,102,255,0.1)] transition-all duration-500"
                animateScan={false}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tighter"
                  >
                    <AnimatedCounter value={stat.value} />
                  </motion.div>
                  <div className="text-primary-light font-mono text-xs uppercase tracking-widest mb-2">
                    {stat.label}
                  </div>
                  <div className="text-gray-500 text-xs border-t border-white/5 pt-2 inline-block px-4">
                    {stat.sub}
                  </div>
                </div>
              </TechPanel>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
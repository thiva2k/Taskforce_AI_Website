import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlitchButton } from '../ui/GlitchButton';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchHomePageAcf, parseCtaContent } from '../../lib/wordpress';

interface CtaContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export const CTA: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const trustIndicators = [
    t('cta.trust_indicators.0'),
    t('cta.trust_indicators.1'),
    t('cta.trust_indicators.2')
  ];

  const fallbackContent: CtaContent = {
    badge: t('cta.badge'),
    title: 'Ready to deploy your AI Workforce?',
    description: t('cta.description'),
    buttonText: t('cta.button'),
    buttonLink: '/book-demo',
  };

  const [ctaContent, setCtaContent] = useState<CtaContent>(fallbackContent);

  useEffect(() => {
    const loadCta = async () => {
      try {
        const acf = await fetchHomePageAcf();
        const parsed = parseCtaContent(acf.cta_content);

        setCtaContent({
          badge: parsed.badge || fallbackContent.badge,
          title: parsed.title || fallbackContent.title,
          description: parsed.description || fallbackContent.description,
          buttonText: parsed.buttonText || fallbackContent.buttonText,
          buttonLink: acf.cta_button_link || fallbackContent.buttonLink,
        });
      } catch (error) {
        console.error('Failed to load CTA:', error);
      }
    };

    loadCta();
  }, [fallbackContent.badge, fallbackContent.buttonLink, fallbackContent.buttonText, fallbackContent.description, fallbackContent.title]);

  const handleCtaClick = () => {
    if (!ctaContent.buttonLink) return;

    if (ctaContent.buttonLink.startsWith('http') || ctaContent.buttonLink.startsWith('mailto:')) {
      window.location.href = ctaContent.buttonLink;
      return;
    }

    navigate(ctaContent.buttonLink);
  };

  return (
    <section id="cta" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary-DEFAULT/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative group"
        >
          <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-primary-DEFAULT/40 to-transparent rounded-[2rem] md:rounded-[3rem] opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative rounded-[2rem] md:rounded-[3rem] bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/5 overflow-hidden p-8 md:p-24 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-b from-primary-DEFAULT/10 to-transparent blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 md:mb-8 shadow-lg"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] md:text-xs font-mono font-medium text-gray-300 uppercase tracking-widest">
                  {ctaContent.badge}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 tracking-tighter leading-[1.1]">
                {ctaContent.title}
              </h2>

              <p className="text-base md:text-xl text-gray-400 mb-10 md:mb-12 max-w-2xl leading-relaxed font-light">
                {ctaContent.description}
              </p>

              <div className="flex flex-col items-center gap-4 mb-12 md:mb-16 w-full">
                <GlitchButton
                  className="min-h-[3.5rem] h-auto px-6 md:px-10 py-4 text-base md:text-lg font-semibold shadow-[0_0_40px_rgba(0,102,255,0.3)] hover:shadow-[0_0_60px_rgba(0,102,255,0.5)] bg-gradient-to-r from-primary-DEFAULT to-accent border-0 w-full md:w-auto justify-center whitespace-normal text-center leading-tight hover:scale-[1.02] transition-transform duration-300"
                  onClick={handleCtaClick}
                >
                  {ctaContent.buttonText}
                </GlitchButton>
                <p className="text-[10px] md:text-xs text-gray-500 font-mono tracking-wide">
                  {t('cta.subtext')}
                </p>
              </div>

              <div className="w-full pt-8 md:pt-10 border-t border-white/5 flex flex-wrap justify-center gap-4 md:gap-16">
                {trustIndicators.map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3 group/tag cursor-default">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary-DEFAULT/10 border border-primary-DEFAULT/30 flex items-center justify-center group-hover/tag:bg-primary-DEFAULT/20 group-hover/tag:border-primary-DEFAULT/50 transition-all duration-300 shadow-[0_0_10px_rgba(0,102,255,0.2)]">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-light" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-400 font-mono group-hover/tag:text-white transition-colors">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
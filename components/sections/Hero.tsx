import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ScrambleText } from '../ui/ScrambleText';
import { GlitchButton } from '../ui/GlitchButton';
//import { SystemLog } from '../ui/SystemLog';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchHomePageAcf } from '../../lib/wordpress';


interface HeroContent {
  badge: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const navigate = useNavigate();

  const fallbackContent: HeroContent = {
    badge: t('hero.badge'),
    title: `We build ${t('hero.scramble_text')} for Every Organization.`,
    description: t('hero.intro'),
    primaryButtonText: t('hero.cta.book'),
    primaryButtonLink: '/book-demo',
    secondaryButtonText: t('hero.cta.contact'),
    secondaryButtonLink: '/contact',
  };

  const [heroContent, setHeroContent] = useState<HeroContent>(fallbackContent);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const acf = await fetchHomePageAcf();

        setHeroContent({
          badge: acf.hero_badge || fallbackContent.badge,
          title: acf.hero_title || fallbackContent.title,
          description: acf.hero_description || fallbackContent.description,
          primaryButtonText:
            acf.hero_primary_button_text || fallbackContent.primaryButtonText,
          primaryButtonLink:
            acf.hero_primary_button_link || fallbackContent.primaryButtonLink,
          secondaryButtonText:
            acf.hero_secondary_button_text || fallbackContent.secondaryButtonText,
          secondaryButtonLink:
            acf.hero_secondary_button_link || fallbackContent.secondaryButtonLink,
        });
      } catch (error) {
        console.error('Failed to load hero content:', error);
      }
    };

    loadHero();
  }, [fallbackContent.badge, fallbackContent.description, fallbackContent.primaryButtonLink, fallbackContent.primaryButtonText, fallbackContent.secondaryButtonLink, fallbackContent.secondaryButtonText, fallbackContent.title]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX - innerWidth / 2);
      mouseY.set(e.clientY - innerHeight / 2);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const { innerWidth, innerHeight } = window;
      const touch = e.touches[0];
      mouseX.set(touch.clientX - innerWidth / 2);
      mouseY.set(touch.clientY - innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mouseX, mouseY]);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-500, 500], [2, -2]);
  const rotateY = useTransform(x, [-500, 500], [-2, 2]);

  const headingRotateX = useTransform(y, [-500, 500], [10, -10]);
  const headingRotateY = useTransform(x, [-500, 500], [-10, 10]);
  const headingX = useTransform(x, [-500, 500], [-20, 20]);
  const headingY = useTransform(y, [-500, 500], [-20, 20]);

  const contentX = useTransform(x, [-500, 500], [-10, 10]);
  const contentY = useTransform(y, [-500, 500], [-10, 10]);

  const handleLink = (link: string) => {
    if (!link) return;

    if (link.startsWith('mailto:') || link.startsWith('http')) {
      window.location.href = link;
      return;
    }

    navigate(link);
  };

  const titleParts = useMemo(() => {
    const match = heroContent.title.match(/^(We build)\s+(Multi-language AI Agents)\s+(for.*)$/i);

    if (!match) return null;

    return {
      prefix: match[1],
      highlight: match[2],
      suffix: match[3],
    };
  }, [heroContent.title]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-36 md:pb-24 snap-start perspective-[1000px]">
      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center perspective-origin-center transform-style-3d">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ rotateX, rotateY }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0)' }}
            animate={{
              opacity: 1,
              scale: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              transition: { duration: 0.5, delay: 0.2 }
            }}
            whileHover={{
              scale: 1.05,
              borderColor: 'rgba(6, 182, 212, 0.5)',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
              transition: { duration: 0.2, delay: 0 }
            }}
            whileTap={{ scale: 0.95 }}
            style={{ x: contentX, y: contentY }}
            className="relative overflow-hidden inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 backdrop-blur-md mb-8 md:mb-10 group cursor-default max-w-[95vw] sm:max-w-none mx-auto"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[10px] xs:text-xs md:text-sm font-medium text-white group-hover:text-white transition-all duration-300 truncate relative z-10 drop-shadow-[0_0_8px_rgba(96,165,250,0.7)] group-hover:drop-shadow-[0_0_18px_rgba(96,165,250,1)]">
              {heroContent.badge}
            </span>
            <Zap className="w-3 h-3 text-accent group-hover:text-white transition-colors shrink-0 relative z-10" />
          </motion.div>

          {/*<motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute right-4 bottom-24 md:right-10 md:bottom-32 hidden lg:block"
          >
            <SystemLog />
          </motion.div> */}

          <motion.h1
            style={{
              rotateX: headingRotateX,
              rotateY: headingRotateY,
              x: headingX,
              y: headingY
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 md:mb-8 leading-[1.1] md:leading-[1.1] max-w-[90vw] md:max-w-5xl mx-auto"
          >
            {titleParts ? (
              <>
                {titleParts.prefix} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-accent relative inline-block pb-1 md:pb-2">
                  <ScrambleText text={titleParts.highlight} startDelay={500} />
                  <motion.span
                    className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-DEFAULT to-transparent opacity-50 blur-sm"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </span>
                <br />
                {titleParts.suffix}
              </>
            ) : (
              heroContent.title
            )}
          </motion.h1>

          <motion.p
            style={{ x: contentX, y: contentY }}
            className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-[90vw] md:max-w-3xl mx-auto leading-relaxed"
          >
            {heroContent.description}
          </motion.p>

          <motion.div
            style={{ x: contentX, y: contentY }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-6 sm:px-0"
          >
            <GlitchButton
              className="w-full sm:w-auto px-6 py-4 md:px-8 md:py-4 text-sm sm:text-base md:text-lg justify-center whitespace-normal text-center h-auto min-h-[50px]"
              onClick={() => handleLink(heroContent.primaryButtonLink)}
            >
              {heroContent.primaryButtonText}
            </GlitchButton>

            <GlitchButton
              variant="secondary"
              className="w-full sm:w-auto px-6 py-4 md:px-8 md:py-4 text-sm sm:text-base md:text-lg justify-center whitespace-normal text-center h-auto min-h-[50px]"
              onClick={() => handleLink(heroContent.secondaryButtonLink)}
            >
              {heroContent.secondaryButtonText}
            </GlitchButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

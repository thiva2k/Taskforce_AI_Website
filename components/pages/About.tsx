import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Zap, Target, Globe, Cpu, ArrowRight, CheckCircle2, Fingerprint } from 'lucide-react';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';
import { aboutPageSchema } from '../../lib/schema';
import { useNavigate } from 'react-router-dom';
import { ScrambleText } from '../ui/ScrambleText';
import { TechPanel } from '../ui/TechPanel';
import { GlitchButton } from '../ui/GlitchButton';
import { useTranslation } from 'react-i18next';
import { Team } from '../sections/Team';


interface AboutAcfData {
  section_tagline?: string;
  main_heading?: string;
  headquarters_description?: string;
  company_overview?: string;

  augmentation_title?: string;
  augmentation_description?: string;
  augmentation_points?: string;

  core1_title?: string;
  core1_desc?: string;
  core2_title?: string;
  core2_desc?: string;
  core3_title?: string;
  core3_desc?: string;

  stat1_label?: string;
  stat1_value?: string;
  stat2_label?: string;
  stat2_value?: string;
  stat3_label?: string;
  stat3_value?: string;
  stat4_label?: string;
  stat4_value?: string;

  cta_title?: string;
  cta_button1?: string;
  cta_button2?: string;
  cta_buttonlink1?: string;
  cta_buttonlink2?: string;
}

interface WpPageResponse {
  acf?: AboutAcfData;
}

const decodeHtml = (text: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
};

export const About: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [aboutData, setAboutData] = useState<AboutAcfData>({
    section_tagline: t('about.architects'),
    main_heading: 'We Build the Autonomous Future.',
    headquarters_description: t('about.hero_desc'),
    company_overview: t('about.team_intro'),

    augmentation_title: 'Augmentation, Not Replacement.',
    augmentation_description:
      "The narrative of AI replacing humans is fundamentally flawed. We see a future where AI handles the data processing, the scheduling, and the routine logic—liberating humans to focus on strategy, empathy, and creative problem-solving.\n\nOur agents don't just perform tasks; they integrate into your team structure. They have names, roles, and accountability. We are building the first generation of digital employees that work alongside you, not just for you.",
    augmentation_points:
      'Enterprise-Grade Security (SOC-2 Type II), Seamless Human-in-the-Loop Handoffs, Ethical AI Frameworks',

    core1_title: 'Sovereignty First',
    core1_desc:
      'Your data is your asset. We engineer our agents with strict isolation protocols, ensuring your intelligence never leaks into public models.',
    core2_title: 'Outcome Obsessed',
    core2_desc:
      "We don't sell 'AI tools'. We sell hours saved, revenue generated, and error rates reduced. If it doesn't drive ROI, we don't build it.",
    core3_title: 'Velocity Matters',
    core3_desc:
      "The market doesn't wait. We deploy production-ready agents in days, not months, using our proprietary modular architecture.",

    stat1_label: 'Headquarters',
    stat1_value: 'Colombo, Sri Lanka',
    stat2_label: 'Operations',
    stat2_value: 'Global',
    stat3_label: 'Active Clients',
    stat3_value: '500+',
    stat4_label: 'Tasks Processed',
    stat4_value: '1B+',

    cta_title: 'Ready to evolve your workforce?',
    cta_button1: 'Demo Our Voice Agents Now',
    cta_button2: 'Contact Sales',
    cta_buttonlink1: '/book-demo',
    cta_buttonlink2: '/contact',
  });

  useEffect(() => {
    const fetchAboutPage = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;
        const response = await fetch(`${wpApi}/pages?slug=about`);

        if (!response.ok) {
          throw new Error(`Failed to fetch about page: ${response.status}`);
        }

        const data: WpPageResponse[] = await response.json();

        if (data.length > 0 && data[0].acf) {
          const acf = data[0].acf;

          setAboutData({
            section_tagline: decodeHtml(acf.section_tagline || t('about.architects')),
            main_heading: decodeHtml(acf.main_heading || 'We Build the Autonomous Future.'),
            headquarters_description: decodeHtml(acf.headquarters_description || t('about.hero_desc')),
            company_overview: decodeHtml(acf.company_overview || t('about.team_intro')),

            augmentation_title: decodeHtml(acf.augmentation_title || 'Augmentation, Not Replacement.'),
            augmentation_description: decodeHtml(acf.augmentation_description || ''),
            augmentation_points: decodeHtml(acf.augmentation_points || ''),

            core1_title: decodeHtml(acf.core1_title || ''),
            core1_desc: decodeHtml(acf.core1_desc || ''),
            core2_title: decodeHtml(acf.core2_title || ''),
            core2_desc: decodeHtml(acf.core2_desc || ''),
            core3_title: decodeHtml(acf.core3_title || ''),
            core3_desc: decodeHtml(acf.core3_desc || ''),

            stat1_label: decodeHtml(acf.stat1_label || ''),
            stat1_value: decodeHtml(acf.stat1_value || ''),
            stat2_label: decodeHtml(acf.stat2_label || ''),
            stat2_value: decodeHtml(acf.stat2_value || ''),
            stat3_label: decodeHtml(acf.stat3_label || ''),
            stat3_value: decodeHtml(acf.stat3_value || ''),
            stat4_label: decodeHtml(acf.stat4_label || ''),
            stat4_value: decodeHtml(acf.stat4_value || ''),

            cta_title: decodeHtml(acf.cta_title || ''),
            cta_button1: decodeHtml(acf.cta_button1 || ''),
            cta_button2: decodeHtml(acf.cta_button2 || ''),
            cta_buttonlink1: acf.cta_buttonlink1 || '/book-demo',
            cta_buttonlink2: acf.cta_buttonlink2 || '/contact',
          });
        }
      } catch (error) {
        console.error('Error fetching about page:', error);
      }
    };

    fetchAboutPage();
  }, [t]);

  const augmentationParagraphs = aboutData.augmentation_description
    ? aboutData.augmentation_description
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const augmentationPoints = aboutData.augmentation_points
    ? aboutData.augmentation_points
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const coreValues = [
    {
      icon: Shield,
      title: aboutData.core1_title,
      desc: aboutData.core1_desc,
    },
    {
      icon: Target,
      title: aboutData.core2_title,
      desc: aboutData.core2_desc,
    },
    {
      icon: Zap,
      title: aboutData.core3_title,
      desc: aboutData.core3_desc,
    },
  ];

  const stats = [
    { label: aboutData.stat1_label, val: aboutData.stat1_value },
    { label: aboutData.stat2_label, val: aboutData.stat2_value },
    { label: aboutData.stat3_label, val: aboutData.stat3_value },
    { label: aboutData.stat4_label, val: aboutData.stat4_value },
  ];

  const handleNavigate = (link?: string) => {
    if (!link) return;

    if (link.startsWith('http') || link.startsWith('mailto:')) {
      window.location.href = link;
      return;
    }

    navigate(link);
  };

  const renderMainHeading = (heading?: string) => {
    if (!heading) return null;

    const words = heading.trim().split(' ');
    if (words.length < 2) return heading;

    const prefix = words.slice(0, -2).join(' ');
    const highlight = words.slice(-2).join(' ');

    return (
      <>
        {prefix} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-accent">
          <ScrambleText text={highlight} startDelay={500} />
        </span>
      </>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white relative">
      <SEO
        title={t('about.title')}
        description={t('about.desc')}
        url="/about"
        schema={aboutPageSchema('About Us', '/about', t('about.desc'))}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary-DEFAULT/5 to-transparent" />
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-secondary-DEFAULT/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 pt-32 md:pt-40 pb-20">
        <section className="container mx-auto px-6 mb-24 md:mb-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-accent mb-6 backdrop-blur-md"
            >
              <Users className="w-3 h-3" />
              <span>{aboutData.section_tagline}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-none"
            >
              {renderMainHeading(aboutData.main_heading)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              {aboutData.headquarters_description}
            </motion.p>
          </div>
        </section>

        <section className="container mx-auto px-6 mb-32">
          <TechPanel className="rounded-3xl p-8 md:p-12 relative overflow-hidden" animateScan={true}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Fingerprint className="w-96 h-96 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 text-xs font-mono text-primary-light mb-6">
                  <Shield className="w-3 h-3" />
                  <span>IDENTITY VERIFIED</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter loading-none">
                  {t('about.who_we_are')}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary-DEFAULT to-transparent mt-6 rounded-full" />
              </div>

              <div className="lg:col-span-8">
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light mb-8">
                  {aboutData.company_overview}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2 text-primary-light/80">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono tracking-wider">OPERATIONAL BASES</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['LONDON', 'MUSCAT', 'SRI LANKA'].map((base) => (
                      <div key={base} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded overflow-hidden group hover:border-primary-DEFAULT/30 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-white/80">{base}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TechPanel>
        </section>

        <Team />

        <section className="container mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/20 to-secondary-DEFAULT/20 blur-3xl rounded-full opacity-50" />
              <TechPanel className="relative rounded-3xl overflow-hidden border-white/10 shadow-2xl bg-[#0A0A0A]" animateScan={true}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-primary-DEFAULT/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border border-accent/30 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                        <Cpu className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between gap-4">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1">
                      <div className="text-2xl font-bold text-white mb-1">100M+</div>
                      <div className="text-xs text-gray-400 font-mono uppercase">{t('about.stats.automating')}</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex-1">
                      <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                      <div className="text-xs text-gray-400 font-mono uppercase">{t('about.stats.accuracy')}</div>
                    </div>
                  </div>
                </div>
              </TechPanel>
            </motion.div>

            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                {aboutData.augmentation_title?.includes(',') ? (
                  <>
                    {aboutData.augmentation_title.split(',')[0]},
                    <br />
                    <span className="text-gray-500">
                      {aboutData.augmentation_title.split(',').slice(1).join(',').trim()}
                    </span>
                  </>
                ) : (
                  aboutData.augmentation_title
                )}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-6 text-gray-400 text-lg leading-relaxed"
              >
                {augmentationParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}

                <div className="relative z-10 pt-4 flex flex-col gap-4">
                  <TechPanel className="rounded-xl p-4 bg-black/60 border-primary-DEFAULT/20">
                    {augmentationPoints.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <div className="p-1 rounded-full bg-primary-DEFAULT/20 text-primary-light">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-white text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </TechPanel>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-xs tracking-widest uppercase">
              Operating Principles
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
              Our Core Code
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {coreValues.map((value, i) => (
              <TechPanel key={i} className="p-8 group hover:border-primary-DEFAULT/30 rounded-2xl" animateScan={true}>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-DEFAULT/20 group-hover:text-white transition-all duration-300">
                  <value.icon className="w-6 h-6 text-gray-400 group-hover:text-primary-light transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {value.desc}
                </p>
              </TechPanel>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 mb-32 relative">
          <TechPanel className="rounded-[2.5rem] bg-[#0F1115] overflow-hidden relative" animateScan={false}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="p-10 text-center hover:bg-white/[0.02] transition-colors group">
                  <div className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2 group-hover:text-primary-light transition-colors">
                    {stat.label}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          </TechPanel>
        </section>

        <section className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              {aboutData.cta_title}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlitchButton
                onClick={() => handleNavigate(aboutData.cta_buttonlink1)}
                className="w-full sm:w-auto px-8 py-4 justify-center"
              >
                {aboutData.cta_button1}
              </GlitchButton>

              <button
                onClick={() => handleNavigate(aboutData.cta_buttonlink2)}
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all w-full sm:w-auto justify-center"
              >
                {aboutData.cta_button2} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
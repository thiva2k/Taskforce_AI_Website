import React from 'react';
import { Facebook, Linkedin, Instagram, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServicesData } from '../../hooks/useServicesData';

const logoWordmark = new URL(
  '../../Logo_Files/Taskforce Ai logo - Name Horizontal/Taskforce-Ai-logo---Name-Horizontal-reverse.png',
  import.meta.url
).href;

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const servicesData = useServicesData();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const companyLinks = [
    { label: t('footer.links.about'), path: '/about' },
    { label: t('footer.links.blog'), path: '/blog' },
    { label: t('footer.links.contact'), path: '/contact' },
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      url: 'https://web.facebook.com/ForcAi',
      icon: Facebook,
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/company/taskforceai-tech/',
      icon: Linkedin,
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/taskforce.ai.tech?igsh=cWt0NjRja3k5eThz',
      icon: Instagram,
    },
  ];

  return (
    <footer className="relative bg-black pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden border-t border-white/5">
      {/* Background */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-primary-DEFAULT/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* GRID FIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 lg:gap-8 mb-12 md:mb-20">
          {/* BRAND */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src={logoWordmark}
              alt="TaskForce AI"
              className="h-7 md:h-8 w-auto mb-4"
            />

            <p className="text-gray-500 leading-relaxed mb-6 md:mb-8 max-w-sm text-sm">
              {t('footer.description')}
            </p>

            <div className="flex gap-3">
              {socialLinks.map(({ label, url, icon: Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-semibold mb-4 md:mb-6 text-sm tracking-wide">
              {t('footer.ai_agents')}
            </h4>

            <ul className="space-y-2 md:space-y-3">
              {servicesData.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/service/${service.id}`}
                    className="text-gray-500 hover:text-white transition-colors text-xs md:text-sm block hover:translate-x-1 duration-300"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-10">
            <h4 className="text-white font-semibold mb-6 md:mb-8 text-sm tracking-wide">
              {t('footer.company')}
            </h4>

            <ul className="space-y-4 md:space-y-5">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-white transition-colors text-xs md:text-sm block hover:translate-x-1 duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-600 text-[10px] md:text-xs flex flex-col md:flex-row gap-1 md:gap-4 text-center md:text-left items-center">
            <span>© 2025/2026 TaskForce AI Inc.</span>
            <span className="hidden md:inline text-gray-800">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {t('footer.all_systems_nominal')}
            </span>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[10px] md:text-xs text-gray-500 hover:text-primary-light transition-colors pl-4 border-l border-white/5"
            >
              {t('footer.top')}
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
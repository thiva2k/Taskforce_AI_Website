

import React from 'react';
import { Twitter, Linkedin, Github, ArrowUp, Send, Disc } from 'lucide-react';
const logoWordmark = new URL('../../Logo_Files/Taskforce Ai logo - Name Horizontal/Taskforce-Ai-logo---Name-Horizontal-reverse.png', import.meta.url).href;
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServicesData } from '../../hooks/useServicesData';


export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const servicesData = useServicesData();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const companyLinks = [
    { label: t('footer.links.about'), path: '/about' },
    { label: t('footer.links.blog'), path: '/blog' },
    { label: t('footer.links.careers'), path: '#' },
    { label: t('footer.links.contact'), path: '/contact' }
  ];

  return (
    <footer className="relative bg-black pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden border-t border-white/5">
      {/* Subtle Background Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-primary-DEFAULT/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 lg:gap-8 mb-12 md:mb-20">
          
          {/* Brand Column - Full Width Mobile, Left Aligned Desktop */}
          <div className="col-span-2 lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <img src={logoWordmark} alt="TaskForce AI" className="h-7 md:h-8 w-auto object-contain" />
            </div>
            {/* Description - Hidden on Mobile for simplicity */}
            <p className="text-gray-500 leading-relaxed mb-6 md:mb-8 max-w-sm text-sm hidden md:block">
              {t('footer.description')}
            </p>
             <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Github, href: '#', label: 'GitHub' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation Columns - Hidden on Mobile */}
          <div className="hidden md:block col-span-1 lg:col-span-2 lg:col-start-6">
             <h4 className="text-white font-semibold mb-4 md:mb-6 text-sm tracking-wide">{t('footer.ai_agents')}</h4>
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

          <div className="hidden md:block col-span-1 lg:col-span-2">
             <h4 className="text-white font-semibold mb-4 md:mb-6 text-sm tracking-wide">{t('footer.company')}</h4>
             <ul className="space-y-2 md:space-y-3">
               {companyLinks.map(item => (
                 <li key={item.label}>
                   <Link to={item.path} className="text-gray-500 hover:text-white transition-colors text-xs md:text-sm block hover:translate-x-1 duration-300">
                     {item.label}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* Newsletter Column - Hidden on Mobile */}
          <div className="hidden md:flex col-span-2 lg:col-span-3 flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-semibold mb-4 md:mb-6 text-sm tracking-wide">{t('footer.stay_updated')}</h4>
            <p className="text-gray-500 text-sm mb-4 max-w-xs md:max-w-none">
              {t('footer.stay_updated_desc')}
            </p>
            <form className="flex flex-col gap-3 w-full max-w-xs md:max-w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder={t('footer.email_placeholder')}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 pl-4 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-white/[0.05] transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded text-gray-400 hover:text-white hover:bg-primary-DEFAULT transition-all duration-300"
                  aria-label={t('footer.subscribe')}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-600 text-[10px] md:text-xs flex flex-col md:flex-row gap-1 md:gap-4 text-center md:text-left items-center">
            <span>© 2024 TaskForce AI Inc.</span>
            <span className="hidden md:inline text-gray-800">|</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {t('footer.all_systems_nominal')}</span>
          </div>
          
          <div className="flex items-center gap-6 md:gap-8">
             <a href="#" className="text-gray-600 hover:text-white text-[10px] md:text-xs transition-colors">{t('footer.privacy')}</a>
             <a href="#" className="text-gray-600 hover:text-white text-[10px] md:text-xs transition-colors">{t('footer.terms')}</a>
             
             <button 
               onClick={scrollToTop}
               className="group flex items-center gap-2 text-[10px] md:text-xs text-gray-500 hover:text-primary-light transition-colors pl-4 border-l border-white/5"
             >
               {t('footer.top')} <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

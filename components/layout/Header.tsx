import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagneticButton } from '../ui/MagneticButton';


const logoWordmark = new URL(
  '../../Logo_Files/Taskforce Ai logo - Name Horizontal/Taskforce-Ai-logo---Name-Horizontal-reverse.png',
  import.meta.url
).href;

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  const isHome = location.pathname === '/';
  const isServicePage = location.pathname.startsWith('/service/');
  const isBookingPage = location.pathname === '/book-demo';
  const isContactPage = location.pathname === '/contact';
  const isAdminPage = location.pathname.startsWith('/admin');

  const navItems = [
    { label: 'Home', id: 'home', path: '/' },
    { label: t('nav.solutions'), id: 'solutions', path: '/' },
    { label: t('nav.about'), id: 'about', path: '/about' },
    { label: t('nav.contact'), id: 'contact', path: '/contact' }
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[0]
  ) => {
    e.preventDefault();

    if (item.path !== '/') {
      navigate(item.path);
      setMobileMenuOpen(false);
      return;
    }

    if (isHome) {
      const element = document.getElementById(item.id);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(item.id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }

    setMobileMenuOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (isServicePage || isBookingPage || isContactPage || isAdminPage) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
            : 'bg-transparent py-6 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between relative">
          <Link to="/" className="flex items-center z-50 relative group">
            <img
              src={logoWordmark}
              alt="TaskForce AI"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-inner">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path === '/' ? `#${item.id}` : item.path}
                onClick={(e) => handleNavClick(e, item)}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                className="relative px-6 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {hoveredNav === item.label && (
                  <motion.div
                    layoutId="navHover"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-DEFAULT" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-DEFAULT" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-DEFAULT" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-DEFAULT" />
                  </motion.div>
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">
                  {i18n.language ? i18n.language.substring(0, 2) : 'EN'}
                </span>
              </button>

              <div className="absolute right-0 top-full mt-2 w-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="flex flex-col p-1">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ar', label: 'العربية' },
                    { code: 'fr', label: 'Français' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        i18n.language === lang.code
                          ? 'bg-primary-DEFAULT/20 text-primary-light'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <MagneticButton
              variant="primary"
              className="!py-2.5 !px-6 text-sm font-bold tracking-wide shadow-none hover:shadow-lg hover:shadow-primary-DEFAULT/20 border border-white/10"
              onClick={() => navigate('/book-demo')}
            >
              {t('nav.book')}
            </MagneticButton>
          </div>

          <button
            className="md:hidden z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl flex flex-col z-40"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary-DEFAULT/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary-DEFAULT/20 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
            </div>

            <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10 pt-20">
              <nav className="flex flex-col gap-4">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.path === '/' ? `#${item.id}` : item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 100 }}
                    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                  >
                    <span className="text-4xl font-bold text-gray-400 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                    <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-DEFAULT group-hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary-DEFAULT/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h4 className="text-gray-400 mb-4 text-sm font-mono uppercase tracking-wider relative z-10">
                    Ready to automate?
                  </h4>
                  <div className="relative z-10">
                    <MagneticButton
                      variant="primary"
                      className="w-full justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/book-demo');
                      }}
                    >
                      Book Consultation
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

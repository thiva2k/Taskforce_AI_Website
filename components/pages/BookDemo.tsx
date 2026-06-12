import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Clock,
  ShieldCheck,
  User,
  Mail,
  Phone,
  PhoneCall,
  CheckCircle2,
  Loader2,
  Sparkles,
  BellRing,
  CalendarCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '../ui/GlitchButton';
import { ScrambleText } from '../ui/ScrambleText';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';

// Royalty-free hotel imagery (Unsplash license — free for commercial use).
const HOTEL_BG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80';

type DemoForm = {
  full_name: string;
  email: string;
  country: string; // ISO dial code key
  phone: string;
};

type Status = 'idle' | 'submitting' | 'success';

const COUNTRIES = [
  { code: 'LK', flag: '🇱🇰', dial: '+94' },
  { code: 'AE', flag: '🇦🇪', dial: '+971' },
  { code: 'US', flag: '🇺🇸', dial: '+1' },
  { code: 'GB', flag: '🇬🇧', dial: '+44' },
  { code: 'IN', flag: '🇮🇳', dial: '+91' },
  { code: 'AU', flag: '🇦🇺', dial: '+61' },
];

/* ------------------------------------------------------------------ */
/*  Slide-to-call control                                              */
/* ------------------------------------------------------------------ */

const SlideToCall: React.FC<{
  onComplete: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ onComplete, disabled = false, label = 'Slide to call me now' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(0);
  const [done, setDone] = useState(false);

  const KNOB = 56;

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setMaxX(Math.max(trackRef.current.offsetWidth - KNOB - 8, 0));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const fillWidth = useTransform(x, (v) => v + KNOB);
  const labelOpacity = useTransform(
    x,
    [0, Math.max(maxX, 1) * 0.55],
    [1, 0]
  );

  const complete = () => {
    if (done || disabled) return;
    setDone(true);
    animate(x, maxX, { type: 'spring', stiffness: 380, damping: 38 });
    onComplete();
  };

  const reset = () => {
    setDone(false);
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
  };

  // expose reset on the node for parent error handling
  useEffect(() => {
    if (!disabled && done === false) {
      // keep knob at start when re-enabled
      animate(x, 0, { duration: 0.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handleDragEnd = () => {
    if (x.get() > maxX * 0.72) complete();
    else reset();
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-16 w-full rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden select-none ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {/* animated fill */}
      <motion.div
        style={{ width: fillWidth }}
        className="absolute inset-y-0 left-0 rounded-2xl bg-gradient-to-r from-primary-DEFAULT/40 to-accent/30 pointer-events-none"
      />

      {/* shimmering label */}
      <motion.div
        style={{ opacity: labelOpacity }}
        className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 pointer-events-none pl-10"
      >
        <span>{label}</span>
        <ArrowRight className="w-4 h-4 animate-pulse" />
      </motion.div>

      {/* knob */}
      <motion.button
        type="button"
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0.02}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTap={complete}
        whileTap={{ scale: 0.96 }}
        aria-label={label}
        className="absolute top-1 left-1 z-10 grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-accent text-white shadow-[0_0_24px_rgba(0,102,255,0.45)] cursor-grab active:cursor-grabbing"
      >
        <PhoneCall className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export const BookDemo: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<DemoForm>({
    full_name: '',
    email: '',
    country: 'LK',
    phone: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const dial =
    COUNTRIES.find((c) => c.code === form.country)?.dial ?? '+94';

  const handleChange = (field: keyof DemoForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const startDemo = () => {
    setError('');

    if (!form.full_name.trim()) {
      setError('Please enter your name so the agent can greet you.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }

    setStatus('submitting');
    // UI-only for now — simulate the agent picking up the call.
    setTimeout(() => setStatus('success'), 1400);
  };

  const resetDemo = () => {
    setStatus('idle');
    setError('');
  };

  const highlights = [
    {
      icon: BellRing,
      title: '24/7 Front Desk',
      desc: 'Never miss a guest call',
    },
    {
      icon: Globe,
      title: 'Multilingual',
      desc: 'English, Sinhala, Tamil & Arabic',
    },
    {
      icon: CalendarCheck,
      title: 'Instant Bookings',
      desc: 'Reservations handled live',
    },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title="Demo Our Voice Agent - AI TaskForce"
        description="Experience a live demo of our AI hotel voice concierge. Drop your details and our voice agent will call you to handle bookings, answer questions and check availability."
        url="/book-demo"
      />

      {/* Hotel background */}
      <div className="fixed inset-0 z-0">
        <img
          src={HOTEL_BG}
          alt=""
          aria-hidden="true"
          loading="eager"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-bg/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg/80 to-primary-dark/30" />
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-soft-light"
          style={{ backgroundImage: 'url(/noise.svg)' }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          <GlitchButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider group border border-transparent hover:border-white/10 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return
          </GlitchButton>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-primary-light bg-primary-DEFAULT/10 px-3 py-1 rounded-full border border-primary-DEFAULT/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            VOICE AGENT ONLINE
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow flex items-center justify-center px-4 py-6 md:py-12">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono uppercase tracking-widest text-accent">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Voice Demo
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-5 tracking-tighter leading-[1.05]">
                  Meet Aria, your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">
                    <ScrambleText text="AI Hotel Concierge" startDelay={400} />
                  </span>
                </h1>

                <p className="text-gray-300 leading-relaxed mb-8 text-base md:text-lg max-w-md">
                  Curious how it sounds? Drop your details and Aria will call you
                  in seconds — handling reservations, answering guest questions
                  and checking availability, just like she would at your front
                  desk, around the clock.
                </p>

                <div className="space-y-3 max-w-md">
                  {highlights.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition-colors duration-300 group backdrop-blur-sm"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-DEFAULT/20 to-accent/10 border border-white/10 text-accent group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm tracking-wide">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-xs font-mono mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: demo card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-[2rem] border border-white/10 bg-dark-surface/50 backdrop-blur-2xl p-6 md:p-9 shadow-[0_0_60px_rgba(0,102,255,0.12)] overflow-hidden"
              >
                {/* glow ring */}
                <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary-DEFAULT/30 via-transparent to-accent/30 opacity-40" />
                <div className="relative z-10">
                  {/* Agent header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-DEFAULT to-accent grid place-items-center text-2xl font-bold shadow-lg">
                        A
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-dark-surface" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                        Aria
                      </h3>
                      <p className="text-accent text-sm font-medium">
                        Hotel Concierge · TaskForce AI
                      </p>
                      <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-gray-400 font-mono">
                        🇬🇧 <span>English</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-6 text-center"
                      >
                        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 relative">
                          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                          <CheckCircle2 className="w-11 h-11 text-green-400 relative z-10" />
                        </div>
                        <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          Aria is calling you now
                        </h4>
                        <p className="text-gray-300 max-w-md mx-auto leading-relaxed mb-2">
                          Keep your phone close,{' '}
                          <span className="text-white font-semibold">
                            {form.full_name.split(' ')[0]}
                          </span>
                          . Your voice demo is ringing through to{' '}
                          <span className="text-accent font-mono">
                            {dial} {form.phone}
                          </span>
                          .
                        </p>
                        <p className="text-gray-500 text-sm font-mono mb-8">
                          The call ends automatically after 5 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <GlitchButton variant="secondary" onClick={resetDemo}>
                            Run another demo
                          </GlitchButton>
                          <GlitchButton onClick={() => navigate('/')}>
                            Back to home
                          </GlitchButton>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                      >
                        {/* Name */}
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) =>
                              handleChange('full_name', e.target.value)
                            }
                            placeholder="Your name"
                            className="w-full h-14 rounded-xl border border-white/10 bg-white/[0.03] pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/60 focus:bg-accent/5 transition"
                          />
                        </div>

                        {/* Email */}
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              handleChange('email', e.target.value)
                            }
                            placeholder="Your e-mail"
                            className="w-full h-14 rounded-xl border border-white/10 bg-white/[0.03] pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/60 focus:bg-accent/5 transition"
                          />
                        </div>

                        {/* Phone */}
                        <div className="relative flex">
                          <div className="relative">
                            <select
                              value={form.country}
                              onChange={(e) =>
                                handleChange('country', e.target.value)
                              }
                              className="h-14 rounded-l-xl border border-white/10 border-r-0 bg-white/[0.03] pl-4 pr-8 text-white focus:outline-none focus:border-accent/60 appearance-none cursor-pointer font-mono"
                            >
                              {COUNTRIES.map((c) => (
                                <option
                                  key={c.code}
                                  value={c.code}
                                  className="bg-dark-surface text-white"
                                >
                                  {c.flag} {c.dial}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) =>
                                handleChange('phone', e.target.value)
                              }
                              placeholder="71 234 5678"
                              className="w-full h-14 rounded-r-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/60 focus:bg-accent/5 transition"
                            />
                          </div>
                        </div>

                        <p className="text-center text-sm text-gray-400">
                          The call ends automatically after{' '}
                          <span className="text-accent font-semibold">
                            5 minutes
                          </span>
                          .
                        </p>

                        {/* Slide to call */}
                        <div className="pt-1">
                          {status === 'submitting' ? (
                            <div className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center gap-3 text-white/80">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              <span className="font-semibold uppercase tracking-[0.18em] text-sm">
                                Connecting your call…
                              </span>
                            </div>
                          ) : (
                            <SlideToCall onComplete={startDemo} />
                          )}
                        </div>

                        {error && (
                          <p className="text-red-400 text-sm text-center">
                            {error}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono uppercase tracking-widest text-gray-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Your details stay private · No spam
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <p className="text-center text-xs text-gray-500 mt-5 flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Average pickup time under 10 seconds
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

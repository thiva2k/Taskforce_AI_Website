import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  PhoneOff,
  Loader2,
  Sparkles,
  Mic,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '../ui/GlitchButton';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';

// Royalty-free hill-country / mountain hotel imagery (Unsplash license — free for commercial use).
// Ordered candidates: a lush hillside resort first, then reliable fallbacks so the visual
// panel always renders a proper hotel-in-the-hills and never appears broken.
// Hill-country hotel imagery. Primary is the vendored property photo; the stock
// entries are reliable fallbacks that only show if the local file fails to load.
const HOTEL_IMGS = [
  '/images/hatton-hills.jpg', // vendored hillside property photo
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
];
const HOTEL_IMG = HOTEL_IMGS[0];

const TRAINED_ON = [
  'Room categories & capacity',
  'Local & foreign rates',
  'Meal plan options',
  'Check-in / check-out policy',
  'Availability calendar',
  'Property facilities',
  'Nearby excursions',
  'Booking confirmation flow',
];

const STEPS: Array<{ bold: string; rest: string }> = [
  {
    bold: 'Click the demo link',
    rest: ' and wait for Tanya to answer. She will greet you as a guest calling the property.',
  },
  {
    bold: 'Act as a guest.',
    rest: ' Ask about room types, availability for a specific date range, and rates for local or foreign guests.',
  },
  {
    bold: 'Push further.',
    rest: " Ask about meal plans, what's included, nearby activities, or request a booking. See how she handles multi-step conversation.",
  },
  {
    bold: 'Test the edges.',
    rest: ' Try an unusual question or a pricing objection. Observe how she recovers and keeps the conversation on track.',
  },
];

type CallState = 'idle' | 'connecting' | 'live';

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* Animated voice equalizer for the live-call screen */
const Equalizer: React.FC = () => (
  <div className="flex items-end justify-center gap-1.5 h-12">
    {[0.2, 0.5, 0.9, 0.4, 0.7, 1, 0.5, 0.8, 0.3].map((seed, i) => (
      <motion.span
        key={i}
        className="w-1.5 rounded-full bg-gradient-to-t from-primary-DEFAULT to-accent"
        animate={{ height: ['18%', '100%', '40%', '85%', '25%'] }}
        transition={{
          duration: 1 + seed,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: i * 0.08,
        }}
        style={{ height: '40%' }}
      />
    ))}
  </div>
);

export const BookDemo: React.FC = () => {
  const navigate = useNavigate();

  const [callState, setCallState] = useState<CallState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  // drive the live-call timer (UI-only simulation)
  useEffect(() => {
    if (callState === 'live') {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s >= 120) {
            window.clearInterval(timerRef.current!);
            setCallState('idle');
            return 0;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [callState]);

  const startDemo = () => {
    setSeconds(0);
    setCallState('connecting');
    window.setTimeout(() => setCallState('live'), 1800);
  };

  const endDemo = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setCallState('idle');
    setSeconds(0);
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title="Demo Our Voice Agent - AI TaskForce"
        description="Speak with Tanya, our AI front-office reservation agent for Hatton Hills. A live, no-sign-up demo of a TaskForce AI hotel voice agent."
        url="/book-demo"
      />

      {/* Page background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dark-bg" />
        <img
          src={HOTEL_IMG}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg/90 to-primary-dark/40" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
          style={{ backgroundImage: 'url(/noise.svg)' }}
        />
        {/* drifting brand glows */}
        <motion.div
          className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-primary-DEFAULT/20 blur-[140px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-[140px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
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

        {/* Body — agent card */}
        <div className="flex-grow flex items-center justify-center px-4 py-6 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-5xl rounded-[2rem] border border-white/10 bg-dark-surface/50 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,102,255,0.15)] overflow-hidden"
          >
            {/* animated gradient border glow */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary-DEFAULT/40 via-transparent to-accent/40"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-12">
              {/* LEFT — hillside hotel visual */}
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[640px] overflow-hidden">
                <motion.img
                  src={HOTEL_IMGS[imgIdx]}
                  onError={() =>
                    setImgIdx((i) => (i + 1 < HOTEL_IMGS.length ? i + 1 : i))
                  }
                  alt="Hatton Hills — hillside retreat, Sri Lanka"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                {/* subtle bottom scrim only — keep the photo crisp & clear */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />

                {/* bottom label block */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 p-7"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-DEFAULT to-accent text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live Demo
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                    Hatton Hills
                  </h2>
                  <p className="flex items-center gap-1.5 text-gray-200 text-sm mt-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    Hatton, Sri Lanka
                  </p>
                </motion.div>
              </div>

              {/* RIGHT — agent details */}
              <div className="lg:col-span-7 p-7 md:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
                  Reservation Agent · English
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-[2rem] leading-tight font-bold text-white mb-4"
                >
                  Tanya — Front Office Reservation Agent
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="text-gray-300 leading-relaxed mb-7"
                >
                  Tanya handles inbound reservation inquiries for Hatton Hills — a
                  boutique hillside retreat above Sri Lanka's tea country. She is
                  trained on the full property knowledge base and responds exactly
                  as a professional front office agent would, 24 hours a day.
                </motion.p>

                {/* Trained on */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    Trained on
                  </p>
                  <motion.div
                    className="flex flex-wrap gap-2.5"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
                    }}
                  >
                    {TRAINED_ON.map((chip) => (
                      <motion.span
                        key={chip}
                        variants={{
                          hidden: { opacity: 0, y: 8, scale: 0.95 },
                          show: { opacity: 1, y: 0, scale: 1 },
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-3.5 py-2 rounded-lg text-sm text-gray-200 bg-white/[0.04] border border-white/10 hover:border-accent/60 hover:bg-accent/10 hover:text-white transition-colors cursor-default"
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>

                {/* CTA — moved between Trained on & How to use, made eye-catching */}
                <motion.button
                  type="button"
                  onClick={startDemo}
                  disabled={callState !== 'idle'}
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      '0 8px 30px rgba(0,102,255,0.30)',
                      '0 12px 44px rgba(6,182,212,0.55)',
                      '0 8px 30px rgba(0,102,255,0.30)',
                    ],
                  }}
                  transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
                  className="group relative w-full h-16 rounded-2xl overflow-hidden font-bold text-white text-lg disabled:opacity-70 mb-2.5"
                >
                  {/* animated flowing gradient */}
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #0066FF, #06B6D4, #7C3AED, #0066FF)',
                      backgroundSize: '300% 100%',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* moving shine sweep */}
                  <motion.span
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg]"
                    animate={{ x: ['-120%', '320%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, -12, 12, -12, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2 }}
                    >
                      <Phone className="w-5 h-5" />
                    </motion.span>
                    Speak with Tanya
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                      Live
                    </span>
                  </span>
                </motion.button>

                <p className="text-center text-xs text-gray-500 mb-8 font-mono">
                  No sign-up required · Live agent · ~2 min demo
                </p>

                {/* How to use */}
                <h3 className="text-lg font-bold text-white mb-5">
                  How to use this demo
                </h3>
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.1, delayChildren: 0.45 } },
                  }}
                >
                  {STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, x: -12 },
                        show: { opacity: 1, x: 0 },
                      }}
                      className="flex gap-4"
                    >
                      <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent text-white text-xs font-bold shadow-[0_0_14px_rgba(0,102,255,0.4)]">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 leading-relaxed text-[15px]">
                        <span className="text-white font-semibold">{step.bold}</span>
                        {step.rest}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* ---- Live call screen (UI-only) ---- */}
            <AnimatePresence>
              {callState !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 overflow-hidden"
                >
                  {/* layered animated backdrop */}
                  <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-2xl" />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 40%, rgba(6,182,212,0.25), transparent 60%)',
                    }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    {/* avatar with concentric pulse rings */}
                    <div className="relative mb-8 grid place-items-center">
                      {[0, 1, 2].map((r) => (
                        <motion.span
                          key={r}
                          className="absolute rounded-full border border-accent/40"
                          style={{ width: 128, height: 128 }}
                          animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: r * 0.8,
                          }}
                        />
                      ))}
                      <motion.div
                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent grid place-items-center text-5xl font-bold shadow-[0_0_60px_rgba(0,102,255,0.6)]"
                        animate={{ scale: callState === 'live' ? [1, 1.04, 1] : 1 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        T
                        {callState === 'live' && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </motion.div>
                    </div>

                    {callState === 'connecting' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h4 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2.5">
                          <Loader2 className="w-6 h-6 animate-spin text-accent" />
                          Connecting you to Tanya…
                        </h4>
                        <p className="text-gray-300 max-w-sm">
                          She's picking up the line. Get ready to speak as a guest
                          calling Hatton Hills.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
                          <Mic className="w-3.5 h-3.5" />
                          On the line
                        </div>
                        <h4 className="text-2xl md:text-3xl font-bold text-white mb-1">
                          Tanya is on the line
                        </h4>
                        <p className="text-accent font-mono text-2xl mb-5 tabular-nums">
                          {formatTime(seconds)}
                        </p>
                        <div className="w-64 mb-5">
                          <Equalizer />
                        </div>
                        <p className="text-gray-300 max-w-sm mb-2 inline-flex items-center gap-2 justify-center">
                          <Sparkles className="w-4 h-4 text-accent" />
                          Go ahead — ask about rooms, rates or availability.
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      type="button"
                      onClick={endDemo}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="mt-7 inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-semibold transition shadow-[0_8px_30px_rgba(239,68,68,0.4)]"
                    >
                      <PhoneOff className="w-5 h-5" />
                      {callState === 'connecting' ? 'Cancel' : 'End demo'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

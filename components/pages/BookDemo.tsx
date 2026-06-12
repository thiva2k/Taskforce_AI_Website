import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  PhoneOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '../ui/GlitchButton';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';

// Royalty-free hotel imagery (Unsplash license — free for commercial use).
const HOTEL_IMG =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80';

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

export const BookDemo: React.FC = () => {
  const navigate = useNavigate();

  const [callState, setCallState] = useState<CallState>('idle');
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // drive the live-call timer (UI-only simulation)
  useEffect(() => {
    if (callState === 'live') {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s >= 120) {
            // auto-end the ~2 min demo
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
        description="Speak with Tanya, our AI front-office reservation agent for Treehouse Chalets. A live, no-sign-up demo of a TaskForce AI hotel voice agent."
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
        {/* soft brand glows */}
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-primary-DEFAULT/20 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-[140px]" />
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
            {/* gradient border glow */}
            <div className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary-DEFAULT/40 via-transparent to-accent/40 opacity-40" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12">
              {/* LEFT — hotel visual */}
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[600px] overflow-hidden">
                <img
                  src={HOTEL_IMG}
                  alt="Treehouse Chalets, Kandy District"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* brand wash */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-primary-dark/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/25 to-accent/15 mix-blend-overlay" />

                {/* bottom label block */}
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-DEFAULT to-accent text-white text-[11px] font-bold uppercase tracking-widest shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    Live Demo
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                    Treehouse Chalets
                  </h2>
                  <p className="flex items-center gap-1.5 text-gray-200 text-sm mt-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    Kandy District, Sri Lanka
                  </p>
                </div>
              </div>

              {/* RIGHT — agent details */}
              <div className="lg:col-span-7 p-7 md:p-10">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  Reservation Agent · English
                </div>

                <h1 className="text-2xl md:text-[2rem] leading-tight font-bold text-white mb-4">
                  Tanya — Front Office Reservation Agent
                </h1>

                <p className="text-gray-300 leading-relaxed mb-7">
                  Tanya handles inbound reservation inquiries for Treehouse
                  Chalets — a boutique jungle property in the Kandy hills. She is
                  trained on the full property knowledge base and responds exactly
                  as a professional front office agent would, 24 hours a day.
                </p>

                {/* Trained on */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    Trained on
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {TRAINED_ON.map((chip) => (
                      <span
                        key={chip}
                        className="px-3.5 py-2 rounded-lg text-sm text-gray-200 bg-white/[0.04] border border-white/10 hover:border-accent/50 hover:bg-accent/5 hover:text-white transition-colors"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* How to use */}
                <h3 className="text-lg font-bold text-white mb-5">
                  How to use this demo
                </h3>
                <div className="space-y-4 mb-9">
                  {STEPS.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent text-white text-xs font-bold shadow-[0_0_14px_rgba(0,102,255,0.4)]">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 leading-relaxed text-[15px]">
                        <span className="text-white font-semibold">
                          {step.bold}
                        </span>
                        {step.rest}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={startDemo}
                  disabled={callState !== 'idle'}
                  className="group relative w-full h-14 rounded-xl overflow-hidden font-bold text-white shadow-[0_8px_30px_rgba(0,102,255,0.35)] disabled:opacity-70 transition"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-DEFAULT to-accent" />
                  <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary-DEFAULT opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <Phone className="w-5 h-5" />
                    Speak with Tanya
                  </span>
                </button>

                <p className="text-center text-xs text-gray-500 mt-4 font-mono">
                  No sign-up required · Live agent · ~2 min demo
                </p>
              </div>
            </div>

            {/* ---- Call overlay (UI-only) ---- */}
            <AnimatePresence>
              {callState !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center bg-dark-bg/80 backdrop-blur-xl p-8"
                >
                  <div className="relative mb-7">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent grid place-items-center text-4xl font-bold shadow-[0_0_50px_rgba(0,102,255,0.5)]">
                      T
                    </div>
                    {callState === 'connecting' && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping" />
                        <span className="absolute -inset-3 rounded-full border border-primary-DEFAULT/30 animate-ping" />
                      </>
                    )}
                    {callState === 'live' && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>

                  {callState === 'connecting' ? (
                    <>
                      <h4 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        Connecting you to Tanya…
                      </h4>
                      <p className="text-gray-400 max-w-sm">
                        She's picking up the line. Get ready to speak as a guest
                        calling Treehouse Chalets.
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-2xl font-bold text-white mb-1">
                        Tanya is on the line
                      </h4>
                      <p className="text-accent font-mono text-lg mb-2">
                        {formatTime(seconds)}
                      </p>
                      <p className="text-gray-400 max-w-sm mb-7 inline-flex items-center gap-2 justify-center">
                        <Sparkles className="w-4 h-4 text-accent" />
                        Go ahead — ask about rooms, rates or availability.
                      </p>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={endDemo}
                    className="mt-6 inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-semibold transition shadow-lg"
                  >
                    <PhoneOff className="w-5 h-5" />
                    {callState === 'connecting' ? 'Cancel' : 'End demo'}
                  </button>
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

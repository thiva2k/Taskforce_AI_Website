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
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Twilio Voice JS SDK v2 — Device/Call browser API.
// Ref: https://www.twilio.com/docs/voice/sdks/javascript (v2.x: `new Device(token)`,
// `device.connect()`, Call events 'accept'|'disconnect'|'cancel'|'error', `device.destroy()`).
import { Device } from '@twilio/voice-sdk';
import { GlitchButton } from '../ui/GlitchButton';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';

// Shared public token-minting endpoint (no secrets in the frontend). The backend
// issues a short-lived Twilio access token scoped to the chosen agent's TwiML app.
// The `agent` query param selects which agent the browser call routes into.
const TOKEN_URL = 'https://hattonhills.taskforceai.tech/api/voice-token';

type Lang = 'en' | 'ar' | 'ru' | 'si';

// Master language catalogue. Each agent declares which subset it supports.
const LANGS: Array<{ value: Lang; label: string; native: string; flag: string }> = [
  { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { value: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { value: 'si', label: 'Sinhala', native: 'සිංහල', flag: '🇱🇰' },
];

interface Agent {
  id: string;
  brand: string;        // business name (card title)
  agentName: string;    // the voice agent's persona name
  role: string;         // eyebrow label, e.g. "Reservation Agent"
  location: string;
  description: string;
  images: string[];     // primary + fallbacks
  trainedOn: string[];
  langs: Lang[];        // supported demo languages (first is default)
  callLabel: string;    // CTA text, e.g. "Call Hatton Hills"
  askHint: string;      // live-call hint, e.g. "rooms, rates or availability"
  imgPosition?: string; // object-position for the cover crop (default 'center')
  steps: Array<{ bold: string; rest: string }>;
}

// The three demo agents. All share the same card layout; the carousel arrows
// slide between them. Each routes to its own backend via the `agent` token param.
const AGENTS: Agent[] = [
  {
    id: 'hatton',
    brand: 'Hatton Hills',
    agentName: 'Tanya',
    role: 'Reservation Agent',
    location: 'Hatton, Sri Lanka',
    description:
      "Hatton Hills' front-office reservation agent handles inbound reservation " +
      "inquiries for the property — a boutique hillside retreat above Sri Lanka's " +
      'tea country. Trained on the full property knowledge base, she responds exactly ' +
      'as a professional front office agent would, 24 hours a day.',
    images: [
      '/images/hatton-hills.jpg',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
    ],
    trainedOn: [
      'Room categories & capacity',
      'Local & foreign rates',
      'Meal plan options',
      'Check-in / check-out policy',
      'Availability calendar',
      'Property facilities',
      'Nearby excursions',
      'Booking confirmation flow',
    ],
    langs: ['en', 'ar', 'ru', 'si'],
    callLabel: 'Call Hatton Hills',
    askHint: 'rooms, rates or availability',
    steps: [
      {
        bold: 'Click the demo link',
        rest: ' and wait for the Voice Agent to answer. It will greet you as a guest calling the property.',
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
    ],
  },
  {
    id: 'kitchened',
    brand: 'Kitchen & Co.',
    agentName: 'Nira',
    role: 'Lead-Gen Specialist',
    location: 'Colombo, Sri Lanka',
    description:
      "Kitchen & Co. is Sri Lanka's commercial kitchen & bakery equipment specialist. " +
      'Nira helps you scope the right equipment for your bakery, hotel, restaurant or ' +
      'institution, answers product and service questions, and connects you with a ' +
      'specialist for a tailored quote — any time of day.',
    images: [
      '/images/kitchen-and-co-v2.jpg', // vendored portrait kitchen photo (v2 filename busts CDN cache)
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1581349437898-cebbe9831942?auto=format&fit=crop&w=1400&q=80',
    ],
    trainedOn: [
      'Commercial ovens & bakery lines',
      'Dough & food mixers',
      'Refrigeration & cooling',
      'Consultation & equipment sizing',
      'Installation & commissioning',
      'After-sales & genuine spares',
      'Island-wide service',
      'Free quote & specialist callback',
    ],
    langs: ['en'],
    callLabel: 'Call Kitchen & Co.',
    askHint: 'ovens, mixers or a full kitchen fit-out',

    steps: [
      {
        bold: 'Click the demo link',
        rest: ' and wait for Nira to answer. She greets you as a business calling about commercial kitchen equipment.',
      },
      {
        bold: 'Act as a buyer.',
        rest: ' Tell her your business type — a bakery, hotel, restaurant or canteen — and the equipment you are looking for.',
      },
      {
        bold: 'Push further.',
        rest: ' Ask about ovens, mixers, refrigeration, installation or after-sales. See how she qualifies your needs.',
      },
      {
        bold: 'Reach the goal.',
        rest: ' Watch her capture your details and arrange a specialist callback with a tailored quote.',
      },
    ],
  },
  {
    id: 'worldofrefrigerators',
    brand: 'World Of Refrigerators',
    agentName: 'Riya',
    role: 'Sales Advisor',
    location: 'Colombo, Sri Lanka',
    description:
      'World Of Refrigerators is your one-stop shop for refrigerators, freezers and ' +
      'coolers in Sri Lanka. Riya helps you find the right model by capacity, type and ' +
      'budget, compares brands like Abans, LG and Haier, and walks you to a purchase ' +
      'with live prices — 24 hours a day.',
    images: [
      '/images/world-of-refrigerators.jpg', // vendored full-res smart-fridge photo
      'https://images.unsplash.com/photo-1536353284924-9220c464e262?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1400&q=80',
    ],
    trainedOn: [
      'Single & double-door fridges',
      'Side-by-side & inverter models',
      'Chest & upright freezers',
      'Bottle & wine coolers',
      'Air coolers',
      'Capacities & live prices',
      'Brand comparison',
      'Delivery & sales callback',
    ],
    langs: ['en'],
    callLabel: 'Call World Of Refrigerators',
    askHint: 'fridges, freezers or coolers',
    steps: [
      {
        bold: 'Click the demo link',
        rest: ' and wait for Riya to answer. She greets you as a customer shopping for cooling appliances.',
      },
      {
        bold: 'Act as a shopper.',
        rest: ' Tell her what you need — a family fridge, a chest freezer, a bottle cooler — with your capacity and budget.',
      },
      {
        bold: 'Push further.',
        rest: ' Ask her to compare inverter vs non-inverter, or single vs double door, and to recommend models with prices.',
      },
      {
        bold: 'Reach the goal.',
        rest: ' See her confirm the model of interest and arrange purchase, delivery or a sales callback.',
      },
    ],
  },
];

const langMeta = (v: Lang) => LANGS.find((l) => l.value === v) ?? LANGS[0];

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

type CallState = 'idle' | 'connecting' | 'live';

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

// Slide animation for the agent carousel. `dir` is +1 (next) or -1 (prev).
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 90 : -90, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -90 : 90, opacity: 0 }),
};

export const BookDemo: React.FC = () => {
  const navigate = useNavigate();

  const [callState, setCallState] = useState<CallState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  // Carousel: which agent is showing + the direction of the last navigation.
  const [[agentIdx, dir], setAgentNav] = useState<[number, number]>([0, 0]);
  const agent = AGENTS[agentIdx];

  // Selected demo voice language + dropdown open state (per agent).
  const [lang, setLang] = useState<Lang>(AGENTS[0].langs[0]);
  const [langOpen, setLangOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Live Twilio call handles.
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<any>(null);

  // Move to another agent in the carousel. Disabled mid-call.
  const goToAgent = (d: number) => {
    if (callState !== 'idle') return;
    setLangOpen(false);
    setImgIdx(0);
    setAgentNav(([i]) => [(i + d + AGENTS.length) % AGENTS.length, d]);
  };
  const selectAgent = (target: number) => {
    if (callState !== 'idle' || target === agentIdx) return;
    setLangOpen(false);
    setImgIdx(0);
    setAgentNav(([i]) => [target, target > i ? 1 : -1]);
  };

  // When the agent changes, reset the chosen language to that agent's default.
  useEffect(() => {
    setLang(agent.langs[0]);
  }, [agentIdx]);

  // drive the live-call timer; auto-hang up at the 5-minute cap
  useEffect(() => {
    if (callState === 'live') {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => (s >= 300 ? 300 : s + 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [callState]);

  useEffect(() => {
    if (callState === 'live' && seconds >= 300) {
      endDemo();
    }
  }, [callState, seconds]);

  const endDemo = () => {
    const call = callRef.current;
    callRef.current = null;
    const device = deviceRef.current;
    deviceRef.current = null;

    try {
      call?.disconnect();
    } catch {
      /* ignore — already torn down */
    }
    try {
      device?.destroy();
    } catch {
      /* ignore */
    }

    if (timerRef.current) window.clearInterval(timerRef.current);
    setCallState('idle');
    setSeconds(0);
  };

  const startDemo = async () => {
    setSeconds(0);
    setCallState('connecting');

    try {
      // 1) Mic permission — required before placing a WebRTC call.
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2) Mint a short-lived Twilio access token scoped to THIS agent.
      const res = await fetch(`${TOKEN_URL}?agent=${encodeURIComponent(agent.id)}`);
      if (!res.ok) throw new Error(`token request failed: ${res.status}`);
      const { token } = await res.json();
      if (!token) throw new Error('no token in response');

      // 3) Spin up the Device and place the outbound call into the TwiML app.
      const device = new Device(token);
      deviceRef.current = device;

      // Pass the chosen agent + language to the TwiML app. Twilio forwards
      // `params` to the voiceUrl (/voice/demo-incoming) as POST fields.
      const call = await device.connect({ params: { agent: agent.id, lang } });
      callRef.current = call;

      call.on('accept', () => setCallState('live'));
      call.on('disconnect', () => endDemo());
      call.on('cancel', () => endDemo());
      call.on('error', (e: unknown) => {
        console.error('[twilio] call error', e);
        endDemo();
      });
    } catch (err) {
      console.error('[twilio] could not start demo call', err);
      endDemo();
    }
  };

  // End any in-flight call when the user navigates away from the page.
  useEffect(() => {
    return () => {
      try {
        callRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        deviceRef.current?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const multiLang = agent.langs.length > 1;

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title="Demo Our Voice Agents - TaskForce AI"
        description="Speak live with our AI voice agents — front-office reservations, commercial-kitchen lead-gen, and refrigerator sales. A no-sign-up demo of TaskForce AI voice agents."
        url="/book-demo"
      />

      {/* Page background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dark-bg" />
        <img
          src={agent.images[0]}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg/90 to-primary-dark/40" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-soft-light"
          style={{ backgroundImage: 'url(/noise.svg)' }}
        />
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
            {AGENTS.length} VOICE AGENTS ONLINE
          </div>
        </div>

        {/* Body — agent carousel */}
        <div className="flex-grow flex flex-col items-center justify-center px-4 py-6 md:py-10">
          {/* Agent selector — at the top so visitors can pick a demo right away */}
          <div className="w-full max-w-5xl mb-6 md:mb-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Choose a demo
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Prev arrow — highlighted, at the top for easy access */}
              <motion.button
                type="button"
                aria-label="Previous agent"
                onClick={() => goToAgent(-1)}
                disabled={callState !== 'idle'}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                className="relative shrink-0 grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent text-white ring-2 ring-white/30 shadow-[0_0_26px_rgba(6,182,212,0.7)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                <ChevronLeft className="relative w-7 h-7" strokeWidth={2.5} />
              </motion.button>

              {/* Agent pills */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {AGENTS.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => selectAgent(i)}
                    disabled={callState !== 'idle'}
                    aria-label={`Show ${a.brand}`}
                    className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 transition disabled:opacity-50 ${
                      i === agentIdx
                        ? 'border-accent/70 bg-accent/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full transition ${
                        i === agentIdx ? 'bg-accent' : 'bg-gray-500 group-hover:bg-gray-300'
                      }`}
                    />
                    <span className="text-xs font-semibold whitespace-nowrap">{a.brand}</span>
                  </button>
                ))}
              </div>

              {/* Next arrow — highlighted, at the top for easy access */}
              <motion.button
                type="button"
                aria-label="Next agent"
                onClick={() => goToAgent(1)}
                disabled={callState !== 'idle'}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                className="relative shrink-0 grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent text-white ring-2 ring-white/30 shadow-[0_0_26px_rgba(6,182,212,0.7)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                <ChevronRight className="relative w-7 h-7" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative w-full max-w-5xl">
            <div className="relative w-full rounded-[2rem] border border-white/10 bg-dark-surface/50 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,102,255,0.15)] overflow-hidden">
              {/* animated gradient border glow */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary-DEFAULT/40 via-transparent to-accent/40 z-0"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Sliding agent card */}
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={agent.id}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <div className="relative grid grid-cols-1 lg:grid-cols-12">
                    {/* LEFT — property / business visual */}
                    <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[640px] overflow-hidden">
                      <motion.img
                        src={agent.images[imgIdx]}
                        onError={() =>
                          setImgIdx((i) => (i + 1 < agent.images.length ? i + 1 : i))
                        }
                        alt={`${agent.brand} — ${agent.location}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: agent.imgPosition ?? 'center' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent pointer-events-none" />

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
                          {agent.brand}
                        </h2>
                        <p className="flex items-center gap-1.5 text-gray-200 text-sm mt-1.5">
                          <MapPin className="w-4 h-4 text-accent" />
                          {agent.location}
                        </p>
                      </motion.div>
                    </div>

                    {/* RIGHT — agent details */}
                    <div className="lg:col-span-7 p-7 md:p-10">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-3">
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
                        {agent.role} · {langMeta(lang).native}
                      </div>

                      <h1 className="text-2xl md:text-[2rem] leading-tight font-bold text-white mb-4">
                        {agent.brand} — {agent.role}
                      </h1>

                      <p className="text-gray-300 leading-relaxed mb-7">
                        {agent.description}
                      </p>

                      {/* Voice language selector */}
                      <div className="mb-3.5">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                          Voice language
                        </label>
                        {multiLang ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setLangOpen((o) => !o)}
                              disabled={callState !== 'idle'}
                              aria-haspopup="listbox"
                              aria-expanded={langOpen}
                              className="w-full flex items-center justify-between gap-3 h-12 px-4 rounded-xl border border-white/15 bg-white/[0.04] text-white hover:border-accent/60 hover:bg-accent/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <span className="flex items-center gap-2.5">
                                <Globe className="w-4 h-4 text-accent" />
                                <span className="text-base leading-none">{langMeta(lang).flag}</span>
                                <span className="font-semibold">{langMeta(lang).native}</span>
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                              />
                            </button>

                            <AnimatePresence>
                              {langOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setLangOpen(false)}
                                  />
                                  <motion.ul
                                    role="listbox"
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-30 mt-2 w-full rounded-xl border border-white/15 bg-dark-surface/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                                  >
                                    {agent.langs.map((value) => {
                                      const l = langMeta(value);
                                      return (
                                        <li key={value} role="option" aria-selected={lang === value}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLang(value);
                                              setLangOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                                          >
                                            <span className="flex items-center gap-2.5">
                                              <span className="text-base leading-none">{l.flag}</span>
                                              <span className="font-medium text-white">{l.native}</span>
                                              <span className="text-xs text-gray-400">{l.label}</span>
                                            </span>
                                            {lang === value && <Check className="w-4 h-4 text-accent" />}
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </motion.ul>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="w-full flex items-center gap-2.5 h-12 px-4 rounded-xl border border-white/15 bg-white/[0.04] text-white">
                            <Globe className="w-4 h-4 text-accent" />
                            <span className="text-base leading-none">{langMeta(agent.langs[0]).flag}</span>
                            <span className="font-semibold">{langMeta(agent.langs[0]).native}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
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
                          {agent.callLabel}
                          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                            Live
                          </span>
                        </span>
                      </motion.button>

                      <p className="text-center text-xs text-gray-500 mb-8 font-mono">
                        No sign-up required · Live agent · ~5 min demo
                      </p>

                      {/* Trained on */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-7">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                          Trained on
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {agent.trainedOn.map((chip) => (
                            <span
                              key={chip}
                              className="px-3.5 py-2 rounded-lg text-sm text-gray-200 bg-white/[0.04] border border-white/10 hover:border-accent/60 hover:bg-accent/10 hover:text-white transition-colors cursor-default"
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
                      <div className="space-y-4">
                        {agent.steps.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-DEFAULT to-accent text-white text-xs font-bold shadow-[0_0_14px_rgba(0,102,255,0.4)]">
                              {i + 1}
                            </span>
                            <p className="text-gray-300 leading-relaxed text-[15px]">
                              <span className="text-white font-semibold">{step.bold}</span>
                              {step.rest}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ---- Live call screen (UI-only) ---- */}
              <AnimatePresence>
                {callState !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center p-8 overflow-hidden"
                  >
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
                          <Mic className="w-12 h-12" />
                          {callState === 'live' && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </motion.div>
                      </div>

                      {callState === 'connecting' ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <h4 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2.5">
                            <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            Connecting you to {agent.agentName}…
                          </h4>
                          <p className="text-gray-300 max-w-sm">
                            The agent is picking up the line. Get ready to speak as a
                            customer calling {agent.brand}.
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
                            {agent.agentName} is on the line
                          </h4>
                          <p className="text-accent font-mono text-2xl mb-5 tabular-nums">
                            {formatTime(seconds)}
                          </p>
                          <div className="w-64 mb-5">
                            <Equalizer />
                          </div>
                          <p className="text-gray-300 max-w-sm mb-2 inline-flex items-center gap-2 justify-center">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Go ahead — ask about {agent.askHint}.
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
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

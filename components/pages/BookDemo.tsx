import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ArrowLeft,
  Globe,
  Shield,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Building2,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlitchButton } from '../ui/GlitchButton';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';

type BookingForm = {
  full_name: string;
  work_email: string;
  company_name: string;
  message: string;
};

const SLOT_OPTIONS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:30 PM',
  '03:00 PM',
  '04:00 PM',
];

export const BookDemo: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Colombo';

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState<BookingForm>({
    full_name: '',
    work_email: '',
    company_name: '',
    message: '',
  });

  const features = [
    {
      icon: Clock,
      title: t('book_demo.features.duration', '30 Minutes'),
      desc: t('book_demo.features.duration_desc', 'Rapid assessment protocol'),
    },
    {
      icon: Globe,
      title: t('book_demo.features.location', 'Remote Uplink'),
      desc: t(
        'book_demo.features.location_desc',
        'Secure Google Meet environment'
      ),
    },
    {
      icon: Shield,
      title: t('book_demo.features.confidential', 'Confidential'),
      desc: t(
        'book_demo.features.confidential_desc',
        'NDAs available upon request'
      ),
    },
  ];

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isSelectable: boolean;
    }> = [];

    for (let i = 0; i < startWeekday; i++) {
      const date = new Date(year, month, -(startWeekday - 1 - i));
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isPast: true,
        isSelectable: false,
      });
    }

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const isPast = dateOnly < todayOnly;
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;

      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isPast,
        isSelectable: !isPast && !isWeekend,
      });
    }

    while (days.length < 35) {
      const nextDay = days.length - (startWeekday + daysInMonth) + 1;
      const date = new Date(year, month + 1, nextDay);
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: false,
        isPast: false,
        isSelectable: false,
      });
    }

    return days;
  }, [currentMonth]);

  const availableSlots = useMemo(() => {
    // Placeholder slots for now.
    // Later, replace this with a call to your get-demo-availability function.
    if (!selectedDate) return [];

    const weekday = selectedDate.getDay();
    if (weekday === 0 || weekday === 6) return [];

    return SLOT_OPTIONS;
  }, [selectedDate]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const selectedMonth = selectedDate.getMonth();
    const currentShownMonth = currentMonth.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const currentShownYear = currentMonth.getFullYear();

    if (selectedMonth !== currentShownMonth || selectedYear !== currentShownYear) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate, currentMonth]);

  const goPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date, isSelectable: boolean) => {
    if (!isSelectable) return;
    setSelectedDate(date);
    setSelectedTime('');
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBackToDates = () => {
    setStep(1);
    setSelectedTime('');
  };

  const handleBackToSlots = () => {
    setStep(2);
  };

  const handleChange = (
    field: keyof BookingForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError('');
  setIsSubmitting(true);

  try {
    if (!selectedDate || !selectedTime) {
      throw new Error('Please select a date and time.');
    }

    const selected_date = selectedDate.toISOString().split('T')[0];

    const payload = {
      full_name: form.full_name.trim(),
      work_email: form.work_email.trim(),
      company_name: form.company_name.trim(),
      message: form.message.trim(),
      selected_date,
      selected_time: selectedTime.trim(),
      timezone,
    };

    // 🔥 Strong validation (prevents 400 errors)
    if (!payload.full_name) {
      throw new Error('Full name is required.');
    }

    if (!payload.work_email) {
      throw new Error('Email is required.');
    }

    if (!/\S+@\S+\.\S+/.test(payload.work_email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!payload.selected_date || !payload.selected_time) {
      throw new Error('Invalid date or time selection.');
    }

    console.log("📤 Sending payload:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    // 🔥 SAFE JSON PARSE
    let result: any = null;
    try {
      result = await response.json();
    } catch {
      throw new Error('Invalid server response.');
    }

    console.log("📥 Server response:", result);

    if (!response.ok) {
      // 🔥 Show REAL backend error
      throw new Error(
        result?.error ||
        result?.details?.error?.message ||
        'Booking failed. Please try again.'
      );
    }

    // ✅ Success
    setStep(4);

  } catch (error: any) {
    console.error('❌ Booking error:', error);

    setSubmitError(
      error?.message ||
      'Something went wrong. Please try again.'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title="Book a Demo - AI TaskForce"
        description="Schedule a 30-minute discovery call to see how AI TaskForce can automate your business operations."
        url="/book-demo"
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          <GlitchButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider group border border-transparent hover:border-white/10 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('book_demo.abort', 'Return')}
          </GlitchButton>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-primary-light bg-primary-DEFAULT/10 px-3 py-1 rounded-full border border-primary-DEFAULT/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-DEFAULT opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-DEFAULT"></span>
            </span>
            {t('book_demo.secure_connection', 'SYSTEM PROTOCOL')}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center px-4 py-4 md:py-12">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tighter leading-none">
                  {t('book_demo.title_prefix', 'Initialize')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">
                    <ScrambleText
                      text={t('book_demo.title_suffix', 'Deployment.')}
                      startDelay={500}
                    />
                  </span>
                </h1>

                <p className="text-gray-400 leading-relaxed mb-8 text-base md:text-lg">
                  {t(
                    'book_demo.subtitle',
                    'Schedule a high-velocity strategy session. Our AI Architects will map your infrastructure and identify automation vectors.'
                  )}
                </p>
              </motion.div>

              <div className="space-y-4">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors duration-300 group"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-gray-400 group-hover:text-primary-light group-hover:border-primary-DEFAULT/30 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-wide group-hover:text-primary-light transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-500 text-xs font-mono mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
              <TechPanel className="bg-dark-surface/60 backdrop-blur-xl border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] min-h-[620px] md:min-h-[700px] flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {step === 1 && <CalendarDays className="w-4 h-4 text-primary-light" />}
                    {step === 2 && <Clock className="w-4 h-4 text-primary-light" />}
                    {step === 3 && <User className="w-4 h-4 text-primary-light" />}
                    {step === 4 && <CheckCircle2 className="w-4 h-4 text-primary-light" />}

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-mono">
                        {t('book_demo.system_protocol', 'SYSTEM PROTOCOL')}
                      </p>
                      <h3 className="text-white font-bold text-2xl md:text-3xl">
                        {step === 1 && 'Temporal Selection'}
                        {step === 2 && 'Slot Allocation'}
                        {step === 3 && 'Identity Verification'}
                        {step === 4 && 'Deployment Active'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1.5 w-10 rounded-full transition-all ${
                          step >= n ? 'bg-primary-DEFAULT' : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex-1 p-8 md:p-10">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-3xl font-bold text-white">{monthLabel}</h4>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={goPrevMonth}
                              className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-300" />
                            </button>
                            <button
                              type="button"
                              onClick={goNextMonth}
                              className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-300" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-3 mb-4 text-center text-xs font-mono uppercase tracking-widest text-gray-500">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d}>{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                          {calendarDays.map((day, idx) => {
                            const isSelected =
                              selectedDate &&
                              day.date.toDateString() === selectedDate.toDateString();

                            return (
                              <button
                                key={`${day.date.toISOString()}-${idx}`}
                                type="button"
                                onClick={() => handleDateSelect(day.date, day.isSelectable)}
                                disabled={!day.isSelectable}
                                className={[
                                  'aspect-square rounded-2xl border text-sm md:text-base transition-all',
                                  day.isCurrentMonth
                                    ? 'border-white/10'
                                    : 'border-white/5 text-gray-700',
                                  day.isSelectable
                                    ? 'bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary-DEFAULT/40'
                                    : 'bg-white/[0.01] cursor-not-allowed',
                                  isSelected
                                    ? 'border-primary-DEFAULT bg-primary-DEFAULT/10 text-white shadow-[0_0_24px_rgba(0,102,255,0.15)]'
                                    : '',
                                  day.isPast ? 'text-gray-700' : 'text-gray-300',
                                ].join(' ')}
                              >
                                {day.dayNumber}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <button
                            type="button"
                            onClick={handleBackToDates}
                            className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-300" />
                          </button>

                          <div>
                            <h4 className="text-2xl md:text-3xl font-bold text-white">
                              Available slots for{' '}
                              <span className="text-primary-light">{selectedDateLabel}</span>
                            </h4>
                            <p className="text-xs md:text-sm text-gray-500 mt-2 font-mono">
                              * All times are in your local timezone ({timezone})
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSelect(slot)}
                              className="h-16 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary-DEFAULT/40 transition-all font-mono tracking-wide text-white"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>

                        {availableSlots.length === 0 && (
                          <div className="mt-10 text-center text-gray-400">
                            No available slots for this date.
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="flex items-start gap-4 mb-8">
                          <button
                            type="button"
                            onClick={handleBackToSlots}
                            className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center transition shrink-0"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-300" />
                          </button>

                          <div>
                            <h4 className="text-2xl md:text-3xl font-bold text-white">
                              Mission Parameters
                            </h4>
                            <p className="text-sm text-gray-500 mt-2 font-mono">
                              {selectedDateLabel} @ {selectedTime}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmitBooking} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs font-mono uppercase tracking-widest text-gray-500">
                                Your Identity
                              </label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                  type="text"
                                  required
                                  value={form.full_name}
                                  onChange={(e) =>
                                    handleChange('full_name', e.target.value)
                                  }
                                  placeholder="Full Name"
                                  className="w-full h-14 rounded-xl border border-white/10 bg-white/[0.02] pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-mono uppercase tracking-widest text-gray-500">
                                Digital Uplink
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                  type="email"
                                  required
                                  value={form.work_email}
                                  onChange={(e) =>
                                    handleChange('work_email', e.target.value)
                                  }
                                  placeholder="Work Email Address"
                                  className="w-full h-14 rounded-xl border border-white/10 bg-white/[0.02] pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-gray-500">
                              Organization
                            </label>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                value={form.company_name}
                                onChange={(e) =>
                                  handleChange('company_name', e.target.value)
                                }
                                placeholder="Company Name"
                                className="w-full h-14 rounded-xl border border-white/10 bg-white/[0.02] pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-gray-500">
                              Mission Intelligence
                            </label>
                            <div className="relative">
                              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                              <textarea
                                rows={5}
                                value={form.message}
                                onChange={(e) =>
                                  handleChange('message', e.target.value)
                                }
                                placeholder="Current operational bottlenecks..."
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5 resize-none"
                              />
                            </div>
                          </div>

                          <div className="pt-2">
                            <GlitchButton
                              className="w-full h-16 text-lg flex items-center justify-center gap-2"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Booking...
                                </>
                              ) : (
                                <>
                                  Initialize Deployment
                                  <ArrowRight className="w-5 h-5" />
                                </>
                              )}
                            </GlitchButton>

                            {submitError && (
                              <p className="text-red-400 text-sm text-center mt-4">
                                {submitError}
                              </p>
                            )}
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center"
                      >
                        <div className="w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8 relative">
                          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                          <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                        </div>

                        <h4 className="text-4xl md:text-5xl font-bold text-white mb-5">
                          Deployment Initialized
                        </h4>

                        <p className="text-gray-400 max-w-xl text-lg leading-relaxed mb-8">
                          Strategy session confirmed. Calendar invite and preliminary
                          briefing materials have been transmitted to{' '}
                          <span className="text-white">{form.work_email}</span>.
                        </p>

                        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-8">
                          <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
                              Date
                            </span>
                            <span className="text-white font-mono">{selectedDateLabel}</span>
                          </div>
                          <div className="flex justify-between py-3">
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
                              Time
                            </span>
                            <span className="text-white font-mono">{selectedTime}</span>
                          </div>
                        </div>

                        <GlitchButton onClick={() => navigate('/')}>
                          Return to Base
                        </GlitchButton>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TechPanel>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, MessageSquare, Send, ArrowLeft, CheckCircle2, Terminal } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { GlitchButton } from '../ui/GlitchButton';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { Footer } from '../layout/Footer';
import { useServicesData } from '../../hooks/useServicesData';
import { SEO } from '../seo/SEO';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const servicesData = useServicesData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agent');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const targetAgent = agentId ? servicesData.find((s) => s.id === agentId) : null;

  const uniqueFormId = targetAgent
    ? `FORM_AG-${targetAgent.id.toUpperCase().replace(/-/g, '_')}_REQ`
    : 'FORM_HQ_GENERAL_INQUIRY';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    agent_id: agentId || 'general-inquiry',
    form_id: uniqueFormId,
  });

  const [submittedEmail, setSubmittedEmail] = useState('');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      agent_id: agentId || 'general-inquiry',
      form_id: uniqueFormId,
    }));
  }, [agentId, uniqueFormId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedEmail(formData.email.trim());
    setIsSending(true);
    setSubmitError('');

    try {
      const submissionPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        agent_id: agentId || 'general-inquiry',
        form_id: uniqueFormId,
      };

      const { error: insertError } = await supabase
        .from('contact_submissions')
        .insert([submissionPayload]);

      if (insertError) {
        throw insertError;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(submissionPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error
            ? typeof result.error === 'string'
              ? result.error
              : JSON.stringify(result.error)
            : 'Failed to send email'
        );
      }

      setIsSubmitted(true);

      setFormData({
        name: '',
        email: '',
        message: '',
        agent_id: agentId || 'general-inquiry',
        form_id: uniqueFormId,
      });
    } catch (error: any) {
      console.error('Failed to submit contact form:', error);
      setSubmitError(error?.message || 'Submission failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white">
      <SEO
        title="Contact HQ - TaskForce AI"
        description="Connect with our AI Architects to discuss enterprise deployment and custom integration."
        url="/contact"
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          <GlitchButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider group border border-transparent hover:border-white/10 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('contact.return')}
          </GlitchButton>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-primary-light bg-primary-DEFAULT/10 px-3 py-1 rounded-full border border-primary-DEFAULT/20">
            <div className="w-2 h-2 rounded-full bg-primary-DEFAULT animate-pulse" />
            {t('contact.uplink_established')}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 mb-6">
                  <Terminal className="w-3 h-3" />
                  <span>{t('contact.comm_channel')}</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-none text-white">
                  {t('contact.title_prefix')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">
                    <ScrambleText text={t('contact.title_suffix')} startDelay={500} />
                  </span>
                </h1>

                <p className="text-gray-400 leading-relaxed mb-8 text-base md:text-lg">
                  {targetAgent
                    ? t('contact.subtitle_agent', { agent: targetAgent.title })
                    : t('contact.subtitle_default')}
                </p>
              </motion.div>

              <TechPanel className="p-6 rounded-2xl bg-white/[0.03] border-white/5 relative overflow-hidden group">
                <h3 className="font-bold text-white mb-2 relative z-10">
                  {t('contact.automated_protocol')}
                </h3>
                <p className="text-sm text-gray-400 relative z-10">
                  <Trans i18nKey="contact.protocol_desc" values={{ id: uniqueFormId }}>
                    Submitting this form triggers unique identifier sequence{' '}
                    <span className="font-mono text-primary-light break-all">{uniqueFormId}</span>.
                    Expect an immediate briefing document in your inbox.
                  </Trans>
                </p>
              </TechPanel>
          

<div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-dark-surface/60 backdrop-blur-xl">

<div className="mt-6 relative rounded-2xl overflow-hidden border border-white/10">

  {/* 🗺️ MAP */}
<iframe
  src="https://maps.google.com/maps?q=Taskforce+AI+Voice+Agents+Sri+Lanka&hl=en&z=16&t=k&output=embed"
  width="100%"
  height="420"
  style={{ border: 0 }}
  loading="lazy"
  className="w-full"
/>

  {/* ⚪ WHITE CARD OVERLAY */}
  <div className="absolute top-4 left-4 z-10 w-[300px] bg-white text-black rounded-xl shadow-lg p-4 border border-gray-200">
    
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-sm">
          Taskforce AI Voice Agents Sri Lanka
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Business Automation | Whatsapp Chatbot
        </p>
      </div>
    </div>

    <p className="text-xs text-gray-700 mt-3">
      Nugegoda Business Center, Unit 37, 2nd Floor,<br />
      80 Nawala Rd, Nugegoda 10250
    </p>

    <p className="text-xs text-gray-400 mt-2">
      No reviews
    </p>
  </div>

</div>

</div>
            </div>
             
            <div className="lg:col-span-7 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <TechPanel
                  className="bg-dark-surface/60 backdrop-blur-xl border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col"
                  animateScan={true}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  <div className="relative z-10 p-8 md:p-12">
                    <AnimatePresence mode="wait">
                      {!isSubmitted ? (
                        <motion.form
                          key="form"
                          id={uniqueFormId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmit}
                          className="space-y-6"
                        >
                          <input type="hidden" name="agent_id" value={agentId || 'general-inquiry'} />
                          <input type="hidden" name="form_id" value={uniqueFormId} />

                          <div className="space-y-2 group">
                            <label className="text-xs font-mono uppercase text-gray-500 group-focus-within:text-primary-light transition-colors">
                              {t('contact.form.identity')}
                            </label>
                            <div className="relative">
                              <User className="absolute top-1/2 -translate-y-1/2 left-4 w-4 h-4 text-gray-500 group-focus-within:text-primary-light transition-colors" />
                              <input
                                type="text"
                                required
                                placeholder={t('contact.form.name_placeholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600
                                  focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5 focus:ring-1 focus:ring-primary-DEFAULT/50
                                  focus:shadow-[0_0_30px_rgba(0,102,255,0.1)] outline-none transition-all duration-300"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 group">
                            <label className="text-xs font-mono uppercase text-gray-500 group-focus-within:text-primary-light transition-colors">
                              {t('contact.form.uplink')}
                            </label>
                            <div className="relative">
                              <Mail className="absolute top-1/2 -translate-y-1/2 left-4 w-4 h-4 text-gray-500 group-focus-within:text-primary-light transition-colors" />
                              <input
                                type="email"
                                required
                                placeholder={t('contact.form.email_placeholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600
                                  focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5 focus:ring-1 focus:ring-primary-DEFAULT/50
                                  focus:shadow-[0_0_30px_rgba(0,102,255,0.1)] outline-none transition-all duration-300"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 group">
                            <label className="text-xs font-mono uppercase text-gray-500 group-focus-within:text-primary-light transition-colors">
                              {t('contact.form.content')}
                            </label>
                            <div className="relative">
                              <MessageSquare className="absolute top-4 left-4 w-4 h-4 text-gray-500 group-focus-within:text-primary-light transition-colors" />
                              <textarea
                                placeholder={t('contact.form.message_placeholder')}
                                rows={4}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600
                                  focus:border-primary-DEFAULT/50 focus:bg-primary-DEFAULT/5 focus:ring-1 focus:ring-primary-DEFAULT/50
                                  focus:shadow-[0_0_30px_rgba(0,102,255,0.1)] outline-none transition-all duration-300 resize-none"
                              />
                            </div>
                          </div>

                          <div className="pt-4">
                            <GlitchButton
                              className="w-full flex justify-center py-5 text-lg shadow-xl group"
                              disabled={isSending}
                            >
                              {isSending ? 'Sending...' : t('contact.form.submit')}
                              <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </GlitchButton>

                            {submitError && (
                              <p className="text-red-400 text-sm text-center mt-3 break-words">
                                {submitError}
                              </p>
                            )}
                          </div>

                          {targetAgent && (
                            <p className="text-center text-xs text-gray-500 font-mono mt-4">
                              {t('contact.form.secure_id')}{' '}
                              <span className="text-primary-light">{uniqueFormId}</span>
                            </p>
                          )}
                        </motion.form>
                      ) : (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-center"
                        >
                          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                            <CheckCircle2 className="w-10 h-10 text-green-500 relative z-10" />
                          </div>

                          <h3 className="text-3xl font-bold text-white mb-4">
                            {t('contact.success.title')}
                          </h3>

                          <p className="text-gray-400 mb-8 max-w-md">
                            Our systems have logged your inquiry. An automated briefing
                            document regarding{' '}
                            <span className="text-white">
                              {targetAgent ? targetAgent.title : 'General Inquiry'}
                            </span>{' '}
                            has been dispatched to{' '}
                            <span className="text-primary-light font-medium">
                              {submittedEmail}
                            </span>.
                          </p>

                          <div className="text-xs font-mono text-gray-600 mb-6 bg-white/5 px-4 py-2 rounded-lg">
                            {t('contact.success.ref_id')} {uniqueFormId}
                          </div>

                          <GlitchButton onClick={() => navigate('/')}>
                            {t('contact.success.return')}
                          </GlitchButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  

                  
                </TechPanel>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}; 
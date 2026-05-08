import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { TechPanel } from '../ui/TechPanel';
import { GlitchButton } from '../ui/GlitchButton';
import { Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const navigate = useNavigate();

  React.useEffect(() => {
    // Inject Cloudflare Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Global callback for Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      document.body.removeChild(script);
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify Turnstile
    if (!turnstileToken) {
      setError('Please complete the security check.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login failed', err);
      setError('Invalid credentials. Please check your email and password.');
      // Reset Turnstile if needed (often handled by the widget itself)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <TechPanel className="bg-[#0F1115] p-8 md:p-10 rounded-3xl" animateScan={false}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary-light" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-gray-400 text-sm mt-2">Authenticate to access the command center</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-white/10 transition-all"
                placeholder="admin@ai-taskforce.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-center my-4">
               {/* Cloudflare Turnstile Widget */}
               {/* Replace data-sitekey with your actual Cloudflare Site Key */}
               <div 
                 className="cf-turnstile" 
                 data-sitekey="0x4AAAAAACHDnDWZ-1DnCi6R" 
                 data-callback="onTurnstileSuccess"
                 data-theme="dark"
               ></div>
            </div>

            <GlitchButton 
              className="w-full justify-center py-4 mt-2"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Initialize Session'}
            </GlitchButton>
          </form>
        </TechPanel>
      </motion.div>
    </div>
  );
};

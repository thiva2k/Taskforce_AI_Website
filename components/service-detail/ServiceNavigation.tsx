
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { GlitchButton } from '../ui/GlitchButton';

interface ServiceNavigationProps {
  title: string;
}

export const ServiceNavigation: React.FC<ServiceNavigationProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 py-6 pointer-events-none">
      <div className="container mx-auto max-w-7xl flex justify-between items-center pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
        >
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <span className="text-gray-600">/</span>
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Solutions
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-primary-light text-sm font-bold tracking-wide">{title}</span>
        </motion.div>

        <GlitchButton 
          variant="secondary" 
          className="!py-2 !px-4 !text-xs uppercase tracking-widest hidden md:flex"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-3 h-3 mr-2" /> Back
        </GlitchButton>
      </div>
    </div>
  );
};

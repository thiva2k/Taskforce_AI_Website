
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Map } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    targetId: 'hero',
    title: 'Welcome, Commander',
    description: 'Your workforce evolution begins here. Discover how our AI agents act as your digital employees.'
  },
  {
    targetId: 'process',
    title: 'Identify Bottlenecks',
    description: 'Manual tasks slow you down. We help you pinpoint the inefficiencies in your current operations.'
  },
  {
    targetId: 'solutions',
    title: 'The Arsenal',
    description: 'Deploy specialized AI agents. From voice handling to document processing, our tools tackle complex workflows autonomously.'
  },
  {
    targetId: 'results',
    title: 'Measurable Impact',
    description: 'See real numbers. Our clients save 40+ hours weekly and reduce costs by 65%.'
  },
  {
    targetId: 'cta',
    title: 'Take Action',
    description: 'Ready to transform? Schedule your free consultation today.'
  }
];

export const Tour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tour has been seen
    const hasSeenTour = localStorage.getItem('ai_taskforce_tour_seen');
    if (hasSeenTour !== 'true') {
      // Small delay to ensure smooth entry after page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Scroll to the target section when step changes
      const targetId = steps[currentStep].targetId;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('ai_taskforce_tour_seen', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-8 right-8 z-50 max-w-sm w-full hidden md:block"
    >
      <div className="bg-dark-surface/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-white/5 w-full">
          <motion.div
            className="h-full bg-brand-gradient"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="p-6 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 text-xs font-mono text-accent">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span>TOUR: STEP {currentStep + 1}/{steps.length}</span>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Container with AnimatePresence */}
          <div className="min-h-[140px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="absolute inset-0"
                // Container handles exit synchronization
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {/* Title Animation: Subtle Scale Up & Fade In */}
                <motion.h3
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.2, 0.65, 0.3, 0.9] // Premium easing
                  }}
                  className="text-xl font-bold text-white mb-3 origin-left"
                >
                  {steps[currentStep].title}
                </motion.h3>
                
                {/* Description Animation: Fade In with Delayed Vertical Slide */}
                <motion.p
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ 
                    delay: 0.2, 
                    duration: 0.5, 
                    ease: "easeOut" 
                  }}
                  className="text-gray-400 text-sm leading-relaxed"
                >
                  {steps[currentStep].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    i === currentStep ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`p-2 rounded-lg border border-white/10 transition-colors ${
                  currentStep === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-DEFAULT/20 transition-all duration-300"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

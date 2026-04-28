import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

interface AsyncLottieProps {
  url: string;
  className?: string;
}

const AsyncLottie: React.FC<AsyncLottieProps> = ({ url, className = '' }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchAnimation = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          // Silently fail to fallback if 404 or other error
          throw new Error(`Failed to load Lottie: ${response.statusText}`);
        }
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        // Only log warn in dev, generic error handling
        console.warn('Lottie load failed, switching to fallback:', err);
        setError(true);
      }
    };

    fetchAnimation();
  }, [url]);

  // Fallback UI if Lottie fails to load - matches the "Abstract Tech" vibe
  if (error || (!animationData && error)) {
    return (
      <div className={`${className} overflow-hidden relative`}>
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-primary-DEFAULT/10 to-secondary-DEFAULT/10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {/* Abstract Shapes Fallback */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-DEFAULT/20 blur-[80px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-secondary-DEFAULT/20 blur-[80px] rounded-full mix-blend-screen" />
      </div>
    );
  }

  if (!animationData) {
    return <div className={`${className} opacity-0 transition-opacity duration-500`} />;
  }

  return (
    <div className={className}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        autoplay={true}
        className="w-full h-full"
      />
    </div>
  );
};

export default AsyncLottie;
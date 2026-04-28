import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrambleTextProps {
  text: string;
  className?: string;
  scrambleSpeed?: number;
  revealSpeed?: number;
  scrambleChars?: string;
  startDelay?: number;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  scrambleSpeed = 50,
  revealSpeed = 100,
  scrambleChars = '!<>-_\\/[]{}—=+*^?#________',
  startDelay = 0,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const startScramble = () => {
      intervalRef.current = setInterval(() => {
        const scrambled = text
          .split('')
          .map((char, index) => {
            if (index < currentIndex) {
              return char;
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('');

        setDisplayText(scrambled);
        frameRef.current++;

        if (frameRef.current % (revealSpeed / scrambleSpeed) === 0) {
            currentIndex++;
        }

        if (currentIndex > text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsScrambling(false);
          setDisplayText(text);
        }
      }, scrambleSpeed);
    };

    if (startDelay > 0) {
      timeoutId = setTimeout(startScramble, startDelay);
    } else {
      startScramble();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeoutId);
    };
  }, [text, scrambleSpeed, revealSpeed, scrambleChars, startDelay]);

  return (
    <motion.span className={className}>
      {displayText}
    </motion.span>
  );
};

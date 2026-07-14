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

export const ScrambleText: React.FC<ScrambleTextProps & { renderStaticText?: boolean }> = ({
  text,
  renderStaticText = false,
  className = '',
  scrambleSpeed = 50,
  revealSpeed = 100,
  scrambleChars = '!<>-_\\/[]{}—=+*^?#________',
  startDelay = 0,
}) => {
  // Show full text immediately (no scramble animation) when:
  //   - the caller opts in via renderStaticText, or
  //   - we are inside the Puppeteer prerender. prerender.js sets
  //     window.__IS_PRERENDER__ = true before any app JS runs, so crawlers
  //     always capture clean, readable headings instead of scramble glyphs.
  const isStatic =
    renderStaticText ||
    (typeof window !== 'undefined' && (window as any).__IS_PRERENDER__ === true);

  const [displayText, setDisplayText] = useState(isStatic ? text : '');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isStatic) return;

    setDisplayText('');
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout | undefined;

    const startScramble = () => {
      intervalRef.current = setInterval(() => {
        const scrambled = text
          .split('')
          .map((char, index) => {
            if (index < currentIndex) return char;
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('');

        setDisplayText(scrambled);
        frameRef.current++;

        if (frameRef.current % (revealSpeed / scrambleSpeed) === 0) currentIndex++;

        if (currentIndex > text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayText(text);
        }
      }, scrambleSpeed);
    };

    if (startDelay > 0) timeoutId = setTimeout(startScramble, startDelay);
    else startScramble();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, scrambleSpeed, revealSpeed, scrambleChars, startDelay, isStatic]);

  return <span className={className}>{displayText}</span>;
};

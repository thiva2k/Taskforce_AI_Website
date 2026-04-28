import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const logs = [
  "INITIALIZING_CORE_SYSTEMS...",
  "ESTABLISHING_SECURE_CONNECTION...",
  "LOADING_NEURAL_NETWORKS...",
  "OPTIMIZING_WORKFLOW_PROTOCOLS...",
  "DETECTING_USER_ENVIRONMENT...",
  "SYNCING_DATA_STREAMS...",
  "ACTIVATING_AI_AGENTS...",
  "SYSTEM_READY.",
  "MONITORING_ACTIVE_TASKS...",
  "ANALYZING_PERFORMANCE_METRICS...",
  "ENCRYPTING_COMMUNICATION_CHANNELS...",
  "VERIFYING_INTEGRITY...",
  "DEPLOYING_ASSETS...",
  "WAITING_FOR_INPUT..."
];

export const SystemLog: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLines(prev => {
        const newLines = [...prev, `> ${logs[index % logs.length]}`];
        if (newLines.length > 6) newLines.shift(); // Keep last 6 lines
        return newLines;
      });
      index++;
    }, 1500); // Add new log every 1.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] md:text-xs text-primary-light/60 pointer-events-none select-none">
      <div className="border-l border-primary-DEFAULT/20 pl-2 h-[100px] overflow-hidden flex flex-col justify-end relative">
        {/* Fade mask */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-dark-bg to-transparent z-10" />
        
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="whitespace-nowrap"
          >
            {line}
            {i === lines.length - 1 && (
              <span className="animate-pulse inline-block ml-1 w-1.5 h-2.5 bg-primary-DEFAULT/50 align-middle" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

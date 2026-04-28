
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchButton } from '../ui/GlitchButton';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { 
  Layout, Activity, Terminal, GitBranch, Search, Bell, Plus, MoreHorizontal, 
  FileText, Cpu, Database, Zap, CheckCircle2, Command, BarChart3, Globe,
  Lock, Settings, ArrowRight, Box, Users, CreditCard, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceInterfaceProps {
  serviceId?: string;
}

type ViewMode = 'dashboard' | 'logic' | 'terminal';

export const ServiceInterface: React.FC<ServiceInterfaceProps> = ({ serviceId }) => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const navigate = useNavigate();
  const isCustomSoftware = serviceId === 'custom-software';

  // Reset view when service changes
  useEffect(() => {
    setActiveView('dashboard');
  }, [serviceId]);

  return (
    <section className="px-6 py-24 relative z-10 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-DEFAULT/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-accent mb-4 backdrop-blur-md"
            >
              <Command className="w-3 h-3" />
              <span>INTERACTIVE PREVIEW</span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              <ScrambleText text={isCustomSoftware ? 'User-Centric Interface' : 'Live Agent Environment'} startDelay={500} />
            </h2>
            <p className="text-gray-400 mt-4 text-base md:text-lg max-w-xl leading-relaxed">
              {isCustomSoftware 
                ? "Experience intuitive design patterns that reduce training time and maximize adoption across your organization."
                : "Peer inside the neural architecture. Monitor real-time decision making, logic flows, and execution logs."}
            </p>
          </div>

          {/* View Controller (Only for Agent Services) */}
          {!isCustomSoftware && (
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-xl flex items-center backdrop-blur-md">
              {[
                { id: 'dashboard', label: 'Live Analytics', icon: BarChart3 },
                { id: 'logic', label: 'Neural Logic', icon: GitBranch },
                { id: 'terminal', label: 'System Core', icon: Terminal },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as ViewMode)}
                  className={`
                    relative px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeView === view.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {activeView === view.id && (
                    <motion.div
                      layoutId="interfaceTab"
                      className="absolute inset-0 bg-primary-DEFAULT rounded-lg shadow-lg shadow-primary-DEFAULT/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <view.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{view.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Interface Window */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative group"
        >
          <TechPanel 
            className="shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[500px] md:min-h-[600px] flex flex-col rounded-xl"
            animateScan={true}
          >
          {/* Window Chrome / Status Bar */}
          <div className="h-10 md:h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 select-none">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
              <Lock className="w-3 h-3" />
              <span className="uppercase tracking-widest">
                {isCustomSoftware ? 'Nexus_OS_v2.4.1' : `AGENT_${serviceId?.toUpperCase().replace(/-/g, '_')}_RUNNING`}
              </span>
            </div>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          {/* Content Area */}
          <div className="flex-1 relative bg-dark-bg overflow-hidden flex flex-col">
            {/* Ambient Noise Texture */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {isCustomSoftware ? (
                <CustomAppView key="custom" />
              ) : (
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full flex flex-col"
                >
                  {activeView === 'dashboard' && <DashboardView />}
                  {activeView === 'logic' && <LogicFlowView />}
                  {activeView === 'terminal' && <TerminalView />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Toolbar (Decoration) */}
          <div className="h-8 border-t border-white/5 bg-[#050505] flex items-center justify-between px-4 text-[10px] font-mono text-gray-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ONLINE</span>
              <span>LATENCY: 12ms</span>
            </div>
            <div className="flex gap-4">
               <span>CPU: 14%</span>
               <span>MEM: 2.1GB</span>
            </div>
          </div>
          </TechPanel>
        </motion.div>

        <div className="flex justify-center mt-12">
          <GlitchButton variant="secondary" onClick={() => navigate('/book-demo')} className="border-white/10 hover:bg-white/5">
             Start Building Your Agent
          </GlitchButton>
        </div>
      </div>
    </section>
  );
};

// --- SUB-COMPONENTS ---

const DashboardView = () => (
  <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
    {/* Sidebar */}
    <div className="w-16 md:w-64 border-r border-white/5 bg-white/[0.02] flex-shrink-0 flex flex-col">
      <div className="p-4 border-b border-white/5 hidden md:block">
        <div className="text-xs font-bold text-white mb-1">Analytics Overview</div>
        <div className="text-[10px] text-gray-500">Real-time Performance</div>
      </div>
      <div className="p-2 space-y-1">
        {[
          { label: 'Overview', icon: Layout, active: true },
          { label: 'Live Traffic', icon: Globe, active: false },
          { label: 'Performance', icon: Activity, active: false },
          { label: 'Settings', icon: Settings, active: false },
        ].map((item, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${item.active ? 'bg-primary-DEFAULT/10 text-primary-light' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="hidden md:block text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-dark-bg to-dark-surface">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border-b border-white/5">
        {[
          { label: "Requests/sec", val: "2,405", color: "text-white" },
          { label: "Avg Latency", val: "42ms", color: "text-green-400" },
          { label: "Error Rate", val: "0.01%", color: "text-white" },
          { label: "Uptime", val: "99.99%", color: "text-primary-light" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0A] p-6 group hover:bg-[#0F0F0F] transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{stat.label}</div>
            <div className={`text-xl md:text-2xl font-mono font-bold ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Graph */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6 relative overflow-hidden min-h-[250px] flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-light" /> 
                    Throughput Velocity
                  </h4>
                  <div className="flex gap-2">
                     <span className="w-2 h-2 rounded-full bg-primary-DEFAULT animate-pulse" />
                     <span className="text-[10px] text-primary-light font-mono">LIVE</span>
                  </div>
               </div>
               
               {/* CSS/SVG Graph Simulation */}
               <div className="flex-1 flex items-end gap-1 h-[150px] w-full">
                  {Array.from({ length: 40 }).map((_, i) => {
                     const height = 30 + Math.random() * 70;
                     return (
                        <motion.div 
                           key={i}
                           initial={{ height: 0 }}
                           animate={{ height: `${height}%` }}
                           transition={{ duration: 1, delay: i * 0.02, repeat: Infinity, repeatType: "reverse", repeatDelay: Math.random() * 2 }}
                           className="flex-1 bg-gradient-to-t from-primary-DEFAULT/50 to-primary-light/80 rounded-t-sm opacity-60 hover:opacity-100 transition-opacity"
                        />
                     )
                  })}
               </div>
               
               {/* Grid Lines */}
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Side Stats */}
            <div className="space-y-4">
               <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4">Resource Allocation</h4>
                  <div className="space-y-4">
                     {['Neural Engine', 'Memory Heap', 'I/O Stream'].map((item, i) => (
                        <div key={i}>
                           <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>{item}</span>
                              <span className="text-white font-mono">{40 + Math.floor(Math.random() * 40)}%</span>
                           </div>
                           <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${40 + Math.random() * 40}%` }}
                                 transition={{ duration: 1.5 }}
                                 className={`h-full rounded-full ${i === 0 ? 'bg-accent' : i === 1 ? 'bg-secondary-DEFAULT' : 'bg-primary-DEFAULT'}`} 
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-gradient-to-br from-primary-DEFAULT/20 to-transparent border border-primary-DEFAULT/20 rounded-xl p-6 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary-DEFAULT/20 text-primary-light">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <div className="text-xs text-primary-light font-mono uppercase">Optimization</div>
                     <div className="text-white font-bold">Autoscale Enabled</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
);

const LogicFlowView = () => (
  <div className="w-full h-full flex flex-col relative bg-[#0D0D0D]">
    {/* Editor Toolbar */}
    <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 z-20">
       <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
             <GitBranch className="w-4 h-4 text-accent" />
             <span>Workflow Editor</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-xs text-gray-500 font-mono">read-only mode</div>
       </div>
       <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-gray-400">v2.1.0</div>
          <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> ACTIVE
          </div>
       </div>
    </div>
    
    {/* Canvas Area */}
    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-8 p-8">
            {/* Connection Lines (Absolute) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block">
               {/* Line 1 -> 2 */}
               <path d="M 33% 50% L 50% 50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
               <motion.circle r="3" fill="#06B6D4">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 33% 50% L 50% 50%" />
               </motion.circle>
               
               {/* Line 2 -> 3 */}
               <path d="M 50% 50% L 67% 50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
               <motion.circle r="3" fill="#06B6D4">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 50% 50% L 67% 50%" />
               </motion.circle>
            </svg>

            {/* Node 1: Trigger */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 w-48">
               <div className="bg-dark-surface border border-white/10 rounded-xl p-4 shadow-xl hover:border-yellow-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  </div>
                  <div className="text-xs font-mono text-gray-500 uppercase mb-1">Trigger</div>
                  <div className="text-sm font-bold text-white">Event Received</div>
               </div>
            </motion.div>

            {/* Node 2: Processing */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="relative z-10 w-56">
               <div className="bg-dark-surface border border-primary-DEFAULT/50 rounded-xl p-5 shadow-[0_0_30px_rgba(0,102,255,0.15)] group relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary-DEFAULT/5 opacity-50" />
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-DEFAULT/20 flex items-center justify-center text-primary-light">
                           <Cpu className="w-5 h-5" />
                        </div>
                        <div className="flex gap-1">
                           <span className="w-1 h-1 rounded-full bg-primary-light animate-ping" />
                        </div>
                     </div>
                     <div className="text-xs font-mono text-primary-light uppercase mb-1">Processing</div>
                     <div className="text-sm font-bold text-white">Neural Analysis</div>
                     
                     <div className="mt-3 w-full h-1 bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                           className="h-full bg-primary-DEFAULT" 
                           animate={{ width: ["0%", "100%"] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Node 3: Action */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="relative z-10 w-48">
               <div className="bg-dark-surface border border-white/10 rounded-xl p-4 shadow-xl hover:border-accent/50 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Database className="w-5 h-5" />
                     </div>
                     <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-green-500 transition-colors" />
                  </div>
                  <div className="text-xs font-mono text-gray-500 uppercase mb-1">Output</div>
                  <div className="text-sm font-bold text-white">Update Record</div>
               </div>
            </motion.div>
        </div>
    </div>
  </div>
);

const TerminalView = () => {
  const [lines, setLines] = useState<string[]>([]);
  
  const bootSequence = [
    { text: "Initializing secure connection...", color: "text-gray-400" },
    { text: "Verifying encrypted handshake [OK]", color: "text-green-400" },
    { text: "Loading core modules...", color: "text-gray-400" },
    { text: "> Neural_Engine v4.2 loaded", color: "text-blue-400" },
    { text: "> Context_Manager loaded", color: "text-blue-400" },
    { text: "> Safety_Protocols loaded", color: "text-blue-400" },
    { text: "Establishing uplink to Agent Cluster...", color: "text-gray-400" },
    { text: "Connection established (Latency: 14ms)", color: "text-green-400" },
    { text: "Listening for events...", color: "text-white animate-pulse" }
  ];

  useEffect(() => {
    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 300 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, `<span class="${line.color}">${line.text}</span>`]);
      }, delay);
    });
  }, []);

  return (
    <div className="w-full h-full bg-[#0D0D0D] p-0 font-mono text-xs md:text-sm text-gray-300 flex flex-col">
      <div className="flex items-center px-4 py-3 bg-white/[0.03] border-b border-white/5 shrink-0">
         <div className="flex items-center gap-2 text-gray-500">
           <Terminal className="w-4 h-4" />
           <span>system_log.txt</span>
         </div>
         <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-600">
           <span>UTF-8</span>
           <span>READ-ONLY</span>
         </div>
      </div>
      <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar font-mono">
         <div className="text-gray-600 mb-4 select-none">
           Last login: {new Date().toLocaleDateString()} on ttys001
         </div>
         {lines.map((line, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }}
              dangerouslySetInnerHTML={{ __html: `[${new Date().toLocaleTimeString()}] ${line}` }}
            />
         ))}
         <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-primary-DEFAULT inline-block align-middle ml-1"
         />
      </div>
    </div>
  );
};

// --- CUSTOM SAAS MOCKUP ---
const CustomAppView = () => (
  <div className="w-full h-full flex bg-[#0F1115] relative overflow-hidden">
     {/* Sidebar */}
     <div className="w-16 md:w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-0 md:px-6 justify-center md:justify-start border-b border-white/5">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-DEFAULT to-primary-dark flex items-center justify-center shadow-lg shadow-primary-DEFAULT/20">
              <Box className="w-4 h-4 text-white" />
           </div>
           <span className="ml-3 font-bold text-white hidden md:block tracking-tight">Nexus<span className="text-primary-light">OS</span></span>
        </div>
        
        <div className="flex-1 py-6 space-y-1 px-3">
           {[
              { icon: Layout, label: 'Dashboard', active: true },
              { icon: Users, label: 'Customers', active: false },
              { icon: Box, label: 'Inventory', active: false },
              { icon: CreditCard, label: 'Orders', active: false },
              { icon: PieChart, label: 'Analytics', active: false }
           ].map((item, i) => (
             <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 group ${item.active ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className={`w-5 h-5 ${item.active ? 'text-primary-light' : 'group-hover:text-gray-300'}`} />
                <span className="text-sm font-medium hidden md:block">{item.label}</span>
                {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-DEFAULT hidden md:block" />}
             </div>
           ))}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/20">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 ring-2 ring-white/10" />
              <div className="hidden md:block">
                 <div className="text-xs font-bold text-white">Admin User</div>
                 <div className="text-[10px] text-gray-500">Workspace Owner</div>
              </div>
           </div>
        </div>
     </div>

     {/* Main Content */}
     <div className="flex-1 flex flex-col bg-[#0F1115] relative z-10 overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-white/[0.01] backdrop-blur-sm sticky top-0 z-30">
           <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="text-white font-semibold">Dashboard</span>
              <span>/</span>
              <span>Overview</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xs hover:border-white/20 transition-colors cursor-text w-48">
                 <Search className="w-3 h-3" />
                 <span>Search records...</span>
              </div>
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0F1115]" />
              </button>
              <button className="bg-primary-DEFAULT hover:bg-primary-light text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-DEFAULT/20 hover:shadow-primary-DEFAULT/40">
                 <Plus className="w-3 h-3" /> <span className="hidden sm:inline">New Project</span>
              </button>
           </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {/* Stats Row */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                 { label: 'Total Revenue', val: '$124,500', change: '+12.5%', trend: 'up' },
                 { label: 'Active Projects', val: '14', change: '+2', trend: 'up' },
                 { label: 'Pending Tasks', val: '8', change: '-3', trend: 'down' }
              ].map((stat, i) => (
                 <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
                       <div className={`p-1 rounded bg-white/5 ${stat.trend === 'up' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {stat.trend === 'up' ? <ArrowRight className="w-3 h-3 -rotate-45" /> : <ArrowRight className="w-3 h-3 rotate-45" />}
                       </div>
                    </div>
                    <div className="flex items-baseline gap-3">
                       <div className="text-2xl font-bold text-white group-hover:text-primary-light transition-colors">{stat.val}</div>
                       <div className={`text-xs font-mono px-1.5 py-0.5 rounded ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{stat.change}</div>
                    </div>
                 </div>
              ))}
           </div>

           {/* Table Section */}
           <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden flex-1 min-h-[300px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                 <h4 className="text-sm font-bold text-white">Recent Transactions</h4>
                 <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              <div className="w-full">
                 <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider border-b border-white/5">
                    <div className="col-span-5">Client</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-4 text-right">Amount</div>
                 </div>
                 {[
                    { name: 'Global Logistics Co.', status: 'Completed', amount: '$4,200', date: 'Just now', sCol: 'bg-green-500/10 text-green-400 border-green-500/20' },
                    { name: 'TechStream Inc.', status: 'Processing', amount: '$1,850', date: '2h ago', sCol: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                    { name: 'Apex Solutions', status: 'Pending', amount: '$3,100', date: '5h ago', sCol: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                    { name: 'Vertex Dynamics', status: 'Completed', amount: '$950', date: '1d ago', sCol: 'bg-green-500/10 text-green-400 border-green-500/20' },
                    { name: 'Nebula Corp', status: 'Failed', amount: '$120', date: '1d ago', sCol: 'bg-red-500/10 text-red-400 border-red-500/20' },
                 ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors group cursor-default">
                       <div className="col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all">
                             <FileText className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="text-sm font-medium text-white group-hover:text-primary-light transition-colors">{row.name}</div>
                             <div className="text-[10px] text-gray-500">{row.date}</div>
                          </div>
                       </div>
                       <div className="col-span-3">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${row.sCol}`}>{row.status}</span>
                       </div>
                       <div className="col-span-4 text-right">
                          <span className="text-sm font-mono text-gray-300 group-hover:text-white transition-colors">{row.amount}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           {/* Floating "Drag & Drop" Hint */}
           <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 right-8 z-50 pointer-events-none"
           >
              <div className="bg-primary-DEFAULT text-white text-xs font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,102,255,0.4)] flex items-center gap-2">
                 <CheckCircle2 className="w-3 h-3" />
                 <span>Drag & Drop Ready</span>
              </div>
           </motion.div>
        </div>
     </div>
  </div>
);

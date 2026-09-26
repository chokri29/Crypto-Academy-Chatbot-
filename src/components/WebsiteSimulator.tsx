import { ChatSettings } from '../types';
import ChatWidget from './ChatWidget';
import { Layers, GraduationCap, ArrowRight, Star, Flame, Terminal, BookOpen, Fingerprint } from 'lucide-react';

interface WebsiteSimulatorProps {
  settings: ChatSettings;
}

export default function WebsiteSimulator({ settings }: WebsiteSimulatorProps) {
  return (
    <div id="website-sim" className="h-full border border-slate-850 bg-slate-950 rounded-2xl flex flex-col overflow-hidden relative select-none">
      
      {/* Simulation Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <GraduationCap className="text-orange-500 w-4 h-4" />
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Website Live Integration Simulation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono text-slate-400 font-bold tracking-tight">https://www.crypto-academy.online/</span>
        </div>
      </div>

      {/* Simulated Website body */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-7 relative scrollbar-none">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-base font-sans shadow shadow-orange-500/30">C</div>
            <div className="font-sans font-bold text-sm tracking-tight text-white">Crypto Academy</div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer text-orange-400">Simulator Hub</span>
            <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline">Curriculum</span>
            <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline">Advanced Auditing</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 p-6 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-1 bg-orange-500/5 border border-orange-500/25 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-orange-400">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>INTERACTIVE TESTING HUB</span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold font-sans text-slate-100 leading-tight tracking-tight">
            Comprehensive Crypto & Blockchain Education
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            Master distributed ledger security, elliptic-curve hashing, and smart contract auditing. This simulator shows how our hosted widget floats cleanly inside your actual student portal page.
          </p>

          <div className="flex flex-wrap gap-2 pt-1.5">
            <span className="px-2.5 py-1 text-[10px] bg-slate-950 text-slate-400 rounded-md border border-slate-800/80 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-orange-400 fill-orange-500/10" /> 4.9 Course Rating
            </span>
            <span className="px-2.5 py-1 text-[10px] bg-slate-950 text-slate-400 rounded-md border border-slate-800/80 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3 text-emerald-400" /> Web3 Certified
            </span>
          </div>
        </div>

        {/* Course Curriculum Grid (Bento style) */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold">Featured Syllabus Modules</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Module 1 */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl transition-all space-y-2">
              <div className="w-7 h-7 bg-orange-500/10 text-orange-400 rounded-md flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">Bitcoin Mechanics & Consensus</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Analyze SHA-256 target difficulty adjustments, miners block verification equations, and public/private key pairs.
              </p>
              <div className="text-[10px] text-orange-400 font-mono flex items-center gap-1 pt-1">
                <span>Core Module</span> <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Module 2 */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl transition-all space-y-2">
              <div className="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-md flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">Ethereum Virtual Machine (EVM)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Study gas refund optimizations, smart contract bytecodes, memory allocation storage, and Solidity programming.
              </p>
              <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 pt-1">
                <span>Audit Module</span> <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Module 3 */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl transition-all space-y-2">
              <div className="w-7 h-7 bg-emerald-500/10 text-emerald-400 rounded-md flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">Smart Contract Ledger Security</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevent reentrancy vulnerabilities, logic overrides, front-running transactions, and flash-loan vectors.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-1">
                <span>Security Module</span> <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Module 4 */}
            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl transition-all space-y-2">
              <div className="w-7 h-7 bg-red-500/10 text-red-500 rounded-md flex items-center justify-center block">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">Cryptographic Foundations</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gain hands-on understanding of elliptic curves (secp256k1), asymmetric encryption keys, hashes, and ZK-SNARK rollups.
              </p>
              <div className="text-[10px] text-red-400 font-mono flex items-center gap-1 pt-1">
                <span>Advanced Module</span> <ArrowRight className="w-3 h-3" />
              </div>
            </div>

          </div>
        </div>

        {/* Callout box for testing */}
        <div className="border border-indigo-500/20 bg-indigo-500/5 p-4 rounded-xl text-center space-y-1.5 backdrop-blur-sm select-none">
          <p className="text-[11px] font-semibold text-indigo-400 tracking-wider font-mono uppercase">Interactive Sandbox Playground</p>
          <p className="text-xs text-slate-300">
            Click the floating bubble in the bottom right corner of this frame to launch your configured chatbot widget! Start chatting with your Gemini-powered assistant instantly.
          </p>
        </div>

      </div>

      {/* Embedded interactive Floating Widget and launcher */}
      <ChatWidget settings={settings} />

    </div>
  );
}

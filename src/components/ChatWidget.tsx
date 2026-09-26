import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  X, 
  RefreshCw, 
  Sparkles, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  Trash2,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ChatMessage, ChatSettings } from '../types';

interface ChatWidgetProps {
  settings: ChatSettings;
  isStandalone?: boolean;
}

// Sound effects synthesizer using Web Audio API
const playSoundEffect = (type: 'send' | 'receive' | 'error') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else {
      // Soft gentle chime for notice
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Audio context play blocked or unpermitted
  }
};

const QUICK_GLOSSARY = [
  { term: "Proof of Work (PoW)", desc: "Consensus via computational puzzles (Bitcoin)." },
  { term: "Proof of Stake (PoS)", desc: "Consensus via validator token collateral (Ethereum)." },
  { term: "Smart Contract", desc: "Self-executing code stored directly on the blockchain." },
  { term: "Gas Fees", desc: "Computational network fuel required to execute transactions." },
  { term: "Private Key", desc: "Cryptographic secret key granting ownership of assets." },
  { term: "EVM", desc: "Ethereum Virtual Machine that runs decentralized applications." },
];

export default function ChatWidget({ settings, isStandalone = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(isStandalone);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showAdminDiagnostics, setShowAdminDiagnostics] = useState(false);

  // Dedicated Visitor Error Notice State
  const [errorNotice, setErrorNotice] = useState<{
    visitorMessage: string;
    lastFailedPrompt: string;
    technicalDetails?: string;
    isApiKeyMissing?: boolean;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const themeColor = settings.themeColor || '#F7931A';

  // Initialize speech recognition if available in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition initialization error:", err);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Could not start speech recognition:", e);
      }
    }
  };

  // Initialize conversations with greeting message or when setup changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: settings.customGreeting || "Hi! I'm your Crypto & Blockchain assistant. Ask me anything about DeFi, wallets, consensus mechanisms, or protocols!",
        timestamp: new Date(),
      },
    ]);
  }, [settings.customGreeting]);

  // Handle scrolling to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, errorNotice]);

  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = (msgId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback } : m));
  };

  const exportConversation = () => {
    const markdownContent = messages.map(m => 
      `**[${m.sender === 'user' ? 'Student' : settings.name || 'CryptoBot'}]** (${m.timestamp.toLocaleTimeString()})\n${m.text}\n`
    ).join('\n---\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-academy-learning-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: settings.customGreeting || "Hi! I'm your Crypto & Blockchain assistant. Ask me anything!",
        timestamp: new Date(),
      },
    ]);
    setErrorNotice(null);
  };

  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    if (settings.enableSound) {
      playSoundEffect('send');
    }

    const userMsgId = 'user-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setErrorNotice(null);

    // Filter past messages to send as history context
    const chatHistory = messages
      .filter((m) => !m.id.startsWith('welcome'))
      .slice(-8)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          settings: {
            name: settings.name,
            personality: settings.personality,
            customInstruction: settings.customInstruction
          },
          customApiKey: settings.customApiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.visitorMessage || 'Service temporarily paused.');
      }

      const botMessageId = 'bot-' + Date.now();
      const newBotMessage: ChatMessage = {
        id: botMessageId,
        sender: 'bot',
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);

      if (settings.enableSound) {
        playSoundEffect('receive');
      }

      if (settings.enableSpeech) {
        speakText(data.response, botMessageId);
      }
    } catch (err: any) {
      console.warn('Chat service response:', err);
      if (settings.enableSound) {
        playSoundEffect('error');
      }

      const rawMsg = err?.message || '';
      const isApiKeyMissing = rawMsg.includes('GEMINI_API_KEY') || rawMsg.includes('missing') || false;

      // Polite, visitor-oriented message for site visitors
      const friendlyVisitorMessage = "I'm temporarily taking a quick pause to sync with the blockchain or experiencing high student traffic. Please tap 'Retry Question' below, or explore our curated learning guides!";

      setErrorNotice({
        visitorMessage: friendlyVisitorMessage,
        lastFailedPrompt: textToSend,
        technicalDetails: rawMsg || "Network or AI service timeout",
        isApiKeyMissing,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, settings]);

  const handleRetryLastMessage = () => {
    if (errorNotice?.lastFailedPrompt) {
      const promptToRetry = errorNotice.lastFailedPrompt;
      setErrorNotice(null);
      handleSendMessage(promptToRetry);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setErrorNotice(null);
    handleSendMessage(prompt);
  };

  const renderAvatar = (type: string, className = "w-6 h-6 text-white") => {
    switch (type) {
      case 'crypto':
        return <Coins className={className} />;
      case 'shield':
        return <ShieldCheck className={className} />;
      case 'robot':
      default:
        return <Cpu className={className} />;
    }
  };

  const getBorderRadiusClass = () => {
    switch (settings.borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-xl';
      case 'full': return 'rounded-2xl';
      default: return 'rounded-xl';
    }
  };

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'bottom-left':
        return 'bottom-20 left-4 md:left-6';
      case 'top-right':
        return 'top-16 right-4 md:right-6';
      case 'top-left':
        return 'top-16 left-4 md:left-6';
      case 'bottom-right':
      default:
        return 'bottom-20 right-4 md:right-6';
    }
  };

  const getSizeClasses = () => {
    if (isExpanded) {
      return 'w-[92vw] sm:w-[540px] h-[85vh]';
    }
    switch (settings.size) {
      case 'compact': return 'w-[320px] sm:w-[340px] h-[450px]';
      case 'large': return 'w-[360px] sm:w-[420px] h-[600px]';
      case 'standard':
      default: return 'w-[345px] sm:w-[380px] h-[520px]';
    }
  };

  const botName = settings.name || "Crypto Academy Bot";

  // Reusable Visitor Error Notice Component
  const renderVisitorErrorNotice = () => {
    if (!errorNotice) return null;

    return (
      <div 
        id="visitor-error-notice"
        className="p-3.5 bg-slate-850/90 border border-amber-500/30 rounded-xl space-y-2.5 text-xs text-slate-200 shadow-lg backdrop-blur-sm animate-fade-in"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {renderAvatar(settings.avatarStyle, "w-3.5 h-3.5 text-white")}
          </div>
          <div>
            <h5 className="font-semibold text-slate-100 text-xs flex items-center gap-1.5">
              <span>{botName}</span>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 font-medium">
                Academy Notice
              </span>
            </h5>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
          {errorNotice.visitorMessage}
        </p>

        {/* Action Buttons for Site Visitors */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            id="btn-retry-question"
            onClick={handleRetryLastMessage}
            className="px-3 py-1.5 rounded-lg text-white font-medium text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: themeColor }}
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
            <span>Retry Question</span>
          </button>

          <a
            href="https://www.crypto-academy.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700/80 flex items-center gap-1 transition-colors"
          >
            <span>Visit Curriculum</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Subtle, collapsible developer diagnostics for site administrator */}
        <div className="pt-1.5 border-t border-slate-750/60">
          <button
            onClick={() => setShowAdminDiagnostics(!showAdminDiagnostics)}
            className="text-[10px] text-slate-400 hover:text-slate-300 flex items-center gap-1 font-mono cursor-pointer"
          >
            <span>Site Administrator: Technical Info</span>
            {showAdminDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAdminDiagnostics && (
            <div className="mt-2 p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
              <p className="text-amber-400 font-bold">
                {errorNotice.isApiKeyMissing ? "Status: GEMINI_API_KEY Missing" : "Status: Backend AI Service Message"}
              </p>
              <p className="break-all opacity-85">{errorNotice.technicalDetails}</p>
              {errorNotice.isApiKeyMissing && (
                <p className="text-emerald-400 pt-1">
                  Tip: Provide your free Gemini key in the Customizer Settings panel or configure your platform secret.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Standalone mode is formatted to fill the viewport
  if (isStandalone) {
    return (
      <div className="flex flex-col h-screen max-h-screen bg-slate-950 font-sans antialiased text-slate-100 overflow-hidden" id="standalone-widget">
        {/* Standalone Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between shadow-md select-none shrink-0"
          style={{ 
            background: settings.headerType === 'gradient' 
              ? `linear-gradient(135deg, ${themeColor}, #1e293b)` 
              : themeColor 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-black/20 rounded-lg shadow-inner">
              {renderAvatar(settings.avatarStyle, "w-5 h-5 text-white")}
            </div>
            <div>
              <div className="font-semibold text-white tracking-wide text-sm">{botName}</div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-white/80 text-[10px] uppercase font-mono tracking-wider font-semibold">Gemini AI Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowGlossaryModal(true)}
              title="Crypto Terms Reference"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={exportConversation}
              title="Export Conversation"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              title="Clear Conversation"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 hover:text-white cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/15 text-white capitalize hidden sm:inline">
              {settings.personality}
            </span>
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {msg.sender === 'bot' && (
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-700 mt-1 shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {renderAvatar(settings.avatarStyle, "w-4 h-4 text-white")}
                </div>
              )}
              <div className="flex flex-col space-y-1">
                <div
                  className={`px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed tracking-normal font-sans shadow-sm ${
                    msg.sender === 'user'
                      ? 'text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60'
                  }`}
                  style={{
                    backgroundColor: msg.sender === 'user' ? themeColor : undefined,
                    borderRadius: '14px',
                  }}
                >
                  <div className="select-text markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>

                {/* Message controls & timestamp */}
                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-500 font-mono ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="hover:text-slate-300 cursor-pointer"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className="hover:text-slate-300 cursor-pointer"
                        title="Read Aloud"
                      >
                        {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'like')}
                        className={`hover:text-emerald-400 cursor-pointer ${msg.feedback === 'like' ? 'text-emerald-400' : ''}`}
                        title="Helpful Answer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'dislike')}
                        className={`hover:text-red-400 cursor-pointer ${msg.feedback === 'dislike' ? 'text-red-400' : ''}`}
                        title="Needs Improvement"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-[80%] mr-auto">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-700"
                style={{ backgroundColor: themeColor }}
              >
                {renderAvatar(settings.avatarStyle, "w-4 h-4 text-white")}
              </div>
              <div className="bg-slate-800 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5 shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Polite Visitor Notice Card on Error */}
          {renderVisitorErrorNotice()}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts in scrollable layout */}
        {messages.length === 1 && settings.suggestedPrompts && settings.suggestedPrompts.length > 0 && (
          <div className="bg-slate-900 px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-slate-800 scrollbar-none select-none">
            {settings.suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                id={`suggested-prompt-${idx}`}
                onClick={() => handlePromptClick(p)}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs rounded-full border border-slate-700/80 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: themeColor }} />
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form with Speech Recognition */}
        <form 
          id="chat-input-form"
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center shrink-0"
        >
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop Listening" : "Speak Question"}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            id="chat-user-textbox"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening... Speak now" : "Ask about Blockchain, Mining, Smart Contracts..."}
            className="flex-1 bg-slate-900/80 outline-none text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 px-3.5 py-2 rounded-lg transition-all"
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white font-medium hover:opacity-90 shrink-0 transition-opacity disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Glossary Modal */}
        {showGlossaryModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" style={{ color: themeColor }} />
                  <span>Academy Quick Reference</span>
                </h4>
                <button 
                  onClick={() => setShowGlossaryModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {QUICK_GLOSSARY.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setShowGlossaryModal(false);
                      handleSendMessage(`Explain ${item.term} simply`);
                    }}
                    className="p-2 bg-slate-950/60 hover:bg-slate-800 rounded-lg border border-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-semibold text-slate-200">{item.term}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Floating Widget Design for the Simulator
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-chat-box"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed ${getPositionClasses()} ${getSizeClasses()} bg-slate-900 border border-slate-800/80 shadow-2xl flex flex-col z-50 overflow-hidden ${getBorderRadiusClass()}`}
          >
            {/* Header */}
            <div 
              id="widget-header"
              style={{
                background: settings.headerType === 'gradient' 
                  ? `linear-gradient(135deg, ${themeColor}, #1e293b)` 
                  : themeColor
              }}
              className="p-3 flex items-center justify-between text-white shadow-md relative shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 shadow-inner">
                  {renderAvatar(settings.avatarStyle, "w-4.5 h-4.5 text-white")}
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm tracking-wide">{botName}</h4>
                  <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span>Knowledge Expert</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowGlossaryModal(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                  title="Crypto Reference"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                  title={isExpanded ? "Restore Size" : "Maximize View"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={clearChat}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  id="close-chat-widget-btn"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 bg-slate-950/95 overflow-y-auto p-3.5 space-y-3 font-sans scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {msg.sender === 'bot' && (
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 shadow-xs" 
                      style={{ backgroundColor: themeColor }}
                    >
                      {renderAvatar(settings.avatarStyle, "w-3.5 h-3.5 text-white")}
                    </div>
                  )}
                  <div className="flex flex-col space-y-1">
                    <div
                      className={`px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                      }`}
                      style={{
                        backgroundColor: msg.sender === 'user' ? themeColor : undefined,
                        borderRadius: '12px'
                      }}
                    >
                      <div className="select-text markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-1 text-[9px] text-slate-500 font-mono ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="hover:text-slate-300 cursor-pointer"
                            title="Copy"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                          <button
                            onClick={() => speakText(msg.text, msg.id)}
                            className="hover:text-slate-300 cursor-pointer"
                            title="Read Aloud"
                          >
                            {speakingMsgId === msg.id ? <VolumeX className="w-2.5 h-2.5 text-amber-400 animate-pulse" /> : <Volume2 className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2 max-w-[80%] mr-auto animate-pulse">
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1" 
                    style={{ backgroundColor: themeColor }}
                  >
                    {renderAvatar(settings.avatarStyle, "w-3.5 h-3.5 text-white")}
                  </div>
                  <div className="bg-slate-800 border border-slate-700/55 px-3 py-2.5 rounded-2xl rounded-tl-none flex items-center space-x-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              {/* Polite Visitor Notice Card on Error */}
              {renderVisitorErrorNotice()}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && settings.suggestedPrompts && settings.suggestedPrompts.length > 0 && (
              <div className="bg-slate-900/90 px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0 border-t border-slate-800/80 scrollbar-none select-none">
                {settings.suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    id={`floating-suggested-prompt-${idx}`}
                    onClick={() => handlePromptClick(p)}
                    className="whitespace-nowrap bg-slate-800 hover:bg-slate-750 text-slate-300 px-2.5 py-1 text-[11px] rounded-full border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 shrink-0" style={{ color: themeColor }} />
                    <span className="truncate max-w-[200px]">{p}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form 
              id="floating-chat-input-form"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
              className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-1.5 items-center shrink-0"
            >
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Stop Listening" : "Speak Question"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isListening 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              )}

              <input
                id="floating-chat-textbox"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask your crypto question..."}
                className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 outline-none text-xs px-3 py-2 rounded-lg border border-slate-800 focus:border-amber-500/50"
                disabled={isLoading}
              />
              <button
                id="floating-chat-send-btn"
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-medium hover:opacity-90 shrink-0 transition-opacity disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Glossary Modal in Floating View */}
            {showGlossaryModal && (
              <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-xs w-full space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" style={{ color: themeColor }} />
                      <span>Academy Quick Reference</span>
                    </h4>
                    <button 
                      onClick={() => setShowGlossaryModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {QUICK_GLOSSARY.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setShowGlossaryModal(false);
                          handleSendMessage(`Explain ${item.term} simply`);
                        }}
                        className="p-1.5 bg-slate-950/60 hover:bg-slate-800 rounded border border-slate-800/80 cursor-pointer transition-colors"
                      >
                        <div className="text-[11px] font-semibold text-slate-200">{item.term}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      {!isOpen && (
        <motion.button
          id="crypto-chatbot-launcher-preview"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: themeColor }}
          className={`fixed ${getPositionClasses()} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer z-50 border-2 border-white/20`}
        >
          {settings.launcherIcon === 'message' ? (
            <Sparkles className="w-6 h-6" />
          ) : settings.launcherIcon === 'help' ? (
            <HelpCircle className="w-6 h-6" />
          ) : (
            <Send className="w-6 h-6 rotate-45 -translate-y-0.5" />
          )}
        </motion.button>
      )}
    </>
  );
}

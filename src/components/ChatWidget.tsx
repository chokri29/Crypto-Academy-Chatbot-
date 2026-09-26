import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Coins, 
  ShieldCheck, 
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
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ChatMessage, ChatSettings } from '../types';

interface ChatWidgetProps {
  settings: ChatSettings;
  isStandalone?: boolean;
}

// Sound effects synthesizer using Web Audio API
const playSoundEffect = (type: 'send' | 'receive') => {
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    // Audio context play blocked or unpermitted
  }
};

export default function ChatWidget({ settings, isStandalone = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(isStandalone);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<{ message: string; isApiKeyMissing: boolean } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversations with greeting message or when setup changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: settings.customGreeting || "Hi! I'm your Crypto & Blockchain assistant. Ask me anything!",
        timestamp: new Date(),
      },
    ]);
  }, [settings.customGreeting]);

  // Handle scrolling to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech synthesis
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
      `**[${m.sender === 'user' ? 'User' : settings.name || 'Bot'}]** (${m.timestamp.toLocaleTimeString()})\n${m.text}\n`
    ).join('\n---\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-academy-chat-${Date.now()}.md`;
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
    setErrorStatus(null);
  };

  const handleSendMessage = async (textToSend: string) => {
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
    setErrorStatus(null);

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
        throw new Error(data.error || 'Server returned an error');
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
      console.error('Chat error:', err);
      const isApiKeyMissing = err.message?.includes('GEMINI_API_KEY') || err.message?.includes('missing') || false;
      
      setErrorStatus({
        message: err.message || "Failed to connect to the Chatbot service. Please make sure the backend is active.",
        isApiKeyMissing,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
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

  const getLauncherPositionClasses = () => {
    switch (settings.position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeClasses = () => {
    if (isExpanded) {
      return 'w-[90vw] sm:w-[540px] h-[85vh]';
    }
    switch (settings.size) {
      case 'compact': return 'w-[320px] sm:w-[340px] h-[440px]';
      case 'large': return 'w-[360px] sm:w-[420px] h-[580px]';
      case 'standard':
      default: return 'w-[345px] sm:w-[380px] h-[500px]';
    }
  };

  const botName = settings.name || "Crypto Academy Bot";

  // Standalone mode is formatted to fill the viewport
  if (isStandalone) {
    return (
      <div className="flex flex-col h-screen max-h-screen bg-slate-950 font-sans antialiased text-slate-100 overflow-hidden" id="standalone-widget">
        {/* Standalone Header */}
        <div 
          className="px-4 py-3 flex items-center justify-between shadow-md select-none shrink-0"
          style={{ 
            background: settings.headerType === 'gradient' 
              ? `linear-gradient(135deg, ${settings.themeColor}, #1e293b)` 
              : settings.themeColor 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-black/20 rounded-lg">
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
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              title="Export Conversation"
              className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              title="Clear Conversation"
              className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white cursor-pointer"
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
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-700 mt-1"
                  style={{ backgroundColor: settings.themeColor }}
                >
                  {renderAvatar(settings.avatarStyle, "w-4 h-4 text-white")}
                </div>
              )}
              <div className="flex flex-col space-y-1">
                <div
                  className={`px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed tracking-normal font-sans shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-2xl rounded-tl-none'
                  }`}
                  style={{
                    backgroundColor: msg.sender === 'user' ? settings.themeColor : undefined,
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
                style={{ backgroundColor: settings.themeColor }}
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

          {errorStatus && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">{errorStatus.isApiKeyMissing ? "Gemini API Key Missing" : "Connection Error"}</p>
                <p className="opacity-90 leading-relaxed">{errorStatus.message}</p>
              </div>
            </div>
          )}

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
                <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: settings.themeColor }} />
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form 
          id="chat-input-form"
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center shrink-0"
        >
          <input
            id="chat-user-textbox"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Blockchain, Mining, Web3..."
            className="flex-1 bg-slate-900/80 outline-none text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 px-3.5 py-2 rounded-lg transition-all"
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white font-medium hover:opacity-90 shrink-0 transition-opacity disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            style={{ backgroundColor: settings.themeColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
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
                  ? `linear-gradient(135deg, ${settings.themeColor}, #1e293b)` 
                  : settings.themeColor
              }}
              className="p-3 flex items-center justify-between text-white shadow-md relative shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/15">
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
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1" 
                      style={{ backgroundColor: settings.themeColor }}
                    >
                      {renderAvatar(settings.avatarStyle, "w-3.5 h-3.5 text-white")}
                    </div>
                  )}
                  <div className="flex flex-col space-y-1">
                    <div
                      className={`px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-2xl rounded-tl-none'
                      }`}
                      style={{
                        backgroundColor: msg.sender === 'user' ? settings.themeColor : undefined,
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
                    style={{ backgroundColor: settings.themeColor }}
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

              {errorStatus && (
                <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-2 text-red-200 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold">{errorStatus.isApiKeyMissing ? "Developer Setup Needed" : "Server Disconnected"}</p>
                    <p className="opacity-80 leading-relaxed text-[10px]">{errorStatus.message}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && settings.suggestedPrompts && settings.suggestedPrompts.length > 0 && (
              <div className="px-3 py-1.5 flex gap-1 bg-slate-950 overflow-x-auto border-t border-slate-800/80 scrollbar-none select-none shrink-0">
                {settings.suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    id={`quick-prompt-btn-${idx}`}
                    onClick={() => handlePromptClick(p)}
                    className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 text-[10px] rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" style={{ color: settings.themeColor }} />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <form
              id="widget-input-form"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
              className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2 items-center shrink-0"
            >
              <input
                id="widget-user-text"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your crypto question..."
                className="flex-1 bg-slate-950 outline-none text-xs text-slate-200 border border-slate-800 focus:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-all"
                disabled={isLoading}
              />
              <button
                id="widget-send-btn"
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-medium hover:opacity-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                style={{ backgroundColor: settings.themeColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button on simulated webpage */}
      {!isStandalone && (
        <motion.button
          id="widget-launcher-bubble"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`fixed ${getLauncherPositionClasses()} w-14 h-14 rounded-full flex items-center justify-center shadow-xl text-white border border-white/10 z-50 cursor-pointer`}
          style={{ backgroundColor: settings.themeColor }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              {settings.launcherIcon === 'message' && <Sparkles className="w-6 h-6" />}
              {settings.launcherIcon === 'help' && <HelpCircle className="w-6 h-6" />}
              {settings.launcherIcon === 'chat' && <MessageSquare className="w-6 h-6" />}
            </>
          )}
        </motion.button>
      )}
    </>
  );
}

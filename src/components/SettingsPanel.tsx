import { ChatSettings, COLOR_PRESETS, EDUCATIONAL_LEVELS, EducationalLevel, WidgetPosition, WidgetSize } from '../types';
import { Settings, Sliders, Palette, Sparkles, MessageSquare, Plus, Trash, Volume2, Layout, BookOpen, Key } from 'lucide-react';

interface SettingsPanelProps {
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleTextChange = (key: keyof ChatSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const handleLevelChange = (value: EducationalLevel) => {
    let defaultGreeting = settings.customGreeting;
    let suggestedPrompts = [...settings.suggestedPrompts];

    if (value === 'beginner') {
      defaultGreeting = "Hello crypto student! I'm here to explain Bitcoin and Blockchain simply. Ask me anything!";
      suggestedPrompts = [
        "What is a Blockchain explaining simply?",
        "What is a Bitcoin and why is it scarce?",
        "How do public and private keys work?",
      ];
    } else if (value === 'intermediate') {
      defaultGreeting = "Welcome to Crypto Academy Online! Ask me about DeFi, wallets, consensus mechanisms, or protocols.";
      suggestedPrompts = [
        "What's the difference between PoW and Proof of Stake (PoS)?",
        "Explain Ethereum Gas Fees simply",
        "What are Smart Contracts and how are they executed?",
      ];
    } else if (value === 'advanced') {
      defaultGreeting = "Welcome Master Developer. Let's audit cryptography, Assembly EVMs, gas trees, or rollups.";
      suggestedPrompts = [
        "Explain Byzantine Fault Tolerance (BFT) equations",
        "How do gas refund mechanics work in Solidity EVM?",
        "Explain how Zero-Knowledge Rollups achieve validity",
      ];
    }

    onChange({
      ...settings,
      personality: value,
      customGreeting: defaultGreeting,
      suggestedPrompts
    });
  };

  const handleAddPrompt = () => {
    const newPrompt = "Custom crypto question?";
    onChange({
      ...settings,
      suggestedPrompts: [...settings.suggestedPrompts, newPrompt]
    });
  };

  const handleEditPrompt = (index: number, text: string) => {
    const nextPrompts = [...settings.suggestedPrompts];
    nextPrompts[index] = text;
    onChange({ ...settings, suggestedPrompts: nextPrompts });
  };

  const handleRemovePrompt = (index: number) => {
    const nextPrompts = settings.suggestedPrompts.filter((_, i) => i !== index);
    onChange({ ...settings, suggestedPrompts: nextPrompts });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-7 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
      
      {/* Title Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4 select-none">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Settings className="w-4.5 h-4.5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-wide">Widget Customization</h2>
          <p className="text-[11px] text-slate-500 font-mono tracking-tight font-medium">Fine-tune layout, styling & AI rules</p>
        </div>
      </div>

      {/* 100% Free Gemini API Password box */}
      <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-2.5" id="api-key-paste-container">
        <label htmlFor="input-custom-api-key" className="block text-xs font-bold text-amber-400 font-mono tracking-wider uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Paste Gemini API Key Here</span>
          <span className="text-[9px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded font-mono">100% Free</span>
        </label>
        <p className="text-[10px] text-slate-400 leading-normal">
          Copy your key starting with <strong className="text-slate-200">AQ.Ab8RN6KcA...</strong> and paste it directly into this box to activate the chatbot immediately:
        </p>
        <div className="relative">
          <input
            id="input-custom-api-key"
            type="password"
            value={settings.customApiKey || ''}
            onChange={(e) => handleTextChange('customApiKey', e.target.value)}
            placeholder="Paste your Gemini API key here..."
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 outline-none border border-amber-900/40 focus:border-orange-500/60 font-mono text-[11px] px-3 py-2.5 rounded-lg transition-all pr-14"
          />
          <span className="absolute right-2 top-2.5 text-[9px] font-mono text-emerald-400 font-bold tracking-tight bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900/40">
            Secure
          </span>
        </div>
      </div>

      {/* AI Bot Persona Settings */}
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>AI Persona & Knowledge Rules</span>
        </label>

        <div className="space-y-3">
          <div>
            <label htmlFor="input-bot-name" className="block text-xs text-slate-400 font-sans font-medium mb-1.5">Assistant Name</label>
            <input
              id="input-bot-name"
              type="text"
              value={settings.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder="e.g. CryptoBot"
              className="w-full bg-slate-950 text-slate-200 outline-none border border-slate-800 focus:border-orange-500/50 text-xs sm:text-sm px-3 py-2 rounded-lg transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-sans font-medium mb-1.5">Default Greeting Message</label>
            <textarea
              id="input-bot-greeting"
              rows={2}
              value={settings.customGreeting}
              onChange={(e) => handleTextChange('customGreeting', e.target.value)}
              placeholder="Write a custom welcome message..."
              className="w-full bg-slate-950 text-slate-200 outline-none border border-slate-800 focus:border-orange-500/50 text-xs sm:text-sm px-3 py-2 rounded-lg transition-all font-sans resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-sans font-medium mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Custom Knowledge / Admin Rules</span>
            </label>
            <textarea
              id="input-bot-custom-instruction"
              rows={3}
              value={settings.customInstruction || ''}
              onChange={(e) => handleTextChange('customInstruction', e.target.value)}
              placeholder="Add specific website rules, course details, enrollment links, or custom FAQs for www.crypto-academy.online..."
              className="w-full bg-slate-950 text-slate-200 outline-none border border-slate-800 focus:border-indigo-500/50 text-xs px-3 py-2 rounded-lg transition-all font-sans resize-none placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-sans font-medium mb-1.5">Academic Depth / Personality</label>
            <div className="space-y-2">
              {EDUCATIONAL_LEVELS.map((level) => (
                <button
                  key={level.id}
                  id={`btn-depth-${level.id}`}
                  onClick={() => handleLevelChange(level.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col cursor-pointer ${
                    settings.personality === level.id
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-slate-800 hover:border-slate-755 bg-slate-950/60'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-200">{level.name}</span>
                  <span className="text-[10px] text-slate-500 mt-1 leading-normal group-hover:text-slate-400">
                    {level.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Widget Position & Size */}
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center gap-2">
          <Layout className="w-4 h-4 text-orange-400" />
          <span>Screen Position & Dimensions</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="select-widget-position" className="block text-xs text-slate-400 font-medium mb-1.5">Floating Position</label>
            <select
              id="select-widget-position"
              value={settings.position}
              onChange={(e) => handleTextChange('position', e.target.value as WidgetPosition)}
              className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
            >
              <option value="bottom-right">↘ Bottom Right</option>
              <option value="bottom-left">↙ Bottom Left</option>
              <option value="top-right">↗ Top Right</option>
              <option value="top-left">↖ Top Left</option>
            </select>
          </div>

          <div>
            <label htmlFor="select-widget-size" className="block text-xs text-slate-400 font-medium mb-1.5">Widget Dimensions</label>
            <select
              id="select-widget-size"
              value={settings.size}
              onChange={(e) => handleTextChange('size', e.target.value as WidgetSize)}
              className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
            >
              <option value="compact">Compact (340x440)</option>
              <option value="standard">Standard (380x500)</option>
              <option value="large">Large (420x580)</option>
            </select>
          </div>
        </div>

        {/* Audio & Sound Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={settings.enableSound}
              onChange={(e) => handleTextChange('enableSound', e.target.checked)}
              className="rounded accent-orange-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-sans font-medium flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-orange-400" /> Sound Effects
            </span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={settings.enableSpeech}
              onChange={(e) => handleTextChange('enableSpeech', e.target.checked)}
              className="rounded accent-orange-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-sans font-medium">
              🗣️ Auto Read Aloud
            </span>
          </label>
        </div>
      </div>

      {/* Aesthetic & Colors Settings */}
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-400" />
            <span>Aesthetic & Branding</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Syncs Live
          </span>
        </label>

        <div className="space-y-4">
          {/* Custom Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-slate-400 font-sans font-semibold">Theme Accent Color</label>
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-white/50 inline-block shadow-sm"
                  style={{ backgroundColor: settings.themeColor }}
                ></span>
                <span className="text-[10px] font-mono font-bold text-slate-300">{settings.themeColor}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  id={`theme-preset-${p.name.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleTextChange('themeColor', p.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-inner relative flex items-center justify-center ${
                    settings.themeColor.toUpperCase() === p.hex.toUpperCase() ? 'border-white scale-110 shadow-lg' : 'border-slate-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={`${p.name} (${p.hex})`}
                >
                  {settings.themeColor.toUpperCase() === p.hex.toUpperCase() && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Custom HEX input */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-slate-500 text-xs font-mono">Custom Hex:</span>
              <div className="relative flex items-center">
                <input
                  id="input-theme-hex"
                  type="text"
                  value={settings.themeColor}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#') && val.trim().length > 0) {
                      val = `#${val}`;
                    }
                    handleTextChange('themeColor', val);
                  }}
                  placeholder="#F7931A"
                  maxLength={7}
                  className="bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded border border-slate-800 outline-none w-28 uppercase focus:border-orange-500/40"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-sans italic">
                Updates embed snippet immediately
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-avatar-style" className="block text-xs text-slate-400 font-medium mb-1.5">Avatar Style</label>
              <select
                id="select-avatar-style"
                value={settings.avatarStyle}
                onChange={(e) => handleTextChange('avatarStyle', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
              >
                <option value="robot">🤖 Future Android</option>
                <option value="crypto">🪙 Token Asset</option>
                <option value="shield">🛡️ Ledger Shield</option>
              </select>
            </div>
            <div>
              <label htmlFor="select-launcher-icon" className="block text-xs text-slate-400 font-medium mb-1.5">Launcher Icon</label>
              <select
                id="select-launcher-icon"
                value={settings.launcherIcon}
                onChange={(e) => handleTextChange('launcherIcon', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
              >
                <option value="chat">💭 Chat Bubble</option>
                <option value="message">✨ Sparkle Star</option>
                <option value="help">❓ Help Circle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-border-style" className="block text-xs text-slate-400 font-medium mb-1.5">Container Curves</label>
              <select
                id="select-border-style"
                value={settings.borderRadius}
                onChange={(e) => handleTextChange('borderRadius', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
              >
                <option value="none">Square (Sharp)</option>
                <option value="sm">Subtle Rounded</option>
                <option value="md">Medium Curve</option>
                <option value="lg">Soft Rounded</option>
                <option value="full">Pill Layout</option>
              </select>
            </div>
            <div>
              <label htmlFor="select-header-type" className="block text-xs text-slate-400 font-medium mb-1.5">Header Shading</label>
              <select
                id="select-header-type"
                value={settings.headerType}
                onChange={(e) => handleTextChange('headerType', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 outline-none border border-slate-800 text-xs p-2 rounded-lg cursor-pointer"
              >
                <option value="solid">Flat Solid Color</option>
                <option value="gradient">Stylish Gradient</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Input Prompts / Starters */}
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Suggested Prompt Starters</span>
          </span>
          <button
            id="add-custom-prompt-btn"
            onClick={handleAddPrompt}
            className="text-[10px] bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </label>
        
        <p className="text-[11px] text-slate-500 leading-normal">
          Provide dynamic shortcuts to increase user engagement. Visitors click to trigger instant queries.
        </p>

        <div className="space-y-2.5">
          {settings.suggestedPrompts.map((p, idx) => (
            <div key={idx} className="flex gap-2 items-center" id={`prompt-wrapper-row-${idx}`}>
              <div className="w-5 text-[10px] font-mono font-bold text-slate-600 text-right">{idx + 1}.</div>
              <input
                id={`input-preset-prompt-${idx}`}
                type="text"
                value={p}
                onChange={(e) => handleEditPrompt(idx, e.target.value)}
                className="flex-1 bg-slate-950 text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:border-orange-500/40"
              />
              <button
                id={`remove-prompt-btn-${idx}`}
                onClick={() => handleRemovePrompt(idx)}
                className="w-7 h-7 flex items-center justify-center border border-slate-800 bg-slate-950 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                title="Remove prompt"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {settings.suggestedPrompts.length === 0 && (
            <div className="text-center p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 block">
              <MessageSquare className="w-6 h-6 text-slate-700 mx-auto mb-1.5" />
              <span className="text-slate-500 text-xs">No prompt starters defined. Click "Add" above to add some.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

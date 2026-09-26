import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Settings, 
  Terminal, 
  Code2, 
  Sparkles, 
  Lightbulb, 
  Link, 
  Layers, 
  Check, 
  Copy, 
  Globe, 
  Cpu, 
  AlertTriangle,
  ShieldCheck,
  Calculator,
  BookOpen
} from 'lucide-react';
import { ChatSettings, COLOR_PRESETS } from './types';
import SettingsPanel from './components/SettingsPanel';
import WebsiteSimulator from './components/WebsiteSimulator';
import ChatWidget from './components/ChatWidget';
import CryptoTools from './components/CryptoTools';

// Helper to parse settings from query string if present (for standalone/iframe pages)
const getInitialSettings = (): ChatSettings => {
  const defaultSettings: ChatSettings = {
    name: "Academy Expert",
    personality: "intermediate",
    customGreeting: "Welcome to Crypto Academy Online! Ask me about DeFi, wallets, consensus mechanisms, or protocols.",
    themeColor: COLOR_PRESETS[0].hex, // Default is Bitcoin Gold
    borderRadius: "lg",
    headerType: "gradient",
    avatarStyle: "crypto",
    launcherIcon: "chat",
    position: "bottom-right",
    size: "standard",
    enableSound: true,
    enableSpeech: false,
    customInstruction: "",
    suggestedPrompts: [
      "What's the difference between PoW and Proof of Stake (PoS)?",
      "Explain Ethereum Gas Fees simply",
      "What are Smart Contracts and how are they executed?",
    ]
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const personality = params.get('personality');
    const customGreeting = params.get('customGreeting');
    const themeColor = params.get('themeColor');
    const borderRadius = params.get('borderRadius');
    const headerType = params.get('headerType');
    const avatarStyle = params.get('avatarStyle');
    const launcherIcon = params.get('launcherIcon');
    const position = params.get('position');
    const size = params.get('size');
    const customInstruction = params.get('customInstruction');
    const suggestedPromptsStr = params.get('suggestedPrompts');

    let parsedPrompts = defaultSettings.suggestedPrompts;
    if (suggestedPromptsStr) {
      try {
        parsedPrompts = JSON.parse(suggestedPromptsStr);
      } catch (e) {
        console.warn("Failed to parse suggested prompts from URL:", e);
      }
    }

    return {
      name: name || defaultSettings.name,
      personality: (personality as any) || defaultSettings.personality,
      customGreeting: customGreeting || defaultSettings.customGreeting,
      themeColor: themeColor ? (themeColor.startsWith('#') || themeColor.startsWith('%23') ? themeColor : `#${themeColor}`) : defaultSettings.themeColor,
      borderRadius: (borderRadius as any) || defaultSettings.borderRadius,
      headerType: (headerType as any) || defaultSettings.headerType,
      avatarStyle: (avatarStyle as any) || defaultSettings.avatarStyle,
      launcherIcon: (launcherIcon as any) || defaultSettings.launcherIcon,
      position: (position as any) || defaultSettings.position,
      size: (size as any) || defaultSettings.size,
      enableSound: defaultSettings.enableSound,
      enableSpeech: defaultSettings.enableSpeech,
      customInstruction: customInstruction || defaultSettings.customInstruction,
      suggestedPrompts: parsedPrompts,
    };
  } catch (e) {
    console.error("Error parsing URL search params:", e);
    return defaultSettings;
  }
};

export default function App() {
  const [settings, setSettings] = useState<ChatSettings>(getInitialSettings);

  const [activeTab, setActiveTab] = useState<'sandbox' | 'tools' | 'standalone' | 'embed-code'>('sandbox');
  const [embedSubTab, setEmbedSubTab] = useState<'blogger' | 'wordpress' | 'react' | 'api'>('blogger');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [appUrl, setAppUrl] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Check backend server config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
        setAppUrl(data.appUrl || window.location.origin);
      })
      .catch((err) => {
        console.error("Config check failed:", err);
        setHasApiKey(false);
        setAppUrl(window.location.origin);
      });
  }, []);

  const handleCopy = (code: string, typeKey: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(typeKey);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSelectToolPrompt = (prompt: string) => {
    setActiveTab('sandbox');
  };

  // Copy pasteable embed script code block
  const currentAppUrl = appUrl || "YOUR_CLOUDRUN_APP_URL";
  const publicAppUrl = currentAppUrl.includes('ais-dev-') 
    ? currentAppUrl.replace('ais-dev-', 'ais-pre-') 
    : currentAppUrl;

  // Build dynamic URL with query parameters for theme configuration
  const buildConfigQueryString = () => {
    const params = new URLSearchParams();
    params.set('standalone', 'true');
    params.set('name', settings.name);
    params.set('personality', settings.personality);
    params.set('customGreeting', settings.customGreeting);
    params.set('themeColor', settings.themeColor.replace('#', ''));
    params.set('borderRadius', settings.borderRadius);
    params.set('headerType', settings.headerType);
    params.set('avatarStyle', settings.avatarStyle);
    params.set('launcherIcon', settings.launcherIcon);
    params.set('position', settings.position);
    params.set('size', settings.size);
    if (settings.customInstruction) {
      params.set('customInstruction', settings.customInstruction);
    }
    params.set('suggestedPrompts', JSON.stringify(settings.suggestedPrompts));
    return params.toString();
  };

  const configQueryString = buildConfigQueryString();
  
  // Standard floating script
  const embedScriptCode = `<!-- Crypto Academy Educational Bot Chat Widget integration -->
<script>
  (function() {
    var style = document.createElement('style');
    style.id = 'crypto-chatbot-styles';
    style.innerHTML = \`
      #crypto-chatbot-root {
        position: fixed;
        ${settings.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
        ${settings.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
        z-index: 999999;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      #crypto-chatbot-iframe {
        width: ${settings.size === 'compact' ? '340px' : settings.size === 'large' ? '420px' : '380px'};
        height: ${settings.size === 'compact' ? '460px' : settings.size === 'large' ? '600px' : '540px'};
        border: none;
        border-radius: ${settings.borderRadius === 'none' ? '0px' : settings.borderRadius === 'sm' ? '6px' : settings.borderRadius === 'md' ? '12px' : settings.borderRadius === 'lg' ? '16px' : '24px'};
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        background-color: #020617;
        display: none;
        position: absolute;
        ${settings.position.includes('bottom') ? 'bottom: 74px;' : 'top: 74px;'}
        ${settings.position.includes('right') ? 'right: 0;' : 'left: 0;'}
        transition: opacity 0.2s ease, transform 0.2s ease;
        opacity: 0;
        transform: translateY(10px);
      }
      #crypto-chatbot-iframe.widget-visible {
        display: block !important;
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      #crypto-chatbot-launcher {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: ${settings.themeColor};
        color: #FFFFFF;
        font-size: 24px;
        border: none;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      #crypto-chatbot-launcher:hover { transform: scale(1.06); }
      #crypto-chatbot-launcher:active { transform: scale(0.95); }
      
      @media (max-width: 480px) {
        #crypto-chatbot-root { bottom: 0px !important; right: 0px !important; left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; pointer-events: none; }
        #crypto-chatbot-iframe { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100% !important; border-radius: 0px !important; pointer-events: auto; z-index: 999999; }
        #crypto-chatbot-launcher { position: fixed !important; bottom: 16px !important; right: 16px !important; pointer-events: auto; z-index: 1000000; width: 50px !important; height: 50px !important; font-size: 20px !important; }
      }
    \`;
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.id = 'crypto-chatbot-root';
    document.body.appendChild(container);

    var iframe = document.createElement('iframe');
    iframe.id = 'crypto-chatbot-iframe';
    var queryParams = [
      "standalone=true",
      "name=" + encodeURIComponent(${JSON.stringify(settings.name)}),
      "personality=" + encodeURIComponent(${JSON.stringify(settings.personality)}),
      "customGreeting=" + encodeURIComponent(${JSON.stringify(settings.customGreeting)}),
      "themeColor=" + encodeURIComponent(${JSON.stringify(settings.themeColor.replace('#', ''))}),
      "borderRadius=" + encodeURIComponent(${JSON.stringify(settings.borderRadius)}),
      "headerType=" + encodeURIComponent(${JSON.stringify(settings.headerType)}),
      "avatarStyle=" + encodeURIComponent(${JSON.stringify(settings.avatarStyle)}),
      "launcherIcon=" + encodeURIComponent(${JSON.stringify(settings.launcherIcon)}),
      "position=" + encodeURIComponent(${JSON.stringify(settings.position)}),
      "size=" + encodeURIComponent(${JSON.stringify(settings.size)}),
      "suggestedPrompts=" + encodeURIComponent(${JSON.stringify(JSON.stringify(settings.suggestedPrompts))})
    ];
    iframe.src = "${publicAppUrl}/?" + queryParams.join(String.fromCharCode(38));
    container.appendChild(iframe);

    var launcher = document.createElement('button');
    launcher.id = 'crypto-chatbot-launcher';
    launcher.style.backgroundColor = "${settings.themeColor}";
    launcher.innerHTML = "💭";
    container.appendChild(launcher);

    var isOpen = false;
    launcher.onclick = function() {
      isOpen = !isOpen;
      if (isOpen) {
        iframe.classList.add('widget-visible');
        launcher.innerHTML = "✕";
      } else {
        iframe.classList.remove('widget-visible');
        launcher.innerHTML = "💭";
      }
    };
  })();
</script>`;

  // Blogger XML Clean CDATA Version
  const bloggerCdataScriptCode = `<!-- Blogger Theme XML Clean CDATA Integration -->
<script>
//<![CDATA[
  (function() {
    var style = document.createElement('style');
    style.id = 'crypto-chatbot-styles';
    style.innerHTML = \`
      #crypto-chatbot-root {
        position: fixed;
        ${settings.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
        ${settings.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
        z-index: 999999;
      }
      #crypto-chatbot-iframe {
        width: 380px;
        height: 540px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        background-color: #020617;
        display: none;
        position: absolute;
        bottom: 74px;
        right: 0;
      }
      #crypto-chatbot-iframe.widget-visible { display: block !important; }
      #crypto-chatbot-launcher {
        width: 56px; height: 56px; border-radius: 50%;
        background-color: ${settings.themeColor}; color: #FFFFFF; font-size: 24px;
        border: none; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      }
    \`;
    document.head.appendChild(style);

    var container = document.createElement('div');
    container.id = 'crypto-chatbot-root';
    document.body.appendChild(container);

    var iframe = document.createElement('iframe');
    iframe.id = 'crypto-chatbot-iframe';
    var queryParams = [
      "standalone=true",
      "name=" + encodeURIComponent(${JSON.stringify(settings.name)}),
      "personality=" + encodeURIComponent(${JSON.stringify(settings.personality)}),
      "themeColor=" + encodeURIComponent(${JSON.stringify(settings.themeColor.replace('#', ''))})
    ];
    iframe.src = "${publicAppUrl}/?" + queryParams.join(String.fromCharCode(38));
    container.appendChild(iframe);

    var launcher = document.createElement('button');
    launcher.id = 'crypto-chatbot-launcher';
    launcher.style.backgroundColor = "${settings.themeColor}";
    launcher.innerHTML = "💭";
    container.appendChild(launcher);

    var isOpen = false;
    launcher.onclick = function() {
      isOpen = !isOpen;
      if (isOpen) {
        iframe.classList.add('widget-visible');
        launcher.innerHTML = "✕";
      } else {
        iframe.classList.remove('widget-visible');
        launcher.innerHTML = "💭";
      }
    };
  })();
//]]>
</script>`;

  const reactComponentCode = `import React from 'react';

export function CryptoAcademyBot() {
  const iframeSrc = "${publicAppUrl}/?${configQueryString.replace(/&/g, '&amp;')}";

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999 }}>
      <iframe
        src={iframeSrc}
        title="Crypto Academy Chatbot"
        width="380"
        height="540"
        style={{
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          backgroundColor: '#020617'
        }}
      />
    </div>
  );
}`;

  const directIframeCode = `<iframe 
  src="${publicAppUrl}/?${configQueryString.replace(/&/g, '&amp;')}" 
  width="100%" 
  height="600" 
  style="border: none; border-radius: 12px; background: #020617; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
></iframe>`;

  // Provide a quick response to handle standing standalone page if matching URL path is `/standalone` or key search params are set
  const isStandalonePage = window.location.pathname === '/standalone' || window.location.search.includes('standalone=true') || window.location.hash === '#standalone';

  if (isStandalonePage) {
    return <ChatWidget settings={settings} isStandalone={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* Academy Customization Header banner */}
      <header className="border-b border-slate-900 bg-slate-900 p-4 shrink-0 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-extrabold text-white text-lg tracking-tight shadow">
              CA
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Crypto Academy Widget Hub
                <span className="text-[10px] font-mono py-0.5 px-2 bg-indigo-950 text-indigo-400 rounded-full border border-indigo-900">
                  Gemini API Powered
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Designing educational bot integration for <a href="https://www.crypto-academy.online/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">www.crypto-academy.online</a>
              </p>
            </div>
          </div>

          {/* API Connectivity Status */}
          <div className="flex items-center gap-3">
            {hasApiKey === null ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-850">
                <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>
                <span>Checking API Connection...</span>
              </div>
            ) : hasApiKey ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-900/60 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="font-semibold">Core API Status: Connected & Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 px-3.5 py-2 rounded-xl border border-amber-900/50">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">Secrets Required: API Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left column: Customization Settings (Span 4) */}
        <section className="lg:col-span-4 h-full xl:max-h-[82vh]" id="customizer-column">
          <SettingsPanel 
            settings={settings}
            onChange={(nextSettings) => setSettings(nextSettings)}
          />
        </section>

        {/* Right column: Tabbed Interactive simulators & Embed Scripts (Span 8) */}
        <section className="lg:col-span-8 flex flex-col h-full bg-slate-900 border border-slate-850 rounded-2xl p-5 gap-4" id="preview-and-integration-column">
          
          {/* Tabs header controller */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3 select-none">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-sm text-slate-200 tracking-wide">Simulator & Integration Hub</h3>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 overflow-x-auto scrollbar-none max-w-full">
              <button
                id="tab-sandbox-btn"
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'sandbox' 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Website Simulator
              </button>
              <button
                id="tab-tools-btn"
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'tools' 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                <span>Web3 Tools</span>
              </button>
              <button
                id="tab-standalone-btn"
                onClick={() => setActiveTab('standalone')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'standalone' 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standalone View
              </button>
              <button
                id="tab-embed-btn"
                onClick={() => setActiveTab('embed-code')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'embed-code' 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Embed Code</span>
              </button>
            </div>
          </div>

          {/* Quick Alert if API Key is missing prompting them with instruction */}
          {hasApiKey === false && (
            <div className="bg-amber-950/20 border border-amber-900/50 px-4 py-3 rounded-xl flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[11px] sm:text-xs text-amber-200 space-y-1">
                <p className="font-semibold">⚠️ Interactive Model Offline</p>
                <p className="opacity-90 leading-relaxed">
                  To activate your educational chatbot, paste your free key in the left panel under <strong>"⚡ Paste Gemini API Key Here"</strong> or add <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-amber-300">GEMINI_API_KEY</code> in AI Studio Secrets!
                </p>
              </div>
            </div>
          )}

          {/* Tab Contents */}
          <div className="flex-1 min-h-[440px] xl:max-h-[68vh] rounded-xl overflow-hidden">
            {activeTab === 'sandbox' && (
              <WebsiteSimulator settings={settings} />
            )}

            {activeTab === 'tools' && (
              <CryptoTools onSelectPrompt={handleSelectToolPrompt} accentColor={settings.themeColor} />
            )}

            {activeTab === 'standalone' && (
              <div className="h-full border border-slate-850 rounded-xl overflow-hidden bg-slate-950">
                <ChatWidget settings={settings} isStandalone={true} />
              </div>
            )}

            {activeTab === 'embed-code' && (
              <div className="h-full space-y-5 overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-850 scrollbar-thin scrollbar-thumb-slate-800 text-xs sm:text-sm">
                
                {/* Free Blogger Tier Box */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-3">
                  <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Blogger 100% Free Lifetime Setup Guide</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans">
                    Run this educational chatbot completely <strong>free of charge, forever</strong> on your Blogger site (<a href="https://www.crypto-academy.online/" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">crypto-academy.online</a>)!
                  </p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-400 space-y-1.5 leading-relaxed font-sans">
                    <li><strong className="text-emerald-300">Free Gemini API:</strong> Up to 1,500 free requests/day with Google AI Studio.</li>
                    <li><strong className="text-emerald-300">Zero Authentication Barriers:</strong> Generated code uses public preview endpoints so incognito visitors and Facebook Lite mobile users can chat instantly.</li>
                  </ul>
                </div>

                {/* Sub-tabs for Framework Selectors */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
                  <button
                    onClick={() => setEmbedSubTab('blogger')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${embedSubTab === 'blogger' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Blogger (XML Clean)
                  </button>
                  <button
                    onClick={() => setEmbedSubTab('wordpress')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${embedSubTab === 'wordpress' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    WordPress / HTML
                  </button>
                  <button
                    onClick={() => setEmbedSubTab('react')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${embedSubTab === 'react' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    React / Next.js
                  </button>
                  <button
                    onClick={() => setEmbedSubTab('api')}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${embedSubTab === 'api' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-white'}`}
                  >
                    REST API
                  </button>
                </div>

                {/* Blogger Snippet */}
                {embedSubTab === 'blogger' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-orange-400" />
                        <span>Blogger XML Clean CDATA Snippet</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(bloggerCdataScriptCode, 'blogger')}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                      >
                        {copiedText === 'blogger' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'blogger' ? 'Copied!' : 'Copy Blogger Script'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900/80 p-3 rounded-lg border border-slate-850 overflow-x-auto text-[10px] font-mono leading-relaxed text-orange-300 select-all max-h-[220px]">
                      {bloggerCdataScriptCode}
                    </pre>
                  </div>
                )}

                {/* WordPress / HTML Snippet */}
                {embedSubTab === 'wordpress' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span>Standard HTML & WordPress Footer Script</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(embedScriptCode, 'wp')}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                      >
                        {copiedText === 'wp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'wp' ? 'Copied!' : 'Copy HTML Script'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900/80 p-3 rounded-lg border border-slate-850 overflow-x-auto text-[10px] font-mono leading-relaxed text-indigo-300 select-all max-h-[220px]">
                      {embedScriptCode}
                    </pre>
                  </div>
                )}

                {/* React / Next.js Component */}
                {embedSubTab === 'react' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span>React / Next.js Component Wrapper</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(reactComponentCode, 'react')}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                      >
                        {copiedText === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'react' ? 'Copied!' : 'Copy Component'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900/80 p-3 rounded-lg border border-slate-850 overflow-x-auto text-[10px] font-mono leading-relaxed text-cyan-300 select-all max-h-[220px]">
                      {reactComponentCode}
                    </pre>
                  </div>
                )}

                {/* REST API */}
                {embedSubTab === 'api' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Direct REST API Endpoint Query</span>
                      </h4>
                      <button
                        onClick={() => handleCopy(`${currentAppUrl}/api/chat`, 'api')}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                      >
                        {copiedText === 'api' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'api' ? 'Copied!' : 'Copy Endpoint'}</span>
                      </button>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-300 space-y-1">
                      <p className="text-emerald-400 font-bold">POST {currentAppUrl}/api/chat</p>
                      <p className="text-slate-500">// Header: Content-Type: application/json</p>
                      <p className="text-slate-400">&#123;</p>
                      <p className="text-slate-400">  "message": "What is Proof of Stake?",</p>
                      <p className="text-slate-400">  "settings": &#123; "name": "{settings.name}", "personality": "{settings.personality}" &#125;</p>
                      <p className="text-slate-400">&#125;</p>
                    </div>
                  </div>
                )}

                {/* Direct Iframe Option */}
                <div className="pt-2 border-t border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Direct Page Column Iframe</span>
                    <button
                      onClick={() => handleCopy(directIframeCode, 'iframe')}
                      className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'iframe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy iframe</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900/60 p-2.5 rounded border border-slate-850 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                    {directIframeCode}
                  </pre>
                </div>

              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer credits line */}
      <footer className="p-3 text-center border-t border-slate-900 bg-slate-950 font-mono text-[10px] text-slate-600 tracking-tight shrink-0 select-none">
        Crypto & Blockchain Educational Assistant • Hosted Sandbox Environment
      </footer>
    </div>
  );
}

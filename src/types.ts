export type EducationalLevel = 'beginner' | 'intermediate' | 'advanced';
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type WidgetSize = 'compact' | 'standard' | 'large';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  feedback?: 'like' | 'dislike';
  isError?: boolean;
  canRetry?: boolean;
  retryText?: string;
  technicalError?: string;
}

export interface ChatSettings {
  name: string;
  personality: EducationalLevel;
  customGreeting: string;
  themeColor: string; // Hex color string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  headerType: 'solid' | 'gradient';
  avatarStyle: 'robot' | 'crypto' | 'shield';
  launcherIcon: 'chat' | 'message' | 'help';
  suggestedPrompts: string[];
  position: WidgetPosition;
  size: WidgetSize;
  enableSound: boolean;
  enableSpeech: boolean;
  customInstruction?: string;
  customApiKey?: string;
}

export interface CryptoGlossaryItem {
  term: string;
  category: 'Bitcoin' | 'Ethereum & EVM' | 'Cryptography' | 'DeFi & Web3' | 'Security';
  shortDef: string;
  questionPrompt: string;
}

export const COLOR_PRESETS = [
  { name: 'Bitcoin Gold', hex: '#F7931A' },
  { name: 'Ethereum Velvet', hex: '#627EEA' },
  { name: 'Solana Green', hex: '#14F195' },
  { name: 'Crypto Cyber Blue', hex: '#00D4FF' },
  { name: 'Polygon Violet', hex: '#8247E5' },
  { name: 'Arbitrum Cyan', hex: '#28A0F0' },
  { name: 'Classic Slate Steel', hex: '#4F46E5' },
  { name: 'Crimson Security', hex: '#EF4444' },
];

export const EDUCATIONAL_LEVELS = [
  {
    id: 'beginner' as EducationalLevel,
    name: 'Beginner Analyst (Simplistic)',
    description: 'Simplifies complex theories into clear, everyday analogies. Avoids heavy cryptography jargon.',
  },
  {
    id: 'intermediate' as EducationalLevel,
    name: 'Academy Explorer (Practical)',
    description: 'Practical analysis on blockchain protocols, wallets, and decentralized finance with mature bullet points.',
  },
  {
    id: 'advanced' as EducationalLevel,
    name: 'Smart Contract Auditor (Technical)',
    description: 'Deep mechanical analysis. Explains hashing algorithms, gas codes, assembly signatures, and cryptography structures.',
  },
];


import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Flame, 
  Key, 
  Search, 
  Calculator, 
  ArrowRight, 
  Play, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { CryptoGlossaryItem } from '../types';

interface CryptoToolsProps {
  onSelectPrompt: (prompt: string) => void;
  accentColor?: string;
}

const GLOSSARY_ITEMS: CryptoGlossaryItem[] = [
  {
    term: "Proof of Work (PoW)",
    category: "Bitcoin",
    shortDef: "Consensus mechanism requiring miners to solve cryptographic puzzles to validate transactions and add blocks.",
    questionPrompt: "Explain Proof of Work (PoW) in detail with a simple analogy."
  },
  {
    term: "Proof of Stake (PoS)",
    category: "Ethereum & EVM",
    shortDef: "Consensus mechanism where validators lock up collateral (stake) to get chosen to create new blocks.",
    questionPrompt: "What is the difference between Proof of Stake (PoS) and Proof of Work?"
  },
  {
    term: "Zero-Knowledge Proofs (ZKP)",
    category: "Cryptography",
    shortDef: "Method by which one party can prove to another party that a statement is true without revealing any information beyond the validity.",
    questionPrompt: "How do Zero-Knowledge Proofs (ZK-SNARKs and ZK-STARKs) work in Web3?"
  },
  {
    term: "EVM (Ethereum Virtual Machine)",
    category: "Ethereum & EVM",
    shortDef: "Computation engine that executes smart contracts across thousands of connected Ethereum nodes.",
    questionPrompt: "What is the EVM and how does it execute smart contract bytecodes?"
  },
  {
    term: "Smart Contract Reentrancy",
    category: "Security",
    shortDef: "Vulnerability where an external contract calls back into the vulnerable contract before the state is updated.",
    questionPrompt: "How does a Reentrancy Attack work in Solidity and how do we prevent it using Checks-Effects-Interactions?"
  },
  {
    term: "Automated Market Maker (AMM)",
    category: "DeFi & Web3",
    shortDef: "Protocol relying on mathematical formulas (e.g. x * y = k) to price assets instead of traditional order books.",
    questionPrompt: "Explain how Automated Market Makers like Uniswap calculate prices and handle liquidity."
  },
  {
    term: "EIP-1559 & Gas Base Fee",
    category: "Ethereum & EVM",
    shortDef: "Ethereum fee structure mechanism that burns a portion of transaction base fees automatically.",
    questionPrompt: "How does EIP-1559 gas pricing work and why does it burn ETH?"
  },
  {
    term: "Byzantine Fault Tolerance (BFT)",
    category: "Cryptography",
    shortDef: "Property of a system that can function correctly even if some of its nodes fail or act maliciously.",
    questionPrompt: "What is Byzantine Fault Tolerance and why is it important for distributed blockchains?"
  }
];

export default function CryptoTools({ onSelectPrompt, accentColor = '#F7931A' }: CryptoToolsProps) {
  const [activeTab, setActiveTab] = useState<'mining' | 'gas' | 'keys' | 'glossary'>('mining');

  // --- SHA-256 Mining Simulator State ---
  const [blockData, setBlockData] = useState("Block #840,000 - Crypto Academy");
  const [nonce, setNonce] = useState(0);
  const [difficulty, setDifficulty] = useState(2); // leading zeros
  const [currentHash, setCurrentHash] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);

  // Helper to compute SHA-256
  const computeSha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    let isMounted = true;
    computeSha256(`${blockData}:${nonce}`).then(hash => {
      if (isMounted) setCurrentHash(hash);
    });
    return () => { isMounted = false; };
  }, [blockData, nonce]);

  const targetPrefix = "0".repeat(difficulty);
  const isBlockMined = currentHash.startsWith(targetPrefix);

  const startMining = async () => {
    setIsMining(true);
    let currentNonce = nonce;
    const startTime = performance.now();
    let count = 0;

    const mineChunk = async () => {
      for (let i = 0; i < 200; i++) {
        currentNonce++;
        count++;
        const testHash = await computeSha256(`${blockData}:${currentNonce}`);
        if (testHash.startsWith(targetPrefix)) {
          setNonce(currentNonce);
          setCurrentHash(testHash);
          setIsMining(false);
          const elapsed = (performance.now() - startTime) / 1000;
          setHashRate(Math.round(count / (elapsed || 0.001)));
          return;
        }
      }
      setNonce(currentNonce);
      if (isMining) {
        requestAnimationFrame(mineChunk);
      }
    };

    mineChunk();
  };

  // --- EVM Gas Estimator State ---
  const [network, setNetwork] = useState<'eth' | 'arb' | 'polygon' | 'bnb'>('eth');
  const [gasPriceGwei, setGasPriceGwei] = useState(25);
  const [ethPrice, setEthPrice] = useState(3200);
  const [txType, setTxType] = useState<number>(21000); // default simple transfer

  const calculateGasFeeETH = () => {
    // gasUnits * gasPriceInWei / 1e18
    return (txType * gasPriceGwei) / 1000000000;
  };

  const calculatedFeeETH = calculateGasFeeETH();
  const calculatedFeeUSD = calculatedFeeETH * ethPrice;

  // --- Key Pair Visualizer State ---
  const [generatedKey, setGeneratedKey] = useState<{ priv: string; pub: string; addr: string }>({
    priv: "4f3a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",
    pub: "048f3b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",
    addr: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateRandomKey = async () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const hexPriv = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash priv to simulate public key derivation
    const pubHash = await computeSha256(hexPriv + "pub");
    const addrHash = await computeSha256(pubHash);
    const simulatedAddr = "0x" + addrHash.slice(-40).toUpperCase();

    setGeneratedKey({
      priv: hexPriv,
      pub: "04" + pubHash + pubHash.slice(0, 60),
      addr: simulatedAddr
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- Glossary Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredGlossary = GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.shortDef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 h-full flex flex-col overflow-hidden select-none">
      
      {/* Header & Tool Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Calculator className="w-4.5 h-4.5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 tracking-wide">Interactive Web3 Tools & Calculators</h2>
            <p className="text-[11px] text-slate-500 font-mono">Live crypto learning sandboxes</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('mining')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mining' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5 text-orange-400" />
            <span>SHA-256 Mining</span>
          </button>
          <button
            onClick={() => setActiveTab('gas')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gas' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gas Estimator</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'keys' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>Key Pair Demo</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'glossary' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academy Glossary</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* TAB 1: SHA-256 Mining Simulator */}
        {activeTab === 'mining' && (
          <div className="space-y-5">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Proof of Work Block Hash Simulator</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isBlockMined ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'bg-amber-950 text-amber-400 border border-amber-900/60'}`}>
                  {isBlockMined ? '✓ VALID MINED BLOCK' : 'INVALID NONCE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Block Header Payload</label>
                  <input
                    type="text"
                    value={blockData}
                    onChange={(e) => setBlockData(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Mining Nonce (Proof Number)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={nonce}
                      onChange={(e) => setNonce(Number(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/50 font-mono"
                    />
                    <button
                      onClick={() => setNonce(prev => prev + 1)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono cursor-pointer"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              {/* Difficulty Target selector */}
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 font-mono">Target Difficulty (Leading Zeros required):</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`w-7 h-7 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                        difficulty === d ? 'bg-orange-500 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* SHA-256 Output Hash display */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Calculated SHA-256 Hash Output:</span>
                <div className={`p-3 rounded-lg border font-mono text-xs break-all transition-colors ${
                  isBlockMined ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  <span className="font-bold text-orange-400">{currentHash.slice(0, difficulty)}</span>
                  <span>{currentHash.slice(difficulty)}</span>
                </div>
              </div>

              {/* Auto Mine Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={startMining}
                  disabled={isMining}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isMining ? 'Mining in progress...' : 'Mine Block (Auto Nonce Search)'}</span>
                </button>

                {hashRate > 0 && (
                  <span className="text-[11px] font-mono text-slate-400">
                    ⚡ {hashRate.toLocaleString()} Hashes/sec
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-semibold mb-0.5">Educational Takeaway:</p>
                In Bitcoin, miners constantly change the <code className="bg-slate-900 px-1 py-0.5 rounded text-orange-300 font-mono">nonce</code> number until the resulting SHA-256 hash starts with a set number of zeros. This proves computational work!
                <button
                  onClick={() => onSelectPrompt("How does Bitcoin adjust mining difficulty every 2016 blocks?")}
                  className="block mt-1.5 text-orange-400 hover:underline font-mono text-[11px] cursor-pointer"
                >
                  → Ask Bot: How does Bitcoin difficulty adjustment work?
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVM Gas Fee Estimator */}
        {activeTab === 'gas' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">EVM Gas & Transaction Cost Calculator</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">EIP-1559 Formula</span>
              </div>

              {/* Select Network */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">Select Target Chain</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3200, gas: 25 },
                    { id: 'arb', name: 'Arbitrum', symbol: 'ETH', price: 3200, gas: 0.1 },
                    { id: 'polygon', name: 'Polygon', symbol: 'POL', price: 0.55, gas: 40 },
                    { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', price: 580, gas: 3 }
                  ].map(net => (
                    <button
                      key={net.id}
                      onClick={() => {
                        setNetwork(net.id as any);
                        setGasPriceGwei(net.gas);
                        setEthPrice(net.price);
                      }}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        network === net.id ? 'bg-indigo-950/80 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{net.name}</div>
                      <div className="text-[10px] font-mono opacity-80">{net.gas} Gwei</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operation type */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-mono">Transaction Complexity (Gas Units)</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(Number(e.target.value))}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value={21000}>Simple Transfer (21,000 gas)</option>
                  <option value={65000}>ERC-20 Token Transfer (~65,000 gas)</option>
                  <option value={150000}>Uniswap V3 Token Swap (~150,000 gas)</option>
                  <option value={180000}>NFT Collection Minting (~180,000 gas)</option>
                  <option value={2500000}>Complex Smart Contract Deployment (~2,500,000 gas)</option>
                </select>
              </div>

              {/* Inputs for gas price and eth price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Gas Price (Gwei)</label>
                  <input
                    type="number"
                    value={gasPriceGwei}
                    onChange={(e) => setGasPriceGwei(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Asset Market Price ($ USD)</label>
                  <input
                    type="number"
                    value={ethPrice}
                    onChange={(e) => setEthPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="bg-indigo-950/40 border border-indigo-900/60 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 uppercase font-mono tracking-wider block">Estimated Fee Cost</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ${calculatedFeeUSD.toFixed(4)} <span className="text-xs text-indigo-300">USD</span>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-300">
                  <div>{calculatedFeeETH.toFixed(6)} {network.toUpperCase()}</div>
                  <div className="text-[10px] text-slate-400">{txType.toLocaleString()} Gas Units</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPrompt("Explain EVM gas refund mechanics and code optimization in Solidity.")}
              className="text-indigo-400 hover:underline font-mono text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>→ Ask Bot: How to optimize gas usage in Solidity smart contracts?</span>
            </button>
          </div>
        )}

        {/* TAB 3: Elliptic Curve Key Pair Visualizer */}
        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Secp256k1 Key Derivation Visualizer</span>
                <button
                  onClick={generateRandomKey}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-900/60 rounded text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Generate New Random Pair</span>
                </button>
              </div>

              {/* 1. Private Key */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-red-400 font-mono font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> 1. Private Key (256-bit Secret - NEVER SHARE)
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedKey.priv, 'priv')}
                    className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    {copiedKey === 'priv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-2.5 bg-red-950/20 border border-red-900/40 rounded text-[11px] font-mono text-red-300 break-all select-all">
                  0x{generatedKey.priv}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center text-slate-600 font-mono text-[10px]">
                ↓ Elliptic Curve Multiplication (secp256k1)
              </div>

              {/* 2. Public Key */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-indigo-400 font-mono font-bold">
                    2. Uncompressed Public Key (512-bit Curve Point)
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedKey.pub, 'pub')}
                    className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    {copiedKey === 'pub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/40 rounded text-[10px] font-mono text-indigo-300 break-all select-all max-h-16 overflow-y-auto">
                  0x{generatedKey.pub}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center text-slate-600 font-mono text-[10px]">
                ↓ Keccak-256 Hash → Take Last 20 Bytes
              </div>

              {/* 3. Public Wallet Address */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 3. Public Ethereum/EVM Wallet Address
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedKey.addr, 'addr')}
                    className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    {copiedKey === 'addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded text-xs font-mono text-emerald-300 font-bold break-all select-all">
                  {generatedKey.addr}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPrompt("How do digital ECDSA signature verifications work in Ethereum transactions?")}
              className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>→ Ask Bot: How do ECDSA signatures verify transaction authenticity?</span>
            </button>
          </div>
        )}

        {/* TAB 4: Searchable Crypto Glossary */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            {/* Search & Category Filter */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 50+ Web3 terms (e.g. EVM, ZKP, Gas, Reentrancy)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {["All", "Bitcoin", "Ethereum & EVM", "Cryptography", "DeFi & Web3", "Security"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap cursor-pointer transition-colors ${
                      selectedCategory === cat ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-200">{item.term}</span>
                      <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {item.shortDef}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectPrompt(item.questionPrompt)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold inline-flex items-center gap-1 pt-1 border-t border-slate-900 cursor-pointer"
                  >
                    <span>Ask Chatbot Deep Dive</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {filteredGlossary.length === 0 && (
                <div className="col-span-2 text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-500 text-xs font-mono">
                  No matching terms found. Type a custom query in the Chatbot directly!
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

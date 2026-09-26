import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set your API key in the customizer UI below or as a platform secret.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Educational Crypto & Blockchain Prompts based on customization settings
interface PersonaSettings {
  name: string;
  personality: 'beginner' | 'intermediate' | 'advanced';
  customGreeting?: string;
  customInstruction?: string;
}

function buildSystemInstruction(settings: PersonaSettings): string {
  const botName = settings.name || "CryptoBot";
  let base = `You are ${botName}, an elite, objective, and extremely friendly Educational Assistant for "Crypto Academy Online" (https://www.crypto-academy.online/).
Your sole mission is to guide visitors, answering their questions about Cryptocurrency, Blockchain Technology, Web3, Smart Contracts, Consensus Mechanisms, Hashing, Private/Public keys, DeFi, and Cryptography.

FOLLOW THESE STRICT BOUNDARIES:
1. ONLY answer questions related to computer science, blockchain development, cryptocurrencies, tokenomics, Web3 histories, and security. If asked about unrelated topics (e.g., cooking, pop music, sports), politely refuse and bring the discussion back to blockchain education.
2. DISCLAIMER: You MUST NOT offer any financial advice, investment strategies, trading calls, price coordinates, or tell users which token to buy/sell. Include the notice "This is for educational purposes only; always do your own research" when necessary. Be neutral and objective.
3. No self-praising or hyping. Keep explanations clear, structured, and visually helpful using clean Markdown (such as lists or short paragraphs).
`;

  if (settings.customInstruction && settings.customInstruction.trim() !== '') {
    base += `\nADDITIONAL CUSTOM KNOWLEDGE INSTRUCTION FROM ACADEMY ADMIN:\n${settings.customInstruction.trim()}\n`;
  }

  switch (settings.personality) {
    case 'beginner':
      return `${base}
STYLE INSTRUCTION (BEGINNER):
- Keep explanations simple, easy-to-understand, and free of dense cryptography or developer jargon.
- Explain terms using fun everyday analogies (e.g., explaining 'blocks' as individual notebook pages, and 'miners/selectors' as ledger keepers sealing the letters).
- Focus on building intuition for concepts like Decentralization, Private keys vs Public keys (house vs key), forking, and tokens.`;

    case 'advanced':
      return `${base}
STYLE INSTRUCTION (ADVANCED/TECHNICAL):
- Provide detailed, granular descriptions of protocol architectures, data structures, and mechanics.
- Discuss cryptographic hashing equations (SHA-256, Keccak-256), Merkle Trees, gas calculation algorithms, smart contract programming languages (Solidity, Rust), double-spending defense mechanics, Byzantine Fault Tolerance, and rollups.
- Feel free to share structural pseudo-code examples or transaction execution steps.`;

    case 'intermediate':
    default:
      return `${base}
STYLE INSTRUCTION (INTERMEDIATE):
- Provide balanced, formal, and structured deep dives.
- Discuss the differences between Proof of Work (PoW) and Proof of Stake (PoS), how wallets sign and broadcast transactions, blockchain scaling rollups, decentralized oracle mechanisms, gas fees, and Liquidity Pools.
- Keep explanation depth clear and academically mature, using helpful Bullet Points.`;
  }
}

// API endpoint to handle educational questions
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, settings, customApiKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    let ai;
    if (customApiKey && customApiKey.trim() !== "") {
      ai = new GoogleGenAI({
        apiKey: customApiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } else {
      ai = getGemini();
    }
    const parsedSettings: PersonaSettings = settings || { name: "CryptoBot", personality: "intermediate" };
    
    // Structure chat history to Gemini's format:
    // [{ role: 'user' | 'model', parts: [{ text: string }] }]
    const formattedContents = [];
    
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.sender === 'user' || h.role === 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: h.text || h.message || "" }]
          });
        } else if (h.sender === 'bot' || h.role === 'model' || h.role === 'assistant') {
          formattedContents.push({
            role: 'model',
            parts: [{ text: h.text || h.message || "" }]
          });
        }
      }
    }

    // Push the newest message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemInstruction = buildSystemInstruction(parsedSettings);

    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite"
    ];

    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting content generation using model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        if (response) {
          console.log(`Successfully generated content using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or threw 503:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error("All available AI models are currently overloaded. Please try again in a few moments.");
    }

    const responseText = response.text || "I was unable to formulate a response due to a system constraint. Please try rephrasing.";
    
    return res.json({ response: responseText });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ 
      error: err.message || "An unexpected error occurred while communicating with the AI service.",
      needsApiKey: !process.env.GEMINI_API_KEY
    });
  }
});

// Serve health configuration
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || ""
  });
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

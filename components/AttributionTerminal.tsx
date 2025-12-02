import React, { useState, useEffect } from 'react';
import { generateAttributionSuffix, WALLET_ADDRESS } from '../utils/erc8021';
import { Terminal, ShieldCheck, Share2, Copy, CheckCircle } from 'lucide-react';

export const AttributionTerminal: React.FC = () => {
  const [appCode, setAppCode] = useState('lunar_sanctum');
  const [generatedSuffix, setGeneratedSuffix] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const suffix = generateAttributionSuffix(appCode);
    setGeneratedSuffix(suffix);
  }, [appCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSuffix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border border-sanctum-500 bg-sanctum-900/90 rounded-sm shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sanctum-accent"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sanctum-accent"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sanctum-accent"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sanctum-accent"></div>

      <div className="flex items-center gap-3 mb-6 border-b border-sanctum-700 pb-4">
        <ShieldCheck className="w-6 h-6 text-sanctum-glow" />
        <h2 className="text-xl font-display font-bold text-sanctum-glow tracking-wider">
          ERC-8021 PROTOCOL INTEGRATION
        </h2>
      </div>

      <div className="space-y-6">
        <div className="bg-black/50 p-4 rounded border border-sanctum-700">
          <p className="text-sm text-sanctum-400 mb-2 font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            TARGET WALLET (DEVELOPER FUND)
          </p>
          <div className="font-mono text-xs md:text-sm text-white break-all bg-sanctum-800 p-3 rounded">
            {WALLET_ADDRESS}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-sanctum-400 uppercase font-bold mb-1 block">Attribution Code</label>
            <input 
              type="text" 
              value={appCode}
              onChange={(e) => setAppCode(e.target.value)}
              className="w-full bg-sanctum-800 border border-sanctum-500 text-sanctum-glow px-3 py-2 rounded focus:outline-none focus:border-sanctum-glow"
            />
          </div>
          <div>
            <label className="text-xs text-sanctum-400 uppercase font-bold mb-1 block">Schema ID</label>
            <div className="w-full bg-sanctum-800/50 border border-sanctum-700 text-gray-400 px-3 py-2 rounded cursor-not-allowed">
              00 (Canonical)
            </div>
          </div>
        </div>

        <div className="bg-sanctum-800 p-4 rounded border border-sanctum-500/30">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-yellow-500 font-bold uppercase">Generated Data Suffix (Calldata)</p>
            <button 
              onClick={handleCopy}
              className="text-sanctum-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED' : 'COPY HEX'}
            </button>
          </div>
          <div className="font-mono text-[10px] text-yellow-500/80 break-all leading-tight bg-black p-2 border border-yellow-900/30">
            {generatedSuffix}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-sanctum-400 border-t border-sanctum-700 pt-4">
          <Share2 className="w-4 h-4" />
          <p>
            Attaching this suffix attributes on-chain actions to 
            <span className="text-sanctum-glow"> {appCode}</span> using the ERC-8021 standard.
          </p>
        </div>
      </div>
    </div>
  );
};

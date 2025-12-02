import React, { useState, useEffect, useCallback } from 'react';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from 'wagmi';
import { GameStage, ViewState, SystemStatus, LoreEntry, FarcasterUser } from './types';
import { generateAncientLore } from './services/geminiService';
import { AttributionTerminal } from './components/AttributionTerminal';
import { PuzzleMechanism } from './components/PuzzleMechanism';
import { 
  Cpu, 
  Database, 
  Radio, 
  Power, 
  Map, 
  ChevronRight,
  Terminal as TerminalIcon,
  Globe,
  User,
  Wallet,
  Share
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data for the chart
const generateChartData = (stage: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: i,
    output: Math.random() * (stage * 20) + (stage * 10),
    stability: 100 - (Math.random() * 10)
  }));
};

const STAGE_NAMES = {
  [GameStage.ENTRY_VAULT]: "ENTRY VAULT",
  [GameStage.GRAVITY_WELLS]: "GRAVITY WELLS",
  [GameStage.CRYSTAL_HALLS]: "CRYSTAL HALLS",
  [GameStage.MACHINE_CORE]: "MACHINE CORE",
  [GameStage.APEX_CHAMBER]: "APEX CHAMBER",
};

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.MENU);
  const [stage, setStage] = useState<GameStage>(GameStage.ENTRY_VAULT);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    integrity: 85,
    energy: 12,
    resonance: 3,
  });
  const [loreLog, setLoreLog] = useState<LoreEntry[]>([]);
  const [chartData, setChartData] = useState(generateChartData(1));
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  
  // Wagmi Account Hook
  const { address, isConnected } = useAccount();

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initSdk = async () => {
      try {
        if (await sdk.isInMiniApp()) {
          const context = await sdk.context;
          if (context.user) {
            setFarcasterUser(context.user);
          }
        }
      } catch (e) {
        console.warn("Farcaster SDK init failed:", e);
      }
    };
    initSdk();
  }, []);

  // Simulating machinery background noise/updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        integrity: Math.min(100, Math.max(0, prev.integrity + (Math.random() - 0.5))),
        energy: Math.min(100, Math.max(0, prev.energy + (Math.random() - 0.5))),
        resonance: prev.resonance
      }));
      setChartData(generateChartData(stage));
    }, 2000);
    return () => clearInterval(interval);
  }, [stage]);

  const handlePuzzleComplete = async () => {
    // Unlock Lore
    const newLoreContent = await generateAncientLore(stage);
    const newEntry: LoreEntry = {
      id: `LOG_${stage}_${Date.now()}`,
      title: `SECTOR ${stage} DECRYPTED`,
      content: newLoreContent,
      unlockedAt: stage
    };
    setLoreLog(prev => [...prev, newEntry]);

    if (stage < GameStage.APEX_CHAMBER) {
      setStage(prev => prev + 1);
      setSystemStatus(prev => ({
        ...prev,
        energy: prev.energy + 20,
        resonance: prev.resonance + 15
      }));
    } else {
      alert("SANCTUM FULLY REACTIVATED. TRANSCENDENCE IMMINENT.");
    }
  };

  const handleShare = useCallback(() => {
    sdk.actions.composeCast({
      text: `🌑 System Status: ONLINE\n⚡ Energy: ${systemStatus.energy.toFixed(1)} PW\n📍 Sector: ${STAGE_NAMES[stage]}\n\nI am reactivating the Lunar Machine Sanctum.`,
      embeds: ['https://example.com']
    });
  }, [stage, systemStatus]);

  const renderContent = () => {
    switch (view) {
      case ViewState.MENU:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter text-center">
              LUNAR<br/>MACHINE<br/>SANCTUM
            </h1>
            <p className="text-sanctum-400 font-mono text-sm max-w-md text-center">
              INITIATING WAKE PROTOCOL... SYSTEM DORMANT FOR 4,000 CYCLES.
            </p>
            
            <div className="flex flex-col gap-2 items-center">
              {farcasterUser && (
                 <div className="flex items-center gap-2 p-2 bg-sanctum-900/50 border border-sanctum-800 rounded min-w-[200px] justify-center">
                    <span className="text-xs text-sanctum-500">IDENTIFIED:</span>
                    <span className="text-sm font-bold text-sanctum-glow">@{farcasterUser.username}</span>
                 </div>
              )}
              {isConnected && address && (
                 <div className="flex items-center gap-2 p-2 bg-sanctum-900/50 border border-sanctum-800 rounded min-w-[200px] justify-center">
                    <Wallet size={14} className="text-sanctum-500" />
                    <span className="text-xs font-mono text-sanctum-glow">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                 </div>
              )}
            </div>

            <button 
              onClick={() => setView(ViewState.GAME)}
              className="px-8 py-3 bg-sanctum-glow/10 border border-sanctum-glow text-sanctum-glow font-bold tracking-widest hover:bg-sanctum-glow hover:text-black transition-all duration-300"
            >
              ENTER VAULT
            </button>
            <button 
              onClick={() => setView(ViewState.ATTRIBUTION)}
              className="text-xs text-sanctum-500 hover:text-sanctum-glow border-b border-transparent hover:border-sanctum-glow transition-all"
            >
              [ CONFIGURE ERC-8021 PROTOCOL ]
            </button>
          </div>
        );

      case ViewState.GAME:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-4 md:p-8">
            {/* Left Panel: Status */}
            <div className="col-span-1 border border-sanctum-800 bg-sanctum-900/50 p-4 rounded flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sanctum-glow border-b border-sanctum-800 pb-2">
                <Cpu />
                <h2 className="font-display font-bold">SYSTEM STATUS</h2>
              </div>
              
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <div className="flex justify-between mb-1 text-sanctum-400">
                    <span>SECTOR</span>
                    <span>{STAGE_NAMES[stage]}</span>
                  </div>
                  <div className="w-full h-1 bg-sanctum-800">
                    <div className="h-full bg-sanctum-glow" style={{ width: `${(stage/5)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sanctum-400">
                    <span>ENERGY FLUX</span>
                    <span>{systemStatus.energy.toFixed(1)} PETAWATTS</span>
                  </div>
                  <div className="h-32 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="output" stroke="#22d3ee" strokeWidth={2} dot={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#22d3ee' }}
                          itemStyle={{ color: '#22d3ee' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            
              <div className="mt-auto border-t border-sanctum-800 pt-4">
                <h3 className="text-xs font-bold text-sanctum-500 mb-2">RECENT LOGS</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {loreLog.length === 0 && <span className="text-xs text-sanctum-700 italic">No data fragments found.</span>}
                  {loreLog.map(log => (
                    <div key={log.id} className="text-xs p-2 bg-black/40 border-l-2 border-sanctum-500">
                      <span className="block font-bold text-sanctum-glow">{log.title}</span>
                      <span className="text-sanctum-400">{log.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel: Main View */}
            <div className="col-span-1 lg:col-span-2 border border-sanctum-800 bg-black/60 relative overflow-hidden flex flex-col items-center justify-center p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sanctum-900 via-black to-black opacity-50 z-0"></div>
              
              <div className="z-10 w-full text-center mb-4">
                <h2 className="text-2xl font-display text-sanctum-100 tracking-[0.2em] animate-pulse">
                  MECHANISM {stage} / 5
                </h2>
                <p className="text-sanctum-500 font-mono text-xs">ALIGN THE RESONANCE RINGS TO RESTORE POWER</p>
              </div>

              <div className="z-10 w-full flex-grow flex items-center justify-center">
                <PuzzleMechanism stage={stage} onComplete={handlePuzzleComplete} />
              </div>
            </div>
          </div>
        );
      
      case ViewState.ATTRIBUTION:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
             <AttributionTerminal />
             <button 
                onClick={() => setView(ViewState.MENU)}
                className="mt-8 text-sanctum-400 hover:text-white flex items-center gap-2"
             >
                <ChevronRight className="rotate-180 w-4 h-4" /> RETURN TO MAIN MENU
             </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sanctum-950 text-sanctum-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-sanctum-800 bg-sanctum-900/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3" onClick={() => setView(ViewState.MENU)}>
          <Globe className="text-sanctum-glow animate-spin-slow" />
          <span className="font-display font-bold tracking-widest text-sm md:text-base cursor-pointer">LUNAR MACHINE</span>
        </div>
        <div className="flex gap-4 md:gap-8 text-xs font-mono">
          <button onClick={() => setView(ViewState.GAME)} className={`${view === ViewState.GAME ? 'text-sanctum-glow' : 'text-sanctum-500'} hover:text-white flex items-center gap-2`}>
            <Radio size={14} /> <span className="hidden md:inline">SIMULATION</span>
          </button>
          <button onClick={() => setView(ViewState.ATTRIBUTION)} className={`${view === ViewState.ATTRIBUTION ? 'text-sanctum-glow' : 'text-sanctum-500'} hover:text-white flex items-center gap-2`}>
            <Database size={14} /> <span className="hidden md:inline">PROTOCOLS</span>
          </button>
          
          <button onClick={handleShare} className="text-sanctum-500 hover:text-white flex items-center gap-2">
            <Share size={14} /> <span className="hidden md:inline">BROADCAST</span>
          </button>

          {farcasterUser ? (
            <div className="flex items-center gap-2 text-sanctum-glow border border-sanctum-glow/30 px-2 py-1 rounded bg-sanctum-900">
               {farcasterUser.pfpUrl ? (
                 <img src={farcasterUser.pfpUrl} alt={farcasterUser.username} className="w-4 h-4 rounded-full" />
               ) : (
                 <User size={14} />
               )}
               <span className="hidden md:inline">@{farcasterUser.username}</span>
            </div>
          ) : isConnected && address ? (
            <div className="flex items-center gap-2 text-sanctum-glow border border-sanctum-glow/30 px-2 py-1 rounded bg-sanctum-900">
               <Wallet size={14} />
               <span className="hidden md:inline font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sanctum-500">
               <Power size={14} /> <span className="hidden md:inline">ONLINE</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow relative overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
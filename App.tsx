import React, { useState, useEffect, useRef } from 'react';
import { Mic, PhoneOff } from 'lucide-react';
import { GeminiLiveService } from './services/geminiLiveService';
import { ConnectionState } from './types';
import { Visualizer } from './components/Visualizer';
import { Avatar } from './components/Avatar';

const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [userVolume, setUserVolume] = useState(0);
  const [modelVolume, setModelVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const liveServiceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    const service = new GeminiLiveService();
    liveServiceRef.current = service;

    service.onStatus = (connected, error) => {
      if (error) {
        setConnectionState(ConnectionState.ERROR);
        setErrorMsg(error);
      } else {
        setConnectionState(connected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED);
        if (connected) setErrorMsg(null);
      }
    };

    service.onVolume = (userVol, modelVol) => {
        setUserVolume(userVol);
        setModelVolume(modelVol);
    };

    return () => {
      service.disconnect();
    };
  }, []);

  const handleToggleConnection = async () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      liveServiceRef.current?.disconnect();
      setConnectionState(ConnectionState.DISCONNECTED);
      setUserVolume(0);
      setModelVolume(0);
    } else {
      setConnectionState(ConnectionState.CONNECTING);
      setErrorMsg(null);
      await liveServiceRef.current?.connect();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 w-full z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              P
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-200">Privet AI</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${
                 connectionState === ConnectionState.CONNECTED 
                 ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                 : connectionState === ConnectionState.ERROR
                 ? 'bg-red-500/10 text-red-400 border-red-500/20'
                 : 'bg-slate-800 text-slate-400 border-slate-700'
             }`}>
                {connectionState === ConnectionState.CONNECTED ? 'Live' : 
                 connectionState === ConnectionState.CONNECTING ? 'Connecting...' : 'Ready'}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content - Avatar Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full p-4 pt-20 pb-0">
        
        {errorMsg && (
            <div className="absolute top-20 z-20 px-4 py-2 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
                {errorMsg}
            </div>
        )}

        {/* Large Avatar Container */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
          <div className="w-full aspect-square max-h-[60vh] md:max-h-[70vh] flex items-center justify-center">
            <Avatar 
                modelVolume={modelVolume} 
                isListening={connectionState === ConnectionState.CONNECTED} 
            />
          </div>
          
          <div className={`mt-4 text-center transition-opacity duration-500 ${connectionState === ConnectionState.CONNECTED ? 'opacity-100' : 'opacity-0'}`}>
             <h2 className="text-2xl font-light text-slate-200 tracking-wide">Anya</h2>
             <p className="text-slate-400">Russian Tutor</p>
          </div>
        </div>

      </main>

      {/* Bottom Controls */}
      <div className="w-full bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pb-8 pt-4 px-4 z-20">
          <div className="max-w-sm mx-auto flex flex-col items-center gap-6">
            
            {/* User Audio Visualizer (Small) */}
            <div className="h-6 flex items-center justify-center w-full opacity-80">
               <Visualizer isActive={connectionState === ConnectionState.CONNECTED} volume={userVolume} />
            </div>

            {/* Connection Button */}
            <button
              onClick={handleToggleConnection}
              disabled={connectionState === ConnectionState.CONNECTING}
              className={`
                relative group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                ${connectionState === ConnectionState.CONNECTED 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
            >
                {connectionState === ConnectionState.CONNECTING ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : connectionState === ConnectionState.CONNECTED ? (
                    <PhoneOff className="w-8 h-8" />
                ) : (
                    <Mic className="w-8 h-8" />
                )}
            </button>
            
            <p className="text-slate-500 text-xs text-center h-4">
              {connectionState === ConnectionState.CONNECTED 
                ? "Microphone active. Speak naturally." 
                : ""}
            </p>
          </div>
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { generatePairingCode, joinWithCode } from '../firebase/pairing';
import { LogOut, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PairingScreenProps {
  userId: string;
  onSignOut: () => void;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({ userId, onSignOut }) => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const code = await generatePairingCode(userId);
      setGeneratedCode(code);
    } catch (e: any) {
      setError(e.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length !== 6) {
      setError('Code must be exactly 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinWithCode(userId, joinCode.toUpperCase());
      // The Firestore listener in App.tsx will automatically pick up the update!
    } catch (e: any) {
      setError(e.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 touch-none"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)' }}>
      
      <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={onSignOut}>
        <LogOut size={20} />
      </div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-['Pacifico'] text-pink-300 mb-2">Find Your Partner</h2>
        <p className="text-white/60 mb-8 font-['Caveat'] text-xl">Connect your scrapbooks together.</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg p-3 mb-6 w-full text-sm">
            {error}
          </div>
        )}

        <div className="w-full flex justify-between gap-6">
          {/* Generate Code Side */}
          <div className="flex-1 flex flex-col items-center bg-black/20 p-5 rounded-2xl border border-white/5 relative">
            <h3 className="text-white/80 font-medium mb-3 text-sm tracking-wide uppercase">Your Code</h3>
            
            {generatedCode ? (
              <div className="flex flex-col items-center">
                <div className="text-3xl font-mono text-white mb-3 tracking-widest bg-white/10 px-4 py-2 rounded-xl">
                  {generatedCode}
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-400/50 text-pink-300 hover:bg-pink-400/10 transition-colors text-sm"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <div className="text-xs text-white/40 mt-3 flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" /> Expires in 10 mins
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-2 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            )}
          </div>

          <div className="flex items-center text-white/30 font-['Pacifico'] text-xl">or</div>

          {/* Join Code Side */}
          <div className="flex-1 flex flex-col items-center bg-black/20 p-5 rounded-2xl border border-white/5">
            <h3 className="text-white/80 font-medium mb-3 text-sm tracking-wide uppercase">Have a Code?</h3>
            
            <form onSubmit={handleJoin} className="w-full flex flex-col gap-3">
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="X7K9P2"
                maxLength={6}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-xl font-mono text-white focus:outline-none focus:border-amber-400/50 placeholder:text-white/20 uppercase"
              />
              <button
                type="submit"
                disabled={loading || joinCode.length !== 6}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Partner'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

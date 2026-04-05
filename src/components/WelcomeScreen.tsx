import React, { useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

export const WelcomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 touch-none"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)' }}>
      
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <Heart className="w-16 h-16 text-pink-400 mb-6 drop-shadow-[0_0_15px_rgba(244,114,182,0.5)] animate-pulse" />
        
        <h1 className="text-5xl font-['Pacifico'] text-white mb-4 drop-shadow-md">
          Memoir
        </h1>
        <p className="text-white/60 mb-12 font-['Caveat'] text-2xl">
          A private, synced scrapbook just for the two of you.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="group relative flex items-center justify-center gap-3 w-full bg-white text-gray-900 px-6 py-4 rounded-2xl font-medium text-lg hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <LogIn className="w-5 h-5 text-blue-500" />
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

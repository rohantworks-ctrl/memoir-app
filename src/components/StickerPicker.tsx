import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface StickerPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface StipopSticker {
  stickerId: number;
  packageId: number;
  stickerImg: string;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const [stickers, setStickers] = useState<StipopSticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('aesthetic');

  const fetchStickers = async (searchTerm: string) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_STICKER_API_KEY;
      const url = `https://messenger.stipop.io/v1/search?userId=memoria_user&q=${encodeURIComponent(searchTerm)}&lang=en&countryCode=US&pageNumber=1&limit=20`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': apiKey
        }
      });
      
      const data = await response.json();
      if (data && data.body && data.body.stickerList) {
        setStickers(data.body.stickerList);
      }
    } catch (error) {
      console.error("Failed to fetch stickers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers(query);
  }, []); // Run once on mount

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStickers(query);
  };

  return (
    <div 
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 bg-[#fffaf0] rounded-xl shadow-xl border border-[#e6dec8] flex flex-col overflow-hidden max-h-[400px] z-50 animate-in fade-in slide-in-from-bottom-2"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="p-3 border-b border-[#e6dec8] bg-[#fcf8ee]">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stickers..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-[#e6dec8] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4c5a3]"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 min-h-[200px] bg-[#fffaf0]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#b0a890]">
            <Loader2 className="animate-spin mr-2" size={20} />
            <span className="text-xs">Loading stickers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {stickers.map((sticker) => (
              <button
                key={sticker.stickerId}
                onClick={() => {
                   onSelect(sticker.stickerImg);
                   onClose();
                }}
                className="aspect-square p-1 rounded-lg hover:bg-black/5 transition-colors flex items-center justify-center"
              >
                <img src={sticker.stickerImg} alt="Sticker" className="w-full h-full object-contain pointer-events-none" />
              </button>
            ))}
            {stickers.length === 0 && (
                <div className="col-span-3 text-center text-xs text-gray-400 py-4">
                    No stickers found
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

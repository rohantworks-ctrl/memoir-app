import React from 'react';

interface DateLabelProps {
  date: string;
  onDateChange: (date: string) => void;
}

export const DateLabel: React.FC<DateLabelProps> = ({ date, onDateChange }) => {
  const formatted = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Pick a date ✨';

  return (
    <div className="absolute top-3 left-0 right-0 flex justify-center z-30 pointer-events-auto">
      <label className="relative cursor-pointer group">
        <span
          className="block text-center px-4 py-1 rounded-full text-sm font-['Caveat'] tracking-wide"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(4px)',
            color: '#7c3aed',
            fontSize: '1.1rem',
            boxShadow: '0 2px 12px rgba(124,58,237,0.12)',
            border: '1.5px dashed #c4b5fd',
            transition: 'background 0.2s',
          }}
        >
          {formatted} <span className="opacity-60 text-xs group-hover:opacity-100 transition-opacity">✏️</span>
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          style={{ zIndex: 2 }}
        />
      </label>
    </div>
  );
};

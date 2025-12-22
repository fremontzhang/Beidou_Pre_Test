import React from 'react';
import { Option } from '../types';

interface OptionCardProps {
  option: Option;
  onClick: () => void;
  index: number;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, onClick, index }) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden p-5 mb-4 rounded-xl glass-panel hover:bg-white/20 transition-all duration-200 border-l-4 border-transparent hover:border-pink-500 active:scale-95"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-pink-300 group-hover:bg-pink-500 group-hover:text-white transition-colors">
          {letters[index] || '-'}
        </div>
        <span className="text-lg font-medium text-slate-100 group-hover:text-white">
          {option.content}
        </span>
      </div>
    </button>
  );
};


import React from 'react';
import { Button } from '../ui/Button';

interface InfoModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-2xl font-black text-white mb-4 border-b border-slate-600 pb-2">
          {title}
        </div>
        <div className="text-slate-300 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
        <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600">
          Close
        </Button>
      </div>
    </div>
  );
};

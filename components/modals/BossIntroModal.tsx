
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BossType, GameSettings } from '../../types';
import { getBossIcon } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';
import { Button } from '../ui/Button';

const MotionDiv = motion.div as any;

interface BossIntroModalProps {
  bossType: BossType;
  onClose: () => void;
  settings: GameSettings;
}

export const BossIntroModal: React.FC<BossIntroModalProps> = ({ bossType, onClose, settings }) => {
  const [visible, setVisible] = useState(true);
  const info = TRANSLATIONS[settings.language].bosses[bossType];
  const t = TRANSLATIONS[settings.language].modals.bossIntro;

  if (!visible || bossType === BossType.NONE) return null;

  const handleClose = () => {
      setVisible(false);
      onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4"
        >
          <MotionDiv 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-slate-900 border-2 border-red-600 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(220,38,38,0.5)] relative overflow-hidden flex flex-col items-center text-center"
          >
             {/* Background Effect */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none"></div>
             
             <div className="text-8xl mb-6 animate-bounce drop-shadow-2xl">
                 {getBossIcon(bossType)}
             </div>
             
             <h2 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-tighter drop-shadow-md">
                 {info.name}
             </h2>
             
             <div className="w-16 h-1 bg-red-600 mb-6 rounded-full"></div>
             
             <p className="text-slate-300 text-lg mb-6 italic">
                 "{info.desc}"
             </p>
             
             <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8 w-full">
                 <h3 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-1">{t.specialAbility}</h3>
                 <p className="text-white font-medium">
                     {('ability' in info) ? info.ability : ''}
                 </p>
             </div>
             
             <Button onClick={handleClose} className="w-full bg-red-600 hover:bg-red-500 text-white py-4 text-xl font-bold shadow-lg uppercase tracking-widest">
                 {t.fight}
             </Button>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

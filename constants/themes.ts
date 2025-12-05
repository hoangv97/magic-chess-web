
import { BoardThemeId, BoardTheme } from '../types';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  CLASSIC: { name: 'Classic', light: 'bg-[#f0d9b5]', dark: 'bg-[#b58863]', bg: 'bg-[#1a1c23]', border: 'border-[#2a2018]' },
  FOREST: { name: 'Forest', light: 'bg-[#eeeed2]', dark: 'bg-[#769656]', bg: 'bg-[#1b2b1b]', border: 'border-[#334c33]' },
  OCEAN: { name: 'Ocean', light: 'bg-[#dee3e6]', dark: 'bg-[#4b7399]', bg: 'bg-[#0f172a]', border: 'border-[#1e293b]' },
  DARK: { name: 'Dark', light: 'bg-[#7c818c]', dark: 'bg-[#444952]', bg: 'bg-[#18181b]', border: 'border-[#27272a]' }
};

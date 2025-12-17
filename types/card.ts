
export enum CardType {
  SPAWN_QUEEN = 'SPAWN_QUEEN',
  SPAWN_ROOK = 'SPAWN_ROOK',
  SPAWN_BISHOP = 'SPAWN_BISHOP',
  SPAWN_KNIGHT = 'SPAWN_KNIGHT',
  SPAWN_PAWN = 'SPAWN_PAWN',
  
  SPAWN_FOOL = 'SPAWN_FOOL',
  SPAWN_SHIP = 'SPAWN_SHIP',
  SPAWN_ELEPHANT = 'SPAWN_ELEPHANT',
  SPAWN_DRAGON = 'SPAWN_DRAGON',
  SPAWN_DRAGON_LAVA = 'SPAWN_DRAGON_LAVA',
  SPAWN_DRAGON_ABYSS = 'SPAWN_DRAGON_ABYSS',
  SPAWN_DRAGON_FROZEN = 'SPAWN_DRAGON_FROZEN',

  SPAWN_CHANCELLOR = 'SPAWN_CHANCELLOR',
  SPAWN_ARCHBISHOP = 'SPAWN_ARCHBISHOP',
  SPAWN_MANN = 'SPAWN_MANN',
  SPAWN_AMAZON = 'SPAWN_AMAZON',
  SPAWN_CENTAUR = 'SPAWN_CENTAUR',
  SPAWN_ZEBRA = 'SPAWN_ZEBRA',
  SPAWN_CHAMPION = 'SPAWN_CHAMPION',

  EFFECT_SWITCH = 'EFFECT_SWITCH', // Switch 2 player pieces
  EFFECT_FREEZE = 'EFFECT_FREEZE', // Freeze random enemy
  EFFECT_LIMIT = 'EFFECT_LIMIT', // Limit enemy moves (implementation: reduce range or random skip?) -> Let's do: Enemy pieces move range = 1
  EFFECT_BORROW_ROOK = 'EFFECT_BORROW_ROOK',
  EFFECT_BORROW_KNIGHT = 'EFFECT_BORROW_KNIGHT',
  EFFECT_BORROW_BISHOP = 'EFFECT_BORROW_BISHOP',
  EFFECT_BACK_BASE = 'EFFECT_BACK_BASE', // Send own piece back to base row
  EFFECT_IMMORTAL = 'EFFECT_IMMORTAL', // Make own piece immortal for 1 turn
  
  EFFECT_TRAP = 'EFFECT_TRAP', // Suicide mode
  SPAWN_REVIVE = 'SPAWN_REVIVE', // Respawn dead piece
  EFFECT_AREA_FREEZE = 'EFFECT_AREA_FREEZE', // Freeze enemies around unit
  EFFECT_MIMIC = 'EFFECT_MIMIC', // Transform on kill
  EFFECT_ASCEND = 'EFFECT_ASCEND', // Pawn -> Major piece (3 turns life)
  EFFECT_IMMORTAL_LONG = 'EFFECT_IMMORTAL_LONG', // Immortal 3 turns
  EFFECT_PROMOTION_TILE = 'EFFECT_PROMOTION_TILE', // Create a promotion tile on enemy side

  // Curses
  CURSE_LAZY = 'CURSE_LAZY', // -10g if move without kill
  CURSE_MOVE_TAX = 'CURSE_MOVE_TAX', // -10g on move
  CURSE_SPELL_TAX = 'CURSE_SPELL_TAX', // -10g on playing card
  CURSE_DECAY = 'CURSE_DECAY', // Dead weight
}

export interface Card {
  id: string;
  type: CardType;
  title: string;
  description: string;
  cost: number; 
}



import { CardType, PieceType, RelicType, TileEffect, BossType } from '../types';
import { AREA_FREEZE_DURATION, ASCEND_DURATION, IMMORTAL_LONG_DURATION } from '../constants';

export const TRANSLATIONS = {
  en: {
    mainMenu: {
      title: "CHESS EVOLUTION",
      newGame: "NEW GAME",
      startCampaign: "👑 Start Campaign",
      customGame: "⚔️ Custom Game",
      settings: "Settings",
      wiki: "Game Wiki",
      credits: "Credits",
      boardSize: "Board Size",
      enemies: "Enemies",
      playerCount: "Player pieces",
      startCustom: "Start Custom Game",
      selectBoss: "Select Boss"
    },
    customSetup: {
      title: "CUSTOM GAME SETUP",
      boardSize: "Board Size",
      enemies: "Enemy Count",
      playerCount: "Player Pieces",
      selectBoss: "Select Boss",
      start: "Start Battle",
      back: "Back"
    },
    credits: {
      title: "CREDITS",
      dev: "Game Design & Development",
      art: "Art & Assets",
      music: "Sound & Music",
      thanks: "Special Thanks",
      back: "Back to Menu"
    },
    settings: {
      title: "SETTINGS",
      language: "Language",
      theme: "Board Theme",
      pieceSet: "Piece Set",
      sound: "Sound & Music",
      volume: "Volume",
      enableSound: "Enable Audio",
      back: "Back",
      reset: "Reset All Settings",
      themes: {
        CLASSIC: "Classic (Brown)",
        FOREST: "Forest (Green)",
        OCEAN: "Ocean (Blue)",
        DARK: "Dark Mode"
      },
      pieceSets: {
        STANDARD: "Standard",
        SIMPLE: "Simple"
      }
    },
    wiki: {
      title: "GAME WIKI",
      tabs: {
        rules: "Rules",
        cards: "Cards",
        bosses: "Bosses",
        relics: "Relics",
        terrain: "Terrain"
      },
      rules: {
        objective: { title: "Objective", desc: "Defeat the enemy King (Black) or eliminate all enemy units to win. If your King (White) dies or you run out of resources (cards/units), you lose." },
        gameplay: { title: "Gameplay", desc: "The game is turn-based. On your turn, you can move ONE piece AND play up to 3 cards. Cards cost Gold to play in campaign mode, or are free in custom mode depending on settings." },
        economy: { title: "Economy", desc: "In Campaign Mode, you earn Gold by defeating enemy pieces. Gold is used in the Merchant's Camp between levels to buy new Cards and Relics." },
        movement: { title: "Movement", desc: "Pieces move according to their type. Standard chess moves apply, with some custom fairy chess pieces like the Dragon, Elephant, or Chancellor." },
        elements: { title: "Elements", desc: "Some units and tiles have elemental properties. Ice freezes units. Lava destroys non-flying units. Abyss blocks ground movement." }
      }
    },
    header: {
      treasury: "Treasury",
      played: "Played",
      turns: "Turns",
      resign: "Resign",
      campaignLevel: "CAMPAIGN LEVEL"
    },
    game: {
      yourTurn: "Your Turn: Play cards or move a piece.",
      enemyTurn: "Enemy Turn...",
      selectTarget: "Select a target on the board to cast spell",
      emptyHand: "Your hand is empty.",
      deck: "Deck",
      victory: "VICTORY",
      defeat: "DEFEAT",
      victoryDescCampaign: "The enemy army has been annihilated!",
      victoryDescCustom: "You have won!",
      defeatDescCampaign: "Your army is depleted.",
      defeatDescCustom: "You have lost.",
      mainMenu: "Main Menu",
      restartCampaign: "Restart Campaign",
      close: "Close"
    },
    shop: {
      title: "Merchant's Camp",
      desc: "Spend your gold to reinforce your army.",
      relics: "Ancient Relics",
      cards: "Battle Cards",
      soldOut: "Sold Out",
      next: "Travel to Map",
      buy: "Buy",
      upgrade: "Upgrade to Lvl",
      newArtifact: "New Artifact",
      tooExpensive: "TOO EXPENSIVE"
    },
    restSite: {
        title: "Rest Site",
        desc: "You find a safe campfire. Do you wish to trade with a traveler or lighten your load?",
        tradeTitle: "Trade Offer",
        tradeDesc: "Give 1 card, Choose 1 of 3 random cards.",
        removeTitle: "Purge",
        removeDesc: "Remove 1 card from your deck.",
        leave: "Leave",
        tradeSelect: "Select a card to trade away",
        removeSelect: "Select a card to remove",
        actionTrade: "Trade",
        actionRemove: "Remove"
    },
    map: {
      title: "CAMPAIGN MAP",
      readOnly: "The path traveled...",
      choose: "Choose your next move...",
      close: "Close",
      zones: ["The Outskirts", "Shadow Forest", "Forgotten Ruins", "Dragon's Peak", "The Void"]
    },
    cards: {
      [CardType.SPAWN_QUEEN]: { title: "Summon Queen", desc: "Spawn a Queen on your base rows." },
      [CardType.SPAWN_ROOK]: { title: "Summon Rook", desc: "Spawn a Rook on your base rows." },
      [CardType.SPAWN_BISHOP]: { title: "Summon Bishop", desc: "Spawn a Bishop on your base rows." },
      [CardType.SPAWN_KNIGHT]: { title: "Summon Knight", desc: "Spawn a Knight on your base rows." },
      [CardType.SPAWN_PAWN]: { title: "Summon Pawn", desc: "Spawn a Pawn on your base rows." },
      
      [CardType.SPAWN_FOOL]: { title: "Summon Fool", desc: "Mimics the last move made by the enemy." },
      [CardType.SPAWN_SHIP]: { title: "Summon Ship", desc: "Moves like Rook. Cannot kill. Breaks walls." },
      [CardType.SPAWN_ELEPHANT]: { title: "Summon Elephant", desc: "Moves 1 fwd. Breaks walls. Swarms together." },
      [CardType.SPAWN_DRAGON]: { title: "Summon Dragon", desc: "Moves like Knight. Ignores terrain hazards." },
      [CardType.SPAWN_DRAGON_LAVA]: { title: "Lava Dragon", desc: "Leaves temporary Lava trail." },
      [CardType.SPAWN_DRAGON_ABYSS]: { title: "Abyss Dragon", desc: "Leaves temporary Abyss trail." },
      [CardType.SPAWN_DRAGON_FROZEN]: { title: "Frozen Dragon", desc: "Leaves temporary Frozen trail." },

      [CardType.SPAWN_CHANCELLOR]: { title: "Summon Chancellor", desc: "Moves like Rook + Knight." },
      [CardType.SPAWN_ARCHBISHOP]: { title: "Summon Archbishop", desc: "Moves like Bishop + Knight." },
      [CardType.SPAWN_MANN]: { title: "Summon Mann", desc: "Moves like Rook + Bishop." },
      [CardType.SPAWN_AMAZON]: { title: "Summon Amazon", desc: "Moves like Queen + Knight." },
      [CardType.SPAWN_CENTAUR]: { title: "Summon Centaur", desc: "Moves like King + Knight." },
      [CardType.SPAWN_ZEBRA]: { title: "Summon Zebra", desc: "Moves like Pawn + Knight." },
      [CardType.SPAWN_CHAMPION]: { title: "Summon Champion", desc: "Moves like Pawn + Bishop." },

      [CardType.EFFECT_SWITCH]: { title: "Swap Tactics", desc: "Switch positions of two of your pieces." },
      [CardType.EFFECT_FREEZE]: { title: "Glacial Glare", desc: "Freeze a random enemy piece for one turn." },
      [CardType.EFFECT_LIMIT]: { title: "Muddy Terrain", desc: "Limit enemy movement range to 1 tile next turn." },
      [CardType.EFFECT_BORROW_ROOK]: { title: "Rook's Spirit", desc: "Target piece moves like a Rook this turn." },
      [CardType.EFFECT_BORROW_KNIGHT]: { title: "Knight's Leap", desc: "Target piece moves like a Knight this turn." },
      [CardType.EFFECT_BORROW_BISHOP]: { title: "Bishop's Sight", desc: "Target piece moves like a Bishop this turn." },
      [CardType.EFFECT_BACK_BASE]: { title: "Recall", desc: "Return one of your pieces to the base row." },
      [CardType.EFFECT_IMMORTAL]: { title: "Divine Shield", desc: "Make a piece immortal until your next turn." },

      // New Cards
      [CardType.EFFECT_TRAP]: { title: "Martyr's Curse", desc: "Turn a random piece into a suicide trap. If killed, the attacker dies too." },
      [CardType.SPAWN_REVIVE]: { title: "Resurrection", desc: "Respawn a random dead piece at your base." },
      [CardType.EFFECT_AREA_FREEZE]: { title: "Frost Nova", desc: `Freeze all enemies around a selected unit for ${AREA_FREEZE_DURATION} turns.` },
      [CardType.EFFECT_MIMIC]: { title: "Doppelganger", desc: "When this unit kills an enemy, it permanently becomes that enemy type." },
      [CardType.EFFECT_ASCEND]: { title: "Heroic Ascension", desc: `Promote a Pawn to a random major piece. It dies in ${ASCEND_DURATION} turns.` },
      [CardType.EFFECT_IMMORTAL_LONG]: { title: "Aegis of Ages", desc: `Make a piece immortal for ${IMMORTAL_LONG_DURATION} turns.` },
    },
    relics: {
      [RelicType.LAST_WILL]: { name: "Martyr's Sigil", desc: "Spawn a {0} on base row when your piece dies." },
      [RelicType.NECROMANCY]: { name: "Soul Harvester", desc: "Spawn a {0} on base row when an enemy dies." },
      [RelicType.MIDAS_TOUCH]: { name: "Midas Touch", desc: "Earn 2x Gold from killing enemies." },
      [RelicType.DISCOUNT_CARD]: { name: "Merchant's Guild", desc: "50% off all Cards in the shop." },
      [RelicType.DISCOUNT_RELIC]: { name: "Archaeologist", desc: "50% off all Relics in the shop." },
      [RelicType.START_PAWN]: { name: "Militia", desc: "Start every game with {0} extra Pawn(s)." },
      [RelicType.START_ROOK]: { name: "Castle Guard", desc: "Start every game with {0} extra Rook(s)." },
      [RelicType.START_KNIGHT]: { name: "Cavalry", desc: "Start every game with {0} extra Knight(s)." },
      [RelicType.START_BISHOP]: { name: "Clergy", desc: "Start every game with {0} extra Bishop(s)." },
      [RelicType.START_QUEEN]: { name: "Royal Escort", desc: "Start every game with {0} extra Queen(s)." },
    },
    tiles: {
      [TileEffect.NONE]: { name: "Grass", desc: "Standard terrain. No special effects." },
      [TileEffect.HOLE]: { name: "Abyss", desc: "A deep chasm. Pieces cannot stand here, but sliding pieces can pass over." },
      [TileEffect.WALL]: { name: "Stone Wall", desc: "A solid obstacle. Pieces cannot enter or pass through." },
      [TileEffect.FROZEN]: { name: "Frozen Ground", desc: "Slippery ice. Entering this tile freezes piece for next turn." },
      [TileEffect.LAVA]: { name: "Magma Pool", desc: "Deadly heat. Entering this tile destroys the piece." }
    },
    bosses: {
      [BossType.NONE]: { name: "None", desc: "No boss." },
      [BossType.FROST_GIANT]: { 
        name: "Frost Giant", 
        desc: "A giant of ice and snow.",
        ability: "PASSIVE: Your pieces freeze after moving." 
      },
      [BossType.BLIZZARD_WITCH]: { 
        name: "Blizzard Witch", 
        desc: "Sorceress of the northern winds.",
        ability: "ACTIVE: Freezes random tiles each turn." 
      },
      [BossType.VOID_BRINGER]: { 
        name: "Void Bringer", 
        desc: "An entity from the abyss.",
        ability: "ACTIVE: Summons abyssal holes on the board each turn." 
      },
      [BossType.LAVA_TITAN]: { 
        name: "Lava Titan", 
        desc: "Forged in the heart of a volcano.",
        ability: "ACTIVE: Erupts magma pools on the board each turn." 
      },
      [BossType.STONE_GOLEM]: { 
        name: "Stone Golem", 
        desc: "An ancient guardian of stone.",
        ability: "ACTIVE: Constructs stone walls every 5 turns to block your path." 
      },
      [BossType.UNDEAD_LORD]: { 
        name: "Undead Lord", 
        desc: "A master of death who shields his minions.",
        ability: "ACTIVE: Grants immortality to a random minion. The chosen one changes every 5 turns." 
      },
      [BossType.CHAOS_LORD]: { 
        name: "Chaos Lord", 
        desc: "A being of pure unpredictability.",
        ability: "ACTIVE: Summons a random piece to the battlefield every 5 turns." 
      },
      [BossType.MIRROR_MAGE]: { 
        name: "Mirror Mage", 
        desc: "A sorcerer who mocks your every move.",
        ability: "REACTIVE: When you summon a piece, he summons a copy of it." 
      },
      [BossType.SOUL_EATER]: { 
        name: "Soul Devourer", 
        desc: "It hungers for the essence of your army.",
        ability: "PASSIVE: When your piece dies, you lose a card from your deck." 
      },
      [BossType.BLOOD_KING]: { 
        name: "Blood King", 
        desc: "A tyrant who fuels his army with blood.",
        ability: "REACTIVE: When he kills your piece, a new enemy is born." 
      },
      [BossType.HYDRA]: { 
        name: "The Hydra", 
        desc: "Cut off one head, two more shall take its place...",
        ability: "REACTIVE: When an enemy piece dies, another spawns to replace it." 
      },
      [BossType.MIND_CONTROLLER]: { 
        name: "Hypnotist", 
        desc: "Master of the mind.",
        ability: "ACTIVE: Takes control of one of your units every 5 turns." 
      },
      [BossType.SILENCER]: { 
        name: "The Silencer", 
        desc: "A mage hunter who suppresses magic.",
        ability: "PASSIVE: You cannot draw Spell cards. Only Units can be summoned." 
      },
      [BossType.ILLUSIONIST]: { 
        name: "The Illusionist", 
        desc: "He shrouds the battlefield in mystery.",
        ability: "PASSIVE: Unit cards in your hand and deck are unidentified until played." 
      }
    },
    deckSelection: {
      title: "Choose Your Army",
      desc: "Select a starter deck to begin your campaign.",
      decks: {
        "Fortress": { name: "Fortress", desc: "Defensive power with a heavy Rook." },
        "Divine": { name: "Divine", desc: "Diagonal control with a Bishop." },
        "Skirmish": { name: "Skirmish", desc: "Agile movement with Knight and Bishop." },
        "Experiment": { name: "Experiment", desc: "Experimental deck for strategic testing." },
        "Elite": { name: "Elite", desc: "Experimental deck for elite testing." },
        "Mystic": { name: "Mystic", desc: "Command magical creatures like Dragons and Fools." },
        "Elemental": { name: "Elemental", desc: "Control the elements with special Dragons." }
      }
    },
    pieces: {
      [PieceType.KING]: "King",
      [PieceType.QUEEN]: "Queen",
      [PieceType.ROOK]: "Rook",
      [PieceType.BISHOP]: "Bishop",
      [PieceType.KNIGHT]: "Knight",
      [PieceType.PAWN]: "Pawn",
      [PieceType.FOOL]: "Fool",
      [PieceType.SHIP]: "Ship",
      [PieceType.ELEPHANT]: "Elephant",
      [PieceType.DRAGON]: "Dragon",
      [PieceType.CHANCELLOR]: "Chancellor",
      [PieceType.ARCHBISHOP]: "Archbishop",
      [PieceType.MANN]: "Mann",
      [PieceType.AMAZON]: "Amazon",
      [PieceType.CENTAUR]: "Centaur",
      [PieceType.ZEBRA]: "Zebra",
      [PieceType.CHAMPION]: "Champion",
    },
    tooltips: {
      frozen: "❄️ Frozen ({0} turns left)",
      active: "Active",
      immortal: "🛡️ Immortal ({0} turns left)",
      movesLike: "✨ Moves like {0} this turn.",
      on: "On:",
      rightClick: "Right-click for info",
      status: "Status:",
      effect: "Effect:",
      currentTerrain: "Current Terrain",
      bossAbility: "Boss Ability"
    }
  },
  vi: {
    mainMenu: {
      title: "CỜ VUA TIẾN HÓA",
      newGame: "TRÒ CHƠI MỚI",
      startCampaign: "👑 Chiến Dịch",
      customGame: "⚔️ Tùy Chỉnh",
      settings: "Cài Đặt",
      wiki: "Bách Khoa Toàn Thư",
      credits: "Tác Giả",
      boardSize: "Kích Thước Bàn",
      enemies: "Số Lượng Kẻ Thù",
      playerCount: "Số lượng Quân",
      startCustom: "Bắt Đầu",
      selectBoss: "Chọn Trùm"
    },
    customSetup: {
      title: "THIẾT LẬP TRẬN ĐẤU",
      boardSize: "Kích Thước Bàn",
      enemies: "Kẻ Thù",
      playerCount: "Quân Của Bạn",
      selectBoss: "Chọn Trùm",
      start: "Vào Trận",
      back: "Quay Lại"
    },
    credits: {
      title: "ĐỘI NGŨ THỰC HIỆN",
      dev: "Thiết Kế & Lập Trình",
      art: "Hình Ảnh & Tài Nguyên",
      music: "Âm Thanh",
      thanks: "Lời Cảm Ơn",
      back: "Quay Lại Menu"
    },
    settings: {
      title: "CÀI ĐẶT",
      language: "Ngôn Ngữ",
      theme: "Giao Diện Bàn Cờ",
      pieceSet: "Bộ Quân Cờ",
      sound: "Âm Thanh & Nhạc",
      volume: "Âm Lượng",
      enableSound: "Bật Âm Thanh",
      back: "Quay Lại",
      reset: "Đặt Lại Cài Đặt",
      themes: {
        CLASSIC: "Cổ Điển (Nâu)",
        FOREST: "Rừng Rậm (Xanh)",
        OCEAN: "Đại Dương (Lam)",
        DARK: "Chế Độ Tối"
      },
      pieceSets: {
        STANDARD: "Tiêu Chuẩn",
        SIMPLE: "Đơn Giản"
      }
    },
    wiki: {
      title: "BÁCH KHOA TOÀN THƯ",
      tabs: {
        rules: "Luật Chơi",
        cards: "Thẻ Bài",
        bosses: "Trùm Cuối",
        relics: "Cổ Vật",
        terrain: "Địa Hình"
      },
      rules: {
        objective: { title: "Mục Tiêu", desc: "Đánh bại Vua địch (Đen) hoặc tiêu diệt toàn bộ quân địch để thắng. Nếu Vua của bạn (Trắng) chết hoặc bạn hết tài nguyên, bạn sẽ thua." },
        gameplay: { title: "Cách Chơi", desc: "Trò chơi theo lượt. Trong lượt của bạn, bạn có thể di chuyển MỘT quân cờ VÀ sử dụng tối đa 3 thẻ bài. Thẻ bài tốn Vàng trong chế độ chiến dịch." },
        economy: { title: "Kinh Tế", desc: "Trong chế độ Chiến Dịch, bạn kiếm Vàng bằng cách tiêu diệt quân địch. Vàng được dùng trong Trại Thương Nhân để mua Thẻ và Cổ Vật mới." },
        movement: { title: "Di Chuyển", desc: "Các quân cờ di chuyển theo loại của chúng. Quy tắc cờ vua tiêu chuẩn được áp dụng, cùng với một số quân cờ biến thể như Rồng, Voi hoặc Tể Tướng." },
        elements: { title: "Nguyên Tố", desc: "Một số đơn vị và ô có tính chất nguyên tố. Băng đóng băng đơn vị. Dung nham tiêu diệt đơn vị không bay. Vực thẳm chặn di chuyển trên mặt đất." }
      }
    },
    header: {
      treasury: "Kho Báu",
      played: "Đã Đánh",
      turns: "Lượt",
      resign: "Đầu Hàng",
      campaignLevel: "CẤP ĐỘ CHIẾN DỊCH"
    },
    game: {
      yourTurn: "Lượt Bạn: Đánh bài hoặc di chuyển quân.",
      enemyTurn: "Lượt Kẻ Thù...",
      selectTarget: "Chọn mục tiêu trên bàn cờ",
      emptyHand: "Hết bài trên tay.",
      deck: "Bộ Bài",
      victory: "CHIẾN THẮNG",
      defeat: "THẤT BẠI",
      victoryDescCampaign: "Quân địch đã bị tiêu diệt hoàn toàn!",
      victoryDescCustom: "Bạn đã thắng!",
      defeatDescCampaign: "Quân đội của bạn đã bị đánh bại.",
      defeatDescCustom: "Bạn đã thua.",
      mainMenu: "Màn Hình Chính",
      restartCampaign: "Chơi Lại",
      close: "Đóng"
    },
    shop: {
      title: "Trại Thương Nhân",
      desc: "Sử dụng vàng để củng cố quân đội.",
      relics: "Cổ Vật",
      cards: "Thẻ Bài",
      soldOut: "Hết Hàng",
      next: "Đi Đến Bản Đồ",
      buy: "Mua",
      upgrade: "Nâng cấp cấp",
      newArtifact: "Cổ vật mới",
      tooExpensive: "KHÔNG ĐỦ VÀNG"
    },
    restSite: {
        title: "Trạm Nghỉ",
        desc: "Bạn tìm thấy một đống lửa trại an toàn. Bạn muốn trao đổi với lữ khách hay giảm bớt hành lý?",
        tradeTitle: "Trao Đổi",
        tradeDesc: "Đổi 1 lá bài lấy 1 trong 3 lá ngẫu nhiên.",
        removeTitle: "Thanh Trừ",
        removeDesc: "Xóa 1 lá bài khỏi bộ bài.",
        leave: "Rời Đi",
        tradeSelect: "Chọn bài để đổi",
        removeSelect: "Chọn bài để xóa",
        actionTrade: "Đổi",
        actionRemove: "Xóa"
    },
    map: {
      title: "BẢN ĐỒ CHIẾN DỊCH",
      readOnly: "Hành trình đã qua...",
      choose: "Chọn hướng đi tiếp theo...",
      close: "Đóng",
      zones: ["Vùng Ngoại Ô", "Rừng Bóng Tối", "Tàn Tích Cổ", "Đỉnh Rồng", "Hư Vô"]
    },
    cards: {
      [CardType.SPAWN_QUEEN]: { title: "Triệu Hồi Hậu", desc: "Tạo một quân Hậu ở hàng cuối." },
      [CardType.SPAWN_ROOK]: { title: "Triệu Hồi Xe", desc: "Tạo một quân Xe ở hàng cuối." },
      [CardType.SPAWN_BISHOP]: { title: "Triệu Hồi Tượng", desc: "Tạo một quân Tượng ở hàng cuối." },
      [CardType.SPAWN_KNIGHT]: { title: "Triệu Hồi Mã", desc: "Tạo một quân Mã ở hàng cuối." },
      [CardType.SPAWN_PAWN]: { title: "Triệu Hồi Tốt", desc: "Tạo một quân Tốt ở hàng cuối." },

      [CardType.SPAWN_FOOL]: { title: "Triệu Hồi Gã Hề", desc: "Bắt chước nước đi cuối cùng của kẻ thù." },
      [CardType.SPAWN_SHIP]: { title: "Triệu Hồi Tàu", desc: "Đi như Xe. Không thể giết. Phá tường." },
      [CardType.SPAWN_ELEPHANT]: { title: "Triệu Hồi Voi", desc: "Đi 1 ô. Phá tường. Di chuyển theo đàn." },
      [CardType.SPAWN_DRAGON]: { title: "Triệu Hồi Rồng", desc: "Đi như Mã. Bỏ qua địa hình hiểm trở." },
      [CardType.SPAWN_DRAGON_LAVA]: { title: "Rồng Lửa", desc: "Để lại vệt dung nham tạm thời." },
      [CardType.SPAWN_DRAGON_ABYSS]: { title: "Rồng Hư Vô", desc: "Để lại vệt hư vô tạm thời." },
      [CardType.SPAWN_DRAGON_FROZEN]: { title: "Rồng Băng", desc: "Để lại vệt băng tạm thời." },

      [CardType.SPAWN_CHANCELLOR]: { title: "Triệu Hồi Tể Tướng", desc: "Di chuyển như Xe + Mã." },
      [CardType.SPAWN_ARCHBISHOP]: { title: "Triệu Hồi Giám Mục", desc: "Di chuyển như Tượng + Mã." },
      [CardType.SPAWN_MANN]: { title: "Triệu Hồi Mann", desc: "Di chuyển như Xe + Tượng." },
      [CardType.SPAWN_AMAZON]: { title: "Triệu Hồi Amazon", desc: "Di chuyển như Hậu + Mã." },
      [CardType.SPAWN_CENTAUR]: { title: "Triệu Hồi Nhân Mã", desc: "Di chuyển như Vua + Mã." },
      [CardType.SPAWN_ZEBRA]: { title: "Triệu Hồi Ngựa Vằn", desc: "Di chuyển như Tốt + Mã." },
      [CardType.SPAWN_CHAMPION]: { title: "Triệu Hồi Chiến Binh", desc: "Di chuyển như Tốt + Tượng." },

      [CardType.EFFECT_SWITCH]: { title: "Hoán Đổi", desc: "Đổi vị trí hai quân của bạn." },
      [CardType.EFFECT_FREEZE]: { title: "Ánh Nhìn Băng Giá", desc: "Đóng băng một quân địch ngẫu nhiên." },
      [CardType.EFFECT_LIMIT]: { title: "Địa Hình Bùn Lầy", desc: "Giới hạn di chuyển địch còn 1 ô." },
      [CardType.EFFECT_BORROW_ROOK]: { title: "Linh Hồn Xe", desc: "Quân mục tiêu di chuyển như Xe lượt này." },
      [CardType.EFFECT_BORROW_KNIGHT]: { title: "Bước Nhảy Mã", desc: "Quân mục tiêu di chuyển như Mã lượt này." },
      [CardType.EFFECT_BORROW_BISHOP]: { title: "Tầm Nhìn Tượng", desc: "Quân mục tiêu di chuyển như Tượng lượt này." },
      [CardType.EFFECT_BACK_BASE]: { title: "Thu Hồi", desc: "Đưa một quân của bạn về hàng cuối." },
      [CardType.EFFECT_IMMORTAL]: { title: "Khiên Thần", desc: "Làm một quân bất tử cho đến lượt sau." },

      // New Cards
      [CardType.EFFECT_TRAP]: { title: "Lời Nguyền Tử Sĩ", desc: "Biến một quân thành bẫy. Kẻ tấn công sẽ chết theo." },
      [CardType.SPAWN_REVIVE]: { title: "Hồi Sinh", desc: "Hồi sinh một quân đã chết ở hàng cuối." },
      [CardType.EFFECT_AREA_FREEZE]: { title: "Tuyết Lở", desc: `Đóng băng mọi kẻ thù quanh một quân trong ${AREA_FREEZE_DURATION} lượt.` },
      [CardType.EFFECT_MIMIC]: { title: "Kẻ Mạo Danh", desc: "Khi quân này giết địch, nó sẽ biến thành loại quân đó." },
      [CardType.EFFECT_ASCEND]: { title: "Thăng Hoa", desc: `Biến Tốt thành quân cấp cao. Chết sau ${ASCEND_DURATION} lượt.` },
      [CardType.EFFECT_IMMORTAL_LONG]: { title: "Bảo Hộ Vĩnh Cửu", desc: `Bất tử trong ${IMMORTAL_LONG_DURATION} lượt.` },
    },
    relics: {
      [RelicType.LAST_WILL]: { name: "Dấu Ấn Tử Sĩ", desc: "Tạo {0} khi quân bạn chết." },
      [RelicType.NECROMANCY]: { name: "Lưỡi Hái Linh Hồn", desc: "Tạo {0} khi quân địch chết." },
      [RelicType.MIDAS_TOUCH]: { name: "Bàn Tay Midas", desc: "Nhân đôi vàng khi diệt địch." },
      [RelicType.DISCOUNT_CARD]: { name: "Hội Thương Buôn", desc: "Giảm giá 50% Thẻ Bài." },
      [RelicType.DISCOUNT_RELIC]: { name: "Nhà Khảo Cổ", desc: "Giảm giá 50% Cổ Vật." },
      [RelicType.START_PAWN]: { name: "Dân Quân", desc: "Bắt đầu mỗi trận với thêm {0} Tốt." },
      [RelicType.START_ROOK]: { name: "Vệ Binh Hoàng Gia", desc: "Bắt đầu mỗi trận với thêm {0} Xe." },
      [RelicType.START_KNIGHT]: { name: "Kỵ Binh", desc: "Bắt đầu mỗi trận với thêm {0} Mã." },
      [RelicType.START_BISHOP]: { name: "Giáo Sĩ", desc: "Bắt đầu mỗi trận với thêm {0} Tượng." },
      [RelicType.START_QUEEN]: { name: "Hộ Vệ Nữ Hoàng", desc: "Bắt đầu mỗi trận với thêm {0} Hậu." },
    },
    tiles: {
      [TileEffect.NONE]: { name: "Cỏ", desc: "Địa hình thường." },
      [TileEffect.HOLE]: { name: "Vực Thẳm", desc: "Không thể đứng, quân bay có thể qua." },
      [TileEffect.WALL]: { name: "Tường Đá", desc: "Vật cản không thể đi qua." },
      [TileEffect.FROZEN]: { name: "Ô Băng", desc: "Trơn trượt. Đi vào sẽ bị đóng băng lượt sau." },
      [TileEffect.LAVA]: { name: "Dung Nham", desc: "Đi vào sẽ bị tiêu diệt ngay lập tức." }
    },
    bosses: {
      [BossType.NONE]: { name: "Không", desc: "Không có trùm." },
      [BossType.FROST_GIANT]: { 
        name: "Người Khổng Lồ Băng", 
        desc: "Kẻ thống trị băng tuyết.",
        ability: "BỊ ĐỘNG: Quân bạn bị đóng băng sau khi đi." 
      },
      [BossType.BLIZZARD_WITCH]: { 
        name: "Phù Thủy Bão Tuyết", 
        desc: "Phù thủy của gió bắc.",
        ability: "CHỦ ĐỘNG: Đóng băng các ô ngẫu nhiên mỗi lượt." 
      },
      [BossType.VOID_BRINGER]: { 
        name: "Sứ Giả Hư Vô", 
        desc: "Thực thể đến từ vực thẳm.",
        ability: "CHỦ ĐỘNG: Triệu hồi các hố đen trên bàn cờ mỗi lượt." 
      },
      [BossType.LAVA_TITAN]: { 
        name: "Titan Dung Nham", 
        desc: "Sinh ra từ lòng núi lửa.",
        ability: "CHỦ ĐỘNG: Phun trào dung nham lên bàn cờ mỗi lượt." 
      },
      [BossType.STONE_GOLEM]: { 
        name: "Người Đá Cổ Đại", 
        desc: "Vệ thần của đá.",
        ability: "CHỦ ĐỘNG: Dựng tường đá mỗi 5 lượt để chặn đường." 
      },
      [BossType.UNDEAD_LORD]: { 
        name: "Chúa Tể Bất Tử", 
        desc: "Kẻ ban phát sự bất tử.",
        ability: "CHỦ ĐỘNG: Ban sự bất tử cho một lính ngẫu nhiên. Thay đổi mỗi 5 lượt." 
      },
      [BossType.CHAOS_LORD]: { 
        name: "Chúa Tể Hỗn Mang", 
        desc: "Hiện thân của sự khó lường.",
        ability: "CHỦ ĐỘNG: Triệu hồi một quân cờ ngẫu nhiên mỗi 5 lượt." 
      },
      [BossType.MIRROR_MAGE]: { 
        name: "Pháp Sư Gương", 
        desc: "Kẻ nhạo báng mọi nước đi của bạn.",
        ability: "PHẢN ĐÒN: Khi bạn triệu hồi quân, hắn cũng triệu hồi bản sao." 
      },
      [BossType.SOUL_EATER]: { 
        name: "Kẻ Ăn Linh Hồn", 
        desc: "Hắn đói khát linh hồn quân đội của bạn.",
        ability: "BỊ ĐỘNG: Khi quân bạn chết, bạn mất một lá bài." 
      },
      [BossType.BLOOD_KING]: { 
        name: "Huyết Vương", 
        desc: "Kẻ bạo chúa nuôi quân bằng máu.",
        ability: "PHẢN ĐÒN: Khi hắn giết quân bạn, một kẻ thù mới được sinh ra." 
      },
      [BossType.HYDRA]: { 
        name: "Mãng Xà Hydra", 
        desc: "Chặt một đầu, mọc hai đầu...",
        ability: "PHẢN ĐÒN: Khi một quân địch chết, một quân khác sẽ thay thế." 
      },
      [BossType.MIND_CONTROLLER]: { 
        name: "Kẻ Thôi Miên", 
        desc: "Bậc thầy tâm trí.",
        ability: "CHỦ ĐỘNG: Chiếm quyền kiểm soát một quân của bạn mỗi 5 lượt." 
      },
      [BossType.SILENCER]: { 
        name: "Kẻ Câm Lặng", 
        desc: "Thợ săn pháp sư.",
        ability: "BỊ ĐỘNG: Bạn không thể rút bài Phép. Chỉ có thể triệu hồi Quân." 
      },
      [BossType.ILLUSIONIST]: { 
        name: "Ảo Thuật Gia", 
        desc: "Kẻ che giấu chiến trường.",
        ability: "BỊ ĐỘNG: Thẻ quân trong tay và bộ bài bị ẩn danh tính." 
      }
    },
    deckSelection: {
      title: "Chọn Quân Đội",
      desc: "Chọn một bộ bài khởi đầu cho chiến dịch.",
      decks: {
        "Fortress": { name: "Pháo Đài", desc: "Phòng thủ mạnh mẽ với quân Xe." },
        "Divine": { name: "Thần Thánh", desc: "Kiểm soát đường chéo với quân Tượng." },
        "Skirmish": { name: "Tiền Đạo", desc: "Linh hoạt với quân Mã và Tượng." },
        "Experiment": { name: "Thử Nghiệm", desc: "Bộ bài thử nghiệm chiến thuật." },
        "Elite": { name: "Tinh Hoa", desc: "Bộ bài thử nghiệm chiến thuật." },
        "Mystic": { name: "Huyền Bí", desc: "Điều khiển sinh vật phép thuật." },
        "Elemental": { name: "Nguyên Tố", desc: "Sử dụng rồng nguyên tố." }
      }
    },
    pieces: {
      [PieceType.KING]: "Vua",
      [PieceType.QUEEN]: "Hậu",
      [PieceType.ROOK]: "Xe",
      [PieceType.BISHOP]: "Tượng",
      [PieceType.KNIGHT]: "Mã",
      [PieceType.PAWN]: "Tốt",
      [PieceType.FOOL]: "Gã Hề",
      [PieceType.SHIP]: "Tàu",
      [PieceType.ELEPHANT]: "Voi",
      [PieceType.DRAGON]: "Rồng",
      [PieceType.CHANCELLOR]: "Tể Tướng",
      [PieceType.ARCHBISHOP]: "Giám Mục",
      [PieceType.MANN]: "Mann",
      [PieceType.AMAZON]: "Amazon",
      [PieceType.CENTAUR]: "Nhân Mã",
      [PieceType.ZEBRA]: "Ngựa Vằn",
      [PieceType.CHAMPION]: "Chiến Binh",
    },
    tooltips: {
      frozen: "❄️ Đóng băng (còn {0} lượt)",
      active: "Hoạt động",
      immortal: "🛡️ Bất tử ({0} lượt)",
      movesLike: "✨ Di chuyển như {0}",
      on: "On:",
      rightClick: "Chuột phải để xem",
      status: "Trạng thái:",
      effect: "Hiệu ứng:",
      currentTerrain: "Địa Hình",
      bossAbility: "Kỹ Năng Trùm"
    }
  }
};
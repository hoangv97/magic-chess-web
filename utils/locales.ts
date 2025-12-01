


import { CardType, PieceType, RelicType, TileEffect } from '../types';

export const TRANSLATIONS = {
  en: {
    mainMenu: {
      title: "CARD CHESS EVOLUTION",
      newGame: "NEW GAME",
      startCampaign: "👑 Start Campaign",
      customGame: "Custom Game",
      settings: "Settings",
      boardSize: "Board Size",
      enemies: "Enemies",
      playerCount: "Player pieces",
      startCustom: "Start Custom Game"
    },
    settings: {
      title: "SETTINGS",
      language: "Language",
      theme: "Board Theme",
      pieceSet: "Piece Set",
      sound: "Sound & Music",
      volume: "Volume",
      enableSound: "Enable Audio",
      back: "Back to Menu",
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
      [CardType.EFFECT_SWITCH]: { title: "Swap Tactics", desc: "Switch positions of two of your pieces." },
      [CardType.EFFECT_FREEZE]: { title: "Glacial Glare", desc: "Freeze a random enemy piece for one turn." },
      [CardType.EFFECT_LIMIT]: { title: "Muddy Terrain", desc: "Limit enemy movement range to 1 tile next turn." },
      [CardType.EFFECT_BORROW_ROOK]: { title: "Rook's Spirit", desc: "Target piece moves like a Rook this turn." },
      [CardType.EFFECT_BORROW_KNIGHT]: { title: "Knight's Leap", desc: "Target piece moves like a Knight this turn." },
      [CardType.EFFECT_BORROW_BISHOP]: { title: "Bishop's Sight", desc: "Target piece moves like a Bishop this turn." },
      [CardType.EFFECT_BACK_BASE]: { title: "Recall", desc: "Return one of your pieces to the base row." },
    },
    relics: {
      [RelicType.LAST_WILL]: { name: "Martyr's Sigil", desc: "Spawn a {0} on base row when your piece dies." },
      [RelicType.NECROMANCY]: { name: "Soul Harvester", desc: "Spawn a {0} on base row when an enemy dies." }
    },
    tiles: {
      [TileEffect.NONE]: { name: "Grass", desc: "Standard terrain. No special effects." },
      [TileEffect.HOLE]: { name: "Abyss", desc: "A deep chasm. Pieces cannot stand here, but sliding pieces can pass over." },
      [TileEffect.WALL]: { name: "Stone Wall", desc: "A solid obstacle. Pieces cannot enter or pass through." },
      [TileEffect.MUD]: { name: "Mud Puddle", desc: "Sticky terrain. Entering this tile freezes piece for next turn." },
      [TileEffect.LAVA]: { name: "Magma Pool", desc: "Deadly heat. Entering this tile destroys the piece." }
    },
    deckSelection: {
      title: "Choose Your Army",
      desc: "Select a starter deck to begin your campaign.",
      decks: {
        "Fortress": { name: "Fortress", desc: "Defensive power with a heavy Rook." },
        "Divine": { name: "Divine", desc: "Diagonal control with a Bishop." },
        "Skirmish": { name: "Skirmish", desc: "Agile movement with Knight and Bishop." },
        "Experiment": { name: "Experiment", desc: "Experimental deck for strategic testing." },
        "Testing": { name: "Testing", desc: "Deck for testing mechanics." }
      }
    },
    pieces: {
      [PieceType.KING]: "King",
      [PieceType.QUEEN]: "Queen",
      [PieceType.ROOK]: "Rook",
      [PieceType.BISHOP]: "Bishop",
      [PieceType.KNIGHT]: "Knight",
      [PieceType.PAWN]: "Pawn",
    },
    tooltips: {
      frozen: "❄️ Frozen ({0} turns left)",
      active: "Active",
      movesLike: "✨ Moves like {0} this turn.",
      on: "On:",
      rightClick: "Right-click for info",
      status: "Status:",
      effect: "Effect:",
      currentTerrain: "Current Terrain"
    }
  },
  vi: {
    mainMenu: {
      title: "CỜ VUA TIẾN HÓA",
      newGame: "TRÒ CHƠI MỚI",
      startCampaign: "👑 Chiến Dịch",
      customGame: "Chế Độ Tùy Chọn",
      settings: "Cài Đặt",
      boardSize: "Kích Thước Bàn",
      enemies: "Số Lượng Kẻ Thù",
      playerCount: "Số lượng Quân",
      startCustom: "Bắt Đầu"
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
      [CardType.EFFECT_SWITCH]: { title: "Hoán Đổi", desc: "Đổi vị trí hai quân của bạn." },
      [CardType.EFFECT_FREEZE]: { title: "Ánh Nhìn Băng Giá", desc: "Đóng băng một quân địch ngẫu nhiên." },
      [CardType.EFFECT_LIMIT]: { title: "Địa Hình Bùn Lầy", desc: "Giới hạn di chuyển địch còn 1 ô." },
      [CardType.EFFECT_BORROW_ROOK]: { title: "Linh Hồn Xe", desc: "Quân mục tiêu di chuyển như Xe lượt này." },
      [CardType.EFFECT_BORROW_KNIGHT]: { title: "Bước Nhảy Mã", desc: "Quân mục tiêu di chuyển như Mã lượt này." },
      [CardType.EFFECT_BORROW_BISHOP]: { title: "Tầm Nhìn Tượng", desc: "Quân mục tiêu di chuyển như Tượng lượt này." },
      [CardType.EFFECT_BACK_BASE]: { title: "Thu Hồi", desc: "Đưa một quân của bạn về hàng cuối." },
    },
    relics: {
      [RelicType.LAST_WILL]: { name: "Dấu Ấn Tử Sĩ", desc: "Tạo {0} khi quân bạn chết." },
      [RelicType.NECROMANCY]: { name: "Lưỡi Hái Linh Hồn", desc: "Tạo {0} khi quân địch chết." }
    },
    tiles: {
      [TileEffect.NONE]: { name: "Cỏ", desc: "Địa hình thường." },
      [TileEffect.HOLE]: { name: "Vực Thẳm", desc: "Không thể đứng, quân bay có thể qua." },
      [TileEffect.WALL]: { name: "Tường Đá", desc: "Vật cản không thể đi qua." },
      [TileEffect.MUD]: { name: "Bùn Lầy", desc: "Đi vào sẽ bị đóng băng lượt sau." },
      [TileEffect.LAVA]: { name: "Dung Nham", desc: "Đi vào sẽ bị tiêu diệt ngay lập tức." }
    },
    deckSelection: {
      title: "Chọn Quân Đội",
      desc: "Chọn một bộ bài khởi đầu cho chiến dịch.",
      decks: {
        "Fortress": { name: "Pháo Đài", desc: "Phòng thủ mạnh mẽ với quân Xe." },
        "Divine": { name: "Thần Thánh", desc: "Kiểm soát đường chéo với quân Tượng." },
        "Skirmish": { name: "Tiền Đạo", desc: "Linh hoạt với quân Mã và Tượng." },
        "Experiment": { name: "Thử Nghiệm", desc: "Bộ bài thử nghiệm chiến thuật." }
      }
    },
    pieces: {
      [PieceType.KING]: "Vua",
      [PieceType.QUEEN]: "Hậu",
      [PieceType.ROOK]: "Xe",
      [PieceType.BISHOP]: "Tượng",
      [PieceType.KNIGHT]: "Mã",
      [PieceType.PAWN]: "Tốt",
    },
    tooltips: {
      frozen: "❄️ Đóng băng (còn {0} lượt)",
      active: "Hoạt động",
      movesLike: "✨ Di chuyển như {0}",
      on: "On:",
      rightClick: "Chuột phải để xem",
      status: "Trạng thái:",
      effect: "Hiệu ứng:",
      currentTerrain: "Địa Hình"
    }
  }
};
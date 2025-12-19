import { CardType, PieceType, RelicType, TileEffect, BossType } from '../../types';
import { AREA_FREEZE_DURATION, ASCEND_DURATION, IMMORTAL_LONG_DURATION } from '../../constants';

export const vi = {
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
      back: "Quay Lại Menu",
      thanksPlaying: "Cảm ơn bạn đã chơi!",
      assets: "Standard & Fantasy SVG Sets",
      assetsSub: "Tạo bởi Google Gemini",
      musicSub: "Tổng hợp theo quy trình"
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
      preview: "👁️ Xem Trước Bàn Cờ",
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
        elements: { title: "Nguyên Tố", desc: "Một số đơn vị và ô có tính chất nguyên tố. Băng đóng băng đơn vị. Dung nham tiêu diệt đơn vị không bay. Vực thẳm chặn di chuyển trên mặt đất. Ô Dịch Chuyển đưa đơn vị tới vị trí tương ứng." }
      },
      ability: "KỸ NĂNG",
      baseCost: "Giá Gốc"
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
        actionRemove: "Xóa",
        confirmTrade: "Xác Nhận Trao Đổi",
        selectToAdd: "Chọn 1 thẻ để thêm vào bộ bài",
        giving: "Cho Đi",
        chooseReceive: "Chọn 1 Để Nhận",
        cancel: "Hủy",
        selected: "ĐÃ CHỌN"
    },
    map: {
      title: "BẢN ĐỒ CHIẾN DỊCH",
      readOnly: "Hành trình đã qua...",
      choose: "Chọn hướng đi tiếp theo...",
      close: "Đóng",
      zones: ["Vùng Ngoại Ô", "Rừng Bóng Tối", "Tàn Tích Cổ", "Đỉnh Rồng", "Hư Vô"]
    },
    cards: {
      [CardType.SPAWN_QUEEN]: { title: "Hậu", desc: "Tạo một quân Hậu ở hàng cuối." },
      [CardType.SPAWN_ROOK]: { title: "Xe", desc: "Tạo một quân Xe ở hàng cuối." },
      [CardType.SPAWN_BISHOP]: { title: "Tượng", desc: "Tạo một quân Tượng ở hàng cuối." },
      [CardType.SPAWN_KNIGHT]: { title: "Mã", desc: "Tạo một quân Mã ở hàng cuối." },
      [CardType.SPAWN_PAWN]: { title: "Tốt", desc: "Tạo một quân Tốt ở hàng cuối." },

      [CardType.SPAWN_FOOL]: { title: "Gã Hề", desc: "Bắt chước nước đi cuối cùng của kẻ thù." },
      [CardType.SPAWN_SHIP]: { title: "Tàu", desc: "Đi như Xe. Không thể giết. Phá tường." },
      [CardType.SPAWN_ELEPHANT]: { title: "Voi", desc: "Đi 1 ô. Phá tường. Di chuyển theo đàn." },
      [CardType.SPAWN_DRAGON]: { title: "Rồng", desc: "Đi như Mã. Bỏ qua địa hình hiểm trở." },
      [CardType.SPAWN_DRAGON_LAVA]: { title: "Rồng Lửa", desc: "Để lại vệt dung nham tạm thời." },
      [CardType.SPAWN_DRAGON_ABYSS]: { title: "Rồng Hư Vô", desc: "Để lại vệt hư vô tạm thời." },
      [CardType.SPAWN_DRAGON_FROZEN]: { title: "Rồng Băng", desc: "Để lại vệt băng tạm thời." },

      [CardType.EFFECT_CONVERT_ENEMY]: { title: "Lời Gọi Kẻ Phản Bội", desc: "Hồi sinh một quân địch đã chết thành quân mình ở phần sân địch. Yêu cầu đã diệt 1 quân địch." },
      [CardType.EFFECT_DUPLICATE]: { title: "Tiếng Vang Hư Ảo", desc: "Nhân bản một thẻ ngẫu nhiên trên tay và đưa vào bộ bài." },
      [CardType.EFFECT_SELECT_DRAW]: { title: "Mưu Kế Thâm Sâu", desc: "Chọn một thẻ bài bất kỳ từ bộ bài của bạn và đưa lên tay." },

      [CardType.SPAWN_CHANCELLOR]: { title: "Tể Tướng", desc: "Di chuyển như Xe + Mã." },
      [CardType.SPAWN_ARCHBISHOP]: { title: "Giám Mục", desc: "Di chuyển như Tượng + Mã." },
      [CardType.SPAWN_MANN]: { title: "Lâu Đài", desc: "Di chuyển như Xe + Tượng." },
      [CardType.SPAWN_AMAZON]: { title: "Amazon", desc: "Di chuyển như Hậu + Mã." },
      [CardType.SPAWN_CENTAUR]: { title: "Nhân Mã", desc: "Di chuyển như Vua + Mã." },
      [CardType.SPAWN_ZEBRA]: { title: "Ngựa Vằn", desc: "Di chuyển như Tốt + Mã." },
      [CardType.SPAWN_CHAMPION]: { title: "Chiến Binh", desc: "Di chuyển như Tốt + Tượng." },

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
      [CardType.EFFECT_PROMOTION_TILE]: { title: "Cổ Ngữ Thăng Cấp", desc: "Biến một ô trống ngẫu nhiên bên địch thành Ô Thăng Cấp." },
      [CardType.EFFECT_TELEPORT]: { title: "Ô Dịch Chuyển", desc: "Tạo một cặp ô Dịch Chuyển: một bên sân bạn, một bên sân địch." },

      // Curse Cards
      [CardType.CURSE_LAZY]: { title: "Lười Biếng", desc: "KHÔNG THỂ DÙNG. Khi cầm: Mất 10 vàng nếu di chuyển mà không giết địch." },
      [CardType.CURSE_MOVE_TAX]: { title: "Gánh Nặng", desc: "KHÔNG THỂ DÙNG. Khi cầm: Di chuyển tốn 10 vàng." },
      [CardType.CURSE_SPELL_TAX]: { title: "Câm Lặng", desc: "KHÔNG THỂ DÙNG. Khi cầm: Dùng bài tốn 10 vàng." },
      [CardType.CURSE_DECAY]: { title: "Mục Rữa", desc: "KHÔNG THỂ DÙNG." },
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
      [TileEffect.LAVA]: { name: "Dung Nham", desc: "Đi vào sẽ bị tiêu diệt ngay lập tức." },
      [TileEffect.PROMOTION]: { name: "Ô Thăng Cấp", desc: "Cổ ngữ thần bí. Thăng cấp Tốt/Xe/Tượng thành Hậu, Mã thành Amazon." },
      [TileEffect.TELEPORT]: { name: "Ô Dịch Chuyển", desc: "Cổng không gian. Landing ở đây sẽ đưa bạn tới ô tương ứng nếu trống." }
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
      },
      [BossType.THE_FACELESS]: {
        name: "Kẻ Vô Diện",
        desc: "Một kẻ biến hình chỉ huy đội quân mặt nạ.",
        ability: "BỊ ĐỘNG: Tất cả quân địch (trừ Vua) trông giống như Tốt."
      },
      [BossType.CURSE_WEAVER]: {
        name: "Thầy Nguyền Rủa",
        desc: "Một thầy phù thủy dệt nên những bất hạnh.",
        ability: "CHỦ ĐỘNG: Thêm một thẻ Lời Nguyền vào bộ bài của bạn mỗi 5 lượt."
      },
      [BossType.DOOM_BRINGER]: {
        name: "Linh Hồn Báo Thù",
        desc: "Một bóng ma ám ảnh những kẻ giết hại đồng loại của nó.",
        ability: "PHẢN ĐÒN: 50% cơ hội thêm thẻ Lời Nguyền vào bộ bài khi bạn giết kẻ thù."
      },
      [BossType.SOUL_CORRUPTOR]: {
        name: "Kẻ Tha Hóa Linh Hồn",
        desc: "Hắn làm ô uế linh hồn những chiến binh ngã xuống.",
        ability: "PHẢN ĐÒN: 50% cơ hội thêm thẻ Lời Nguyền vào bộ bài khi quân bạn chết."
      },
      [BossType.KNIGHT_SNARE]: {
        name: "Kẻ Bẫy Thú",
        desc: "Một thợ săn ghét những kẻ nhanh nhẹn.",
        ability: "BỊ ĐỘNG: Các quân Mã (và quân di chuyển như Mã) của bạn không thể di chuyển."
      },
      [BossType.ROOK_BREAKER]: {
        name: "Kẻ Phá Thành",
        desc: "Một gã khổng lồ chuyên đánh sập các tòa tháp.",
        ability: "BỊ ĐỘNG: Các quân Xe (và quân di chuyển như Xe) của bạn không thể di chuyển."
      },
      [BossType.BISHOP_BANE]: {
        name: "Đại Phán Quan",
        desc: "Một kẻ săn lùng các giáo sĩ cuồng tín.",
        ability: "BỊ ĐỘNG: Các quân Tượng (và quân di chuyển như Tượng) của bạn không thể di chuyển."
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
    },
    modals: {
      bossIntro: {
        specialAbility: "Kỹ Năng Đặc Biệt",
        fight: "Chiến Đấu!"
      },
      deck: {
        remaining: "Bộ Bài Còn Lại",
        list: "Danh Sách Bài",
        empty: "Bộ bài trống.",
        close: "Đóng",
        pick: "CHỌN MỘT THẺ"
      },
      options: {
        title: "Tùy Chọn",
        continue: "Tiếp Tục",
        settings: "Cài Đặt",
        mainMenu: "Màn Hình Chính"
      },
      relicDetail: {
        level: "Cấp",
        sell: "Bán",
        close: "Đóng"
      },
      info: {
        close: "Đóng"
      }
    },
    loadGame: {
      title: "Chế Độ Chiến Dịch",
      foundSave: "Tìm Thấy Phần Lưu",
      level: "Cấp Độ",
      gold: "Vàng",
      deckSize: "Số Bài",
      saveNote: "Tiến trình được lưu tự động tại mỗi điểm trên bản đồ.",
      noSave: "Không tìm thấy dữ liệu lưu.",
      continue: "Tiếp Tục Chiến Dịch",
      newCampaign: "Chiến Dịch Mới",
      clearData: "Xóa Dữ Liệu",
      back: "Quay Lại Menu"
    },
    eventResult: {
      gold: "{0} Vàng",
      confirmSelection: "Xác Nhận",
      chooseCard: "Chọn Thẻ Bài",
      curseAdded: "Đã Thêm Lời Nguyền!",
      selected: "ĐÃ CHỌN"
    },
    reward: {
        choose: "Chọn một thẻ để thêm vào bộ bài"
    }
};
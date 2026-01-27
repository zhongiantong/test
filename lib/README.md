# NEXUS Game Libraries
共用庫文件夾，存放所有遊戲共享的核心組件和系統。

## 📁 文件結構

```
lib/
├── core/
│   ├── interactions.js    # 統一交互管理系統
│   ├── audio.js           # 音效管理系統
│   ├── progress.js        # 進度與成就系統
│   └── feedback.js        # 視覺反饋系統
├── ui/
│   ├── components.js      # 共享UI組件
│   └── styles.css        # 統一樣式庫
└── utils/
    ├── storage.js         # 數據存儲工具
    └── helpers.js         # 通用工具函數
```

## 🎯 核心功能

### 1. 統一交互設計
- 跨遊戲一致的觸控/鼠標事件處理
- 標準化的手勢識別
- 統一的用戶引導系統

### 2. 音效管理
- 跨遊戲統一的音效庫
- 用戶偏好設置
- 程序化音效生成

### 3. 進度成就
- 統一的成就系統
- 跨遊戲數據追蹤
- 玩家統計分析

### 4. 視覺反饋
- 標準化的動畫效果
- 統一的通知系統
- 響應式交互反饋

## 📦 使用方式

每個遊戲HTML文件只需引入所需庫：

```html
<script src="lib/core/interactions.js"></script>
<script src="lib/core/audio.js"></script>
<script src="lib/ui/components.js"></script>
```

## 🔧 技術特點

- **純前端架構** - 無需構建工具
- **模組化設計** - 按需加載
- **本地存儲** - 使用localStorage數據持久化
- **跨瀏覽器兼容** - 支援現代瀏覽器
- **離線功能** - Service Worker緩存支援

---

*生成時間: 2026-01-27*  
*適用版本: NEXUS v3.0+*
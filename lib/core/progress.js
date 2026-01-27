/**
 * NEXUS 進度成就系統
 * 提供跨遊戲統一的成就系統和數據追蹤
 * 
 * @version 1.0.0
 * @author NEXUS Team
 */

class ProgressManager {
    constructor(options = {}) {
        this.options = {
            autoSave: true,
            saveInterval: 5000,
            enableNotifications: true,
            ...options
        };
        
        // 數據存儲
        this.achievements = this.loadAchievements();
        this.gameProgress = this.loadGameProgress();
        this.stats = this.loadStats();
        this.unlockedContent = this.loadUnlockedContent();
        
        // 當前會話數據
        this.currentSession = {
            gameId: null,
            startTime: null,
            score: 0,
            achievements: []
        };
        
        // 自動保存定時器
        this.saveTimer = null;
        
        this.init();
    }
    
    /**
     * 初始化進度管理器
     */
    init() {
        // 啟動自動保存
        if (this.options.autoSave) {
            this.startAutoSave();
        }
        
        // 創建成就通知系統
        this.createAchievementNotificationSystem();
        
        // 綁定頁面卸載事件
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
    }
    
    /**
     * 成就定義庫
     */
    getAchievementDefinitions() {
        return {
            // 通用成就
            firstPlay: { 
                name: '初試啼聲', 
                description: '完成第一場遊戲', 
                icon: '🎮',
                category: 'general',
                rarity: 'common',
                points: 10
            },
            speedDemon: { 
                name: '速度惡魔', 
                description: '在跑酷遊戲中達到50分', 
                icon: '🏃',
                category: 'gameplay',
                rarity: 'uncommon',
                points: 25
            },
            accuracyMaster: { 
                name: '精准大師', 
                description: '在動感遊戲中達到95%準確率', 
                icon: '🎯',
                category: 'skill',
                rarity: 'rare',
                points: 50
            },
            persistent: { 
                name: '堅持不懈', 
                description: '連續7天遊玩', 
                icon: '📅',
                category: 'time',
                rarity: 'uncommon',
                points: 30
            },
            explorer: { 
                name: '探索者', 
                description: '嘗試所有類型的遊戲', 
                icon: '🗺️',
                category: 'discovery',
                rarity: 'common',
                points: 20
            },
            
            // AI Pet 特定成就
            petLover: { 
                name: '寵物主人', 
                description: 'AI寵物達到滿狀態', 
                icon: '🐾',
                category: 'ai-pet',
                rarity: 'uncommon',
                points: 25
            },
            petCare: { 
                name: '細心照顧', 
                description: '完美照顧寵物24小時', 
                icon: '💝',
                category: 'ai-pet',
                rarity: 'rare',
                points: 40
            },
            petMaster: { 
                name: '寵物大師', 
                description: '解鎖所有寵物互動', 
                icon: '👑',
                category: 'ai-pet',
                rarity: 'epic',
                points: 75
            },
            jenniferSurvivor: { 
                name: 'Jennifer倖存者', 
                description: '在Jennifer模式下存活10分鐘', 
                icon: '😱',
                category: 'ai-pet',
                rarity: 'legendary',
                points: 100
            },
            
            // Space Dodger 特定成就
            spaceAce: { 
                name: '太空王牌', 
                description: '太空閃避達到100分', 
                icon: '🚀',
                category: 'space-dodger',
                rarity: 'uncommon',
                points: 25
            },
            dodgeMaster: { 
                name: '閃避大師', 
                description: '連續閃避50個隕石', 
                icon: '⭐',
                category: 'space-dodger',
                rarity: 'rare',
                points: 50
            },
            zeroDamage: { 
                name: '無傷通關', 
                description: '不碰撞完成一局', 
                icon: '🛡️',
                category: 'space-dodger',
                rarity: 'epic',
                points: 75
            },
            
            // Stress Buster 特定成就
            stressReliever: { 
                name: '壓力釋放者', 
                description: '發洩模擬器達到100分', 
                icon: '🥊',
                category: 'stress-buster',
                rarity: 'uncommon',
                points: 25
            },
            destroyer: { 
                name: '破壞之王', 
                description: '使用所有工具完成發洩', 
                icon: '💥',
                category: 'stress-buster',
                rarity: 'rare',
                points: 50
            },
            creative: { 
                name: '創意大師', 
                description: '創建10個不同的出氣筒', 
                icon: '🎨',
                category: 'stress-buster',
                rarity: 'epic',
                points: 75
            },
            
            // 經典遊戲成就
            mineSweeper: { 
                name: '排雷專家', 
                description: '踩地雷無失误完成', 
                icon: '💣',
                category: 'classic',
                rarity: 'rare',
                points: 50
            },
            numberGuesser: { 
                name: '數字神探', 
                description: '猜數字3次內猜中', 
                icon: '🔢',
                category: 'classic',
                rarity: 'uncommon',
                points: 25
            },
            rpsChampion: { 
                name: '猜拳冠軍', 
                description: '包剪揼連勝5次', 
                icon: '✊',
                category: 'classic',
                rarity: 'common',
                points: 20
            },
            
            // 特殊成就
            perfectionist: { 
                name: '完美主義者', 
                description: '在所有遊戲中都獲得S評級', 
                icon: '💎',
                category: 'special',
                rarity: 'legendary',
                points: 200
            },
            speedrunner: { 
                name: '速通玩家', 
                description: '在1小時內完成所有遊戲', 
                icon: '⚡',
                category: 'special',
                rarity: 'epic',
                points: 100
            },
            collector: { 
                name: '收藏家', 
                description: '解鎖50%的成就', 
                icon: '🏆',
                category: 'special',
                rarity: 'rare',
                points: 75
            }
        };
    }
    
    /**
     * 開始遊戲會話
     * @param {string} gameId - 遊戲ID
     */
    startGameSession(gameId) {
        this.currentSession = {
            gameId: gameId,
            startTime: Date.now(),
            score: 0,
            achievements: [],
            events: []
        };
        
        // 檢查首次遊玩成就
        if (!this.stats.gameStats[gameId]) {
            this.unlockAchievement('firstPlay');
        }
        
        // 更新遊戲統計
        if (!this.stats.gameStats[gameId]) {
            this.stats.gameStats[gameId] = {
                totalPlayTime: 0,
                totalSessions: 0,
                highScore: 0,
                totalScore: 0,
                lastPlayed: null
            };
        }
    }
    
    /**
     * 結束遊戲會話
     * @param {Object} sessionData - 會話數據
     */
    endGameSession(sessionData = {}) {
        if (!this.currentSession.gameId) return;
        
        const playTime = Date.now() - this.currentSession.startTime;
        const finalScore = sessionData.score || this.currentSession.score;
        const gameId = this.currentSession.gameId;
        
        // 更新遊戲統計
        const gameStats = this.stats.gameStats[gameId];
        gameStats.totalPlayTime += playTime;
        gameStats.totalSessions += 1;
        gameStats.totalScore += finalScore;
        gameStats.lastPlayed = new Date().toISOString();
        
        // 更新最高分
        if (finalScore > gameStats.highScore) {
            gameStats.highScore = finalScore;
            this.saveHighScore(gameId, finalScore);
        }
        
        // 更新全局統計
        this.stats.totalPlayTime += playTime;
        this.stats.totalSessions += 1;
        
        // 檢查遊戲特定成就
        this.checkGameAchievements(gameId, sessionData);
        
        // 保存數據
        this.saveStats();
        this.saveGameProgress();
        
        // 重置當前會話
        this.currentSession = {
            gameId: null,
            startTime: null,
            score: 0,
            achievements: [],
            events: []
        };
    }
    
    /**
     * 解鎖成就
     * @param {string} achievementId - 成就ID
     * @param {Object} metadata - 額外數據
     */
    unlockAchievement(achievementId, metadata = {}) {
        const achievement = this.getAchievementDefinitions()[achievementId];
        if (!achievement) {
            console.warn(`Achievement not found: ${achievementId}`);
            return false;
        }
        
        // 檢查是否已解鎖
        if (this.achievements[achievementId]) {
            return false;
        }
        
        // 解鎖成就
        this.achievements[achievementId] = {
            unlockedAt: Date.now(),
            gameId: this.currentSession.gameId,
            sessionId: this.currentSession.startTime,
            metadata: metadata
        };
        
        // 更新統計
        this.stats.totalAchievements++;
        this.stats.totalAchievementPoints += achievement.points;
        
        // 顯示成就解鎖通知
        this.showAchievementUnlocked(achievement);
        
        // 播放成就音效
        if (window.NexusAudio) {
            window.NexusAudio.play('achievement');
        }
        
        // 檢查成就連鎖
        this.checkAchievementChains(achievementId);
        
        // 保存數據
        this.saveAchievements();
        this.saveStats();
        
        // 添加到當前會話
        if (this.currentSession.gameId) {
            this.currentSession.achievements.push(achievementId);
        }
        
        return true;
    }
    
    /**
     * 檢查遊戲特定成就
     * @param {string} gameId - 遊戲ID
     * @param {Object} sessionData - 會話數據
     */
    checkGameAchievements(gameId, sessionData) {
        switch (gameId) {
            case 'ai-pet':
                this.checkAIPetAchievements(sessionData);
                break;
            case 'space-dodger':
                this.checkSpaceDodgerAchievements(sessionData);
                break;
            case 'stress-buster':
                this.checkStressBusterAchievements(sessionData);
                break;
            case 'game3': // 踩地雷
                this.checkMineSweeperAchievements(sessionData);
                break;
            case 'game2': // 猜數字
                this.checkNumberGuesserAchievements(sessionData);
                break;
            case 'game1': // 包剪揼
                this.checkRPSAchievements(sessionData);
                break;
        }
    }
    
    /**
     * 檢查 AI Pet 成就
     */
    checkAIPetAchievements(sessionData) {
        if (sessionData.petStats) {
            const stats = sessionData.petStats;
            
            // 寵物滿狀態成就
            if (stats.hunger >= 100 && stats.clean >= 100 && stats.energy >= 100) {
                this.unlockAchievement('petLover');
            }
            
            // Jennifer 模式成就
            if (sessionData.isJennifer && sessionData.survivalTime >= 600000) { // 10分鐘
                this.unlockAchievement('jenniferSurvivor');
            }
        }
    }
    
    /**
     * 檢查 Space Dodger 成就
     */
    checkSpaceDodgerAchievements(sessionData) {
        const score = sessionData.score || 0;
        
        // 分數成就
        if (score >= 100) {
            this.unlockAchievement('spaceAce');
        }
        
        // 無傷成就
        if (sessionData.noDamage) {
            this.unlockAchievement('zeroDamage');
        }
        
        // 連續閃避成就
        if (sessionData.consecutiveDodges >= 50) {
            this.unlockAchievement('dodgeMaster');
        }
    }
    
    /**
     * 檢查 Stress Buster 成就
     */
    checkStressBusterAchievements(sessionData) {
        const score = sessionData.score || 0;
        
        // 分數成就
        if (score >= 100) {
            this.unlockAchievement('stressReliever');
        }
        
        // 使用所有工具成就
        if (sessionData.toolsUsed && sessionData.toolsUsed.length >= 5) {
            this.unlockAchievement('destroyer');
        }
        
        // 創意成就
        if (sessionData.createdTargets >= 10) {
            this.unlockAchievement('creative');
        }
    }
    
    /**
     * 檢查經典遊戲成就
     */
    checkMineSweeperAchievements(sessionData) {
        if (sessionData.perfectGame) {
            this.unlockAchievement('mineSweeper');
        }
    }
    
    checkNumberGuesserAchievements(sessionData) {
        if (sessionData.guesses <= 3) {
            this.unlockAchievement('numberGuesser');
        }
    }
    
    checkRPSAchievements(sessionData) {
        if (sessionData.winStreak >= 5) {
            this.unlockAchievement('rpsChampion');
        }
    }
    
    /**
     * 檢查成就連鎖
     */
    checkAchievementChains(unlockedId) {
        const chains = {
            // 收藏家連鎖
            collector: [
                { threshold: 5, achievement: 'collector' },
                { threshold: 10, achievement: 'collector' },
                { threshold: 25, achievement: 'collector' },
                { threshold: 50, achievement: 'collector' }
            ],
            // 探索者連鎖
            explorer: [
                { threshold: 3, achievement: 'explorer' },
                { threshold: 5, achievement: 'explorer' },
                { threshold: 8, achievement: 'explorer' }
            ]
        };
        
        // 檢查收藏家成就
        const totalAchievements = Object.keys(this.achievements).length;
        const totalDefinitions = Object.keys(this.getAchievementDefinitions()).length;
        const percentage = (totalAchievements / totalDefinitions) * 100;
        
        if (percentage >= 50 && !this.achievements.collector) {
            this.unlockAchievement('collector');
        }
    }
    
    /**
     * 顯示成就解鎖通知
     */
    showAchievementUnlocked(achievement) {
        if (!this.options.enableNotifications) return;
        
        const popup = document.createElement('div');
        popup.className = 'nexus-achievement-popup';
        popup.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">🎉 成就解鎖!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} 點</div>
            </div>
            <div class="achievement-rarity ${achievement.rarity}">${this.getRarityText(achievement.rarity)}</div>
        `;
        
        // 添加到頁面
        document.body.appendChild(popup);
        
        // 動畫效果
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        // 自動移除
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 4000);
    }
    
    /**
     * 獲取稀有度文本
     */
    getRarityText(rarity) {
        const rarityMap = {
            common: '普通',
            uncommon: '罕見',
            rare: '稀有',
            epic: '史詩',
            legendary: '傳說'
        };
        return rarityMap[rarity] || '未知';
    }
    
    /**
     * 創建成就通知系統
     */
    createAchievementNotificationSystem() {
        // 創建通知容器
        const container = document.createElement('div');
        container.id = 'nexus-achievement-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 2000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    /**
     * 更新遊戲進度
     * @param {string} gameId - 遊戲ID
     * @param {Object} progress - 進度數據
     */
    updateGameProgress(gameId, progress) {
        if (!this.gameProgress[gameId]) {
            this.gameProgress[gameId] = {};
        }
        
        this.gameProgress[gameId] = {
            ...this.gameProgress[gameId],
            ...progress,
            lastUpdated: Date.now()
        };
        
        this.saveGameProgress();
    }
    
    /**
     * 獲取遊戲統計
     * @param {string} gameId - 遊戲ID
     */
    getGameStats(gameId) {
        return this.stats.gameStats[gameId] || {
            totalPlayTime: 0,
            totalSessions: 0,
            highScore: 0,
            totalScore: 0,
            lastPlayed: null
        };
    }
    
    /**
     * 獲取成就進度
     */
    getAchievementProgress() {
        const definitions = this.getAchievementDefinitions();
        const total = Object.keys(definitions).length;
        const unlocked = Object.keys(this.achievements).length;
        const percentage = (unlocked / total) * 100;
        
        return {
            total: total,
            unlocked: unlocked,
            percentage: percentage,
            points: this.stats.totalAchievementPoints || 0
        };
    }
    
    /**
     * 創建成就面板
     */
    createAchievementPanel() {
        const panel = document.createElement('div');
        panel.className = 'nexus-achievement-panel';
        panel.innerHTML = `
            <div class="achievement-header">
                <h2>🏆 成就系統</h2>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getAchievementProgress().percentage}%"></div>
                    </div>
                    <div class="progress-text">${this.getAchievementProgress().unlocked}/${this.getAchievementProgress().total}</div>
                </div>
            </div>
            <div class="achievement-categories">
                ${this.createAchievementCategories()}
            </div>
            <div class="achievement-list">
                ${this.createAchievementList()}
            </div>
        `;
        
        return panel;
    }
    
    /**
     * 創建成就分類
     */
    createAchievementCategories() {
        const categories = ['general', 'gameplay', 'skill', 'ai-pet', 'space-dodger', 'stress-buster', 'classic', 'special'];
        const categoryNames = {
            general: '通用',
            gameplay: '遊戲',
            skill: '技能',
            'ai-pet': 'AI寵物',
            'space-dodger': '太空閃避',
            'stress-buster': '發洩模擬',
            classic: '經典遊戲',
            special: '特殊'
        };
        
        return categories.map(cat => `
            <div class="category-tab" data-category="${cat}">
                ${categoryNames[cat] || cat}
            </div>
        `).join('');
    }
    
    /**
     * 創建成就列表
     */
    createAchievementList() {
        const definitions = this.getAchievementDefinitions();
        
        return Object.entries(definitions).map(([id, achievement]) => {
            const isUnlocked = this.achievements[id];
            const rarity = achievement.rarity || 'common';
            
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'} ${rarity}" data-id="${id}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-details">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        <div class="achievement-meta">
                            <span class="achievement-points">${achievement.points} 點</span>
                            <span class="achievement-rarity">${this.getRarityText(rarity)}</span>
                            ${isUnlocked ? `<span class="achievement-date">${new Date(this.achievements[id].unlockedAt).toLocaleDateString()}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * 啟動自動保存
     */
    startAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        
        this.saveTimer = setInterval(() => {
            this.saveAllData();
        }, this.options.saveInterval);
    }
    
    /**
     * 停止自動保存
     */
    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }
    
    /**
     * 保存所有數據
     */
    saveAllData() {
        this.saveAchievements();
        this.saveGameProgress();
        this.saveStats();
        this.saveUnlockedContent();
    }
    
    /**
     * 數據存儲方法
     */
    loadAchievements() {
        try {
            const saved = localStorage.getItem('nexus_achievements');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load achievements:', error);
            return {};
        }
    }
    
    saveAchievements() {
        try {
            localStorage.setItem('nexus_achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.warn('Failed to save achievements:', error);
        }
    }
    
    loadGameProgress() {
        try {
            const saved = localStorage.getItem('nexus_game_progress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load game progress:', error);
            return {};
        }
    }
    
    saveGameProgress() {
        try {
            localStorage.setItem('nexus_game_progress', JSON.stringify(this.gameProgress));
        } catch (error) {
            console.warn('Failed to save game progress:', error);
        }
    }
    
    loadStats() {
        try {
            const saved = localStorage.getItem('nexus_player_stats');
            return saved ? JSON.parse(saved) : {
                totalPlayTime: 0,
                totalSessions: 0,
                totalAchievements: 0,
                totalAchievementPoints: 0,
                gameStats: {},
                firstPlayDate: null
            };
        } catch (error) {
            console.warn('Failed to load stats:', error);
            return {
                totalPlayTime: 0,
                totalSessions: 0,
                totalAchievements: 0,
                totalAchievementPoints: 0,
                gameStats: {},
                firstPlayDate: null
            };
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('nexus_player_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Failed to save stats:', error);
        }
    }
    
    loadUnlockedContent() {
        try {
            const saved = localStorage.getItem('nexus_unlocked_content');
            return saved ? JSON.parse(saved) : {
                games: ['game1', 'game2', 'game3'], // 默認解鎖經典遊戲
                features: [],
                themes: []
            };
        } catch (error) {
            console.warn('Failed to load unlocked content:', error);
            return {
                games: ['game1', 'game2', 'game3'],
                features: [],
                themes: []
            };
        }
    }
    
    saveUnlockedContent() {
        try {
            localStorage.setItem('nexus_unlocked_content', JSON.stringify(this.unlockedContent));
        } catch (error) {
            console.warn('Failed to save unlocked content:', error);
        }
    }
    
    /**
     * 保存高分
     */
    saveHighScore(gameId, score) {
        try {
            let highScores = JSON.parse(localStorage.getItem('nexus_highscores') || '{}');
            if (!highScores[gameId] || score > highScores[gameId]) {
                highScores[gameId] = score;
                localStorage.setItem('nexus_highscores', JSON.stringify(highScores));
            }
        } catch (error) {
            console.warn('Failed to save high score:', error);
        }
    }
}

// 創建全局實例
window.NexusProgress = new ProgressManager();

// 添加必要的CSS樣式
const nexusProgressStyles = `
.nexus-achievement-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    z-index: 3000;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 20px;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
}

.nexus-achievement-popup.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.achievement-icon {
    font-size: 48px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.achievement-info {
    flex: 1;
}

.achievement-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
}

.achievement-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
}

.achievement-desc {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
}

.achievement-points {
    font-size: 12px;
    color: #ffd700;
    font-weight: bold;
}

.achievement-rarity {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
}

.achievement-rarity.common { background: #95a5a6; }
.achievement-rarity.uncommon { background: #2ecc71; }
.achievement-rarity.rare { background: #3498db; }
.achievement-rarity.epic { background: #9b59b6; }
.achievement-rarity.legendary { background: #f39c12; }

.nexus-achievement-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    z-index: 2500;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    color: white;
}

.achievement-header {
    text-align: center;
    margin-bottom: 20px;
}

.achievement-header h2 {
    margin: 0 0 15px 0;
    font-size: 28px;
    background: linear-gradient(45deg, #00d2ff, #ff0055);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.achievement-progress {
    display: flex;
    align-items: center;
    gap: 15px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00d2ff, #ff0055);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    font-weight: bold;
    min-width: 60px;
    text-align: right;
}

.achievement-categories {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
}

.category-tab {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
}

.category-tab:hover {
    background: rgba(255, 255, 255, 0.2);
}

.category-tab.active {
    background: var(--primary, #00d2ff);
    color: black;
    border-color: var(--primary, #00d2ff);
}

.achievement-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.achievement-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.2s ease;
}

.achievement-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.achievement-item.unlocked {
    background: rgba(0, 210, 255, 0.1);
    border-color: rgba(0, 210, 255, 0.3);
}

.achievement-item.locked {
    opacity: 0.6;
}

.achievement-item .achievement-icon {
    font-size: 32px;
    filter: grayscale(1);
}

.achievement-item.unlocked .achievement-icon {
    filter: grayscale(0);
}

.achievement-details {
    flex: 1;
}

.achievement-name {
    font-weight: bold;
    margin-bottom: 5px;
}

.achievement-description {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 8px;
}

.achievement-meta {
    display: flex;
    gap: 10px;
    font-size: 11px;
    opacity: 0.7;
}

.achievement-points {
    color: #ffd700;
    font-weight: bold;
}

.achievement-date {
    color: #00d2ff;
}
`;

// 注入樣式
const progressStyleSheet = document.createElement('style');
progressStyleSheet.textContent = nexusProgressStyles;
document.head.appendChild(progressStyleSheet);

// 導出類（供模組化使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressManager;
}
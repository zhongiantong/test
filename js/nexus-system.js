// ========== NEXUS 統一交互系統 ==========

// 音效管理器
class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.sounds = {
            success: { freq: [523, 659, 784], duration: 0.3, type: 'sine' },
            fail: { freq: [200, 150], duration: 0.5, type: 'sawtooth' },
            click: { freq: [800], duration: 0.1, type: 'square' },
            achievement: { freq: [400, 600, 800, 1000], duration: 0.6, type: 'triangle' },
            hover: { freq: [1200], duration: 0.05, type: 'sine' },
            collect: { freq: [600, 800, 1000], duration: 0.2, type: 'sine' },
            gameStart: { freq: [300, 400, 500, 600], duration: 0.8, type: 'square' },
            levelUp: { freq: [400, 600, 800], duration: 0.4, type: 'sine' }
        };
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    play(type) {
        if (!this.enabled || !this.audioContext) return;
        
        const sound = this.sounds[type];
        if (!sound) return;

        const playNote = (frequency, startTime, duration) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        const now = this.audioContext.currentTime;
        if (Array.isArray(sound.freq)) {
            sound.freq.forEach((freq, i) => {
                playNote(freq, now + i * 0.1, sound.duration);
            });
        } else {
            playNote(sound.freq, now, sound.duration);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// 視覺反饋管理器
class VisualFeedback {
    constructor() {
        this.toastContainer = null;
        this.initToastContainer();
    }

    initToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 10px; font-size: 18px;">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span>${message}</span>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showSuccess(element, message = "成功！") {
        element.classList.add('success-feedback');
        this.showToast(message, 'success');
        setTimeout(() => element.classList.remove('success-feedback'), 600);
    }

    showError(element, message = "失敗！") {
        element.classList.add('error-feedback');
        this.showToast(message, 'error');
        setTimeout(() => element.classList.remove('error-feedback'), 600);
    }

    showAchievement(title, description, icon = '🏆') {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-icon">${icon}</div>
            <div class="achievement-title">${title}</div>
            <div class="achievement-desc">${description}</div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.classList.add('show'), 10);
        
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 600);
        }, 3000);
    }
}

// 交互引導管理器
class InteractionGuide {
    constructor() {
        this.currentGuide = null;
        this.templates = {
            'motion': {
                icon: '📷',
                title: '體感控制',
                description: '身體左右移動控制遊戲角色',
                tips: ['站定在鏡頭前', '左右移動身體', '避免障礙物']
            },
            'drag': {
                icon: '👆',
                title: '拖曳操作',
                description: '拖曳移動，點擊互動',
                tips: ['按住拖曳', '釋放放下', '雙擊特殊功能']
            },
            'click': {
                icon: '🖱️',
                title: '點擊操作',
                description: '點擊操作，長按功能',
                tips: ['單擊選擇', '長按特殊', '快速連點']
            },
            'keyboard': {
                icon: '⌨️',
                title: '鍵盤控制',
                description: '使用鍵盤控制遊戲',
                tips: ['方向鍵移動', '空格鍵跳躍', 'Enter確認']
            }
        };
    }

    show(type, gameName = '') {
        if (this.currentGuide) return;
        
        const template = this.templates[type] || this.templates['click'];
        
        this.currentGuide = document.createElement('div');
        this.currentGuide.className = 'interaction-guide';
        this.currentGuide.innerHTML = `
            <h3>${template.icon} ${template.title}</h3>
            <div class="interaction-guide-icon">${template.icon}</div>
            <p>${template.description}</p>
            <div style="text-align: left; margin: 20px 0;">
                ${template.tips.map(tip => `<div style="margin: 5px 0;">• ${tip}</div>`).join('')}
            </div>
            <button class="nexus-btn" onclick="window.nexus.interactionGuide.hide()">開始遊戲</button>
            <button onclick="window.nexus.interactionGuide.hide()" style="margin-left: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.3);">跳過</button>
        `;
        
        document.body.appendChild(this.currentGuide);
        
        // 聲音效果
        if (window.nexus?.soundManager) {
            window.nexus.soundManager.play('gameStart');
        }
    }

    hide() {
        if (this.currentGuide) {
            this.currentGuide.remove();
            this.currentGuide = null;
        }
    }
}

// 遊戲進度管理器
class GameProgress {
    constructor() {
        this.data = this.loadData();
        this.achievements = {
            firstWin: { name: '首次勝利', icon: '🏆', desc: '完成第一個遊戲' },
            speedDemon: { name: '速度惡魔', icon: '⚡', desc: '30秒內完成遊戲' },
            perfectScore: { name: '完美分數', icon: '💯', desc: '獲得最高分數' },
            explorer: { name: '探索者', icon: '🔍', desc: '嘗試所有遊戲類型' },
            persistent: { name: '堅持不懈', icon: '💪', desc: '連續7天遊戲' },
            master: { name: '大師', icon: '👑', desc: '解鎖所有成就' }
        };
    }

    loadData() {
        try {
            return JSON.parse(localStorage.getItem('nexus_progress')) || {
                totalPlayTime: 0,
                gamesPlayed: {},
                highScores: {},
                achievements: [],
                stats: {
                    totalWins: 0,
                    totalGames: 0,
                    favoriteGame: null,
                    currentStreak: 0,
                    bestStreak: 0,
                    lastPlayDate: null
                }
            };
        } catch (e) {
            return this.getDefaultData();
        }
    }

    saveData() {
        localStorage.setItem('nexus_progress', JSON.stringify(this.data));
    }

    recordGamePlay(gameId, score = 0, duration = 0) {
        if (!this.data.gamesPlayed[gameId]) {
            this.data.gamesPlayed[gameId] = {
                plays: 0,
                totalTime: 0,
                bestScore: 0,
                lastPlayed: null
            };
        }

        const game = this.data.gamesPlayed[gameId];
        game.plays++;
        game.totalTime += duration;
        game.lastPlayed = new Date().toISOString();

        if (score > game.bestScore) {
            game.bestScore = score;
            this.data.highScores[gameId] = score;
        }

        this.data.totalPlayTime += duration;
        this.data.stats.totalGames++;
        
        if (score > 0) {
            this.data.stats.totalWins++;
        }

        this.updateStreak();
        this.checkAchievements(gameId, score, duration);
        this.saveData();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.data.stats.lastPlayDate;
        
        if (lastPlay) {
            const lastDate = new Date(lastPlay);
            const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                this.data.stats.currentStreak++;
            } else if (daysDiff > 1) {
                this.data.stats.currentStreak = 1;
            }
        } else {
            this.data.stats.currentStreak = 1;
        }
        
        this.data.stats.lastPlayDate = today;
        if (this.data.stats.currentStreak > this.data.stats.bestStreak) {
            this.data.stats.bestStreak = this.data.stats.currentStreak;
        }
    }

    checkAchievements(gameId, score, duration) {
        // 首次勝利
        if (score > 0 && !this.data.achievements.includes('firstWin')) {
            this.unlockAchievement('firstWin');
        }

        // 速度惡魔
        if (duration < 30 && !this.data.achievements.includes('speedDemon')) {
            this.unlockAchievement('speedDemon');
        }

        // 完美分數 (簡化判斷)
        if (score >= 100 && !this.data.achievements.includes('perfectScore')) {
            this.unlockAchievement('perfectScore');
        }

        // 探索者
        const gameTypes = new Set(Object.keys(this.data.gamesPlayed));
        if (gameTypes.size >= 5 && !this.data.achievements.includes('explorer')) {
            this.unlockAchievement('explorer');
        }

        // 堅持不懈
        if (this.data.stats.currentStreak >= 7 && !this.data.achievements.includes('persistent')) {
            this.unlockAchievement('persistent');
        }

        // 大師
        if (this.data.achievements.length >= 5 && !this.data.achievements.includes('master')) {
            this.unlockAchievement('master');
        }
    }

    unlockAchievement(achievementId) {
        if (!this.data.achievements.includes(achievementId)) {
            this.data.achievements.push(achievementId);
            
            const achievement = this.achievements[achievementId];
            if (achievement && window.nexus?.visualFeedback) {
                window.nexus.visualFeedback.showAchievement(
                    achievement.name,
                    achievement.desc,
                    achievement.icon
                );
                window.nexus.soundManager?.play('achievement');
            }
        }
    }

    getHighScore(gameId) {
        return this.data.highScores[gameId] || 0;
    }

    getStats() {
        return this.data.stats;
    }

    resetData() {
        if (confirm('確定要重置所有遊戲數據嗎？')) {
            localStorage.removeItem('nexus_progress');
            this.data = this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            totalPlayTime: 0,
            gamesPlayed: {},
            highScores: {},
            achievements: [],
            stats: {
                totalWins: 0,
                totalGames: 0,
                favoriteGame: null,
                currentStreak: 0,
                bestStreak: 0,
                lastPlayDate: null
            }
        };
    }
}

// 主要 NEXUS 系統
window.nexus = {
    soundManager: null,
    visualFeedback: null,
    interactionGuide: null,
    gameProgress: null,
    
    init() {
        this.soundManager = new SoundManager();
        this.visualFeedback = new VisualFeedback();
        this.interactionGuide = new InteractionGuide();
        this.gameProgress = new GameProgress();
        
        // 添加全局樣式
        this.loadGlobalStyles();
        
        // 初始化通用事件
        this.initGlobalEvents();
        
        console.log('NEXUS 遊戲系統已初始化');
    },
    
    loadGlobalStyles() {
        if (!document.querySelector('link[href*="nexus-ui.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/nexus-ui.css';
            document.head.appendChild(link);
        }
    },
    
    initGlobalEvents() {
        // 為所有按鈕添加點擊音效
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .nexus-btn, .btn')) {
                this.soundManager?.play('click');
            }
        });
        
        // 為所有可交互元素添加懸停音效
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('button, .nexus-btn, .btn, [role="button"]')) {
                this.soundManager?.play('hover');
            }
        }, true);
    },
    
    // 遊戲輔助方法
    startGame(gameId, interactionType = 'click') {
        this.interactionGuide.show(interactionType, gameId);
        this.gameProgress.recordGamePlay(gameId, 0, 0);
    },
    
    endGame(gameId, score = 0, duration = 0) {
        this.gameProgress.recordGamePlay(gameId, score, duration);
        
        if (score > 0) {
            this.soundManager?.play('success');
            this.visualFeedback?.showToast(`遊戲結束！分數：${score}`, 'success');
        } else {
            this.soundManager?.play('fail');
            this.visualFeedback?.showToast('遊戲結束！再試一次', 'warning');
        }
    },
    
    showSettings() {
        const settingsDiv = document.createElement('div');
        settingsDiv.className = 'interaction-guide';
        settingsDiv.innerHTML = `
            <h3>⚙️ 遊戲設置</h3>
            <div style="margin: 20px 0;">
                <label>
                    <input type="checkbox" ${this.soundManager.enabled ? 'checked' : ''} 
                           onchange="window.nexus.soundManager.toggle()">
                    音效開關
                </label><br><br>
                <label>
                    音量：<input type="range" min="0" max="1" step="0.1" 
                             value="${this.soundManager.volume}" 
                             onchange="window.nexus.soundManager.setVolume(this.value)">
                </label><br><br>
                <button class="nexus-btn" onclick="window.nexus.gameProgress.resetData()">重置數據</button>
            </div>
            <button class="nexus-btn" onclick="this.parentElement.remove()">關閉</button>
        `;
        document.body.appendChild(settingsDiv);
    }
};

// 自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.nexus.init());
} else {
    window.nexus.init();
}
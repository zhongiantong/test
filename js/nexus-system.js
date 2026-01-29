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
        this.tutorialsCompleted = JSON.parse(localStorage.getItem('nexus_tutorials') || '{}');
        this.templates = {
            'motion': {
                icon: '📷',
                title: '體感控制',
                description: '身體左右移動控制遊戲角色',
                tips: ['站定在鏡頭前', '左右移動身體', '避免障礙物'],
                steps: [
                    { text: '站在鏡頭前約1-2米距離', icon: '👤' },
                    { text: '緩慢左右移動身體', icon: '↔️' },
                    { text: '保持上半身在畫面中', icon: '📐' }
                ]
            },
            'drag': {
                icon: '👆',
                title: '拖曳操作',
                description: '拖曳移動，點擊互動',
                tips: ['按住拖曳', '釋放放下', '雙擊特殊功能'],
                steps: [
                    { text: '按住物件不放', icon: '🖱️' },
                    { text: '拖曳到目標位置', icon: '➡️' },
                    { text: '放開完成操作', icon: '🎯' }
                ]
            },
            'click': {
                icon: '🖱️',
                title: '點擊操作',
                description: '點擊操作，長按功能',
                tips: ['單擊選擇', '長按特殊', '快速連點'],
                steps: [
                    { text: '單擊選擇項目', icon: '👆' },
                    { text: '長按開啟選單', icon: '⏱️' },
                    { text: '雙擊快速動作', icon: '⚡' }
                ]
            },
            'keyboard': {
                icon: '⌨️',
                title: '鍵盤控制',
                description: '使用鍵盤控制遊戲',
                tips: ['方向鍵移動', '空格鍵跳躍', 'Enter確認'],
                steps: [
                    { text: '方向鍵控制移動', icon: '⬆️⬇️⬅️➡️' },
                    { text: '空格鍵執行動作', icon: '␣' },
                    { text: 'ESC鍵暫停遊戲', icon: '⏸️' }
                ]
            },
            'touch': {
                icon: '👆',
                title: '觸控操作',
                description: '觸控螢幕進行遊戲',
                tips: ['單指拖曳', '雙指縮放', '長按選單'],
                steps: [
                    { text: '單指拖曳移動', icon: '👉' },
                    { text: '雙指縮放視角', icon: '🤏' },
                    { text: '點擊互動物件', icon: '👈' }
                ]
            }
        };
    }

    show(type, gameName = '', forceShow = false) {
        // 檢查是否已經完成過此教學
        const tutorialKey = `${gameName}_${type}`;
        if (!forceShow && this.tutorialsCompleted[tutorialKey]) {
            return false; // 已經看過，不顯示
        }
        
        if (this.currentGuide) return false;
        
        const template = this.templates[type] || this.templates['click'];
        
        this.currentGuide = document.createElement('div');
        this.currentGuide.className = 'interaction-guide';
        this.currentGuide.innerHTML = `
            <h3>${template.icon} ${template.title}</h3>
            <div class="interaction-guide-icon">${template.icon}</div>
            <p>${template.description}</p>
            
            <div class="tutorial-steps" style="margin: 20px 0; text-align: left;">
                ${template.steps.map((step, i) => `
                    <div class="tutorial-step" style="display: flex; align-items: center; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="font-size: 24px; margin-right: 15px; width: 40px; text-align: center;">${step.icon}</div>
                        <div>
                            <div style="font-weight: bold;">步驟 ${i+1}</div>
                            <div style="font-size: 14px; opacity: 0.8;">${step.text}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: left; margin: 20px 0; padding: 15px; background: rgba(0,210,255,0.1); border-radius: 10px;">
                <div style="font-weight: bold; margin-bottom: 5px;">💡 小提示：</div>
                ${template.tips.map(tip => `<div style="margin: 5px 0;">• ${tip}</div>`).join('')}
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="nexus-btn" onclick="window.nexus.interactionGuide.completeTutorial('${tutorialKey}')" style="flex: 1;">開始遊戲</button>
                <button class="nexus-btn" onclick="window.nexus.interactionGuide.hide()" style="background: transparent; border: 1px solid rgba(255,255,255,0.3);">跳過</button>
            </div>
            
            <div style="margin-top: 15px; font-size: 12px; opacity: 0.6;">
                <label>
                    <input type="checkbox" id="dont-show-again"> 不要再顯示此教學
                </label>
            </div>
        `;
        
        document.body.appendChild(this.currentGuide);
        
        // 聲音效果
        if (window.nexus?.soundManager) {
            window.nexus.soundManager.play('gameStart');
        }
        
        return true;
    }

    completeTutorial(tutorialKey) {
        this.tutorialsCompleted[tutorialKey] = true;
        localStorage.setItem('nexus_tutorials', JSON.stringify(this.tutorialsCompleted));
        
        const dontShowAgain = document.getElementById('dont-show-again');
        if (dontShowAgain && dontShowAgain.checked) {
            // 標記所有同類型的教學為完成
            Object.keys(this.templates).forEach(type => {
                const key = tutorialKey.split('_')[0] + '_' + type;
                this.tutorialsCompleted[key] = true;
            });
            localStorage.setItem('nexus_tutorials', JSON.stringify(this.tutorialsCompleted));
        }
        
        this.hide();
        
        // 播放完成音效
        if (window.nexus?.soundManager) {
            window.nexus.soundManager.play('success');
        }
        
        // 顯示完成提示
        if (window.nexus?.visualFeedback) {
            window.nexus.visualFeedback.showToast('教學完成！開始遊戲吧！', 'success');
        }
    }

    hide() {
        if (this.currentGuide) {
            this.currentGuide.remove();
            this.currentGuide = null;
        }
    }
    
    resetTutorials() {
        this.tutorialsCompleted = {};
        localStorage.removeItem('nexus_tutorials');
    }
    
    showQuickTip(message, duration = 3000) {
        const tip = document.createElement('div');
        tip.className = 'quick-tip';
        tip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💡</span>
                <span>${message}</span>
            </div>
        `;
        
        tip.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid var(--primary);
            z-index: 9999;
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(tip);
        
        setTimeout(() => {
            tip.style.animation = 'slideDown 0.3s ease-in';
            setTimeout(() => tip.remove(), 300);
        }, duration);
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
            const target = e.target;
            // 安全檢查：確保 target 有 matches 方法
            if (target && target.matches && target.matches('button, .nexus-btn, .btn')) {
                this.soundManager?.play('click');
            }
        });
        
        // 為所有可交互元素添加懸停音效
        document.addEventListener('mouseenter', (e) => {
            const target = e.target;
            // 安全檢查：確保 target 有 matches 方法
            if (target && target.matches && target.matches('button, .nexus-btn, .btn, [role="button"]')) {
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
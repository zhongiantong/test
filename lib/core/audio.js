/**
 * NEXUS 音效管理系統
 * 提供跨遊戲統一的音效庫和音樂管理
 * 
 * @version 1.0.0
 * @author NEXUS Team
 */

class AudioManager {
    constructor(options = {}) {
        this.context = null;
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.enabled = true;
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.currentMusic = null;
        this.isInitialized = false;
        
        this.options = {
            autoInit: true,
            enableMusic: true,
            enableSFX: true,
            crossfade: true,
            ...options
        };
        
        // 音效配置庫
        this.soundPresets = {
            // 基礎交互音效
            click: { 
                frequency: 800, 
                duration: 0.1, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.1 }
            },
            hover: { 
                frequency: 600, 
                duration: 0.05, 
                type: 'triangle',
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.05, release: 0.02 }
            },
            
            // 遊戲狀態音效
            success: { 
                frequency: [400, 600, 800], 
                duration: 0.3, 
                type: 'triangle',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
            },
            fail: { 
                frequency: [300, 200, 150], 
                duration: 0.4, 
                type: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
            },
            achievement: { 
                frequency: [523, 659, 784, 1047], 
                duration: 0.8, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
            },
            
            // 遊戲特定音效
            powerup: { 
                frequency: [200, 400, 600, 800, 1000], 
                duration: 0.5, 
                type: 'square',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 }
            },
            explosion: { 
                frequency: [100, 50, 25], 
                duration: 0.6, 
                type: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.1 },
                noise: true
            },
            jump: { 
                frequency: [400, 600, 400], 
                duration: 0.2, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.05 }
            },
            collect: { 
                frequency: [800, 1000, 1200], 
                duration: 0.15, 
                type: 'triangle',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.05, release: 0.05 }
            },
            
            // AI Pet 特定音效
            pet_happy: { 
                frequency: [600, 800, 1000], 
                duration: 0.3, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.15, release: 0.05 }
            },
            pet_sad: { 
                frequency: [300, 250, 200], 
                duration: 0.4, 
                type: 'triangle',
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.15, release: 0.05 }
            },
            pet_eat: { 
                frequency: [400, 300, 200], 
                duration: 0.2, 
                type: 'square',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.05 }
            },
            pet_clean: { 
                frequency: [800, 1000, 1200, 1400], 
                duration: 0.4, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
            },
            
            // Space Dodger 特定音效
            ship_move: { 
                frequency: [200, 250], 
                duration: 0.1, 
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.05, release: 0.05 }
            },
            asteroid_hit: { 
                frequency: [150, 100, 50], 
                duration: 0.3, 
                type: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.05 },
                noise: true
            },
            
            // Stress Buster 特定音效
            punch: { 
                frequency: [100, 50], 
                duration: 0.2, 
                type: 'square',
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.05 }
            },
            break: { 
                frequency: [200, 100, 50, 25], 
                duration: 0.5, 
                type: 'sawtooth',
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 },
                noise: true
            }
        };
        
        // 背景音樂配置
        this.musicPresets = {
            main_menu: {
                tempo: 120,
                key: 'C',
                scale: [0, 2, 4, 5, 7, 9, 11], // Major scale
                pattern: [0, 2, 4, 7, 9, 7, 4, 2],
                duration: 4,
                instruments: ['piano', 'bass', 'drums']
            },
            game_play: {
                tempo: 140,
                key: 'A',
                scale: [0, 2, 3, 5, 7, 8, 10], // Minor scale
                pattern: [0, 3, 5, 7, 8, 7, 5, 3],
                duration: 2,
                instruments: ['synth', 'bass', 'drums']
            },
            victory: {
                tempo: 100,
                key: 'G',
                scale: [0, 2, 4, 5, 7, 9, 11], // Major scale
                pattern: [0, 4, 7, 11, 7, 4, 0],
                duration: 6,
                instruments: ['trumpet', 'strings', 'drums']
            }
        };
        
        if (this.options.autoInit) {
            this.init();
        }
    }
    
    /**
     * 初始化音頻上下文
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // 創建音頻上下文
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // 加載用戶偏好
            this.loadPreferences();
            
            // 創建主音量控制
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.volume;
            
            // 創建音樂音量控制
            this.musicGain = this.context.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;
            
            // 創建音效音量控制
            this.sfxGain = this.context.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.volume;
            
            this.isInitialized = true;
            
            // 綁定用戶交互事件以啟動音頻
            this.bindUserInteractionEvents();
            
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
            this.enabled = false;
        }
    }
    
    /**
     * 綁定用戶交互事件
     */
    bindUserInteractionEvents() {
        const resumeAudio = () => {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume();
            }
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('touchstart', resumeAudio);
        };
        
        document.addEventListener('click', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
    }
    
    /**
     * 播放音效
     * @param {string} type - 音效類型
     * @param {Object} options - 播放選項
     */
    play(type, options = {}) {
        if (!this.enabled || !this.isInitialized || !this.options.enableSFX) return;
        
        const preset = this.soundPresets[type];
        if (!preset) {
            console.warn(`Sound preset not found: ${type}`);
            return;
        }
        
        const config = { ...preset, ...options };
        this.createSound(config);
    }
    
    /**
     * 創建音效
     * @param {Object} config - 音效配置
     */
    createSound(config) {
        const now = this.context.currentTime;
        
        if (config.noise) {
            this.createNoiseSound(config, now);
        } else {
            this.createToneSound(config, now);
        }
    }
    
    /**
     * 創建音調音效
     */
    createToneSound(config, startTime) {
        const frequencies = Array.isArray(config.frequency) ? config.frequency : [config.frequency];
        
        frequencies.forEach((freq, index) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = config.type || 'sine';
            osc.frequency.setValueAtTime(freq, startTime + (index * 0.1));
            
            // 應用ADSR包絡
            const env = config.envelope || { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 };
            const duration = config.duration || 0.1;
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(1, startTime + env.attack);
            gain.gain.linearRampToValueAtTime(env.sustain, startTime + env.attack + env.decay);
            gain.gain.setValueAtTime(env.sustain, startTime + env.attack + env.decay + duration * 0.5);
            gain.gain.linearRampToValueAtTime(0, startTime + env.attack + env.decay + duration);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(startTime);
            osc.stop(startTime + env.attack + env.decay + duration);
        });
    }
    
    /**
     * 創建噪音音效
     */
    createNoiseSound(config, startTime) {
        const bufferSize = this.context.sampleRate * (config.duration || 0.3);
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成白噪音
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        
        source.buffer = buffer;
        
        // 應用濾波器
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, startTime);
        filter.Q.setValueAtTime(10, startTime);
        
        // 應用包絡
        const env = config.envelope || { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.1 };
        const duration = config.duration || 0.3;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(1, startTime + env.attack);
        gain.gain.linearRampToValueAtTime(env.sustain, startTime + env.attack + env.decay);
        gain.gain.linearRampToValueAtTime(0, startTime + env.attack + env.decay + duration);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(startTime);
        source.stop(startTime + env.attack + env.decay + duration);
    }
    
    /**
     * 播放背景音樂
     * @param {string} type - 音樂類型
     * @param {Object} options - 播放選項
     */
    playMusic(type, options = {}) {
        if (!this.enabled || !this.isInitialized || !this.options.enableMusic) return;
        
        const preset = this.musicPresets[type];
        if (!preset) {
            console.warn(`Music preset not found: ${type}`);
            return;
        }
        
        // 停止當前音樂
        this.stopMusic();
        
        const config = { ...preset, ...options };
        this.currentMusic = this.createMusicTrack(config);
    }
    
    /**
     * 創建音樂軌道
     */
    createMusicTrack(config) {
        const now = this.context.currentTime;
        const tempo = config.tempo || 120;
        const beatDuration = 60 / tempo;
        
        // 創建音樂序列
        const track = {
            oscillators: [],
            gains: [],
            interval: null,
            isPlaying: true
        };
        
        // 根據音樂類型創建不同的樂器
        config.instruments.forEach((instrument, index) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            // 設置樂器音色
            this.setInstrumentTimbre(osc, instrument);
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            // 設置音量
            gain.gain.value = 0.1;
            
            osc.start(now);
            
            track.oscillators.push(osc);
            track.gains.push(gain);
        });
        
        // 創建音樂循環
        let currentBeat = 0;
        track.interval = setInterval(() => {
            if (!track.isPlaying) return;
            
            const noteIndex = currentBeat % config.pattern.length;
            const note = config.pattern[noteIndex];
            const frequency = this.getNoteFrequency(config.key, config.scale, note);
            
            // 播放和弦
            track.oscillators.forEach((osc, index) => {
                const gain = track.gains[index];
                const freq = frequency * (index === 0 ? 1 : index === 1 ? 0.5 : 2); // 根音、五度、八度
                
                osc.frequency.setValueAtTime(freq, this.context.currentTime);
                gain.gain.setValueAtTime(0.1, this.context.currentTime);
                gain.gain.linearRampToValueAtTime(0, this.context.currentTime + beatDuration * 0.8);
            });
            
            currentBeat++;
        }, beatDuration * 1000);
        
        return track;
    }
    
    /**
     * 設置樂器音色
     */
    setInstrumentTimbre(oscillator, instrument) {
        switch (instrument) {
            case 'piano':
                oscillator.type = 'triangle';
                break;
            case 'bass':
                oscillator.type = 'sawtooth';
                break;
            case 'drums':
                oscillator.type = 'square';
                break;
            case 'synth':
                oscillator.type = 'sawtooth';
                break;
            case 'trumpet':
                oscillator.type = 'square';
                break;
            case 'strings':
                oscillator.type = 'sine';
                break;
            default:
                oscillator.type = 'sine';
        }
    }
    
    /**
     * 獲取音符頻率
     */
    getNoteFrequency(key, scale, noteIndex) {
        const keyFrequencies = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00,
            'A': 440.00,
            'B': 493.88
        };
        
        const baseFreq = keyFrequencies[key] || 440.00;
        const semitone = scale[noteIndex % scale.length];
        const octave = Math.floor(noteIndex / scale.length);
        
        return baseFreq * Math.pow(2, (semitone + octave * 12) / 12);
    }
    
    /**
     * 停止背景音樂
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.isPlaying = false;
            
            if (this.currentMusic.interval) {
                clearInterval(this.currentMusic.interval);
            }
            
            // 淡出效果
            this.currentMusic.gains.forEach(gain => {
                gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
            });
            
            this.currentMusic = null;
        }
    }
    
    /**
     * 設置音量
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        
        this.savePreferences();
    }
    
    /**
     * 設置音樂音量
     * @param {number} volume - 音樂音量 (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        
        this.savePreferences();
    }
    
    /**
     * 設置音效音量
     * @param {number} volume - 音效音量 (0-1)
     */
    setSFXVolume(volume) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
        
        this.savePreferences();
    }
    
    /**
     * 切換音效開關
     */
    toggleSound() {
        this.enabled = !this.enabled;
        this.savePreferences();
        return this.enabled;
    }
    
    /**
     * 切換音樂開關
     */
    toggleMusic() {
        this.options.enableMusic = !this.options.enableMusic;
        
        if (!this.options.enableMusic) {
            this.stopMusic();
        }
        
        this.savePreferences();
        return this.options.enableMusic;
    }
    
    /**
     * 加載用戶偏好
     */
    loadPreferences() {
        try {
            const prefs = localStorage.getItem('nexus_audio_preferences');
            if (prefs) {
                const { enabled, volume, musicVolume, enableMusic, enableSFX } = JSON.parse(prefs);
                this.enabled = enabled !== undefined ? enabled : this.enabled;
                this.volume = volume !== undefined ? volume : this.volume;
                this.musicVolume = musicVolume !== undefined ? musicVolume : this.musicVolume;
                this.options.enableMusic = enableMusic !== undefined ? enableMusic : this.options.enableMusic;
                this.options.enableSFX = enableSFX !== undefined ? enableSFX : this.options.enableSFX;
            }
        } catch (error) {
            console.warn('Failed to load audio preferences:', error);
        }
    }
    
    /**
     * 保存用戶偏好
     */
    savePreferences() {
        try {
            const prefs = {
                enabled: this.enabled,
                volume: this.volume,
                musicVolume: this.musicVolume,
                enableMusic: this.options.enableMusic,
                enableSFX: this.options.enableSFX
            };
            localStorage.setItem('nexus_audio_preferences', JSON.stringify(prefs));
        } catch (error) {
            console.warn('Failed to save audio preferences:', error);
        }
    }
    
    /**
     * 創建音效控制面板
     */
    createControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'nexus-audio-controls';
        panel.innerHTML = `
            <div class="audio-control-item">
                <label>🔊 音效</label>
                <button class="audio-toggle ${this.enabled ? 'active' : ''}" id="sfx-toggle">
                    ${this.enabled ? 'ON' : 'OFF'}
                </button>
            </div>
            <div class="audio-control-item">
                <label>🎵 音樂</label>
                <button class="audio-toggle ${this.options.enableMusic ? 'active' : ''}" id="music-toggle">
                    ${this.options.enableMusic ? 'ON' : 'OFF'}
                </button>
            </div>
            <div class="audio-control-item">
                <label>🎚️ 音量</label>
                <input type="range" class="volume-slider" id="volume-slider" 
                       min="0" max="100" value="${this.volume * 100}">
            </div>
        `;
        
        // 添加事件監聽器
        panel.querySelector('#sfx-toggle').addEventListener('click', () => {
            this.toggleSound();
            panel.querySelector('#sfx-toggle').textContent = this.enabled ? 'ON' : 'OFF';
            panel.querySelector('#sfx-toggle').classList.toggle('active', this.enabled);
        });
        
        panel.querySelector('#music-toggle').addEventListener('click', () => {
            this.toggleMusic();
            panel.querySelector('#music-toggle').textContent = this.options.enableMusic ? 'ON' : 'OFF';
            panel.querySelector('#music-toggle').classList.toggle('active', this.options.enableMusic);
        });
        
        panel.querySelector('#volume-slider').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
        
        return panel;
    }
}

// 創建全局實例
window.NexusAudio = new AudioManager();

// 添加必要的CSS樣式
const nexusAudioStyles = `
.nexus-audio-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 15px;
    z-index: 1000;
    min-width: 200px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.audio-control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    color: white;
    font-size: 14px;
}

.audio-control-item:last-child {
    margin-bottom: 0;
}

.audio-toggle {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.audio-toggle.active {
    background: var(--primary, #00d2ff);
    border-color: var(--primary, #00d2ff);
    color: black;
}

.volume-slider {
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
    cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: var(--primary, #00d2ff);
    border-radius: 50%;
    cursor: pointer;
}

.volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: var(--primary, #00d2ff);
    border-radius: 50%;
    cursor: pointer;
    border: none;
}
`;

// 注入樣式
const audioStyleSheet = document.createElement('style');
audioStyleSheet.textContent = nexusAudioStyles;
document.head.appendChild(audioStyleSheet);

// 導出類（供模組化使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
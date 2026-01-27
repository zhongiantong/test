/**
 * NEXUS 統一交互管理系統
 * 提供跨遊戲一致的觸控/鼠標事件處理
 * 
 * @version 1.0.0
 * @author NEXUS Team
 */

class InteractionManager {
    constructor(options = {}) {
        this.bindings = new Map();
        this.gestures = new Map();
        this.options = {
            enableGestures: true,
            enableRipple: true,
            preventDefault: true,
            ...options
        };
        
        // 全局事件處理器
        this.globalHandlers = {
            start: [],
            move: [],
            end: [],
            click: []
        };
        
        this.init();
    }
    
    /**
     * 初始化交互管理器
     */
    init() {
        // 綁定全局事件監聽
        this.bindGlobalEvents();
        
        // 創建交互提示系統
        this.createInteractionHints();
    }
    
    /**
     * 綁定全局事件監聽
     */
    bindGlobalEvents() {
        const events = [
            'mousedown', 'touchstart',
            'mousemove', 'touchmove', 
            'mouseup', 'touchend',
            'click'
        ];
        
        events.forEach(event => {
            document.addEventListener(event, this.handleGlobalEvent.bind(this), {
                passive: !this.options.preventDefault
            });
        });
    }
    
    /**
     * 全局事件處理器
     */
    handleGlobalEvent(e) {
        const eventType = this.getEventType(e);
        const position = this.getEventPosition(e);
        
        // 處理全局事件處理器
        this.globalHandlers[eventType].forEach(handler => {
            handler(position, e);
        });
        
        // 處理綁定的元素事件
        this.bindings.forEach((binding, element) => {
            if (this.isEventTarget(element, e)) {
                binding.handlers[eventType]?.(position, e);
            }
        });
    }
    
    /**
     * 綁定交互元素
     * @param {HTMLElement} element - 要綁定的元素
     * @param {Object} handlers - 事件處理器
     * @param {Object} options - 綁定選項
     */
    bindInteractive(element, handlers = {}, options = {}) {
        const binding = {
            handlers: this.normalizeHandlers(handlers),
            options: {
                enableRipple: this.options.enableRipple,
                enableHover: true,
                ...options
            }
        };
        
        this.bindings.set(element, binding);
        
        // 添加交互樣式
        this.addInteractiveStyles(element, binding.options);
        
        // 啟用漣漪效果
        if (binding.options.enableRipple) {
            this.enableRippleEffect(element);
        }
        
        return {
            unbind: () => this.unbindInteractive(element),
            update: (newHandlers) => this.updateBinding(element, newHandlers)
        };
    }
    
    /**
     * 解綁交互元素
     */
    unbindInteractive(element) {
        this.bindings.delete(element);
        this.removeInteractiveStyles(element);
    }
    
    /**
     * 更新綁定處理器
     */
    updateBinding(element, newHandlers) {
        const binding = this.bindings.get(element);
        if (binding) {
            binding.handlers = this.normalizeHandlers(newHandlers);
        }
    }
    
    /**
     * 標準化事件處理器
     */
    normalizeHandlers(handlers) {
        const normalized = {};
        
        // 支持簡寫格式
        if (typeof handlers === 'function') {
            normalized.click = handlers;
        } else {
            // 標準化事件名稱
            Object.keys(handlers).forEach(key => {
                const eventType = this.normalizeEventType(key);
                normalized[eventType] = handlers[key];
            });
        }
        
        return normalized;
    }
    
    /**
     * 標準化事件類型
     */
    normalizeEventType(type) {
        const mapping = {
            'mousedown': 'start',
            'touchstart': 'start',
            'mousemove': 'move',
            'touchmove': 'move',
            'mouseup': 'end',
            'touchend': 'end',
            'click': 'click'
        };
        
        return mapping[type] || type;
    }
    
    /**
     * 獲取事件位置
     */
    getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                identifier: e.touches[0].identifier
            };
        }
        
        return {
            x: e.clientX,
            y: e.clientY,
            identifier: 'mouse'
        };
    }
    
    /**
     * 獲取事件類型
     */
    getEventType(e) {
        if (e.type.includes('start')) return 'start';
        if (e.type.includes('move')) return 'move';
        if (e.type.includes('end')) return 'end';
        if (e.type === 'click') return 'click';
        return e.type;
    }
    
    /**
     * 檢查事件目標
     */
    isEventTarget(element, e) {
        const target = e.target;
        return target === element || element.contains(target);
    }
    
    /**
     * 添加交互樣式
     */
    addInteractiveStyles(element, options) {
        element.classList.add('nexus-interactive');
        
        if (options.enableHover) {
            element.classList.add('nexus-hover');
        }
        
        // 添加CSS變數
        element.style.setProperty('--nexus-ripple-color', 'rgba(255,255,255,0.5)');
        element.style.setProperty('--nexus-hover-scale', '1.05');
        element.style.setProperty('--nexus-active-scale', '0.95');
    }
    
    /**
     * 移除交互樣式
     */
    removeInteractiveStyles(element) {
        element.classList.remove('nexus-interactive', 'nexus-hover');
    }
    
    /**
     * 啟用漣漪效果
     */
    enableRippleEffect(element) {
        const createRipple = (e) => {
            if (e.type === 'start') {
                const rect = element.getBoundingClientRect();
                const position = this.getEventPosition(e);
                
                const ripple = document.createElement('div');
                ripple.className = 'nexus-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: var(--nexus-ripple-color);
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    animation: nexusRipple 0.6s ease-out;
                    left: ${position.x - rect.left}px;
                    top: ${position.y - rect.top}px;
                `;
                
                element.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        };
        
        this.bindings.get(element).handlers.ripple = createRipple;
    }
    
    /**
     * 手勢識別系統
     */
    recognizeGesture(element, gestureType, callback) {
        if (!this.options.enableGestures) return;
        
        const gestureData = {
            type: gestureType,
            startTime: 0,
            startPosition: null,
            currentPosition: null,
            threshold: 50,
            callback: callback
        };
        
        this.gestures.set(element, gestureData);
        
        // 綁定手勢處理器
        this.bindInteractive(element, {
            start: (pos, e) => {
                gestureData.startTime = Date.now();
                gestureData.startPosition = pos;
                gestureData.currentPosition = pos;
            },
            move: (pos, e) => {
                gestureData.currentPosition = pos;
                this.processGesture(element, gestureData);
            },
            end: (pos, e) => {
                this.processGesture(element, gestureData);
                gestureData.startTime = 0;
                gestureData.startPosition = null;
            }
        });
    }
    
    /**
     * 處理手勢
     */
    processGesture(element, gestureData) {
        if (!gestureData.startPosition) return;
        
        const deltaX = gestureData.currentPosition.x - gestureData.startPosition.x;
        const deltaY = gestureData.currentPosition.y - gestureData.startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - gestureData.startTime;
        
        let gesture = null;
        
        // 識別手勢類型
        if (gestureData.type === 'swipe' && distance > gestureData.threshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                gesture = deltaX > 0 ? 'swipe-right' : 'swipe-left';
            } else {
                gesture = deltaY > 0 ? 'swipe-down' : 'swipe-up';
            }
        } else if (gestureData.type === 'tap' && duration < 200 && distance < 10) {
            gesture = 'tap';
        } else if (gestureData.type === 'long-press' && duration > 500) {
            gesture = 'long-press';
        }
        
        if (gesture && gestureData.callback) {
            gestureData.callback(gesture, {
                deltaX, deltaY, distance, duration,
                startPosition: gestureData.startPosition,
                currentPosition: gestureData.currentPosition
            });
        }
    }
    
    /**
     * 創建交互提示系統
     */
    createInteractionHints() {
        // 創建提示容器
        const hintContainer = document.createElement('div');
        hintContainer.id = 'nexus-interaction-hints';
        hintContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            pointer-events: none;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(hintContainer);
    }
    
    /**
     * 顯示交互提示
     */
    showHint(message, duration = 3000) {
        const hintContainer = document.getElementById('nexus-interaction-hints');
        if (!hintContainer) return;
        
        const hint = document.createElement('div');
        hint.className = 'nexus-hint';
        hint.textContent = message;
        hint.style.cssText = `
            background: rgba(0, 210, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3);
            animation: nexusHintSlide 0.3s ease-out;
        `;
        
        hintContainer.appendChild(hint);
        hintContainer.style.opacity = '1';
        
        setTimeout(() => {
            hint.style.animation = 'nexusHintSlide 0.3s ease-out reverse';
            setTimeout(() => {
                hint.remove();
                if (hintContainer.children.length === 0) {
                    hintContainer.style.opacity = '0';
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 添加全局事件處理器
     */
    addGlobalHandler(eventType, handler) {
        if (!this.globalHandlers[eventType]) {
            this.globalHandlers[eventType] = [];
        }
        this.globalHandlers[eventType].push(handler);
    }
    
    /**
     * 移除全局事件處理器
     */
    removeGlobalHandler(eventType, handler) {
        if (this.globalHandlers[eventType]) {
            const index = this.globalHandlers[eventType].indexOf(handler);
            if (index > -1) {
                this.globalHandlers[eventType].splice(index, 1);
            }
        }
    }
}

// 創建全局實例
window.NexusInteraction = new InteractionManager();

// 添加必要的CSS樣式
const nexusInteractionStyles = `
.nexus-interactive {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.nexus-interactive.nexus-hover:hover {
    transform: var(--nexus-hover-scale, scale(1.05));
}

.nexus-interactive:active {
    transform: var(--nexus-active-scale, scale(0.95));
}

@keyframes nexusRipple {
    from {
        width: 0;
        height: 0;
        opacity: 1;
    }
    to {
        width: 100px;
        height: 100px;
        opacity: 0;
    }
}

.nexus-ripple {
    animation: nexusRipple 0.6s ease-out;
}

@keyframes nexusHintSlide {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.nexus-hint {
    animation: nexusHintSlide 0.3s ease-out;
}
`;

// 注入樣式
const styleSheet = document.createElement('style');
styleSheet.textContent = nexusInteractionStyles;
document.head.appendChild(styleSheet);

// 導出類（供模組化使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionManager;
}
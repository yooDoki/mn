// 游戏核心系统
const game = {
    state: {
        patience: 100,
        money: 2000,
        acting: 20,
        stomach: 50,
        currentScene: 0,
        choices: [],
        flags: {}, // 记录特殊事件标记
        inventory: [],
        startTime: Date.now(),
        defeatedCount: 0,
        secretsLearned: [] // 厨房偷听到的秘密
    },

    scenes: [
        {
            id: 'entrance',
            name: '玄关·三姑拦截',
            icon: '🚪',
            npc: '👵',
            npcName: '三姑',
            bg: '#2d3436',
            type: 'barrage',
            dialogue: "哎呀！小明回来啦！让三姑好好看看...（弹幕攻击即将开始）",
            init: function() {
                setTimeout(() => this.startBarrageGame(), 2000);
            },
            barrageQuestions: [
                { text: "有对象了吗？", damage: 20, type: 'red' },
                { text: "月薪多少啊？", damage: 15, type: 'purple' },
                { text: "买房了吗？", damage: 25, type: 'red' },
                { text: "怎么还不生孩子？", damage: 30, type: 'black' },
                { text: "你看你表弟都二胎了", damage: 20, type: 'red' },
                { text: "减减肥吧", damage: 10, type: 'normal' },
                { text: "太瘦了多吃点", damage: 10, type: 'normal' },
                { text: "什么时候结婚？", damage: 22, type: 'red' },
                { text: "工作稳定吗？", damage: 12, type: 'purple' },
                { text: "怎么还不生二胎？", damage: 35, type: 'black' },
                { text: "你看隔壁小明都当经理了", damage: 18, type: 'red' },
                { text: "头发怎么少了？", damage: 15, type: 'purple' },
                { text: "别老玩手机", damage: 8, type: 'normal' },
                { text: "考公务员了吗？", damage: 20, type: 'red' },
                { text: "什么时候要三胎？", damage: 40, type: 'black' }
            ]
        },
        {
            id: 'dinner',
            name: '客厅·年夜饭桌',
            icon: '🍚',
            npc: '👴',
            npcName: '大伯',
            bg: '#e17055',
            type: 'choice',
            dialogue: "来来来，我说两句啊！今天咱们全家聚齐不容易，小明，你也说两句？",
            choices: [
                { 
                    text: "（举杯）祝各位长辈身体健康...", 
                    effect: { patience: -12, acting: +12 },
                    next: 'dinner_2',
                    tag: "安全牌"
                },
                { 
                    text: "（低头猛吃）唔唔唔（嘴里塞满）", 
                    effect: { stomach: +20, patience: +8 },
                    next: 'dinner_greedy',
                    tag: "干饭人"
                },
                { 
                    text: "（假装接电话）不好意思我接个电话", 
                    effect: { acting: +8 },
                    next: 'dinner_escape',
                    tag: "逃跑",
                    condition: () => game.state.acting > 15
                }
            ]
        },
        {
            id: 'kitchen',
            name: '厨房·帮厨密谈',
            icon: '🍳',
            npc: '👩',
            npcName: '妈妈',
            bg: '#fab1a0',
            type: 'stealth',
            dialogue: "来帮妈择菜！顺便听听外面在聊什么...（点击'偷听'收集情报，但别被奶奶发现）",
            init: function() {
                this.startStealthGame();
            }
        },
        {
            id: 'balcony',
            name: '阳台·fake电话区',
            icon: '📱',
            npc: '📵',
            npcName: '避难所',
            bg: '#74b9ff',
            type: 'cooldown',
            dialogue: "安全区！但要注意：手机电量15%，且5分钟后亲戚会来找你。",
            choices: [
                { 
                    text: "给真朋友发微信吐槽", 
                    effect: { patience: +22, acting: +8 },
                    next: 'balcony_chat',
                    tag: "回血"
                },
                { 
                    text: "假装打电话", 
                    effect: { acting: +18, patience: +8 },
                    next: 'balcony_act',
                    tag: "演技修炼"
                },
                { 
                    text: "刷短视频", 
                    effect: { patience: +8, stomach: -6 },
                    next: 'balcony_laugh',
                    tag: "摸鱼"
                }
            ]
        },
        {
            id: 'bathroom',
            name: '卫生间·最后防线',
            icon: '🚽',
            npc: '🚽',
            npcName: '马桶',
            bg: '#636e72',
            type: 'defense',
            dialogue: "这里暂时安全...但表弟正在门外！守住这最后的堡垒！",
            init: function() {
                this.startDefenseGame();
            }
        },
        {
            id: 'bedroom',
            name: '卧室·被窝堡垒',
            icon: '🛏️',
            npc: '🛌',
            npcName: '被窝',
            bg: '#2d3436',
            type: 'choice',
            dialogue: "终于到卧室了！被窝在召唤你...这里是你最后的避风港。",
            choices: [
                { 
                    text: "立刻钻进被窝", 
                    effect: { patience: +30 },
                    next: 'bedroom_hide',
                    tag: "摆烂",
                    desc: "获得大量耐心恢复"
                },
                { 
                    text: "假装睡觉", 
                    effect: { acting: +10, patience: +15 },
                    next: 'bedroom_act',
                    tag: "演技",
                    desc: "提升演技和耐心"
                },
                { 
                    text: "锁门并堆椅子", 
                    effect: { patience: +20 },
                    item: '房间主权',
                    tag: "防御",
                    desc: "获得道具：房间主权"
                },
                { 
                    text: "查看床底旧物", 
                    effect: { patience: -8, acting: +2 },
                    item: 'FC游戏机',
                    tag: "怀旧⭐",
                    desc: "70%概率获得FC游戏机（彩蛋道具）",
                    condition: () => Math.random() > 0.3
                }
            ]
        },
        {
            id: 'livingroom',
            name: '客厅·红包雨',
            icon: '💬',
            npc: '📱',
            npcName: '家族群',
            bg: '#e84393',
            type: 'redpacket',
            dialogue: "家族群红包雨来袭！手速决定命运！",
            init: function() {
                this.startRedPacketRain();
            }
        },
        {
            id: 'outside',
            name: '小区·遭遇战',
            icon: '🏘️',
            npc: '👩‍🦱',
            npcName: '王阿姨',
            bg: '#00b894',
            type: 'battle',
            dialogue: "哎呀这不是小明吗？来，阿姨给你介绍个对象...",
            init: function() {
                this.startCardBattle();
            }
        }
    ],

    // 弹幕游戏
    startBarrageGame: function() {
        const scene = this.scenes[this.state.currentScene];
        const container = document.getElementById('minigame-area');
        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="minigame-container">
                <div style="margin-bottom:10px; color:#e94560; font-weight:bold;">⚠️ 三姑的弹幕攻击</div>
                <div style="font-size:12px; color:#aaa; margin-bottom:5px;">
                    <span style="color:#ff6b6b;">■</span>致命 <span style="color:#a29bfe;">■</span>困难 <span style="color:#2d3436;">■</span>终极
                </div>
                <div style="font-size:12px; color:#666; margin-bottom:5px;">
                    鼠标/触摸上下移动躲避弹幕！
                </div>
                <div class="barrage-container" id="barrage-area" style="position:relative; height:200px; background:#1a1a2e; border:2px solid #533483; overflow:hidden; cursor:none;">
                    <!-- 玩家 -->
                    <div class="player-avatar" id="player" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:40px; transition:top 0.05s ease-out; pointer-events:none; z-index:10;">😓</div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <div>❤️ 耐心: <span id="barrage-hp">100</span></div>
                    <div>🔥 连击: <span id="combo-count">0</span></div>
                    <div>💎 技能: <span id="skill-ready" style="color:#00b894;">✓ 就绪</span></div>
                </div>
                <button id="skill-btn" onclick="game.useBarrageSkill()" style="margin-top:10px; padding:8px 20px; background:#533483; border:2px solid #a29bfe; color:white; border-radius:5px; cursor:pointer; font-size:14px;">
                    🛡️ 糊弄学护盾 (按空格)
                </button>
                <div style="font-size:12px; color:#666; margin-top:5px;">连续躲避弹幕可获得连击加分！</div>
            </div>
        `;
        
        let hp = 100;
        let barrageCount = 0;
        const maxBarrage = 10; // 减少弹幕数量，降低难度
        let combo = 0;
        let skillReady = true;
        let barrageSpeed = 4500; // 初始速度4.5秒（更慢，更好反应）
        let spawnInterval = 1800; // 初始生成间隔1.8秒（更宽松）
        let lastBarrageText = ''; // 上一个弹幕文本，用于避免重复
        const intervals = [];
        const timeouts = [];
        
        // 玩家Y位置（百分比）
        let playerY = 50;
        const player = document.getElementById('player');
        const gameArea = document.getElementById('barrage-area');
        
        // 更新玩家位置 - 使用requestAnimationFrame优化性能
        let targetY = 50;
        let isUpdating = false;
        const updatePlayerPosition = (y) => {
            targetY = Math.max(8, Math.min(92, y));
            if (!isUpdating) {
                isUpdating = true;
                requestAnimationFrame(() => {
                    playerY = targetY;
                    player.style.top = playerY + '%';
                    isUpdating = false;
                });
            }
        };
        
        // 鼠标移动 - 使用requestAnimationFrame优化
        let mouseTimeout;
        const mouseMoveHandler = (e) => {
            clearTimeout(mouseTimeout);
            const rect = gameArea.getBoundingClientRect();
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            updatePlayerPosition(y);
        };
        gameArea.addEventListener('mousemove', mouseMoveHandler);
        
        // 触摸移动 - 优化跟手度
        let lastTouchY = null;
        const touchMoveHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = gameArea.getBoundingClientRect();
            const y = ((touch.clientY - rect.top) / rect.height) * 100;
            updatePlayerPosition(y);
        };
        gameArea.addEventListener('touchmove', touchMoveHandler, { passive: false });
        
        const touchStartHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = gameArea.getBoundingClientRect();
            const y = ((touch.clientY - rect.top) / rect.height) * 100;
            updatePlayerPosition(y);
        };
        gameArea.addEventListener('touchstart', touchStartHandler, { passive: false });
        
        // 键盘仅保留空格键使用技能
        const keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.useBarrageSkill();
            }
        };
        document.addEventListener('keydown', keyHandler);
        
        // 保存清理函数
        this.barrageCleanup = () => {
            gameArea.removeEventListener('mousemove', mouseMoveHandler);
            gameArea.removeEventListener('touchmove', touchMoveHandler);
            gameArea.removeEventListener('touchstart', touchStartHandler);
            document.removeEventListener('keydown', keyHandler);
        };
        
        // 生成弹幕
        const createBarrage = () => {
            if (barrageCount >= maxBarrage) {
                if (hp > 0) {
                    this.state.defeatedCount++;
                    this.showNotification("弹幕防御成功！击败三姑！获得【初级糊弄学】技能");
                    this.state.flags.barrageCleared = true;
                    setTimeout(() => {
                        document.getElementById('minigame-area').classList.add('hidden');
                        this.nextScene();
                    }, 1500);
                }
                return;
            }
            
            // 根据血量调整难度（加快节奏）
            if (hp < 60 && barrageSpeed > 3000) {
                barrageSpeed = 3000;
                spawnInterval = 1200;
            }
            if (hp < 30 && barrageSpeed > 2500) {
                barrageSpeed = 2500;
                spawnInterval = 1000;
            }
            
            // 随机选择弹幕，避免连续重复
            let q;
            do {
                q = scene.barrageQuestions[Math.floor(Math.random() * scene.barrageQuestions.length)];
            } while (barrageCount > 0 && q.text === lastBarrageText);
            lastBarrageText = q.text;
            
            // 随机高度（10%-90%之间）
            const barrageY = 10 + Math.random() * 80;
            
            // 随机从左边或右边出现
            const fromLeft = Math.random() > 0.5;
            
            // 添加预警线效果（提前500ms显示轨迹）
            const warningLine = document.createElement('div');
            warningLine.style.cssText = `
                position: absolute;
                left: 0;
                right: 0;
                top: calc(${barrageY}% - 1px);
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            gameArea.appendChild(warningLine);
            
            // 显示预警线
            const warningTimeout1 = setTimeout(() => {
                warningLine.style.opacity = '1';
            }, 50);
            timeouts.push(warningTimeout1);
            
            // 500ms后生成实际弹幕并移除预警线
            const warningTimeout2 = setTimeout(() => {
                warningLine.style.opacity = '0';
                const warningTimeout3 = setTimeout(() => warningLine.remove(), 200);
                timeouts.push(warningTimeout3);
                
                const el = document.createElement('div');
                el.className = 'barrage-item';
                el.textContent = q.text;
                el.style.top = 'calc(' + barrageY + '% - 10px)';
                el.style.animationDuration = barrageSpeed + 'ms';
                el.dataset.barrageY = barrageY;
                
                if (fromLeft) {
                    el.style.animationName = 'moveRight';
                } else {
                    el.style.animationName = 'moveLeft';
                }
                
                // 根据类型设置颜色和样式
                switch(q.type) {
                    case 'red':
                        el.style.background = 'rgba(255, 107, 107, 0.95)';
                        el.style.fontSize = '15px';
                        el.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
                        break;
                    case 'purple':
                        el.style.background = 'rgba(162, 155, 254, 0.95)';
                        el.style.boxShadow = '0 0 8px rgba(162, 155, 254, 0.4)';
                        break;
                    case 'black':
                        el.style.background = 'rgba(45, 52, 54, 0.98)';
                        el.style.color = '#ff6b6b';
                        el.style.fontWeight = 'bold';
                        el.style.fontSize = '17px';
                        el.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.6)';
                        break;
                    default:
                        el.style.background = 'rgba(233, 69, 96, 0.9)';
                }
                
                el.dataset.clearable = 'true';
                gameArea.appendChild(el);
                
                let hit = false;
                
                // 碰撞检测 - 每个弹幕独立的检测
                const checkCollision = setInterval(() => {
                    if (hit) return; // 已经命中则跳过
                    
                    const rect = el.getBoundingClientRect();
                    const elY = parseFloat(el.dataset.barrageY);
                    
                    // 获取玩家当前位置
                    const playerEl = document.getElementById('player');
                    if (!playerEl) {
                        clearInterval(checkCollision);
                        return;
                    }
                    const playerRect = playerEl.getBoundingClientRect();
                    const gameRect = gameArea.getBoundingClientRect();
                    
                    // 将玩家位置转换为百分比
                    const playerCenterY = ((playerRect.top + playerRect.height/2 - gameRect.top) / gameRect.height) * 100;
                    
                    // 碰撞判定：垂直方向
                    const verticalDistance = Math.abs(playerCenterY - elY);
                    const verticalHit = verticalDistance < 10; // 10%的容错
                    
                    // 碰撞判定：水平方向（弹幕中心经过玩家区域）
                    const elCenterX = rect.left + rect.width / 2;
                    const playerCenterX = gameRect.left + gameRect.width / 2;
                    const horizontalDistance = Math.abs(elCenterX - playerCenterX);
                    const horizontalHit = horizontalDistance < 40; // 40px的容错
                    
                    // 调试日志（调试用，确认后可以删除）
                    // console.log('Check collision:', {verticalDistance, horizontalDistance, verticalHit, horizontalHit});
                    
                    if (verticalHit && horizontalHit) {
                        hit = true;
                        hp -= q.damage;
                        combo = 0;
                        const barrageHpEl = document.getElementById('barrage-hp');
                        const comboCountEl = document.getElementById('combo-count');
                        if (barrageHpEl) barrageHpEl.textContent = hp;
                        if (comboCountEl) comboCountEl.textContent = combo;
                        this.updateStat('patience', -q.damage);
                        el.remove();
                        clearInterval(checkCollision);
                        
                        if (hp <= 0) {
                            this.triggerEnding('patience_zero');
                        }
                    }
                    
                    // 清理已离开屏幕的弹幕
                    if (rect.right < 0 || rect.left > gameRect.right) {
                        el.remove();
                        clearInterval(checkCollision);
                    }
                }, 30); // 稍微提高检测频率
                intervals.push(checkCollision);
            }, 500); // 预警线延迟500ms后生成弹幕
            timeouts.push(warningTimeout2);
            
            barrageCount++;
            const spawnTimeout = setTimeout(createBarrage, spawnInterval);
            timeouts.push(spawnTimeout);
        };
        
        // 保存清理函数
        this.barrageCleanup = () => {
            gameArea.removeEventListener('mousemove', mouseMoveHandler);
            gameArea.removeEventListener('touchmove', touchMoveHandler);
            gameArea.removeEventListener('touchstart', touchStartHandler);
            document.removeEventListener('keydown', keyHandler);
            intervals.forEach(i => clearInterval(i));
            timeouts.forEach(t => clearTimeout(t));
            if (this.barrageSkillTimeouts) {
                this.barrageSkillTimeouts.forEach(t => clearTimeout(t));
                this.barrageSkillTimeouts = [];
            }
        };
        
        createBarrage();
    },

    // 使用弹幕技能
    useBarrageSkill: function() {
        if (!this.barrageSkillReady) return;
        
        this.barrageSkillReady = false;
        const skillReadyEl = document.getElementById('skill-ready');
        const skillBtnEl = document.getElementById('skill-btn');
        if (skillReadyEl) {
            skillReadyEl.textContent = '✗ 冷却中';
            skillReadyEl.style.color = '#e94560';
        }
        if (skillBtnEl) skillBtnEl.disabled = true;
        
        // 清除所有弹幕
        document.querySelectorAll('.barrage-item[data-clearable="true"]').forEach(el => {
            el.style.transition = 'all 0.3s';
            el.style.transform = 'scale(0)';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        });
        
        this.showNotification('🛡️ 糊弄学护盾已激活！清除所有弹幕！');
        
        // 10秒冷却
        const cooldownTimeout = setTimeout(() => {
            this.barrageSkillReady = true;
            if (skillReadyEl) {
                skillReadyEl.textContent = '✓ 就绪';
                skillReadyEl.style.color = '#00b894';
            }
            if (skillBtnEl) skillBtnEl.disabled = false;
        }, 10000);
        
        // 保存到cleanup
        if (!this.barrageSkillTimeouts) {
            this.barrageSkillTimeouts = [];
        }
        this.barrageSkillTimeouts.push(cooldownTimeout);
    },

    // 潜行偷听游戏
    startStealthGame: function() {
        const container = document.getElementById('minigame-area');
        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="minigame-container">
                <div style="margin-bottom:10px; color:#e94560; font-weight:bold;">👂 厨房情报战</div>
                
                <!-- 奶奶位置提示 -->
                <div id="grandma-status" style="background:#2d3436; padding:10px; border-radius:5px; margin-bottom:10px; text-align:center;">
                    <div style="font-size:12px; color:#aaa; margin-bottom:5px;">👵 奶奶位置</div>
                    <div id="grandma-position" style="font-size:24px; transition:all 0.3s;">🚶 客厅</div>
                </div>
                
                <div style="background:#1a1a2e; padding:15px; border-radius:5px; margin-bottom:10px;">
                    <div style="color:#ffd700; margin-bottom:10px;">对话片段：</div>
                    <div id="secret-text" style="font-size:14px; line-height:1.6; color:#ddd;">
                        点击"偷听"按钮收集情报...
                    </div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button onclick="game.listenSecret()" id="listen-btn" style="padding:10px 20px; background:#e94560; border:none; color:white; border-radius:5px; cursor:pointer;">
                        👂 偷听
                    </button>
                    <button onclick="game.stopListening()" style="padding:10px 20px; background:#00b894; border:none; color:white; border-radius:5px; cursor:pointer;">
                        ✋ 停止
                    </button>
                </div>
                <div style="margin-top:10px; font-size:12px; color:#aaa;">
                    偷听次数: <span id="listen-count">0</span>/5 | 
                    警觉度: <span id="alert-level">0</span>%
                </div>
                <div style="width:100%; height:6px; background:#333; margin-top:5px; border-radius:3px;">
                    <div id="alert-bar" style="width:0%; height:100%; background:#e94560; transition:width 0.3s;"></div>
                </div>
                <div style="margin-top:8px; font-size:11px; color:#666;">
                    💡 提示：警觉度越低越安全，达到100%会被发现！
                </div>
            </div>
        `;
        
        this.stealthData = {
            listenCount: 0,
            alertLevel: 0,
            secrets: [
                "大伯炒股亏了20万...",
                "表姐其实还没离婚...",
                "表弟的高考成绩是买的...",
                "奶奶把金镯子藏在了米缸里...",
                "三姑父有高血压不能喝酒..."
            ]
        };
        
        // 自动开始第一条情报
        setTimeout(() => {
            this.showNotification("趁奶奶不在，快偷听几句！");
        }, 500);
    },

    listenSecret: function() {
        const data = this.stealthData;
        if (data.listenCount >= 5 || data.alertLevel >= 100) {
            this.showNotification("太危险了！快停止！");
            return;
        }
        
        data.listenCount++;
        data.alertLevel += Math.random() * 30 + 10;
        
        // 限制警觉度最大为100
        data.alertLevel = Math.min(100, data.alertLevel);
        
        document.getElementById('listen-count').textContent = data.listenCount;
        document.getElementById('alert-level').textContent = Math.floor(data.alertLevel);
        document.getElementById('alert-bar').style.width = data.alertLevel + '%';
        
        // 更新奶奶位置提示
        this.updateGrandmaHint(data.alertLevel);
        
        const secret = data.secrets[data.listenCount - 1];
        document.getElementById('secret-text').innerHTML += `<div style="color:#00b894; margin:5px 0;">✓ ${secret}</div>`;
        this.state.secretsLearned.push(secret);
        
        if (data.alertLevel >= 100) {
            document.getElementById('listen-btn').disabled = true;
            document.getElementById('grandma-position').textContent = '👀 在你身后！';
            this.showNotification("被发现了！奶奶瞪了你一眼！");
            // 延迟后触发被抓包结局
            setTimeout(() => {
                this.triggerEnding('kitchen_caught');
            }, 1500);
        }
    },

    updateGrandmaHint: function(alertLevel) {
        const positionEl = document.getElementById('grandma-position');
        if (!positionEl) return;
        
        if (alertLevel < 30) {
            positionEl.textContent = '🚶 客厅';
        } else if (alertLevel < 60) {
            positionEl.textContent = '👂 走廊';
        } else if (alertLevel < 100) {
            positionEl.textContent = '🤔 厨房门口';
        }
    },

    stopListening: function() {
        this.showNotification(`收集到 ${this.stealthData.listenCount} 条情报！`);
        document.getElementById('minigame-area').classList.add('hidden');
        this.nextScene();
    },

    // 防守游戏
    startDefenseGame: function() {
        const container = document.getElementById('minigame-area');
        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="minigame-container">
                <div style="margin-bottom:10px; color:#e94560; font-weight:bold;">🚪 卫生间守卫战</div>
                
                <!-- 表弟头像和对话气泡 -->
                <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:15px;">
                    <div style="font-size:40px;">🧒</div>
                    <div style="flex:1; background:#2d3436; padding:12px; border-radius:10px; border-top-left-radius:2px; position:relative;">
                        <div id="attack-text" style="font-size:15px; color:#e94560; min-height:24px;">哥哥！我要上厕所！</div>
                    </div>
                </div>
                
                <!-- 防御选项 -->
                <div style="background:#1a1a2e; padding:12px; border-radius:5px; margin-bottom:15px;">
                    <div style="font-size:12px; color:#aaa; margin-bottom:8px;">选择防御策略：</div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;" id="defense-buttons">
                        <button onclick="game.defend('ignore')" style="flex:1; min-width:100px; padding:12px 8px; background:#533483; border:2px solid #a29bfe; color:white; border-radius:8px; cursor:pointer; font-size:13px;">
                            <div>🙉</div>
                            <div>装听不见</div>
                            <div style="font-size:10px; color:#aaa; margin-top:4px;">50%扣20耐久</div>
                        </button>
                        <button onclick="game.defend('flush')" style="flex:1; min-width:100px; padding:12px 8px; background:#00b894; border:2px solid #00d2a0; color:white; border-radius:8px; cursor:pointer; font-size:13px;">
                            <div>🚿</div>
                            <div>冲水掩护</div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.7); margin-top:4px;">稳定扣5耐久</div>
                        </button>
                        <button onclick="game.defend('shout')" style="flex:1; min-width:100px; padding:12px 8px; background:#e94560; border:2px solid #ff6b6b; color:white; border-radius:8px; cursor:pointer; font-size:13px;">
                            <div>📢</div>
                            <div>大喊有人</div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.7); margin-top:4px;">扣10耐心</div>
                        </button>
                    </div>
                </div>
                
                <!-- 门耐久度 -->
                <div style="background:#2d3436; padding:12px; border-radius:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span>🚪 门耐久度</span>
                        <span style="font-weight:bold; color:#00b894;"><span id="door-hp">100</span>%</span>
                    </div>
                    <div style="width:100%; height:12px; background:#333; border-radius:6px; overflow:hidden;">
                        <div id="door-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #00b894, #00d2a0); transition:width 0.3s;"></div>
                    </div>
                </div>
                
                <!-- 波次指示器 -->
                <div style="margin-top:12px; display:flex; justify-content:center; gap:8px;">
                    <div id="wave-dot-1" style="width:10px; height:10px; background:#e94560; border-radius:50%;"></div>
                    <div id="wave-dot-2" style="width:10px; height:10px; background:#333; border-radius:50%;"></div>
                    <div id="wave-dot-3" style="width:10px; height:10px; background:#333; border-radius:50%;"></div>
                </div>
                <div style="margin-top:6px; font-size:12px; color:#aaa; text-align:center;">第 <span id="wave-num">1</span> / 3 波</div>
            </div>
        `;
        
        this.defenseData = {
            doorHp: 100,
            wave: 1,
            attacks: [
                "哥哥！我要上厕所！",
                "我知道你在里面！",
                "妈妈！哥哥占着厕所！",
                "我要告诉奶奶你躲里面！",
                "再不开门我踹门了！"
            ]
        };
        
        this.nextAttack();
    },

    nextAttack: function() {
        const data = this.defenseData;
        if (data.wave > 3) return;
        
        const attack = data.attacks[Math.floor(Math.random() * data.attacks.length)];
        document.getElementById('attack-text').textContent = attack;
    },

    defend: function(type) {
        const data = this.defenseData;
        let damage = 0;
        
        switch(type) {
            case 'ignore':
                damage = Math.random() > 0.5 ? 20 : 0;
                break;
            case 'flush':
                damage = 5;
                break;
            case 'shout':
                damage = 0;
                this.updateStat('patience', -10);
                break;
        }
        
        data.doorHp -= damage;
        const doorHpEl = document.getElementById('door-hp');
        const doorBarEl = document.getElementById('door-bar');
        if (doorHpEl) doorHpEl.textContent = data.doorHp;
        if (doorBarEl) doorBarEl.style.width = data.doorHp + '%';
        
        if (data.doorHp <= 0) {
            this.triggerEnding('kid_invade');
            return;
        }
        
        data.wave++;
        
        // 更新波次指示器
        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById('wave-dot-' + i);
            if (dot) {
                dot.style.background = i <= data.wave ? '#e94560' : '#333';
            }
        }
        
        if (data.wave > 3) {
            this.state.defeatedCount++;
            this.showNotification("防守成功！击败表弟！获得【房间主权】");
            setTimeout(() => {
                document.getElementById('minigame-area').classList.add('hidden');
                this.nextScene();
            }, 1500);
        } else {
            // 更新波次显示和话术
            const waveNumEl = document.getElementById('wave-num');
            if (waveNumEl) waveNumEl.textContent = data.wave;
            this.nextAttack();
        }
    },

    // 红包雨游戏
    startRedPacketRain: function() {
        const container = document.getElementById('minigame-area');
        container.classList.remove('hidden');
        container.innerHTML = `
            <div class="minigame-container">
                <div style="margin-bottom:10px; color:#e94560; font-weight:bold;">🧧 家族群红包雨</div>
                
                <!-- 游戏说明 -->
                <div style="background:rgba(255,215,0,0.1); border:1px solid #ffd700; padding:8px; border-radius:5px; margin-bottom:10px; font-size:12px;">
                    <span style="color:#ffd700;">💡</span> 点击 <span style="font-size:16px;">🧧</span> 领红包，避开 <span style="font-size:16px;">💣</span> 陷阱！
                </div>
                
                <div id="redpacket-area" style="height:220px; background:linear-gradient(180deg, #1a1a2e 0%, #2d1f3d 100%); position:relative; overflow:hidden; border:2px solid #e94560; border-radius:8px;">
                    <!-- 进度指示 -->
                    <div style="position:absolute; top:5px; right:10px; font-size:12px; color:#aaa; z-index:10;">
                        <span id="rp-progress">0</span>/15
                    </div>
                </div>
                
                <!-- 状态栏 -->
                <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:14px; background:#2d3436; padding:10px; border-radius:5px;">
                    <div style="text-align:center;">
                        <div style="font-size:12px; color:#aaa;">💰 获得</div>
                        <div style="font-size:18px; color:#ffd700; font-weight:bold;"><span id="rp-money">0</span>元</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:12px; color:#aaa;">❤️ 耐心</div>
                        <div style="font-size:18px; color:#00b894; font-weight:bold;"><span id="rp-patience">100</span></div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:12px; color:#aaa;">🎯 连击</div>
                        <div style="font-size:18px; color:#e94560; font-weight:bold;"><span id="rp-combo">0</span></div>
                    </div>
                </div>
                
                <!-- 耐心条 -->
                <div style="margin-top:10px;">
                    <div style="width:100%; height:8px; background:#333; border-radius:4px; overflow:hidden;">
                        <div id="rp-patience-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #e94560, #ff6b6b); transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const area = document.getElementById('redpacket-area');
        let money = 0;
        let patience = 100;
        let count = 0;
        let combo = 0;
        let maxCount = 15; // 减少到15个，节奏更快
        const timeouts = [];
        const animations = [];
        
        const dropItem = () => {
            if (count >= maxCount) {
                // 游戏结束，结算
                const bonus = Math.floor(combo / 5) * 50; // 连击奖励
                if (bonus > 0) {
                    money += bonus;
                    this.showNotification(`🎉 连击奖励 +${bonus}元！`);
                }
                this.updateStat('money', money);
                this.updateStat('patience', patience - 100);
                document.getElementById('minigame-area').classList.add('hidden');
                this.nextScene();
                return;
            }
            
            // 30%概率是陷阱
            const isTrap = Math.random() < 0.3;
            const el = document.createElement('div');
            el.textContent = isTrap ? '💣' : '🧧';
            el.style.cssText = `
                position: absolute;
                left: ${5 + Math.random() * 85}%;
                top: -40px;
                font-size: 32px;
                cursor: pointer;
                user-select: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                transition: transform 0.1s;
                z-index: 5;
            `;
            
            // 点击效果
            el.onmousedown = () => el.style.transform = 'scale(0.9)';
            el.onmouseup = () => el.style.transform = 'scale(1)';
            
            el.onclick = (e) => {
                e.stopPropagation();
                if (isTrap) {
                    patience = Math.max(0, patience - 25);
                    combo = 0;
                    this.showNotification("💥 踩到陷阱！耐心-25");
                    document.getElementById('rp-patience').textContent = patience;
                    document.getElementById('rp-patience-bar').style.width = patience + '%';
                    document.getElementById('rp-combo').textContent = combo;
                    el.style.transform = 'scale(1.5)';
                    el.style.opacity = '0';
                    const timeout = setTimeout(() => el.remove(), 200);
                    timeouts.push(timeout);
                    if (patience <= 0) {
                        const endTimeout = setTimeout(() => this.triggerEnding('redpacket_trap'), 500);
                        timeouts.push(endTimeout);
                    }
                } else {
                    const amount = 10 + Math.floor(Math.random() * 90);
                    money += amount;
                    combo++;
                    this.showNotification(`🧧 +${amount}元！`);
                    document.getElementById('rp-money').textContent = money;
                    document.getElementById('rp-combo').textContent = combo;
                    el.style.transform = 'scale(0) rotate(360deg)';
                    el.style.opacity = '0';
                    const timeout = setTimeout(() => el.remove(), 300);
                    timeouts.push(timeout);
                }
            };
            
            area.appendChild(el);
            
            // 使用CSS动画下落
            const animation = el.animate([
                { top: '-40px', transform: 'rotate(0deg)' },
                { top: '240px', transform: 'rotate(360deg)' }
            ], {
                duration: 2500 + Math.random() * 1000, // 2.5-3.5秒下落时间
                easing: 'linear'
            });
            animations.push(animation);
            
            animation.onfinish = () => {
                if (el.parentNode) {
                    el.remove();
                    if (!isTrap) combo = 0; // 错过红包重置连击
                    document.getElementById('rp-combo').textContent = combo;
                }
            };
            
            count++;
            document.getElementById('rp-progress').textContent = count;
            const timeout = setTimeout(dropItem, 600 + Math.random() * 400); // 0.6-1秒间隔
            timeouts.push(timeout);
        };
        
        // 保存清理函数
        this.redpacketCleanup = () => {
            timeouts.forEach(t => clearTimeout(t));
            animations.forEach(a => a.cancel());
            const areaEl = document.getElementById('redpacket-area');
            if (areaEl) {
                areaEl.innerHTML = '';
            }
        };
        
        // 开始提示
        this.showNotification("红包雨开始！准备好手速！");
        const startTimeout = setTimeout(dropItem, 1000);
        timeouts.push(startTimeout);
    },

    // 卡牌对决
    startCardBattle: function() {
        const container = document.getElementById('minigame-area');
        container.classList.remove('hidden');
        
        const cards = [
            { name: "炫耀儿子", text: "我家儿子考上了公务员！", dmg: 20, icon: "👨‍💼" },
            { name: "攀比房产", text: "拆迁分了五套房呢~", dmg: 25, icon: "🏠" },
            { name: "怀旧杀", text: "上次见你你还在穿开裆裤！", dmg: 15, icon: "👶" },
            { name: "年龄攻击", text: "三十而立，你立了吗？", dmg: 30, icon: "📅" }
        ];
        
        const myCards = [
            { name: "糊弄学", effect: "防御", val: 15, icon: "🛡️", desc: "减少15点伤害" },
            { name: "转移话题", effect: "闪避", val: 0, icon: "💨", desc: "完全闪避攻击" },
            { name: "反客为主", effect: "反击", val: 25, icon: "⚔️", desc: "造成25点伤害" },
            { name: "尿遁", effect: "逃跑", val: 0, icon: "🏃", desc: "结束战斗" }
        ];
        
        container.innerHTML = `
            <div class="minigame-container">
                <div style="margin-bottom:10px; color:#e94560; font-weight:bold;">⚔️ 小区遭遇战：王阿姨</div>
                
                <!-- 对战区域 -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding:10px; background:#1a1a2e; border-radius:8px;">
                    <!-- 王阿姨 -->
                    <div style="text-align:center;">
                        <div style="font-size:40px;">👩‍🦱</div>
                        <div style="font-size:12px; color:#aaa;">王阿姨</div>
                        <div style="margin-top:5px;">
                            <div style="width:60px; height:8px; background:#333; border-radius:4px; margin:0 auto;">
                                <div id="enemy-hp-bar" style="width:100%; height:100%; background:#e94560; border-radius:4px; transition:width 0.3s;"></div>
                            </div>
                            <div style="font-size:10px; color:#e94560; margin-top:2px;"><span id="enemy-hp">100</span>HP</div>
                        </div>
                    </div>
                    
                    <!-- VS -->
                    <div style="font-size:24px; color:#ffd700; font-weight:bold;">VS</div>
                    
                    <!-- 玩家 -->
                    <div style="text-align:center;">
                        <div style="font-size:40px;">🧑</div>
                        <div style="font-size:12px; color:#aaa;">你</div>
                        <div style="margin-top:5px;">
                            <div style="width:60px; height:8px; background:#333; border-radius:4px; margin:0 auto;">
                                <div id="player-hp-bar" style="width:100%; height:100%; background:#00b894; border-radius:4px; transition:width 0.3s;"></div>
                            </div>
                            <div style="font-size:10px; color:#00b894; margin-top:2px;"><span id="player-hp">100</span>HP</div>
                        </div>
                    </div>
                </div>
                
                <!-- 王阿姨的攻击 -->
                <div style="background:#2d3436; padding:12px; border-radius:8px; margin-bottom:15px; border-left:4px solid #e94560;">
                    <div style="font-size:12px; color:#aaa; margin-bottom:5px;">👩‍🦱 王阿姨的攻击：</div>
                    <div id="enemy-card-text" style="font-size:15px; color:#fff; min-height:22px;">准备接招...</div>
                    <div id="enemy-card-dmg" style="font-size:12px; color:#e94560; margin-top:5px; opacity:0;">💥 造成 <span>0</span> 点伤害</div>
                </div>
                
                <!-- 玩家手牌 -->
                <div style="font-size:12px; color:#aaa; margin-bottom:8px;">选择你的应对卡牌：</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;" id="my-hand">
                    ${myCards.map((c, i) => `
                        <button onclick="game.playCard(${i})" style="padding:12px 8px; background:linear-gradient(135deg, #533483 0%, #6c5ce7 100%); border:2px solid #a29bfe; color:white; border-radius:8px; cursor:pointer; font-size:12px; transition:all 0.2s;">
                            <div style="font-size:20px; margin-bottom:4px;">${c.icon}</div>
                            <div style="font-weight:bold; margin-bottom:3px;">${c.name}</div>
                            <div style="font-size:10px; color:#ddd;">${c.desc}</div>
                        </button>
                    `).join('')}
                </div>
                
                <!-- 战斗日志 -->
                <div id="battle-log" style="margin-top:12px; padding:10px; background:#1a1a2e; border-radius:5px; font-size:12px; color:#00b894; min-height:36px; text-align:center;">
                    战斗开始！请选择卡牌应对王阿姨的攻击！
                </div>
                
                <!-- 回合数 -->
                <div style="margin-top:10px; text-align:center; font-size:12px; color:#666;">
                    第 <span id="battle-round">1</span> 回合
                </div>
            </div>
        `;
        
        const timeouts = [];
        
        this.battleData = {
            enemyHp: 100,
            playerHp: 100,
            cards: cards,
            myCards: myCards,
            round: 1,
            timeouts: timeouts
        };
        
        // 保存清理函数
        this.battleCleanup = () => {
            timeouts.forEach(t => clearTimeout(t));
        };
        
        // 显示第一波攻击
        this.showNextEnemyAttack();
    },
    
    showNextEnemyAttack: function() {
        const data = this.battleData;
        const enemyCard = data.cards[Math.floor(Math.random() * data.cards.length)];
        data.currentEnemyCard = enemyCard;
        
        const enemyCardTextEl = document.getElementById('enemy-card-text');
        const enemyCardDmgEl = document.getElementById('enemy-card-dmg');
        
        if (enemyCardTextEl) {
            enemyCardTextEl.innerHTML = `
                <span style="font-size:18px; margin-right:8px;">${enemyCard.icon}</span>
                "${enemyCard.text}"
            `;
        }
        if (enemyCardDmgEl) {
            enemyCardDmgEl.style.opacity = '0';
        }
    },

    playCard: function(index) {
        const data = this.battleData;
        const myCard = data.myCards[index];
        const enemyCard = data.currentEnemyCard;
        
        let log = "";
        let playerDmg = 0;
        let enemyDmg = 0;
        
        if (myCard.effect === '逃跑') {
            this.showNotification("🏃 你找了个借口溜走了！");
            document.getElementById('minigame-area').classList.add('hidden');
            this.nextScene();
            return;
        } else if (myCard.effect === '反击') {
            enemyDmg = myCard.val;
            data.enemyHp = Math.max(0, data.enemyHp - enemyDmg);
            log = `⚔️ 你使用【${myCard.name}】反击："您退休金多少？" 造成${enemyDmg}点伤害！`;
        } else if (myCard.effect === '防御') {
            playerDmg = Math.max(0, enemyCard.dmg - myCard.val);
            data.playerHp = Math.max(0, data.playerHp - playerDmg);
            log = `🛡️ 你使用【${myCard.name}】抵挡了${myCard.val}点伤害，实际受到${playerDmg}点伤害！`;
        } else if (myCard.effect === '闪避') {
            log = `💨 你使用【${myCard.name}】："哎呀我手机响了" 完全闪避！`;
        }
        
        // 更新UI
        const enemyHpEl = document.getElementById('enemy-hp');
        const enemyHpBarEl = document.getElementById('enemy-hp-bar');
        const playerHpEl = document.getElementById('player-hp');
        const playerHpBarEl = document.getElementById('player-hp-bar');
        const battleLogEl = document.getElementById('battle-log');
        
        if (enemyHpEl) enemyHpEl.textContent = data.enemyHp;
        if (enemyHpBarEl) enemyHpBarEl.style.width = data.enemyHp + '%';
        if (playerHpEl) playerHpEl.textContent = data.playerHp;
        if (playerHpBarEl) playerHpBarEl.style.width = data.playerHp + '%';
        if (battleLogEl) {
            battleLogEl.textContent = log;
            battleLogEl.style.color = myCard.effect === '闪避' ? '#00b894' : '#ffd700';
        }
        
        // 显示敌人伤害
        if (playerDmg > 0) {
            const dmgEl = document.getElementById('enemy-card-dmg');
            if (dmgEl) {
                dmgEl.querySelector('span').textContent = playerDmg;
                dmgEl.style.opacity = '1';
            }
        }
        
        // 检查战斗结果
        if (data.enemyHp <= 0) {
            this.state.defeatedCount++;
            if (battleLogEl) {
                battleLogEl.textContent = "🎉 王阿姨被你的机智击败，灰溜溜地走了！";
                battleLogEl.style.color = '#00b894';
            }
            const timeout = setTimeout(() => {
                this.showNotification("击败王阿姨！获得【社区威望】");
                document.getElementById('minigame-area').classList.add('hidden');
                this.nextScene();
            }, 2000);
            data.timeouts.push(timeout);
            return;
        }
        
        if (data.playerHp <= 0) {
            const timeout = setTimeout(() => this.triggerEnding('battle_defeat'), 1000);
            data.timeouts.push(timeout);
            return;
        }
        
        // 下一回合
        data.round++;
        const battleRoundEl = document.getElementById('battle-round');
        if (battleRoundEl) battleRoundEl.textContent = data.round;
        
        // 禁用按钮，准备下一回合
        const buttons = document.querySelectorAll('#my-hand button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        const timeout = setTimeout(() => {
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            this.showNextEnemyAttack();
            if (battleLogEl) {
                battleLogEl.textContent = "请选择卡牌应对王阿姨的攻击！";
                battleLogEl.style.color = '#00b894';
            }
        }, 1500);
        data.timeouts.push(timeout);
    },

    // 核心系统函数
    start: function() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('status-bar').classList.remove('hidden');
        document.getElementById('scene-display').classList.remove('hidden');
        document.getElementById('choices-container').classList.remove('hidden');
        document.getElementById('progress-map').classList.remove('hidden');
        
        this.loadScene(0);
    },

    loadScene: function(index) {
        if (index >= this.scenes.length) {
            this.calculateEnding();
            return;
        }
        
        // 清理上一场景的定时器和游戏元素
        this.clearAllTimers();
        if (this.barrageCleanup) {
            this.barrageCleanup();
            this.barrageCleanup = null;
        }
        document.querySelectorAll('.barrage-container').forEach(el => el.remove());
        document.getElementById('minigame-area').classList.add('hidden');
        document.getElementById('minigame-area').innerHTML = '';
        
        // 重置弹幕技能
        this.barrageSkillReady = true;
        
        this.state.currentScene = index;
        const scene = this.scenes[index];
        
        // 更新地图
        document.querySelectorAll('.map-node').forEach((node, i) => {
            node.classList.remove('active');
            if (i < index) node.classList.add('completed');
            if (i === index) node.classList.add('active');
        });
        
        // 更新场景显示
        document.getElementById('scene-title').textContent = scene.name;
        document.getElementById('npc-sprite').textContent = scene.npc;
        document.getElementById('speaker-name').textContent = scene.npcName;
        document.getElementById('dialogue-text').textContent = scene.dialogue;
        document.getElementById('scene-visual').style.background = scene.bg;
        
        // 清空并重建选择
        const choicesDiv = document.getElementById('choices-container');
        choicesDiv.innerHTML = '';
        
        if (scene.type === 'choice' && scene.choices) {
            choicesDiv.classList.remove('hidden');
            scene.choices.forEach(choice => {
                if (choice.condition && !choice.condition()) return;
                
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                
                // 显示效果预览
                let effectText = '';
                if (choice.effect) {
                    const effects = [];
                    if (choice.effect.patience) effects.push(`耐心${choice.effect.patience > 0 ? '+' : ''}${choice.effect.patience}`);
                    if (choice.effect.acting) effects.push(`演技${choice.effect.acting > 0 ? '+' : ''}${choice.effect.acting}`);
                    if (choice.effect.stomach) effects.push(`饱腹${choice.effect.stomach > 0 ? '+' : ''}${choice.effect.stomach}`);
                    effectText = effects.join(' | ');
                }
                
                btn.innerHTML = `
                    <span class="choice-tag">${choice.tag}</span>
                    ${choice.text}
                    ${choice.desc ? `<div style="font-size:11px; color:#aaa; margin-top:4px;">${choice.desc}</div>` : ''}
                    ${effectText ? `<div style="font-size:10px; color:#666; margin-top:2px;">${effectText}</div>` : ''}
                `;
                btn.onclick = () => this.makeChoice(choice);
                choicesDiv.appendChild(btn);
            });
        } else if (scene.type === 'cooldown' && scene.choices) {
            // 安全区/休息区，显示选择按钮
            choicesDiv.classList.remove('hidden');
            
            // 添加安全区提示
            const safeHint = document.createElement('div');
            safeHint.style.cssText = 'background:rgba(0,184,148,0.2); border:1px solid #00b894; padding:10px; border-radius:5px; margin-bottom:15px; text-align:center; color:#00b894;';
            safeHint.innerHTML = '✅ 安全区 - 可以安心恢复状态';
            choicesDiv.appendChild(safeHint);
            
            scene.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.style.background = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
                
                // 显示效果预览
                let effectText = '';
                if (choice.effect) {
                    const effects = [];
                    if (choice.effect.patience) effects.push(`耐心${choice.effect.patience > 0 ? '+' : ''}${choice.effect.patience}`);
                    if (choice.effect.acting) effects.push(`演技${choice.effect.acting > 0 ? '+' : ''}${choice.effect.acting}`);
                    if (choice.effect.stomach) effects.push(`饱腹${choice.effect.stomach > 0 ? '+' : ''}${choice.effect.stomach}`);
                    effectText = effects.join(' | ');
                }
                
                btn.innerHTML = `
                    <span class="choice-tag">${choice.tag}</span>
                    ${choice.text}
                    ${effectText ? `<div style="font-size:11px; color:#ddd; margin-top:4px;">${effectText}</div>` : ''}
                `;
                btn.onclick = () => this.makeChoice(choice);
                choicesDiv.appendChild(btn);
            });
        } else if (scene.init) {
            // 特殊游戏场景，隐藏选择按钮区域，延迟初始化
            choicesDiv.classList.add('hidden');
            setTimeout(() => scene.init.call(this), 1000);
        }
    },

    makeChoice: function(choice) {
        // 应用效果
        if (choice.effect) {
            Object.entries(choice.effect).forEach(([stat, val]) => {
                this.updateStat(stat, val);
            });
        }
        
        if (choice.item) {
            this.addItem(choice.item);
        }
        
        // 检查死亡
        if (this.state.patience <= 0) {
            this.triggerEnding('patience_zero');
            return;
        }
        
        // 进入下一场景或子场景
        setTimeout(() => {
            if (choice.next && this[choice.next]) {
                this[choice.next]();
            } else {
                this.nextScene();
            }
        }, 500);
    },

    nextScene: function() {
        this.loadScene(this.state.currentScene + 1);
    },

    updateStat: function(stat, delta) {
        this.state[stat] = Math.max(0, Math.min(100, this.state[stat] + delta));
        
        // 更新显示
        const bar = document.getElementById(stat + '-bar');
        const val = document.getElementById(stat + '-val');
        if (bar && val) {
            bar.style.width = this.state[stat] + '%';
            val.textContent = stat === 'money' ? this.state[stat] : Math.floor(this.state[stat]);
            
            // 颜色警告
            if (this.state[stat] < 20) bar.style.background = '#e94560';
        }
    },

    addItem: function(item) {
        this.state.inventory.push(item);
        this.showNotification(`获得道具：${item}`);
    },

    showNotification: function(text) {
        const notif = document.createElement('div');
        notif.className = 'item-notification';
        notif.textContent = text;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    // 子场景处理器（简单的分支）
    dinner_2: function() {
        this.showDialogue("大伯", "说得好！来，这杯酒干了！", [
            { text: "（喝）咳咳咳...", effect: { stomach: -10, patience: -5 }, next: 'nextScene' },
            { text: "（假装洒了）哎呀手滑！", effect: { acting: +8 }, next: 'nextScene' }
        ]);
    },

    dinner_greedy: function() {
        this.showDialogue("妈妈", "慢点吃，没人跟你抢！看你这吃相...", [
            { text: "（继续猛吃）唔唔唔", effect: { stomach: +30, patience: +10 }, next: 'nextScene' }
        ]);
    },

    dinner_escape: function() {
        this.showDialogue("系统", "你成功逃到了阳台，但演技值不足以支撑...", [
            { text: "（继续演戏）喂？项目出BUG了？", effect: { patience: +5 }, next: 'nextScene' }
        ]);
    },

    balcony_chat: function() {
        this.showDialogue("死党微信", "哈哈哈你也被催婚了？我这边更惨...", [
            { text: "（疯狂打字吐槽）", effect: { patience: +25 }, next: 'nextScene' }
        ]);
    },

    balcony_act: function() {
        this.showDialogue("空气", "你对着空气表演打电话，路人视角很诡异...", [
            { text: "（大声）什么？公司要倒闭了？", effect: { acting: +6, patience: +0 }, next: 'nextScene' }
        ]);
    },

    balcony_laugh: function() {
        this.showDialogue("短视频", "看到一个搞笑视频，没忍住笑出声...", [
            { text: "（鹅叫）嘎嘎嘎嘎", effect: { patience: +10 }, next: 'nextScene' }
        ]);
    },

    bathroom_long: function() {
        this.updateStat('patience', 30);
        this.showNotification("腿麻了...");
        setTimeout(() => this.nextScene(), 1500);
    },

    bathroom_item: function() {
        this.addItem('马桶搋子');
        setTimeout(() => this.nextScene(), 1000);
    },

    bathroom_exit: function() {
        this.showDialogue("系统", "你带着神秘的气场走出卫生间...", [
            { text: "（自信）", next: 'nextScene' }
        ]);
    },

    bedroom_hide: function() {
        this.showDialogue("被窝", "你钻进被窝，世界与你无关...", [
            { text: "（安详）Zzzzz...", effect: { patience: +20 }, next: 'nextScene' }
        ]);
    },

    bedroom_act: function() {
        this.showDialogue("系统", "你假装睡觉，演技逐渐精进...", [
            { text: "（打鼾）呼...呼...", effect: { acting: +6, patience: +10 }, next: 'nextScene' }
        ]);
    },

    showDialogue: function(speaker, text, choices) {
        document.getElementById('speaker-name').textContent = speaker;
        document.getElementById('dialogue-text').textContent = text;
        
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        
        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            
            // 构建按钮文本，包含数值提示
            let btnText = c.text;
            if (c.effect) {
                const statChanges = Object.entries(c.effect).map(([k, v]) => {
                    const statNames = {
                        patience: '耐心',
                        acting: '演技',
                        stomach: '胃容量',
                        alert: '警觉度'
                    };
                    const sign = v > 0 ? '+' : '';
                    return `${statNames[k] || k}: ${sign}${v}`;
                }).join(' | ');
                btnText += ` (${statChanges})`;
            }
            
            btn.textContent = btnText;
            btn.onclick = () => {
                if (c.effect) {
                    Object.entries(c.effect).forEach(([k, v]) => this.updateStat(k, v));
                }
                if (c.item) {
                    this.addItem(c.item);
                    // 显示物品获得提示
                    const statBar = document.getElementById('stat-patience');
                    const itemTip = document.createElement('div');
                    itemTip.style = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        padding: 15px 25px;
                        background: rgba(0, 0, 0, 0.9);
                        color: #fff;
                        border-radius: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        z-index: 1000;
                        animation: fadeInOut 2s ease-in-out;
                    `;
                    itemTip.textContent = `获得道具：${c.item}`;
                    document.body.appendChild(itemTip);
                    setTimeout(() => itemTip.remove(), 2000);
                }
                if (c.next === 'nextScene') {
                    this.nextScene();
                } else if (c.next) {
                    this[c.next]();
                }
            };
            container.appendChild(btn);
        });
    },

    // 结局系统
    endings: {
        // 传奇结局
        legend_child: {
            rank: '🏆',
            title: '真·他人家的孩子',
            desc: '你完美扮演成功人士，年后被家族推举为"青年导师"，获得终身接受咨询诅咒。'
        },
        godfather: {
            rank: '🎭',
            title: '纸牌屋',
            desc: '你掌握了所有家族把柄，成为了地下教父，每年春节都要继续收集把柄维持统治。'
        },
        // 摆烂结局
        bed_soldier: {
            rank: '🛏️',
            title: '被窝里的守望者',
            desc: '你成功在床上了整个假期，获得"体虚"永久标签，明年父母会给你买保健品。'
        },
        vtuber: {
            rank: '🎮',
            title: '虚拟主播',
            desc: '亲戚们以为你变成了哑巴，开始在家族群为你众筹治病。'
        },
        // 社死结局
        qq_space: {
            rank: '💀',
            title: '三年前的QQ空间',
            desc: '表弟当众朗读你2012年的说说："总有一天我会让全世界记住我的名字（火星文版）"'
        },
        redpacket_trap: {
            rank: '🧧',
            title: '红包发错群',
            desc: '你触发了"谁领最少谁表演节目"，不得不在长辈面前跳《科目三》'
        },
        kid_invade: {
            rank: '🧒',
            title: '社会性死亡',
            desc: '表弟发现了你藏在床底的{item}，并大声询问这是什么！'
        },
        // 特殊结局
        beast: {
            rank: '🐲',
            title: '年兽觉醒',
            desc: '你掀桌了（物理），化身为传说中的年兽，被鞭炮驱逐出小区。'
        },
        parallel: {
            rank: '🌀',
            title: '平行宇宙的我',
            desc: '你发现另一个时空的自己带了对象回家，你选择夺舍他，但对象也是租的。'
        },
        arranged: {
            rank: '💔',
            title: '相亲相爱',
            desc: '你被强行安排相亲，对象 surprisingly 看对眼了，但彩礼谈崩了。'
        },
        heir: {
            rank: '👑',
            title: '家族继承人',
            desc: '你成功熬死（ figuratively ）所有长辈，成为了新的家族话事人。'
        },
        patience_zero: {
            rank: '😤',
            title: '耐心耗尽',
            desc: '你的耐心值归零，当场爆发，说出了所有真心话，家族群已将你移出。'
        },
        battle_defeat: {
            rank: '🏳️',
            title: '败北',
            desc: '你在小区遭遇战中败下阵来，成为了王阿姨口中"那个不成器的孩子"典型案例。'
        },
        kitchen_caught: {
            rank: '👵',
            title: '偷听被抓包',
            desc: '你偷听亲戚谈话被奶奶当场抓获！你被罚去洗完全家人的碗，并且成为了家族群里"不懂事"的典型案例。'
        },
        pixel_horse: {
            rank: '🐴',
            title: '马年复古回忆杀',
            desc: '你触发了时空乱流，回到了2014年的春节...像素版祝福已解锁！',
            isEasterEgg: true,
            effect: 'pixel_mode'
        }
    },

    triggerEnding: function(endingId) {
        const ending = this.endings[endingId];
        if (!ending) return;
        
        // 处理动态内容
        let desc = ending.desc;
        if (desc.includes('{item}')) {
            const randomItem = this.state.inventory[Math.floor(Math.random() * this.state.inventory.length)] || '神秘物品';
            desc = desc.replace('{item}', randomItem);
        }
        
        document.getElementById('ending-rank').textContent = ending.rank;
        document.getElementById('ending-title').textContent = ending.title;
        document.getElementById('ending-desc').textContent = desc;
        const survivalSeconds = Math.floor((Date.now() - this.state.startTime) / 1000);
        const minutes = Math.floor(survivalSeconds / 60);
        const seconds = survivalSeconds % 60;
        document.getElementById('survival-time').textContent = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        document.getElementById('defeated-relatives').textContent = this.state.defeatedCount;
        
        document.getElementById('ending-screen').classList.remove('hidden');
    },

    calculateEnding: function() {
        const s = this.state;
        let endingId = 'bed_soldier';
        
        // 终极彩蛋判定：像素马年（精确值88和66，致敬2014马年）- 最高优先级
        if (s.inventory.includes('FC游戏机') && 
            Math.floor(s.patience) === 88 && 
            Math.floor(s.acting) === 66) {
            this.triggerEnding('pixel_horse');
            this.startPixelAnimation();
            return;
        }
        
        // 传奇结局
        if (s.acting > 80 && s.patience > 50) {
            endingId = 'legend_child';
        } 
        // 纸牌屋结局
        else if (s.secretsLearned.length >= 3) {
            endingId = 'godfather';
        } 
        // 家族继承人结局
        else if (s.money > 3000) {
            endingId = 'heir';
        } 
        // 虚拟主播结局：演技高但耐心低，且没有房间主权
        else if (s.acting > 60 && s.patience < 40 && !s.inventory.includes('房间主权')) {
            endingId = 'vtuber';
        } 
        // 平行宇宙结局：有FC游戏机但数值不对
        else if (s.inventory.includes('FC游戏机') && (s.patience !== 88 || s.acting !== 66)) {
            endingId = 'parallel';
        } 
        // 相亲相爱结局：胃容量高且演技中等
        else if (s.stomach > 70 && s.acting > 30 && s.acting < 60) {
            endingId = 'arranged';
        } 
        // 三年前的QQ空间结局：偷听到秘密但不够多，且演技低
        else if (s.secretsLearned.length > 0 && s.secretsLearned.length < 3 && s.acting < 30) {
            endingId = 'qq_space';
        } 
        // 被窝里的守望者结局
        else if (s.inventory.includes('房间主权')) {
            endingId = 'bed_soldier';
        } 
        // 年兽觉醒结局
        else if (s.patience < 20) {
            endingId = 'beast';
        }
        
        this.triggerEnding(endingId);
    },

    restart: function() {
        // 清理所有定时器和事件监听器
        this.clearAllTimers();
        
        // 重置状态
        this.state = {
            patience: 100,
            money: 2000,
            acting: 20,
            stomach: 50,
            currentScene: 0,
            choices: [],
            flags: {},
            inventory: [],
            startTime: Date.now(),
            defeatedCount: 0,
            secretsLearned: []
        };
        
        // 重置UI
        document.getElementById('ending-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('status-bar').classList.add('hidden');
        document.getElementById('scene-display').classList.add('hidden');
        document.getElementById('choices-container').classList.add('hidden');
        document.getElementById('progress-map').classList.add('hidden');
        document.getElementById('minigame-area').classList.add('hidden');
        
        // 重置进度地图
        document.querySelectorAll('.map-node').forEach(node => {
            node.classList.remove('active', 'completed');
        });
        
        // 重置状态条
        ['patience', 'money', 'acting', 'stomach'].forEach(stat => {
            this.updateStat(stat, 0);
        });
    },

    clearAllTimers: function() {
        // 清理所有小游戏的定时器和清理函数
        if (this.barrageCleanup) {
            this.barrageCleanup();
            this.barrageCleanup = null;
        }
        if (this.redpacketCleanup) {
            this.redpacketCleanup();
            this.redpacketCleanup = null;
        }
        if (this.battleCleanup) {
            this.battleCleanup();
            this.battleCleanup = null;
        }
        
        // 清理所有DOM元素
        document.querySelectorAll('.barrage-container').forEach(el => el.remove());
        document.querySelectorAll('#redpacket-area > div').forEach(el => el.remove());
        
        // 隐藏小游戏区域
        const minigameArea = document.getElementById('minigame-area');
        if (minigameArea) {
            minigameArea.classList.add('hidden');
            minigameArea.innerHTML = '';
        }
        
        // 重置弹幕技能
        this.barrageSkillReady = true;
    },

    // 像素马年彩蛋动画
    startPixelAnimation: function() {
        // 创建像素画布层
        const pixelCanvas = document.createElement('canvas');
        pixelCanvas.id = 'pixel-canvas';
        pixelCanvas.width = 320;
        pixelCanvas.height = 240;
        pixelCanvas.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(2);
            image-rendering: pixelated;
            z-index: 999;
            border: 4px solid #8B4513;
            box-shadow: 0 0 20px rgba(255,0,0,0.5);
            background: #2C5F2D;
        `;
        
        const ctx = pixelCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        document.getElementById('ending-screen').appendChild(pixelCanvas);
        
        // 像素马的数据 (0=空, 1=马身, 2=鬃毛, 3=眼睛, 4=红绳)
        const horsePixel = [
            [0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
            [0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0],
            [0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0],
            [0,0,0,0,2,2,3,3,2,2,2,2,0,0,0,0],
            [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
            [0,0,2,2,2,2,1,1,1,1,2,2,2,2,0,0],
            [0,2,2,2,2,1,1,1,1,1,1,2,2,2,2,0],
            [0,2,2,2,1,1,1,1,1,1,1,1,2,2,2,0],
            [0,2,2,1,1,1,1,1,1,1,1,1,1,2,2,0],
            [0,0,2,1,1,1,1,1,1,1,1,1,1,2,0,0],
            [0,0,2,1,1,1,4,4,4,4,1,1,1,2,0,0],
            [0,0,2,1,1,1,4,4,4,4,1,1,1,2,0,0],
            [0,0,0,0,1,1,4,4,4,4,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0]
        ];
        
        let frame = 0;
        const particles = [];
        
        // 绘制函数
        const draw = () => {
            ctx.fillStyle = '#2C5F2D';
            ctx.fillRect(0, 0, 320, 240);
            
            // 绘制像素马
            const bounce = Math.sin(frame * 0.1) * 3;
            const offsetX = 80;
            const offsetY = 80 + bounce;
            
            horsePixel.forEach((row, y) => {
                row.forEach((pixel, x) => {
                    if (pixel === 0) return;
                    const colors = ['', '#8B4513', '#D2691E', '#000', '#DC143C'];
                    ctx.fillStyle = colors[pixel];
                    ctx.fillRect(offsetX + x * 10, offsetY + y * 8, 10, 8);
                });
            });
            
            // 绘制春联横幅
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(40, 20, 240, 40);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(42, 22, 236, 36);
            
            // 像素文字
            ctx.fillStyle = '#FFD700';
            ctx.font = '20px monospace';
            const text = frame % 60 < 30 ? '马年大吉' : '心想事成';
            ctx.fillText(text, 110, 48);
            
            // 上联
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(20, 80, 30, 120);
            ctx.fillStyle = '#FFD700';
            ctx.fillText('春', 28, 100);
            ctx.fillText('满', 28, 120);
            ctx.fillText('人', 28, 140);
            ctx.fillText('间', 28, 160);
            
            // 下联
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(270, 80, 30, 120);
            ctx.fillStyle = '#FFD700';
            ctx.fillText('福', 278, 100);
            ctx.fillText('临', 278, 120);
            ctx.fillText('门', 278, 140);
            ctx.fillText('第', 278, 160);
            
            // 粒子效果
            if (Math.random() < 0.1) {
                particles.push({
                    x: Math.random() * 320,
                    y: 240,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 3 - 1,
                    life: 60,
                    color: ['#FFD700', '#FF69B4', '#00CED1', '#FF4500'][Math.floor(Math.random() * 4)]
                });
            }
            
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                ctx.fillStyle = p.color;
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 4, 4);
                if (p.life <= 0) particles.splice(i, 1);
            });
            
            // 倒福字
            if (Math.floor(frame / 10) % 2 === 0) {
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(135, 200, 50, 40);
                ctx.fillStyle = '#FFD700';
                ctx.save();
                ctx.translate(160, 220);
                ctx.rotate(Math.PI);
                ctx.fillText('福', -10, 5);
                ctx.restore();
            }
            
            // 音乐可视化条
            for (let i = 0; i < 8; i++) {
                const h = Math.sin(frame * 0.2 + i) * 10 + 15;
                ctx.fillStyle = `hsl(${i * 45}, 100%, 50%)`;
                ctx.fillRect(280 + i * 5, 230 - h, 4, h);
            }
            
            frame++;
            if (this.pixelAnimationRunning) {
                requestAnimationFrame(draw);
            }
        };
        
        this.pixelAnimationRunning = true;
        draw();
        
        // 点击退出函数
        const exitPixelMode = () => {
            this.pixelAnimationRunning = false;
            pixelCanvas.remove();
            
            // 移除复古滤镜
            document.getElementById('ending-screen').style.filter = '';
            document.getElementById('ending-screen').style.imageRendering = '';
            
            // 显示重新开始按钮
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.classList.remove('hidden');
            }
        };
        
        // 点击画布退出
        pixelCanvas.onclick = exitPixelMode;
        
        // 点击任意位置退出
        const exitOverlay = document.createElement('div');
        exitOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 998;
            cursor: pointer;
        `;
        exitOverlay.onclick = exitPixelMode;
        document.getElementById('ending-screen').appendChild(exitOverlay);
        
        // 复古滤镜
        document.getElementById('ending-screen').style.filter = 'sepia(0.3) contrast(1.2)';
        document.getElementById('ending-screen').style.imageRendering = 'pixelated';
        
        // 提示文字
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: fixed;
            bottom: 20px;
            width: 100%;
            text-align: center;
            color: #00FF00;
            font-family: monospace;
            font-size: 12px;
            text-shadow: 2px 2px 0 #000;
            z-index: 1000;
            animation: blink 1s infinite;
        `;
        tip.textContent = '> 点击画面退出复古模式 <';
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 5000);
    }
};

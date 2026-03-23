// 幸福路的火锅店 - 游戏主逻辑

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 响应式画布大小
function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    const container = document.getElementById('game-container');
    
    if (isMobile) {
        // 手机上使用窗口大小
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.style.width = '100vw';
        container.style.height = '100vh';
    } else {
        // 电脑上是固定大小
        canvas.width = 1200;
        canvas.height = 700;
        // 限制最大宽度
        if (window.innerWidth < 1200) {
            canvas.width = window.innerWidth * 0.95;
            canvas.height = canvas.width * 0.583;
            container.style.width = canvas.width + 'px';
            container.style.height = canvas.height + 'px';
        } else {
            container.style.width = '1200px';
            container.style.height = '700px';
        }
    }
    
    // 重新初始化游戏（如果已经初始化过，需要重新计算桌子位置）
    if (gameState.tables.length > 0) {
        initTables();
    }
}

// 初始化桌子位置
function initTables() {
    const isMobile = canvas.width < 800;
    const scale = canvas.width / 1200;
    
    const tablePositions = isMobile ? [
        { x: canvas.width * 0.1, y: canvas.height * 0.3 },
        { x: canvas.width * 0.55, y: canvas.height * 0.3 },
        { x: canvas.width * 0.1, y: canvas.height * 0.55 },
        { x: canvas.width * 0.55, y: canvas.height * 0.55 },
    ] : [
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 150, y: 300 },
        { x: 350, y: 300 },
    ];
    
    const tableWidth = isMobile ? canvas.width * 0.3 : 100;
    const tableHeight = isMobile ? canvas.height * 0.12 : 80;
    
    for (let i = 0; i < gameState.tables.length; i++) {
        const table = gameState.tables[i];
        table.x = tablePositions[i].x;
        table.y = tablePositions[i].y;
        table.width = tableWidth;
        table.height = tableHeight;
    }
}

// 页面加载时和窗口大小改变时调整画布大小
window.addEventListener('DOMContentLoaded', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// 移动端触摸事件支持
function setupTouchEvents() {
    // 触摸事件处理
    canvas.addEventListener('touchstart', handleTouch, {passive: false});
    canvas.addEventListener('touchend', handleTouch, {passive: false});
}

function handleTouch(e) {
    e.preventDefault();
    
    let touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // 触发点击处理
    handleCanvasClickAt(x, y);
}

// 修改点击处理函数，支持触摸和鼠标
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

function handleCanvasClickAt(x, y) {
    // 检查是否点击了桌子
    for (const table of gameState.tables) {
        if (x >= table.x && x <= table.x + table.width &&
            y >= table.y && y <= table.y + table.height) {
            handleTableClick(table);
            return;
        }
    }
    
    // 检查是否点击了厨房槽位 - 移动端使用相对坐标
    const kitchenX = canvas.width * 0.5;
    const kitchenWidth = canvas.width * 0.4;
    const kitchenY = canvas.height * 0.1;
    const kitchenHeight = canvas.height * 0.5;
    
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slotX = kitchenX + i * (kitchenWidth / 2);
        const slotY = kitchenY + kitchenHeight * 0.2;
        const slotWidth = kitchenWidth / 3;
        const slotHeight = kitchenHeight * 0.15;
        
        if (x >= slotX && x <= slotX + slotWidth && y >= slotY && y <= slotY + slotHeight) {
            handleKitchenClick(gameState.kitchen.slots[i]);
            return;
        }
    }
}

// 游戏配置
const CONFIG = {
    FPS: 60,
    TABLE_COUNT: 4,
    KITCHEN_SLOTS: 2,
    CUSTOMER_SPAWN_INTERVAL: 5000, // 毫秒
    EATING_DURATION: 8000,
    COOKING_DURATION: 5000,
    CLEANING_DURATION: 3000,
};

// 游戏状态
const gameState = {
    gold: 500,
    gems: 10,
    day: 1,
    lastTime: 0,
    customerSpawnTimer: 0,
    
    // 桌子
    tables: [],
    
    // 厨房
    kitchen: {
        slots: [],
        upgrades: {
            cutting: 1,
            prep: 1,
            dishwashing: 1,
            stove: 1
        }
    },
    
    // 员工
    staff: {
        server: null,   // 服务员
        cashier: null,  // 收银员
        chef: null,     // 厨师
        cleaner: null   // 保洁
    },
    
    // 菜品菜单
    menu: {
        broths: [
            { id: 'broth_1', name: '麻辣锅底', price: 28, level: 1 },
            { id: 'broth_2', name: '清汤锅底', price: 22, level: 2 },
            { id: 'broth_3', name: '鸳鸯锅底', price: 38, level: 3 },
            { id: 'broth_4', name: '番茄锅底', price: 32, level: 4 },
            { id: 'broth_5', name: '菌汤锅底', price: 35, level: 5 },
        ],
        dishes: [
            { id: 'dish_1', name: '肥牛', price: 18, cost: 8 },
            { id: 'dish_2', name: '羊肉', price: 16, cost: 7 },
            { id: 'dish_3', name: '毛肚', price: 22, cost: 10 },
            { id: 'dish_4', name: '鸭血', price: 12, cost: 5 },
            { id: 'dish_5', name: '蔬菜拼盘', price: 15, cost: 5 },
            { id: 'dish_6', name: '豆腐', price: 8, cost: 3 },
            { id: 'dish_7', name: '土豆', price: 6, cost: 2 },
            { id: 'dish_8', name: '雷碧', price: 16, cost: 3 },
            { id: 'dish_9', name: '虾滑', price: 24, cost: 12 },
            { id: 'dish_10', name: '牛肉丸', price: 18, cost: 8 },
        ]
    },
    
    // 顾客
    customers: [],
    waitingQueue: [],
    waitingAreaCapacity: 4,
    
    // 订单
    orders: [],
    
    // 升级
    upgrades: {
        tables: { level: 1, maxLevel: 10 },
        tableSpeed: { level: 1, maxLevel: 10 },
        kitchen: { level: 1, maxLevel: 10 },
        waitingArea: { level: 1, maxLevel: 10 }
    },
    
    // 食材仓库
    ingredients: {
        sour: 0,    // 酸
        sweet: 0,   // 甜
        bitter: 0, // 苦
        spicy: 0,  // 辣
        salty: 0   // 咸
    },
    
    // 五味树
    flavorTrees: {
        sour: { name: '酸梅树', level: 1, production: 1 },
        sweet: { name: '甘蔗林', level: 1, production: 1 },
        bitter: { name: '苦瓜藤', level: 1, production: 1 },
        spicy: { name: '辣椒丛', level: 1, production: 1 },
        salty: { name: '盐晶矿', level: 1, production: 1 }
    },
    
    // 五味树产出计时器
    flavorTimers: {
        sour: 0,
        sweet: 0,
        bitter: 0,
        spicy: 0,
        salty: 0
    },
    
    // 新手指引
    tutorial: {
        step: 0, // 0: 未开始, 1: 点击升级, 2: 雇佣员工, 3: 完成
        completed: false
    }
};

// 顾客类型
const CUSTOMER_TYPES = [
    { name: '学生', minSpend: 30, maxSpend: 60, color: '#3498db' },
    { name: '上班族', minSpend: 50, maxSpend: 100, color: '#2ecc71' },
    { name: '家庭', minSpend: 80, maxSpend: 150, color: '#9b59b6' },
    { name: '白领', minSpend: 100, maxSpend: 200, color: '#e74c3c' },
    { name: '老板', minSpend: 200, maxSpend: 500, color: '#f39c12' },
];

// 员工数据
const STAFF_DATA = [
    { id: 'server', name: '小王', role: '服务员', wage: 50, efficiency: 1.0 },
    { id: 'cashier', name: '钱女士', role: '收银员', wage: 60, efficiency: 1.0 },
    { id: 'chef', name: '老李', role: '厨师', wage: 80, efficiency: 1.0 },
    { id: 'cleaner', name: '罗阿姨', role: '保洁', wage: 40, efficiency: 1.0 },
];

// 桌子类
class Table {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
        this.customer = null;
        this.status = 'empty'; // empty, occupied, eating, waitingCheckout, dirty
        this.order = null;
        this.food = null;
        this.eatingTimer = 0;
        this.dirtyTimer = 0;
        // 顾客动画相关
        this.customerY = y - 15; // 顾客Y位置
        this.customerOffset = 0; // 呼吸动画偏移
    }
    
    draw() {
        // 桌子
        ctx.fillStyle = this.status === 'dirty' ? '#8b4513' : '#deb887';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 桌边
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 火锅
        if (this.food) {
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 20, 0, Math.PI * 2);
            ctx.fill();
            // 蒸汽
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 - 5, this.y + this.height/2 - 25, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 顾客 - 使用新的绘制方法
        if (this.customer && this.customer.status !== 'left') {
            // 如果顾客还在移动中，绘制移动动画
            if (this.customer.moving) {
                // 绘制Q版2.5头身行走动画
                this.customer.draw(this.customer.currentX, this.customer.currentY);
            } else if (this.customer.status === 'seated' || this.customer.status === 'eating' || this.customer.status === 'waitingCheckout') {
                // 坐下后绘制静态顾客
                this.customer.draw(this.x + this.width/2, this.customerY);
                
                // 顾客名称 - 显示类型名称
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText(this.customer.type.name, this.x + this.width/2, this.customerY - 45);
                
                // 状态
                let statusText = '';
                let statusColor = '#fff';
                switch(this.status) {
                    case 'occupied': statusText = '点餐中'; statusColor = '#ffd700'; break;
                    case 'eating': statusText = '用餐中'; statusColor = '#4ecdc4'; break;
                    case 'waitingCheckout': statusText = '待结账'; statusColor = '#ff6b6b'; break;
                    case 'dirty': statusText = '待打扫'; statusColor = '#aaa'; break;
                }
                ctx.fillStyle = statusColor;
                ctx.font = '11px Microsoft YaHei';
                ctx.fillText(statusText, this.x + this.width/2, this.y + this.height + 15);
                
                // 顾客消费金额显示
                ctx.fillStyle = '#ffd700';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(`¥${this.customer.spend}`, this.x + this.width/2, this.y + this.height + 30);
            }
        }
    }
}

// 顾客类
class Customer {
    constructor() {
        const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
        this.name = type.name + Math.floor(Math.random() * 100);
        this.type = type;
        this.spend = Math.floor(Math.random() * (type.maxSpend - type.minSpend) + type.minSpend);
        this.color = type.color;
        this.patience = 100;
        
        // 移动动画相关
        this.status = 'entering'; // entering: 进入中, seated: 坐下, leaving: 离开
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = -50; // 从画布左侧外开始
        this.currentY = 0;
        this.moving = true;
        this.moveSpeed = 0.03;
        
        // Q版2.5头身动画
        this.walkFrame = 0;
        this.walkTimer = 0;
    }
    
    // 设置目标位置
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.moving = true;
    }
    
    // 开始离开
    startLeaving() {
        this.status = 'leaving';
        this.targetX = canvas.width + 50; // 从右侧离开
        this.targetY = this.currentY;
        this.moving = true;
    }
    
    // 更新移动
    update(deltaTime) {
        if (this.moving) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 2) {
                // 平滑移动
                this.currentX += dx * this.moveSpeed;
                this.currentY += dy * this.moveSpeed;
                
                // 行走动画
                this.walkTimer += deltaTime;
                if (this.walkTimer > 100) {
                    this.walkFrame = (this.walkFrame + 1) % 4;
                    this.walkTimer = 0;
                }
            } else {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.moving = false;
                
                // 到达目标
                if (this.status === 'entering') {
                    this.status = 'seated';
                } else if (this.status === 'leaving') {
                    this.status = 'left';
                }
            }
        }
    }
    
    // 绘制Q版2.5头身角色
    draw(x, y) {
        const isMobile = canvas.width < 800;
        const scale = isMobile ? 0.8 : 1;
        const baseSize = 20 * scale;
        
        // 行走时的上下摆动
        const bounce = this.moving ? Math.sin(this.walkFrame * Math.PI / 2) * 3 : 0;
        
        // 身体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.8, baseSize * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 头部（大头）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.5, baseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 脸部
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // 脚（行走动画）
        if (this.moving && this.status !== 'seated') {
            ctx.fillStyle = '#333';
            const footOffset = Math.sin(this.walkFrame * Math.PI / 2) * 5;
            ctx.beginPath();
            ctx.ellipse(x - baseSize * 0.3, y + bounce + baseSize * 0.5, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2);
            ctx.ellipse(x + baseSize * 0.3 + footOffset, y + bounce + baseSize * 0.5, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 厨房槽位
class KitchenSlot {
    constructor(id) {
        this.id = id;
        this.status = 'idle'; // idle, cooking, done
        this.progress = 0;
        this.dish = null;
    }
}

// 初始化游戏
function init() {
    // 先确保画布大小正确
    resizeCanvas();
    
    // 动态计算桌子位置（适配不同屏幕）
    const isMobile = canvas.width < 800;
    
    const tablePositions = isMobile ? [
        { x: canvas.width * 0.1, y: canvas.height * 0.3 },
        { x: canvas.width * 0.55, y: canvas.height * 0.3 },
        { x: canvas.width * 0.1, y: canvas.height * 0.55 },
        { x: canvas.width * 0.55, y: canvas.height * 0.55 },
    ] : [
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 150, y: 300 },
        { x: 350, y: 300 },
    ];
    
    // 动态设置桌子大小
    const tableWidth = isMobile ? canvas.width * 0.3 : 100;
    const tableHeight = isMobile ? canvas.height * 0.12 : 80;
    
    for (let i = 0; i < CONFIG.TABLE_COUNT; i++) {
        const table = new Table(i, tablePositions[i].x, tablePositions[i].y);
        table.width = tableWidth;
        table.height = tableHeight;
        gameState.tables.push(table);
    }
    
    // 初始化厨房槽位
    for (let i = 0; i < CONFIG.KITCHEN_SLOTS; i++) {
        gameState.kitchen.slots.push(new KitchenSlot(i));
    }
    
    // 绑定UI事件
    bindEvents();
    
    // 设置触摸事件
    setupTouchEvents();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 绑定UI事件
function bindEvents() {
    document.getElementById('btn-menu').addEventListener('click', () => showPanel('menu'));
    document.getElementById('btn-kitchen').addEventListener('click', () => showPanel('kitchen'));
    document.getElementById('btn-upgrade').addEventListener('click', () => showPanel('upgrade'));
    document.getElementById('btn-staff').addEventListener('click', () => showPanel('staff'));
    document.getElementById('btn-warehouse').addEventListener('click', () => showPanel('warehouse'));
    document.getElementById('panel-close').addEventListener('click', hidePanel);
    
    // 画布点击事件 - 使用通用处理函数
    canvas.addEventListener('click', handleCanvasClick);
    
    // 触摸事件也需要阻止默认行为
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, {passive: false});
}

// 处理画布点击
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

// 处理桌子点击
function handleTableClick(table) {
    if (table.status === 'waitingCheckout') {
        checkout(table);
        showMessage('结账成功！');
    } else if (table.status === 'dirty') {
        if (!gameState.staff.cleaner) {
            table.status = 'empty';
            table.customer = null;
            table.order = null;
            table.food = null;
            table.dirtyTimer = 0;
            showMessage('桌子已打扫干净');
        }
    }
}

// 处理厨房点击
function handleKitchenClick(slot) {
    if (slot.status === 'idle') {
        showMessage('请等待顾客点餐');
    } else if (slot.status === 'done') {
        showMessage('菜品已自动上菜');
    }
}

// 显示消息
function showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: #fff;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 16px;
        z-index: 100;
    `;
    msg.textContent = text;
    document.getElementById('game-container').appendChild(msg);
    
    setTimeout(() => msg.remove(), 2000);
}

// 显示面板
function showPanel(type) {
    const panel = document.getElementById('panel');
    const title = document.getElementById('panel-title');
    const content = document.getElementById('panel-content');
    
    panel.classList.remove('hidden');
    
    // 新手指引：点击升级面板时推进到步骤1
    if (type === 'upgrade' && gameState.tutorial.step === 0) {
        gameState.tutorial.step = 1;
    }
    
    // 新手指引：点击员工面板时推进到步骤2
    if (type === 'staff' && gameState.tutorial.step === 1) {
        gameState.tutorial.step = 2;
    }
    
    switch(type) {
        case 'menu':
            title.textContent = '菜单管理';
            content.innerHTML = renderMenuPanel();
            break;
        case 'kitchen':
            title.textContent = '厨房';
            content.innerHTML = renderKitchenPanel();
            break;
        case 'upgrade':
            title.textContent = '升级设施';
            content.innerHTML = renderUpgradePanel();
            break;
        case 'staff':
            title.textContent = '员工管理';
            content.innerHTML = renderStaffPanel();
            break;
        case 'warehouse':
            title.textContent = '食材仓库';
            content.innerHTML = renderWarehousePanel();
            break;
    }
}

// 隐藏面板
function hidePanel() {
    document.getElementById('panel').classList.add('hidden');
}

// 渲染菜单面板
function renderMenuPanel() {
    let html = '<div class="panel-section"><h4>锅底</h4><div class="item-grid">';
    for (const broth of gameState.menu.broths) {
        html += `<div class="menu-item">
            <div class="name">${broth.name}</div>
            <div class="price">¥${broth.price}</div>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>配菜</h4><div class="item-grid">';
    for (const dish of gameState.menu.dishes) {
        html += `<div class="menu-item">
            <div class="name">${dish.name}</div>
            <div class="price">¥${dish.price}</div>
        </div>`;
    }
    html += '</div></div>';
    return html;
}

// 渲染厨房面板
function renderKitchenPanel() {
    const k = gameState.kitchen;
    return `<div class="panel-section">
        <h4>厨房设施</h4>
        <div class="item-grid">
            <div class="upgrade-item">
                <div class="level">切菜区 Lv.${k.upgrades.cutting}</div>
                <div class="cost">¥${Math.pow(2, k.upgrades.cutting) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">配菜区 Lv.${k.upgrades.prep}</div>
                <div class="cost">¥${Math.pow(2, k.upgrades.prep) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">洗碗槽 Lv.${k.upgrades.dishwashing}</div>
                <div class="cost">¥${Math.pow(2, k.upgrades.dishwashing) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">灶台 Lv.${k.upgrades.stove}</div>
                <div class="cost">¥${Math.pow(2, k.upgrades.stove) * 100}</div>
            </div>
        </div>
    </div>`;
}

// 渲染升级面板
function renderUpgradePanel() {
    const u = gameState.upgrades;
    const upgrades = [
        { id: 'tables', name: '餐桌数量', level: u.tables.level, baseCost: 200, desc: '增加桌子数量' },
        { id: 'tableSpeed', name: '翻台速度', level: u.tableSpeed.level, baseCost: 150, desc: '加快顾客用餐速度' },
        { id: 'kitchen', name: '厨房效率', level: u.kitchen.level, baseCost: 250, desc: '加快烹饪速度' },
        { id: 'waitingArea', name: '等候区', level: u.waitingArea.level, baseCost: 100, desc: '增加等候座位' },
    ];
    
    let html = '<div class="panel-section"><h4>店铺设施</h4><div class="item-grid">';
    for (const upg of upgrades) {
        const cost = Math.pow(2, upg.level) * upg.baseCost;
        const maxed = upg.level >= 10;
        const btnClass = maxed ? 'maxed-btn' : 'upgrade-btn';
        const btnText = maxed ? '已满级' : `升级 ¥${cost}`;
        html += `<div class="upgrade-item" data-upgrade-id="${upg.id}">
            <div class="level">${upg.name} Lv.${upg.level}</div>
            <div class="desc">${upg.desc}</div>
            <button class="${btnClass}" data-upgrade-id="${upg.id}" ${maxed ? 'disabled' : ''}>${btnText}</button>
        </div>`;
    }
    html += '</div></div>';
    
    // 绑定升级事件 - 使用直接绑定方式
    setTimeout(() => {
        const buttons = document.querySelectorAll('.upgrade-btn');
        buttons.forEach(btn => {
            // 移除旧的事件监听器
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const upgradeId = this.getAttribute('data-upgrade-id');
                purchaseUpgrade(upgradeId);
            });
        });
    }, 0);
    
    return html;
}

// 购买升级
function purchaseUpgrade(upgradeId) {
    const upgrade = gameState.upgrades[upgradeId];
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) {
        showMessage('已达到最高等级');
        return;
    }
    
    const baseCosts = { tables: 200, tableSpeed: 150, kitchen: 250, waitingArea: 100 };
    const cost = Math.pow(2, upgrade.level) * baseCosts[upgradeId];
    
    if (gameState.gold < cost) {
        showMessage('金币不足，需要 ' + cost + ' 金币');
        return;
    }
    
    // 扣除金币并升级
    gameState.gold -= cost;
    upgrade.level++;
    
    // 应用升级效果
    applyUpgradeEffect(upgradeId);
    
    // 立即更新UI
    updateUI();
    
    showMessage(`${upgradeId === 'tables' ? '餐桌数量' : upgradeId === 'tableSpeed' ? '翻台速度' : upgradeId === 'kitchen' ? '厨房效率' : '等候区'}升级到 Lv.${upgrade.level}！`);
    
    // 刷新面板
    showPanel('upgrade');
}

// 应用升级效果
function applyUpgradeEffect(upgradeId) {
    switch(upgradeId) {
        case 'tables':
            // 增加桌子
            addTable();
            break;
        case 'tableSpeed':
            // 翻台速度已在 updateTables 中使用
            break;
        case 'kitchen':
            // 厨房效率已在 updateKitchen 中使用
            break;
        case 'waitingArea':
            // 等候区容量增加
            gameState.waitingAreaCapacity = 4 + gameState.upgrades.waitingArea.level * 2;
            break;
    }
}

// 添加新桌子
function addTable() {
    const isMobile = canvas.width < 800;
    const tableCount = gameState.tables.length;
    const cols = 4;
    const row = Math.floor(tableCount / cols);
    const col = tableCount % cols;
    
    const tableWidth = isMobile ? canvas.width * 0.3 : 100;
    const tableHeight = isMobile ? canvas.height * 0.12 : 80;
    const spacing = isMobile ? canvas.width * 0.35 : 150;
    const rowSpacing = isMobile ? canvas.height * 0.22 : 130;
    
    const x = isMobile ? canvas.width * 0.1 + col * spacing : 150 + col * spacing;
    const y = isMobile ? canvas.height * 0.25 + row * rowSpacing : 150 + row * rowSpacing;
    
    const table = new Table(tableCount, x, y);
    table.width = tableWidth;
    table.height = tableHeight;
    gameState.tables.push(table);
}

// 渲染员工面板
function renderStaffPanel() {
    let html = '<div class="panel-section"><h4>员工列表</h4><div class="item-grid">';
    for (const s of STAFF_DATA) {
        const hired = gameState.staff[s.id] !== null;
        const btnClass = hired ? 'hired-btn' : 'hire-btn';
        const btnText = hired ? '已雇佣' : `雇佣 ¥${s.wage}`;
        html += `<div class="staff-item" data-staff-id="${s.id}">
            <div class="role">${s.name} - ${s.role}</div>
            <div class="wage">日薪: ¥${s.wage}/天</div>
            <button class="${btnClass}" data-staff-id="${s.id}" ${hired ? 'disabled' : ''}>${btnText}</button>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>员工状态</h4>';
    for (const s of STAFF_DATA) {
        const staff = gameState.staff[s.id];
        if (staff) {
            const statusText = getStaffStatusText(s.id);
            html += `<div class="staff-status">
                <span class="staff-name">${s.name}:</span>
                <span class="staff-work">${statusText}</span>
            </div>`;
        }
    }
    html += '</div>';
    
    // 绑定雇佣事件 - 使用直接绑定方式
    setTimeout(() => {
        const buttons = document.querySelectorAll('.hire-btn');
        buttons.forEach(btn => {
            // 移除旧的事件监听器
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const staffId = this.getAttribute('data-staff-id');
                hireStaff(staffId);
            });
        });
    }, 0);
    
    return html;
}

// 获取员工状态文本
function getStaffStatusText(staffId) {
    switch(staffId) {
        case 'server': return '等待上菜...';
        case 'cashier': return '等待结账...';
        case 'chef': return '等待烹饪...';
        case 'cleaner': return '等待打扫...';
        default: return '工作中';
    }
}

// 雇佣员工
function hireStaff(staffId) {
    const staffData = STAFF_DATA.find(s => s.id === staffId);
    if (!staffData) return;
    
    if (gameState.staff[staffId]) {
        showMessage('该员工已被雇佣');
        return;
    }
    
    if (gameState.gold < staffData.wage) {
        showMessage('金币不足，需要 ' + staffData.wage + ' 金币');
        return;
    }
    
    // 扣除金币
    gameState.gold -= staffData.wage;
    
    // 雇佣员工
    gameState.staff[staffId] = {
        ...staffData,
        hired: true,
        dailyWage: staffData.wage
    };
    
    // 立即更新UI
    updateUI();
    
    showMessage(`成功雇佣 ${staffData.name}！`);
    
    // 新手指引：雇佣员工后推进到步骤3
    if (gameState.tutorial.step === 2) {
        gameState.tutorial.step = 3;
        // 3秒后完成指引
        setTimeout(() => {
            gameState.tutorial.completed = true;
        }, 3000);
    }
    
    // 刷新面板
    showPanel('staff');
}

// 渲染仓库面板
function renderWarehousePanel() {
    const flavors = [
        { id: 'sour', name: '酸', icon: '🍋', color: '#f1c40f' },
        { id: 'sweet', name: '甜', icon: '🍬', color: '#e91e63' },
        { id: 'bitter', name: '苦', icon: '🥬', color: '#27ae60' },
        { id: 'spicy', name: '辣', icon: '🌶️', color: '#e74c3c' },
        { id: 'salty', name: '咸', icon: '🧂', color: '#3498db' },
    ];
    
    // 菜品合成配方
    const recipes = [
        { name: '酸辣汤', ingredients: { sour: 2, spicy: 1 }, price: 25 },
        { name: '糖醋里脊', ingredients: { sweet: 2, sour: 1 }, price: 28 },
        { name: '苦瓜炒蛋', ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        { name: '麻辣火锅', ingredients: { spicy: 3, salty: 1 }, price: 45 },
        { name: '盐水鸭', ingredients: { salty: 2, sweet: 1 }, price: 30 },
    ];
    
    let html = '<div class="panel-section"><h4>五味树</h4><div class="item-grid">';
    for (const f of flavors) {
        const tree = gameState.flavorTrees[f.id];
        const cost = Math.pow(2, tree.level) * 50;
        html += `<div class="flavor-item">
            <div class="flavor-icon" style="color: ${f.color}">${f.icon}</div>
            <div class="flavor-name">${f.name}</div>
            <div class="flavor-count">库存: ${gameState.ingredients[f.id]}</div>
            <div class="flavor-level">等级: ${tree.level}</div>
            <button class="upgrade-btn" data-flavor="${f.id}">升级 ¥${cost}</button>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>食材合成</h4><div class="item-grid">';
    for (const recipe of recipes) {
        const canCraft = Object.entries(recipe.ingredients).every(([flavor, need]) => 
            gameState.ingredients[flavor] >= need
        );
        const btnClass = canCraft ? 'craft-btn' : 'disabled-btn';
        const btnText = canCraft ? '合成' : '材料不足';
        const ingredientsText = Object.entries(recipe.ingredients)
            .map(([f, n]) => `${flavors.find(fv => fv.id === f).icon}${n}`)
            .join('+');
        html += `<div class="recipe-item">
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-ingredients">${ingredientsText}</div>
            <div class="recipe-price">售价: ¥${recipe.price}</div>
            <button class="${btnClass}" data-recipe="${recipe.name}">${btnText}</button>
        </div>`;
    }
    html += '</div></div>';
    
    // 绑定事件
    setTimeout(() => {
        document.querySelectorAll('.flavor-item .upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                upgradeFlavorTree(btn.dataset.flavor);
            });
        });
        document.querySelectorAll('.recipe-item .craft-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                craftDish(btn.dataset.recipe);
            });
        });
    }, 0);
    
    return html;
}

// 升级五味树
function upgradeFlavorTree(flavorId) {
    const tree = gameState.flavorTrees[flavorId];
    const cost = Math.pow(2, tree.level) * 50;
    
    if (gameState.gold < cost) {
        showMessage('金币不足，需要 ' + cost + ' 金币');
        return;
    }
    
    gameState.gold -= cost;
    tree.level++;
    tree.production = tree.level;
    
    // 立即产出一些食材
    gameState.ingredients[flavorId] += tree.level * 2;
    
    showMessage(`${tree.name} 升级到 Lv.${tree.level}！`);
    showPanel('warehouse');
}

// 合成菜品
function craftDish(recipeName) {
    const recipes = {
        '酸辣汤': { ingredients: { sour: 2, spicy: 1 }, price: 25 },
        '糖醋里脊': { ingredients: { sweet: 2, sour: 1 }, price: 28 },
        '苦瓜炒蛋': { ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        '麻辣火锅': { ingredients: { spicy: 3, salty: 1 }, price: 45 },
        '盐水鸭': { ingredients: { salty: 2, sweet: 1 }, price: 30 },
    };
    
    const recipe = recipes[recipeName];
    if (!recipe) return;
    
    // 检查材料是否足够
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        if (gameState.ingredients[flavor] < need) {
            showMessage('材料不足');
            return;
        }
    }
    
    // 消耗材料
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        gameState.ingredients[flavor] -= need;
    }
    
    // 获得金币
    gameState.gold += recipe.price;
    
    showMessage(`合成 ${recipeName} 成功！获得 ¥${recipe.price}`);
    showPanel('warehouse');
}

// 生成顾客
function spawnCustomer() {
    // 找空桌子
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    
    if (emptyTable) {
        // 有空桌子，从左侧进入
        const customer = new Customer();
        customer.status = 'entering';
        
        // 计算目标位置（桌子旁边）
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        // 设置桌子的顾客
        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        
        // 自动生成订单
        generateOrder(emptyTable);
    } else if (gameState.waitingQueue.length < gameState.waitingAreaCapacity) {
        // 桌子满了，去等候区排队
        const customer = new Customer();
        customer.status = 'waiting';
        // 等候区位置
        customer.currentX = -50;
        customer.currentY = canvas.height / 2 + 100;
        gameState.waitingQueue.push(customer);
    }
    // 等候区满了则不生成
}

// 将排队的顾客安排到空桌子
function seatWaitingCustomer() {
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    if (emptyTable && gameState.waitingQueue.length > 0) {
        const customer = gameState.waitingQueue.shift();
        customer.status = 'entering';
        
        // 计算目标位置
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        
        // 自动生成订单
        generateOrder(emptyTable);
        return true;
    }
    return false;
}

// 生成订单
function generateOrder(table) {
    const broth = gameState.menu.broths[Math.floor(Math.random() * gameState.menu.broths.length)];
    const dishCount = Math.floor(Math.random() * 4) + 2;
    const dishes = [];
    for (let i = 0; i < dishCount; i++) {
        dishes.push(gameState.menu.dishes[Math.floor(Math.random() * gameState.menu.dishes.length)]);
    }
    
    table.order = {
        broth: broth,
        dishes: dishes,
        total: broth.price + dishes.reduce((sum, d) => sum + d.price, 0)
    };
    
    // 开始烹饪
    startCooking(table);
}

// 开始烹饪
function startCooking(table) {
    const freeSlot = gameState.kitchen.slots.find(s => s.status === 'idle');
    if (!freeSlot) return;
    
    freeSlot.status = 'cooking';
    freeSlot.dish = table.order;
    freeSlot.progress = 0;
    freeSlot.tableId = table.id;
}

// 更新游戏状态
function update(deltaTime) {
    // 生成顾客
    gameState.customerSpawnTimer += deltaTime;
    if (gameState.customerSpawnTimer >= CONFIG.CUSTOMER_SPAWN_INTERVAL) {
        gameState.customerSpawnTimer = 0;
        spawnCustomer();
    }
    
    // 尝试安排等候区的顾客到空桌子
    seatWaitingCustomer();
    
    // 员工自动工作
    staffAutoWork();
    
    // 更新厨房
    updateKitchen(deltaTime);
    
    // 更新桌子状态
    updateTables(deltaTime);
    
    // 五味树自动产出（每10秒产出一次）
    updateFlavorTrees(deltaTime);
    
    // 更新UI
    updateUI();
}

// 五味树自动产出
function updateFlavorTrees(deltaTime) {
    const PRODUCTION_INTERVAL = 10000; // 10秒
    
    for (const flavor in gameState.flavorTimers) {
        gameState.flavorTimers[flavor] += deltaTime;
        if (gameState.flavorTimers[flavor] >= PRODUCTION_INTERVAL) {
            gameState.flavorTimers[flavor] = 0;
            // 产出食材
            const tree = gameState.flavorTrees[flavor];
            gameState.ingredients[flavor] += tree.production;
        }
    }
}

// 员工自动工作系统
function staffAutoWork() {
    // 1. 收银员自动结账
    if (gameState.staff.cashier) {
        for (const table of gameState.tables) {
            if (table.status === 'waitingCheckout') {
                checkout(table);
                break; // 每帧只处理一桌
            }
        }
    }
    
    // 2. 厨师自动烹饪
    if (gameState.staff.chef) {
        // 找需要烹饪的桌子
        for (const table of gameState.tables) {
            if (table.status === 'occupied' && table.order && !table.food) {
                const freeSlot = gameState.kitchen.slots.find(s => s.status === 'idle');
                if (freeSlot) {
                    startCooking(table);
                    break;
                }
            }
        }
    }
    
    // 3. 服务员自动上菜
    if (gameState.staff.server) {
        for (const slot of gameState.kitchen.slots) {
            if (slot.status === 'done' && slot.dish) {
                const table = gameState.tables.find(t => t.id === slot.tableId);
                if (table) {
                    table.food = slot.dish;
                    table.status = 'eating';
                    table.eatingTimer = 0;
                }
                // 重置槽位
                slot.status = 'idle';
                slot.progress = 0;
                slot.dish = null;
                break;
            }
        }
    }
    
    // 4. 保洁自动打扫
    if (gameState.staff.cleaner) {
        for (const table of gameState.tables) {
            if (table.status === 'dirty') {
                // 保洁自动打扫
                const cleanSpeed = 1 + (gameState.staff.cleaner.efficiency - 1) * 0.5;
                table.dirtyTimer += 16 * cleanSpeed; // 假设每帧约16ms
                if (table.dirtyTimer >= CONFIG.CLEANING_DURATION) {
                    table.status = 'empty';
                    table.customer = null;
                    table.order = null;
                    table.food = null;
                    table.dirtyTimer = 0;
                }
                break; // 每帧只处理一桌
            }
        }
    }
}

// 更新厨房
function updateKitchen(deltaTime) {
    const cookingSpeed = 1 + (gameState.kitchen.upgrades.stove - 1) * 0.3;
    
    for (const slot of gameState.kitchen.slots) {
        if (slot.status === 'cooking') {
            slot.progress += deltaTime / CONFIG.COOKING_DURATION * cookingSpeed * 100;
            if (slot.progress >= 100) {
                slot.status = 'done';
                
                // 如果没有服务员，系统自动上菜
                if (!gameState.staff.server) {
                    const table = gameState.tables.find(t => t.id === slot.tableId);
                    if (table) {
                        table.food = slot.dish;
                        table.status = 'eating';
                        table.eatingTimer = 0;
                    }
                    // 重置槽位
                    setTimeout(() => {
                        slot.status = 'idle';
                        slot.progress = 0;
                        slot.dish = null;
                    }, 500);
                }
                // 如果有服务员，等待服务员来上菜（在staffAutoWork中处理）
            }
        }
    }
}

// 更新桌子状态
function updateTables(deltaTime) {
    const eatingSpeed = 1 + (gameState.upgrades.tableSpeed.level - 1) * 0.2;
    
    for (const table of gameState.tables) {
        if (table.status === 'eating') {
            table.eatingTimer += deltaTime * eatingSpeed;
            if (table.eatingTimer >= CONFIG.EATING_DURATION) {
                // 顾客开始离开
                if (table.customer) {
                    table.customer.startLeaving();
                }
                table.status = 'waitingCheckout';
                // 如果没有收银员，系统自动结账
                if (!gameState.staff.cashier) {
                    setTimeout(() => checkout(table), 500);
                }
            }
        } else if (table.status === 'dirty') {
            // 如果没有保洁，系统自动打扫
            if (!gameState.staff.cleaner) {
                table.dirtyTimer += deltaTime;
                if (table.dirtyTimer >= CONFIG.CLEANING_DURATION) {
                    table.status = 'empty';
                    table.customer = null;
                    table.order = null;
                    table.food = null;
                    table.dirtyTimer = 0;
                }
            }
        }
        
        // 更新顾客位置
        if (table.customer && table.customer.status !== 'left') {
            table.customer.update(deltaTime);
            
            // 如果顾客已离开，清除
            if (table.customer.status === 'left') {
                table.customer = null;
            }
        }
    }
}

// 结账
function checkout(table) {
    if (table.order) {
        gameState.gold += table.order.total;
    }
    table.status = 'dirty';
}

// 更新UI
function updateUI() {
    document.getElementById('gold-display').textContent = gameState.gold;
    document.getElementById('gem-display').textContent = gameState.gems;
    document.getElementById('day-display').textContent = gameState.day;
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地板
    drawFloor();
    
    // 绘制厨房区域
    drawKitchen();
    
    // 绘制桌子
    for (const table of gameState.tables) {
        table.draw();
    }
    
    // 绘制等待区
    drawWaitingArea();
    
    // 绘制厨房进度
    drawKitchenProgress();
    
    // 绘制员工
    drawStaff();
    
    // 绘制新手指引
    drawTutorialHint();
}

// 员工状态
const staffAnimations = {
    server: { x: 280, y: 250, targetX: 280, targetY: 250, walkFrame: 0, walkTimer: 0 },
    cashier: { x: 450, y: 250, targetX: 450, targetY: 250, walkFrame: 0, walkTimer: 0 },
    chef: { x: 700, y: 300, targetX: 700, targetY: 300, walkFrame: 0, walkTimer: 0 },
    cleaner: { x: 350, y: 380, targetX: 350, targetY: 380, walkFrame: 0, walkTimer: 0 },
};

// 绘制员工
function drawStaff() {
    const isMobile = canvas.width < 800;
    const scale = isMobile ? 0.8 : 1;
    
    // 绘制已雇佣的员工
    for (const [id, staff] of Object.entries(gameState.staff)) {
        if (!staff) continue;
        
        // 获取或初始化动画状态
        let anim = staffAnimations[id];
        if (!anim) {
            anim = { 
                x: isMobile ? canvas.width * 0.25 : 280,
                y: isMobile ? canvas.height * 0.45 : 250,
                targetX: 0, 
                targetY: 0, 
                walkFrame: 0, 
                walkTimer: 0,
                moving: false
            };
            staffAnimations[id] = anim;
        }
        
        // 员工随机移动（模拟工作）
        if (!anim.moving && Math.random() < 0.01) {
            // 随机移动到新位置
            const range = 50;
            anim.targetX = anim.x + (Math.random() - 0.5) * range;
            anim.targetY = anim.y + (Math.random() - 0.5) * range;
            anim.moving = true;
        }
        
        // 移动动画
        if (anim.moving) {
            const dx = anim.targetX - anim.x;
            const dy = anim.targetY - anim.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 1) {
                anim.x += dx * 0.05;
                anim.y += dy * 0.05;
                
                // 行走动画
                anim.walkTimer += 16;
                if (anim.walkTimer > 100) {
                    anim.walkFrame = (anim.walkFrame + 1) % 4;
                    anim.walkTimer = 0;
                }
            } else {
                anim.moving = false;
            }
        }
        
        let x = anim.x;
        let y = anim.y;
        
        // 移动端位置调整
        if (isMobile) {
            switch(id) {
                case 'server':
                    x = canvas.width * 0.25;
                    y = canvas.height * 0.45;
                    break;
                case 'cashier':
                    x = canvas.width * 0.75;
                    y = canvas.height * 0.45;
                    break;
                case 'chef':
                    x = canvas.width * 0.5;
                    y = canvas.height * 0.8;
                    break;
                case 'cleaner':
                    x = canvas.width * 0.5;
                    y = canvas.height * 0.5;
                    break;
            }
        }
        
        // Q版2.5头身员工绘制
        const baseSize = 15 * scale;
        
        // 行走时的上下摆动
        const bounce = anim.moving ? Math.sin(anim.walkFrame * Math.PI / 2) * 2 : 0;
        
        // 身体
        ctx.fillStyle = '#3498db'; // 蓝色工作服
        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.7, baseSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 围裙 - 金色/围裙标识
        ctx.fillStyle = '#f39c12'; // 金色围裙
        ctx.fillRect(x - baseSize * 0.5, y + bounce - baseSize * 0.2, baseSize, baseSize * 0.7);
        
        // 头部
        ctx.fillStyle = '#ffd93d'; // 黄色皮肤
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.4, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // 头发/帽子（根据角色）
        if (id === 'chef') {
            // 厨师帽
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - baseSize * 0.6, y + bounce - baseSize * 2.2, baseSize * 1.2, baseSize * 0.6);
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 2.2, baseSize * 0.6, Math.PI, 0);
            ctx.fill();
        } else {
            // 员工帽子
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 1.8, baseSize * 0.7, Math.PI, 0);
            ctx.fill();
        }
        
        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.25, y + bounce - baseSize * 1.4, baseSize * 0.1, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.25, y + bounce - baseSize * 1.4, baseSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // 脚
        if (anim.moving) {
            ctx.fillStyle = '#333';
            const footOffset = Math.sin(anim.walkFrame * Math.PI / 2) * 3;
            ctx.beginPath();
            ctx.ellipse(x - baseSize * 0.2, y + bounce + baseSize * 0.4, baseSize * 0.2, baseSize * 0.12, 0, 0, Math.PI * 2);
            ctx.ellipse(x + baseSize * 0.2 + footOffset, y + bounce + baseSize * 0.4, baseSize * 0.2, baseSize * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.ellipse(x - baseSize * 0.2, y + baseSize * 0.4, baseSize * 0.2, baseSize * 0.12, 0, 0, Math.PI * 2);
            ctx.ellipse(x + baseSize * 0.2, y + baseSize * 0.4, baseSize * 0.2, baseSize * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 员工名称标签
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${10 * scale}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        ctx.fillText(staff.name, x, y - baseSize * 2.5);
        
        // 员工角色标识
        ctx.fillStyle = '#4ecdc4';
        ctx.font = `${8 * scale}px Microsoft YaHei`;
        ctx.fillText(staff.role, x, y + baseSize * 1.2);
    }
}

// 绘制新手指引
function drawTutorialHint() {
    const tutorial = gameState.tutorial;
    
    // 如果已完成，不显示指引
    if (tutorial.completed) return;
    
    const isMobile = canvas.width < 800;
    let hint = '';
    let targetX = 0;
    let targetY = 0;
    
    switch(tutorial.step) {
        case 0:
            // 初始状态，提示点击升级按钮
            hint = '点击下方"升级"按钮来升级设施！';
            targetX = canvas.width / 2;
            targetY = canvas.height - 120;
            break;
        case 1:
            // 已点击升级，提示升级餐桌
            hint = '点击"餐桌数量"升级来增加桌子！';
            targetX = isMobile ? canvas.width * 0.3 : 350;
            targetY = isMobile ? canvas.height * 0.4 : 200;
            break;
        case 2:
            // 已升级餐桌，提示雇佣员工
            hint = '点击"员工"雇佣服务员来自动工作！';
            targetX = canvas.width / 2;
            targetY = canvas.height - 120;
            break;
        case 3:
            // 提示开始游戏
            hint = '恭喜！开始经营你的火锅店吧！';
            targetX = canvas.width / 2;
            targetY = canvas.height / 2;
            break;
    }
    
    if (!hint) return;
    
    // 绘制指引气泡
    const padding = 10;
    ctx.font = 'bold 14px Microsoft YaHei';
    const textWidth = ctx.measureText(hint).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 40;
    const boxX = targetX - boxWidth / 2;
    const boxY = targetY - 50;
    
    // 气泡背景
    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    
    // 圆角矩形
    const radius = 10;
    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxWidth - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
    ctx.lineTo(boxX + radius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 气泡箭头
    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    ctx.beginPath();
    ctx.moveTo(targetX - 10, targetY - 10);
    ctx.lineTo(targetX + 10, targetY - 10);
    ctx.lineTo(targetX, targetY - 5);
    ctx.closePath();
    ctx.fill();
    
    // 气泡文字
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(hint, targetX, boxY + 26);
}

// 绘制地板
function drawFloor() {
    const isMobile = canvas.width < 800;
    
    if (isMobile) {
        // 移动端地板占满整个画布上半部分
        const floorX = canvas.width * 0.05;
        const floorY = canvas.height * 0.08;
        const floorW = canvas.width * 0.9;
        const floorH = canvas.height * 0.55;
        
        ctx.fillStyle = '#3d3d54';
        ctx.fillRect(floorX, floorY, floorW, floorH);
        
        ctx.strokeStyle = '#4d4d64';
        ctx.lineWidth = 2;
        ctx.strokeRect(floorX, floorY, floorW, floorH);
    } else {
        // 桌面端固定坐标
        ctx.fillStyle = '#3d3d54';
        ctx.fillRect(50, 80, 500, 400);
        
        ctx.strokeStyle = '#4d4d64';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 80, 500, 400);
    }
}

// 绘制厨房
function drawKitchen() {
    // 移动端厨房区域动态计算
    const isMobile = canvas.width < 800;
    const kitchenX = isMobile ? canvas.width * 0.05 : 600;
    const kitchenW = isMobile ? canvas.width * 0.9 : 250;
    const kitchenY = isMobile ? canvas.height * 0.7 : 80;
    const kitchenH = isMobile ? canvas.height * 0.25 : 400;
    
    // 厨房区域背景
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(kitchenX, kitchenY, kitchenW, kitchenH);
    
    // 厨房标题
    ctx.fillStyle = '#ff6b6b';
    ctx.font = `bold ${isMobile ? 16 : 20}px Microsoft YaHei`;
    ctx.textAlign = 'center';
    ctx.fillText('厨房', kitchenX + kitchenW / 2, kitchenY + 20);
    
    // 灶台
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slot = gameState.kitchen.slots[i];
        const slotX = kitchenX + kitchenW * 0.1 + i * (kitchenW * 0.4);
        const slotY = kitchenY + kitchenH * 0.3;
        const slotW = kitchenW * 0.35;
        const slotH = kitchenH * 0.3;
        
        // 灶台
        ctx.fillStyle = slot.status === 'cooking' ? '#ff4444' : '#666';
        ctx.fillRect(slotX, slotY, slotW, slotH);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(slotX, slotY, slotW, slotH);
        
        // 进度条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(slotX, slotY + slotH + 5, slotW, 8);
        
        // 进度条
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(slotX, slotY + slotH + 5, slotW * (slot.progress / 100), 8);
        
        // 状态文字
        ctx.fillStyle = '#fff';
        ctx.font = `${isMobile ? 10 : 12}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        let statusText = '空闲';
        if (slot.status === 'cooking') statusText = '烹饪中';
        if (slot.status === 'done') statusText = '已完成';
        ctx.fillText(statusText, slotX + slotW / 2, slotY + slotH + 22);
    }
}

// 绘制厨房进度
function drawKitchenProgress() {
    // 已经在 drawKitchen 中绘制
}

// 绘制等待区
function drawWaitingArea() {
    const isMobile = canvas.width < 800;
    
    if (isMobile) {
        // 移动端不显示等待区（屏幕太小）
        return;
    }
    
    const waitX = 900;
    const waitY = 80;
    const waitW = 250;
    const waitH = 200;
    
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(waitX, waitY, waitW, waitH);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`等候区 (${gameState.waitingQueue.length}/${gameState.waitingAreaCapacity})`, waitX + waitW / 2, waitY + 30);
    
    // 显示排队的顾客
    for (let i = 0; i < Math.min(gameState.waitingQueue.length, 6); i++) {
        const x = waitX + 30 + (i % 3) * 60;
        const y = waitY + 60 + Math.floor(i / 3) * 50;
        
        // 顾客
        ctx.fillStyle = gameState.waitingQueue[i].color;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 顾客名称
        ctx.fillStyle = '#fff';
        ctx.font = '10px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.waitingQueue[i].name.substring(0, 2), x, y + 25);
    }
    
    // 等待椅（空位）
    for (let i = gameState.waitingQueue.length; i < Math.min(gameState.waitingAreaCapacity, 6); i++) {
        const x = waitX + 30 + (i % 3) * 60;
        const y = waitY + 60 + Math.floor(i / 3) * 50;
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 游戏主循环
function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    
    if (deltaTime < 100) { // 避免过大的时间跳跃
        update(deltaTime);
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

// 启动游戏
init();

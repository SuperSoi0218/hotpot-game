// 火锅店经营游戏 - 完整动线系统

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 响应式画布大小
function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    const container = document.getElementById('game-container');
    
    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.style.width = '100vw';
        container.style.height = '100vh';
    } else {
        canvas.width = 1200;
        canvas.height = 700;
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
    
    if (gameState.tables.length > 0) {
        initTables();
    }
}

// 初始化餐桌位置
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

// 移动端触摸事件支持
function setupTouchEvents() {
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
    
    handleCanvasClickAt(x, y);
}

// 点击处理函数
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

function handleCanvasClickAt(x, y) {
    // 检查是否点击了餐桌
    for (const table of gameState.tables) {
        if (x >= table.x && x <= table.x + table.width &&
            y >= table.y && y <= table.y + table.height) {
            handleTableClick(table);
            return;
        }
    }
    
    // 检查厨房区域
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
    
    // 检查收银台区域
    if (x >= cashierArea.x && x <= cashierArea.x + cashierArea.width &&
        y >= cashierArea.y && y <= cashierArea.y + cashierArea.height) {
        showMessage('收银台 - 顾客结账区域');
        return;
    }
}

// 游戏配置
const CONFIG = {
    FPS: 60,
    TABLE_COUNT: 4,
    KITCHEN_SLOTS: 2,
    CUSTOMER_SPAWN_INTERVAL: 5000,
    EATING_DURATION: 8000,
    COOKING_DURATION: 5000,
    CLEANING_DURATION: 3000,
};

// 门店关键区域位置 - 2D正面视角
const storeAreas = {
    entrance: { x: 1100, y: 380 },      // 正门入口（右侧）
    exit: { x: 1100, y: 380 },          // 出口（同入口）
    waitingArea: { x: 1050, y: 350 },   // 等候区（右侧门口）
    cashier: { x: 600, y: 350 },         // 收银台位置（中部）
    kitchen: { x: 600, y: 80 },          // 厨房区域（顶部中央）
    serverStation: { x: 200, y: 350 },  // 服务员岗位（左侧）
    cleanerRoom: { x: 150, y: 450 },    // 保洁员储藏室
};

// 收银台区域
const cashierArea = {
    x: 480,
    y: 400,
    width: 80,
    height: 60
};

// 游戏状态
const gameState = {
    gold: 500,
    gems: 10,
    day: 1,
    lastTime: 0,
    customerSpawnTimer: 0,
    
    tables: [],
    kitchen: {
        slots: [],
        upgrades: { cutting: 1, prep: 1, dishwashing: 1, stove: 1 }
    },
    
    staff: {
        server: null,
        cashier: null,
        chef: null,
        cleaner: null
    },
    
    menu: {
        broths: [
            { id: 'broth_1', name: '麻辣红汤', price: 28, level: 1 },
            { id: 'broth_2', name: '番茄汤底', price: 22, level: 2 },
            { id: 'broth_3', name: '菌汤锅底', price: 38, level: 3 },
            { id: 'broth_4', name: '鸳鸯锅底', price: 32, level: 4 },
            { id: 'broth_5', name: '骨汤锅底', price: 35, level: 5 },
        ],
        dishes: [
            { id: 'dish_1', name: '肥牛', price: 18, cost: 8 },
            { id: 'dish_2', name: '羊肉', price: 16, cost: 7 },
            { id: 'dish_3', name: '毛肚', price: 22, cost: 10 },
            { id: 'dish_4', name: '鸭血', price: 12, cost: 5 },
            { id: 'dish_5', name: '蔬菜拼盘', price: 15, cost: 5 },
            { id: 'dish_6', name: '豆腐', price: 8, cost: 3 },
            { id: 'dish_7', name: '土豆', price: 6, cost: 2 },
            { id: 'dish_8', name: '面条', price: 16, cost: 3 },
            { id: 'dish_9', name: '虾滑', price: 24, cost: 12 },
            { id: 'dish_10', name: '午餐肉', price: 18, cost: 8 },
        ]
    },
    
    customers: [],
    waitingQueue: [],
    waitingAreaCapacity: 4,
    
    orders: [],
    
    upgrades: {
        tables: { level: 1, maxLevel: 10 },
        tableSpeed: { level: 1, maxLevel: 10 },
        kitchen: { level: 1, maxLevel: 10 },
        waitingArea: { level: 1, maxLevel: 10 }
    },
    
    ingredients: {
        sour: 10, sweet: 10, bitter: 10, spicy: 10, salty: 10
    },
    
    flavorTrees: {
        sour: { name: '酸梅树', level: 1, production: 1 },
        sweet: { name: '甜枣树', level: 1, production: 1 },
        bitter: { name: '苦丁树', level: 1, production: 1 },
        spicy: { name: '辣椒树', level: 1, production: 1 },
        salty: { name: '盐碱树', level: 1, production: 1 }
    },
    
    flavorTimers: {
        sour: 0, sweet: 0, bitter: 0, spicy: 0, salty: 0
    },
    
    tutorial: {
        step: 0,
        completed: false
    }
};

// 顾客类型
const CUSTOMER_TYPES = [
    { name: '学生', minSpend: 30, maxSpend: 60, color: '#3498db' },
    { name: '白领', minSpend: 50, maxSpend: 100, color: '#2ecc71' },
    { name: '家庭', minSpend: 80, maxSpend: 150, color: '#9b59b6' },
    { name: '白领', minSpend: 100, maxSpend: 200, color: '#e74c3c' },
    { name: '老板', minSpend: 200, maxSpend: 500, color: '#f39c12' },
];

// 员工数据
const STAFF_DATA = [
    { id: 'server', name: '小王', role: '服务员', wage: 50, efficiency: 1.0, color: '#e74c3c' },
    { id: 'cashier', name: '小李', role: '收银员', wage: 60, efficiency: 1.0, color: '#3498db' },
    { id: 'chef', name: '老张', role: '厨师', wage: 80, efficiency: 1.0, color: '#f39c12' },
    { id: 'cleaner', name: '老吴', role: '保洁', wage: 40, efficiency: 1.0, color: '#2ecc71' },
];

// 餐桌类
class Table {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
        this.customer = null;
        this.status = 'empty';
        this.order = null;
        this.food = null;
        this.eatingTimer = 0;
        this.dirtyTimer = 0;
        this.customerY = y - 15;
        this.customerOffset = 0;
    }
    
    draw() {
        // 餐桌
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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 - 5, this.y + this.height/2 - 25, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 顾客
        if (this.customer && this.customer.status !== 'left') {
            if (this.customer.moving) {
                this.customer.draw(this.customer.currentX, this.customer.currentY);
            } else if (this.customer.status === 'seated' || this.customer.status === 'eating' || 
                       this.customer.status === 'waitingCheckout' || this.customer.status === 'toCashier') {
                this.customer.draw(this.x + this.width/2, this.customerY);
                
                // 顾客名称
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText(this.customer.type.name, this.x + this.width/2, this.customerY - 45);
                
                // 状态
                let statusText = '';
                let statusColor = '#fff';
                switch(this.status) {
                    case 'occupied': statusText = '点单中'; statusColor = '#ffd700'; break;
                    case 'eating': statusText = '用餐中'; statusColor = '#4ecdc4'; break;
                    case 'waitingCheckout': statusText = '待结账'; statusColor = '#ff6b6b'; break;
                    case 'dirty': statusText = '待打扫'; statusColor = '#aaa'; break;
                    case 'toCashier': statusText = '去结账'; statusColor = '#ff9f43'; break;
                }
                ctx.fillStyle = statusColor;
                ctx.font = '11px Microsoft YaHei';
                ctx.fillText(statusText, this.x + this.width/2, this.y + this.height + 15);
                
                // 消费金额
                ctx.fillStyle = '#ffd700';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(`¥${this.customer.spend}`, this.x + this.width/2, this.y + this.height + 30);
            }
        }
    }
}

// 顾客类 - 完整动线系统
class Customer {
    constructor() {
        const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
        this.name = type.name + Math.floor(Math.random() * 100);
        this.type = type;
        this.spend = Math.floor(Math.random() * (type.maxSpend - type.minSpend) + type.minSpend);
        this.color = type.color;
        this.patience = 100;
        
        // 状态：entering(进店) -> seekingSeat(找座) -> seated(落座) -> ordering(点单) 
        //       -> waitingFood(等餐) -> eating(用餐) -> toCashier(去结账) -> leaving(离开) -> left(消失)
        this.status = 'entering';
        
        // 位置
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = -50;
        this.currentY = storeAreas.waitingArea.y;
        this.moving = true;
        this.moveSpeed = 0.025;
        
        // 动画
        this.walkFrame = 0;
        this.walkTimer = 0;
        
        // 当前服务的餐桌
        this.table = null;
    }
    
    // 设置目标位置
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.moving = true;
    }
    
    // 开始离开流程 - 去收银台结账
    startCheckout() {
        this.status = 'toCashier';
        // 目标：收银台
        this.setTarget(cashierArea.x + cashierArea.width/2, cashierArea.y - 20);
    }
    
    // 开始离开
    startLeaving() {
        this.status = 'leaving';
        // 从右侧出口离开
        this.setTarget(canvas.width + 80, this.currentY);
    }
    
    // 更新移动
    update(deltaTime) {
        if (this.moving) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 3) {
                // 平滑移动
                this.currentX += dx * this.moveSpeed;
                this.currentY += dy * this.moveSpeed;
                
                // 走路动画
                this.walkTimer += deltaTime;
                if (this.walkTimer > 100) {
                    this.walkFrame = (this.walkFrame + 1) % 4;
                    this.walkTimer = 0;
                }
            } else {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.moving = false;
                
                // 到达目标后的状态处理
                this.handleArrival();
            }
        }
    }
    
    // 到达目标后的处理
    handleArrival() {
        switch(this.status) {
            case 'entering':
                this.status = 'seated';
                break;
            case 'toCashier':
                // 到达收银台，可以结账了
                if (this.table) {
                    checkout(this.table);
                    this.startLeaving();
                }
                break;
            case 'leaving':
                this.status = 'left';
                break;
        }
    }
    
    // 绘制Q版2.5头身角色
    draw(x, y) {
        const isMobile = canvas.width < 800;
        const scale = isMobile ? 0.8 : 1;
        const baseSize = 20 * scale;
        
        // 走路时的上下浮动
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
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼珠
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // 脚（走路动画）
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
        this.status = 'idle';
        this.progress = 0;
        this.dish = null;
    }
}

// 员工动画系统
const staffAnimations = {
    server: { 
        x: 280, y: 250, 
        targetX: 280, targetY: 250, 
        walkFrame: 0, walkTimer: 0,
        moving: false,
        task: null,
        taskTarget: null
    },
    cashier: { 
        x: 520, y: 440, 
        targetX: 520, targetY: 440, 
        walkFrame: 0, walkTimer: 0,
        moving: false,
        task: null
    },
    chef: { 
        x: 750, y: 200, 
        targetX: 750, targetY: 200, 
        walkFrame: 0, walkTimer: 0,
        moving: false,
        task: null,
        taskTarget: null
    },
    cleaner: { 
        x: 150, y: 420, 
        targetX: 150, targetY: 420, 
        walkFrame: 0, walkTimer: 0,
        moving: false,
        task: null,
        taskTarget: null
    },
};

// 初始化游戏
function init() {
    resizeCanvas();
    
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
    
    const tableWidth = isMobile ? canvas.width * 0.3 : 100;
    const tableHeight = isMobile ? canvas.height * 0.12 : 80;
    
    for (let i = 0; i < CONFIG.TABLE_COUNT; i++) {
        const table = new Table(i, tablePositions[i].x, tablePositions[i].y);
        table.width = tableWidth;
        table.height = tableHeight;
        gameState.tables.push(table);
    }
    
    for (let i = 0; i < CONFIG.KITCHEN_SLOTS; i++) {
        gameState.kitchen.slots.push(new KitchenSlot(i));
    }
    
    // 初始化收银台区域
    if (!isMobile) {
        cashierArea.x = 480;
        cashierArea.y = 400;
        cashierArea.width = 80;
        cashierArea.height = 60;
    } else {
        cashierArea.x = canvas.width * 0.4;
        cashierArea.y = canvas.height * 0.6;
        cashierArea.width = canvas.width * 0.2;
        cashierArea.height = canvas.height * 0.1;
    }
    
    bindEvents();
    setupTouchEvents();
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
    
    document.getElementById('panel').addEventListener('click', function(e) {
        if(e.target.id === 'panel') hidePanel();
    });
    
    canvas.addEventListener('click', handleCanvasClick);
    
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

// 处理餐桌点击
function handleTableClick(table) {
    if (table.status === 'waitingCheckout') {
        // 手动结账
        checkout(table);
        showMessage('结账成功');
    } else if (table.status === 'dirty') {
        if (!gameState.staff.cleaner) {
            table.status = 'empty';
            table.customer = null;
            table.order = null;
            table.food = null;
            table.dirtyTimer = 0;
            showMessage('餐桌已打扫干净');
        }
    } else if (table.status === 'toCashier') {
        // 引导顾客去结账
        if (table.customer) {
            table.customer.startCheckout();
        }
    }
}

// 处理厨房点击
function handleKitchenClick(slot) {
    if (slot.status === 'idle') {
        showMessage('请等待顾客点单');
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
    
    if (type === 'upgrade' && gameState.tutorial.step === 0) {
        gameState.tutorial.step = 1;
    }
    
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
    html += '</div></div><div class="panel-section"><h4>食材</h4><div class="item-grid">';
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
    let html = '<div class="panel-section"><h4>烹饪槽位</h4>';
    for (const slot of gameState.kitchen.slots) {
        const statusText = slot.status === 'idle' ? '空闲' : 
                          slot.status === 'cooking' ? `烹饪中 ${Math.floor(slot.progress)}%` : 
                          '已完成';
        html += `<div class="staff-status">
            <span>槽位 ${slot.id + 1}</span>
            <span class="staff-work">${statusText}</span>
        </div>`;
    }
    html += '</div>';
    return html;
}

// 渲染升级面板
function renderUpgradePanel() {
    const upgrades = [
        { id: 'tables', name: '餐桌数量', desc: '增加餐桌数量' },
        { id: 'tableSpeed', name: '用餐速度', desc: '加快顾客用餐速度' },
        { id: 'kitchen', name: '厨房效率', desc: '加快烹饪速度' },
        { id: 'waitingArea', name: '等候区', desc: '增加排队容量' },
    ];
    
    let html = '<div class="panel-section"><div class="item-grid">';
    for (const upg of upgrades) {
        const upgrade = gameState.upgrades[upg.id];
        const cost = Math.pow(2, upgrade.level) * 100;
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        
        html += `<div class="upgrade-item">
            <div class="level">${upg.name} Lv.${upgrade.level}</div>
            <div class="desc">${upg.desc}</div>
            <div class="cost">${isMaxed ? '已满级' : '¥' + cost}</div>
            <button class="${isMaxed ? 'maxed-btn' : 'upgrade-btn'}" data-upgrade="${upg.id}" ${isMaxed ? 'disabled' : ''}>
                ${isMaxed ? '已满级' : '升级'}
            </button>
        </div>`;
    }
    html += '</div></div>';
    
    setTimeout(() => {
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                upgrade(btn.dataset.upgrade);
            });
        });
    }, 0);
    
    return html;
}

// 升级功能
function upgrade(upgradeId) {
    const upgrade = gameState.upgrades[upgradeId];
    if (upgrade.level >= upgrade.maxLevel) {
        showMessage('已满级');
        return;
    }
    
    const cost = Math.pow(2, upgrade.level) * 100;
    if (gameState.gold < cost) {
        showMessage('金币不足');
        return;
    }
    
    gameState.gold -= cost;
    upgrade.level++;
    showMessage('升级成功');
    updateUI();
    showPanel('upgrade');
}

// 渲染员工面板
function renderStaffPanel() {
    let html = '<div class="panel-section"><h4>已雇佣员工</h4>';
    
    let hasStaff = false;
    for (const [id, staff] of Object.entries(gameState.staff)) {
        if (staff) {
            hasStaff = true;
            html += `<div class="staff-status">
                <span class="staff-name">${staff.name}</span>
                <span class="staff-work">${getStaffStatusText(id)}</span>
            </div>`;
        }
    }
    
    if (!hasStaff) {
        html += '<div style="color:#aaa;text-align:center;padding:20px;">暂无员工</div>';
    }
    
    html += '</div><div class="panel-section"><h4>可雇佣员工</h4><div class="item-grid">';
    
    for (const staff of STAFF_DATA) {
        const isHired = gameState.staff[staff.id];
        html += `<div class="staff-item">
            <div class="role">${staff.name} - ${staff.role}</div>
            <div class="wage">日薪: ¥${staff.wage}</div>
            <button class="${isHired ? 'hired-btn' : 'hire-btn'}" data-staff-id="${staff.id}" ${isHired ? 'disabled' : ''}>
                ${isHired ? '已雇佣' : '雇佣'}
            </button>
        </div>`;
    }
    html += '</div></div>';
    
    setTimeout(() => {
        document.querySelectorAll('.hire-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                hireStaff(this.dataset.staffId);
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
        case 'cleaner': return '等待清洁...';
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
        showMessage('金币不足，需要' + staffData.wage + ' 金币');
        return;
    }
    
    gameState.gold -= staffData.wage;
    
    gameState.staff[staffId] = {
        ...staffData,
        hired: true,
        dailyWage: staffData.wage
    };
    
    updateUI();
    showMessage(`成功雇佣 ${staffData.name}！`);
    
    if (gameState.tutorial.step === 2) {
        gameState.tutorial.step = 3;
        setTimeout(() => {
            gameState.tutorial.completed = true;
        }, 3000);
    }
    
    showPanel('staff');
}

// 渲染仓库面板
function renderWarehousePanel() {
    const flavors = [
        { id: 'sour', name: '酸', icon: '🍋', color: '#f1c40f' },
        { id: 'sweet', name: '甜', icon: '🍓', color: '#e91e63' },
        { id: 'bitter', name: '苦', icon: '🥬', color: '#27ae60' },
        { id: 'spicy', name: '辣', icon: '🌶️', color: '#e74c3c' },
        { id: 'salty', name: '咸', icon: '🧂', color: '#3498db' },
    ];
    
    const recipes = [
        { name: '酸辣汤锅', ingredients: { sour: 2, spicy: 1 }, price: 25 },
        { name: '番茄肥牛锅', ingredients: { sweet: 2, sour: 1 }, price: 28 },
        { name: '苦瓜豆腐', ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        { name: '麻辣红汤', ingredients: { spicy: 3, salty: 1 }, price: 45 },
        { name: '盐水菜心', ingredients: { salty: 2, sweet: 1 }, price: 30 },
    ];
    
    let html = '<div class="panel-section"><h4>调味树</h4><div class="item-grid">';
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

// 升级调味树
function upgradeFlavorTree(flavorId) {
    const tree = gameState.flavorTrees[flavorId];
    const cost = Math.pow(2, tree.level) * 50;
    
    if (gameState.gold < cost) {
        showMessage('金币不足，需要' + cost + ' 金币');
        return;
    }
    
    gameState.gold -= cost;
    tree.level++;
    tree.production = tree.level;
    gameState.ingredients[flavorId] += tree.level * 2;
    
    showMessage(`${tree.name} 升级到 Lv.${tree.level}！`);
    showPanel('warehouse');
}

// 合成菜品
function craftDish(recipeName) {
    const recipes = {
        '酸辣汤锅': { ingredients: { sour: 2, spicy: 1 }, price: 25 },
        '番茄肥牛锅': { ingredients: { sweet: 2, sour: 1 }, price: 28 },
        '苦瓜豆腐': { ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        '麻辣红汤': { ingredients: { spicy: 3, salty: 1 }, price: 45 },
        '盐水菜心': { ingredients: { salty: 2, sweet: 1 }, price: 30 },
    };
    
    const recipe = recipes[recipeName];
    if (!recipe) return;
    
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        if (gameState.ingredients[flavor] < need) {
            showMessage('材料不足');
            return;
        }
    }
    
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        gameState.ingredients[flavor] -= need;
    }
    
    gameState.gold += recipe.price;
    
    showMessage(`合成 ${recipeName} 成功，获得¥${recipe.price}`);
    showPanel('warehouse');
}

// 生成顾客
function spawnCustomer() {
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    
    if (emptyTable) {
        const customer = new Customer();
        customer.status = 'entering';
        
        // 计算目标位置：从 entrance 进入 -> 座位
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        customer.table = emptyTable;
        
        generateOrder(emptyTable);
    } else if (gameState.waitingQueue.length < gameState.waitingAreaCapacity) {
        const customer = new Customer();
        customer.status = 'waiting';
        customer.currentX = storeAreas.waitingArea.x;
        customer.currentY = storeAreas.waitingArea.y;
        gameState.waitingQueue.push(customer);
    }
}

// 安排排队顾客到空座位
function seatWaitingCustomer() {
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    if (emptyTable && gameState.waitingQueue.length > 0) {
        const customer = gameState.waitingQueue.shift();
        customer.status = 'entering';
        
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        customer.table = emptyTable;
        
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
    
    // 安排排队顾客
    seatWaitingCustomer();
    
    // 员工自动工作
    staffAutoWork();
    
    // 更新厨房
    updateKitchen(deltaTime);
    
    // 更新餐桌状态
    updateTables(deltaTime);
    
    // 调味树自动产出
    updateFlavorTrees(deltaTime);
    
    // 更新UI
    updateUI();
}

// 调味树自动产出
function updateFlavorTrees(deltaTime) {
    const PRODUCTION_INTERVAL = 10000;
    for (const flavor in gameState.flavorTimers) {
        gameState.flavorTimers[flavor] += deltaTime;
        if (gameState.flavorTimers[flavor] >= PRODUCTION_INTERVAL) {
            gameState.flavorTimers[flavor] = 0;
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
                // 引导顾客去收银台
                if (table.customer && table.customer.status !== 'toCashier') {
                    table.customer.startCheckout();
                }
                break;
            }
        }
    }
    
    // 2. 厨师自动烹饪
    if (gameState.staff.chef) {
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
                slot.status = 'idle';
                slot.progress = 0;
                slot.dish = null;
                break;
            }
        }
    }
    
    // 4. 保洁员自动清洁
    if (gameState.staff.cleaner) {
        for (const table of gameState.tables) {
            if (table.status === 'dirty') {
                const cleanSpeed = 1 + (gameState.staff.cleaner.efficiency - 1) * 0.5;
                table.dirtyTimer += 16 * cleanSpeed;
                if (table.dirtyTimer >= CONFIG.CLEANING_DURATION) {
                    table.status = 'empty';
                    table.customer = null;
                    table.order = null;
                    table.food = null;
                    table.dirtyTimer = 0;
                }
                break;
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
                
                if (!gameState.staff.server) {
                    const table = gameState.tables.find(t => t.id === slot.tableId);
                    if (table) {
                        table.food = slot.dish;
                        table.status = 'eating';
                        table.eatingTimer = 0;
                    }
                    setTimeout(() => {
                        slot.status = 'idle';
                        slot.progress = 0;
                        slot.dish = null;
                    }, 500);
                }
            }
        }
    }
}

// 更新餐桌状态
function updateTables(deltaTime) {
    const eatingSpeed = 1 + (gameState.upgrades.tableSpeed.level - 1) * 0.2;
    
    for (const table of gameState.tables) {
        if (table.status === 'eating') {
            table.eatingTimer += deltaTime * eatingSpeed;
            if (table.eatingTimer >= CONFIG.EATING_DURATION) {
                if (table.customer) {
                    table.customer.startCheckout();
                }
                table.status = 'waitingCheckout';
                
                if (!gameState.staff.cashier) {
                    setTimeout(() => {
                        if (table.customer && table.customer.status === 'waitingCheckout') {
                            table.customer.startCheckout();
                        }
                    }, 500);
                }
            }
        } else if (table.status === 'dirty') {
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
        showMessage(`结账成功，获得¥${table.order.total}`);
    }
    table.status = 'dirty';
    table.order = null;
    table.food = null;
    
    // 顾客离开
    if (table.customer) {
        table.customer.startLeaving();
    }
}

// 更新UI
function updateUI() {
    document.getElementById('gold-display').textContent = gameState.gold;
    document.getElementById('gem-display').textContent = gameState.gems;
    document.getElementById('day-display').textContent = gameState.day;
}

// 渲染游戏
function render() {
    // 清空画布 - 暖黄色调背景
    ctx.fillStyle = '#3d3d5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地板
    drawFloor();
    
    // 绘制厨房区域
    drawKitchen();
    
    // 绘制收银台
    drawCashier();
    
    // 绘制餐桌
    for (const table of gameState.tables) {
        table.draw();
    }
    
    // 绘制等候区
    drawWaitingArea();
    
    // 绘制厨房进度
    drawKitchenProgress();
    
    // 绘制员工
    drawStaff();
    
    // 绘制新手引导
    drawTutorialHint();
}

// 绘制地板
function drawFloor() {
    const isMobile = canvas.width < 800;
    
    // 地板底色
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 主通道
    ctx.fillStyle = '#5a5a7a';
    const corridorY = isMobile ? canvas.height * 0.4 : 280;
    ctx.fillRect(0, corridorY, canvas.width, 100);
    
    // 地板网格线
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = isMobile ? 40 : 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 45度视角装饰线
    ctx.strokeStyle = 'rgba(255, 180, 80, 0.15)';
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width + canvas.height; i += gridSize * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
    }
}

// 绘制厨房
function drawKitchen() {
    const isMobile = canvas.width < 800;
    const kitchenX = isMobile ? canvas.width * 0.3 : 600;
    const kitchenY = isMobile ? canvas.height * 0.05 : 50;
    const kitchenWidth = isMobile ? canvas.width * 0.4 : 400;
    const kitchenHeight = isMobile ? canvas.height * 0.2 : 150;
    
    // 厨房背景
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(kitchenX, kitchenY, kitchenWidth, kitchenHeight);
    
    // 厨房边框
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.strokeRect(kitchenX, kitchenY, kitchenWidth, kitchenHeight);
    
    // 厨房标签
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('厨房', kitchenX + kitchenWidth/2, kitchenY + 20);
    
    // 灶台
    const stoveWidth = kitchenWidth / 3;
    for (let i = 0; i < 3; i++) {
        const stoveX = kitchenX + 20 + i * (stoveWidth + 10);
        const stoveY = kitchenY + 40;
        
        ctx.fillStyle = '#444';
        ctx.fillRect(stoveX, stoveY, stoveWidth - 20, 60);
        
        // 灶眼
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(stoveX + (stoveWidth - 20)/2, stoveY + 30, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 火焰效果
        if (gameState.kitchen.slots[i] && gameState.kitchen.slots[i].status === 'cooking') {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(stoveX + (stoveWidth - 20)/2, stoveY + 30, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(stoveX + (stoveWidth - 20)/2, stoveY + 25, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 绘制收银台
function drawCashier() {
    // 收银台底座
    ctx.fillStyle = '#5d4e37';
    ctx.fillRect(cashierArea.x, cashierArea.y, cashierArea.width, cashierArea.height);
    
    // 收银台边框
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(cashierArea.x, cashierArea.y, cashierArea.width, cashierArea.height);
    
    // 收银机
    ctx.fillStyle = '#333';
    ctx.fillRect(cashierArea.x + 10, cashierArea.y - 20, cashierArea.width - 20, 30);
    
    // 屏幕
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(cashierArea.x + 15, cashierArea.y - 15, cashierArea.width - 30, 15);
    
    // 标签
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('收银台', cashierArea.x + cashierArea.width/2, cashierArea.y + cashierArea.height/2 + 5);
}

// 绘制等候区
function drawWaitingArea() {
    // 店外等候区背景
    ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
    ctx.fillRect(0, 280, 80, 140);
    
    // 等候区标签
    ctx.fillStyle = '#ffd700';
    ctx.font = '12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('等候区', 40, 300);
    
    // 排队人数
    const waitCount = gameState.waitingQueue.length;
    ctx.fillStyle = '#fff';
    ctx.font = '14px Microsoft YaHei';
    ctx.fillText(`排队: ${waitCount}/${gameState.waitingAreaCapacity}`, 40, 380);
    
    // 绘制排队顾客
    for (let i = 0; i < gameState.waitingQueue.length; i++) {
        const customer = gameState.waitingQueue[i];
        const queueY = 340 + i * 30;
        customer.draw(40, queueY);
    }
}

// 绘制厨房进度
function drawKitchenProgress() {
    const isMobile = canvas.width < 800;
    const kitchenX = isMobile ? canvas.width * 0.3 : 600;
    const kitchenY = isMobile ? canvas.height * 0.05 : 50;
    const kitchenWidth = isMobile ? canvas.width * 0.4 : 400;
    
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slot = gameState.kitchen.slots[i];
        if (slot.status === 'cooking') {
            const barX = kitchenX + 20 + i * (kitchenWidth / 3 + 10);
            const barY = isMobile ? canvas.height * 0.22 : 120;
            const barWidth = kitchenWidth / 3 - 20;
            
            // 进度条背景
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barWidth, 10);
            
            // 进度条
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(barX, barY, barWidth * (slot.progress / 100), 10);
        }
    }
}

// 绘制员工
function drawStaff() {
    const isMobile = canvas.width < 800;
    const scale = isMobile ? 0.8 : 1;
    
    // 绘制已雇佣的员工
    for (const [id, staff] of Object.entries(gameState.staff)) {
        if (!staff) continue;
        
        let anim = staffAnimations[id];
        if (!anim) continue;
        
        // 员工随机移动（模拟工作）
        if (!anim.moving && Math.random() < 0.005) {
            const range = 30;
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
                anim.x += dx * 0.03;
                anim.y += dy * 0.03;
                
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
                    y = canvas.height * 0.65;
                    break;
                case 'chef':
                    x = canvas.width * 0.5;
                    y = canvas.height * 0.2;
                    break;
                case 'cleaner':
                    x = canvas.width * 0.15;
                    y = canvas.height * 0.65;
                    break;
            }
        }
        
        const baseSize = 15 * scale;
        const bounce = anim.moving ? Math.sin(anim.walkFrame * Math.PI / 2) * 2 : 0;
        
        // 身体
        ctx.fillStyle = staff.color;
        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.7, baseSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 围裙
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x - baseSize * 0.5, y + bounce - baseSize * 0.2, baseSize, baseSize * 0.7);
        
        // 头部
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.4, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // 帽子/头巾
        if (id === 'chef') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - baseSize * 0.6, y + bounce - baseSize * 2.2, baseSize * 1.2, baseSize * 0.6);
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 2.2, baseSize * 0.6, Math.PI, 0);
            ctx.fill();
        } else {
            ctx.fillStyle = staff.color;
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 1.8, baseSize * 0.7, Math.PI, 0);
            ctx.fill();
        }
        
        // 员工名称标签
        ctx.fillStyle = '#fff';
        ctx.font = '10px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(staff.name, x, y + bounce + baseSize * 1.2);
    }
}

// 绘制新手引导
function drawTutorialHint() {
    if (gameState.tutorial.completed) return;
    
    let hint = '';
    switch(gameState.tutorial.step) {
        case 0: hint = '点击"升级"按钮升级设施'; break;
        case 1: hint = '点击"员工"雇佣服务员'; break;
        case 2: hint = '雇佣员工来经营火锅店！'; break;
        default: return;
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height - 80, 300, 40);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(hint, canvas.width/2, canvas.height - 55);
}

// 游戏主循环
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (deltaTime < 100) { // 防止过大的deltaTime
        update(deltaTime);
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// 启动游戏
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resizeCanvas);
// 幸福路的火锅店 - 游戏主逻辑

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 响应式画布大小
function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 手机上使用窗口大小
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // 电脑上是固定大小
        canvas.width = 1200;
        canvas.height = 700;
        // 限制最大宽度
        if (window.innerWidth < 1200) {
            canvas.width = window.innerWidth * 0.95;
            canvas.height = canvas.width * 0.583;
        }
    }
}

// 页面加载时和窗口大小改变时调整画布大小
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// 移动端点击延迟修复
if ('ontouchstart' in window) {
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, {passive: false});
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
    
    // 订单
    orders: [],
    
    // 升级
    upgrades: {
        tables: { level: 1, maxLevel: 10 },
        tableSpeed: { level: 1, maxLevel: 10 },
        kitchen: { level: 1, maxLevel: 10 },
        waitingArea: { level: 1, maxLevel: 10 }
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
        
        // 顾客
        if (this.customer) {
            ctx.fillStyle = this.customer.color;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y - 15, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // 顾客名称
            ctx.fillStyle = '#fff';
            ctx.font = '12px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText(this.customer.name, this.x + this.width/2, this.y - 40);
            
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
            ctx.fillText(statusText, this.x + this.width/2, this.y + this.height + 15);
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
    // 初始化桌子
    const tablePositions = [
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 150, y: 300 },
        { x: 350, y: 300 },
    ];
    
    for (let i = 0; i < CONFIG.TABLE_COUNT; i++) {
        gameState.tables.push(new Table(i, tablePositions[i].x, tablePositions[i].y));
    }
    
    // 初始化厨房槽位
    for (let i = 0; i < CONFIG.KITCHEN_SLOTS; i++) {
        gameState.kitchen.slots.push(new KitchenSlot(i));
    }
    
    // 绑定UI事件
    bindEvents();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 绑定UI事件
function bindEvents() {
    document.getElementById('btn-menu').addEventListener('click', () => showPanel('menu'));
    document.getElementById('btn-kitchen').addEventListener('click', () => showPanel('kitchen'));
    document.getElementById('btn-upgrade').addEventListener('click', () => showPanel('upgrade'));
    document.getElementById('btn-staff').addEventListener('click', () => showPanel('staff'));
    document.getElementById('panel-close').addEventListener('click', hidePanel);
    
    // 画布点击事件
    canvas.addEventListener('click', handleCanvasClick);
}

// 处理画布点击
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检查是否点击了桌子
    for (const table of gameState.tables) {
        if (x >= table.x && x <= table.x + table.width &&
            y >= table.y && y <= table.y + table.height) {
            handleTableClick(table);
            return;
        }
    }
    
    // 检查是否点击了厨房槽位
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slotX = 630 + i * 100;
        const slotY = 150;
        if (x >= slotX && x <= slotX + 80 && y >= slotY && y <= slotY + 60) {
            handleKitchenClick(gameState.kitchen.slots[i]);
            return;
        }
    }
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
    return `<div class="panel-section">
        <h4>店铺设施</h4>
        <div class="item-grid">
            <div class="upgrade-item">
                <div class="level">餐桌数量 Lv.${u.tables.level}</div>
                <div class="cost">¥${Math.pow(2, u.tables.level) * 200}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">翻台速度 Lv.${u.tableSpeed.level}</div>
                <div class="cost">¥${Math.pow(2, u.tableSpeed.level) * 150}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">厨房效率 Lv.${u.kitchen.level}</div>
                <div class="cost">¥${Math.pow(2, u.kitchen.level) * 250}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">等候区 Lv.${u.waitingArea.level}</div>
                <div class="cost">¥${Math.pow(2, u.waitingArea.level) * 100}</div>
            </div>
        </div>
    </div>`;
}

// 渲染员工面板
function renderStaffPanel() {
    let html = '<div class="panel-section"><h4>员工列表</h4><div class="item-grid">';
    for (const s of STAFF_DATA) {
        const hired = gameState.staff[s.id] !== null;
        html += `<div class="staff-item">
            <div class="role">${s.name} - ${s.role}</div>
            <div class="wage">日薪: ¥${s.wage}</div>
            ${hired ? '<div class="hired">已雇佣</div>' : `<div class="cost">点击雇佣</div>`}
        </div>`;
    }
    html += '</div></div>';
    return html;
}

// 生成顾客
function spawnCustomer() {
    // 找空桌子
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    if (!emptyTable) return;
    
    const customer = new Customer();
    emptyTable.customer = customer;
    emptyTable.status = 'occupied';
    
    // 自动生成订单
    generateOrder(emptyTable);
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
    
    // 更新厨房
    updateKitchen(deltaTime);
    
    // 更新桌子状态
    updateTables(deltaTime);
    
    // 更新UI
    updateUI();
}

// 更新厨房
function updateKitchen(deltaTime) {
    const cookingSpeed = 1 + (gameState.kitchen.upgrades.stove - 1) * 0.3;
    
    for (const slot of gameState.kitchen.slots) {
        if (slot.status === 'cooking') {
            slot.progress += deltaTime / CONFIG.COOKING_DURATION * cookingSpeed * 100;
            if (slot.progress >= 100) {
                slot.status = 'done';
                // 上菜
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
                table.status = 'waitingCheckout';
                // 自动结账
                checkout(table);
            }
        } else if (table.status === 'dirty') {
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
}

// 绘制地板
function drawFloor() {
    // 地板纹理
    ctx.fillStyle = '#3d3d54';
    ctx.fillRect(50, 80, 500, 400);
    
    // 地板边缘
    ctx.strokeStyle = '#4d4d64';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 80, 500, 400);
}

// 绘制厨房
function drawKitchen() {
    // 厨房区域背景
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(600, 80, 250, 400);
    
    // 厨房标题
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 20px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('厨房', 725, 110);
    
    // 灶台
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slot = gameState.kitchen.slots[i];
        const x = 630 + i * 100;
        const y = 150;
        
        // 灶台
        ctx.fillStyle = slot.status === 'cooking' ? '#ff4444' : '#666';
        ctx.fillRect(x, y, 80, 60);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 80, 60);
        
        // 进度条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y + 70, 80, 10);
        
        // 进度条
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(x, y + 70, 80 * (slot.progress / 100), 10);
        
        // 状态文字
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        let statusText = '空闲';
        if (slot.status === 'cooking') statusText = '烹饪中';
        if (slot.status === 'done') statusText = '已完成';
        ctx.fillText(statusText, x + 40, y + 95);
    }
}

// 绘制厨房进度
function drawKitchenProgress() {
    // 已经在 drawKitchen 中绘制
}

// 绘制等待区
function drawWaitingArea() {
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(900, 80, 250, 200);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('等候区', 1025, 110);
    
    // 等待椅
    for (let i = 0; i < 6; i++) {
        const x = 930 + (i % 3) * 60;
        const y = 140 + Math.floor(i / 3) * 50;
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

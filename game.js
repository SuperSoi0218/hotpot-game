// 鐏攨搴楃粡钀ユ父鎴?- 瀹屾暣鍔ㄧ嚎绯荤粺

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 鍝嶅簲寮忕敾甯冨ぇ灏?function resizeCanvas() {
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

// 鍒濆鍖栭妗屼綅缃?function initTables() {
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

// 绉诲姩绔Е鎽镐簨浠舵敮鎸?function setupTouchEvents() {
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

// 鐐瑰嚮澶勭悊鍑芥暟
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

function handleCanvasClickAt(x, y) {
    // 妫€鏌ユ槸鍚︾偣鍑讳簡椁愭
    for (const table of gameState.tables) {
        if (x >= table.x && x <= table.x + table.width &&
            y >= table.y && y <= table.y + table.height) {
            handleTableClick(table);
            return;
        }
    }
    
    // 妫€鏌ュ帹鎴垮尯鍩?    const kitchenX = canvas.width * 0.5;
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
    
    // 妫€鏌ユ敹閾跺彴鍖哄煙
    if (x >= cashierArea.x && x <= cashierArea.x + cashierArea.width &&
        y >= cashierArea.y && y <= cashierArea.y + cashierArea.height) {
        showMessage('鏀堕摱鍙?- 椤惧缁撹处鍖哄煙');
        return;
    }
}

// 娓告垙閰嶇疆
const CONFIG = {
    FPS: 60,
    TABLE_COUNT: 4,
    KITCHEN_SLOTS: 2,
    CUSTOMER_SPAWN_INTERVAL: 5000,
    EATING_DURATION: 8000,
    COOKING_DURATION: 5000,
    CLEANING_DURATION: 3000,
};

// 闂ㄥ簵鍏抽敭鍖哄煙浣嶇疆 - 2D姝ｉ潰瑙嗚
const storeAreas = {
    entrance: { x: 1050, y: 400 },      // 姝ｉ棬鍏ュ彛锛堝彸渚э級
    exit: { x: 1050, y: 400 },          // 鍑哄彛锛堝悓鍏ュ彛锛?    waitingArea: { x: 1050, y: 380 },   // 绛夊€欏尯锛堝彸渚ч棬鍙ｏ級
    cashier: { x: 600, y: 400 },         // 鏀堕摱鍙颁綅缃紙涓儴锛?    kitchen: { x: 600, y: 80 },          // 鍘ㄦ埧鍖哄煙锛堥《閮ㄤ腑澶級
    serverStation: { x: 150, y: 400 },    // 鏈嶅姟鍛樺矖浣嶏紙宸︿晶锛?    cleanerRoom: { x: 150, y: 500 },     // 淇濇磥鍛樺偍钘忓
};

// 鏀堕摱鍙板尯鍩?- 2D姝ｉ潰瑙嗚
const cashierArea = {
    x: 550,
    y: 380,
    width: 100,
    height: 60
};

// 娓告垙鐘舵€?const gameState = {
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
        server: { name: '小王', role: '服务员', wage: 50, efficiency: 1.0 },
        cashier: { name: '钱女士', role: '收银员', wage: 60, efficiency: 1.0 },
        chef: { name: '老李', role: '厨师', wage: 80, efficiency: 1.0 },
        cleaner: { name: '罗阿姨', role: '保洁', wage: 40, efficiency: 1.0 }
    },
    
    menu: {
        broths: [
            { id: 'broth_1', name: '楹昏荆绾㈡堡', price: 28, level: 1 },
            { id: 'broth_2', name: '鐣寗姹ゅ簳', price: 22, level: 2 },
            { id: 'broth_3', name: '鑿屾堡閿呭簳', price: 38, level: 3 },
            { id: 'broth_4', name: '楦抽腐閿呭簳', price: 32, level: 4 },
            { id: 'broth_5', name: '楠ㄦ堡閿呭簳', price: 35, level: 5 },
        ],
        dishes: [
            { id: 'dish_1', name: '鑲ョ墰', price: 18, cost: 8 },
            { id: 'dish_2', name: '缇婅倝', price: 16, cost: 7 },
            { id: 'dish_3', name: '姣涜倸', price: 22, cost: 10 },
            { id: 'dish_4', name: '楦', price: 12, cost: 5 },
            { id: 'dish_5', name: '钄彍鎷肩洏', price: 15, cost: 5 },
            { id: 'dish_6', name: '璞嗚厫', price: 8, cost: 3 },
            { id: 'dish_7', name: '鍦熻眴', price: 6, cost: 2 },
            { id: 'dish_8', name: '闈㈡潯', price: 16, cost: 3 },
            { id: 'dish_9', name: '铏炬粦', price: 24, cost: 12 },
            { id: 'dish_10', name: '鍗堥鑲?, price: 18, cost: 8 },
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
        sour: { name: '閰告鏍?, level: 1, production: 1 },
        sweet: { name: '鐢滄灒鏍?, level: 1, production: 1 },
        bitter: { name: '鑻︿竵鏍?, level: 1, production: 1 },
        spicy: { name: '杈ｆ鏍?, level: 1, production: 1 },
        salty: { name: '鐩愮⒈鏍?, level: 1, production: 1 }
    },
    
    flavorTimers: {
        sour: 0, sweet: 0, bitter: 0, spicy: 0, salty: 0
    },
    
    tutorial: {
        step: 0,
        completed: false
    }
};

// 椤惧绫诲瀷
const CUSTOMER_TYPES = [
    { name: '瀛︾敓', minSpend: 30, maxSpend: 60, color: '#3498db' },
    { name: '鐧介', minSpend: 50, maxSpend: 100, color: '#2ecc71' },
    { name: '瀹跺涵', minSpend: 80, maxSpend: 150, color: '#9b59b6' },
    { name: '鐧介', minSpend: 100, maxSpend: 200, color: '#e74c3c' },
    { name: '鑰佹澘', minSpend: 200, maxSpend: 500, color: '#f39c12' },
];

// 鍛樺伐鏁版嵁
const STAFF_DATA = [
    { id: 'server', name: '灏忕帇', role: '鏈嶅姟鍛?, wage: 50, efficiency: 1.0, color: '#e74c3c' },
    { id: 'cashier', name: '灏忔潕', role: '鏀堕摱鍛?, wage: 60, efficiency: 1.0, color: '#3498db' },
    { id: 'chef', name: '鑰佸紶', role: '鍘ㄥ笀', wage: 80, efficiency: 1.0, color: '#f39c12' },
    { id: 'cleaner', name: '鑰佸惔', role: '淇濇磥', wage: 40, efficiency: 1.0, color: '#2ecc71' },
];

// 椁愭绫?class Table {
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
        // 椁愭
        ctx.fillStyle = this.status === 'dirty' ? '#8b4513' : '#deb887';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 妗岃竟
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 鐏攨
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
        
        // 椤惧
        if (this.customer && this.customer.status !== 'left') {
            if (this.customer.moving) {
                this.customer.draw(this.customer.currentX, this.customer.currentY);
            } else if (this.customer.status === 'seated' || this.customer.status === 'eating' || 
                       this.customer.status === 'waitingCheckout' || this.customer.status === 'toCashier') {
                this.customer.draw(this.x + this.width/2, this.customerY);
                
                // 椤惧鍚嶇О
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText(this.customer.type.name, this.x + this.width/2, this.customerY - 45);
                
                // 鐘舵€?                let statusText = '';
                let statusColor = '#fff';
                switch(this.status) {
                    case 'occupied': statusText = '鐐瑰崟涓?; statusColor = '#ffd700'; break;
                    case 'eating': statusText = '鐢ㄩ涓?; statusColor = '#4ecdc4'; break;
                    case 'waitingCheckout': statusText = '寰呯粨璐?; statusColor = '#ff6b6b'; break;
                    case 'dirty': statusText = '寰呮墦鎵?; statusColor = '#aaa'; break;
                    case 'toCashier': statusText = '鍘荤粨璐?; statusColor = '#ff9f43'; break;
                }
                ctx.fillStyle = statusColor;
                ctx.font = '11px Microsoft YaHei';
                ctx.fillText(statusText, this.x + this.width/2, this.y + this.height + 15);
                
                // 娑堣垂閲戦
                ctx.fillStyle = '#ffd700';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(`楼${this.customer.spend}`, this.x + this.width/2, this.y + this.height + 30);
            }
        }
    }
}

// 椤惧绫?- 瀹屾暣鍔ㄧ嚎绯荤粺
class Customer {
    constructor() {
        const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
        this.name = type.name + Math.floor(Math.random() * 100);
        this.type = type;
        this.spend = Math.floor(Math.random() * (type.maxSpend - type.minSpend) + type.minSpend);
        this.color = type.color;
        this.patience = 100;
        
        // 鐘舵€侊細entering(杩涘簵) -> seekingSeat(鎵惧骇) -> seated(钀藉骇) -> ordering(鐐瑰崟) 
        //       -> waitingFood(绛夐) -> eating(鐢ㄩ) -> toCashier(鍘荤粨璐? -> leaving(绂诲紑) -> left(娑堝け)
        this.status = 'entering';
        
        // 浣嶇疆
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = -50;
        this.currentY = storeAreas.waitingArea.y;
        this.moving = true;
        this.moveSpeed = 0.025;
        
        // 鍔ㄧ敾
        this.walkFrame = 0;
        this.walkTimer = 0;
        
        // 褰撳墠鏈嶅姟鐨勯妗?        this.table = null;
    }
    
    // 璁剧疆鐩爣浣嶇疆
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.moving = true;
    }
    
    // 寮€濮嬬寮€娴佺▼ - 鍘绘敹閾跺彴缁撹处
    startCheckout() {
        this.status = 'toCashier';
        // 鐩爣锛氭敹閾跺彴
        this.setTarget(cashierArea.x + cashierArea.width/2, cashierArea.y - 20);
    }
    
    // 寮€濮嬬寮€
    startLeaving() {
        this.status = 'leaving';
        // 浠庡彸渚у嚭鍙ｇ寮€
        this.setTarget(canvas.width + 80, this.currentY);
    }
    
    // 鏇存柊绉诲姩
    update(deltaTime) {
        if (this.moving) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 3) {
                // 骞虫粦绉诲姩
                this.currentX += dx * this.moveSpeed;
                this.currentY += dy * this.moveSpeed;
                
                // 璧拌矾鍔ㄧ敾
                this.walkTimer += deltaTime;
                if (this.walkTimer > 100) {
                    this.walkFrame = (this.walkFrame + 1) % 4;
                    this.walkTimer = 0;
                }
            } else {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.moving = false;
                
                // 鍒拌揪鐩爣鍚庣殑鐘舵€佸鐞?                this.handleArrival();
            }
        }
    }
    
    // 鍒拌揪鐩爣鍚庣殑澶勭悊
    handleArrival() {
        switch(this.status) {
            case 'entering':
                this.status = 'seated';
                break;
            case 'toCashier':
                // 鍒拌揪鏀堕摱鍙帮紝鍙互缁撹处浜?                if (this.table) {
                    checkout(this.table);
                    this.startLeaving();
                }
                break;
            case 'leaving':
                this.status = 'left';
                break;
        }
    }
    
    // 缁樺埗Q鐗?.5澶磋韩瑙掕壊
    draw(x, y) {
        const isMobile = canvas.width < 800;
        const scale = isMobile ? 0.8 : 1;
        const baseSize = 20 * scale;
        
        // 璧拌矾鏃剁殑涓婁笅娴姩
        const bounce = this.moving ? Math.sin(this.walkFrame * Math.PI / 2) * 3 : 0;
        
        // 韬綋
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.8, baseSize * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 澶撮儴锛堝ぇ澶达級
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.5, baseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 鐪肩潧
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 鐪肩彔
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // 鑴氾紙璧拌矾鍔ㄧ敾锛?        if (this.moving && this.status !== 'seated') {
            ctx.fillStyle = '#333';
            const footOffset = Math.sin(this.walkFrame * Math.PI / 2) * 5;
            ctx.beginPath();
            ctx.ellipse(x - baseSize * 0.3, y + bounce + baseSize * 0.5, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2);
            ctx.ellipse(x + baseSize * 0.3 + footOffset, y + bounce + baseSize * 0.5, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 鍘ㄦ埧妲戒綅
class KitchenSlot {
    constructor(id) {
        this.id = id;
        this.status = 'idle';
        this.progress = 0;
        this.dish = null;
    }
}

// 鍛樺伐鍔ㄧ敾绯荤粺
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

// 鍒濆鍖栨父鎴?function init() {
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
    
    // 鍒濆鍖栨敹閾跺彴鍖哄煙
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

// 缁戝畾UI浜嬩欢
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

// 澶勭悊鐢诲竷鐐瑰嚮
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

// 澶勭悊椁愭鐐瑰嚮
function handleTableClick(table) {
    if (table.status === 'waitingCheckout') {
        // 鎵嬪姩缁撹处
        checkout(table);
        showMessage('缁撹处鎴愬姛');
    } else if (table.status === 'dirty') {
        if (!gameState.staff.cleaner) {
            table.status = 'empty';
            table.customer = null;
            table.order = null;
            table.food = null;
            table.dirtyTimer = 0;
            showMessage('椁愭宸叉墦鎵共鍑€');
        }
    } else if (table.status === 'toCashier') {
        // 寮曞椤惧鍘荤粨璐?        if (table.customer) {
            table.customer.startCheckout();
        }
    }
}

// 澶勭悊鍘ㄦ埧鐐瑰嚮
function handleKitchenClick(slot) {
    if (slot.status === 'idle') {
        showMessage('璇风瓑寰呴【瀹㈢偣鍗?);
    } else if (slot.status === 'done') {
        showMessage('鑿滃搧宸茶嚜鍔ㄤ笂鑿?);
    }
}

// 鏄剧ず娑堟伅
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

// 鏄剧ず闈㈡澘
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
            title.textContent = '鑿滃崟绠＄悊';
            content.innerHTML = renderMenuPanel();
            break;
        case 'kitchen':
            title.textContent = '鍘ㄦ埧';
            content.innerHTML = renderKitchenPanel();
            break;
        case 'upgrade':
            title.textContent = '鍗囩骇璁炬柦';
            content.innerHTML = renderUpgradePanel();
            break;
        case 'staff':
            title.textContent = '鍛樺伐绠＄悊';
            content.innerHTML = renderStaffPanel();
            break;
        case 'warehouse':
            title.textContent = '椋熸潗浠撳簱';
            content.innerHTML = renderWarehousePanel();
            break;
    }
}

// 闅愯棌闈㈡澘
function hidePanel() {
    document.getElementById('panel').classList.add('hidden');
}

// 娓叉煋鑿滃崟闈㈡澘
function renderMenuPanel() {
    let html = '<div class="panel-section"><h4>閿呭簳</h4><div class="item-grid">';
    for (const broth of gameState.menu.broths) {
        html += `<div class="menu-item">
            <div class="name">${broth.name}</div>
            <div class="price">楼${broth.price}</div>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>椋熸潗</h4><div class="item-grid">';
    for (const dish of gameState.menu.dishes) {
        html += `<div class="menu-item">
            <div class="name">${dish.name}</div>
            <div class="price">楼${dish.price}</div>
        </div>`;
    }
    html += '</div></div>';
    return html;
}

// 娓叉煋鍘ㄦ埧闈㈡澘
function renderKitchenPanel() {
    let html = '<div class="panel-section"><h4>鐑归オ妲戒綅</h4>';
    for (const slot of gameState.kitchen.slots) {
        const statusText = slot.status === 'idle' ? '绌洪棽' : 
                          slot.status === 'cooking' ? `鐑归オ涓?${Math.floor(slot.progress)}%` : 
                          '宸插畬鎴?;
        html += `<div class="staff-status">
            <span>妲戒綅 ${slot.id + 1}</span>
            <span class="staff-work">${statusText}</span>
        </div>`;
    }
    html += '</div>';
    return html;
}

// 娓叉煋鍗囩骇闈㈡澘
function renderUpgradePanel() {
    const upgrades = [
        { id: 'tables', name: '椁愭鏁伴噺', desc: '澧炲姞椁愭鏁伴噺' },
        { id: 'tableSpeed', name: '鐢ㄩ閫熷害', desc: '鍔犲揩椤惧鐢ㄩ閫熷害' },
        { id: 'kitchen', name: '鍘ㄦ埧鏁堢巼', desc: '鍔犲揩鐑归オ閫熷害' },
        { id: 'waitingArea', name: '绛夊€欏尯', desc: '澧炲姞鎺掗槦瀹归噺' },
    ];
    
    let html = '<div class="panel-section"><div class="item-grid">';
    for (const upg of upgrades) {
        const upgrade = gameState.upgrades[upg.id];
        const cost = Math.pow(2, upgrade.level) * 100;
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        
        html += `<div class="upgrade-item">
            <div class="level">${upg.name} Lv.${upgrade.level}</div>
            <div class="desc">${upg.desc}</div>
            <div class="cost">${isMaxed ? '宸叉弧绾? : '楼' + cost}</div>
            <button class="${isMaxed ? 'maxed-btn' : 'upgrade-btn'}" data-upgrade="${upg.id}" ${isMaxed ? 'disabled' : ''}>
                ${isMaxed ? '宸叉弧绾? : '鍗囩骇'}
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

// 鍗囩骇鍔熻兘
function upgrade(upgradeId) {
    const upgrade = gameState.upgrades[upgradeId];
    if (upgrade.level >= upgrade.maxLevel) {
        showMessage('宸叉弧绾?);
        return;
    }
    
    const cost = Math.pow(2, upgrade.level) * 100;
    if (gameState.gold < cost) {
        showMessage('閲戝竵涓嶈冻');
        return;
    }
    
    gameState.gold -= cost;
    upgrade.level++;
    showMessage('鍗囩骇鎴愬姛');
    updateUI();
    showPanel('upgrade');
}

// 娓叉煋鍛樺伐闈㈡澘
function renderStaffPanel() {
    let html = '<div class="panel-section"><h4>宸查泧浣ｅ憳宸?/h4>';
    
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
        html += '<div style="color:#aaa;text-align:center;padding:20px;">鏆傛棤鍛樺伐</div>';
    }
    
    html += '</div><div class="panel-section"><h4>鍙泧浣ｅ憳宸?/h4><div class="item-grid">';
    
    for (const staff of STAFF_DATA) {
        const isHired = gameState.staff[staff.id];
        html += `<div class="staff-item">
            <div class="role">${staff.name} - ${staff.role}</div>
            <div class="wage">鏃ヨ柂: 楼${staff.wage}</div>
            <button class="${isHired ? 'hired-btn' : 'hire-btn'}" data-staff-id="${staff.id}" ${isHired ? 'disabled' : ''}>
                ${isHired ? '宸查泧浣? : '闆囦剑'}
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

// 鑾峰彇鍛樺伐鐘舵€佹枃鏈?function getStaffStatusText(staffId) {
    switch(staffId) {
        case 'server': return '绛夊緟涓婅彍...';
        case 'cashier': return '绛夊緟缁撹处...';
        case 'chef': return '绛夊緟鐑归オ...';
        case 'cleaner': return '绛夊緟娓呮磥...';
        default: return '宸ヤ綔涓?;
    }
}

// 闆囦剑鍛樺伐
function hireStaff(staffId) {
    const staffData = STAFF_DATA.find(s => s.id === staffId);
    if (!staffData) return;
    
    if (gameState.staff[staffId]) {
        showMessage('璇ュ憳宸ュ凡琚泧浣?);
        return;
    }
    
    if (gameState.gold < staffData.wage) {
        showMessage('閲戝竵涓嶈冻锛岄渶瑕? + staffData.wage + ' 閲戝竵');
        return;
    }
    
    gameState.gold -= staffData.wage;
    
    gameState.staff[staffId] = {
        ...staffData,
        hired: true,
        dailyWage: staffData.wage
    };
    
    updateUI();
    showMessage(`鎴愬姛闆囦剑 ${staffData.name}锛乣);
    
    if (gameState.tutorial.step === 2) {
        gameState.tutorial.step = 3;
        setTimeout(() => {
            gameState.tutorial.completed = true;
        }, 3000);
    }
    
    showPanel('staff');
}

// 娓叉煋浠撳簱闈㈡澘
function renderWarehousePanel() {
    const flavors = [
        { id: 'sour', name: '閰?, icon: '馃崑', color: '#f1c40f' },
        { id: 'sweet', name: '鐢?, icon: '馃崜', color: '#e91e63' },
        { id: 'bitter', name: '鑻?, icon: '馃ガ', color: '#27ae60' },
        { id: 'spicy', name: '杈?, icon: '馃尪锔?, color: '#e74c3c' },
        { id: 'salty', name: '鍜?, icon: '馃', color: '#3498db' },
    ];
    
    const recipes = [
        { name: '閰歌荆姹ら攨', ingredients: { sour: 2, spicy: 1 }, price: 25 },
        { name: '鐣寗鑲ョ墰閿?, ingredients: { sweet: 2, sour: 1 }, price: 28 },
        { name: '鑻︾摐璞嗚厫', ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        { name: '楹昏荆绾㈡堡', ingredients: { spicy: 3, salty: 1 }, price: 45 },
        { name: '鐩愭按鑿滃績', ingredients: { salty: 2, sweet: 1 }, price: 30 },
    ];
    
    let html = '<div class="panel-section"><h4>璋冨懗鏍?/h4><div class="item-grid">';
    for (const f of flavors) {
        const tree = gameState.flavorTrees[f.id];
        const cost = Math.pow(2, tree.level) * 50;
        html += `<div class="flavor-item">
            <div class="flavor-icon" style="color: ${f.color}">${f.icon}</div>
            <div class="flavor-name">${f.name}</div>
            <div class="flavor-count">搴撳瓨: ${gameState.ingredients[f.id]}</div>
            <div class="flavor-level">绛夌骇: ${tree.level}</div>
            <button class="upgrade-btn" data-flavor="${f.id}">鍗囩骇 楼${cost}</button>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>椋熸潗鍚堟垚</h4><div class="item-grid">';
    for (const recipe of recipes) {
        const canCraft = Object.entries(recipe.ingredients).every(([flavor, need]) => 
            gameState.ingredients[flavor] >= need
        );
        const btnClass = canCraft ? 'craft-btn' : 'disabled-btn';
        const btnText = canCraft ? '鍚堟垚' : '鏉愭枡涓嶈冻';
        const ingredientsText = Object.entries(recipe.ingredients)
            .map(([f, n]) => `${flavors.find(fv => fv.id === f).icon}${n}`)
            .join('+');
        html += `<div class="recipe-item">
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-ingredients">${ingredientsText}</div>
            <div class="recipe-price">鍞环: 楼${recipe.price}</div>
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

// 鍗囩骇璋冨懗鏍?function upgradeFlavorTree(flavorId) {
    const tree = gameState.flavorTrees[flavorId];
    const cost = Math.pow(2, tree.level) * 50;
    
    if (gameState.gold < cost) {
        showMessage('閲戝竵涓嶈冻锛岄渶瑕? + cost + ' 閲戝竵');
        return;
    }
    
    gameState.gold -= cost;
    tree.level++;
    tree.production = tree.level;
    gameState.ingredients[flavorId] += tree.level * 2;
    
    showMessage(`${tree.name} 鍗囩骇鍒?Lv.${tree.level}锛乣);
    showPanel('warehouse');
}

// 鍚堟垚鑿滃搧
function craftDish(recipeName) {
    const recipes = {
        '閰歌荆姹ら攨': { ingredients: { sour: 2, spicy: 1 }, price: 25 },
        '鐣寗鑲ョ墰閿?: { ingredients: { sweet: 2, sour: 1 }, price: 28 },
        '鑻︾摐璞嗚厫': { ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        '楹昏荆绾㈡堡': { ingredients: { spicy: 3, salty: 1 }, price: 45 },
        '鐩愭按鑿滃績': { ingredients: { salty: 2, sweet: 1 }, price: 30 },
    };
    
    const recipe = recipes[recipeName];
    if (!recipe) return;
    
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        if (gameState.ingredients[flavor] < need) {
            showMessage('鏉愭枡涓嶈冻');
            return;
        }
    }
    
    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        gameState.ingredients[flavor] -= need;
    }
    
    gameState.gold += recipe.price;
    
    showMessage(`鍚堟垚 ${recipeName} 鎴愬姛锛岃幏寰椔?{recipe.price}`);
    showPanel('warehouse');
}

// 鐢熸垚椤惧
function spawnCustomer() {
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    
    if (emptyTable) {
        const customer = new Customer();
        customer.status = 'entering';
        
        // 璁＄畻鐩爣浣嶇疆锛氫粠 entrance 杩涘叆 -> 搴т綅
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

// 瀹夋帓鎺掗槦椤惧鍒扮┖搴т綅
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

// 鐢熸垚璁㈠崟
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

// 寮€濮嬬児楗?function startCooking(table) {
    const freeSlot = gameState.kitchen.slots.find(s => s.status === 'idle');
    if (!freeSlot) return;
    
    freeSlot.status = 'cooking';
    freeSlot.dish = table.order;
    freeSlot.progress = 0;
    freeSlot.tableId = table.id;
}

// 鏇存柊娓告垙鐘舵€?function update(deltaTime) {
    // 鐢熸垚椤惧
    gameState.customerSpawnTimer += deltaTime;
    if (gameState.customerSpawnTimer >= CONFIG.CUSTOMER_SPAWN_INTERVAL) {
        gameState.customerSpawnTimer = 0;
        spawnCustomer();
    }
    
    // 瀹夋帓鎺掗槦椤惧
    seatWaitingCustomer();
    
    // 鍛樺伐鑷姩宸ヤ綔
    staffAutoWork();
    
    // 鏇存柊鍘ㄦ埧
    updateKitchen(deltaTime);
    
    // 鏇存柊椁愭鐘舵€?    updateTables(deltaTime);
    
    // 璋冨懗鏍戣嚜鍔ㄤ骇鍑?    updateFlavorTrees(deltaTime);
    
    // 鏇存柊UI
    updateUI();
}

// 璋冨懗鏍戣嚜鍔ㄤ骇鍑?function updateFlavorTrees(deltaTime) {
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

// 鍛樺伐鑷姩宸ヤ綔绯荤粺
function staffAutoWork() {
    // 1. 鏀堕摱鍛樿嚜鍔ㄧ粨璐?    if (gameState.staff.cashier) {
        for (const table of gameState.tables) {
            if (table.status === 'waitingCheckout') {
                // 寮曞椤惧鍘绘敹閾跺彴
                if (table.customer && table.customer.status !== 'toCashier') {
                    table.customer.startCheckout();
                }
                break;
            }
        }
    }
    
    // 2. 鍘ㄥ笀鑷姩鐑归オ
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
    
    // 3. 鏈嶅姟鍛樿嚜鍔ㄤ笂鑿?    if (gameState.staff.server) {
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
    
    // 4. 淇濇磥鍛樿嚜鍔ㄦ竻娲?    if (gameState.staff.cleaner) {
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

// 鏇存柊鍘ㄦ埧
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

// 鏇存柊椁愭鐘舵€?function updateTables(deltaTime) {
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
        
        // 鏇存柊椤惧浣嶇疆
        if (table.customer && table.customer.status !== 'left') {
            table.customer.update(deltaTime);
            
            if (table.customer.status === 'left') {
                table.customer = null;
            }
        }
    }
}

// 缁撹处
function checkout(table) {
    if (table.order) {
        gameState.gold += table.order.total;
        showMessage(`缁撹处鎴愬姛锛岃幏寰椔?{table.order.total}`);
    }
    table.status = 'dirty';
    table.order = null;
    table.food = null;
    
    // 椤惧绂诲紑
    if (table.customer) {
        table.customer.startLeaving();
    }
}

// 鏇存柊UI
function updateUI() {
    document.getElementById('gold-display').textContent = gameState.gold;
    document.getElementById('gem-display').textContent = gameState.gems;
    document.getElementById('day-display').textContent = gameState.day;
}

// 娓叉煋娓告垙
function render() {
    // 娓呯┖鐢诲竷 - 鏆栭粍鑹茶皟鑳屾櫙
    ctx.fillStyle = '#3d3d5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 缁樺埗鍦版澘
    drawFloor();
    
    // 缁樺埗鍘ㄦ埧鍖哄煙
    drawKitchen();
    
    // 缁樺埗鏀堕摱鍙?    drawCashier();
    
    // 缁樺埗椁愭
    for (const table of gameState.tables) {
        table.draw();
    }
    
    // 缁樺埗绛夊€欏尯
    drawWaitingArea();
    
    // 缁樺埗鍘ㄦ埧杩涘害
    drawKitchenProgress();
    
    // 缁樺埗鍛樺伐
    drawStaff();
    
    // 缁樺埗鏂版墜寮曞
    drawTutorialHint();
}

// 缁樺埗鍦版澘 - 2D姝ｉ潰瑙嗚
function drawFloor() {
    const isMobile = canvas.width < 800;
    
    // 鍦版澘搴曡壊 - 娓╂殩鐨勫簵鍐呭厜绾?    ctx.fillStyle = '#5c4d4d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 搴楀唴涓婚€氶亾锛堜粠闂ㄥ彛鍒板唴閮級
    ctx.fillStyle = '#6b5a5a';
    ctx.fillRect(canvas.width * 0.7, 0, canvas.width * 0.3, canvas.height);
    
    // 鍏ュ彛鍖哄煙锛堝彸渚э級
    ctx.fillStyle = '#7d6a6a';
    ctx.fillRect(canvas.width * 0.85, canvas.height * 0.3, canvas.width * 0.15, canvas.height * 0.5);
    
    // 鍦版澘缃戞牸绾匡紙绠€鍗曞钩琛岀嚎锛?    ctx.strokeStyle = 'rgba(255, 220, 150, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = isMobile ? 40 : 50;
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 搴楅摵鎷涚墝 - 骞哥璺疦o.88
    const signX = canvas.width * 0.88;
    const signY = canvas.height * 0.15;
    
    // 鎷涚墝鑳屾櫙
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(signX - 40, signY, 80, 50);
    
    // 鎷涚墝杈规
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(signX - 40, signY, 80, 50);
    
    // 鎷涚墝鏂囧瓧
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('骞哥璺?, signX, signY + 20);
    ctx.fillText('No.88', signX, signY + 38);
    
    // 鍏ュ彛鏂瑰悜鎸囩ず
    ctx.fillStyle = '#fff';
    ctx.font = '14px Microsoft YaHei';
    ctx.fillText('鍏ュ彛 鈫?, canvas.width * 0.92, canvas.height * 0.55);
}

// 缁樺埗鍘ㄦ埧 - 2D姝ｉ潰瑙嗚锛岀敾闈笂鏂?function drawKitchen() {
    const isMobile = canvas.width < 800;
    const kitchenX = isMobile ? canvas.width * 0.2 : 200;
    const kitchenY = isMobile ? canvas.height * 0.02 : 20;
    const kitchenWidth = isMobile ? canvas.width * 0.6 : 800;
    const kitchenHeight = isMobile ? canvas.height * 0.15 : 120;
    
    // 鍘ㄦ埧鑳屾櫙
    ctx.fillStyle = '#3d3030';
    ctx.fillRect(kitchenX, kitchenY, kitchenWidth, kitchenHeight);
    
    // 鍘ㄦ埧杈规
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.strokeRect(kitchenX, kitchenY, kitchenWidth, kitchenHeight);
    
    // 鍘ㄦ埧鏍囩
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('馃嵅 鍘ㄦ埧', kitchenX + kitchenWidth/2, kitchenY + 25);
    
    // 鐏跺彴
    const stoveWidth = kitchenWidth / 3;
    for (let i = 0; i < 3; i++) {
        const stoveX = kitchenX + 30 + i * (stoveWidth + 10);
        const stoveY = kitchenY + 45;
        
        ctx.fillStyle = '#444';
        ctx.fillRect(stoveX, stoveY, stoveWidth - 40, 50);
        
        // 鐏剁溂
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(stoveX + (stoveWidth - 40)/2, stoveY + 25, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // 鐏劙鏁堟灉
        if (gameState.kitchen.slots[i] && gameState.kitchen.slots[i].status === 'cooking') {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(stoveX + (stoveWidth - 40)/2, stoveY + 25, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(stoveX + (stoveWidth - 40)/2, stoveY + 20, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 缁樺埗鏀堕摱鍙?function drawCashier() {
    // 鏀堕摱鍙板簳搴?    ctx.fillStyle = '#5d4e37';
    ctx.fillRect(cashierArea.x, cashierArea.y, cashierArea.width, cashierArea.height);
    
    // 鏀堕摱鍙拌竟妗?    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(cashierArea.x, cashierArea.y, cashierArea.width, cashierArea.height);
    
    // 鏀堕摱鏈?    ctx.fillStyle = '#333';
    ctx.fillRect(cashierArea.x + 10, cashierArea.y - 20, cashierArea.width - 20, 30);
    
    // 灞忓箷
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(cashierArea.x + 15, cashierArea.y - 15, cashierArea.width - 30, 15);
    
    // 鏍囩
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('鏀堕摱鍙?, cashierArea.x + cashierArea.width/2, cashierArea.y + cashierArea.height/2 + 5);
}

// 缁樺埗绛夊€欏尯 - 2D姝ｉ潰瑙嗚锛屽彸渚ч棬鍙?function drawWaitingArea() {
    // 绛夊€欏尯鑳屾櫙 - 鍙充晶鍏ュ彛澶?    ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
    ctx.fillRect(canvas.width * 0.85, canvas.height * 0.35, canvas.width * 0.12, canvas.height * 0.35);
    
    // 绛夊€欏尯鏍囩
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('绛変綅鍖?, canvas.width * 0.91, canvas.height * 0.4);
    
    // 鎺掗槦浜烘暟
    const waitCount = gameState.waitingQueue.length;
    ctx.fillStyle = '#fff';
    ctx.font = '12px Microsoft YaHei';
    ctx.fillText(`鎺掗槦: ${waitCount}/${gameState.waitingAreaCapacity}`, canvas.width * 0.91, canvas.height * 0.65);
    
    // 缁樺埗鎺掗槦椤惧锛堝皬榛戜汉褰憋級
    for (let i = 0; i < gameState.waitingQueue.length; i++) {
        const customer = gameState.waitingQueue[i];
        const queueX = canvas.width * 0.91;
        const queueY = canvas.height * 0.48 + i * 35;
        customer.draw(queueX, queueY);
    }
}

// 缁樺埗鍘ㄦ埧杩涘害
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
            
            // 杩涘害鏉¤儗鏅?            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barWidth, 10);
            
            // 杩涘害鏉?            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(barX, barY, barWidth * (slot.progress / 100), 10);
        }
    }
}

// 缁樺埗鍛樺伐
function drawStaff() {
    const isMobile = canvas.width < 800;
    const scale = isMobile ? 0.8 : 1;
    
    // 缁樺埗宸查泧浣ｇ殑鍛樺伐
    for (const [id, staff] of Object.entries(gameState.staff)) { // 显示所有员工（包括未雇佣的）
        
        let anim = staffAnimations[id];
        if (!anim) continue;
        
        // 鍛樺伐闅忔満绉诲姩锛堟ā鎷熷伐浣滐級
        if (!anim.moving && Math.random() < 0.005) {
            const range = 30;
            anim.targetX = anim.x + (Math.random() - 0.5) * range;
            anim.targetY = anim.y + (Math.random() - 0.5) * range;
            anim.moving = true;
        }
        
        // 绉诲姩鍔ㄧ敾
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
        
        // 绉诲姩绔綅缃皟鏁?        if (isMobile) {
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
        
        // 韬綋
        ctx.fillStyle = staff.color;
        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.7, baseSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 鍥磋
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x - baseSize * 0.5, y + bounce - baseSize * 0.2, baseSize, baseSize * 0.7);
        
        // 澶撮儴
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.4, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // 甯藉瓙/澶村肪
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
        
        // 鍛樺伐鍚嶇О鏍囩
        ctx.fillStyle = '#fff';
        ctx.font = '10px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(staff.name, x, y + bounce + baseSize * 1.2);
    }
}

// 缁樺埗鏂版墜寮曞
function drawTutorialHint() {
    if (gameState.tutorial.completed) return;
    
    let hint = '';
    switch(gameState.tutorial.step) {
        case 0: hint = '鐐瑰嚮"鍗囩骇"鎸夐挳鍗囩骇璁炬柦'; break;
        case 1: hint = '鐐瑰嚮"鍛樺伐"闆囦剑鏈嶅姟鍛?; break;
        case 2: hint = '闆囦剑鍛樺伐鏉ョ粡钀ョ伀閿呭簵锛?; break;
        default: return;
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height - 80, 300, 40);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(hint, canvas.width/2, canvas.height - 55);
}

// 娓告垙涓诲惊鐜?let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (deltaTime < 100) { // 闃叉杩囧ぇ鐨刣eltaTime
        update(deltaTime);
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// 鍚姩娓告垙
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resizeCanvas);

// 骞哥璺殑鐏攨搴?- 娓告垙涓婚€昏緫

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 鍝嶅簲寮忕敾甯冨ぇ灏?function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    const container = document.getElementById('game-container');
    
    if (isMobile) {
        // 鎵嬫満涓婁娇鐢ㄧ獥鍙ｅぇ灏?        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.style.width = '100vw';
        container.style.height = '100vh';
    } else {
        // 鐢佃剳涓婃槸鍥哄畾澶у皬
        canvas.width = 1200;
        canvas.height = 700;
        // 闄愬埗鏈€澶у搴?        if (window.innerWidth < 1200) {
            canvas.width = window.innerWidth * 0.95;
            canvas.height = canvas.width * 0.583;
            container.style.width = canvas.width + 'px';
            container.style.height = canvas.height + 'px';
        } else {
            container.style.width = '1200px';
            container.style.height = '700px';
        }
    }
    
    // 閲嶆柊鍒濆鍖栨父鎴忥紙濡傛灉宸茬粡鍒濆鍖栬繃锛岄渶瑕侀噸鏂拌绠楁瀛愪綅缃級
    if (gameState.tables.length > 0) {
        initTables();
    }
}

// 鍒濆鍖栨瀛愪綅缃?function initTables() {
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

// 椤甸潰鍔犺浇鏃跺拰绐楀彛澶у皬鏀瑰彉鏃惰皟鏁寸敾甯冨ぇ灏?window.addEventListener('DOMContentLoaded', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// 绉诲姩绔Е鎽镐簨浠舵敮鎸?function setupTouchEvents() {
    // 瑙︽懜浜嬩欢澶勭悊
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
    
    // 瑙﹀彂鐐瑰嚮澶勭悊
    handleCanvasClickAt(x, y);
}

// 淇敼鐐瑰嚮澶勭悊鍑芥暟锛屾敮鎸佽Е鎽稿拰榧犳爣
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasClickAt(x, y);
}

function handleCanvasClickAt(x, y) {
    // 妫€鏌ユ槸鍚︾偣鍑讳簡妗屽瓙
    for (const table of gameState.tables) {
        if (x >= table.x && x <= table.x + table.width &&
            y >= table.y && y <= table.y + table.height) {
            handleTableClick(table);
            return;
        }
    }
    
    // 妫€鏌ユ槸鍚︾偣鍑讳簡鍘ㄦ埧妲戒綅 - 绉诲姩绔娇鐢ㄧ浉瀵瑰潗鏍?    const kitchenX = canvas.width * 0.5;
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

// 娓告垙閰嶇疆
const CONFIG = {
    FPS: 60,
    TABLE_COUNT: 4,
    KITCHEN_SLOTS: 2,
    CUSTOMER_SPAWN_INTERVAL: 5000, // 姣
    EATING_DURATION: 8000,
    COOKING_DURATION: 5000,
    CLEANING_DURATION: 3000,
};

// 娓告垙鐘舵€?const gameState = {
    gold: 500,
    gems: 10,
    day: 1,
    lastTime: 0,
    customerSpawnTimer: 0,
    
    // 妗屽瓙
    tables: [],
    
    // 鍘ㄦ埧
    kitchen: {
        slots: [],
        upgrades: {
            cutting: 1,
            prep: 1,
            dishwashing: 1,
            stove: 1
        }
    },
    
    // 鍛樺伐
    staff: {
        server: null,   // 鏈嶅姟鍛?        cashier: null,  // 鏀堕摱鍛?        chef: null,     // 鍘ㄥ笀
        cleaner: null   // 淇濇磥
    },
    
    // 鑿滃搧鑿滃崟
    menu: {
        broths: [
            { id: 'broth_1', name: '楹昏荆閿呭簳', price: 28, level: 1 },
            { id: 'broth_2', name: '娓呮堡閿呭簳', price: 22, level: 2 },
            { id: 'broth_3', name: '楦抽腐閿呭簳', price: 38, level: 3 },
            { id: 'broth_4', name: '鐣寗閿呭簳', price: 32, level: 4 },
            { id: 'broth_5', name: '鑿屾堡閿呭簳', price: 35, level: 5 },
        ],
        dishes: [
            { id: 'dish_1', name: '鑲ョ墰', price: 18, cost: 8 },
            { id: 'dish_2', name: '缇婅倝', price: 16, cost: 7 },
            { id: 'dish_3', name: '姣涜倸', price: 22, cost: 10 },
            { id: 'dish_4', name: '楦', price: 12, cost: 5 },
            { id: 'dish_5', name: '钄彍鎷肩洏', price: 15, cost: 5 },
            { id: 'dish_6', name: '璞嗚厫', price: 8, cost: 3 },
            { id: 'dish_7', name: '鍦熻眴', price: 6, cost: 2 },
            { id: 'dish_8', name: '闆风ⅶ', price: 16, cost: 3 },
            { id: 'dish_9', name: '铏炬粦', price: 24, cost: 12 },
            { id: 'dish_10', name: '鐗涜倝涓?, price: 18, cost: 8 },
        ]
    },
    
    // 椤惧
    customers: [],
    waitingQueue: [],
    waitingAreaCapacity: 4,
    
    // 璁㈠崟
    orders: [],
    
    // 鍗囩骇
    upgrades: {
        tables: { level: 1, maxLevel: 10 },
        tableSpeed: { level: 1, maxLevel: 10 },
        kitchen: { level: 1, maxLevel: 10 },
        waitingArea: { level: 1, maxLevel: 10 }
    },
    
    // 椋熸潗浠撳簱
    ingredients: {
        sour: 0,    // 閰?        sweet: 0,   // 鐢?        bitter: 0, // 鑻?        spicy: 0,  // 杈?        salty: 0   // 鍜?    },
    
    // 浜斿懗鏍?    flavorTrees: {
        sour: { name: '閰告鏍?, level: 1, production: 1 },
        sweet: { name: '鐢樿敆鏋?, level: 1, production: 1 },
        bitter: { name: '鑻︾摐钘?, level: 1, production: 1 },
        spicy: { name: '杈ｆ涓?, level: 1, production: 1 },
        salty: { name: '鐩愭櫠鐭?, level: 1, production: 1 }
    },
    
    // 浜斿懗鏍戜骇鍑鸿鏃跺櫒
    flavorTimers: {
        sour: 0,
        sweet: 0,
        bitter: 0,
        spicy: 0,
        salty: 0
    },
    
    // 鏂版墜鎸囧紩
    tutorial: {
        step: 0, // 0: 鏈紑濮? 1: 鐐瑰嚮鍗囩骇, 2: 闆囦剑鍛樺伐, 3: 瀹屾垚
        completed: false
    }
};

// 椤惧绫诲瀷
const CUSTOMER_TYPES = [
    { name: '瀛︾敓', minSpend: 30, maxSpend: 60, color: '#3498db' },
    { name: '涓婄彮鏃?, minSpend: 50, maxSpend: 100, color: '#2ecc71' },
    { name: '瀹跺涵', minSpend: 80, maxSpend: 150, color: '#9b59b6' },
    { name: '鐧介', minSpend: 100, maxSpend: 200, color: '#e74c3c' },
    { name: '鑰佹澘', minSpend: 200, maxSpend: 500, color: '#f39c12' },
];

// 鍛樺伐鏁版嵁
const STAFF_DATA = [
    { id: 'server', name: '灏忕帇', role: '鏈嶅姟鍛?, wage: 50, efficiency: 1.0 },
    { id: 'cashier', name: '閽卞コ澹?, role: '鏀堕摱鍛?, wage: 60, efficiency: 1.0 },
    { id: 'chef', name: '鑰佹潕', role: '鍘ㄥ笀', wage: 80, efficiency: 1.0 },
    { id: 'cleaner', name: '缃楅樋濮?, role: '淇濇磥', wage: 40, efficiency: 1.0 },
];

// 妗屽瓙绫?class Table {
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
        // 椤惧鍔ㄧ敾鐩稿叧
        this.customerY = y - 15; // 椤惧Y浣嶇疆
        this.customerOffset = 0; // 鍛煎惛鍔ㄧ敾鍋忕Щ
    }
    
    draw() {
        // 妗屽瓙
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
            // 钂告苯
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2 - 5, this.y + this.height/2 - 25, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 椤惧 - 浣跨敤鏂扮殑缁樺埗鏂规硶
        if (this.customer && this.customer.status !== 'left') {
            // 濡傛灉椤惧杩樺湪绉诲姩涓紝缁樺埗绉诲姩鍔ㄧ敾
            if (this.customer.moving) {
                // 缁樺埗Q鐗?.5澶磋韩琛岃蛋鍔ㄧ敾
                this.customer.draw(this.customer.currentX, this.customer.currentY);
            } else if (this.customer.status === 'seated' || this.customer.status === 'eating' || this.customer.status === 'waitingCheckout') {
                // 鍧愪笅鍚庣粯鍒堕潤鎬侀【瀹?                this.customer.draw(this.x + this.width/2, this.customerY);
                
                // 椤惧鍚嶇О - 鏄剧ず绫诲瀷鍚嶇О
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText(this.customer.type.name, this.x + this.width/2, this.customerY - 45);
                
                // 鐘舵€?                let statusText = '';
                let statusColor = '#fff';
                switch(this.status) {
                    case 'occupied': statusText = '鐐归涓?; statusColor = '#ffd700'; break;
                    case 'eating': statusText = '鐢ㄩ涓?; statusColor = '#4ecdc4'; break;
                    case 'waitingCheckout': statusText = '寰呯粨璐?; statusColor = '#ff6b6b'; break;
                    case 'dirty': statusText = '寰呮墦鎵?; statusColor = '#aaa'; break;
                }
                ctx.fillStyle = statusColor;
                ctx.font = '11px Microsoft YaHei';
                ctx.fillText(statusText, this.x + this.width/2, this.y + this.height + 15);
                
                // 椤惧娑堣垂閲戦鏄剧ず
                ctx.fillStyle = '#ffd700';
                ctx.font = '10px Microsoft YaHei';
                ctx.fillText(`楼${this.customer.spend}`, this.x + this.width/2, this.y + this.height + 30);
            }
        }
    }
}

// 椤惧绫?class Customer {
    constructor() {
        const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
        this.name = type.name + Math.floor(Math.random() * 100);
        this.type = type;
        this.spend = Math.floor(Math.random() * (type.maxSpend - type.minSpend) + type.minSpend);
        this.color = type.color;
        this.patience = 100;
        
        // 绉诲姩鍔ㄧ敾鐩稿叧
        this.status = 'entering'; // entering: 杩涘叆涓? seated: 鍧愪笅, leaving: 绂诲紑
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = -50; // 浠庣敾甯冨乏渚у寮€濮?        this.currentY = 0;
        this.moving = true;
        this.moveSpeed = 0.03;
        
        // Q鐗?.5澶磋韩鍔ㄧ敾
        this.walkFrame = 0;
        this.walkTimer = 0;
    }
    
    // 璁剧疆鐩爣浣嶇疆
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.moving = true;
    }
    
    // 寮€濮嬬寮€
    startLeaving() {
        this.status = 'leaving';
        this.targetX = canvas.width + 50; // 浠庡彸渚х寮€
        this.targetY = this.currentY;
        this.moving = true;
    }
    
    // 鏇存柊绉诲姩
    update(deltaTime) {
        if (this.moving) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 2) {
                // 骞虫粦绉诲姩
                this.currentX += dx * this.moveSpeed;
                this.currentY += dy * this.moveSpeed;
                
                // 琛岃蛋鍔ㄧ敾
                this.walkTimer += deltaTime;
                if (this.walkTimer > 100) {
                    this.walkFrame = (this.walkFrame + 1) % 4;
                    this.walkTimer = 0;
                }
            } else {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.moving = false;
                
                // 鍒拌揪鐩爣
                if (this.status === 'entering') {
                    this.status = 'seated';
                } else if (this.status === 'leaving') {
                    this.status = 'left';
                }
            }
        }
    }
    
    // 缁樺埗Q鐗?.5澶磋韩瑙掕壊
    draw(x, y) {
        const isMobile = canvas.width < 800;
        const scale = isMobile ? 0.8 : 1;
        const baseSize = 20 * scale;
        
        // 琛岃蛋鏃剁殑涓婁笅鎽嗗姩
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
        
        // 鑴搁儴
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // 鐪肩潧
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.3, y + bounce - baseSize * 1.5, baseSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // 鑴氾紙琛岃蛋鍔ㄧ敾锛?        if (this.moving && this.status !== 'seated') {
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
        this.status = 'idle'; // idle, cooking, done
        this.progress = 0;
        this.dish = null;
    }
}

// 鍒濆鍖栨父鎴?function init() {
    // 鍏堢‘淇濈敾甯冨ぇ灏忔纭?    resizeCanvas();
    
    // 鍔ㄦ€佽绠楁瀛愪綅缃紙閫傞厤涓嶅悓灞忓箷锛?    const isMobile = canvas.width < 800;
    
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
    
    // 鍔ㄦ€佽缃瀛愬ぇ灏?    const tableWidth = isMobile ? canvas.width * 0.3 : 100;
    const tableHeight = isMobile ? canvas.height * 0.12 : 80;
    
    for (let i = 0; i < CONFIG.TABLE_COUNT; i++) {
        const table = new Table(i, tablePositions[i].x, tablePositions[i].y);
        table.width = tableWidth;
        table.height = tableHeight;
        gameState.tables.push(table);
    }
    
    // 鍒濆鍖栧帹鎴挎Ы浣?    for (let i = 0; i < CONFIG.KITCHEN_SLOTS; i++) {
        gameState.kitchen.slots.push(new KitchenSlot(i));
    }
    
    // 缁戝畾UI浜嬩欢
    bindEvents();
    
    // 璁剧疆瑙︽懜浜嬩欢
    setupTouchEvents();
    
    // 寮€濮嬫父鎴忓惊鐜?    requestAnimationFrame(gameLoop);
}

// 缁戝畾UI浜嬩欢
function bindEvents() {
    document.getElementById('btn-menu').addEventListener('click', () => showPanel('menu'));
    document.getElementById('btn-kitchen').addEventListener('click', () => showPanel('kitchen'));
    document.getElementById('btn-upgrade').addEventListener('click', () => showPanel('upgrade'));
    document.getElementById('btn-staff').addEventListener('click', () => showPanel('staff'));
    document.getElementById('btn-warehouse').addEventListener('click', () => showPanel('warehouse'));
    document.getElementById(\x27panel-close\x27).addEventListener(\x27click\x27, hidePanel);\n    \n    document.getElementById(\x27panel\x27).addEventListener(\x27click\x27, function(e) { if(e.target.id === \x27panel\x27) hidePanel(); });
    
    // 鐢诲竷鐐瑰嚮浜嬩欢 - 浣跨敤閫氱敤澶勭悊鍑芥暟
    canvas.addEventListener('click', handleCanvasClick);
    
    // 瑙︽懜浜嬩欢涔熼渶瑕侀樆姝㈤粯璁よ涓?    canvas.addEventListener('touchstart', function(e) {
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

// 澶勭悊妗屽瓙鐐瑰嚮
function handleTableClick(table) {
    if (table.status === 'waitingCheckout') {
        checkout(table);
        showMessage('缁撹处鎴愬姛锛?);
    } else if (table.status === 'dirty') {
        if (!gameState.staff.cleaner) {
            table.status = 'empty';
            table.customer = null;
            table.order = null;
            table.food = null;
            table.dirtyTimer = 0;
            showMessage('妗屽瓙宸叉墦鎵共鍑€');
        }
    }
}

// 澶勭悊鍘ㄦ埧鐐瑰嚮
function handleKitchenClick(slot) {
    if (slot.status === 'idle') {
        showMessage('璇风瓑寰呴【瀹㈢偣椁?);
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
    
    // 鏂版墜鎸囧紩锛氱偣鍑诲崌绾ч潰鏉挎椂鎺ㄨ繘鍒版楠?
    if (type === 'upgrade' && gameState.tutorial.step === 0) {
        gameState.tutorial.step = 1;
    }
    
    // 鏂版墜鎸囧紩锛氱偣鍑诲憳宸ラ潰鏉挎椂鎺ㄨ繘鍒版楠?
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
    html += '</div></div><div class="panel-section"><h4>閰嶈彍</h4><div class="item-grid">';
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
    const k = gameState.kitchen;
    return `<div class="panel-section">
        <h4>鍘ㄦ埧璁炬柦</h4>
        <div class="item-grid">
            <div class="upgrade-item">
                <div class="level">鍒囪彍鍖?Lv.${k.upgrades.cutting}</div>
                <div class="cost">楼${Math.pow(2, k.upgrades.cutting) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">閰嶈彍鍖?Lv.${k.upgrades.prep}</div>
                <div class="cost">楼${Math.pow(2, k.upgrades.prep) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">娲楃妲?Lv.${k.upgrades.dishwashing}</div>
                <div class="cost">楼${Math.pow(2, k.upgrades.dishwashing) * 100}</div>
            </div>
            <div class="upgrade-item">
                <div class="level">鐏跺彴 Lv.${k.upgrades.stove}</div>
                <div class="cost">楼${Math.pow(2, k.upgrades.stove) * 100}</div>
            </div>
        </div>
    </div>`;
}

// 娓叉煋鍗囩骇闈㈡澘
function renderUpgradePanel() {
    const u = gameState.upgrades;
    const upgrades = [
        { id: 'tables', name: '椁愭鏁伴噺', level: u.tables.level, baseCost: 200, desc: '澧炲姞妗屽瓙鏁伴噺' },
        { id: 'tableSpeed', name: '缈诲彴閫熷害', level: u.tableSpeed.level, baseCost: 150, desc: '鍔犲揩椤惧鐢ㄩ閫熷害' },
        { id: 'kitchen', name: '鍘ㄦ埧鏁堢巼', level: u.kitchen.level, baseCost: 250, desc: '鍔犲揩鐑归オ閫熷害' },
        { id: 'waitingArea', name: '绛夊€欏尯', level: u.waitingArea.level, baseCost: 100, desc: '澧炲姞绛夊€欏骇浣? },
    ];
    
    let html = '<div class="panel-section"><h4>搴楅摵璁炬柦</h4><div class="item-grid">';
    for (const upg of upgrades) {
        const cost = Math.pow(2, upg.level) * upg.baseCost;
        const maxed = upg.level >= 10;
        const btnClass = maxed ? 'maxed-btn' : 'upgrade-btn';
        const btnText = maxed ? '宸叉弧绾? : `鍗囩骇 楼${cost}`;
        html += `<div class="upgrade-item" data-upgrade-id="${upg.id}">
            <div class="level">${upg.name} Lv.${upg.level}</div>
            <div class="desc">${upg.desc}</div>
            <button class="${btnClass}" data-upgrade-id="${upg.id}" ${maxed ? 'disabled' : ''}>${btnText}</button>
        </div>`;
    }
    html += '</div></div>';
    
    // 缁戝畾鍗囩骇浜嬩欢 - 浣跨敤鐩存帴缁戝畾鏂瑰紡
    setTimeout(() => {
        const buttons = document.querySelectorAll('.upgrade-btn');
        buttons.forEach(btn => {
            // 绉婚櫎鏃х殑浜嬩欢鐩戝惉鍣?            const newBtn = btn.cloneNode(true);
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

// 璐拱鍗囩骇
function purchaseUpgrade(upgradeId) {
    const upgrade = gameState.upgrades[upgradeId];
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) {
        showMessage('宸茶揪鍒版渶楂樼瓑绾?);
        return;
    }
    
    const baseCosts = { tables: 200, tableSpeed: 150, kitchen: 250, waitingArea: 100 };
    const cost = Math.pow(2, upgrade.level) * baseCosts[upgradeId];
    
    if (gameState.gold < cost) {
        showMessage('閲戝竵涓嶈冻锛岄渶瑕?' + cost + ' 閲戝竵');
        return;
    }
    
    // 鎵ｉ櫎閲戝竵骞跺崌绾?    gameState.gold -= cost;
    upgrade.level++;
    
    // 搴旂敤鍗囩骇鏁堟灉
    applyUpgradeEffect(upgradeId);
    
    // 绔嬪嵆鏇存柊UI
    updateUI();
    
    showMessage(`${upgradeId === 'tables' ? '椁愭鏁伴噺' : upgradeId === 'tableSpeed' ? '缈诲彴閫熷害' : upgradeId === 'kitchen' ? '鍘ㄦ埧鏁堢巼' : '绛夊€欏尯'}鍗囩骇鍒?Lv.${upgrade.level}锛乣);
    
    // 鍒锋柊闈㈡澘
    showPanel('upgrade');
}

// 搴旂敤鍗囩骇鏁堟灉
function applyUpgradeEffect(upgradeId) {
    switch(upgradeId) {
        case 'tables':
            // 澧炲姞妗屽瓙
            addTable();
            break;
        case 'tableSpeed':
            // 缈诲彴閫熷害宸插湪 updateTables 涓娇鐢?            break;
        case 'kitchen':
            // 鍘ㄦ埧鏁堢巼宸插湪 updateKitchen 涓娇鐢?            break;
        case 'waitingArea':
            // 绛夊€欏尯瀹归噺澧炲姞
            gameState.waitingAreaCapacity = 4 + gameState.upgrades.waitingArea.level * 2;
            break;
    }
}

// 娣诲姞鏂版瀛?function addTable() {
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

// 娓叉煋鍛樺伐闈㈡澘
function renderStaffPanel() {
    let html = '<div class="panel-section"><h4>鍛樺伐鍒楄〃</h4><div class="item-grid">';
    for (const s of STAFF_DATA) {
        const hired = gameState.staff[s.id] !== null;
        const btnClass = hired ? 'hired-btn' : 'hire-btn';
        const btnText = hired ? '宸查泧浣? : `闆囦剑 楼${s.wage}`;
        html += `<div class="staff-item" data-staff-id="${s.id}">
            <div class="role">${s.name} - ${s.role}</div>
            <div class="wage">鏃ヨ柂: 楼${s.wage}/澶?/div>
            <button class="${btnClass}" data-staff-id="${s.id}" ${hired ? 'disabled' : ''}>${btnText}</button>
        </div>`;
    }
    html += '</div></div><div class="panel-section"><h4>鍛樺伐鐘舵€?/h4>';
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
    
    // 缁戝畾闆囦剑浜嬩欢 - 浣跨敤鐩存帴缁戝畾鏂瑰紡
    setTimeout(() => {
        const buttons = document.querySelectorAll('.hire-btn');
        buttons.forEach(btn => {
            // 绉婚櫎鏃х殑浜嬩欢鐩戝惉鍣?            const newBtn = btn.cloneNode(true);
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

// 鑾峰彇鍛樺伐鐘舵€佹枃鏈?function getStaffStatusText(staffId) {
    switch(staffId) {
        case 'server': return '绛夊緟涓婅彍...';
        case 'cashier': return '绛夊緟缁撹处...';
        case 'chef': return '绛夊緟鐑归オ...';
        case 'cleaner': return '绛夊緟鎵撴壂...';
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
        showMessage('閲戝竵涓嶈冻锛岄渶瑕?' + staffData.wage + ' 閲戝竵');
        return;
    }
    
    // 鎵ｉ櫎閲戝竵
    gameState.gold -= staffData.wage;
    
    // 闆囦剑鍛樺伐
    gameState.staff[staffId] = {
        ...staffData,
        hired: true,
        dailyWage: staffData.wage
    };
    
    // 绔嬪嵆鏇存柊UI
    updateUI();
    
    showMessage(`鎴愬姛闆囦剑 ${staffData.name}锛乣);
    
    // 鏂版墜鎸囧紩锛氶泧浣ｅ憳宸ュ悗鎺ㄨ繘鍒版楠?
    if (gameState.tutorial.step === 2) {
        gameState.tutorial.step = 3;
        // 3绉掑悗瀹屾垚鎸囧紩
        setTimeout(() => {
            gameState.tutorial.completed = true;
        }, 3000);
    }
    
    // 鍒锋柊闈㈡澘
    showPanel('staff');
}

// 娓叉煋浠撳簱闈㈡澘
function renderWarehousePanel() {
    const flavors = [
        { id: 'sour', name: '閰?, icon: '馃崑', color: '#f1c40f' },
        { id: 'sweet', name: '鐢?, icon: '馃崿', color: '#e91e63' },
        { id: 'bitter', name: '鑻?, icon: '馃ガ', color: '#27ae60' },
        { id: 'spicy', name: '杈?, icon: '馃尪锔?, color: '#e74c3c' },
        { id: 'salty', name: '鍜?, icon: '馃', color: '#3498db' },
    ];
    
    // 鑿滃搧鍚堟垚閰嶆柟
    const recipes = [
        { name: '閰歌荆姹?, ingredients: { sour: 2, spicy: 1 }, price: 25 },
        { name: '绯栭唻閲岃剨', ingredients: { sweet: 2, sour: 1 }, price: 28 },
        { name: '鑻︾摐鐐掕泲', ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        { name: '楹昏荆鐏攨', ingredients: { spicy: 3, salty: 1 }, price: 45 },
        { name: '鐩愭按楦?, ingredients: { salty: 2, sweet: 1 }, price: 30 },
    ];
    
    let html = '<div class="panel-section"><h4>浜斿懗鏍?/h4><div class="item-grid">';
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
    
    // 缁戝畾浜嬩欢
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

// 鍗囩骇浜斿懗鏍?function upgradeFlavorTree(flavorId) {
    const tree = gameState.flavorTrees[flavorId];
    const cost = Math.pow(2, tree.level) * 50;
    
    if (gameState.gold < cost) {
        showMessage('閲戝竵涓嶈冻锛岄渶瑕?' + cost + ' 閲戝竵');
        return;
    }
    
    gameState.gold -= cost;
    tree.level++;
    tree.production = tree.level;
    
    // 绔嬪嵆浜у嚭涓€浜涢鏉?    gameState.ingredients[flavorId] += tree.level * 2;
    
    showMessage(`${tree.name} 鍗囩骇鍒?Lv.${tree.level}锛乣);
    showPanel('warehouse');
}

// 鍚堟垚鑿滃搧
function craftDish(recipeName) {
    const recipes = {
        '閰歌荆姹?: { ingredients: { sour: 2, spicy: 1 }, price: 25 },
        '绯栭唻閲岃剨': { ingredients: { sweet: 2, sour: 1 }, price: 28 },
        '鑻︾摐鐐掕泲': { ingredients: { bitter: 2, sweet: 1 }, price: 20 },
        '楹昏荆鐏攨': { ingredients: { spicy: 3, salty: 1 }, price: 45 },
        '鐩愭按楦?: { ingredients: { salty: 2, sweet: 1 }, price: 30 },
    };
    
    const recipe = recipes[recipeName];
    if (!recipe) return;
    
    // 妫€鏌ユ潗鏂欐槸鍚﹁冻澶?    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        if (gameState.ingredients[flavor] < need) {
            showMessage('鏉愭枡涓嶈冻');
            return;
        }
    }
    
    // 娑堣€楁潗鏂?    for (const [flavor, need] of Object.entries(recipe.ingredients)) {
        gameState.ingredients[flavor] -= need;
    }
    
    // 鑾峰緱閲戝竵
    gameState.gold += recipe.price;
    
    showMessage(`鍚堟垚 ${recipeName} 鎴愬姛锛佽幏寰?楼${recipe.price}`);
    showPanel('warehouse');
}

// 鐢熸垚椤惧
function spawnCustomer() {
    // 鎵剧┖妗屽瓙
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    
    if (emptyTable) {
        // 鏈夌┖妗屽瓙锛屼粠宸︿晶杩涘叆
        const customer = new Customer();
        customer.status = 'entering';
        
        // 璁＄畻鐩爣浣嶇疆锛堟瀛愭梺杈癸級
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        // 璁剧疆妗屽瓙鐨勯【瀹?        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        
        // 鑷姩鐢熸垚璁㈠崟
        generateOrder(emptyTable);
    } else if (gameState.waitingQueue.length < gameState.waitingAreaCapacity) {
        // 妗屽瓙婊′簡锛屽幓绛夊€欏尯鎺掗槦
        const customer = new Customer();
        customer.status = 'waiting';
        // 绛夊€欏尯浣嶇疆
        customer.currentX = -50;
        customer.currentY = canvas.height / 2 + 100;
        gameState.waitingQueue.push(customer);
    }
    // 绛夊€欏尯婊′簡鍒欎笉鐢熸垚
}

// 灏嗘帓闃熺殑椤惧瀹夋帓鍒扮┖妗屽瓙
function seatWaitingCustomer() {
    const emptyTable = gameState.tables.find(t => t.status === 'empty');
    if (emptyTable && gameState.waitingQueue.length > 0) {
        const customer = gameState.waitingQueue.shift();
        customer.status = 'entering';
        
        // 璁＄畻鐩爣浣嶇疆
        const targetX = emptyTable.x + emptyTable.width / 2;
        const targetY = emptyTable.y - 30;
        customer.setTarget(targetX, targetY);
        
        emptyTable.customer = customer;
        emptyTable.status = 'occupied';
        
        // 鑷姩鐢熸垚璁㈠崟
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
    
    // 寮€濮嬬児楗?    startCooking(table);
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
    
    // 灏濊瘯瀹夋帓绛夊€欏尯鐨勯【瀹㈠埌绌烘瀛?    seatWaitingCustomer();
    
    // 鍛樺伐鑷姩宸ヤ綔
    staffAutoWork();
    
    // 鏇存柊鍘ㄦ埧
    updateKitchen(deltaTime);
    
    // 鏇存柊妗屽瓙鐘舵€?    updateTables(deltaTime);
    
    // 浜斿懗鏍戣嚜鍔ㄤ骇鍑猴紙姣?0绉掍骇鍑轰竴娆★級
    updateFlavorTrees(deltaTime);
    
    // 鏇存柊UI
    updateUI();
}

// 浜斿懗鏍戣嚜鍔ㄤ骇鍑?function updateFlavorTrees(deltaTime) {
    const PRODUCTION_INTERVAL = 10000; // 10绉?    
    for (const flavor in gameState.flavorTimers) {
        gameState.flavorTimers[flavor] += deltaTime;
        if (gameState.flavorTimers[flavor] >= PRODUCTION_INTERVAL) {
            gameState.flavorTimers[flavor] = 0;
            // 浜у嚭椋熸潗
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
                checkout(table);
                break; // 姣忓抚鍙鐞嗕竴妗?            }
        }
    }
    
    // 2. 鍘ㄥ笀鑷姩鐑归オ
    if (gameState.staff.chef) {
        // 鎵鹃渶瑕佺児楗殑妗屽瓙
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
                // 閲嶇疆妲戒綅
                slot.status = 'idle';
                slot.progress = 0;
                slot.dish = null;
                break;
            }
        }
    }
    
    // 4. 淇濇磥鑷姩鎵撴壂
    if (gameState.staff.cleaner) {
        for (const table of gameState.tables) {
            if (table.status === 'dirty') {
                // 淇濇磥鑷姩鎵撴壂
                const cleanSpeed = 1 + (gameState.staff.cleaner.efficiency - 1) * 0.5;
                table.dirtyTimer += 16 * cleanSpeed; // 鍋囪姣忓抚绾?6ms
                if (table.dirtyTimer >= CONFIG.CLEANING_DURATION) {
                    table.status = 'empty';
                    table.customer = null;
                    table.order = null;
                    table.food = null;
                    table.dirtyTimer = 0;
                }
                break; // 姣忓抚鍙鐞嗕竴妗?            }
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
                
                // 濡傛灉娌℃湁鏈嶅姟鍛橈紝绯荤粺鑷姩涓婅彍
                if (!gameState.staff.server) {
                    const table = gameState.tables.find(t => t.id === slot.tableId);
                    if (table) {
                        table.food = slot.dish;
                        table.status = 'eating';
                        table.eatingTimer = 0;
                    }
                    // 閲嶇疆妲戒綅
                    setTimeout(() => {
                        slot.status = 'idle';
                        slot.progress = 0;
                        slot.dish = null;
                    }, 500);
                }
                // 濡傛灉鏈夋湇鍔″憳锛岀瓑寰呮湇鍔″憳鏉ヤ笂鑿滐紙鍦╯taffAutoWork涓鐞嗭級
            }
        }
    }
}

// 鏇存柊妗屽瓙鐘舵€?function updateTables(deltaTime) {
    const eatingSpeed = 1 + (gameState.upgrades.tableSpeed.level - 1) * 0.2;
    
    for (const table of gameState.tables) {
        if (table.status === 'eating') {
            table.eatingTimer += deltaTime * eatingSpeed;
            if (table.eatingTimer >= CONFIG.EATING_DURATION) {
                // 椤惧寮€濮嬬寮€
                if (table.customer) {
                    table.customer.startLeaving();
                }
                table.status = 'waitingCheckout';
                // 濡傛灉娌℃湁鏀堕摱鍛橈紝绯荤粺鑷姩缁撹处
                if (!gameState.staff.cashier) {
                    setTimeout(() => checkout(table), 500);
                }
            }
        } else if (table.status === 'dirty') {
            // 濡傛灉娌℃湁淇濇磥锛岀郴缁熻嚜鍔ㄦ墦鎵?            if (!gameState.staff.cleaner) {
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
            
            // 濡傛灉椤惧宸茬寮€锛屾竻闄?            if (table.customer.status === 'left') {
                table.customer = null;
            }
        }
    }
}

// 缁撹处
function checkout(table) {
    if (table.order) {
        gameState.gold += table.order.total;
    }
    table.status = 'dirty';
}

// 鏇存柊UI
function updateUI() {
    document.getElementById('gold-display').textContent = gameState.gold;
    document.getElementById('gem-display').textContent = gameState.gems;
    document.getElementById('day-display').textContent = gameState.day;
}

// 娓叉煋娓告垙
function render() {
    // 娓呯┖鐢诲竷
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 缁樺埗鍦版澘
    drawFloor();
    
    // 缁樺埗鍘ㄦ埧鍖哄煙
    drawKitchen();
    
    // 缁樺埗妗屽瓙
    for (const table of gameState.tables) {
        table.draw();
    }
    
    // 缁樺埗绛夊緟鍖?    drawWaitingArea();
    
    // 缁樺埗鍘ㄦ埧杩涘害
    drawKitchenProgress();
    
    // 缁樺埗鍛樺伐
    drawStaff();
    
    // 缁樺埗鏂版墜鎸囧紩
    drawTutorialHint();
}

// 鍛樺伐鐘舵€?const staffAnimations = {
    server: { x: 280, y: 250, targetX: 280, targetY: 250, walkFrame: 0, walkTimer: 0 },
    cashier: { x: 450, y: 250, targetX: 450, targetY: 250, walkFrame: 0, walkTimer: 0 },
    chef: { x: 700, y: 300, targetX: 700, targetY: 300, walkFrame: 0, walkTimer: 0 },
    cleaner: { x: 350, y: 380, targetX: 350, targetY: 380, walkFrame: 0, walkTimer: 0 },
};

// 缁樺埗鍛樺伐
function drawStaff() {
    const isMobile = canvas.width < 800;
    const scale = isMobile ? 0.8 : 1;
    
    // 缁樺埗宸查泧浣ｇ殑鍛樺伐
    for (const [id, staff] of Object.entries(gameState.staff)) {
        if (!staff) continue;
        
        // 鑾峰彇鎴栧垵濮嬪寲鍔ㄧ敾鐘舵€?        let anim = staffAnimations[id];
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
        
        // 鍛樺伐闅忔満绉诲姩锛堟ā鎷熷伐浣滐級
        if (!anim.moving && Math.random() < 0.01) {
            // 闅忔満绉诲姩鍒版柊浣嶇疆
            const range = 50;
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
                anim.x += dx * 0.05;
                anim.y += dy * 0.05;
                
                // 琛岃蛋鍔ㄧ敾
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
        
        // Q鐗?.5澶磋韩鍛樺伐缁樺埗
        const baseSize = 15 * scale;
        
        // 琛岃蛋鏃剁殑涓婁笅鎽嗗姩
        const bounce = anim.moving ? Math.sin(anim.walkFrame * Math.PI / 2) * 2 : 0;
        
        // 韬綋
        ctx.fillStyle = '#3498db'; // 钃濊壊宸ヤ綔鏈?        ctx.beginPath();
        ctx.ellipse(x, y + bounce - baseSize * 0.3, baseSize * 0.7, baseSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 鍥磋 - 閲戣壊/鍥磋鏍囪瘑
        ctx.fillStyle = '#f39c12'; // 閲戣壊鍥磋
        ctx.fillRect(x - baseSize * 0.5, y + bounce - baseSize * 0.2, baseSize, baseSize * 0.7);
        
        // 澶撮儴
        ctx.fillStyle = '#ffd93d'; // 榛勮壊鐨偆
        ctx.beginPath();
        ctx.arc(x, y + bounce - baseSize * 1.4, baseSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // 澶村彂/甯藉瓙锛堟牴鎹鑹诧級
        if (id === 'chef') {
            // 鍘ㄥ笀甯?            ctx.fillStyle = '#fff';
            ctx.fillRect(x - baseSize * 0.6, y + bounce - baseSize * 2.2, baseSize * 1.2, baseSize * 0.6);
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 2.2, baseSize * 0.6, Math.PI, 0);
            ctx.fill();
        } else {
            // 鍛樺伐甯藉瓙
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x, y + bounce - baseSize * 1.8, baseSize * 0.7, Math.PI, 0);
            ctx.fill();
        }
        
        // 鐪肩潧
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - baseSize * 0.25, y + bounce - baseSize * 1.4, baseSize * 0.1, 0, Math.PI * 2);
        ctx.arc(x + baseSize * 0.25, y + bounce - baseSize * 1.4, baseSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // 鑴?        if (anim.moving) {
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
        
        // 鍛樺伐鍚嶇О鏍囩
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${10 * scale}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        ctx.fillText(staff.name, x, y - baseSize * 2.5);
        
        // 鍛樺伐瑙掕壊鏍囪瘑
        ctx.fillStyle = '#4ecdc4';
        ctx.font = `${8 * scale}px Microsoft YaHei`;
        ctx.fillText(staff.role, x, y + baseSize * 1.2);
    }
}

// 缁樺埗鏂版墜鎸囧紩
function drawTutorialHint() {
    const tutorial = gameState.tutorial;
    
    // 濡傛灉宸插畬鎴愶紝涓嶆樉绀烘寚寮?    if (tutorial.completed) return;
    
    const isMobile = canvas.width < 800;
    let hint = '';
    let targetX = 0;
    let targetY = 0;
    
    switch(tutorial.step) {
        case 0:
            // 鍒濆鐘舵€侊紝鎻愮ず鐐瑰嚮鍗囩骇鎸夐挳
            hint = '鐐瑰嚮涓嬫柟"鍗囩骇"鎸夐挳鏉ュ崌绾ц鏂斤紒';
            targetX = canvas.width / 2;
            targetY = canvas.height - 120;
            break;
        case 1:
            // 宸茬偣鍑诲崌绾э紝鎻愮ず鍗囩骇椁愭
            hint = '鐐瑰嚮"椁愭鏁伴噺"鍗囩骇鏉ュ鍔犳瀛愶紒';
            targetX = isMobile ? canvas.width * 0.3 : 350;
            targetY = isMobile ? canvas.height * 0.4 : 200;
            break;
        case 2:
            // 宸插崌绾ч妗岋紝鎻愮ず闆囦剑鍛樺伐
            hint = '鐐瑰嚮"鍛樺伐"闆囦剑鏈嶅姟鍛樻潵鑷姩宸ヤ綔锛?;
            targetX = canvas.width / 2;
            targetY = canvas.height - 120;
            break;
        case 3:
            // 鎻愮ず寮€濮嬫父鎴?            hint = '鎭枩锛佸紑濮嬬粡钀ヤ綘鐨勭伀閿呭簵鍚э紒';
            targetX = canvas.width / 2;
            targetY = canvas.height / 2;
            break;
    }
    
    if (!hint) return;
    
    // 缁樺埗鎸囧紩姘旀场
    const padding = 10;
    ctx.font = 'bold 14px Microsoft YaHei';
    const textWidth = ctx.measureText(hint).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 40;
    const boxX = targetX - boxWidth / 2;
    const boxY = targetY - 50;
    
    // 姘旀场鑳屾櫙
    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    
    // 鍦嗚鐭╁舰
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
    
    // 姘旀场绠ご
    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    ctx.beginPath();
    ctx.moveTo(targetX - 10, targetY - 10);
    ctx.lineTo(targetX + 10, targetY - 10);
    ctx.lineTo(targetX, targetY - 5);
    ctx.closePath();
    ctx.fill();
    
    // 姘旀场鏂囧瓧
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(hint, targetX, boxY + 26);
}

// 缁樺埗鍦版澘
function drawFloor() {
    const isMobile = canvas.width < 800;
    
    if (isMobile) {
        // 绉诲姩绔湴鏉垮崰婊℃暣涓敾甯冧笂鍗婇儴鍒?        const floorX = canvas.width * 0.05;
        const floorY = canvas.height * 0.08;
        const floorW = canvas.width * 0.9;
        const floorH = canvas.height * 0.55;
        
        ctx.fillStyle = '#3d3d54';
        ctx.fillRect(floorX, floorY, floorW, floorH);
        
        ctx.strokeStyle = '#4d4d64';
        ctx.lineWidth = 2;
        ctx.strokeRect(floorX, floorY, floorW, floorH);
    } else {
        // 妗岄潰绔浐瀹氬潗鏍?        ctx.fillStyle = '#3d3d54';
        ctx.fillRect(50, 80, 500, 400);
        
        ctx.strokeStyle = '#4d4d64';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 80, 500, 400);
    }
}

// 缁樺埗鍘ㄦ埧
function drawKitchen() {
    // 绉诲姩绔帹鎴垮尯鍩熷姩鎬佽绠?    const isMobile = canvas.width < 800;
    const kitchenX = isMobile ? canvas.width * 0.05 : 600;
    const kitchenW = isMobile ? canvas.width * 0.9 : 250;
    const kitchenY = isMobile ? canvas.height * 0.7 : 80;
    const kitchenH = isMobile ? canvas.height * 0.25 : 400;
    
    // 鍘ㄦ埧鍖哄煙鑳屾櫙
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(kitchenX, kitchenY, kitchenW, kitchenH);
    
    // 鍘ㄦ埧鏍囬
    ctx.fillStyle = '#ff6b6b';
    ctx.font = `bold ${isMobile ? 16 : 20}px Microsoft YaHei`;
    ctx.textAlign = 'center';
    ctx.fillText('鍘ㄦ埧', kitchenX + kitchenW / 2, kitchenY + 20);
    
    // 鐏跺彴
    for (let i = 0; i < gameState.kitchen.slots.length; i++) {
        const slot = gameState.kitchen.slots[i];
        const slotX = kitchenX + kitchenW * 0.1 + i * (kitchenW * 0.4);
        const slotY = kitchenY + kitchenH * 0.3;
        const slotW = kitchenW * 0.35;
        const slotH = kitchenH * 0.3;
        
        // 鐏跺彴
        ctx.fillStyle = slot.status === 'cooking' ? '#ff4444' : '#666';
        ctx.fillRect(slotX, slotY, slotW, slotH);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(slotX, slotY, slotW, slotH);
        
        // 杩涘害鏉¤儗鏅?        ctx.fillStyle = '#333';
        ctx.fillRect(slotX, slotY + slotH + 5, slotW, 8);
        
        // 杩涘害鏉?        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(slotX, slotY + slotH + 5, slotW * (slot.progress / 100), 8);
        
        // 鐘舵€佹枃瀛?        ctx.fillStyle = '#fff';
        ctx.font = `${isMobile ? 10 : 12}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        let statusText = '绌洪棽';
        if (slot.status === 'cooking') statusText = '鐑归オ涓?;
        if (slot.status === 'done') statusText = '宸插畬鎴?;
        ctx.fillText(statusText, slotX + slotW / 2, slotY + slotH + 22);
    }
}

// 缁樺埗鍘ㄦ埧杩涘害
function drawKitchenProgress() {
    // 宸茬粡鍦?drawKitchen 涓粯鍒?}

// 缁樺埗绛夊緟鍖?function drawWaitingArea() {
    const isMobile = canvas.width < 800;
    
    if (isMobile) {
        // 绉诲姩绔笉鏄剧ず绛夊緟鍖猴紙灞忓箷澶皬锛?        return;
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
    ctx.fillText(`绛夊€欏尯 (${gameState.waitingQueue.length}/${gameState.waitingAreaCapacity})`, waitX + waitW / 2, waitY + 30);
    
    // 鏄剧ず鎺掗槦鐨勯【瀹?    for (let i = 0; i < Math.min(gameState.waitingQueue.length, 6); i++) {
        const x = waitX + 30 + (i % 3) * 60;
        const y = waitY + 60 + Math.floor(i / 3) * 50;
        
        // 椤惧
        ctx.fillStyle = gameState.waitingQueue[i].color;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 椤惧鍚嶇О
        ctx.fillStyle = '#fff';
        ctx.font = '10px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.waitingQueue[i].name.substring(0, 2), x, y + 25);
    }
    
    // 绛夊緟妞咃紙绌轰綅锛?    for (let i = gameState.waitingQueue.length; i < Math.min(gameState.waitingAreaCapacity, 6); i++) {
        const x = waitX + 30 + (i % 3) * 60;
        const y = waitY + 60 + Math.floor(i / 3) * 50;
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 娓告垙涓诲惊鐜?function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    
    if (deltaTime < 100) { // 閬垮厤杩囧ぇ鐨勬椂闂磋烦璺?        update(deltaTime);
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

// 鍚姩娓告垙
init();


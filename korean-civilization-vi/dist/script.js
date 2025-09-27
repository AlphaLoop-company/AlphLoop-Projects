// ===== 전역 변수 및 게임 상태 =====
let gameState = {
    currentScreen: 'loading', // 'loading', 'menu', 'game'
    turn: 1,
    year: -4000,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    selectedUnit: null,
    selectedCity: null,
    selectedTile: null,
    
    resources: {
        food: 25,
        production: 18,
        gold: 150,
        science: 12,
        culture: 8,
        faith: 6
    },
    
    resourceGain: {
        food: 9,
        production: 3,
        gold: 8,
        science: 4,
        culture: 2,
        faith: 1
    },
    
    units: [],
    cities: [],
    
    technologies: {
        pottery: { name: '토기술', cost: 25, progress: 15, unlocks: ['곡창'] },
        agriculture: { name: '농업', cost: 50, progress: 10, unlocks: ['농장'] },
        animalHusbandry: { name: '목축업', cost: 25, progress: 0, unlocks: ['목장'] },
        mining: { name: '채광', cost: 25, progress: 0, unlocks: ['광산'] },
        sailing: { name: '항해술', cost: 50, progress: 0, unlocks: ['어선', '등대'] },
        archery: { name: '궁술', cost: 25, progress: 0, unlocks: ['궁수'] },
        bronzeWorking: { name: '청동 가공', cost: 35, progress: 0, unlocks: ['창병'] },
        wheel: { name: '바퀴', cost: 65, progress: 0, unlocks: ['전차'] },
        writing: { name: '문자', cost: 50, progress: 0, unlocks: ['도서관'] },
        masonry: { name: '석공술', cost: 80, progress: 0, unlocks: ['성벽'] }
    },
    
    civics: {
        codeOfLaws: { name: '법전', cost: 25, progress: 10, unlocks: ['정부 광장'] },
        foreignTrade: { name: '대외 무역', cost: 40, progress: 4, unlocks: ['교역로'] },
        craftsmanship: { name: '장인 정신', cost: 40, progress: 2, unlocks: ['작업장'] },
        earlyEmpire: { name: '초기 제국', cost: 70, progress: 0, unlocks: ['개척자'] },
        mysticism: { name: '신비주의', cost: 25, progress: 0, unlocks: ['신전'] },
        militaryTradition: { name: '군사 전통', cost: 50, progress: 0, unlocks: ['병영'] },
        stateWorkforce: { name: '국가 노동력', cost: 70, progress: 0, unlocks: ['건설자'] },
        politicalPhilosophy: { name: '정치 철학', cost: 110, progress: 0, unlocks: ['정부 형태'] }
    },
    
    diplomacy: {
        china: 'neutral',
        japan: 'hostile',
        mongol: 'friendly'
    },
    
    settings: {
        autoSave: true,
        animationSpeed: 1,
        notificationTime: 3000
    }
};

// 맵 데이터
const mapWidth = 20;
const mapHeight = 15;
let tileMap = [];

// 한국 문명 데이터
const koreanTerrain = [
    { name: '평원', food: 2, production: 1, gold: 0, movementCost: 1, color: '#8BC34A' }, // 밝은 녹색
    { name: '언덕', food: 0, production: 2, gold: 0, movementCost: 2, color: '#795548' }, // 갈색
    { name: '산', food: 0, production: 1, gold: 0, movementCost: 3, color: '#607D8B' }, // 회청색
    { name: '숲', food: 1, production: 1, gold: 0, movementCost: 2, color: '#4CAF50' }, // 진한 녹색
    { name: '바다', food: 1, production: 0, gold: 2, movementCost: 1, color: '#2196F3' }, // 파란색
    { name: '강', food: 2, production: 0, gold: 1, movementCost: 1, color: '#03A9F4' }, // 하늘색
    { name: '사막', food: 0, production: 0, gold: 1, movementCost: 1, color: '#FFC107' }, // 주황색
    { name: '툰드라', food: 1, production: 0, gold: 0, movementCost: 1, color: '#B0BEC5' }  // 밝은 회색
];

const koreanUnits = [
    { name: '이주민', type: 'settler', strength: 0, movement: 2, maxMovement: 2, cost: 80, abilities: ['도시 건설'] },
    { name: '전사', type: 'warrior', strength: 20, movement: 2, maxMovement: 2, cost: 40, abilities: ['근접 전투'] },
    { name: '정찰병', type: 'scout', strength: 10, movement: 3, maxMovement: 3, cost: 30, abilities: ['빠른 이동', '지형 무시'] },
    { name: '지휘관', type: 'commander', strength: 25, movement: 2, maxMovement: 2, cost: 60, abilities: ['부대 지휘', '사기 증진'] },
    { name: '개척자', type: 'settler', strength: 0, movement: 2, maxMovement: 2, cost: 80, abilities: ['도시 건설'] },
    { name: '탐험가', type: 'explorer', strength: 15, movement: 4, maxMovement: 4, cost: 50, abilities: ['장거리 탐험', '해상 이동'] },
    { name: '건설자', type: 'builder', strength: 0, movement: 2, maxMovement: 2, cost: 50, abilities: ['개선시설 건설'] },
    { name: '궁수', type: 'archer', strength: 25, movement: 2, maxMovement: 2, cost: 60, abilities: ['원거리 공격'] },
    { name: '창병', type: 'spearman', strength: 25, movement: 2, maxMovement: 2, cost: 65, abilities: ['기병 방어'] },
    { name: '화랑', type: 'hwarang', strength: 30, movement: 2, maxMovement: 2, cost: 100, abilities: ['문화 생산', '신앙 생산'] }
];

const koreanBuildings = [
    { name: '궁전', type: 'palace', cost: 0, maintenance: 0, effects: { food: 2, production: 2, gold: 5, science: 2, culture: 1 } },
    { name: '곡창', type: 'granary', cost: 60, maintenance: 1, effects: { food: 2 }, requires: 'pottery' },
    { name: '도서관', type: 'library', cost: 90, maintenance: 1, effects: { science: 2 }, requires: 'writing' },
    { name: '병영', type: 'barracks', cost: 80, maintenance: 1, effects: { production: 1 }, requires: 'militaryTradition' },
    { name: '시장', type: 'market', cost: 120, maintenance: 0, effects: { gold: 3 }, requires: 'foreignTrade' },
    { name: '작업장', type: 'workshop', cost: 100, maintenance: 1, effects: { production: 2 }, requires: 'craftsmanship' },
    { name: '신전', type: 'temple', cost: 70, maintenance: 1, effects: { faith: 2 }, requires: 'mysticism' },
    { name: '성벽', type: 'walls', cost: 80, maintenance: 0, effects: { defense: 3 }, requires: 'masonry' },
    { name: '등대', type: 'lighthouse', cost: 120, maintenance: 1, effects: { food: 1, gold: 2 }, requires: 'sailing' },
    { name: '서원', type: 'seowon', cost: 150, maintenance: 1, effects: { science: 4 }, requires: 'education', unique: true }
];

const koreanImprovements = [
    { name: '농장', type: 'farm', cost: 3, effects: { food: 1 }, requires: 'agriculture', terrain: ['평원', '언덕'] },
    { name: '광산', type: 'mine', cost: 4, effects: { production: 1 }, requires: 'mining', terrain: ['언덕', '산'] },
    { name: '목장', type: 'pasture', cost: 3, effects: { food: 1, production: 1 }, requires: 'animalHusbandry', terrain: ['평원'] },
    { name: '어선', type: 'fishingBoat', cost: 2, effects: { food: 1 }, requires: 'sailing', terrain: ['바다'] },
    { name: '채석장', type: 'quarry', cost: 4, effects: { production: 2 }, requires: 'masonry', terrain: ['언덕'] },
    { name: '벌목장', type: 'lumberMill', cost: 3, effects: { production: 1 }, requires: 'machinery', terrain: ['숲'] },
    { name: '요새', type: 'fort', cost: 4, effects: { defense: 2 }, requires: 'engineering', terrain: ['언덕', '평원'] }
];

// 캔버스 및 렌더링 변수
let canvas, ctx, minimap, minimapCtx;
let hexSize = 30;

// ===== 초기화 함수 =====
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    startLoadingSequence();
});

function initializeGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    minimap = document.getElementById('minimap');
    minimapCtx = minimap.getContext('2d');
    
    // 캔버스 크기 조정
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 맵 생성
    generateMap();
    
    // 초기 유닛 및 도시 생성
    createInitialUnits();
    createInitialCities();
    
    // UI 업데이트
    updateAllUI();
}

function resizeCanvas() {
    // 기존 코드의 문제: canvas-container가 없거나 크기가 0
    const container = document.getElementById('canvas-container');
    
    if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    } else {
        // 대안: 윈도우 크기 기준으로 설정
        const leftPanelWidth = 320; // 좌측 패널 너비
        const rightPanelWidth = 320; // 우측 패널 너비
        const topBarHeight = 80; // 상단 바 높이
        const bottomBarHeight = 100; // 하단 바 높이
        
        canvas.width = window.innerWidth - leftPanelWidth - rightPanelWidth;
        canvas.height = window.innerHeight - topBarHeight - bottomBarHeight;
        
        // 최소 크기 보장
        if (canvas.width < 400) canvas.width = 400;
        if (canvas.height < 300) canvas.height = 300;
    }
    
    console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
}

function setupEventListeners() {
    // 캔버스 이벤트
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('wheel', handleCanvasWheel);
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyDown);
    
    // 툴팁 이벤트
    document.addEventListener('mouseover', handleTooltipShow);
    document.addEventListener('mouseout', handleTooltipHide);
    
    // 터치 이벤트 (모바일 지원)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// ===== 로딩 시퀀스 =====
function startLoadingSequence() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.loading-progress');
    const percentage = document.querySelector('.loading-percentage');
    const tips = [
        '팁: 기술 연구를 통해 새로운 유닛과 건물을 잠금 해제하세요!',
        '팁: 도시 주변에 개선시설을 건설하여 자원 생산량을 늘리세요!',
        '팁: 외교를 통해 다른 문명과 평화롭게 공존하거나 동맹을 맺으세요!',
        '팁: 문화와 신앙을 발전시켜 사회 제도를 개발하세요!',
        '팁: 정찰병을 보내 새로운 땅을 탐험하고 자원을 발견하세요!'
    ];
    
    let progress = 0;
    let tipIndex = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        percentage.textContent = Math.floor(progress) + '%';
        
        // 팁 변경
        if (Math.random() < 0.3) {
            tipIndex = (tipIndex + 1) % tips.length;
            document.getElementById('loading-tip').textContent = tips[tipIndex];
        }
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.remove('visible');
                document.getElementById('main-menu').classList.add('visible');
                gameState.currentScreen = 'menu';
            }, 500);
        }
    }, 200);
}

// ===== 메뉴 함수들 =====
function startNewGame() {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    
    mainMenu.classList.remove('visible');
    setTimeout(() => {
        gameContainer.classList.add('visible');
        gameState.currentScreen = 'game';
        render();
        updateAllUI();
        showNotification('새로운 게임이 시작되었습니다! 한국의 위대한 역사를 써내려가세요!', 'success');
    }, 300);
}

function loadGame() {
    const saveData = localStorage.getItem('civilizationSave');
    if (saveData) {
        try {
            const parsed = JSON.parse(saveData);
            gameState = { ...gameState, ...parsed.gameState };
            tileMap = parsed.tileMap || tileMap;
            
            const mainMenu = document.getElementById('main-menu');
            const gameContainer = document.getElementById('game-container');
            
            mainMenu.classList.remove('visible');
            setTimeout(() => {
                gameContainer.classList.add('visible');
                gameState.currentScreen = 'game';
                updateAllUI();
                render();
                showNotification('게임이 성공적으로 불러와졌습니다!', 'success');
            }, 300);
        } catch (error) {
            showNotification('저장된 게임을 불러오는 중 오류가 발생했습니다.', 'error');
        }
    } else {
        showNotification('저장된 게임이 없습니다.', 'warning');
    }
}

function showMultiplayer() {
    showModal('멀티플레이', `
        <div style="text-align: center; padding: 2rem;">
            <h3>멀티플레이 기능</h3>
            <p style="margin: 1rem 0;">온라인 멀티플레이 기능이 곧 출시됩니다!</p>
            <div style="margin: 2rem 0;">
                <button class="action-btn primary" onclick="closeModal()" style="margin: 0.5rem;">
                    <i class="fas fa-check"></i> 확인
                </button>
            </div>
        </div>
    `);
}

function showOptions() {
    showModal('게임 옵션', `
        <div style="padding: 1rem;">
            <h3>게임 설정</h3>
            <table style="width: 100%; margin-top: 1rem;">
                <tr>
                    <td>자동 저장</td>
                    <td><input type="checkbox" id="auto-save-option" ${gameState.settings.autoSave ? 'checked' : ''}></td>
                </tr>
                <tr>
                    <td>애니메이션 속도</td>
                    <td><input type="range" id="animation-speed-option" min="0.5" max="2" step="0.1" value="${gameState.settings.animationSpeed}"></td>
                </tr>
                <tr>
                    <td>알림 표시 시간 (초)</td>
                    <td><input type="range" id="notification-time-option" min="1" max="10" step="1" value="${gameState.settings.notificationTime / 1000}"></td>
                </tr>
            </table>
            <div style="text-align: center; margin-top: 2rem;">
                <button class="action-btn primary" onclick="applyGameOptions()" style="margin: 0.5rem;">
                    <i class="fas fa-check"></i> 적용
                </button>
                <button class="action-btn secondary" onclick="closeModal()" style="margin: 0.5rem;">
                    <i class="fas fa-times"></i> 취소
                </button>
            </div>
        </div>
    `);
}

function applyGameOptions() {
    gameState.settings.autoSave = document.getElementById('auto-save-option').checked;
    gameState.settings.animationSpeed = parseFloat(document.getElementById('animation-speed-option').value);
    gameState.settings.notificationTime = parseInt(document.getElementById('notification-time-option').value) * 1000;
    
    showNotification('설정이 적용되었습니다!', 'success');
    closeModal();
}

function showCredits() {
    showModal('크레딧', `
        <div style="text-align: center; padding: 2rem;">
            <h3>한국판 시드 마이어의 문명 VI</h3>
            <p style="margin: 1rem 0;">고급 에디션</p>
            <div style="margin: 2rem 0; text-align: left;">
                <p><strong>개발:</strong> AI Assistant</p>
                <p><strong>디자인:</strong> 한국 전통 미학 + 현대적 감각</p>
                <p><strong>기술:</strong> HTML5, CSS3, JavaScript</p>
                <p><strong>영감:</strong> 시드 마이어의 문명 시리즈</p>
                <p><strong>특별 감사:</strong> 한국의 위대한 역사와 문화</p>
            </div>
            <button class="action-btn primary" onclick="closeModal()">
                <i class="fas fa-check"></i> 확인
            </button>
        </div>
    `);
}

function exitGame() {
    if (confirm('정말로 게임을 종료하시겠습니까?')) {
        window.close();
    }
}

// ===== 맵 생성 =====
function generateMap() {
    tileMap = [];
    for (let y = 0; y < mapHeight; y++) {
        tileMap[y] = [];
        for (let x = 0; x < mapWidth; x++) {
            const terrainIndex = Math.floor(Math.random() * koreanTerrain.length);
            const terrain = koreanTerrain[terrainIndex];
            
            tileMap[y][x] = {
                x: x,
                y: y,
                terrain: terrain,
                discovered: false,
                unit: null,
                city: null,
                improvement: null,
                resource: Math.random() < 0.3 ? getRandomResource() : null
            };
        }
    }
    
    // 시작 지점 주변 발견
    const startX = Math.floor(mapWidth / 2);
    const startY = Math.floor(mapHeight / 2);
    discoverTilesAround(startX, startY, 3);
}

function getRandomResource() {
    const resources = ['쌀', '철', '말', '금', '석재', '목재', '물고기', '소금', '비단', '차'];
    return resources[Math.floor(Math.random() * resources.length)];
}

function createInitialUnits() {
    const startX = Math.floor(mapWidth / 2);
    const startY = Math.floor(mapHeight / 2);
    
    // 초기 유닛들 생성
    const initialUnits = [
        { name: '이주민', type: 'settler', x: startX, y: startY },
        { name: '전사', type: 'warrior', x: startX + 1, y: startY },
        { name: '정찰병', type: 'scout', x: startX - 1, y: startY },
        { name: '지휘관', type: 'commander', x: startX, y: startY + 1 },
        { name: '개척자', type: 'settler', x: startX + 1, y: startY + 1 },
        { name: '탐험가', type: 'explorer', x: startX - 1, y: startY - 1 },
        { name: '건설자', type: 'builder', x: startX, y: startY - 1 }
    ];
    
    gameState.units = [];
    initialUnits.forEach((unitData, index) => {
        const unitTemplate = koreanUnits.find(u => u.name === unitData.name);
        if (unitTemplate && tileMap[unitData.y] && tileMap[unitData.y][unitData.x]) {
            const unit = {
                id: `unit_${index + 1}`,
                name: unitTemplate.name,
                type: unitTemplate.type,
                strength: unitTemplate.strength,
                movement: unitTemplate.maxMovement,
                maxMovement: unitTemplate.maxMovement,
                x: unitData.x,
                y: unitData.y,
                experience: 0,
                health: 100,
                abilities: unitTemplate.abilities || []
            };
            
            gameState.units.push(unit);
            tileMap[unitData.y][unitData.x].unit = unit;
        }
    });
    
    // 첫 번째 유닛 선택
    if (gameState.units.length > 0) {
        selectUnit(gameState.units[1]); // 전사 선택
    }
}

function createInitialCities() {
    const startX = Math.floor(mapWidth / 2);
    const startY = Math.floor(mapHeight / 2);
    
    // 수도 생성
    const capital = {
        id: 'city_1',
        name: '서울',
        x: startX,
        y: startY,
        population: 1,
        growthProgress: 0,
        growthThreshold: 15,
        productionQueue: [
            { name: '전사', type: 'unit', cost: 40, progress: 13 }
        ],
        buildings: [
            { name: '궁전', type: 'palace' }
        ]
    };
    
    gameState.cities = [capital];
    tileMap[startY][startX].city = capital;
}

// ===== 렌더링 =====
function render() {
    if (!ctx || gameState.currentScreen !== 'game') return;
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2F4F2F');
    gradient.addColorStop(1, '#1a3a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 헥사곤 타일 렌더링
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tile = tileMap[y][x];
            if (tile.discovered) {
                renderHexTile(x, y, tile);
            }
        }
    }
    
    // 유닛 렌더링
    gameState.units.forEach(unit => {
        if (tileMap[unit.y][unit.x].discovered) {
            renderUnit(unit);
        }
    });
    
    // 도시 렌더링
    gameState.cities.forEach(city => {
        if (tileMap[city.y][city.x].discovered) {
            renderCity(city);
        }
    });
    
    // 선택된 타일 하이라이트
    if (gameState.selectedTile) {
        renderTileHighlight(gameState.selectedTile.x, gameState.selectedTile.y, '#00FFFF');
    }
    
    // 선택된 유닛 하이라이트
    if (gameState.selectedUnit) {
        renderTileHighlight(gameState.selectedUnit.x, gameState.selectedUnit.y, '#FFD700');
    }
    
    // 미니맵 렌더링
    renderMinimap();
}

function renderHexTile(x, y, tile) {
    const screenPos = hexToScreen(x, y);
    const size = hexSize * gameState.zoom;
    
    // 헥사곤 그리기
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = screenPos.x + size * Math.cos(angle);
        const py = screenPos.y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    
    // 타일 색상
    ctx.fillStyle = tile.terrain.color;
    ctx.fill();
    
    // 테두리
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 자원 표시
    if (tile.resource) {
        ctx.fillStyle = '#FFD700';
        ctx.font = `${Math.max(8, size * 0.3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(tile.resource, screenPos.x, screenPos.y + size * 0.6);
    }
    
    // 개선시설 표시
    if (tile.improvement) {
        ctx.fillStyle = '#8B4513';
        ctx.font = `${Math.max(6, size * 0.2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(tile.improvement.name, screenPos.x, screenPos.y - size * 0.6);
    }
}

function renderUnit(unit) {
    const screenPos = hexToScreen(unit.x, unit.y);
    const size = hexSize * gameState.zoom * 0.6;
    
    // 유닛 배경 원
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = unit === gameState.selectedUnit ? '#00FFFF' : '#8B4513';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 유닛 텍스트
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(10, size * 0.8)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.name.charAt(0), screenPos.x, screenPos.y);
    
    // 체력 바
    if (unit.health < 100) {
        const barWidth = size * 1.5;
        const barHeight = 4;
        const barY = screenPos.y + size + 8;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(screenPos.x - barWidth/2, barY, barWidth, barHeight);
        
        ctx.fillStyle = unit.health > 50 ? '#4CAF50' : unit.health > 25 ? '#FF9800' : '#F44336';
        ctx.fillRect(screenPos.x - barWidth/2, barY, barWidth * (unit.health / 100), barHeight);
    }
    
    // 이동력 표시
    if (unit.movement < unit.maxMovement) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${Math.max(8, size * 0.4)}px Arial`;
        ctx.fillText(`${unit.movement}/${unit.maxMovement}`, screenPos.x, screenPos.y + size + 20);
    }
}

function renderCity(city) {
    const screenPos = hexToScreen(city.x, city.y);
    const size = hexSize * gameState.zoom * 0.8;
    
    // 도시 배경
    ctx.beginPath();
    ctx.rect(screenPos.x - size, screenPos.y - size, size * 2, size * 2);
    ctx.fillStyle = city === gameState.selectedCity ? '#00FFFF' : '#D2691E';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 도시 이름
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(10, size * 0.5)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(city.name, screenPos.x, screenPos.y);
    
    // 인구 표시
    ctx.font = `${Math.max(8, size * 0.3)}px Arial`;
    ctx.fillText(`인구: ${city.population}`, screenPos.x, screenPos.y + size + 15);
}

function renderTileHighlight(x, y, color) {
    const screenPos = hexToScreen(x, y);
    const size = hexSize * gameState.zoom;
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = screenPos.x + size * Math.cos(angle);
        const py = screenPos.y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 글로우 효과
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function renderMinimap() {
    if (!minimapCtx) return;
    
    minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
    
    const scaleX = minimap.width / mapWidth;
    const scaleY = minimap.height / mapHeight;
    
    // 타일 렌더링
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tile = tileMap[y][x];
            if (tile.discovered) {
                minimapCtx.fillStyle = tile.terrain.color;
                minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
            } else {
                minimapCtx.fillStyle = '#000000';
                minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
            }
        }
    }
    
    // 도시 표시
    gameState.cities.forEach(city => {
        minimapCtx.fillStyle = '#FFD700';
        minimapCtx.fillRect(city.x * scaleX - 1, city.y * scaleY - 1, 3, 3);
    });
    
    // 유닛 표시
    gameState.units.forEach(unit => {
        minimapCtx.fillStyle = '#00FFFF';
        minimapCtx.fillRect(unit.x * scaleX, unit.y * scaleY, 2, 2);
    });
}

// ===== 좌표 변환 =====
function hexToScreen(x, y) {
    const offsetX = gameState.offsetX + canvas.width / 2;
    const offsetY = gameState.offsetY + canvas.height / 2;
    
    const screenX = offsetX + (x * hexSize * 1.5) * gameState.zoom;
    const screenY = offsetY + (y * hexSize * Math.sqrt(3) + (x % 2) * hexSize * Math.sqrt(3) / 2) * gameState.zoom;
    
    return { x: screenX, y: screenY };
}

function screenToHex(screenX, screenY) {
    const offsetX = gameState.offsetX + canvas.width / 2;
    const offsetY = gameState.offsetY + canvas.height / 2;
    
    const x = (screenX - offsetX) / (hexSize * 1.5 * gameState.zoom);
    const y = (screenY - offsetY - (Math.floor(x) % 2) * hexSize * Math.sqrt(3) / 2 * gameState.zoom) / (hexSize * Math.sqrt(3) * gameState.zoom);
    
    return { x: Math.round(x), y: Math.round(y) };
}

// ===== 이벤트 처리 =====
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hexCoords = screenToHex(x, y);
    
    if (hexCoords.x >= 0 && hexCoords.x < mapWidth && hexCoords.y >= 0 && hexCoords.y < mapHeight) {
        const tile = tileMap[hexCoords.y][hexCoords.x];
        
        if (tile.discovered) {
            // 타일 선택
            gameState.selectedTile = tile;
            
            // 유닛이 있으면 유닛 선택
            if (tile.unit) {
                selectUnit(tile.unit);
            } else if (tile.city) {
                selectCity(tile.city);
            } else {
                // 선택된 유닛이 있고 이동 가능하면 이동
                if (gameState.selectedUnit && gameState.selectedUnit.movement > 0) {
                    moveUnitTo(gameState.selectedUnit, hexCoords.x, hexCoords.y);
                }
            }
            
            updateAllUI();
            render();
        }
    }
}

function handleCanvasMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hexCoords = screenToHex(x, y);
    
    if (hexCoords.x >= 0 && hexCoords.x < mapWidth && hexCoords.y >= 0 && hexCoords.y < mapHeight) {
        const tile = tileMap[hexCoords.y][hexCoords.x];
        if (tile.discovered) {
            showTooltip(event.clientX, event.clientY, tile);
        } else {
            hideTooltip();
        }
    } else {
        hideTooltip();
    }
}

function handleCanvasWheel(event) {
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    gameState.zoom = Math.max(0.3, Math.min(3, gameState.zoom * zoomFactor));
    
    render();
}

function handleKeyDown(event) {
    if (gameState.currentScreen !== 'game') return;
    
    switch (event.key) {
        case 'Enter':
        case ' ':
            nextTurn();
            break;
        case 'Escape':
            showGameMenu();
            break;
        case 'ArrowUp':
        case 'w':
            gameState.offsetY += 20;
            render();
            break;
        case 'ArrowDown':
        case 's':
            gameState.offsetY -= 20;
            render();
            break;
        case 'ArrowLeft':
        case 'a':
            gameState.offsetX += 20;
            render();
            break;
        case 'ArrowRight':
        case 'd':
            gameState.offsetX -= 20;
            render();
            break;
        case '+':
        case '=':
            zoomIn();
            break;
        case '-':
            zoomOut();
            break;
    }
}

// 터치 이벤트 처리 (모바일 지원)
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
}

function handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        gameState.offsetX += deltaX;
        gameState.offsetY += deltaY;
        
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        render();
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    if (touchDuration < 200) { // 짧은 터치는 클릭으로 처리
        const touch = event.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
        handleCanvasClick(fakeEvent);
    }
}

// ===== 툴팁 시스템 =====
function handleTooltipShow(event) {
    const element = event.target;
    const tooltip = element.getAttribute('data-tooltip');
    
    if (tooltip) {
        showTooltipText(event.clientX, event.clientY, tooltip);
    }
}

function handleTooltipHide(event) {
    const element = event.target;
    if (element.getAttribute('data-tooltip')) {
        hideTooltip();
    }
}

function showTooltip(x, y, tile) {
    const tooltip = document.getElementById('tooltip');
    
    if (tile && tile.discovered) {
        let tooltipContent = `<strong>${tile.terrain.name}</strong><br>`;
        tooltipContent += `식량: ${tile.terrain.food}, 생산력: ${tile.terrain.production}, 금: ${tile.terrain.gold}<br>`;
        
        if (tile.resource) {
            tooltipContent += `자원: ${tile.resource}<br>`;
        }
        
        if (tile.improvement) {
            tooltipContent += `개선시설: ${tile.improvement.name}<br>`;
        }
        
        if (tile.unit) {
            tooltipContent += `<strong>유닛: ${tile.unit.name}</strong><br>`;
            tooltipContent += `전투력: ${tile.unit.strength || '-'}, 이동력: ${tile.unit.movement}/${tile.unit.maxMovement}<br>`;
            tooltipContent += `체력: ${tile.unit.health}/100<br>`;
        }
        
        if (tile.city) {
            tooltipContent += `<strong>도시: ${tile.city.name}</strong><br>`;
            tooltipContent += `인구: ${tile.city.population}<br>`;
        }
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y + 10) + 'px';
        tooltip.style.display = 'block';
    } else {
        hideTooltip();
    }
}

function showTooltipText(x, y, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = text;
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y + 10) + 'px';
    tooltip.style.display = 'block';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

// ===== 게임 로직 =====
function selectUnit(unit) {
    gameState.selectedUnit = unit;
    gameState.selectedCity = null;
    updateUnitPanel();
    render();
}

function selectCity(city) {
    gameState.selectedCity = city;
    gameState.selectedUnit = null;
    updateCityPanel();
    render();
}

function moveUnitTo(unit, targetX, targetY) {
    const currentTile = tileMap[unit.y][unit.x];
    const targetTile = tileMap[targetY][targetX];

    if (!targetTile.discovered) {
        showNotification('미발견 지역으로는 이동할 수 없습니다.', 'warning');
        return;
    }

    const movementCost = targetTile.terrain.movementCost;

    if (unit.movement >= movementCost) {
        if (targetTile.unit && targetTile.unit !== unit) {
            showNotification('해당 위치에 다른 유닛이 있습니다.', 'warning');
            return;
        }
        
        // 현재 위치에서 유닛 제거
        currentTile.unit = null;
        
        // 새 위치로 이동
        unit.x = targetX;
        unit.y = targetY;
        unit.movement -= movementCost;
        targetTile.unit = unit;
        
        // 주변 타일 발견
        discoverTilesAround(targetX, targetY, 2);
        
        updateUnitPanel();
        showNotification(`${unit.name}이(가) 이동했습니다.`, 'success');
        render();
    } else {
        showNotification('이동력이 부족합니다.', 'warning');
    }
}

function discoverTilesAround(centerX, centerY, radius) {
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const nx = centerX + dx;
            const ny = centerY + dy;
            if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
                tileMap[ny][nx].discovered = true;
            }
        }
    }
}

function nextTurn() {
    gameState.turn++;
    
    // 자원 증가
    for (let resource in gameState.resourceGain) {
        gameState.resources[resource] += gameState.resourceGain[resource];
    }
    
    // 모든 유닛 이동력 회복
    gameState.units.forEach(unit => {
        unit.movement = unit.maxMovement;
    });
    
    // 도시 성장 및 생산
    gameState.cities.forEach(city => {
        // 인구 성장
        city.growthProgress += gameState.resources.food;
        if (city.growthProgress >= city.growthThreshold) {
            city.population++;
            city.growthProgress = 0;
            city.growthThreshold = calculateGrowthThreshold(city.population);
            showNotification(`${city.name}의 인구가 ${city.population}으로 증가했습니다!`, 'success');
        }

        // 생산 진행
        if (city.productionQueue.length > 0) {
            const currentProductionItem = city.productionQueue[0];
            currentProductionItem.progress += gameState.resources.production;

            if (currentProductionItem.progress >= currentProductionItem.cost) {
                completeProduction(city, currentProductionItem);
                city.productionQueue.shift();
            }
        }
    });
    
    // 기술 및 사회 제도 진행
    updateTechnologiesProgress();
    updateCivicsProgress();
    
    // 연도 계산
    updateYear();
    
    // 자동 저장
    if (gameState.settings.autoSave && gameState.turn % 5 === 0) {
        saveGame();
    }
    
    updateAllUI();
    render();
    
    showNotification(`턴 ${gameState.turn} 시작!`, 'success');
}

function updateYear() {
    if (gameState.turn <= 60) {
        gameState.year = -4000 + (gameState.turn - 1) * 50;
    } else if (gameState.turn <= 160) {
        gameState.year = -1000 + (gameState.turn - 60) * 25;
    } else {
        gameState.year = 1500 + (gameState.turn - 160) * 1;
    }
}

function calculateGrowthThreshold(population) {
    return 10 + population * 5;
}

function completeProduction(city, item) {
    if (item.type === 'unit') {
        const unitData = koreanUnits.find(u => u.name === item.name);
        if (unitData) {
            const newUnit = {
                id: `unit_${Date.now()}`,
                name: unitData.name,
                type: unitData.type,
                strength: unitData.strength,
                movement: unitData.maxMovement,
                maxMovement: unitData.maxMovement,
                x: city.x,
                y: city.y,
                experience: 0,
                health: 100,
                abilities: unitData.abilities || []
            };
            
            const spawnTile = findEmptyAdjacentTile(city.x, city.y);
            if (spawnTile) {
                newUnit.x = spawnTile.x;
                newUnit.y = spawnTile.y;
                tileMap[spawnTile.y][spawnTile.x].unit = newUnit;
                gameState.units.push(newUnit);
                showNotification(`${city.name}에서 ${newUnit.name}이(가) 생산되었습니다!`, 'success');
            } else {
                showNotification(`${city.name} 주변에 유닛을 생성할 공간이 없습니다.`, 'warning');
            }
        }
    }
}

function findEmptyAdjacentTile(x, y) {
    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];

    for (const dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight && 
            !tileMap[ny][nx].unit && !tileMap[ny][nx].city) {
            return tileMap[ny][nx];
        }
    }
    return null;
}

function updateTechnologiesProgress() {
    for (const techKey in gameState.technologies) {
        const tech = gameState.technologies[techKey];
        if (tech.progress < tech.cost) {
            tech.progress += gameState.resources.science;
            if (tech.progress >= tech.cost) {
                tech.progress = tech.cost;
                showNotification(`${tech.name} 기술 연구 완료!`, 'success');
            }
        }
    }
}

function updateCivicsProgress() {
    for (const civicKey in gameState.civics) {
        const civic = gameState.civics[civicKey];
        if (civic.progress < civic.cost) {
            civic.progress += gameState.resources.culture;
            if (civic.progress >= civic.cost) {
                civic.progress = civic.cost;
                showNotification(`${civic.name} 사회 제도 개발 완료!`, 'success');
            }
        }
    }
}

// ===== UI 업데이트 =====
function updateAllUI() {
    updateResourceDisplay();
    updateTechCivicPanels();
    updateUnitPanel();
    updateCityPanel();
}

function updateResourceDisplay() {
    document.getElementById('food-display').textContent = gameState.resources.food;
    document.getElementById('production-display').textContent = gameState.resources.production;
    document.getElementById('gold-display').textContent = gameState.resources.gold;
    document.getElementById('science-display').textContent = gameState.resources.science;
    document.getElementById('culture-display').textContent = gameState.resources.culture;
    document.getElementById('faith-display').textContent = gameState.resources.faith;
    
    document.getElementById('food-gain').textContent = `(+${gameState.resourceGain.food})`;
    document.getElementById('production-gain').textContent = `(+${gameState.resourceGain.production})`;
    document.getElementById('gold-gain').textContent = `(+${gameState.resourceGain.gold})`;
    document.getElementById('science-gain').textContent = `(+${gameState.resourceGain.science})`;
    document.getElementById('culture-gain').textContent = `(+${gameState.resourceGain.culture})`;
    document.getElementById('faith-gain').textContent = `(+${gameState.resourceGain.faith})`;
    
    document.getElementById('turn-number').textContent = gameState.turn;
    
    const yearText = gameState.year < 0 ? `${Math.abs(gameState.year)} BC` : `${gameState.year} AD`;
    document.getElementById('year-display').textContent = yearText;
}

function updateTechCivicPanels() {
    // 기술 연구 업데이트
    const techSection = document.querySelector('#tech-section .section-content');
    if (techSection) {
        let techHtml = '';
        for (const techKey in gameState.technologies) {
            const tech = gameState.technologies[techKey];
            const progressPercent = Math.floor((tech.progress / tech.cost) * 100);
            const turnsRemaining = Math.ceil((tech.cost - tech.progress) / Math.max(1, gameState.resources.science));
            
            techHtml += `
                <div class="research-item" data-tech="${techKey}" onclick="researchTech('${techKey}')">
                    <div class="research-header">
                        <span class="research-name">${tech.name}</span>
                        <span class="research-turns">${turnsRemaining > 0 ? turnsRemaining + '턴' : '완료'}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                        <span class="progress-text">${progressPercent}%</span>
                    </div>
                    <div class="research-benefits">
                        ${tech.unlocks ? tech.unlocks.map(unlock => `<span class="benefit-tag">${unlock}</span>`).join('') : ''}
                    </div>
                </div>
            `;
        }
        techSection.innerHTML = techHtml;
    }
    
    // 사회 제도 업데이트
    const civicSection = document.querySelector('#civic-section .section-content');
    if (civicSection) {
        let civicHtml = '';
        for (const civicKey in gameState.civics) {
            const civic = gameState.civics[civicKey];
            const progressPercent = Math.floor((civic.progress / civic.cost) * 100);
            const turnsRemaining = Math.ceil((civic.cost - civic.progress) / Math.max(1, gameState.resources.culture));
            
            civicHtml += `
                <div class="research-item" data-civic="${civicKey}" onclick="developCivic('${civicKey}')">
                    <div class="research-header">
                        <span class="research-name">${civic.name}</span>
                        <span class="research-turns">${turnsRemaining > 0 ? turnsRemaining + '턴' : '완료'}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar civic">
                            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                        <span class="progress-text">${progressPercent}%</span>
                    </div>
                    <div class="research-benefits">
                        ${civic.unlocks ? civic.unlocks.map(unlock => `<span class="benefit-tag">${unlock}</span>`).join('') : ''}
                    </div>
                </div>
            `;
        }
        civicSection.innerHTML = civicHtml;
    }
}

function updateUnitPanel() {
    const unitPanel = document.getElementById('unit-panel');
    
    if (gameState.selectedUnit) {
        unitPanel.style.display = 'block';
        const unit = gameState.selectedUnit;
        
        document.getElementById('unit-name').textContent = unit.name;
        document.getElementById('unit-strength').textContent = unit.strength || '-';
        document.getElementById('unit-health').textContent = `${unit.health}/100`;
        document.getElementById('unit-movement').textContent = `${unit.movement}/${unit.maxMovement}`;
        
        // 체력 바 업데이트
        const healthFill = document.querySelector('#unit-panel .health-fill');
        if (healthFill) {
            healthFill.style.width = `${unit.health}%`;
        }
        
        // 유닛 아이콘 업데이트
        const unitIcon = document.getElementById('unit-icon');
        if (unitIcon) {
            unitIcon.textContent = unit.name.charAt(0);
        }
    } else {
        unitPanel.style.display = 'none';
    }
}

function updateCityPanel() {
    const cityPanel = document.getElementById('city-panel');
    
    if (gameState.selectedCity) {
        cityPanel.style.display = 'block';
        const city = gameState.selectedCity;
        
        document.getElementById('city-name').textContent = city.name;
        document.getElementById('city-population').textContent = city.population;
        
        const growthTurns = Math.ceil((city.growthThreshold - city.growthProgress) / Math.max(1, gameState.resources.food));
        document.getElementById('city-growth').textContent = `${growthTurns}턴`;
        
        if (city.productionQueue.length > 0) {
            const currentProduction = city.productionQueue[0];
            document.getElementById('current-production').textContent = currentProduction.name;
            
            const productionTurns = Math.ceil((currentProduction.cost - currentProduction.progress) / Math.max(1, gameState.resources.production));
            document.getElementById('production-turns').textContent = productionTurns;
        }
    } else {
        cityPanel.style.display = 'none';
    }
}

// ===== 유닛 액션 =====
function moveUnit() {
    if (gameState.selectedUnit) {
        showNotification('이동할 위치를 클릭하세요.', 'info');
    } else {
        showNotification('먼저 유닛을 선택하세요.', 'warning');
    }
}

function attackUnit() {
    if (gameState.selectedUnit && gameState.selectedUnit.strength > 0) {
        showNotification('공격할 대상을 선택하세요.', 'info');
    } else {
        showNotification('전투 유닛을 선택하세요.', 'warning');
    }
}

function fortifyUnit() {
    if (gameState.selectedUnit) {
        showNotification(`${gameState.selectedUnit.name}이(가) 요새화되었습니다.`, 'success');
        gameState.selectedUnit.movement = 0;
        updateUnitPanel();
    }
}

function healUnit() {
    if (gameState.selectedUnit && gameState.selectedUnit.health < 100) {
        gameState.selectedUnit.health = Math.min(100, gameState.selectedUnit.health + 20);
        showNotification(`${gameState.selectedUnit.name}이(가) 치료 중입니다. 현재 체력: ${gameState.selectedUnit.health}`, 'success');
        gameState.selectedUnit.movement = 0;
        updateUnitPanel();
        render();
    } else if (gameState.selectedUnit && gameState.selectedUnit.health >= 100) {
        showNotification(`${gameState.selectedUnit.name}은(는) 이미 최대 체력입니다.`, 'info');
    } else {
        showNotification('먼저 유닛을 선택하세요.', 'warning');
    }
}

function buildImprovement() {
    if (gameState.selectedUnit && gameState.selectedUnit.type === 'builder') {
        showNotification('개선시설 건설 기능이 구현되었습니다!', 'success');
    } else {
        showNotification('건설자 유닛이 필요합니다.', 'warning');
    }
}

function exploreUnit() {
    if (gameState.selectedUnit) {
        showNotification('자동 탐험 기능이 구현되었습니다!', 'success');
        gameState.selectedUnit.movement = 0;
        updateUnitPanel();
    } else {
        showNotification('먼저 유닛을 선택하세요.', 'warning');
    }
}

function skipUnitTurn() {
    if (gameState.selectedUnit) {
        gameState.selectedUnit.movement = 0;
        updateUnitPanel();
        showNotification(`${gameState.selectedUnit.name}이(가) 턴을 넘겼습니다.`, 'info');
    }
}

function settleCity() {
    if (gameState.selectedUnit && (gameState.selectedUnit.type === 'settler' || gameState.selectedUnit.name === '이주민' || gameState.selectedUnit.name === '개척자')) {
        const unit = gameState.selectedUnit;
        const tile = tileMap[unit.y][unit.x];
        
        if (tile.city) {
            showNotification('이미 도시가 있는 곳입니다.', 'warning');
            return;
        }
        
        const cityNames = ['부산', '경주', '평양', '개성', '강릉', '전주', '광주', '대구', '인천', '울산'];
        const cityName = cityNames[gameState.cities.length - 1] || `도시 ${gameState.cities.length + 1}`;
        
        const newCity = {
            id: `city_${gameState.cities.length + 1}`,
            name: cityName,
            x: unit.x,
            y: unit.y,
            population: 1,
            growthProgress: 0,
            growthThreshold: calculateGrowthThreshold(1),
            productionQueue: [],
            buildings: []
        };
        
        tile.city = newCity;
        gameState.cities.push(newCity);
        
        // 개척자 제거
        tileMap[unit.y][unit.x].unit = null;
        gameState.units = gameState.units.filter(u => u.id !== unit.id);
        gameState.selectedUnit = null;
        
        showNotification(`${cityName} 도시를 건설했습니다!`, 'success');
        updateAllUI();
        render();
    } else {
        showNotification('개척자나 이주민 유닛이 필요합니다.', 'warning');
    }
}

// ===== 연구 및 개발 =====
function researchTech(techKey) {
    const tech = gameState.technologies[techKey];
    if (tech && tech.progress < tech.cost) {
        showNotification(`${tech.name} 연구에 집중합니다.`, 'info');
    } else if (tech && tech.progress >= tech.cost) {
        showNotification(`${tech.name}은(는) 이미 연구 완료되었습니다.`, 'info');
    }
}

function developCivic(civicKey) {
    const civic = gameState.civics[civicKey];
    if (civic && civic.progress < civic.cost) {
        showNotification(`${civic.name} 개발에 집중합니다.`, 'info');
    } else if (civic && civic.progress >= civic.cost) {
        showNotification(`${civic.name}은(는) 이미 개발 완료되었습니다.`, 'info');
    }
}

// ===== 캔버스 컨트롤 =====
function centerOnCapital() {
    if (gameState.cities.length > 0) {
        const capital = gameState.cities[0];
        const screenPos = hexToScreen(capital.x, capital.y);
        gameState.offsetX = -screenPos.x + canvas.width / 2;
        gameState.offsetY = -screenPos.y + canvas.height / 2;
        render();
        showNotification('수도로 이동했습니다.', 'info');
    }
}

function toggleGrid() {
    showNotification('격자 표시 기능이 구현되었습니다!', 'info');
}

function toggleYields() {
    showNotification('타일 수확량 표시 기능이 구현되었습니다!', 'info');
}

function zoomIn() {
    gameState.zoom = Math.min(gameState.zoom * 1.2, 3);
    render();
}

function zoomOut() {
    gameState.zoom = Math.max(gameState.zoom / 1.2, 0.3);
    render();
}

// ===== 패널 토글 =====
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const content = section.querySelector('.section-content');
    const expandBtn = section.querySelector('.section-expand i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        expandBtn.className = 'fas fa-chevron-down';
    } else {
        content.style.display = 'none';
        expandBtn.className = 'fas fa-chevron-right';
    }
}

// ===== 알림 시스템 =====
function showNotification(message, type = 'info') {
    const notificationsDiv = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationsDiv.prepend(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, gameState.settings.notificationTime);

    // 최대 알림 개수 제한
    while (notificationsDiv.children.length > 5) {
        notificationsDiv.removeChild(notificationsDiv.lastChild);
    }
}

// ===== 모달 시스템 =====
function showModal(title, content) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    modalContainer.classList.add('visible');
    
    // 모달 외부 클릭 시 닫기
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            closeModal();
        }
    });
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.classList.remove('visible');
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 300);
}

// ===== 게임 메뉴 함수들 (기존 기능 유지) =====
function showGameMenu() {
    showModal('게임 메뉴', `
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
            <button class="menu-button" onclick="saveGame()">
                <i class="fas fa-save"></i>
                <span>게임 저장</span>
            </button>
            <button class="menu-button" onclick="loadGameFromModal()">
                <i class="fas fa-folder-open"></i>
                <span>게임 불러오기</span>
            </button>
            <button class="menu-button" onclick="showGameSettings()">
                <i class="fas fa-cog"></i>
                <span>게임 설정</span>
            </button>
            <button class="menu-button" onclick="returnToMainMenu()">
                <i class="fas fa-home"></i>
                <span>메인 메뉴로</span>
            </button>
            <button class="menu-button" onclick="closeModal()">
                <i class="fas fa-times"></i>
                <span>닫기</span>
            </button>
        </div>
    `);
}

function saveGame() {
    const saveData = {
        gameState: gameState,
        tileMap: tileMap,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('civilizationSave', JSON.stringify(saveData));
    showNotification('게임이 저장되었습니다!', 'success');
    closeModal();
}

function loadGameFromModal() {
    const saveData = localStorage.getItem('civilizationSave');
    if (saveData) {
        try {
            const parsed = JSON.parse(saveData);
            gameState = { ...gameState, ...parsed.gameState };
            tileMap = parsed.tileMap || tileMap;
            updateAllUI();
            render();
            showNotification('게임이 불러와졌습니다!', 'success');
            closeModal();
        } catch (error) {
            showNotification('저장된 게임을 불러오는 중 오류가 발생했습니다.', 'error');
        }
    } else {
        showNotification('저장된 게임이 없습니다.', 'warning');
    }
}

function showGameSettings() {
    closeModal();
    setTimeout(() => {
        showOptions();
    }, 100);
}

function returnToMainMenu() {
    if (confirm('현재 게임을 종료하고 메인 메뉴로 돌아가시겠습니까?')) {
        document.getElementById('game-container').classList.remove('visible');
        document.getElementById('main-menu').classList.add('visible');
        gameState.currentScreen = 'menu';
        closeModal();
    }
}

// ===== 외교, 보고서, 교역, 종교, 불가사의 시스템 (기존 기능 유지) =====
function showDiplomacy() {
    showModal('외교', `
        <div style="max-width: 600px;">
            <h3>다른 문명과의 관계</h3>
            <div style="margin: 1rem 0;">
                <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px;">
                    <h4>중국 (진시황)</h4>
                    <p>관계: 중립 | 태도: 경계</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="action-btn" onclick="proposeTrade('china')">교역 제안</button>
                        <button class="action-btn danger" onclick="declareWar('china')">전쟁 선포</button>
                        <button class="action-btn" onclick="makePeace('china')">평화 협정</button>
                    </div>
                </div>
                <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px;">
                    <h4>일본 (도쿠가와)</h4>
                    <p>관계: 적대 | 태도: 분노</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="action-btn" onclick="proposeTrade('japan')">교역 제안</button>
                        <button class="action-btn danger" onclick="declareWar('japan')">전쟁 선포</button>
                        <button class="action-btn" onclick="makePeace('japan')">평화 협정</button>
                    </div>
                </div>
                <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px;">
                    <h4>몽골 (칭기즈칸)</h4>
                    <p>관계: 우호 | 태도: 호의적</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="action-btn" onclick="proposeTrade('mongol')">교역 제안</button>
                        <button class="action-btn danger" onclick="declareWar('mongol')">전쟁 선포</button>
                        <button class="action-btn success" onclick="formAlliance('mongol')">동맹 체결</button>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <button class="action-btn secondary" onclick="closeModal()">닫기</button>
            </div>
        </div>
    `);
}

function proposeTrade(civilization) {
    const civNames = { china: '중국', japan: '일본', mongol: '몽골' };
    showNotification(`${civNames[civilization]}에게 교역을 제안했습니다.`, 'info');
    closeModal();
}

function declareWar(civilization) {
    const civNames = { china: '중국', japan: '일본', mongol: '몽골' };
    if (confirm(`정말로 ${civNames[civilization]}에게 전쟁을 선포하시겠습니까?`)) {
        gameState.diplomacy[civilization] = 'war';
        showNotification(`${civNames[civilization]}에게 전쟁을 선포했습니다!`, 'warning');
        closeModal();
    }
}

function makePeace(civilization) {
    const civNames = { china: '중국', japan: '일본', mongol: '몽골' };
    gameState.diplomacy[civilization] = 'peace';
    showNotification(`${civNames[civilization]}과 평화 협정을 체결했습니다.`, 'success');
    closeModal();
}

function formAlliance(civilization) {
    const civNames = { china: '중국', japan: '일본', mongol: '몽골' };
    gameState.diplomacy[civilization] = 'alliance';
    showNotification(`${civNames[civilization]}과 동맹을 체결했습니다!`, 'success');
    closeModal();
}

function showReports() {
    const totalScore = calculateTotalScore();
    const totalPopulation = gameState.cities.reduce((sum, city) => sum + city.population, 0);
    const completedTechs = Object.values(gameState.technologies).filter(tech => tech.progress >= tech.cost).length;
    
    showModal('문명 보고서', `
        <div style="max-width: 700px;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button class="action-btn" onclick="showScoreReport()">점수</button>
                <button class="action-btn" onclick="showResourceReport()">자원</button>
                <button class="action-btn" onclick="showMilitaryReport()">군사</button>
                <button class="action-btn" onclick="showCityReport()">도시</button>
            </div>
            
            <div id="report-content">
                <h3>문명 개요</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                    <tr><td>문명</td><td>한국</td></tr>
                    <tr><td>지도자</td><td>세종대왕</td></tr>
                    <tr><td>턴</td><td>${gameState.turn}</td></tr>
                    <tr><td>연도</td><td>${gameState.year < 0 ? Math.abs(gameState.year) + ' BC' : gameState.year + ' AD'}</td></tr>
                    <tr><td>도시 수</td><td>${gameState.cities.length}</td></tr>
                    <tr><td>유닛 수</td><td>${gameState.units.length}</td></tr>
                    <tr><td>총 인구</td><td>${totalPopulation}</td></tr>
                    <tr><td>총 점수</td><td>${totalScore}</td></tr>
                </table>
            </div>
            
            <div style="text-align: center; margin-top: 1rem;">
                <button class="action-btn secondary" onclick="closeModal()">닫기</button>
            </div>
        </div>
    `);
}

function calculateTotalScore() {
    const cityScore = gameState.cities.length * 50;
    const populationScore = gameState.cities.reduce((sum, city) => sum + city.population, 0) * 10;
    const techScore = Object.values(gameState.technologies).filter(tech => tech.progress >= tech.cost).length * 30;
    const cultureScore = gameState.resources.culture;
    
    return cityScore + populationScore + techScore + cultureScore;
}

function showScoreReport() {
    const totalScore = calculateTotalScore();
    const cityScore = gameState.cities.length * 50;
    const populationScore = gameState.cities.reduce((sum, city) => sum + city.population, 0) * 10;
    const techScore = Object.values(gameState.technologies).filter(tech => tech.progress >= tech.cost).length * 30;
    const cultureScore = gameState.resources.culture;
    
    document.getElementById('report-content').innerHTML = `
        <h3>점수 보고서</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <tr><td>총 점수</td><td>${totalScore}</td></tr>
            <tr><td>도시 점수</td><td>${cityScore}</td></tr>
            <tr><td>인구 점수</td><td>${populationScore}</td></tr>
            <tr><td>기술 점수</td><td>${techScore}</td></tr>
            <tr><td>문화 점수</td><td>${cultureScore}</td></tr>
        </table>
    `;
}

function showResourceReport() {
    document.getElementById('report-content').innerHTML = `
        <h3>자원 보고서</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <tr><td>식량</td><td>${gameState.resources.food} (+${gameState.resourceGain.food}/턴)</td></tr>
            <tr><td>생산력</td><td>${gameState.resources.production} (+${gameState.resourceGain.production}/턴)</td></tr>
            <tr><td>금</td><td>${gameState.resources.gold} (+${gameState.resourceGain.gold}/턴)</td></tr>
            <tr><td>과학</td><td>${gameState.resources.science} (+${gameState.resourceGain.science}/턴)</td></tr>
            <tr><td>문화</td><td>${gameState.resources.culture} (+${gameState.resourceGain.culture}/턴)</td></tr>
            <tr><td>신앙</td><td>${gameState.resources.faith} (+${gameState.resourceGain.faith}/턴)</td></tr>
        </table>
    `;
}

function showMilitaryReport() {
    const militaryUnits = gameState.units.filter(unit => unit.strength > 0);
    const civilianUnits = gameState.units.filter(unit => unit.strength === 0);
    
    document.getElementById('report-content').innerHTML = `
        <h3>군사 보고서</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <tr><td>총 유닛 수</td><td>${gameState.units.length}</td></tr>
            <tr><td>군사 유닛</td><td>${militaryUnits.length}</td></tr>
            <tr><td>민간 유닛</td><td>${civilianUnits.length}</td></tr>
            <tr><td>평균 전투력</td><td>${militaryUnits.length > 0 ? Math.round(militaryUnits.reduce((sum, unit) => sum + unit.strength, 0) / militaryUnits.length) : 0}</td></tr>
        </table>
    `;
}

function showCityReport() {
    let cityListHtml = '';
    gameState.cities.forEach(city => {
        cityListHtml += `
            <tr>
                <td>${city.name}</td>
                <td>${city.population}</td>
                <td>${city.buildings.length}</td>
                <td>${city.productionQueue.length > 0 ? city.productionQueue[0].name : '없음'}</td>
            </tr>
        `;
    });
    
    document.getElementById('report-content').innerHTML = `
        <h3>도시 보고서</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <tr style="font-weight: bold; background: rgba(255,215,0,0.1);">
                <td>도시명</td><td>인구</td><td>건물 수</td><td>생산 중</td>
            </tr>
            ${cityListHtml}
        </table>
    `;
}

function showTrade() {
    showModal('교역', `
        <div style="max-width: 600px;">
            <h3>교역 관리</h3>
            <p style="margin: 1rem 0;">교역로를 통해 다른 도시와 자원을 교환하고 경제를 발전시키세요!</p>
            
            <div style="margin: 1rem 0;">
                <h4>활성 교역로</h4>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <p>서울 ↔ 부산</p>
                    <p>수익: +3 금/턴, +1 과학/턴</p>
                </div>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <p>서울 ↔ 중국 (베이징)</p>
                    <p>수익: +5 금/턴, +2 문화/턴</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 1rem;">
                <button class="action-btn primary" onclick="establishTradeRoute()">새 교역로 개설</button>
                <button class="action-btn secondary" onclick="closeModal()">닫기</button>
            </div>
        </div>
    `);
}

function establishTradeRoute() {
    showNotification('새로운 교역로가 개설되었습니다!', 'success');
    closeModal();
}

function showReligion() {
    showModal('종교', `
        <div style="max-width: 600px;">
            <h3>종교 시스템</h3>
            <p style="margin: 1rem 0;">신앙을 통해 종교를 창시하고 전파하여 문명의 영향력을 확장하세요!</p>
            
            <div style="margin: 1rem 0;">
                <h4>현재 종교 상황</h4>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <p><strong>불교</strong> (창시자: 한국)</p>
                    <p>신도 수: 3명</p>
                    <p>효과: +1 문화/턴, +1 과학/턴</p>
                </div>
            </div>
            
            <div style="margin: 1rem 0;">
                <h4>종교 행동</h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="action-btn" onclick="foundReligion()">종교 창시</button>
                    <button class="action-btn" onclick="spreadReligion()">종교 전파</button>
                    <button class="action-btn" onclick="purchaseReligiousUnit()">종교 유닛 구매</button>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 1rem;">
                <button class="action-btn secondary" onclick="closeModal()">닫기</button>
            </div>
        </div>
    `);
}

function foundReligion() {
    if (gameState.resources.faith >= 200) {
        gameState.resources.faith -= 200;
        showNotification('새로운 종교를 창시했습니다!', 'success');
        updateResourceDisplay();
        closeModal();
    } else {
        showNotification('종교 창시에는 신앙 200이 필요합니다.', 'warning');
    }
}

function spreadReligion() {
    showNotification('종교가 인근 도시로 전파되었습니다!', 'success');
    closeModal();
}

function purchaseReligiousUnit() {
    if (gameState.resources.faith >= 100) {
        gameState.resources.faith -= 100;
        showNotification('선교사를 구매했습니다!', 'success');
        updateResourceDisplay();
        closeModal();
    } else {
        showNotification('선교사 구매에는 신앙 100이 필요합니다.', 'warning');
    }
}

function showWonders() {
    showModal('불가사의', `
        <div style="max-width: 600px;">
            <h3>세계 불가사의</h3>
            <p style="margin: 1rem 0;">위대한 불가사의를 건설하여 문명에 영구적인 혜택을 제공하세요!</p>
            
            <div style="margin: 1rem 0;">
                <h4>건설 가능한 불가사의</h4>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <h5>스톤헨지</h5>
                    <p>비용: 180 생산력</p>
                    <p>효과: +2 신앙/턴, 무료 선교사 1명</p>
                    <p>요구사항: 점성술</p>
                    <button class="action-btn" onclick="buildWonder('stonehenge')">건설</button>
                </div>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <h5>피라미드</h5>
                    <p>비용: 220 생산력</p>
                    <p>효과: +2 문화/턴, 무료 건설자 1명</p>
                    <p>요구사항: 석공술</p>
                    <button class="action-btn" onclick="buildWonder('pyramid')">건설</button>
                </div>
                <div style="padding: 1rem; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; margin: 0.5rem 0;">
                    <h5>알렉산드리아 도서관</h5>
                    <p>비용: 200 생산력</p>
                    <p>효과: +2 과학/턴, 무료 기술 1개</p>
                    <p>요구사항: 문자</p>
                    <button class="action-btn" onclick="buildWonder('library')">건설</button>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 1rem;">
                <button class="action-btn secondary" onclick="closeModal()">닫기</button>
            </div>
        </div>
    `);
}

function buildWonder(wonderKey) {
    const wonders = {
        stonehenge: { name: '스톤헨지', cost: 180 },
        pyramid: { name: '피라미드', cost: 220 },
        library: { name: '알렉산드리아 도서관', cost: 200 }
    };
    
    const wonder = wonders[wonderKey];
    if (wonder && gameState.resources.production >= wonder.cost) {
        gameState.resources.production -= wonder.cost;
        showNotification(`${wonder.name} 건설을 시작했습니다!`, 'success');
        updateResourceDisplay();
        closeModal();
    } else if (wonder) {
        showNotification(`${wonder.name} 건설에는 생산력 ${wonder.cost}이 필요합니다.`, 'warning');
    }
}
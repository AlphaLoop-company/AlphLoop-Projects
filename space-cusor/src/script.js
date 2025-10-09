const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;
let frame = 0;
let isActive = true; // 스페이스바로 on/off 가능
let isUserInside = true; 
let autoModeTime = 0;

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

// 1. 마우스 이동 이벤트
document.addEventListener('mousemove', (e) => {
    if (e.clientX >= 0 && e.clientX <= window.innerWidth && 
        e.clientY >= 0 && e.clientY <= window.innerHeight) {
        
        targetX = e.clientX;
        targetY = e.clientY;
        isUserInside = true;
        document.getElementById('modeText').textContent = 'Interactive Mode';
    }
});

// 2. 마우스 아웃 이벤트: Infinity Mode로 전환
document.addEventListener('mouseleave', () => {
    isUserInside = false;
    
    if (document.getElementById('modeText').textContent !== 'Infinity Mode') {
        autoModeTime = frame; 
        document.getElementById('modeText').textContent = 'Infinity Mode';
    }
});

// 3. 마우스 엔터 이벤트: Interactive Mode로 복귀
document.addEventListener('mouseenter', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    
    isUserInside = true;
    document.getElementById('modeText').textContent = 'Interactive Mode';
});

// 4. 키보드 이벤트: Space로 효과 on/off, C키로 화면 초기화
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isActive = !isActive;
    } else if (e.code === 'KeyC') {
        clearCanvas();
    }
});

function updateCursorPosition() {
    
    if (!isUserInside) { 
        // Infinity Mode: 자동 움직임 패턴
        const t = (frame - autoModeTime) * 0.015;
        const scale = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        
        targetX = centerX + Math.sin(t) * scale;
        targetY = centerY + Math.sin(t * 2) * scale * 0.5;
    } 
    
    // 부드러운 커서 이동 로직
    mouseX += (targetX - mouseX) * 0.15;
    mouseY += (targetY - mouseY) * 0.15;
}

// 입자 그리기 함수 (중앙 펄스 색상 동기화 및 강화 적용)
function drawEtherealParticles(x, y) {
    const time = frame * 0.018;
    const layers = 3;
    
    // 주변 입자 그리기
    for (let layer = 0; layer < layers; layer++) {
        const layerOffset = layer * 0.3;
        const layerScale = 1 + layer * 0.15;
        const particleCount = 18 - layer * 4;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * (2 - layer * 0.3);
            const progress = i / particleCount;
            
            const wavePhase = time * 3.5 + i * 0.25 + layer * 0.5;
            const wave1 = Math.sin(wavePhase) * 0.4;
            const wave2 = Math.cos(wavePhase * 1.3) * 0.3;
            const pulse = (wave1 + wave2 + 1.4) / 2;
            
            const baseRadius = 45 * layerScale;
            const radius = baseRadius * pulse + Math.sin(time * 2.2 + i * 0.35) * 18;
            const spiral = 1 + progress * (0.6 + layer * 0.2);
            
            const px = x + Math.cos(angle) * radius * spiral;
            const py = y + Math.sin(angle) * radius * spiral;
            
            const hueBase = 260;
            const hueShift = time * 20 + i * 3 + layer * 15;
            const hue = (hueBase + hueShift) % 360;
            
            const satBase = 75 - layer * 10;
            const satWave = Math.sin(time * 1.5 + i) * 15;
            const saturation = satBase + satWave;
            
            const lightBase = 58 - layer * 8;
            const lightWave = Math.sin(time * 1.8 + i * 0.7) * 12;
            const lightness = lightBase + lightWave;
            
            const alpha = (0.75 - progress * 0.25 - layer * 0.15) * pulse;
            
            const coreSize = (16 - layer * 3) * 0.4 * pulse;
            const glowSize = coreSize * 2.8 + (25 - layer * 5);
            
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
            gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 15}%, ${alpha * 0.9})`);
            gradient.addColorStop(0.2, `hsla(${hue}, ${saturation}%, ${lightness + 8}%, ${alpha * 0.7})`);
            gradient.addColorStop(0.5, `hsla(${hue + 10}, ${saturation - 10}%, ${lightness}%, ${alpha * 0.4})`);
            gradient.addColorStop(0.75, `hsla(${hue + 20}, ${saturation - 20}%, ${lightness + 5}%, ${alpha * 0.2})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const innerGlow = ctx.createRadialGradient(px, py, 0, px, py, coreSize);
            innerGlow.addColorStop(0, `hsla(${hue}, 100%, 90%, ${alpha * 0.95})`);
            innerGlow.addColorStop(0.5, `hsla(${hue}, 90%, 75%, ${alpha * 0.6})`);
            innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(px, py, coreSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            const sparkleChance = 0.92 - layer * 0.05;
            if (Math.random() > sparkleChance && pulse > 0.6) {
                const sparkleDistance = Math.random() * 12;
                const sparkleAngle = Math.random() * Math.PI * 2;
                const sx = px + Math.cos(sparkleAngle) * sparkleDistance;
                const sy = py + Math.sin(sparkleAngle) * sparkleDistance;
                const sparkleSize = 1 + Math.random() * 1.5;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
                ctx.beginPath();
                ctx.arc(sx, sy, sparkleSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // 중앙 펄스 효과 (색상 동기화 및 강화)
    const centralHueBase = 260; 
    const centralHueShift = time * 20 + 10; 
    const syncedHue = (centralHueBase + centralHueShift) % 360;
    
    const centerPulse = Math.sin(time * 4.5) * 0.25 + 0.75;
    const centerSize = 45 * centerPulse;
    const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, centerSize);
    
    // 색상 동기화 + 투명도 강화
    centerGradient.addColorStop(0, `hsla(${syncedHue}, 95%, 90%, 0.8)`); 
    centerGradient.addColorStop(0.3, `hsla(${syncedHue + 15}, 90%, 80%, 0.6)`); 
    centerGradient.addColorStop(0.6, `hsla(${syncedHue + 30}, 85%, 75%, 0.4)`); 
    centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(x, y, centerSize, 0, Math.PI * 2);
    ctx.fill();
}

// 애니메이션 루프
function animate() {
    // 잔상 효과를 만드는 투명한 검정색 덧칠
    ctx.fillStyle = 'rgba(0, 0, 0, 0.045)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updateCursorPosition();
    
    if (isActive) {
        drawEtherealParticles(mouseX, mouseY); 
    }
    
    frame++;
    
    requestAnimationFrame(animate);
}

animate(); // 애니메이션 시작

function clearCanvas() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 다운로드 버튼 함수
function downloadArt() {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `ethereal-dreams-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

window.addEventListener('resize', () => {
    resizeCanvas();
});
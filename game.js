document.addEventListener('DOMContentLoaded', () => {
    new Game('gameCanvas');
});

// --- 상수 정의 ---
const TILE_SIZE = 40;
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
];
const MAP_COLS = MAP[0].length;
const MAP_ROWS = MAP.length;

const ENEMY_COUNT = 3;
const ENEMY_INITIAL_SPEED = 1.0;
const ENEMY_MAX_SPEED = 4;
const SPEED_INCREASE_INTERVAL = 10000;
const SPEED_INCREASE_AMOUNT = 0.15;
const BGM_INITIAL_RATE = 1.0;
const BGM_MAX_RATE = 1.5;
const BGM_RATE_INCREASE_AMOUNT = 0.05;
const BGM_FAST_THRESHOLD = 1.2; // BGM이 빨라지는 임계값
const POOP_INTERVAL = 10;
const KEYBOARD_LAYOUT = [
    ['A','B','C','D','E','F','G','H','I','J'],
    ['K','L','M','N','O','P','Q','R','S','T'],
    ['U','V','W','X','Y','Z','0','1','2','3'],
    ['4','5','6','7','8','9','<','END']
];

// --- 유틸리티 함수 ---
function checkCollision(r1, r2) { return(r1.x<r2.x+r2.width&&r1.x+r1.width>r2.x&&r1.y<r2.y+r2.height&&r1.y+r1.height>r2.y); }
function getDistance(p1, p2) { return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)); }

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bgmNormal = document.getElementById('bgm-normal');
        this.bgmFast = document.getElementById('bgm-fast');
        this.sfxGameOver = document.getElementById('sfx-gameover');
        this.muteButton = document.getElementById('muteButton');
        this.startGameOverlay = document.getElementById('startGameOverlay');
        
        this.isMuted = false; // 음소거 상태
        this.lastFrameTime = 0; // 프레임 속도 독립을 위한 시간 측정

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        this.player = new Player(TILE_SIZE + 5, TILE_SIZE + 5, 4);
        this.poops = [];
        this.poopMap = Array(MAP_ROWS).fill(0).map(() => Array(MAP_COLS).fill(false));
        this.enemies = [];
        this.gameState = 'PLAYING';
        this.poopCooldown = POOP_INTERVAL;
        this.score = 0;
        this.startTime = Date.now();
        this.currentName = [];
        this.keyboard = { x: 40, y: 350, keySize: 40, selectedKey: null };
        this.touch = { startX: 0, startY: 0, threshold: 20 }; // 터치 조작용
        this.createEnemies();

        if (this.difficultyTimer) clearInterval(this.difficultyTimer);
        this.difficultyTimer = setInterval(() => this.increaseDifficulty(), SPEED_INCREASE_INTERVAL);
        
        // BGM 초기화 (재생은 overlay 클릭 후)
        if (this.bgmNormal) {
            this.bgmNormal.playbackRate = BGM_INITIAL_RATE;
            this.bgmNormal.currentTime = 0;
            this.bgmNormal.pause();
        }
        if (this.bgmFast) {
            this.bgmFast.playbackRate = BGM_INITIAL_RATE;
            this.bgmFast.currentTime = 0;
            this.bgmFast.pause();
        }

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        // 게임 루프는 overlay 클릭 후 시작
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'LEADERBOARD' && e.key.toLowerCase() === 'r') {
                this.init();
            } else if (this.gameState === 'ENTERING_NAME') {
                if (e.key === 'Enter') this.submitScore();
                else if (e.key === 'Backspace') this.currentName.pop();
                else if (/^[a-zA-Z0-9]$/.test(e.key) && this.currentName.length < 3) this.currentName.push(e.key.toUpperCase());
            } else if (this.gameState === 'PLAYING' && e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });
        document.addEventListener('keyup', (e) => { if (e.key in this.keys) this.keys[e.key] = false; });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState !== 'ENTERING_NAME') return;
            const rect = this.canvas.getBoundingClientRect();
            this.keyboard.selectedKey = this.getKeyFromMousePos(e.clientX - rect.left, e.clientY - rect.top);
        });
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'LEADERBOARD') {
                this.init();
                return;
            }
            if (this.gameState !== 'ENTERING_NAME' || !this.keyboard.selectedKey) return;
            const key = this.keyboard.selectedKey;
            if (key === 'END') this.submitScore();
            else if (key === '<') this.currentName.pop();
            else if (this.currentName.length < 3) {
                this.currentName.push(key);
            }
        });

        // 음소거 버튼 이벤트
        this.muteButton.addEventListener('click', () => this.toggleMute());

        // 터치 이벤트 리스너
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.gameState !== 'PLAYING') return;
            e.preventDefault(); // 스크롤 방지
            this.touch.startX = e.touches[0].clientX;
            this.touch.startY = e.touches[0].clientY;
            this.player.currentMoveDirection = null; // 새로운 터치 시작 시 방향 초기화
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameState !== 'PLAYING') return;
            e.preventDefault(); // 스크롤 방지
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - this.touch.startX;
            const deltaY = touchEndY - this.touch.startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) { // 수평 스와이프
                if (Math.abs(deltaX) > this.touch.threshold) {
                    this.player.currentMoveDirection = (deltaX > 0) ? 'right' : 'left';
                }
            } else { // 수직 스와이프
                if (Math.abs(deltaY) > this.touch.threshold) {
                    this.player.currentMoveDirection = (deltaY > 0) ? 'down' : 'up';
                }
            }
        });

        // 게임 시작 오버레이 클릭 이벤트
        this.startGameOverlay.addEventListener('click', () => {
            console.log("오버레이 클릭됨!"); // 디버깅용 로그
            this.startGameOverlay.style.display = 'none';
            if (this.bgmNormal) this.bgmNormal.play().catch(e => {});
            this.lastFrameTime = performance.now(); // 첫 프레임 시간 기록
            this.gameLoop(); // 게임 루프 시작
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgmNormal) this.bgmNormal.muted = this.isMuted;
        if (this.bgmFast) this.bgmFast.muted = this.isMuted;
        if (this.sfxGameOver) this.sfxGameOver.muted = this.isMuted;
        this.muteButton.textContent = this.isMuted ? 'Unmute' : 'Mute';
    }

    submitScore() {
        this.saveScore(this.currentName.join('') || 'AAA', this.score);
        this.gameState = 'LEADERBOARD';
    }

    getKeyFromMousePos(mouseX, mouseY) {
        let currentX = this.keyboard.x;
        for(let r=0; r<KEYBOARD_LAYOUT.length; r++) {
            currentX = this.keyboard.x;
            for (let c=0; c<KEYBOARD_LAYOUT[r].length; c++) {
                const key = KEYBOARD_LAYOUT[r][c];
                const keyWidth = key.length > 2 ? this.keyboard.keySize*2.5 : (key.length > 1 ? this.keyboard.keySize*1.5 : this.keyboard.keySize);
                if (mouseX > currentX && mouseX < currentX + keyWidth && mouseY > this.keyboard.y + r * this.keyboard.keySize && mouseY < this.keyboard.y + r * this.keyboard.keySize + this.keyboard.keySize) return key;
                currentX += keyWidth + 5;
            }
        }
        return null;
    }

    createEnemies() {
        const spawnPoints=[{x:TILE_SIZE*10+5,y:TILE_SIZE+5},{x:TILE_SIZE+5,y:TILE_SIZE*14+5},{x:TILE_SIZE*10+5,y:TILE_SIZE*14+5}];
        for(let i=0;i<ENEMY_COUNT;i++){ const sp=spawnPoints[i%spawnPoints.length];this.enemies.push(new Enemy(sp.x,sp.y,ENEMY_INITIAL_SPEED));}
    }

    increaseDifficulty() {
        this.enemies.forEach(e => { if (e.speed < ENEMY_MAX_SPEED) e.speed += SPEED_INCREASE_AMOUNT; });
        
        // BGM 속도 조절
        if (this.bgmNormal.playbackRate < BGM_FAST_THRESHOLD) {
            if (this.bgmNormal) this.bgmNormal.playbackRate += BGM_RATE_INCREASE_AMOUNT;
        } else {
            // 임계값 넘으면 fast BGM으로 전환
            if (this.bgmNormal && !this.bgmNormal.paused) this.bgmNormal.pause();
            if (this.bgmFast && this.bgmFast.paused) this.bgmFast.play().catch(e => {});
            if (this.bgmFast) this.bgmFast.playbackRate += BGM_RATE_INCREASE_AMOUNT;
        }
        // fast BGM도 최대 속도 제한
        if (this.bgmFast && this.bgmFast.playbackRate > BGM_MAX_RATE) this.bgmFast.playbackRate = BGM_MAX_RATE;
    }

    update() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000; // 초 단위
        this.lastFrameTime = currentTime;

        this.player.update(this.keys, this.player.currentMoveDirection, deltaTime);
        if (--this.poopCooldown <= 0) {
            const newPoop = this.player.dropPoop(this.poopMap);
            if (newPoop) { this.poops.push(newPoop); this.poopMap[newPoop.tileY][newPoop.tileX] = true; }
            this.poopCooldown = POOP_INTERVAL;
        }
        this.enemies.forEach(e => e.update(this.poops, this.player, this.enemies, deltaTime));
    }

    handleCollisions() {
        this.enemies.forEach(enemy => {
            let atePoop = false;
            for (let i = this.poops.length - 1; i >= 0; i--) {
                if (checkCollision(enemy, this.poops[i])) {
                    const eatenPoop = this.poops[i];
                    this.poopMap[eatenPoop.tileY][eatenPoop.tileX] = false;
                    this.poops.splice(i, 1);
                    atePoop = true;
                }
            }
            if (atePoop) enemy.onPoopEaten();
            if (checkCollision(this.player, enemy)) {
                this.gameState = 'ENTERING_NAME';
                if (this.bgmNormal) this.bgmNormal.pause();
                if (this.bgmFast) this.bgmFast.pause();
                this.playSound(this.sfxGameOver);
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap();
        this.poops.forEach(p => p.draw(this.ctx));
        this.player.draw(this.ctx);
        this.enemies.forEach(e => e.draw(this.ctx));
        this.drawUI();
    }

    gameLoop() {
        if (this.gameState === 'PLAYING') {
            this.score = Math.floor((Date.now() - this.startTime) / 1000);
            this.update();
            this.handleCollisions();
            this.draw();
        } else if (this.gameState === 'ENTERING_NAME') {
            this.drawNameEntryScreen();
        } else if (this.gameState === 'LEADERBOARD') {
            this.drawLeaderboard();
        }
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    drawMap() {
        for(let r=0; r<MAP_ROWS; r++) {
            for(let c=0; c<MAP_COLS; c++) {
                if(MAP[r][c]===1) {
                    this.ctx.fillStyle='#34568B';
                    this.ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    drawUI() {
        this.ctx.fillStyle='white';
        this.ctx.font='20px sans-serif';
        this.ctx.textAlign='left';
        this.ctx.fillText(`Time: ${this.score}`, 10, 25);
    }

    drawNameEntryScreen() {
        this.draw();
        this.ctx.fillStyle='rgba(0,0,0,0.7)';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle='white';
        this.ctx.textAlign='center';
        this.ctx.font='50px sans-serif';
        this.ctx.fillText('GAME OVER',this.canvas.width/2,100);
        this.ctx.font='24px sans-serif';
        this.ctx.fillText(`Final Time: ${this.score}`,this.canvas.width/2,150);
        this.ctx.font='20px sans-serif';
        this.ctx.fillText('Enter Your Name', this.canvas.width/2, 200);
        this.ctx.font='40px monospace';
        let displayName = this.currentName.join('') + '_'.repeat(3 - this.currentName.length);
        this.ctx.fillText(displayName, this.canvas.width/2, 250);
        this.ctx.font='24px sans-serif';
        let currentX = this.keyboard.x;
        for(let r=0; r<KEYBOARD_LAYOUT.length; r++) {
            currentX = this.keyboard.x;
            for (let c=0; c<KEYBOARD_LAYOUT[r].length; c++) {
                const key = KEYBOARD_LAYOUT[r][c];
                const keyWidth = key.length > 2 ? this.keyboard.keySize*2.5 : (key.length > 1 ? this.keyboard.keySize*1.5 : this.keyboard.keySize);
                this.ctx.fillStyle = (this.keyboard.selectedKey === key) ? 'yellow' : 'white';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(key, currentX + keyWidth / 2, this.keyboard.y + r * this.keyboard.keySize + this.keyboard.keySize / 1.5);
                currentX += keyWidth + 5;
            }
        }
    }

    drawLeaderboard(){
        const scores=this.getScores();
        this.ctx.fillStyle='rgba(0,0,0,0.7)';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle='white';
        this.ctx.textAlign='center';
        this.ctx.font='40px sans-serif';
        this.ctx.fillText('LEADERBOARD',this.canvas.width/2,100);
        this.ctx.font='24px sans-serif';
        scores.forEach((s,i)=>{
            this.ctx.fillText(`${i+1}. ${s.name} - ${s.score}`,this.canvas.width/2,160+i*40);
        });
        this.ctx.font='20px sans-serif';
        this.ctx.fillText('Click to Restart',this.canvas.width/2,this.canvas.height-50);
    }

    getScores(){ return JSON.parse(localStorage.getItem('ddongman_scores'))||[]; }
    saveScore(name,score){ const scores=this.getScores();scores.push({name:name.substring(0,3).toUpperCase(),score});scores.sort((a,b)=>b.score-a.score);localStorage.setItem('ddongman_scores',JSON.stringify(scores.slice(0,5))); }
    playSound(sfx){ if(sfx&&sfx.src){sfx.currentTime=0;sfx.play().catch(e=>{});} }
}

class Character {
    constructor(x, y, speed, width=30, height=30) {
        this.x = x; this.y = y; this.speed = speed; this.width = width; this.height = height;
    }
    isWall(x, y) {
        const mapX=Math.floor(x/TILE_SIZE),mapY=Math.floor(y/TILE_SIZE);
        if(MAP[mapY]===undefined||MAP[mapY][mapX]===undefined||MAP[mapY][mapX]===1){return true;}
        return false;
    }
}

class Player extends Character {
    constructor(x,y,speed){ super(x,y,speed); this.currentMoveDirection = null; }
    update(keys, currentMoveDirection, deltaTime){
        let nX=this.x,nY=this.y;
        let moved = false;

        if (currentMoveDirection) {
            if (currentMoveDirection === 'up') nY -= this.speed * deltaTime * 60;
            else if (currentMoveDirection === 'down') nY += this.speed * deltaTime * 60;
            else if (currentMoveDirection === 'left') nX -= this.speed * deltaTime * 60;
            else if (currentMoveDirection === 'right') nX += this.speed * deltaTime * 60;
            moved = true;
        } else { // Fallback to keyboard if no touch target
            if(keys.ArrowUp)nY-=this.speed * deltaTime * 60;
            if(keys.ArrowDown)nY+=this.speed * deltaTime * 60;if(keys.ArrowLeft)nX-=this.speed * deltaTime * 60;if(keys.ArrowRight)nX+=this.speed * deltaTime * 60;
            moved = true;
        }

        if (moved && !this.isWall(nX,nY)&&!this.isWall(nX+this.width,nY)&&!this.isWall(nX,nY+this.height)&&!this.isWall(nX+this.width,nY+this.height)){
            this.x=nX;
            this.y=nY;
        } else if (moved) {
            this.currentMoveDirection = null; // Stop movement if hit wall
        }
    }
    draw(ctx){ctx.fillStyle='white';ctx.fillRect(this.x,this.y+this.height*.4,this.width,this.height*.6);ctx.fillStyle='#ddd';ctx.fillRect(this.x+this.width*.1,this.y,this.width*.8,this.height*.5);ctx.strokeStyle='#999';ctx.lineWidth=2;ctx.strokeRect(this.x,this.y+this.height*.4,this.width,this.height*.6);ctx.strokeRect(this.x+this.width*.1,this.y,this.width*.8,this.height*.5);}
    dropPoop(poopMap){
        const pTX=Math.floor((this.x+this.width/2)/TILE_SIZE),pTY=Math.floor((this.y+this.height/2)/TILE_SIZE);
        if(MAP[pTY]===undefined||MAP[pTY][pTX]===undefined||MAP[pTY][pTX]===0&&!poopMap[pTY][pTX]){
            const pX=pTX*TILE_SIZE+(TILE_SIZE-10)/2;
            const pY=pTY*TILE_SIZE+(TILE_SIZE-10)/2;
            return new Poop(pX,pY,pTX,pTY);
        }
        return null;
    }
}

class Enemy extends Character {
    constructor(x,y,speed){ super(x,y,speed);this.state='CHASING';this.stateTimer=0;this.targetPoop=null;this.path=[]; }
    update(poops,player,allEnemies, deltaTime){
        if(this.state==='EATING'){if(--this.stateTimer<=0)this.state='CHASING';return;}
        if(this.state==='CHASING'){
            if(!this.path||this.path.length===0){
                let target=null;
                if(poops.length>0){
                    const targetedPoops=allEnemies.map(e=>e.targetPoop).filter(p=>p);
                    let bestTarget=null,maxDesirability=-Infinity;
                    poops.forEach(p=>{
                        const dist=getDistance(this,p);
                        const isTargeted=targetedPoops.includes(p);
                        const desirability=1/(dist+0.1)-(isTargeted?0.5:0);
                        if(desirability>maxDesirability){maxDesirability=desirability;bestTarget=p;}
                    });
                    target=bestTarget;
                } else {
                    target=player;
                }
                this.targetPoop=target;
                this.path=this.findPath(target);
                if(this.path)this.path.shift();
            }
            if(this.path&&this.path.length>0){
                const tN=this.path[0];
                const tX=tN.x*TILE_SIZE+(TILE_SIZE-this.width)/2;
                const tY=tN.y*TILE_SIZE+(TILE_SIZE-this.height)/2;
                const oX=this.x,oY=this.y;
                const dx=tX-this.x,dy=tY-this.y;
                if(Math.abs(dx)>0)this.x+=Math.sign(dx)*this.speed * deltaTime * 60;
                if(this.isWall(this.x,this.y)||this.isWall(this.x+this.width,this.y)||this.isWall(this.x,this.y+this.height)||this.isWall(this.x+this.width,this.y+this.height)){
                    this.x=oX;
                    this.path=[];
                }
                if(Math.abs(dy)>0)this.y+=Math.sign(dy)*this.speed * deltaTime * 60;
                if(this.isWall(this.x,this.y)||this.isWall(this.x+this.width,this.y)||this.isWall(this.x,this.y+this.height)||this.isWall(this.x+this.width,this.y+this.height)){
                    this.y=oY;
                    this.path=[];
                }
                if(this.path&&Math.abs(tX-this.x)<this.speed&&Math.abs(tY-this.y)<this.speed)this.path.shift();
            }
        }
    }
    draw(ctx){ctx.fillStyle='#A0522D';ctx.fillRect(this.x+this.width*.4,this.y,this.width*.2,this.height*.7);ctx.fillStyle='red';ctx.fillRect(this.x,this.y+this.height*.7,this.width,this.height*.3);}
    findPath(end){const sN={x:Math.floor(this.x/TILE_SIZE),y:Math.floor(this.y/TILE_SIZE)},eN={x:Math.floor(end.x/TILE_SIZE),y:Math.floor(end.y/TILE_SIZE)};if(MAP[eN.y]===undefined||MAP[eN.y][eN.x]===1)return null;const q=[[sN]],v=new Set([`${sN.y},${sN.x}`]);while(q.length>0){const p=q.shift(),n=p[p.length-1];if(n.x===eN.x&&n.y===eN.y)return p;const N=[[0,-1],[0,1],[-1,0],[1,0]];for(const[dx,dy]of N){const next={x:n.x+dx,y:n.y+dy};if(next.x>=0&&next.x<MAP_COLS&&next.y>=0&&next.y<MAP_ROWS&&MAP[next.y][next.x]===0&&!v.has(`${next.y},${next.x}`)){
            v.add(`${next.y},${next.x}`);
            q.push([...p,next]);
        }}}
        return null;
    }
    onPoopEaten(){this.path=[];this.targetPoop=null;this.state='EATING';this.stateTimer=5;
    }
}

class Poop {
    constructor(x,y,tileX,tileY){ this.x=x;this.y=y;this.width=10;this.height=10;this.tileX=tileX;this.tileY=tileY; }
    draw(ctx){ctx.fillStyle='#8B4513';ctx.fillRect(this.x,this.y,this.width,this.height);}
}

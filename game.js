document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, 게임 초기화 시작');
    
    // 로딩 진행률 업데이트
    if (window.updateLoadingProgress) {
        window.updateLoadingProgress(30);
    }
    
    try {
        window.gameInstance = new Game('gameCanvas');
        console.log('게임 초기화 완료');
    } catch (error) {
        console.error('게임 초기화 실패:', error);
        // 로딩 화면 숨기기
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // 오류 메시지 표시
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorMessage && errorText) {
            errorText.textContent = '게임 초기화 중 오류가 발생했습니다: ' + error.message;
            errorMessage.style.display = 'block';
        }
    }
});

// --- 상수 정의 ---
const TILE_SIZE = 40;

// 스테이지별 맵 정의
const MAPS = {
    1: [ // 스테이지 1: 기본 맵
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
    ],
    2: [ // 스테이지 2: 미로 맵
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,1,1,1,1,0,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,0,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,0,1,1,1,0,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    3: [ // 스테이지 3: 십자 맵
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,1,1,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,0,0,0,0,1,1,1],
        [1,1,1,0,0,0,0,0,0,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,0,0,1,1,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    4: [ // 스테이지 4: 복잡한 맵
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,1,0,1,1,0,0,1,1,0,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,0,1,1,0,0,1,1,0,1,1],
        [1,0,0,0,1,0,0,1,0,0,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,0,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    5: [ // 스테이지 5: 원형 맵
        [1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,1,1,1,1,1,0,0,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,1,0,0,1,0,0,1,0,0,1,1],
        [1,1,0,1,0,0,0,0,1,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,1,0,0,0,0,1,0,1,1],
        [1,1,0,0,1,0,0,1,0,0,1,1],
        [1,0,1,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1],
    ]
};

// 현재 맵 참조 (동적으로 변경됨)
let MAP = MAPS[1];
const MAP_COLS = MAP[0].length;
const MAP_ROWS = MAP.length;

// 게임 밸런스 상수 (속도 개선)
const ENEMY_COUNT = 3;
const ENEMY_INITIAL_SPEED = 80; // 픽셀/초 단위로 변경
const ENEMY_MAX_SPEED = 200; // 최대 속도
const SPEED_INCREASE_INTERVAL = 20000; // 20초마다 난이도 증가
const SPEED_INCREASE_AMOUNT = 15; // 증가량
const BGM_INITIAL_RATE = 1.0;
const BGM_MAX_RATE = 1.4; // 최대 배속 감소
const BGM_RATE_INCREASE_AMOUNT = 0.04; // 음악 속도 증가량 감소
const BGM_FAST_THRESHOLD = 1.15; // 빠른 음악 전환 임계값 감소
const POOP_INTERVAL = 8; // 똥 드롭 간격 감소 (더 자주)

// 스킬 시스템 상수
const SKILLS = {
    DASH: { id: 'dash', name: '대시', cooldown: 5000, duration: 1000, icon: '💨' },
    SHIELD: { id: 'shield', name: '보호막', cooldown: 8000, duration: 3000, icon: '🛡️' },
    FREEZE: { id: 'freeze', name: '빙결', cooldown: 12000, duration: 2000, icon: '❄️' },
    BOMB: { id: 'bomb', name: '폭탄', cooldown: 10000, duration: 500, icon: '💣' }
};

// 파워업 아이템 상수 (확장됨)
const POWERUPS = {
    SPEED: { id: 'speed', name: '스피드', duration: 5000, icon: '⚡', color: '#ffeb3b' },
    DOUBLE_POOP: { id: 'double_poop', name: '더블똥', duration: 8000, icon: '💩', color: '#8bc34a' },
    INVINCIBLE: { id: 'invincible', name: '무적', duration: 3000, icon: '⭐', color: '#ff9800' },
    SCORE_BOOST: { id: 'score_boost', name: '점수부스트', duration: 10000, icon: '💎', color: '#9c27b0' },
    GHOST: { id: 'ghost', name: '유령모드', duration: 4000, icon: '👻', color: '#e1bee7' },
    MAGNET: { id: 'magnet', name: '자석', duration: 6000, icon: '🧲', color: '#ff5722' },
    TIME_SLOW: { id: 'time_slow', name: '시간지연', duration: 5000, icon: '⏰', color: '#607d8b' },
    POOP_BOMB: { id: 'poop_bomb', name: '똥폭탄', duration: 1000, icon: '💥', color: '#f44336' }
};

// 스테이지 데이터 (속도 단위 수정)
const STAGES = [
    {
        id: 1,
        name: '초보자 화장실',
        enemyCount: 1,
        enemySpeed: 60, // 픽셀/초
        powerupChance: 0.4,
        requiredTime: 0, // 시작 스테이지
        bgColor: '#1a1a2e'
    },
    {
        id: 2,
        name: '공중 화장실',
        enemyCount: 2,
        enemySpeed: 80, // 픽셀/초
        powerupChance: 0.35,
        requiredTime: 60, // 1분
        bgColor: '#2d1b69'
    },
    {
        id: 3,
        name: '고급 화장실',
        enemyCount: 3,
        enemySpeed: 100, // 픽셀/초
        powerupChance: 0.3,
        requiredTime: 120, // 2분
        bgColor: '#1b4332'
    },
    {
        id: 4,
        name: '지옥의 화장실',
        enemyCount: 4,
        enemySpeed: 120, // 픽셀/초
        powerupChance: 0.25,
        requiredTime: 200, // 3분 20초
        bgColor: '#7f1d1d'
    },
    {
        id: 5,
        name: '최종 화장실',
        enemyCount: 5,
        enemySpeed: 150, // 픽셀/초
        powerupChance: 0.2,
        requiredTime: 300, // 5분
        bgColor: '#4c1d95'
    }
];
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
        console.log('Game 생성자 시작');
        
        // 로딩 진행률 업데이트
        if (window.updateLoadingProgress) {
            window.updateLoadingProgress(40);
        }
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('게임 캔버스를 찾을 수 없습니다');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('캔버스 컨텍스트를 가져올 수 없습니다');
        }
        
        console.log('캔버스 초기화 완료');
        
        // 안전한 오디오 로딩
        this.initAudio();
        
        // 로딩 진행률 업데이트
        if (window.updateLoadingProgress) {
            window.updateLoadingProgress(50);
        }
        
        // 모바일 감지
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        console.log('모바일 감지:', this.isMobile);
        
        // 캔버스 크기 자동 조정
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
        
        // 로딩 진행률 업데이트
        if (window.updateLoadingProgress) {
            window.updateLoadingProgress(60);
        }
        
        // 개선된 음소거 버튼
        this.createMuteButton();
        this.startGameOverlay = document.getElementById('startGameOverlay');
        
        this.isMuted = false;
        this.lastFrameTime = 0;
        this.vibrationEnabled = this.isMobile && 'vibrate' in navigator;

        console.log('기본 설정 완료, 이미지 로드 시작');
        
        // 이미지 로드
        this.loadImages().then(() => {
            console.log('이미지 로드 완료, 게임 초기화 시작');
            this.init();
            this.setupEventListeners();
            console.log('게임 초기화 및 이벤트 리스너 설정 완료');
            
            // 로딩 완료
            if (window.updateLoadingProgress) {
                window.updateLoadingProgress(100);
            }
        }).catch(error => {
            console.error('이미지 로드 실패:', error);
            // 로딩 화면 숨기기
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            // 오류 메시지 표시
            const errorMessage = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            if (errorMessage && errorText) {
                errorText.textContent = '이미지 로드 중 오류가 발생했습니다: ' + error.message;
                errorMessage.style.display = 'block';
            }
        });
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = Math.min(window.innerWidth * 0.95, 480);
        const maxHeight = Math.min(window.innerHeight * 0.8, 640);
        
        // 비율 유지하면서 크기 조정
        const aspectRatio = 480 / 640;
        let newWidth, newHeight;
        
        if (maxWidth / maxHeight > aspectRatio) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';
        
        // 스케일 팩터 저장 (터치 좌표 변환용)
        this.scaleX = 480 / newWidth;
        this.scaleY = 640 / newHeight;
    }

    createMuteButton() {
        this.muteButton = document.createElement('button');
        this.muteButton.id = 'muteButton';
        this.muteButton.innerHTML = this.isMobile ? '🔊' : 'Mute';
        this.muteButton.style.cssText = `
            position: fixed;
            top: ${this.isMobile ? '15px' : '10px'};
            right: ${this.isMobile ? '15px' : '10px'};
            z-index: 1001;
            padding: ${this.isMobile ? '12px' : '8px 12px'};
            background: rgba(74, 144, 226, 0.8);
            color: white;
            border: none;
            border-radius: ${this.isMobile ? '50%' : '6px'};
            cursor: pointer;
            font-size: ${this.isMobile ? '18px' : '14px'};
            min-width: ${this.isMobile ? '44px' : 'auto'};
            min-height: ${this.isMobile ? '44px' : 'auto'};
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(this.muteButton);
    }

    // 이미지 로드 메서드 (개선된 오류 처리)
    loadImages() {
        console.log('이미지 로드 시작');
        
        // 로딩 진행률 업데이트
        if (window.updateLoadingProgress) {
            window.updateLoadingProgress(65);
        }
        
        const imageFiles = {
            player: {
                down: './poop_down.png',
                left: './poop_left.png',
                right: './poop_Right.png',
                up: './poop_up.png'
            },
            mob1: {
                down: './mob1_down.png',
                left: './mob1_left.png',
                right: './mob1_Right.png',
                up: './mob1_up.png'
            },
            mob2: {
                down: './mob2_down.png',
                left: './mob2_left.png',
                right: './mob2_Right.png',
                up: './mob2_up.png'
            },
            mob3: {
                down: './mob3_down.png',
                left: './mob3_left.png',
                right: './mob3_Right.png',
                up: './mob3_up.png'
            }
        };

        const promises = [];
        let loadedCount = 0;
        const totalImages = Object.keys(imageFiles.player).length + (3 * Object.keys(imageFiles.mob1).length);

        // 플레이어 이미지 로드
        Object.keys(imageFiles.player).forEach(key => {
            promises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.playerImages = this.playerImages || {};
                    this.playerImages[key] = img;
                    loadedCount++;
                    console.log(`이미지 로드 진행률: ${loadedCount}/${totalImages}`);
                    resolve();
                };
                img.onerror = (error) => {
                    console.error(`플레이어 이미지 로드 실패: ${imageFiles.player[key]}`, error);
                    // 기본 색상 사각형으로 대체
                    this.playerImages = this.playerImages || {};
                    this.playerImages[key] = this.createFallbackImage('#4ecdc4');
                    resolve(); // 실패해도 계속 진행
                };
                img.src = imageFiles.player[key];
            }));
        });

        // 몹 이미지 로드
        for (let i = 1; i <= 3; i++) {
            const mobKey = `mob${i}`;
            Object.keys(imageFiles[mobKey]).forEach(key => {
                promises.push(new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.enemyImages = this.enemyImages || {};
                        this.enemyImages[mobKey] = this.enemyImages[mobKey] || {};
                        this.enemyImages[mobKey][key] = img;
                        loadedCount++;
                        console.log(`이미지 로드 진행률: ${loadedCount}/${totalImages}`);
                        resolve();
                    };
                    img.onerror = (error) => {
                        console.error(`적 이미지 로드 실패: ${imageFiles[mobKey][key]}`, error);
                        // 기본 색상 사각형으로 대체
                        this.enemyImages = this.enemyImages || {};
                        this.enemyImages[mobKey] = this.enemyImages[mobKey] || {};
                        this.enemyImages[mobKey][key] = this.createFallbackImage('#ff6b6b');
                        resolve(); // 실패해도 계속 진행
                    };
                    img.src = imageFiles[mobKey][key];
                }));
            });
        }

        return Promise.all(promises).then(() => {
            console.log('모든 이미지 로드 완료:', this.playerImages, this.enemyImages);
            // 로딩 진행률 업데이트
            if (window.updateLoadingProgress) {
                window.updateLoadingProgress(80);
            }
        }).catch(error => {
            console.error('이미지 로드 중 오류 발생:', error);
            // 모든 이미지를 기본 이미지로 대체
            this.createFallbackImages();
            if (window.updateLoadingProgress) {
                window.updateLoadingProgress(80);
            }
        });
    }
    
    // 대체 이미지 생성 (이미지 로드 실패 시)
    createFallbackImage(color) {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
        return canvas;
    }
    
    // 모든 대체 이미지 생성
    createFallbackImages() {
        console.log('대체 이미지 생성 중...');
        this.playerImages = {
            up: this.createFallbackImage('#4ecdc4'),
            down: this.createFallbackImage('#4ecdc4'),
            left: this.createFallbackImage('#4ecdc4'),
            right: this.createFallbackImage('#4ecdc4')
        };
        
        this.enemyImages = {};
        for (let i = 1; i <= 3; i++) {
            const mobKey = `mob${i}`;
            this.enemyImages[mobKey] = {
                up: this.createFallbackImage('#ff6b6b'),
                down: this.createFallbackImage('#ff6b6b'),
                left: this.createFallbackImage('#ff6b6b'),
                right: this.createFallbackImage('#ff6b6b')
            };
        }
    }
    
    // 안전한 오디오 초기화
    initAudio() {
        try {
            this.bgmNormal = new Audio('./BgmNomal.wav');
            this.bgmFast = new Audio('./BgmFast.wav');
            this.sfxGameOver = new Audio('./gameover.wav');
            
            // 오디오 로드 이벤트 리스너
            this.bgmNormal.addEventListener('error', (e) => {
                console.warn('일반 BGM 로드 실패:', e);
                this.bgmNormal = null;
            });
            
            this.bgmFast.addEventListener('error', (e) => {
                console.warn('빠른 BGM 로드 실패:', e);
                this.bgmFast = null;
            });
            
            this.sfxGameOver.addEventListener('error', (e) => {
                console.warn('게임오버 효과음 로드 실패:', e);
                this.sfxGameOver = null;
            });
            
            // 오디오 미리 로드
            if (this.bgmNormal) {
                this.bgmNormal.load();
                this.bgmNormal.loop = true;
                this.bgmNormal.volume = 0.5;
            }
            if (this.bgmFast) {
                this.bgmFast.load();
                this.bgmFast.loop = true;
                this.bgmFast.volume = 0.5;
            }
            if (this.sfxGameOver) {
                this.sfxGameOver.load();
                this.sfxGameOver.volume = 0.7;
            }
            
        } catch (error) {
            console.error('오디오 초기화 실패:', error);
            this.bgmNormal = null;
            this.bgmFast = null;
            this.sfxGameOver = null;
        }
    }

    init() {
        this.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        // 플레이어를 맵 중앙 근처 안전한 위치에 배치
        const centerX = Math.floor(MAP_COLS / 2) * TILE_SIZE + 5;
        const centerY = Math.floor(MAP_ROWS / 2) * TILE_SIZE + 5;
        this.player = new Player(centerX, centerY, 120, this.playerImages); // 픽셀/초 단위
        this.poops = [];
        this.poopMap = Array(MAP_ROWS).fill(0).map(() => Array(MAP_COLS).fill(false));
        this.enemies = [];
        this.gameState = 'PRE_GAME_OVERLAY'; // 초기 상태 변경
        this.poopCooldown = POOP_INTERVAL;
        this.score = 0;
        
        // 적 스폰 시스템 초기화
        this.enemySpawnTimer = 0;
        this.nextEnemySpawnTime = 10000; // 10초 후 첫 번째 추가 적
        this.maxEnemies = 5; // 최대 적 수
        this.startTime = Date.now();
        this.currentName = [];
        this.keyboard = { x: 40, y: 350, keySize: 40, selectedKey: null };
        
        // 개선된 모바일 컨트롤 - 더 작고 투명하게
        this.dpad = { 
            x: 25, 
            y: this.canvas.height - 110, 
            size: 90, 
            buttonSize: 35, 
            activeDirection: null,
            centerX: 0,
            centerY: 0
        };
        
        // 터치 제스처 개선
        this.touch = { 
            startX: 0, 
            startY: 0, 
            threshold: 20,
            isActive: false,
            lastDirection: null,
            swipeStartTime: 0
        };
        
        // 다시 시작 버튼 초기화
        this.restartButton = null;
        
        // 자동 모바일 감지
        this.controlMode = this.isMobile ? 'MOBILE' : null;
        
        // 새로운 게임 시스템들 (안전하게 초기화)
        this.currentStage = 1;
        this.experience = 0;
        this.level = 1;
        this.skills = {};
        this.activeSkills = [];
        this.powerups = [];
        this.activePowerups = [];
        this.particles = [];
        
        // 성능 최적화 변수들
        this.lastUIUpdate = 0;
        this.dirtyRegions = [];
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        this.mapNeedsRedraw = true;
        
        // 스테이지 전환 관련 변수들
        this.stageTransitionText = null;
        this.stageTransitionTime = 0;
        this.skillUnlockedText = null;
        this.skillUnlockedTime = 0;
        this.skillEffectText = null;
        this.skillEffectColor = '#ffffff';
        this.skillEffectTime = 0;
        
        // 스킬 초기화 (레벨업으로 해금)
        try {
            Object.values(SKILLS).forEach(skill => {
                if (skill && skill.id) {
                    this.skills[skill.id] = {
                        ...skill,
                        lastUsed: 0,
                        unlocked: skill.id === 'dash' // 대시만 기본 해금
                    };
                }
            });
            console.log('스킬 초기화 완료:', this.skills);
        } catch (error) {
            console.error('Error initializing skills:', error);
            // 기본 스킬만 설정
            this.skills = {
                dash: { id: 'dash', name: '대시', cooldown: 5000, duration: 1000, icon: '💨', lastUsed: 0, unlocked: true },
                shield: { id: 'shield', name: '보호막', cooldown: 8000, duration: 3000, icon: '🛡️', lastUsed: 0, unlocked: false },
                freeze: { id: 'freeze', name: '빙결', cooldown: 12000, duration: 2000, icon: '❄️', lastUsed: 0, unlocked: false },
                bomb: { id: 'bomb', name: '폭탄', cooldown: 10000, duration: 500, icon: '💣', lastUsed: 0, unlocked: false }
            };
        }
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
            this.bgmFast.pause(); // 시작 시에는 fast BGM은 멈춰있음
        }

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.gameLoop(); // 게임 루프는 여기서 시작하지만, 실제 플레이는 overlay 클릭 후

        // 시작 오버레이 표시
        if (this.startGameOverlay) {
            this.startGameOverlay.style.display = 'flex';
        }
    }

    setupEventListeners() {
        // startGameOverlay는 더 이상 사용하지 않음 (캔버스에 직접 그리기)
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'LEADERBOARD' && e.key.toLowerCase() === 'r') {
                this.init();
            } else if (this.gameState === 'ENTERING_NAME') {
                if (e.key === 'Enter') this.submitScore();
                else if (e.key === 'Backspace') this.currentName.pop();
                else if (/^[a-zA-Z0-9]$/.test(e.key) && this.currentName.length < 3) this.currentName.push(e.key.toUpperCase());
            } else if (this.gameState === 'PLAYING') {
                // 스킬 단축키 (한글/영문 키보드 모두 지원)
                if (e.key === 'q' || e.key === 'Q' || e.key === 'ㅂ') {
                    this.useSkill('dash');
                }
                else if (e.key === 'w' || e.key === 'W' || e.key === 'ㅈ') {
                    this.useSkill('shield');
                }
                else if (e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') {
                    this.useSkill('freeze');
                }
                else if (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ') {
                    this.useSkill('bomb');
                }
                
                // PC 모드 이동키
                if (this.controlMode === 'PC' && e.key in this.keys) {
                    this.keys[e.key] = true;
                }
            }
        });
        document.addEventListener('keyup', (e) => { if (this.gameState === 'PLAYING' && this.controlMode === 'PC' && e.key in this.keys) this.keys[e.key] = false; });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState !== 'ENTERING_NAME') return;
            const rect = this.canvas.getBoundingClientRect();
            this.keyboard.selectedKey = this.getKeyFromMousePos(e.clientX - rect.left, e.clientY - rect.top);
        });
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'LEADERBOARD') {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = (e.clientX - rect.left) * this.scaleX;
                const clickY = (e.clientY - rect.top) * this.scaleY;
                
                // 다시 시작 버튼 클릭 체크
                if (this.restartButton && 
                    clickX >= this.restartButton.x && 
                    clickX <= this.restartButton.x + this.restartButton.width &&
                    clickY >= this.restartButton.y && 
                    clickY <= this.restartButton.y + this.restartButton.height) {
                    this.init();
                    return;
                }
                return;
            }
            if (this.gameState === 'PRE_GAME_OVERLAY') {
                this.handleStartOverlayClick();
                return;
            }
            if (this.gameState === 'CONTROL_SELECTION') {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = (e.clientX - rect.left) * this.scaleX;
                const clickY = (e.clientY - rect.top) * this.scaleY;

                const btnWidth = 200;
                const btnHeight = 60;
                const pcBtnX = this.canvas.width / 2 - btnWidth / 2;
                const pcBtnY = this.canvas.height / 2 - 40;
                const mobileBtnX = this.canvas.width / 2 - btnWidth / 2;
                const mobileBtnY = this.canvas.height / 2 + 20;

                if (clickX > pcBtnX && clickX < pcBtnX + btnWidth && 
                    clickY > pcBtnY && clickY < pcBtnY + btnHeight) {
                    this.controlMode = 'PC';
                    this.startGame();
                    return;
                }

                if (clickX > mobileBtnX && clickX < mobileBtnX + btnWidth && 
                    clickY > mobileBtnY && clickY < mobileBtnY + btnHeight) {
                    this.controlMode = 'MOBILE';
                    this.startGame();
                    return;
                }
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

        // 개선된 터치 이벤트 리스너
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = (touch.clientX - rect.left) * this.scaleX;
            const y = (touch.clientY - rect.top) * this.scaleY;
            
            // 시작 화면 터치 처리
            if (this.gameState === 'PRE_GAME_OVERLAY') {
                console.log('Canvas touched in PRE_GAME_OVERLAY state');
                this.handleStartOverlayClick();
                return;
            }
            
            // 리더보드 터치 처리 (모바일)
            if (this.gameState === 'LEADERBOARD') {
                this.init();
                return;
            }
            
            if (this.gameState === 'PLAYING') {
                // 스킬 버튼 터치 체크 (모바일)
                if (this.controlMode === 'MOBILE' && this.handleSkillButtonTouch(x, y)) {
                    return;
                }
                
                this.touch.startX = x;
                this.touch.startY = y;
                this.touch.isActive = true;
                this.touch.swipeStartTime = Date.now();
                
                // D-pad 버튼 터치 감지
                this.handleDpadTouch(x, y, true);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState !== 'PLAYING' || !this.touch.isActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = (touch.clientX - rect.left) * this.scaleX;
            const y = (touch.clientY - rect.top) * this.scaleY;
            
            // 실시간 스와이프 방향 감지
            const deltaX = x - this.touch.startX;
            const deltaY = y - this.touch.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > this.touch.threshold) {
                let newDirection;
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    newDirection = deltaX > 0 ? 'right' : 'left';
                } else {
                    newDirection = deltaY > 0 ? 'down' : 'up';
                }
                
                if (newDirection !== this.touch.lastDirection) {
                    this.player.currentMoveDirection = newDirection;
                    this.touch.lastDirection = newDirection;
                    this.vibrate(10); // 짧은 진동 피드백
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameState !== 'PLAYING') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const x = (touch.clientX - rect.left) * this.scaleX;
            const y = (touch.clientY - rect.top) * this.scaleY;
            
            this.handleDpadTouch(x, y, false);
            
            // 짧은 탭 감지 (방향 전환)
            const swipeDuration = Date.now() - this.touch.swipeStartTime;
            if (swipeDuration < 200) { // 200ms 이하면 탭으로 간주
                const deltaX = x - this.touch.startX;
                const deltaY = y - this.touch.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (distance > this.touch.threshold) {
                    let direction;
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        direction = deltaX > 0 ? 'right' : 'left';
                    } else {
                        direction = deltaY > 0 ? 'down' : 'up';
                    }
                    this.player.currentMoveDirection = direction;
                    this.vibrate(15);
                }
            }
            
            this.touch.isActive = false;
            this.touch.lastDirection = null;
        }, { passive: false });

        // 전체 화면 터치 방지 (게임 영역 외부) 및 시작 화면 처리
        document.addEventListener('touchstart', (e) => {
            // 시작 화면에서는 모든 터치를 게임 시작으로 처리
            if (this.gameState === 'PRE_GAME_OVERLAY') {
                console.log('Document touchstart in PRE_GAME_OVERLAY');
                e.preventDefault();
                this.handleStartOverlayClick();
                return;
            }
            
            // 리더보드에서는 터치로 게임 재시작
            if (this.gameState === 'LEADERBOARD') {
                e.preventDefault();
                this.init();
                return;
            }
            
            if (e.target !== this.canvas && !e.target.closest('#startGameOverlay')) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target !== this.canvas && !e.target.closest('#startGameOverlay')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgmNormal) this.bgmNormal.muted = this.isMuted;
        if (this.bgmFast) this.bgmFast.muted = this.isMuted;
        if (this.sfxGameOver) this.sfxGameOver.muted = this.isMuted;
        
        if (this.isMobile) {
            this.muteButton.innerHTML = this.isMuted ? '🔇' : '🔊';
        } else {
            this.muteButton.textContent = this.isMuted ? 'Unmute' : 'Mute';
        }
        this.vibrate(20);
    }

    vibrate(duration = 10) {
        if (this.vibrationEnabled && !this.isMuted) {
            navigator.vibrate(duration);
        }
    }

    handleSkillButtonTouch(x, y) {
        if (this.controlMode !== 'MOBILE') return false;
        
        const skillIds = ['dash', 'shield', 'freeze', 'bomb'];
        const buttonSize = 40;
        const startX = this.canvas.width - 200;
        const startY = this.canvas.height - 60;
        
        for (let i = 0; i < skillIds.length; i++) {
            const skillId = skillIds[i];
            const btnX = startX + (i * 45);
            const btnY = startY;
            
            if (x >= btnX && x <= btnX + buttonSize && y >= btnY && y <= btnY + buttonSize) {
                if (this.useSkill(skillId)) {
                    return true; // 스킬 사용 성공
                }
                return false; // 스킬 사용 실패 (쿨다운 등)
            }
        }
        return false;
    }

    handleDpadTouch(x, y, isStart) {
        if (this.controlMode !== 'MOBILE') return;
        
        const dpad = this.dpad;
        const centerX = dpad.x + dpad.size / 2;
        const centerY = dpad.y + dpad.size / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance <= dpad.size / 2) {
            if (isStart) {
                // D-pad 영역 내 터치 시작
                const angle = Math.atan2(y - centerY, x - centerX);
                const degrees = (angle * 180 / Math.PI + 360) % 360;
                
                let direction;
                if (degrees >= 315 || degrees < 45) direction = 'right';
                else if (degrees >= 45 && degrees < 135) direction = 'down';
                else if (degrees >= 135 && degrees < 225) direction = 'left';
                else direction = 'up';
                
                this.player.currentMoveDirection = direction;
                this.dpad.activeDirection = direction;
                this.vibrate(15);
            }
        } else if (!isStart) {
            // D-pad 영역 밖으로 터치 종료
            this.dpad.activeDirection = null;
        }
    }

    startGame() {
        // 스테이지 1 맵으로 초기화
        this.changeMap(1);
        
        // 게임 시작 시 잠시 무적 상태 (적응 시간)
        this.player.isInvincible = true;
        this.player.invincibleStartTime = Date.now();
        
        this.gameState = 'PLAYING';
        this.lastFrameTime = performance.now();
        this.vibrate(30); // 게임 시작 진동
        this.gameLoop();
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
        // 시작할 때는 적 1명만 생성
        this.spawnFirstEnemy();
        
        // 적 스폰 타이머 초기화
        this.enemySpawnTimer = 0;
        this.nextEnemySpawnTime = 10000; // 10초 후 첫 번째 추가 적 스폰
        this.maxEnemies = 5; // 최대 적 수
    }
    
    spawnFirstEnemy() {
        if (!this.enemyImages) return;
        
        // 플레이어로부터 가장 먼 위치에 첫 번째 적 생성
        const safeSpots = this.getSafeSpawnSpots();
        if (safeSpots.length > 0) {
            const farthestSpot = this.getFarthestSpotFromPlayer(safeSpots);
            const mobTypes = ['mob1', 'mob2', 'mob3'];
            const mobType = mobTypes[0];
            
            try {
                this.enemies.push(new Enemy(farthestSpot.x, farthestSpot.y, ENEMY_INITIAL_SPEED, this.enemyImages, mobType));
                console.log(`첫 번째 적 생성: (${Math.floor(farthestSpot.x/TILE_SIZE)}, ${Math.floor(farthestSpot.y/TILE_SIZE)})`);
            } catch (error) {
                console.error('Error creating first enemy:', error);
            }
        }
    }
    
    getSafeSpawnSpots() {
        const safeSpots = [];
        for (let row = 1; row < MAP_ROWS - 1; row++) {
            for (let col = 1; col < MAP_COLS - 1; col++) {
                if (MAP[row][col] === 0) {
                    safeSpots.push({x: col * TILE_SIZE + 5, y: row * TILE_SIZE + 5, row, col});
                }
            }
        }
        return safeSpots;
    }
    
    getFarthestSpotFromPlayer(spots) {
        const playerRow = Math.floor(this.player.y / TILE_SIZE);
        const playerCol = Math.floor(this.player.x / TILE_SIZE);
        
        return spots.reduce((farthest, spot) => {
            const currentDistance = Math.abs(spot.row - playerRow) + Math.abs(spot.col - playerCol);
            const farthestDistance = Math.abs(farthest.row - playerRow) + Math.abs(farthest.col - playerCol);
            return currentDistance > farthestDistance ? spot : farthest;
        });
    }
    
    updateEnemySpawning(deltaTime) {
        // 적 스폰 타이머 업데이트
        this.enemySpawnTimer += deltaTime;
        
        // 최대 적 수에 도달했으면 스폰하지 않음
        if (this.enemies.length >= this.maxEnemies) return;
        
        // 스폰 시간이 되었으면 새로운 적 생성
        if (this.enemySpawnTimer >= this.nextEnemySpawnTime) {
            this.spawnRandomEnemy();
            this.enemySpawnTimer = 0;
            
            // 다음 스폰 시간 설정 (점점 빨라짐, 최소 5초)
            this.nextEnemySpawnTime = Math.max(5000, this.nextEnemySpawnTime - 1000);
            console.log(`다음 적 스폰까지: ${this.nextEnemySpawnTime/1000}초`);
        }
    }
    
    spawnRandomEnemy() {
        if (!this.enemyImages) return;
        
        try {
            // 플레이어와 기존 적들로부터 충분히 떨어진 랜덤 위치 찾기
            const safeSpots = this.getSafeSpawnSpots();
            const validSpots = safeSpots.filter(spot => {
                // 플레이어로부터 최소 4타일 떨어진 곳
                const playerRow = Math.floor(this.player.y / TILE_SIZE);
                const playerCol = Math.floor(this.player.x / TILE_SIZE);
                const distanceFromPlayer = Math.abs(spot.row - playerRow) + Math.abs(spot.col - playerCol);
                
                // 기존 적들로부터도 최소 2타일 떨어진 곳
                const tooCloseToEnemy = this.enemies.some(enemy => {
                    const enemyRow = Math.floor(enemy.y / TILE_SIZE);
                    const enemyCol = Math.floor(enemy.x / TILE_SIZE);
                    const distanceFromEnemy = Math.abs(spot.row - enemyRow) + Math.abs(spot.col - enemyCol);
                    return distanceFromEnemy < 2;
                });
                
                return distanceFromPlayer >= 4 && !tooCloseToEnemy;
            });
            
            if (validSpots.length > 0) {
                // 랜덤한 유효한 위치 선택
                const randomSpot = validSpots[Math.floor(Math.random() * validSpots.length)];
                const mobTypes = ['mob1', 'mob2', 'mob3'];
                const mobType = mobTypes[this.enemies.length % mobTypes.length];
                
                this.enemies.push(new Enemy(randomSpot.x, randomSpot.y, ENEMY_INITIAL_SPEED, this.enemyImages, mobType));
                
                console.log(`새로운 적 스폰: ${mobType} at (${Math.floor(randomSpot.x/TILE_SIZE)}, ${Math.floor(randomSpot.y/TILE_SIZE)})`);
                
                // 스폰 효과 추가
                this.showEnemySpawnEffect(randomSpot.x, randomSpot.y);
            } else {
                console.log('적 스폰할 안전한 위치를 찾을 수 없음');
            }
        } catch (error) {
            console.error('Error spawning random enemy:', error);
        }
    }
    
    showEnemySpawnEffect(x, y) {
        // 적 스폰 시각 효과 (파티클이나 텍스트)
        this.particles.push({
            x: x,
            y: y,
            text: '👹',
            life: 1000,
            startTime: Date.now(),
            update: function(deltaTime) {
                this.life -= deltaTime;
                return this.life > 0;
            },
            draw: function(ctx) {
                const alpha = this.life / 1000;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'red';
                ctx.fillText(this.text, this.x, this.y - (1000 - this.life) * 0.05);
                ctx.restore();
            }
        });
    }

    increaseDifficulty() {
        this.enemies.forEach(e => { if (e.speed < ENEMY_MAX_SPEED) e.speed += SPEED_INCREASE_AMOUNT; });
        
        // BGM 속도 조절
        if (this.bgmNormal && this.bgmNormal.playbackRate < BGM_FAST_THRESHOLD) {
            this.bgmNormal.playbackRate += BGM_RATE_INCREASE_AMOUNT;
        } else {
            // 임계값 넘으면 fast BGM으로 전환
            if (this.bgmNormal && !this.bgmNormal.paused) this.bgmNormal.pause();
            if (this.bgmFast && this.bgmFast.paused) this.bgmFast.play().catch(e => {});
            if (this.bgmFast) this.bgmFast.playbackRate += BGM_RATE_INCREASE_AMOUNT;
        }
        // fast BGM도 최대 속도 제한
        if (this.bgmFast && this.bgmFast.playbackRate > BGM_MAX_RATE) this.bgmFast.playbackRate = BGM_MAX_RATE;
    }

    update(deltaTime) {
        // deltaTime은 gameLoop에서 전달받음

        // 플레이어 업데이트
        this.player.update(this.keys, this.player.currentMoveDirection, deltaTime);
        
        // 똥 생성
        if (--this.poopCooldown <= 0) {
            const newPoop = this.player.dropPoop(this.poopMap);
            if (newPoop) { 
                this.poops.push(newPoop); 
                this.poopMap[newPoop.tileY][newPoop.tileX] = true; 
                
                // 더블똥 파워업 효과
                if (this.hasActivePowerup('double_poop')) {
                    const extraPoop = this.player.dropExtraPoop(this.poopMap);
                    if (extraPoop) {
                        this.poops.push(extraPoop);
                        this.poopMap[extraPoop.tileY][extraPoop.tileX] = true;
                    }
                }
            }
            this.poopCooldown = POOP_INTERVAL;
        }
        
        // 적 업데이트
        this.enemies.forEach(e => e.update(this.poops, this.player, this.enemies, deltaTime));
        
        // 시간에 따른 적 스폰
        this.updateEnemySpawning(deltaTime);
        
        // 파워업 업데이트
        this.powerups = this.powerups.filter(powerup => powerup.update(deltaTime));
        
        // 활성 파워업 업데이트
        this.activePowerups = this.activePowerups.filter(powerup => {
            return Date.now() - powerup.startTime < powerup.duration;
        });
        
        // 파티클 업데이트
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
        
        // 파워업 생성 (랜덤)
        if (Math.random() < 0.001 * STAGES[this.currentStage - 1].powerupChance) {
            this.spawnPowerup();
        }
        
        // 스테이지 체크
        this.checkStageProgression();
        
        // 경험치 증가 (안전하게)
        if (typeof this.experience === 'number' && typeof this.level === 'number') {
            this.experience += deltaTime * 10;
            if (this.experience >= this.level * 100) {
                this.levelUp();
            }
        }
    }

    handleCollisions() {
        // 적과 똥 충돌
        this.enemies.forEach(enemy => {
            let atePoop = false;
            for (let i = this.poops.length - 1; i >= 0; i--) {
                if (checkCollision(enemy, this.poops[i])) {
                    const eatenPoop = this.poops[i];
                    this.poopMap[eatenPoop.tileY][eatenPoop.tileX] = false;
                    this.poops.splice(i, 1);
                    atePoop = true;
                    
                    // 점수 부스트 파워업 효과
                    if (this.hasActivePowerup('score_boost')) {
                        this.experience += 5; // 추가 경험치
                    }
                }
            }
            if (atePoop) enemy.onPoopEaten();
            
            // 플레이어와 적 충돌
            if (checkCollision(this.player, enemy)) {
                // 보호막 상태 체크 (최우선)
                if (this.player.hasShield) {
                    this.player.hasShield = false; // 보호막 소모
                    this.player.shieldStartTime = 0; // 보호막 타이머 리셋
                    enemy.stunned = true;
                    enemy.stunnedUntil = Date.now() + 1000;
                    this.createSkillEffect('shield_break'); // 보호막 파괴 효과
                    this.vibrate(100);
                    return; // 다음 적으로 넘어감 (게임오버 안됨)
                }
                
                // 무적 상태 체크
                if (this.player.isInvincible) {
                    return; // 다음 적으로 넘어감 (게임오버 안됨)
                }
                
                // 게임오버 - 모바일에서는 바로 리더보드로
                if (this.isMobile) {
                    // 모바일에서는 기본 이름으로 점수 저장 후 바로 리더보드
                    this.saveScore('Player', this.score);
                    this.gameState = 'LEADERBOARD';
                } else {
                    // PC에서는 이름 입력 화면
                    this.gameState = 'ENTERING_NAME';
                }
                
                if (this.bgmNormal && !this.bgmNormal.paused) this.bgmNormal.pause();
                if (this.bgmFast && !this.bgmFast.paused) this.bgmFast.pause();
                this.playSound(this.sfxGameOver);
                this.vibrate(200);
            }
        });
        
        // 플레이어와 파워업 충돌
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            if (checkCollision(this.player, this.powerups[i])) {
                const powerup = this.powerups[i];
                this.activatePowerup(powerup.type);
                this.powerups.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 스테이지별 배경색
        const stage = STAGES[this.currentStage - 1];
        if (stage) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, stage.bgColor);
            gradient.addColorStop(1, stage.bgColor + '80');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.drawMap();
        
        // 파티클 (배경)
        this.particles.forEach(p => p.draw(this.ctx));
        
        // 파워업
        this.powerups.forEach(p => p.draw(this.ctx));
        
        // 똥
        this.poops.forEach(p => p.draw(this.ctx));
        
        // 플레이어
        this.player.draw(this.ctx);
        
        // 적들
        this.enemies.forEach(e => e.draw(this.ctx));
        
        // UI
        this.drawUI();
        this.drawDpad();
    }

    gameLoop(currentTime = performance.now()) {
        // 프레임 레이트 제한 (60 FPS)
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // 프레임 스킵 (너무 빠른 프레임은 건너뛰기)
        if (deltaTime < 1/120) {
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        try {
            // 상태별 최적화된 렌더링
            switch(this.gameState) {
                case 'PLAYING':
                    this.score = Math.floor((Date.now() - this.startTime) / 1000);
                    this.update(deltaTime);
                    this.handleCollisions();
                    this.draw();
                    break;
                case 'PRE_GAME_OVERLAY':
                    // 시작 화면은 30fps로 제한
                    if (currentTime - this.lastUIUpdate > 33) {
                        this.drawStartScreen();
                        this.lastUIUpdate = currentTime;
                    }
                    break;
                case 'CONTROL_SELECTION':
                    if (currentTime - this.lastUIUpdate > 33) {
                        this.drawControlSelectionScreen();
                        this.lastUIUpdate = currentTime;
                    }
                    break;
                case 'ENTERING_NAME':
                    if (currentTime - this.lastUIUpdate > 33) {
                        this.drawNameEntryScreen();
                        this.lastUIUpdate = currentTime;
                    }
                    break;
                case 'LEADERBOARD':
                    if (currentTime - this.lastUIUpdate > 33) {
                        this.drawLeaderboard();
                        this.lastUIUpdate = currentTime;
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in gameLoop:', error);
            // 게임 상태를 안전한 상태로 복구
            this.gameState = 'ENTERING_NAME';
        }
        
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    drawMap() {
        // 맵이 변경되었을 때만 다시 그리기
        if (this.mapNeedsRedraw) {
            this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
            
            // 배경 그라디언트
            const gradient = this.offscreenCtx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            this.offscreenCtx.fillStyle = gradient;
            this.offscreenCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 벽 그리기 (배치로 최적화)
            this.offscreenCtx.fillStyle = '#34568B';
            for(let r = 0; r < MAP_ROWS; r++) {
                for(let c = 0; c < MAP_COLS; c++) {
                    if(MAP[r][c] === 1) {
                        this.offscreenCtx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
            
            // 벽에 테두리 효과 추가
            this.offscreenCtx.strokeStyle = '#4a90e2';
            this.offscreenCtx.lineWidth = 1;
            for(let r = 0; r < MAP_ROWS; r++) {
                for(let c = 0; c < MAP_COLS; c++) {
                    if(MAP[r][c] === 1) {
                        this.offscreenCtx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
            
            this.mapNeedsRedraw = false;
        }
        
        // 오프스크린 캔버스에서 메인 캔버스로 복사
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    drawUI() {
        // 상단 정보 패널 - 더 작고 투명하게
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(5, 5, this.canvas.width - 10, 40);
        this.ctx.strokeStyle = 'rgba(74, 144, 226, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(5, 5, this.canvas.width - 10, 40);
        
        // 점수와 스테이지 - 한 줄로 압축
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`⏱️ ${this.score}초 | 🏆 Stage ${this.currentStage}`, 12, 25);
        
        // 레벨과 경험치 - 더 작게
        const expPercent = (this.experience / (this.level * 100)) * 100;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`Lv.${this.level}`, this.canvas.width - 70, 20);
        
        // 경험치 바 - 더 작게
        const expBarWidth = 50;
        const expBarX = this.canvas.width - 65;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(expBarX, 25, expBarWidth, 6);
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(expBarX, 25, (expBarWidth * expPercent) / 100, 6);
        
        // 스킬 UI (PC와 모바일 모두)
        this.drawSkillButtons();
        
        // 활성 파워업 표시
        this.drawActivePowerups();
        
        // 스테이지 전환 텍스트
        if (this.stageTransitionText && Date.now() - this.stageTransitionTime < 3000) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.stageTransitionText, this.canvas.width / 2, this.canvas.height / 2 + 8);
            this.ctx.restore();
        }
        
        // 스킬 해금 텍스트
        if (this.skillUnlockedText && Date.now() - this.skillUnlockedTime < 3000) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.skillUnlockedText, this.canvas.width / 2, 100);
            this.ctx.restore();
        }
        
        // 스킬 사용 효과 텍스트
        if (this.skillEffectText && Date.now() - this.skillEffectTime < 1500) {
            this.ctx.save();
            const elapsed = Date.now() - this.skillEffectTime;
            const alpha = Math.max(0, 1 - elapsed / 1500);
            const scale = 1 + (elapsed / 1500) * 0.5; // 텍스트가 커지면서 사라짐
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = this.skillEffectColor;
            this.ctx.font = `bold ${Math.floor(24 * scale)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.lineWidth = 2;
            
            const textY = this.canvas.height / 2 - 50 - (elapsed / 1500) * 30; // 위로 올라가면서 사라짐
            this.ctx.strokeText(this.skillEffectText, this.canvas.width / 2, textY);
            this.ctx.fillText(this.skillEffectText, this.canvas.width / 2, textY);
            this.ctx.restore();
        }
        
        // 초보자 안내 - 위치 조정
        if (this.score < 5) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            if (this.controlMode === 'MOBILE') {
                this.ctx.fillText('스와이프: 이동 | 스킬버튼: 특수능력', this.canvas.width / 2, 60);
            } else {
                this.ctx.fillText('방향키: 이동 | Q(ㅂ),W(ㅈ),E(ㄷ),R(ㄱ): 스킬', this.canvas.width / 2, 60);
            }
        }
    }
    
    drawSkillButtons() {
        const skillIds = ['dash', 'shield', 'freeze', 'bomb'];
        const skillKeys = ['Q/ㅂ', 'W/ㅈ', 'E/ㄷ', 'R/ㄱ']; // PC 키보드 단축키 (한글/영문)
        
        // PC와 모바일에 따른 다른 레이아웃
        let buttonSize, startX, startY, spacing;
        
        if (this.controlMode === 'MOBILE') {
            buttonSize = 40;
            startX = this.canvas.width - 200;
            startY = this.canvas.height - 60;
            spacing = 45;
        } else {
            // PC 버전: 상단 우측에 더 큰 스킬 UI
            buttonSize = 36;
            startX = this.canvas.width - 180;
            startY = 50;
            spacing = 42;
        }
        
        skillIds.forEach((skillId, index) => {
            const skill = this.skills[skillId];
            const x = startX + (index * spacing);
            const y = startY;
            
            // 스킬이 해금되지 않았으면 회색으로
            if (!skill || !skill.unlocked) {
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            } else {
                const now = Date.now();
                const cooldownRemaining = Math.max(0, skill.cooldown - (now - skill.lastUsed));
                
                if (cooldownRemaining > 0) {
                    this.ctx.fillStyle = 'rgba(200, 100, 100, 0.6)';
                } else {
                    this.ctx.fillStyle = 'rgba(74, 144, 226, 0.7)';
                }
            }
            
            // 버튼 배경
            this.ctx.fillRect(x, y, buttonSize, buttonSize);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, buttonSize, buttonSize);
            
            // 스킬 아이콘
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            if (skill) {
                this.ctx.fillText(skill.icon, x + buttonSize/2, y + buttonSize/2);
            }
            
            // PC 버전에서는 키보드 단축키 표시
            if (this.controlMode === 'PC') {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                this.ctx.font = 'bold 8px Arial';
                this.ctx.fillText(skillKeys[index], x + buttonSize/2, y - 8);
            }
            
            // 쿨다운 표시
            if (skill && skill.unlocked) {
                const now = Date.now();
                const cooldownRemaining = Math.max(0, skill.cooldown - (now - skill.lastUsed));
                if (cooldownRemaining > 0) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.fillText(Math.ceil(cooldownRemaining / 1000), x + buttonSize/2, y + buttonSize + 15);
                }
            }
            
            // 스킬 이름 (PC 버전에서만)
            if (this.controlMode === 'PC' && skill && skill.unlocked) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(skill.name, x + buttonSize/2, y - 5);
            }
        });
    }
    
    drawActivePowerups() {
        let yOffset = 50; // 상단 패널 크기에 맞춰 조정
        this.activePowerups.forEach(powerup => {
            const data = POWERUPS[powerup.type];
            const remaining = Math.max(0, powerup.duration - (Date.now() - powerup.startTime));
            
            if (remaining > 0) {
                // 파워업 아이콘 - 더 작고 투명하게
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.fillRect(this.canvas.width - 35, yOffset, 30, 20);
                this.ctx.fillStyle = data.color;
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(data.icon, this.canvas.width - 20, yOffset + 14);
                
                // 남은 시간 - 더 작게
                this.ctx.fillStyle = 'white';
                this.ctx.font = '8px Arial';
                this.ctx.fillText(Math.ceil(remaining / 1000), this.canvas.width - 20, yOffset + 28);
                
                yOffset += 30; // 간격 줄임
            }
        });
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
        
        // 키보드 중앙 정렬을 위한 전체 너비 계산
        let keyboardWidth = 0;
        if (KEYBOARD_LAYOUT.length > 0) {
            let currentX = 0;
            for (let c = 0; c < KEYBOARD_LAYOUT[0].length; c++) {
                const key = KEYBOARD_LAYOUT[0][c];
                const keyWidth = key.length > 2 ? this.keyboard.keySize*2.5 : (key.length > 1 ? this.keyboard.keySize*1.5 : this.keyboard.keySize);
                currentX += keyWidth + 5;
            }
            keyboardWidth = currentX - 5; // 마지막 키 뒤의 간격 제거
        }
        
        // 키보드 시작 X 좌표 계산 (중앙 정렬)
        const keyboardStartX = (this.canvas.width - keyboardWidth) / 2;
        
        let currentX = keyboardStartX;
        for(let r=0; r<KEYBOARD_LAYOUT.length; r++) {
            currentX = keyboardStartX; // 각 행의 시작 X 좌표를 재설정
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

    drawStartScreen() {
        // 배경 그라디언트
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(26,26,46,0.95)');
        gradient.addColorStop(0.5, 'rgba(22,33,62,0.95)');
        gradient.addColorStop(1, 'rgba(15,52,96,0.95)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 제목
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('🎮 똥맨', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // 부제목
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('Poop-Man Game', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // 시작 안내
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillText('화면을 터치하여 시작하세요', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // 애니메이션 효과 (깜빡이는 손가락)
        const time = Date.now();
        const alpha = (Math.sin(time * 0.005) + 1) / 2;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.font = '40px Arial';
        this.ctx.fillText('👆', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
        // 모바일 감지 표시
        if (this.isMobile) {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.fillText('모바일 모드로 시작됩니다', this.canvas.width / 2, this.canvas.height - 40);
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
        
        // 다시 시작 버튼
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = this.canvas.height - 100;
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.strokeStyle = '#45a049';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px sans-serif';
        this.ctx.fillText('다시 시작', this.canvas.width/2, buttonY + 32);
        
        // 버튼 영역 저장 (클릭 감지용)
        this.restartButton = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight
        };
    }

    drawControlSelectionScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap();
        this.player.draw(this.ctx);
        
        // 배경 오버레이
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(26,26,46,0.9)');
        gradient.addColorStop(1, 'rgba(15,52,96,0.9)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 제목
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText('조작 방식 선택', this.canvas.width / 2, 120);
        this.ctx.fillText('조작 방식 선택', this.canvas.width / 2, 120);

        const btnWidth = 200;
        const btnHeight = 60;
        const centerX = this.canvas.width / 2;
        
        // PC 버튼
        const pcBtnX = centerX - btnWidth / 2;
        const pcBtnY = this.canvas.height / 2 - 40;
        
        this.ctx.fillStyle = 'rgba(74, 144, 226, 0.8)';
        this.ctx.strokeStyle = 'rgba(74, 144, 226, 1)';
        this.ctx.lineWidth = 3;
        this.ctx.fillRect(pcBtnX, pcBtnY, btnWidth, btnHeight);
        this.ctx.strokeRect(pcBtnX, pcBtnY, btnWidth, btnHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('🖥️ PC (키보드)', centerX, pcBtnY + 25);
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.fillText('방향키로 조작', centerX, pcBtnY + 45);

        // Mobile 버튼
        const mobileBtnX = centerX - btnWidth / 2;
        const mobileBtnY = this.canvas.height / 2 + 20;
        
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 1)';
        this.ctx.lineWidth = 3;
        this.ctx.fillRect(mobileBtnX, mobileBtnY, btnWidth, btnHeight);
        this.ctx.strokeRect(mobileBtnX, mobileBtnY, btnWidth, btnHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('📱 모바일 (터치)', centerX, mobileBtnY + 25);
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.fillText('스와이프로 조작', centerX, mobileBtnY + 45);
    }

    drawDpad() {
        if (this.controlMode !== 'MOBILE') return;
        
        const dpad = this.dpad;
        const centerX = dpad.x + dpad.size / 2;
        const centerY = dpad.y + dpad.size / 2;
        
        // D-pad 외곽 원 (글로우 효과) - 더 투명하게
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(74, 144, 226, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, dpad.size / 2 + 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // D-pad 배경 - 더 투명하게
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, dpad.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 방향 버튼들
        const directions = [
            { name: 'up', x: centerX, y: centerY - dpad.buttonSize, symbol: '▲' },
            { name: 'down', x: centerX, y: centerY + dpad.buttonSize, symbol: '▼' },
            { name: 'left', x: centerX - dpad.buttonSize, y: centerY, symbol: '◀' },
            { name: 'right', x: centerX + dpad.buttonSize, y: centerY, symbol: '▶' }
        ];
        
        directions.forEach(dir => {
            const isActive = this.dpad.activeDirection === dir.name || 
                           this.player.currentMoveDirection === dir.name;
            
            // 버튼 배경 - 더 투명하게
            this.ctx.fillStyle = isActive ? 
                'rgba(74, 144, 226, 0.5)' : 
                'rgba(255, 255, 255, 0.1)';
            this.ctx.strokeStyle = isActive ? 
                'rgba(74, 144, 226, 0.7)' : 
                'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            this.ctx.arc(dir.x, dir.y, dpad.buttonSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // 방향 심볼 - 더 작게
            this.ctx.fillStyle = isActive ? 'white' : 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(dir.symbol, dir.x, dir.y);
        });
        
        // 중앙 점 - 더 작게
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    spawnPowerup() {
        try {
            // 파워업이 너무 많으면 생성하지 않음
            if (this.powerups.length >= 3) return;
            
            // 빈 타일에 파워업 생성
            const emptyTiles = [];
            for (let y = 1; y < MAP_ROWS - 1; y++) {
                for (let x = 1; x < MAP_COLS - 1; x++) {
                    if (MAP[y] && MAP[y][x] === 0 && this.poopMap[y] && !this.poopMap[y][x]) {
                        emptyTiles.push({x, y});
                    }
                }
            }
            
            if (emptyTiles.length > 0) {
                const tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
                const powerupTypes = Object.keys(POWERUPS);
                if (powerupTypes.length > 0) {
                    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                    
                    this.powerups.push(new PowerUp(
                        tile.x * TILE_SIZE + 7.5,
                        tile.y * TILE_SIZE + 7.5,
                        type
                    ));
                }
            }
        } catch (error) {
            console.error('Error spawning powerup:', error);
        }
    }
    
    hasActivePowerup(type) {
        return this.activePowerups.some(p => p.type === type);
    }
    
    activatePowerup(type) {
        const powerup = POWERUPS[type];
        this.activePowerups.push({
            type: type,
            startTime: Date.now(),
            duration: powerup.duration
        });
        
        // 파워업 효과 적용
        switch(type) {
            case 'speed':
                this.player.speedBoost = 1.5;
                break;
            case 'invincible':
                this.player.isInvincible = true;
                this.player.invincibleStartTime = Date.now();
                break;
        }
        
        // 파티클 효과
        this.createPowerupParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, powerup.color);
        this.vibrate(25);
    }
    
    createPowerupParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const velocity = {
                x: Math.cos(angle) * (2 + Math.random() * 3),
                y: Math.sin(angle) * (2 + Math.random() * 3)
            };
            this.particles.push(new Particle(x, y, color, velocity, 1));
        }
    }
    
    createSkillEffect(skillId) {
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        switch(skillId) {
            case 'dash':
                // 파란색 대시 효과
                this.createPowerupParticles(playerCenterX, playerCenterY, '#4a90e2');
                this.showSkillText('💨 DASH!', '#4a90e2');
                break;
            case 'shield':
                // 청록색 보호막 효과
                this.createPowerupParticles(playerCenterX, playerCenterY, '#00bcd4');
                this.showSkillText('🛡️ SHIELD!', '#00bcd4');
                break;
            case 'freeze':
                // 얼음 효과 - 모든 적 주변에 파티클
                this.enemies.forEach(enemy => {
                    this.createPowerupParticles(enemy.x + 16, enemy.y + 16, '#87ceeb');
                });
                this.showSkillText('❄️ FREEZE!', '#87ceeb');
                break;
            case 'bomb':
                // 폭발 효과는 이미 createBombExplosion에서 처리
                this.showSkillText('💣 BOMB!', '#ff4444');
                break;
            case 'shield_break':
                // 보호막 파괴 효과
                this.createPowerupParticles(playerCenterX, playerCenterY, '#ffaa00');
                this.showSkillText('🛡️ 보호막 파괴!', '#ffaa00');
                break;
        }
    }
    
    showSkillText(text, color) {
        // 스킬 사용 텍스트 표시
        this.skillEffectText = text;
        this.skillEffectColor = color;
        this.skillEffectTime = Date.now();
    }
    
    checkStageProgression() {
        try {
            const nextStage = STAGES.find(stage => stage.id === this.currentStage + 1);
            if (nextStage && this.score >= nextStage.requiredTime) {
                // 10초 전 경고 메시지
                const timeUntilNext = nextStage.requiredTime - this.score;
                if (timeUntilNext <= 10 && timeUntilNext > 0 && !this.stageWarningShown) {
                    this.showStageWarning(timeUntilNext);
                    this.stageWarningShown = true;
                }
                
                // 스테이지 변경
                if (this.score >= nextStage.requiredTime) {
                    console.log(`Stage progression: ${this.currentStage} -> ${this.currentStage + 1}`);
                    this.currentStage++;
                    this.stageWarningShown = false; // 다음 스테이지를 위해 리셋
                    this.showStageTransition();
                    this.updateStageSettings();
                }
            }
        } catch (error) {
            console.error('Error in checkStageProgression:', error);
        }
    }
    
    showStageWarning(timeLeft) {
        this.stageTransitionText = `⚠️ ${Math.ceil(timeLeft)}초 후 다음 스테이지!`;
        this.stageTransitionTime = Date.now();
        console.log(`Stage warning: ${Math.ceil(timeLeft)} seconds until next stage`);
    }
    
    updateStageSettings() {
        try {
            const stage = STAGES[this.currentStage - 1];
            if (!stage) {
                console.error('Invalid stage:', this.currentStage);
                return;
            }
            
            // 맵 변경 (스테이지에 맞는 맵으로 변경)
            this.changeMap(this.currentStage);
            
            // 적 수 조정 (최대 10개로 제한하여 무한 루프 방지)
            let attempts = 0;
            while (this.enemies.length < stage.enemyCount && attempts < 10) {
                this.createAdditionalEnemy();
                attempts++;
            }
            
            // 적 속도 조정
            this.enemies.forEach(enemy => {
                if (enemy && typeof enemy.speed === 'number') {
                    enemy.speed = Math.max(enemy.speed, stage.enemySpeed);
                }
            });
        } catch (error) {
            console.error('Error in updateStageSettings:', error);
        }
    }
    
    createAdditionalEnemy() {
        // enemyImages가 로드되지 않았으면 적 생성하지 않음
        if (!this.enemyImages) {
            console.warn('Enemy images not loaded yet, skipping enemy creation');
            return;
        }
        
        const spawnPoints=[{x:TILE_SIZE*10+5,y:TILE_SIZE+5},{x:TILE_SIZE+5,y:TILE_SIZE*14+5},{x:TILE_SIZE*10+5,y:TILE_SIZE*14+5}];
        const mobTypes = ['mob1', 'mob2', 'mob3'];
        const sp = spawnPoints[this.enemies.length % spawnPoints.length];
        const mobType = mobTypes[this.enemies.length % mobTypes.length];
        
        try {
            this.enemies.push(new Enemy(sp.x, sp.y, ENEMY_INITIAL_SPEED, this.enemyImages, mobType));
        } catch (error) {
            console.error('Error creating additional enemy:', error);
        }
    }
    
    changeMap(stageNumber) {
        try {
            // 새로운 맵이 있으면 변경, 없으면 마지막 맵 사용
            const newMap = MAPS[stageNumber] || MAPS[5]; // 최대 5개 맵, 그 이후는 5번 맵 재사용
            MAP = newMap;
            
            console.log(`맵 변경: 스테이지 ${stageNumber}`);
            
            // 기존 똥들 완전히 제거
            this.poops = [];
            this.poopMap = Array(MAP_ROWS).fill(0).map(() => Array(MAP_COLS).fill(false));
            
            // 파워업들도 제거 (새로운 맵에서 새로 시작)
            this.powerups = [];
            
            // 플레이어와 적들의 위치를 새로운 맵에 맞게 조정
            this.repositionCharacters();
            
            // 맵 변경 시 플레이어에게 잠시 무적 상태 부여 (적응 시간)
            this.player.isInvincible = true;
            this.player.invincibleStartTime = Date.now();
            
            // 맵 변경 효과음이나 시각 효과 추가 가능
            this.showMapChangeEffect();
            
        } catch (error) {
            console.error('Error changing map:', error);
        }
    }
    
    repositionCharacters() {
        try {
            // 플레이어를 맵 중앙 근처 안전한 위치로 이동
            const centerRow = Math.floor(MAP_ROWS / 2);
            const centerCol = Math.floor(MAP_COLS / 2);
            
            // 중앙 근처에서 빈 공간 찾기
            let playerSpot = null;
            for (let radius = 0; radius < 3; radius++) {
                for (let dr = -radius; dr <= radius; dr++) {
                    for (let dc = -radius; dc <= radius; dc++) {
                        const row = centerRow + dr;
                        const col = centerCol + dc;
                        if (row >= 1 && row < MAP_ROWS - 1 && col >= 1 && col < MAP_COLS - 1 && MAP[row][col] === 0) {
                            playerSpot = {x: col * TILE_SIZE + 5, y: row * TILE_SIZE + 5, row, col};
                            break;
                        }
                    }
                    if (playerSpot) break;
                }
                if (playerSpot) break;
            }
            
            if (playerSpot) {
                this.player.x = playerSpot.x;
                this.player.y = playerSpot.y;
                console.log(`플레이어 재배치: (${Math.floor(playerSpot.x/TILE_SIZE)}, ${Math.floor(playerSpot.y/TILE_SIZE)})`);
            }
            
            // 기존 적들 제거 (새로운 스폰 시스템으로 다시 생성됨)
            this.enemies = [];
            
            // 적 스폰 시스템 리셋
            this.enemySpawnTimer = 0;
            this.nextEnemySpawnTime = 10000; // 10초 후 첫 번째 적
            
            // 첫 번째 적만 즉시 생성
            setTimeout(() => {
                this.spawnFirstEnemy();
            }, 1000); // 1초 후에 첫 번째 적 생성
            
        } catch (error) {
            console.error('Error repositioning characters:', error);
        }
    }
    
    showMapChangeEffect() {
        // 맵 변경 시각 효과
        this.stageTransitionText = `🗺️ 새로운 맵!`;
        this.stageTransitionTime = Date.now();
    }
    
    showStageTransition() {
        // 스테이지 전환 애니메이션 (간단한 텍스트)
        this.stageTransitionText = `🎯 스테이지 ${this.currentStage} - 새로운 맵!`;
        this.stageTransitionTime = Date.now();
    }
    
    levelUp() {
        this.level++;
        this.experience = 0;
        
        try {
            // 새로운 스킬 해금 (안전하게)
            const skillIds = Object.values(SKILLS).map(skill => skill.id); // 실제 스킬 ID 사용
            const unlockedSkills = skillIds.filter(id => this.skills[id] && this.skills[id].unlocked);
            
            if (unlockedSkills.length < skillIds.length) {
                const nextSkillId = skillIds[unlockedSkills.length];
                if (this.skills[nextSkillId]) {
                    this.skills[nextSkillId].unlocked = true;
                    this.showSkillUnlocked(nextSkillId);
                    console.log(`스킬 해금: ${nextSkillId} (레벨 ${this.level})`);
                }
            }
        } catch (error) {
            console.error('Error in levelUp:', error);
        }
        
        this.vibrate(50);
    }
    
    showSkillUnlocked(skillId) {
        const skill = this.skills[skillId]; // this.skills에서 가져오기
        if (skill) {
            this.skillUnlockedText = `새 스킬: ${skill.name} ${skill.icon}`;
            this.skillUnlockedTime = Date.now();
            console.log(`스킬 해금 알림: ${skill.name}`);
        }
    }
    
    useSkill(skillId) {
        const skill = this.skills[skillId];
        const now = Date.now();
        
        if (!skill || !skill.unlocked || now - skill.lastUsed < skill.cooldown) {
            return false;
        }
        
        skill.lastUsed = now;
        
        switch(skillId) {
            case 'dash':
                this.player.activateSkill('dash');
                this.createSkillEffect('dash');
                break;
            case 'shield':
                this.player.activateSkill('shield');
                this.createSkillEffect('shield');
                break;
            case 'freeze':
                this.enemies.forEach(enemy => {
                    enemy.frozen = true;
                    enemy.frozenUntil = now + SKILLS.FREEZE.duration;
                });
                this.createSkillEffect('freeze');
                break;
            case 'bomb':
                this.createBombExplosion();
                this.createSkillEffect('bomb');
                break;
        }
        
        this.vibrate(30);
        return true;
    }
    
    createBombExplosion() {
        // 플레이어 주변의 적들을 일시적으로 제거
        const bombRadius = 100;
        const destroyedEnemies = [];
        
        // 폭발 범위 내의 적들 찾기
        this.enemies.forEach((enemy, index) => {
            const distance = getDistance(this.player, enemy);
            if (distance < bombRadius) {
                // 적 정보 저장 (리스폰용)
                destroyedEnemies.push({
                    x: enemy.x,
                    y: enemy.y,
                    speed: enemy.speed,
                    mobType: enemy.mobType,
                    respawnTime: Date.now() + (3000 + Math.random() * 2000) // 3-5초 후 리스폰
                });
                
                // 적 제거 파티클 효과
                this.createPowerupParticles(enemy.x + 16, enemy.y + 16, '#ff6666');
            }
        });
        
        // 폭발 범위 내의 적들 제거
        this.enemies = this.enemies.filter(enemy => {
            const distance = getDistance(this.player, enemy);
            return distance >= bombRadius;
        });
        
        // 리스폰 예약 (this 컨텍스트 보존)
        destroyedEnemies.forEach(enemyData => {
            const gameInstance = this; // this 컨텍스트 보존
            setTimeout(() => {
                try {
                    // 안전한 위치에서 리스폰
                    const spawnPos = gameInstance.findSafeSpawnPosition();
                    if (spawnPos && gameInstance.enemies) {
                        const newEnemy = new Enemy(spawnPos.x, spawnPos.y, enemyData.speed, gameInstance.enemyImages, enemyData.mobType);
                        gameInstance.enemies.push(newEnemy);
                        gameInstance.showEnemySpawnEffect(spawnPos.x, spawnPos.y);
                    }
                } catch (error) {
                    console.error('리스폰 오류:', error);
                }
            }, enemyData.respawnTime - Date.now());
        });
        
        // 폭발 파티클
        this.createPowerupParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff4444');
        
        console.log(`폭탄으로 ${destroyedEnemies.length}개의 적 제거, 3-5초 후 리스폰 예정`);
    }

    findSafeSpawnPosition() {
        // 플레이어로부터 충분히 멀고 벽이 아닌 위치 찾기
        const minDistance = 150;
        const maxAttempts = 50;
        
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.random() * (this.canvas.width - 64) + 32;
            const y = Math.random() * (this.canvas.height - 64) + 32;
            
            // 벽 체크
            const tileX = Math.floor(x / TILE_SIZE);
            const tileY = Math.floor(y / TILE_SIZE);
            
            if (tileX >= 0 && tileX < MAP_COLS && tileY >= 0 && tileY < MAP_ROWS && 
                MAP[tileY][tileX] === 0) {
                
                // 플레이어와의 거리 체크
                const distance = Math.sqrt((x - this.player.x) ** 2 + (y - this.player.y) ** 2);
                if (distance >= minDistance) {
                    return { x, y };
                }
            }
        }
        
        // 안전한 위치를 못 찾으면 맵 모서리에서 스폰
        return {
            x: Math.random() < 0.5 ? 32 : this.canvas.width - 64,
            y: Math.random() < 0.5 ? 32 : this.canvas.height - 64
        };
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
    constructor(x, y, speed, images) {
        super(x, y, speed);
        this.currentMoveDirection = null;
        this.images = images;
        this.facingDirection = 'down';
        
        // 스킬 시스템
        this.isDashing = false;
        this.hasShield = false;
        this.isInvincible = false;
        this.speedBoost = 1;
        this.dashStartTime = 0;
        this.shieldStartTime = 0;
        this.invincibleStartTime = 0;
        
        // 시각적 효과
        this.trailPositions = [];
        this.maxTrailLength = 8;
    }
    update(keys, currentMoveDirection, deltaTime){
        // 스킬 상태 업데이트
        this.updateSkillStates();
        
        let nX=this.x,nY=this.y;
        let moved = false;
        let currentSpeed = this.speed * this.speedBoost;
        
        // 대시 중일 때 속도 증가
        if (this.isDashing) {
            currentSpeed *= 3;
        }

        // 방향 업데이트
        if (currentMoveDirection) {
            this.facingDirection = currentMoveDirection;
        }

        if (currentMoveDirection) {
            if (currentMoveDirection === 'up') nY -= currentSpeed * deltaTime;
            else if (currentMoveDirection === 'down') nY += currentSpeed * deltaTime;
            else if (currentMoveDirection === 'left') nX -= currentSpeed * deltaTime;
            else if (currentMoveDirection === 'right') nX += currentSpeed * deltaTime;
            moved = true;
        } else {
            if(keys.ArrowUp) { nY -= currentSpeed * deltaTime; this.facingDirection = 'up'; moved = true; }
            if(keys.ArrowDown) { nY += currentSpeed * deltaTime; this.facingDirection = 'down'; moved = true; }
            if(keys.ArrowLeft) { nX -= currentSpeed * deltaTime; this.facingDirection = 'left'; moved = true; }
            if(keys.ArrowRight) { nX += currentSpeed * deltaTime; this.facingDirection = 'right'; moved = true; }
        }

        // 트레일 위치 저장 (대시 중일 때)
        if (moved && this.isDashing) {
            this.trailPositions.push({x: this.x, y: this.y, time: Date.now()});
            if (this.trailPositions.length > this.maxTrailLength) {
                this.trailPositions.shift();
            }
        }

        if (moved && !this.isWall(nX,nY)&&!this.isWall(nX+this.width,nY)&&!this.isWall(nX,nY+this.height)&&!this.isWall(nX+this.width,nY+this.height)){
            this.x=nX;
            this.y=nY;
        } else if (moved) {
            this.currentMoveDirection = null;
        }
    }
    
    updateSkillStates() {
        const now = Date.now();
        
        // 대시 상태 체크
        if (this.isDashing && now - this.dashStartTime > SKILLS.DASH.duration) {
            this.isDashing = false;
            this.trailPositions = [];
        }
        
        // 보호막 상태 체크
        if (this.hasShield && now - this.shieldStartTime > SKILLS.SHIELD.duration) {
            this.hasShield = false;
        }
        
        // 무적 상태 체크
        if (this.isInvincible && now - this.invincibleStartTime > POWERUPS.INVINCIBLE.duration) {
            this.isInvincible = false;
        }
    }
    
    activateSkill(skillId) {
        const now = Date.now();
        const skill = SKILLS[skillId];
        
        switch(skillId) {
            case 'dash':
                this.isDashing = true;
                this.dashStartTime = now;
                break;
            case 'shield':
                this.hasShield = true;
                this.shieldStartTime = now;
                break;
            case 'freeze':
                // 적들을 얼림 (Game 클래스에서 처리)
                break;
            case 'bomb':
                // 폭탄 효과 (Game 클래스에서 처리)
                break;
        }
    }
    draw(ctx){
        // 대시 트레일 그리기
        if (this.isDashing && this.trailPositions.length > 0) {
            this.trailPositions.forEach((pos, index) => {
                const alpha = (index + 1) / this.trailPositions.length * 0.5;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(pos.x, pos.y, this.width, this.height);
                ctx.restore();
            });
        }
        
        // 보호막 효과 - 더 눈에 띄게
        if (this.hasShield) {
            ctx.save();
            
            // 회전하는 보호막 링
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const radius = 25;
            const rotation = Date.now() * 0.005;
            
            ctx.strokeStyle = '#00bcd4';
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = Date.now() * 0.02;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 추가 글로우 효과
            ctx.shadowColor = '#00bcd4';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(0, 188, 212, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // 무적 효과 (깜빡임)
        if (this.isInvincible) {
            const shouldShow = Math.floor(Date.now() / 100) % 2;
            if (!shouldShow) return;
        }
        
        // 플레이어 이미지 그리기
        if (this.images) {
            let img;
            switch (this.facingDirection) {
                case 'up': img = this.images.up; break;
                case 'down': img = this.images.down; break;
                case 'left': img = this.images.left; break;
                case 'right': img = this.images.right; break;
                default: img = this.images.down;
            }
            
            if (img) {
                // 대시 중일 때 글로우 효과
                if (this.isDashing) {
                    ctx.save();
                    ctx.shadowColor = '#4a90e2';
                    ctx.shadowBlur = 15;
                }
                
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
                
                if (this.isDashing) {
                    ctx.restore();
                }
            } else {
                this.drawDefaultShape(ctx);
            }
        } else {
            this.drawDefaultShape(ctx);
        }
    }
    
    drawDefaultShape(ctx) {
        ctx.fillStyle='white';
        ctx.fillRect(this.x,this.y+this.height*.4,this.width,this.height*.6);
        ctx.fillStyle='#ddd';
        ctx.fillRect(this.x+this.width*.1,this.y,this.width*.8,this.height*.5);
        ctx.strokeStyle='#999';
        ctx.lineWidth=2;
        ctx.strokeRect(this.x,this.y+this.height*.4,this.width,this.height*.6);
        ctx.strokeRect(this.x+this.width*.1,this.y,this.width*.8,this.height*.5);
    }
    dropPoop(poopMap){
        const pTX=Math.floor((this.x+this.width/2)/TILE_SIZE),pTY=Math.floor((this.y+this.height/2)/TILE_SIZE);
        if(MAP[pTY]===undefined||MAP[pTY][pTX]===undefined||MAP[pTY][pTX]===0&&!poopMap[pTY][pTX]){
            const pX=pTX*TILE_SIZE+(TILE_SIZE-10)/2;
            const pY=pTY*TILE_SIZE+(TILE_SIZE-10)/2;
            return new Poop(pX,pY,pTX,pTY);
        }
        return null;
    }
    
    dropExtraPoop(poopMap) {
        // 더블똥 파워업용 - 주변 빈 타일에 추가 똥 생성
        const directions = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
        const currentTX = Math.floor((this.x+this.width/2)/TILE_SIZE);
        const currentTY = Math.floor((this.y+this.height/2)/TILE_SIZE);
        
        for (let dir of directions) {
            const pTX = currentTX + dir.x;
            const pTY = currentTY + dir.y;
            
            if (MAP[pTY] && MAP[pTY][pTX] === 0 && !poopMap[pTY][pTX]) {
                const pX = pTX * TILE_SIZE + (TILE_SIZE-10)/2;
                const pY = pTY * TILE_SIZE + (TILE_SIZE-10)/2;
                return new Poop(pX, pY, pTX, pTY);
            }
        }
        return null;
    }
}

class Enemy extends Character {
    constructor(x, y, speed, images, mobType) {
        super(x, y, speed);
        this.state='CHASING';
        this.stateTimer=0;
        this.targetPoop=null;
        this.path=[];
        this.images = images;
        this.mobType = mobType;
        this.facingDirection = 'down';
        
        // 새로운 상태들
        this.frozen = false;
        this.frozenUntil = 0;
        this.stunned = false;
        this.stunnedUntil = 0;
        this.originalSpeed = speed;
        
        // 적 타입별 특성 설정
        this.setupEnemyType();
    }
    
    setupEnemyType() {
        switch(this.mobType) {
            case 'mob1': // 기본 플런저 - 균형잡힌 타입
                this.maxHealth = 1;
                this.currentHealth = 1;
                this.specialAbility = 'none';
                this.color = '#ff6b6b';
                break;
            case 'mob2': // 빠른 플런저 - 속도가 빠르지만 약함
                this.maxHealth = 1;
                this.currentHealth = 1;
                this.speed *= 1.3;
                this.specialAbility = 'speed_boost';
                this.color = '#4ecdc4';
                break;
            case 'mob3': // 강한 플런저 - 느리지만 강함
                this.maxHealth = 2;
                this.currentHealth = 2;
                this.speed *= 0.8;
                this.specialAbility = 'tank';
                this.color = '#ffe66d';
                break;
            case 'mob4': // 텔레포트 플런저 (새로운 타입)
                this.maxHealth = 1;
                this.currentHealth = 1;
                this.specialAbility = 'teleport';
                this.teleportCooldown = 0;
                this.color = '#a8e6cf';
                break;
            case 'mob5': // 분열 플런저 (새로운 타입)
                this.maxHealth = 1;
                this.currentHealth = 1;
                this.specialAbility = 'split';
                this.hasSplit = false;
                this.color = '#ff8b94';
                break;
        }
    }
    update(poops,player,allEnemies, deltaTime){
        const now = Date.now();
        
        // 상태 이상 체크
        if (this.frozen && now < this.frozenUntil) {
            return; // 얼어있으면 움직이지 않음
        } else if (this.frozen) {
            this.frozen = false;
        }
        
        if (this.stunned && now < this.stunnedUntil) {
            return; // 기절했으면 움직이지 않음
        } else if (this.stunned) {
            this.stunned = false;
        }
        
        if(this.state==='EATING'){
            this.stateTimer -= deltaTime;
            if(this.stateTimer <= 0) {
                this.state='CHASING';
            }
            return;
        }
        if(this.state==='CHASING'){
            // 목표 똥이 사라졌는지 확인
            if(this.targetPoop && !poops.includes(this.targetPoop)) {
                this.targetPoop = null;
                this.path = [];
            }
            
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
                
                // 방향 업데이트
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) this.facingDirection = 'right';
                    else if (dx < 0) this.facingDirection = 'left';
                } else {
                    if (dy > 0) this.facingDirection = 'down';
                    else if (dy < 0) this.facingDirection = 'up';
                }
                
                if(Math.abs(dx)>0)this.x+=Math.sign(dx)*this.speed * deltaTime;
                if(this.isWall(this.x,this.y)||this.isWall(this.x+this.width,this.y)||this.isWall(this.x,this.y+this.height)||this.isWall(this.x+this.width,this.y+this.height)){
                    this.x=oX;
                    this.path=[];
                }
                if(Math.abs(dy)>0)this.y+=Math.sign(dy)*this.speed * deltaTime;
                if(this.isWall(this.x,this.y)||this.isWall(this.x+this.width,this.y)||this.isWall(this.x,this.y+this.height)||this.isWall(this.x+this.width,this.y+this.height)){
                    this.y=oY;
                    this.path=[];
                }
                // 목표 지점에 충분히 가까우면 다음 경로로 이동
                if(this.path && this.path.length > 0) {
                    const distanceToTarget = Math.sqrt((tX-this.x)**2 + (tY-this.y)**2);
                    if(distanceToTarget < TILE_SIZE * 0.3) { // 타일 크기의 30% 이내면 도달로 간주
                        this.path.shift();
                    }
                }
            }
        }
    }
    draw(ctx){
        // console.log('Enemy draw called', this.images, this.mobType, this.facingDirection); // 디버그 로그 추가
        // 이미지가 로드되었는지 확인
        if (this.images && this.mobType) {
            // console.log('Enemy images and mobType available'); // 디버그 로그 추가
            // mobType과 facingDirection에 따라 적절한 이미지 선택
            let img;
            if (this.images[this.mobType]) {
                // console.log('Enemy mobType images found'); // 디버그 로그 추가
                switch (this.facingDirection) {
                    case 'up':
                        img = this.images[this.mobType].up;
                        break;
                    case 'down':
                        img = this.images[this.mobType].down;
                        break;
                    case 'left':
                        img = this.images[this.mobType].left;
                        break;
                    case 'right':
                        img = this.images[this.mobType].right;
                        break;
                    default:
                        img = this.images[this.mobType].down; // 기본 이미지
                }
            }
            // console.log('Selected enemy image:', img); // 디버그 로그 추가
            
            // 이미지 그리기
            if (img) {
                // console.log('Drawing enemy image'); // 디버그 로그 추가
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            } else {
                // console.log('Enemy image not found for direction, drawing default shape'); // 디버그 로그 추가
                // 이미지가 없을 경우 기존 사각형 그리기
                ctx.fillStyle='#A0522D';
                ctx.fillRect(this.x+this.width*.4,this.y,this.width*.2,this.height*.7);
                ctx.fillStyle='red';
                ctx.fillRect(this.x,this.y+this.height*.7,this.width,this.height*.3);
            }
        } else {
            // console.log('Enemy images or mobType not loaded, drawing default shape'); // 디버그 로그 추가
            // 이미지가 로드되지 않았을 경우 기존 사각형 그리기
            ctx.fillStyle='#A0522D';
            ctx.fillRect(this.x+this.width*.4,this.y,this.width*.2,this.height*.7);
            ctx.fillStyle='red';
            ctx.fillRect(this.x,this.y+this.height*.7,this.width,this.height*.3);
        }
    }
    findPath(end){const sN={x:Math.floor(this.x/TILE_SIZE),y:Math.floor(this.y/TILE_SIZE)},eN={x:Math.floor(end.x/TILE_SIZE),y:Math.floor(end.y/TILE_SIZE)};if(MAP[eN.y]===undefined||MAP[eN.y][eN.x]===1)return null;const q=[[sN]],v=new Set([`${sN.y},${sN.x}`]);while(q.length>0){const p=q.shift(),n=p[p.length-1];if(n.x===eN.x&&n.y===eN.y)return p;const N=[[0,-1],[0,1],[-1,0],[1,0]];for(const[dx,dy]of N){const next={x:n.x+dx,y:n.y+dy};if(next.x>=0&&next.x<MAP_COLS&&next.y>=0&&next.y<MAP_ROWS&&MAP[next.y][next.x]===0&&!v.has(`${next.y},${next.x}`)){
            v.add(`${next.y},${next.x}`);
            q.push([...p,next]);
        }}}
        return null;
    }
    onPoopEaten(){
        this.path=[];
        this.targetPoop=null;
        this.state='EATING';
        this.stateTimer=0.5; // 0.5초 동안 먹기 상태
    }
}

// Game 클래스에 initBGM 메서드 추가
Game.prototype.initBGM = function() {
    if (this.bgmNormal) {
        this.bgmNormal.playbackRate = BGM_INITIAL_RATE;
        this.bgmNormal.currentTime = 0;
        this.bgmNormal.pause();
    }
    if (this.bgmFast) {
        this.bgmFast.playbackRate = BGM_INITIAL_RATE;
        this.bgmFast.currentTime = 0;
        this.bgmFast.pause(); // 시작 시에는 fast BGM은 멈춰있음
    }
};

// Game 클래스에 handleStartOverlayClick 메서드 추가
Game.prototype.handleStartOverlayClick = function() {
    console.log('handleStartOverlayClick called, gameState:', this.gameState);
    if (this.gameState === 'PRE_GAME_OVERLAY') {
        console.log('Processing start screen click/touch');
        
        // BGM 초기화 및 재생
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
        if (this.bgmNormal) {
            this.bgmNormal.play().catch(e => console.log("BGM play error:", e));
        }
        
        // 모바일이면 바로 모바일 모드로, 아니면 선택 화면
        console.log('isMobile:', this.isMobile);
        if (this.isMobile) {
            console.log('Starting mobile mode');
            this.controlMode = 'MOBILE';
            this.startGame();
        } else {
            console.log('Going to control selection');
            this.gameState = 'CONTROL_SELECTION';
        }
    }
};

class Poop {
    constructor(x,y,tileX,tileY){ 
        this.x=x;this.y=y;this.width=10;this.height=10;this.tileX=tileX;this.tileY=tileY; 
    }
    draw(ctx){
        ctx.fillStyle='#8B4513';
        ctx.fillRect(this.x,this.y,this.width,this.height);
        // 똥 하이라이트
        ctx.fillStyle='#A0522D';
        ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, 3);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.type = type;
        this.data = POWERUPS[type];
        this.spawnTime = Date.now();
        this.bobOffset = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
    }
    
    update(deltaTime) {
        // 둥둥 떠다니는 효과
        this.bobOffset += deltaTime * 3;
        this.glowIntensity = (Math.sin(this.bobOffset * 2) + 1) * 0.5;
        
        // 10초 후 사라짐
        return Date.now() - this.spawnTime < 10000;
    }
    
    draw(ctx) {
        const bobY = this.y + Math.sin(this.bobOffset) * 3;
        
        // 글로우 효과
        ctx.save();
        ctx.shadowColor = this.data.color;
        ctx.shadowBlur = 10 + this.glowIntensity * 10;
        
        // 배경 원
        ctx.fillStyle = this.data.color + '40';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2 + 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 아이콘
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(this.data.icon, this.x + this.width/2, bobY + this.height/2);
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color, velocity, life) {
        this.x = x;
        this.y = y;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
        this.life -= deltaTime * 1000;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // 메모리 정리 메서드
    cleanup() {
        try {
            // 애니메이션 프레임 정리
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // 타이머 정리
            if (this.difficultyTimer) {
                clearInterval(this.difficultyTimer);
                this.difficultyTimer = null;
            }
            
            // 오디오 정리
            if (this.bgmNormal) {
                this.bgmNormal.pause();
                this.bgmNormal.currentTime = 0;
            }
            if (this.bgmFast) {
                this.bgmFast.pause();
                this.bgmFast.currentTime = 0;
            }
            
            // 이벤트 리스너 정리
            window.removeEventListener('resize', this.resizeCanvas);
            window.removeEventListener('orientationchange', this.resizeCanvas);
            
            // 배열 정리
            this.poops = [];
            this.enemies = [];
            this.powerups = [];
            this.activePowerups = [];
            this.particles = [];
            this.activeSkills = [];
            
            console.log('게임 리소스 정리 완료');
        } catch (error) {
            console.error('정리 중 오류 발생:', error);
        }
    }
    
    // 안전한 게임 재시작
    safeRestart() {
        try {
            this.cleanup();
            setTimeout(() => {
                this.init();
            }, 100); // 약간의 지연으로 안정성 확보
        } catch (error) {
            console.error('게임 재시작 중 오류:', error);
            // 페이지 새로고침으로 완전 초기화
            window.location.reload();
        }
    }
}

// 전역 오류 처리
window.addEventListener('error', (event) => {
    console.error('전역 오류 발생:', event.error);
    // 게임이 실행 중이면 안전하게 정리
    if (window.gameInstance) {
        window.gameInstance.cleanup();
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.gameInstance) {
        window.gameInstance.cleanup();
    }
});
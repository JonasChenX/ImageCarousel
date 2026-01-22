// DOM Elements Cache
const els = {
    // Will be populated by initDOM
    welcomeScreen: null,
    appContainer: null,
    btnOpenDir: null,
    mainImage: null,
    libSelect: null,
    thumbStrip: null,
    progressInfo: null,
    btnPrev: null,
    btnNext: null,
    btnPlay: null,
    speedSelect: null,
    buttonTogglePanel: null,
    btnFullscreen: null,
    fitModeBtn: null,
    btnToggleThumbs: null,
    leftZone: null,
    rightZone: null
};

/**
 * 初始化 DOM 元素快取
 * 取得 HTML 中的所有關鍵元素並存入 els 物件中，以便後續頻繁存取
 */
function initDOM() {
    els.welcomeScreen = document.getElementById('welcome-screen');
    els.appContainer = document.getElementById('app-container');
    els.btnOpenDir = document.getElementById('btn-open-dir');
    els.mainImage = document.getElementById('main-image');
    els.libSelect = document.getElementById('lib-select');
    els.thumbStrip = document.getElementById('thumbnail-strip');
    els.progressInfo = document.getElementById('progress-info');
    els.btnPrev = document.getElementById('btn-prev');
    els.btnNext = document.getElementById('btn-next');
    els.btnPlay = document.getElementById('btn-play');
    els.speedSelect = document.getElementById('speed-select');
    els.buttonTogglePanel = document.getElementById('btn-toggle-panel');
    els.btnFullscreen = document.getElementById('btn-fullscreen');
    els.fitModeBtn = document.getElementById('btn-fit-mode');
    els.btnToggleThumbs = document.getElementById('btn-toggle-thumbs');
    
    // Navigation zones (might not exist if HTML structure changes, but assumed present)
    els.leftZone = document.getElementById('left-zone');
    els.rightZone = document.getElementById('right-zone');
}
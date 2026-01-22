/**
 * DOM 元素管理
 * 快取所有 DOM 元素引用，避免重複查詢提升效能
 */

const els = {
    welcomeScreen: null,
    appContainer: null,
    btnOpenDir: null,
    mainImage: null,
    thumbStrip: null,
    progressInfo: null,
    progressFill: null,
    btnPrev: null,
    btnNext: null,
    btnPlay: null,
    speedSelect: null,
    buttonTogglePanel: null,
    btnFullscreen: null,
    fitModeBtn: null,
    btnToggleThumbs: null,
    leftZone: null,
    rightZone: null,
    galleryView: null,
    galleryGrid: null,
    btnBack: null
};

/**
 * 初始化 DOM 元素快取
 */
function initDOM() {
    els.welcomeScreen = document.getElementById('welcome-screen');
    els.appContainer = document.getElementById('app-container');
    els.galleryView = document.getElementById('gallery-view');
    els.galleryGrid = document.getElementById('gallery-grid');

    els.btnOpenDir = document.getElementById('btn-open-dir');
    els.mainImage = document.getElementById('main-image');
    els.btnBack = document.getElementById('btn-back');
    els.thumbStrip = document.getElementById('thumbnail-strip');
    els.progressInfo = document.getElementById('progress-info');
    els.progressFill = document.getElementById('progress-fill');
    els.btnPrev = document.getElementById('btn-prev');
    els.btnNext = document.getElementById('btn-next');
    els.btnPlay = document.getElementById('btn-play');
    els.speedSelect = document.getElementById('speed-select');
    els.buttonTogglePanel = document.getElementById('btn-toggle-panel');
    els.btnFullscreen = document.getElementById('btn-fullscreen');
    els.fitModeBtn = document.getElementById('btn-fit-mode');
    els.btnToggleThumbs = document.getElementById('btn-toggle-thumbs');
    
    els.leftZone = document.getElementById('left-zone');
    els.rightZone = document.getElementById('right-zone');
}
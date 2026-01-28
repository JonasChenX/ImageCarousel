/**
 * 控制器邏輯
 * 處理使用者互動與狀態變更，包含圖片導航、播放控制、顯示模式切換等
 */

/**
 * 導航至上一張或下一張圖片
 * @param {number} direction - 1 為下一張，-1 為上一張
 */
function navigate(direction) {
    let newIndex = state.currentIndex + direction;

    if (newIndex >= state.imageList.length) {
        if (state.settings.loopMode) newIndex = 0;
        else {
            stopAutoPlay();
            return;
        }
    } else if (newIndex < 0) {
        if (state.settings.loopMode) newIndex = state.imageList.length - 1;
        else return;
    }

    state.currentIndex = newIndex;
    renderImage();
}

/**
 * 切換自動播放/暫停狀態
 */
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
        els.btnPlay.textContent = 'Pause';
        startTimer();
    } else {
        els.btnPlay.textContent = 'Play';
        stopAutoPlay();
    }
}

/**
 * 啟動計時器，開始自動輪播
 */
function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
        navigate(1);
    }, state.settings.autoPlayInterval * 1000);
}

/**
 * 停止自動輪播並清除計時器
 */
function stopAutoPlay() {
    state.isPlaying = false;
    els.btnPlay.textContent = 'Play';
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
}

/**
 * 更新自動輪播的速度
 * @param {number|string} seconds
 */
function updateSpeed(seconds) {
    state.settings.autoPlayInterval = parseInt(seconds);
    saveSettingsLocal();
    if (state.isPlaying) {
        startTimer(); // Reset timer with new speed
    }
}

function toggleFitMode() {
    const currentMode = state.settings.displayMode;
    const modes = ['fit', 'fill', 'original'];
    
    // Find next mode
    const idx = modes.indexOf(currentMode);
    const nextMode = modes[(idx + 1) % modes.length];
/**
 * 切換全螢幕模式
 * 使用瀏覽器的 Fullscreen API
 */
    
    // Apply mode
    applyDisplayMode(nextMode);
    
    // Save setting
    state.settings.displayMode = nextMode;
    saveSettingsLocal();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        els.appContainer.requestFullscreen().catch(err => {
            console.warn(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        els.appContainer.classList.add('fullscreen-mode');
    } else {
        els.appContainer.classList.remove('fullscreen-mode');
    }
});

/**
 * 切換縮圖顯示狀態
 */
function toggleThumbs() {
    state.settings.showThumbnails = !state.settings.showThumbnails;
    applyThumbVisibility(state.settings.showThumbnails);
    saveSettingsLocal();
}

/**
 * 返回圖庫首頁
 */
function backToGallery() {
    stopAutoPlay();
    
    // 如果處於全螢幕狀態，先退出全螢幕
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    
    showView('gallery');
}
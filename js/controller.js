// Controller Logic (State Manipulation)

/**
 * 導航至上一張或下一張圖片
 * 處理邊界檢查 (第一張與最後一張) 與循環播放模式 (Loop Mode) 的邏輯
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
/**
 * 啟動計時器，開始自動輪播
 */
    }
}

function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
        navigate(1);
/**
 * 停止自動輪播並清除計時器
 */
    }, state.settings.autoPlayInterval * 1000);
}

function stopAutoPlay() {
/**
 * 更新自動輪播的速度 (秒數)
 * 若正在播放中，會自動重設計時器
 * @param {number|string} seconds 
 */
    state.isPlaying = false;
    els.btnPlay.textContent = 'Play';
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
}

/**
 * 循環切換顯示模式
 * 順序: fit (完整顯示) -> fill (填滿) -> original (1:1 原始大小)
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
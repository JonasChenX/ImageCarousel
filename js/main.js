// Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize DOM References
    initDOM();

    // 2. Load Settings
    loadSettingsLocal();
    // Update local settings to UI
    if (els.speedSelect) els.speedSelect.value = state.settings.autoPlayInterval;
    updateSpeedOptions();

    // 3. Bind Events
    els.btnOpenDir.addEventListener('click', handleOpenDirectory);
    els.libSelect.addEventListener('change', (e) => loadLibrary(e.target.value));
    
    // Navigation
    els.btnPrev.addEventListener('click', () => navigate(-1));
    els.btnNext.addEventListener('click', () => navigate(1));
    els.btnPlay.addEventListener('click', togglePlay);
    
    // Settings
    els.speedSelect.addEventListener('change', (e) => updateSpeed(e.target.value));
    if (els.fitModeBtn) els.fitModeBtn.addEventListener('click', toggleFitMode);
    if (els.buttonTogglePanel) els.buttonTogglePanel.addEventListener('click', togglePanel);
    if (els.btnFullscreen) els.btnFullscreen.addEventListener('click', toggleFullscreen);
    if (els.btnToggleThumbs) els.btnToggleThumbs.addEventListener('click', toggleThumbs);

    // Initial UI State
    if (state.settings.showThumbnails !== undefined) {
        applyThumbVisibility(state.settings.showThumbnails);
    }

    // Keyboard
    document.addEventListener('keydown', handleKeydown);
    
    // Navigation zones
    if(els.leftZone) els.leftZone.addEventListener('click', () => navigate(-1));
    if(els.rightZone) els.rightZone.addEventListener('click', () => navigate(1));

    // 4. Check Saved Session
    checkSavedSession();
});

/**
 * 處理鍵盤快捷鍵事件
 * ArrowRight/Left: 翻頁, Space: 播放/暫停, Escape: 退出全螢幕
 */
function handleKeydown(e) {
    if (els.appContainer.style.display === 'none') return;

    switch(e.key) {
        case 'ArrowRight': navigate(1); break;
        case 'ArrowLeft': navigate(-1); break;
        case ' ': togglePlay(); break;
        case 'Escape': 
            if(document.fullscreenElement) document.exitFullscreen();
            break;
    }
}
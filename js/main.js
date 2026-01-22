/**
 * 應用程式入口
 * 初始化 DOM、載入設定、綁定事件監聽器
 */

document.addEventListener('DOMContentLoaded', () => {
    initDOM();

    loadSettingsLocal();
    if (els.speedSelect) els.speedSelect.value = state.settings.autoPlayInterval;
    updateSpeedOptions();

    els.btnOpenDir.addEventListener('click', handleOpenDirectory);
    if(els.btnBack) els.btnBack.addEventListener('click', backToGallery);
    
    els.btnPrev.addEventListener('click', () => navigate(-1));
    els.btnNext.addEventListener('click', () => navigate(1));
    els.btnPlay.addEventListener('click', togglePlay);
    
    els.speedSelect.addEventListener('change', (e) => updateSpeed(e.target.value));
    if (els.fitModeBtn) els.fitModeBtn.addEventListener('click', toggleFitMode);
    if (els.buttonTogglePanel) els.buttonTogglePanel.addEventListener('click', togglePanel);
    if (els.btnFullscreen) els.btnFullscreen.addEventListener('click', toggleFullscreen);
    if (els.btnToggleThumbs) els.btnToggleThumbs.addEventListener('click', toggleThumbs);

    if (state.settings.showThumbnails !== undefined) {
        applyThumbVisibility(state.settings.showThumbnails);
    }

    document.addEventListener('keydown', handleKeydown);
    
    if(els.leftZone) els.leftZone.addEventListener('click', () => navigate(-1));
    if(els.rightZone) els.rightZone.addEventListener('click', () => navigate(1));

    checkSavedSession();
});

/**
 * 處理鍵盤快捷鍵
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
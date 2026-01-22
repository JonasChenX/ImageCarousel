/**
 * 視圖渲染邏輯
 * 負責所有 UI 的渲染與更新，包含圖片顯示、縮圖列表、圖庫網格等
 */

/**
 * 渲染主要圖片
 */
async function renderImage() {
    if (state.imageList.length === 0) return;

    applyDisplayMode(state.settings.displayMode);

    const fileHandle = state.imageList[state.currentIndex];
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);

    if (state.currentImageBlobUrl) {
       URL.revokeObjectURL(state.currentImageBlobUrl);
    }
    state.currentImageBlobUrl = url;

    els.mainImage.src = url;
    
    updateUI();
}

/**
 * 更新 UI 狀態
 */
function updateUI() {
    els.progressInfo.textContent = `${state.currentIndex + 1} / ${state.imageList.length}`;
    
    if (els.progressFill && state.imageList.length > 0) {
        const percentage = ((state.currentIndex + 1) / state.imageList.length) * 100;
        els.progressFill.style.width = `${percentage}%`;
    }
    
    const isLast = state.currentIndex === state.imageList.length - 1;
    const isFirst = state.currentIndex === 0;
    
    if (isLast && !state.settings.loopMode) {
        if(els.rightZone) els.rightZone.style.display = 'none';
        els.btnNext.disabled = true;
        els.btnNext.style.opacity = '0.3';
    } else {
        if(els.rightZone) els.rightZone.style.display = 'flex';
        els.btnNext.disabled = false;
        els.btnNext.style.opacity = '1';
    }
    
    if (isFirst && !state.settings.loopMode) {
        if(els.leftZone) els.leftZone.style.display = 'none';
        els.btnPrev.disabled = true;
        els.btnPrev.style.opacity = '0.3';
    } else {
        if(els.leftZone) els.leftZone.style.display = 'flex';
        els.btnPrev.disabled = false;
        els.btnPrev.style.opacity = '1';
    }

    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach((t, idx) => {
        if(idx === state.currentIndex) t.classList.add('active');
        else t.classList.remove('active');
        
        if(idx === state.currentIndex) {
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

/**
 * 更新播放速度選項
 */
function updateSpeedOptions() {
    els.speedSelect.innerHTML = '';
    state.settings.autoPlayIntervalOptions.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt;
        el.textContent = opt + 's';
        if (opt === state.settings.autoPlayInterval) el.selected = true;
        els.speedSelect.appendChild(el);
    });
}

/**
 * 渲染縮圖列表
 */
async function renderThumbnails() {
    els.thumbStrip.innerHTML = '';
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const idx = parseInt(img.dataset.index);
                loadThumbnailImage(img, idx);
                obs.unobserve(img);
            }
        });
    }, {
        root: els.thumbStrip,
        rootMargin: '200px', 
        threshold: 0.1
    });

    for (let i = 0; i < state.imageList.length; i++) {
        const img = document.createElement('img');
        img.className = 'thumb-item';
        img.dataset.index = i;
        img.decoding = 'async'; 
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'; 
        
        img.onclick = () => {
            state.currentIndex = i;
            renderImage();
            stopAutoPlay();
        };
        els.thumbStrip.appendChild(img);
        
        observer.observe(img);
    }
}

/**
 * 讀取並產生單張縮圖
 * @param {HTMLImageElement} imgElement
 * @param {number} index
 */
async function loadThumbnailImage(imgElement, index) {
    if (!state.imageList[index]) return;
    try {
        const handle = state.imageList[index];
        const file = await handle.getFile();

        if (window.createImageBitmap) {
            try {
                const bitmap = await createImageBitmap(file, { 
                    resizeHeight: 160,
                    resizeQuality: 'medium' 
                });

                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, 0);
                
                canvas.toBlob((blob) => {
                    const thumbUrl = URL.createObjectURL(blob);
                    imgElement.src = thumbUrl;
                    bitmap.close();
                }, 'image/jpeg', 0.7);
                
                return;
            } catch (err) {
                console.warn('Thumbnail generation failed, falling back to full load', err);
            }
        }

        const url = URL.createObjectURL(file);
        imgElement.src = url;
    } catch (err) {
        console.error('Error loading thumb', err);
    }
}

/**
 * 套用圖片顯示模式
 * @param {string} mode - 'fit', 'fill', 'original'
 */
function applyDisplayMode(mode) {
    const img = els.mainImage;
    if (!img) return;

    img.style.width = '';
    img.style.height = '';
    img.style.objectFit = '';
    
    switch(mode) {
        case 'fit':
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            if(els.fitModeBtn) els.fitModeBtn.textContent = '⛶ Fit';
            break;
        case 'fill':
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            if(els.fitModeBtn) els.fitModeBtn.textContent = '⚶ Fill';
            break;
        case 'original':
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.objectFit = 'none';
            if(els.fitModeBtn) els.fitModeBtn.textContent = '⚶ 1:1';
            break;
    }
}

/**
 * 切換下方控制面板的收合/展開狀態
 */
function togglePanel() {
    els.appContainer.classList.toggle('panel-collapsed');
}

/**
 * 應用縮圖顯示/隱藏狀態
 * @param {boolean} visible
 */
function applyThumbVisibility(visible) {
    if(!els.thumbStrip || !els.btnToggleThumbs) return;
    
    if (visible) {
        els.thumbStrip.style.display = 'flex';
        els.btnToggleThumbs.textContent = '不顯示縮圖';
    } else {
        els.thumbStrip.style.display = 'none';
        els.btnToggleThumbs.textContent = '顯示縮圖';
    }
}

/**
 * 切換頁面視圖
 * @param {string} viewName - 'welcome', 'gallery', 'carousel'
 */
function showView(viewName) {
    if(els.welcomeScreen) els.welcomeScreen.style.display = 'none';
    if(els.appContainer) els.appContainer.style.display = 'none';
    if(els.galleryView) els.galleryView.style.display = 'none';

    switch(viewName) {
        case 'welcome':
            els.welcomeScreen.style.display = 'flex';
            break;
        case 'gallery':
            els.galleryView.style.display = 'block';
            break;
        case 'carousel':
            els.appContainer.style.display = 'flex';
            break;
    }
}

/**
 * 渲染圖庫頁面
 */
async function renderGallery() {
    if(!els.galleryGrid) return;
    els.galleryGrid.innerHTML = '';

    state.libraries.forEach(async (lib) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.onclick = () => loadLibrary(lib.name);

        const coverImg = document.createElement('img');
        coverImg.className = 'album-cover';
        coverImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        
        const info = document.createElement('div');
        info.className = 'album-info';
        
        const title = document.createElement('div');
        title.className = 'album-title';
        title.textContent = lib.name;
        
        info.appendChild(title);
        card.appendChild(coverImg);
        card.appendChild(info);
        els.galleryGrid.appendChild(card);

        const coverBlob = await getLibraryCover(lib.handle);
        if(coverBlob) {
             if (window.createImageBitmap) {
                try {
                    const bitmap = await createImageBitmap(coverBlob, { 
                        resizeHeight: 300,
                        resizeQuality: 'medium' 
                    });
                     const canvas = document.createElement('canvas');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(bitmap, 0, 0);
                    canvas.toBlob(blob => {
                        coverImg.src = URL.createObjectURL(blob);
                        bitmap.close();
                    }, 'image/jpeg', 0.7);
                } catch(e) {
                     coverImg.src = URL.createObjectURL(coverBlob);
                }
             } else {
                 coverImg.src = URL.createObjectURL(coverBlob);
             }
        }
    });
}

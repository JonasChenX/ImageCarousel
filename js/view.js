// View Logic (Updating DOM)

/**
 * 渲染主要圖片
 * 讀取目前索引 (currentIndex) 的檔案，建立 Blob URL 並顯示
 * 自動釋放舊的 Blob URL 以釋放記憶體
 */
async function renderImage() {
    if (state.imageList.length === 0) return;

    // Ensure display mode is applied 
    applyDisplayMode(state.settings.displayMode);

    const fileHandle = state.imageList[state.currentIndex];
    const file = await fileHandle.getFile();
    const url = URL.createObjectURL(file);

    // Clean up old url object to avoid memory leaks
    if (state.currentImageBlobUrl) {
       URL.revokeObjectURL(state.currentImageBlobUrl);
    }
    state.currentImageBlobUrl = url;

    els.mainImage.src = url;
    
    updateUI();
}

/**
 * 更新 UI 狀態
 * 包含：頁碼顯示、導航箭頭可見性、縮圖高亮、下拉選單同步
 */
function updateUI() {
    els.progressInfo.textContent = `${state.currentIndex + 1} / ${state.imageList.length}`;
    els.libSelect.value = state.currentLibraryName;
    
    const isLast = state.currentIndex === state.imageList.length - 1;
    const isFirst = state.currentIndex === 0;
    
    // Hide right zone if last image and loop mode is OFF
    if (isLast && !state.settings.loopMode) {
        if(els.rightZone) els.rightZone.style.display = 'none';
        els.btnNext.disabled = true; // Optional: disable button
        els.btnNext.style.opacity = '0.3';
    } else {
        if(els.rightZone) els.rightZone.style.display = 'flex';
        els.btnNext.disabled = false;
        els.btnNext.style.opacity = '1';
    }
    
    // Hide left zone if first image and loop mode is OFF
    if (isFirst && !state.settings.loopMode) {
        if(els.leftZone) els.leftZone.style.display = 'none';
        els.btnPrev.disabled = true;
        els.btnPrev.style.opacity = '0.3';
    } else {
        if(els.leftZone) els.leftZone.style.display = 'flex';
        els.btnPrev.disabled = false;
        els.btnPrev.style.opacity = '1';
    }

    // Highlight thumbnail
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach((t, idx) => {
        if(idx === state.currentIndex) t.classList.add('active');
        else t.classList.remove('active');
        
        // Scroll thumbnail into view
        if(idx === state.currentIndex) {
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
/**
 * 更新圖庫下拉選單的選項
 */
        }
    });
}

function updateLiBrarySelect() {
    els.libSelect.innerHTML = '';
    state.libraries.forEach(lib => {
        const option = document.createElement('option');
        option.value = lib.name;
        option.textContent = lib.name;
        els.libSelect.appendChild(option);
/**
 * 更新播放速度的選擇清單
 */
    });
}

function updateSpeedOptions() {
    els.speedSelect.innerHTML = '';
    state.settings.autoPlayIntervalOptions.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt;
        el.textContent = opt + 's';
        if (opt === state.settings.autoPlayInterval) el.selected = true;
        els.speedSelect.appendChild(el);
/**
 * 渲染縮圖列表
 * 建立 img 元素佔位符，並使用 IntersectionObserver 實作懶加載 (Lazy Loading)
 * 只有當縮圖捲動到視窗內時，才會真正進行解碼與讀取
 */
    });
}

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
/**
 * 讀取並產生單張縮圖
 * 為了效能，優先使用 createImageBitmap 產生低解析度版本
 * 避免同時解碼大量高解析度圖片導致 UI 卡頓
 * @param {HTMLImageElement} imgElement - 目標圖片元素
 * @param {number} index - 圖片在 imageList 的索引
 */
            stopAutoPlay(); 
        };
        els.thumbStrip.appendChild(img);
        
        observer.observe(img);
    }
}

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
/**
 * 套用圖片顯示模式
 * @param {string} mode - 'fit' (完整顯示), 'fill' (填滿裁切), 'original' (原始大小)
 */
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
/**
 * 切換下方控制面板的收合/展開狀態
 */
            if(els.fitModeBtn) els.fitModeBtn.textContent = '⛶ Fill';
            break;
        case 'original':
            img.style.width = 'auto'; 
            img.style.height = 'auto';
            img.style.objectFit = 'none'; 
            if(els.fitModeBtn) els.fitModeBtn.textContent = '⛶ 1:1';
            break;
    }
}

function togglePanel() {
    els.appContainer.classList.toggle('panel-collapsed');
}

/**
 * 應用縮圖列表的顯示/隱藏狀態
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

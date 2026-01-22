/**
 * 檔案系統存取
 * 使用 File System Access API 讀取本地資料夾與圖片檔案
 */

/**
 * 處理「開啟資料夾」按鈕點擊事件
 */
async function handleOpenDirectory() {
    try {
        const handle = await window.showDirectoryPicker({
            mode: 'read'
        });
        
        await saveDirectoryHandle(handle);
        await processDirectoryHandle(handle);

    } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error accessing folder:', err);
    }
}

/**
 * 處理資料夾並掃描圖庫
 * @param {FileSystemDirectoryHandle} handle
 */
async function processDirectoryHandle(handle) {
    state.rootHandle = handle;
    await scanForLibraries(handle);
    
    if (state.libraries.length > 0) {
        showView('gallery');
        renderGallery();
    } else {
        alert('此資料夾內找不到子資料夾，請確認您的目錄結構。');
    }
}

/**
 * 掃描根目錄下的子資料夾作為圖庫
 * @param {FileSystemDirectoryHandle} rootHandle
 */
async function scanForLibraries(rootHandle) {
    state.libraries = [];
    
    for await (const entry of rootHandle.values()) {
        if (entry.kind === 'directory') {
            state.libraries.push({
                name: entry.name,
                handle: entry
            });
        }
    }
    state.libraries.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
}

/**
 * 載入特定的圖庫並讀取圖片
 * @param {string} libName - 圖庫名稱
 * @param {boolean} silent - 若為 true 則不顯示錯誤訊息
 */
async function loadLibrary(libName, silent = false) {
    stopAutoPlay();
    state.currentLibraryName = libName;
    const libData = state.libraries.find(l => l.name === libName);
    if (!libData) return;

    state.currentLibraryHandle = libData.handle;
    state.imageList = [];
    state.currentIndex = 0;

    for await (const entry of state.currentLibraryHandle.values()) {
        if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop().toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                state.imageList.push(entry);
            }
        }
    }

    state.imageList.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));

    if (state.imageList.length > 0) {
        renderImage();
        renderThumbnails();
        showView('carousel');
    } else {
        if (!silent) alert('此圖庫中沒有圖片。');
        els.mainImage.src = '';
    }
}

/**
 * 取得圖庫的第一張圖片作為封面
 * @param {FileSystemDirectoryHandle} libHandle
 * @returns {Promise<Blob|null>}
 */
async function getLibraryCover(libHandle) {
    const images = [];
    
    for await (const entry of libHandle.values()) {
        if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop().toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                images.push(entry);
            }
        }
    }
    
    if (images.length > 0) {
        images.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
        try {
            const file = await images[0].getFile();
            return file;
        } catch(e) { console.warn('Read cover failed', e); }
    }
    
    return null;
}

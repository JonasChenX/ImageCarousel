// File System Access Logic

/**
 * 處理「開啟資料夾」按鈕點擊事件
 * 呼叫瀏覽器 API 請求資料夾讀取權限
 */
async function handleOpenDirectory() {
    try {
        const handle = await window.showDirectoryPicker({
            mode: 'read'
        });
        
        await saveDirectoryHandle(handle);
        await processDirectoryHandle(handle);

    } catch (err) {
        // Ignore if user cancelled
        if (err.name === 'AbortError') return;
        console.error('Error accessing folder:', err);
    }
}

/**
 * 處理取得的資料夾 Handle
 * 進行初始化掃描、建立圖庫列表、並嘗試載入第一個圖庫
 * @param {FileSystemDirectoryHandle} handle 
 */
async function processDirectoryHandle(handle) {
    state.rootHandle = handle;
    await scanForLibraries(handle);
    
    if (state.libraries.length > 0) {
        // Populate Library Select
        updateLiBrarySelect();

        // Check first library for images (silent mode)
        await loadLibrary(state.libraries[0].name, true);

        if (state.imageList.length > 0) {
            // Switch to App View only if images exist
            els.welcomeScreen.style.display = 'none';
            els.appContainer.style.display = 'flex';
        } else {
            alert('此資料夾 (或第一個子資料夾) 內沒有找到圖片，請重新選擇。');
        }
/**
 * 掃描根目錄下的第一層子資料夾
 * 將其視為不同的「圖庫 (Libraries)」
 * @param {FileSystemDirectoryHandle} rootHandle 
 */
    } else {
        alert('此資料夾內找不到子資料夾，請確認您的目錄結構。');
    }
}

async function scanForLibraries(rootHandle) {
    state.libraries = [];
    
    for await (const entry of rootHandle.values()) {
        if (entry.kind === 'directory') {
            state.libraries.push({
                name: entry.name,
                handle: entry
/**
 * 載入特定的圖庫 (子資料夾)
 * 讀取該資料夾下的所有圖片檔案，並進行排序
 * @param {string} libName - 圖庫名稱 (資料夾名)
 * @param {boolean} silent - 若為 true，則找不到圖片時不跳出 alert (用於初始化檢查)
 */
            });
        }
    }
}

async function loadLibrary(libName, silent = false) {
    stopAutoPlay();
    state.currentLibraryName = libName;
    const libData = state.libraries.find(l => l.name === libName);
    if (!libData) return;

    state.currentLibraryHandle = libData.handle;
    state.imageList = [];
    state.currentIndex = 0;

    // Scan for images in this folder
    for await (const entry of state.currentLibraryHandle.values()) {
        if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop().toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                state.imageList.push(entry);
            }
        }
    }

    // Sort by name
    state.imageList.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));

    if (state.imageList.length > 0) {
        renderImage();
        renderThumbnails();
    } else {
        if (!silent) alert('此圖庫中沒有圖片。');
        els.mainImage.src = '';
    }
}
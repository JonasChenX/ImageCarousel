// IndexedDB & Local Storage

/**
 * 開啟 IndexedDB 資料庫
 * 用於儲存資料夾的存取權杖 (FileSystemHandle)
 * @returns {Promise<IDBDatabase>} 資料庫實例
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
    });
}

/**
 * 儲存資料夾 Handle 到 IndexedDB
 * @param {FileSystemDirectoryHandle} handle - 資料夾 Handle
 */
async function saveDirectoryHandle(handle) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
/**
 * 從 IndexedDB 取得上次儲存的資料夾 Handle
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
        tx.objectStore(STORE_NAME).put(handle, 'root');
    } catch (e) { console.warn('Failed to save handle', e); }
}

async function getDirectoryHandle() {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('root');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
/**
 * 從 LocalStorage 讀取使用者設定 (速度、顯示模式)
 * 並覆蓋到全域 state.settings
 */
        });
    } catch(e) { return null; }
}

function loadSettingsLocal() {
    const saved = localStorage.getItem('imageCarouselSettings');
    if(saved) {
        try {
            Object.assign(state.settings, JSON.parse(saved));
            // Update UI inputs if DOM is ready (though this is typically called before)
        } catch(e) {
            console.warn('Failed to parse settings');
/**
 * 將目前的使用者設定存入 LocalStorage
 */
        }
    }
/**
 * 檢查是否有上次瀏覽紀錄
 * 若有，則在歡迎畫面動態產生「快速載入」按鈕
 */
}

function saveSettingsLocal() {
    localStorage.setItem('imageCarouselSettings', JSON.stringify(state.settings));
}

// Check saved session logic
async function checkSavedSession() {
    const handle = await getDirectoryHandle();
    if (handle) {
        // Create Quick Load Button
        const btnQuick = document.createElement('button');
        btnQuick.className = 'btn-large';
        btnQuick.style.backgroundColor = '#27ae60'; // Green
        btnQuick.style.marginBottom = '1rem';
        btnQuick.innerHTML = `快速載入上次的資料夾 <br><span style="font-size:0.8em; opacity:0.8">(${handle.name})</span>`;
        
        btnQuick.onclick = async () => {
             // Verify permission
             const opts = { mode: 'read' };
             if ((await handle.queryPermission(opts)) === 'granted') {
                 processDirectoryHandle(handle);
                 return;
             }
             const perm = await handle.requestPermission(opts);
             if (perm === 'granted') {
                 processDirectoryHandle(handle);
             }
        };

        const container = els.welcomeScreen;
        const orgBtn = els.btnOpenDir;
        container.insertBefore(btnQuick, orgBtn);
        
        // Add some visual separation
        const sep = document.createElement('p');
        sep.textContent = '- 或 -';
        sep.style.margin = '10px 0';
        container.insertBefore(sep, orgBtn);
    }
}
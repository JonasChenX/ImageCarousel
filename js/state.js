/**
 * 全域狀態管理
 * 儲存應用程式的執行狀態、使用者設定、目前圖庫資訊等
 */

const state = {
    settings: {
        autoPlayInterval: 3,
        autoPlayIntervalOptions: [1, 3, 5, 10],
        displayMode: 'fit',
        showThumbnails: true
    },
    rootHandle: null,
    currentLibraryName: '',
    currentLibraryHandle: null,
    imageList: [],
    currentIndex: 0,
    isPlaying: false,
    timerId: null,
    libraries: [],
    currentImageBlobUrl: null
};

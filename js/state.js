// Global State
const state = {
    settings: {
        autoPlayInterval: 3,
        autoPlayIntervalOptions: [1, 3, 5, 10],
        displayMode: 'fit', // fit, fill, original
        showThumbnails: true
    },
    rootHandle: null,
    currentLibraryName: '',
    currentLibraryHandle: null,
    imageList: [], // Array of file handles
    currentIndex: 0,
    isPlaying: false,
    timerId: null,
    libraries: [], // List of sub-folders found in root
    currentImageBlobUrl: null 
};
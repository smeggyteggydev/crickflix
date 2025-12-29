/**
 * CrickFlix - Premium IPTV Web App
 * Mobile-first live streaming with hls.js (no CORS proxy needed!)
 */

// ===== DOM ELEMENTS =====
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    mobileToggle: document.getElementById('mobileToggle'),
    searchInput: document.getElementById('searchInput'),
    categoryTabs: document.getElementById('categoryTabs'),
    channelList: document.getElementById('channelList'),
    videoPlayer: document.getElementById('videoPlayer'),
    videoWrapper: document.getElementById('videoWrapper'),
    videoPlaceholder: document.getElementById('videoPlaceholder'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorOverlay: document.getElementById('errorOverlay'),
    errorText: document.getElementById('errorText'),
    retryBtn: document.getElementById('retryBtn'),
    nowPlayingIndicator: document.getElementById('nowPlayingIndicator'),
    nowPlayingText: document.getElementById('nowPlayingText'),
    pipBtn: document.getElementById('pipBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn')
};

// ===== STATE =====
let allChannels = [];
let filteredChannels = [];
let currentChannel = null;
let currentCategory = 'all';
let hls = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// ===== CATEGORY MAPPING =====
const categoryKeywords = {
    sports: ['sport', 'espn', 'fox sport', 'sky sport', 'bein', 'dazn', 'supersport', 'eurosport', 'ten sport', 'star sport', 'sony ten', 'ptv sport', 'geo super', 'a sport', 't-sport', 'dd sport', 'willow', 'astro', 'football', 'soccer', 'nba', 'nfl', 'tennis', 'golf', 'racing', 'boxing', 'wwe', 'ufc', 'matchroom'],
    cricket: ['cricket', 'willow', 'ptv sport', 'geo super', 'a sport', 'ten cricket', 'star sport', 'sony ten', 't-sport', 'astro cricket', 'supersport cricket'],
    entertainment: ['ary', 'geo', 'hum', 'star', 'colors', 'zee', 'sony', 'entertainment', 'drama', 'filmax', 'filmazia', 'urdu 1', 'express', 'a plus', 'tv one', 'see', 'atv', 'lahore', 'venus', 'play tv'],
    news: ['news', 'geo news', 'ary news', 'express news', 'samaa', 'dunya', 'bol news', 'hum news', '92 news', '24 news', 'dawn', 'aaj', 'capital', 'neo', 'ptv news', 'gnn', 'public news', 'city 42', 'metro one'],
    kids: ['kid', 'cartoon', 'nick', 'disney', 'pogo', 'hungama', 'chutti', 'sonic', 'discovery kid', 'motu patlu', 'shiva', 'doraemon', 'chhota bheem', 'tom', 'jerry', 'peppa', 'cocomelon', 'baby'],
    movies: ['movie', 'cinema', 'film', 'hbo', 'showtime', 'starz', 'cinebox', 'hollywood', 'bollywood', 'action', 'comedy', 'horror', 'thriller'],
    religious: ['islamic', 'qtv', 'quran', 'madni', 'peace tv', 'hadi', 'imam', 'al-quran', 'makkah', 'madina', 'noor', 'takbeer', 'hidayat', 'naat', 'karbala', 'paigham']
};

// ===== CHANNEL ICONS =====
const categoryIcons = {
    sports: '⚽',
    cricket: '🏏',
    entertainment: '🎬',
    news: '📰',
    kids: '🧸',
    movies: '🎥',
    religious: '🕌',
    default: '📺'
};

// ===== INIT =====
async function init() {
    console.log('🚀 CrickFlix initializing...');
    
    setupEventListeners();
    await loadChannels();
    
    console.log('✅ CrickFlix ready!');
}

// ===== M3U PARSER =====
async function loadChannels() {
    try {
        showChannelLoading();
        
        const response = await fetch('sports_channels.m3u');
        if (!response.ok) throw new Error('Failed to load playlist');
        
        const text = await response.text();
        allChannels = parseM3U(text);
        
        console.log(`📺 Loaded ${allChannels.length} channels`);
        
        filteredChannels = [...allChannels];
        renderChannels();
        
    } catch (error) {
        console.error('❌ Error loading channels:', error);
        showChannelError(error.message);
    }
}

function parseM3U(data) {
    const lines = data.split('\n');
    const channels = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF')) {
            // Extract channel name
            const nameMatch = line.split(',');
            const name = nameMatch[1]?.trim() || 'Unknown Channel';
            
            // Extract group-title
            const groupMatch = line.match(/group-title="([^"]+)"/);
            const group = groupMatch?.[1] || 'Live';
            
            // Get URL from next line
            const url = lines[i + 1]?.trim();
            
            // Skip invalid entries
            if (!url || !url.startsWith('http')) continue;
            if (name.includes('Welcome') || name.includes('---')) continue;
            
            // Determine category
            const category = getChannelCategory(name);
            
            channels.push({
                id: channels.length,
                name,
                group,
                url,
                category,
                icon: categoryIcons[category] || categoryIcons.default
            });
        }
    }
    
    return channels;
}

function getChannelCategory(name) {
    const lowerName = name.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerName.includes(keyword))) {
            return category;
        }
    }
    
    return 'entertainment'; // default category
}

// ===== RENDER CHANNELS =====
function renderChannels() {
    const container = elements.channelList;
    
    if (filteredChannels.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-text">No channels found</p>
            </div>
        `;
        return;
    }
    
    // Limit display for performance
    const displayChannels = filteredChannels.slice(0, 200);
    
    container.innerHTML = `
        <div class="channel-count">${filteredChannels.length} channels ${filteredChannels.length > 200 ? '(showing first 200)' : ''}</div>
        ${displayChannels.map(channel => `
            <div class="channel-card ${currentChannel?.id === channel.id ? 'active' : ''}" 
                 data-id="${channel.id}" 
                 onclick="playChannel(${channel.id})">
                <div class="channel-icon">${channel.icon}</div>
                <div class="channel-info">
                    <div class="channel-group">${channel.group}</div>
                    <div class="channel-name">${channel.name}</div>
                </div>
                <div class="channel-live"></div>
            </div>
        `).join('')}
    `;
}

function showChannelLoading() {
    elements.channelList.innerHTML = `
        <div class="empty-state">
            <div class="spinner"></div>
            <p class="empty-state-text">Loading channels...</p>
        </div>
    `;
}

function showChannelError(message) {
    elements.channelList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <p class="empty-state-text">${message}</p>
        </div>
    `;
}

// ===== VIDEO PLAYER =====
function playChannel(channelId) {
    const channel = allChannels.find(c => c.id === channelId);
    if (!channel) return;
    
    currentChannel = channel;
    retryCount = 0;
    
    // Update UI
    updateActiveChannel();
    updateNowPlaying(channel.name);
    showLoading();
    hideError();
    hidePlaceholder();
    
    // Close sidebar on mobile
    closeSidebar();
    
    // Play the stream
    loadStream(channel.url);
}

function loadStream(url) {
    console.log('🎬 Loading stream:', url);
    
    // Destroy existing HLS instance
    if (hls) {
        hls.destroy();
        hls = null;
    }
    
    const video = elements.videoPlayer;
    
    if (Hls.isSupported()) {
        hls = new Hls({
            // Optimized settings for live sports
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.5,
            highBufferWatchdogPeriod: 2,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 5,
            maxFragLookUpTolerance: 0.25,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            liveDurationInfinity: true,
            // Auto quality
            capLevelToPlayerSize: true,
            startLevel: -1, // Auto
            // Error recovery
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 4,
            levelLoadingTimeOut: 15000,
            levelLoadingMaxRetry: 4
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        
        // Events
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ Manifest parsed, starting playback');
            hideLoading();
            video.play().catch(e => console.warn('Autoplay blocked:', e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ HLS Error:', data.type, data.details);
            
            if (data.fatal) {
                handleFatalError(data);
            }
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level];
            if (level) {
                console.log(`📊 Quality: ${level.height}p @ ${Math.round(level.bitrate / 1000)}kbps`);
            }
        });
        
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            hideLoading();
            video.play().catch(e => console.warn('Autoplay blocked:', e));
        });
        video.addEventListener('error', () => {
            handleFatalError({ type: 'native', details: 'Playback error' });
        });
    } else {
        showError('HLS playback not supported in this browser');
    }
}

function handleFatalError(data) {
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`🔄 Retry attempt ${retryCount}/${MAX_RETRIES}`);
        
        setTimeout(() => {
            if (hls) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    loadStream(currentChannel.url);
                }
            }
        }, 2000);
    } else {
        hideLoading();
        showError('Stream unavailable. The channel might be offline.');
    }
}

// ===== UI HELPERS =====
function updateActiveChannel() {
    document.querySelectorAll('.channel-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.id) === currentChannel?.id);
    });
}

function updateNowPlaying(name) {
    elements.nowPlayingText.textContent = name;
    elements.nowPlayingIndicator.classList.add('live');
}

function showLoading() {
    elements.loadingOverlay.classList.add('visible');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('visible');
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorOverlay.classList.add('visible');
}

function hideError() {
    elements.errorOverlay.classList.remove('visible');
}

function hidePlaceholder() {
    elements.videoPlaceholder.style.display = 'none';
    elements.videoPlayer.style.display = 'block';
}

// ===== SIDEBAR =====
function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.sidebarOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('visible');
    document.body.style.overflow = '';
}

function toggleSidebar() {
    if (elements.sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// ===== SEARCH & FILTER =====
function filterChannels() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    filteredChannels = allChannels.filter(channel => {
        const matchesSearch = !searchTerm || 
            channel.name.toLowerCase().includes(searchTerm) ||
            channel.group.toLowerCase().includes(searchTerm);
        
        const matchesCategory = currentCategory === 'all' || 
            channel.category === currentCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderChannels();
}

function setCategory(category) {
    currentCategory = category;
    
    // Update tab UI
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    filterChannels();
}

// ===== PICTURE IN PICTURE =====
async function togglePiP() {
    const video = elements.videoPlayer;
    
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
        }
    } catch (error) {
        console.warn('PiP not available:', error);
    }
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
    const wrapper = elements.videoWrapper;
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        wrapper.requestFullscreen?.() || 
        wrapper.webkitRequestFullscreen?.() ||
        wrapper.msRequestFullscreen?.();
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Mobile toggle
    elements.mobileToggle.addEventListener('click', toggleSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Search
    elements.searchInput.addEventListener('input', () => {
        clearTimeout(elements.searchInput.debounceTimer);
        elements.searchInput.debounceTimer = setTimeout(filterChannels, 150);
    });
    
    // Category tabs
    elements.categoryTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-tab')) {
            setCategory(e.target.dataset.category);
        }
    });
    
    // Retry button
    elements.retryBtn.addEventListener('click', () => {
        if (currentChannel) {
            retryCount = 0;
            hideError();
            showLoading();
            loadStream(currentChannel.url);
        }
    });
    
    // Player controls
    elements.pipBtn.addEventListener('click', togglePiP);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Video events
    elements.videoPlayer.addEventListener('waiting', showLoading);
    elements.videoPlayer.addEventListener('playing', hideLoading);
    elements.videoPlayer.addEventListener('canplay', hideLoading);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.key) {
            case 'f':
                toggleFullscreen();
                break;
            case 'p':
                togglePiP();
                break;
            case 'Escape':
                closeSidebar();
                break;
            case '/':
                e.preventDefault();
                elements.searchInput.focus();
                break;
        }
    });
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Require horizontal swipe with minimal vertical movement
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
            if (deltaX > 0 && touchStartX < 30) {
                // Swipe right from left edge
                openSidebar();
            } else if (deltaX < 0 && elements.sidebar.classList.contains('open')) {
                // Swipe left when sidebar is open
                closeSidebar();
            }
        }
    }, { passive: true });
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);

// Make playChannel available globally for onclick handlers
window.playChannel = playChannel;

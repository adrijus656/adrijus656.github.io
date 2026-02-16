// --- CONFIG ---
const startTime = Date.now();
const widget = SC.Widget(document.getElementById('sc-widget'));
let isPlaying = false;
let widgetReady = false;

// --- BOOT SYSTEM ---
function bootSystem() {
    const screen = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    const video = document.getElementById('bg-video');

    screen.style.opacity = '0';
    setTimeout(() => { screen.style.display = 'none'; }, 800);

    interface.classList.add('active');
    if(video) video.style.opacity = '1';
    
    // Play Music
    if(widgetReady) {
        widget.play();
        widget.setVolume(50);
    } else {
        widget.bind(SC.Widget.Events.READY, () => {
            widget.play();
            widget.setVolume(50);
        });
    }

    setTimeout(() => document.querySelector('.hero').classList.add('loaded'), 100);
    setTimeout(() => document.querySelector('.player-widget').classList.add('show'), 800);
    setTimeout(() => document.querySelector('.dock-container').classList.add('show'), 1000);
    setTimeout(() => document.querySelector('.stats').classList.add('show'), 1200);

    setInterval(updateUptime, 1000);
}

// --- MUSIC LOGIC ---
widget.bind(SC.Widget.Events.READY, () => {
    widgetReady = true;
    widget.getCurrentSound(sound => {
        if(sound) document.getElementById('track-name').innerText = sound.title;
    });
});

widget.bind(SC.Widget.Events.PLAY, () => {
    isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.getElementById('track-name').style.color = "var(--accent)";
    widget.getCurrentSound(sound => {
        if(sound) document.getElementById('track-name').innerText = sound.title;
    });
});

widget.bind(SC.Widget.Events.PAUSE, () => {
    isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('track-name').style.color = "#94a3b8";
});

function togglePlay() { if(widgetReady) widget.toggle(); }
function nextSong() { if(widgetReady) widget.next(); }
function prevSong() { if(widgetReady) widget.prev(); }

// --- ACTIONS ---
function copyDiscord() {
    navigator.clipboard.writeText('adra6');
    showToast('fa-brands fa-discord', 'Copied: adra6');
}

function showToast(icon, msg) {
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// --- TERMINAL ---
function toggleTerminal() {
    const term = document.getElementById('terminal');
    term.classList.toggle('open');
    if(term.classList.contains('open')) setTimeout(() => document.getElementById('term-input').focus(), 100);
}

document.getElementById('term-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = e.target.value.trim().toLowerCase();
        const output = document.getElementById('term-output');
        output.innerHTML += `<div><span style="color:var(--accent)">➜</span> ${e.target.value}</div>`;
        
        if(input === 'help') output.innerHTML += `<div style="color:#666">COMMANDS: help, clear, date, whoami</div>`;
        else if(input === 'clear') output.innerHTML = '';
        else if(input === 'date') output.innerHTML += `<div>${new Date().toLocaleString()}</div>`;
        else if(input === 'whoami') output.innerHTML += `<div>root@adraa</div>`;
        else if(input !== '') output.innerHTML += `<div style="color:#ef4444">Command not found</div>`;

        e.target.value = '';
        output.scrollTop = output.scrollHeight;
    }
});

function updateUptime() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
}

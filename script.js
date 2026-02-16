// --- SYSTEM CONFIG ---
const SYSTEM = {
    startTime: Date.now(),
    widget: SC.Widget(document.getElementById('sc-widget')),
    isPlaying: false,
    widgetReady: false
};

// --- BOOT ---
function bootSystem() {
    const entry = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    
    // Fade out entry
    entry.style.opacity = '0';
    setTimeout(() => { entry.style.display = 'none'; }, 800);
    
    // Fade in UI
    interface.classList.add('active');
    
    // Attempt Play
    if(SYSTEM.widgetReady) {
        SYSTEM.widget.play();
        SYSTEM.widget.setVolume(50);
    } else {
        SYSTEM.widget.bind(SC.Widget.Events.READY, () => {
            SYSTEM.widget.play();
            SYSTEM.widget.setVolume(50);
        });
    }

    setInterval(updateUptime, 1000);
    updateVisualizer();
}

// --- AUDIO EVENTS ---
SYSTEM.widget.bind(SC.Widget.Events.READY, () => {
    SYSTEM.widgetReady = true;
    SYSTEM.widget.getCurrentSound(sound => {
        if(sound) document.getElementById('track-name').innerText = sound.title;
    });
});

SYSTEM.widget.bind(SC.Widget.Events.PLAY, () => {
    SYSTEM.isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.getElementById('track-name').style.color = "var(--accent)";
});

SYSTEM.widget.bind(SC.Widget.Events.PAUSE, () => {
    SYSTEM.isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('track-name').style.color = "#fff";
});

function togglePlay() { SYSTEM.widget.toggle(); }
function nextSong() { SYSTEM.widget.next(); }
function prevSong() { SYSTEM.widget.prev(); }

// --- VISUALIZER SIMULATION ---
function updateVisualizer() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        if(SYSTEM.isPlaying) {
            const h = Math.floor(Math.random() * 20) + 5;
            bar.style.height = `${h}px`;
        } else {
            bar.style.height = '3px';
        }
    });
    requestAnimationFrame(() => setTimeout(updateVisualizer, 100));
}

// --- UTILS ---
function updateUptime() {
    const diff = Math.floor((Date.now() - SYSTEM.startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
}

function copyDiscord() {
    navigator.clipboard.writeText('adra6');
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = 'COPIED: adra6';
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- TERMINAL ---
function toggleTerminal() {
    const term = document.getElementById('terminal');
    term.classList.toggle('open');
    if(term.classList.contains('open')) setTimeout(() => document.getElementById('term-input').focus(), 100);
}

document.getElementById('term-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = e.target.value.trim().toLowerCase();
        const out = document.getElementById('term-output');
        
        out.innerHTML += `<div><span class="accent">➜</span> ${e.target.value}</div>`;
        
        if(val === 'help') out.innerHTML += `<div style="color:#777">CMDS: HELP, CLEAR, DATE, WHOAMI</div>`;
        else if(val === 'clear') out.innerHTML = '';
        else if(val === 'date') out.innerHTML += `<div>${new Date().toLocaleString()}</div>`;
        else if(val === 'whoami') out.innerHTML += `<div>root@adraa</div>`;
        else if(val !== '') out.innerHTML += `<div style="color:#ef4444">ERR: CMD NOT FOUND</div>`;

        e.target.value = '';
        out.scrollTop = out.scrollHeight;
    }
});

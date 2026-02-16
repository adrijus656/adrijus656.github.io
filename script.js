// --- CONFIG ---
const startTime = Date.now();
// The widget ID must match the iframe ID in HTML
const widget = SC.Widget(document.getElementById('sc-widget'));
let isPlaying = false;

// --- BOOT SEQUENCE ---
function bootSystem() {
    const screen = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    const video = document.getElementById('bg-video');

    // 1. Fade out entry
    screen.style.opacity = '0';
    setTimeout(() => screen.style.display = 'none', 1000);

    // 2. Start Interface
    interface.classList.add('active');
    
    // Attempt to play video
    if(video) {
        video.style.opacity = '1';
        video.play().catch(e => console.log("Video autoplay blocked by browser"));
    }
    
    // 3. Trigger CSS Animations sequentially
    setTimeout(() => document.querySelector('.hero').classList.add('loaded'), 100);
    setTimeout(() => document.querySelector('.player-widget').classList.add('show'), 800);
    setTimeout(() => document.querySelector('.dock-container').classList.add('show'), 1000);
    setTimeout(() => document.querySelector('.stats').classList.add('show'), 1200);

    // 4. Send Welcome Notifications
    setTimeout(() => sendToast('fa-solid fa-check', 'SYSTEM INITIALIZED'), 1500);
    setTimeout(() => sendToast('fa-brands fa-discord', 'CONNECTED TO DISCORD'), 2500);

    // 5. Init Logic
    initVisualizer();
    setInterval(updateUptime, 1000);
}

// --- NOTIFICATIONS ---
function sendToast(icon, msg) {
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i> <span class="toast-msg">${msg}</span>`;
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// --- MUSIC PLAYER ---
function togglePlay() { widget.toggle(); }
function nextSong() { widget.next(); }
function prevSong() { widget.prev(); }

// Event Listeners for Soundcloud
widget.bind(SC.Widget.Events.PLAY, () => {
    isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.getElementById('track-name').style.color = "var(--accent)";
    sendToast('fa-solid fa-music', 'NOW PLAYING');
});

widget.bind(SC.Widget.Events.PAUSE, () => {
    isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('track-name').style.color = "#94a3b8";
});

widget.bind(SC.Widget.Events.READY, () => {
    widget.getCurrentSound(sound => {
        if(sound) document.getElementById('track-name').innerText = sound.title;
    });
});

// --- VISUALIZER ANIMATION ---
function initVisualizer() {
    const viz = document.getElementById('visualizer');
    viz.innerHTML = '';
    // Create bars
    for(let i=0; i<20; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        viz.appendChild(bar);
    }
    
    // Animate loop
    function animate() {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            // If playing, random height. If paused, almost flat.
            const h = isPlaying ? Math.random() * 100 : 10;
            bar.style.height = `${Math.max(3, h)}%`;
        });
        requestAnimationFrame(() => setTimeout(animate, 100));
    }
    animate();
}

// --- TERMINAL ---
function toggleTerminal() {
    const term = document.getElementById('terminal');
    term.classList.toggle('open');
    if(term.classList.contains('open')) {
        document.getElementById('term-input').focus();
    }
}

// Terminal Commands
document.getElementById('term-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = e.target.value.trim().toLowerCase();
        const output = document.getElementById('term-output');
        
        // Echo the command
        output.innerHTML += `<div><span style="color:var(--accent)">➜</span> ${e.target.value}</div>`;
        
        // Command Logic
        if(input === 'help') {
            output.innerHTML += `<div style="color:#666">COMMANDS: help, clear, ping, socials, date, whoami</div>`;
        } else if(input === 'clear') {
            output.innerHTML = '';
        } else if(input === 'date') {
            output.innerHTML += `<div>${new Date().toLocaleString()}</div>`;
        } else if(input === 'socials') {
            output.innerHTML += `<div>Discord: adra6 | Steam: Linked</div>`;
        } else if(input === 'whoami') {
            output.innerHTML += `<div>root@adraa</div>`;
        } else if(input !== '') {
            output.innerHTML += `<div style="color:#ef4444">Command not found</div>`;
        }

        e.target.value = '';
        output.scrollTop = output.scrollHeight;
    }
});

// --- UTILS ---
function updateUptime() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
}

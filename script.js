// --- SYSTEM CONFIG ---
const startTime = Date.now();
// IMPORTANT: The ID inside document.getElementById must match the iframe ID in HTML
const widget = SC.Widget(document.getElementById('sc-widget'));
let isPlaying = false;

// --- BOOT SYSTEM (Called when you click the entry screen) ---
function bootSystem() {
    const screen = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    const video = document.getElementById('bg-video');

    // 1. Hide Entry Screen (Fade out)
    screen.style.opacity = '0';
    setTimeout(() => {
        screen.style.display = 'none';
    }, 800);

    // 2. Show Main Interface
    interface.classList.add('active');
    
    // 3. Play Video Background
    if(video) {
        video.style.opacity = '1';
        video.play().catch(e => console.log("Video autoplay blocked"));
    }
    
    // 4. Play Music (This only works because the user CLICKED)
    widget.play();
    
    // 5. Trigger CSS Animations (Delays for smooth effect)
    setTimeout(() => document.querySelector('.hero').classList.add('loaded'), 100);
    setTimeout(() => document.querySelector('.player-widget').classList.add('show'), 800);
    setTimeout(() => document.querySelector('.dock-container').classList.add('show'), 1000);
    setTimeout(() => document.querySelector('.stats').classList.add('show'), 1200);

    // Start the uptime clock
    setInterval(updateUptime, 1000);
}

// --- AUDIO CONTROLS ---
function togglePlay() { widget.toggle(); }
function nextSong() { widget.next(); }
function prevSong() { widget.prev(); }

// Audio Event Listeners (Updates UI when song changes)
widget.bind(SC.Widget.Events.PLAY, () => {
    isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.getElementById('track-name').style.color = "var(--accent)";
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

// --- TERMINAL LOGIC ---
function toggleTerminal() {
    const term = document.getElementById('terminal');
    term.classList.toggle('open');
    // Auto-focus input when opened
    if(term.classList.contains('open')) {
        setTimeout(() => document.getElementById('term-input').focus(), 100);
    }
}

document.getElementById('term-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = e.target.value.trim().toLowerCase();
        const output = document.getElementById('term-output');
        
        // Echo command to screen
        output.innerHTML += `<div><span style="color:var(--accent)">➜</span> ${e.target.value}</div>`;
        
        // Command Handlers
        if(input === 'help') {
            output.innerHTML += `<div style="color:#666">COMMANDS: help, clear, ping, date, whoami</div>`;
        } else if(input === 'clear') {
            output.innerHTML = '';
        } else if(input === 'date') {
            output.innerHTML += `<div>${new Date().toLocaleString()}</div>`;
        } else if(input === 'whoami') {
            output.innerHTML += `<div>root@adraa</div>`;
        } else if(input !== '') {
            output.innerHTML += `<div style="color:#ef4444">Command not found</div>`;
        }

        e.target.value = '';
        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }
});

// --- UTILITIES ---
function updateUptime() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
}

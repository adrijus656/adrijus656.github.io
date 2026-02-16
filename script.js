// --- CONFIG ---
const startTime = Date.now();
const widget = SC.Widget(document.getElementById('sc-widget'));
let isPlaying = false;
let widgetReady = false;

// --- BOOT SYSTEM ---
function bootSystem() {
    const screen = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    
    // Fade out entry
    screen.style.opacity = '0';
    setTimeout(() => { screen.style.display = 'none'; }, 800);

    // Show interface
    interface.classList.add('active');
    
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

    // Trigger Animations
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

// --- INTERACTIVE STARFIELD ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
let speed = 2; // Normal speed
const numStars = 400; // Amount of stars
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}
window.addEventListener('resize', resize);

// Mouse interaction (Steering)
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Click interaction (Warp Speed)
document.addEventListener('mousedown', () => speed = 20);
document.addEventListener('mouseup', () => speed = 2);

function initStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * canvas.width // Depth
        });
    }
}

function drawStars() {
    // Semi-transparent black fill to create "trails" effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set Center (based on mouse)
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Parallax Factor
    const dx = (mouseX - cx) * 0.1;
    const dy = (mouseY - cy) * 0.1;

    stars.forEach(star => {
        // Move star closer
        star.z -= speed;
        
        // Reset if passed screen
        if (star.z <= 0) {
            star.z = canvas.width;
            star.x = Math.random() * canvas.width - canvas.width / 2;
            star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        // Project 3D to 2D
        const x = (star.x / star.z) * canvas.width + cx - dx;
        const y = (star.y / star.z) * canvas.height + cy - dy;
        
        // Calculate size based on depth (closer = bigger)
        const size = (1 - star.z / canvas.width) * 3;
        const opacity = (1 - star.z / canvas.width);

        if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    requestAnimationFrame(drawStars);
}

// Start
resize();
drawStars();

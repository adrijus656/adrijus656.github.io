// --- SYSTEM CONFIG ---
const SYSTEM = {
    startTime: Date.now(),
    widget: SC.Widget(document.getElementById('sc-widget')),
    isPlaying: false,
    widgetReady: false,
    userID: "906117797749346344"
};

// --- UTILS: TOAST NOTIFICATIONS ---
function showToast(icon, msg) {
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
    area.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.4s reverse forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function openLink(url, name) {
    window.open(url, '_blank');
    showToast('fa-solid fa-arrow-up-right-from-square', `OPENING ${name.toUpperCase()}...`);
}

function copyDiscord() {
    navigator.clipboard.writeText('adra6');
    showToast('fa-brands fa-discord', 'COPIED: adra6');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

// --- CONTEXT MENU ---
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
});
document.addEventListener('click', () => {
    document.getElementById('context-menu').style.display = 'none';
});

// --- CURSOR ---
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// --- LANYARD STATUS ---
async function fetchDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${SYSTEM.userID}`);
        const { data } = await res.json();
        if (data) {
            document.getElementById('discord-pfp').src = `https://cdn.discordapp.com/avatars/${SYSTEM.userID}/${data.discord_user.avatar}.png`;
            document.getElementById('discord-name').innerText = data.discord_user.username;
            document.getElementById('status-indicator').className = `status-dot ${data.discord_status}`;
            
            let statusText = data.discord_status.toUpperCase();
            if(data.activities && data.activities.length > 0) {
                statusText = data.activities[0].name.toUpperCase();
            }
            document.getElementById('discord-activity').innerText = statusText;
        }
    } catch (e) {}
}
fetchDiscord();
setInterval(fetchDiscord, 5000);

// --- BOOT ---
function bootSystem() {
    document.getElementById('entry-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('entry-screen').style.display = 'none'; }, 800);
    document.getElementById('interface').classList.add('active');
    
    if(SYSTEM.widgetReady) {
        SYSTEM.widget.play();
        SYSTEM.widget.setVolume(50);
    } else {
        SYSTEM.widget.bind(SC.Widget.Events.READY, () => {
            SYSTEM.widget.play();
            SYSTEM.widget.setVolume(50);
        });
    }
    
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
        const diff = Math.floor((Date.now() - SYSTEM.startTime) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
    }, 1000);
    
    updateVisualizer();
}

// --- AUDIO ---
SYSTEM.widget.bind(SC.Widget.Events.READY, () => {
    SYSTEM.widgetReady = true;
    SYSTEM.widget.getCurrentSound(sound => {
        if(sound) document.getElementById('track-name').innerText = sound.title;
    });
});

SYSTEM.widget.bind(SC.Widget.Events.PLAY, () => {
    SYSTEM.isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.querySelector('.visualizer').classList.add('playing');
    showToast('fa-solid fa-music', 'NOW PLAYING');
});

SYSTEM.widget.bind(SC.Widget.Events.PAUSE, () => {
    SYSTEM.isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.querySelector('.visualizer').classList.remove('playing');
});

function togglePlay() { SYSTEM.widget.toggle(); }
function nextSong() { SYSTEM.widget.next(); }
function prevSong() { SYSTEM.widget.prev(); }

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

// --- BACKGROUND ---
const canvas = document.getElementById('ash-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 150;
let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < 100) {
                const force = (100 - distance) / 100;
                this.x -= (dx / distance) * force * 2;
                this.y -= (dy / distance) * force * 2;
            }
        }
        if(this.x < 0) this.x = canvas.width;
        if(this.x > canvas.width) this.x = 0;
        if(this.y < 0) this.y = canvas.height;
        if(this.y > canvas.height) this.y = 0;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<particleCount; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateParticles();

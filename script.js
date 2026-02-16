// --- SYSTEM CONFIG ---
const SYSTEM = {
    startTime: Date.now(),
    widget: SC.Widget(document.getElementById('sc-widget')),
    isPlaying: false,
    widgetReady: false,
    userID: "906117797749346344"
};

// --- LANYARD (REAL-TIME STATUS) ---
async function fetchDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${SYSTEM.userID}`);
        const { data } = await res.json();
        
        if (data) {
            // Update Avatar
            document.getElementById('discord-pfp').src = `https://cdn.discordapp.com/avatars/${SYSTEM.userID}/${data.discord_user.avatar}.png`;
            // Update Name
            document.getElementById('discord-name').innerText = data.discord_user.username;
            // Update Status Dot
            const statusDot = document.getElementById('status-indicator');
            statusDot.className = `status-dot ${data.discord_status}`;
            // Update Activity Text
            let statusText = data.discord_status.toUpperCase();
            if(data.activities && data.activities.length > 0) {
                // If playing a game or spotify, show that instead of "Online"
                statusText = data.activities[0].name.toUpperCase();
            }
            document.getElementById('discord-activity').innerText = statusText;
        }
    } catch (e) {
        console.log("Lanyard Error");
    }
}
fetchDiscord();
setInterval(fetchDiscord, 5000);

// --- SYSTEM LOGIC ---
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

let docTitle = document.title;
window.addEventListener("blur", () => { document.title = "CONNECTION LOST..."; });
window.addEventListener("focus", () => { document.title = docTitle; });

function bootSystem() {
    const entry = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    
    entry.style.opacity = '0';
    setTimeout(() => { entry.style.display = 'none'; }, 800);
    interface.classList.add('active');
    
    if(SYSTEM.widgetReady) {
        SYSTEM.widget.play();
        SYSTEM.widget.setVolume(50);
    } else {
        SYSTEM.widget.bind(SC.Widget.Events.READY, () => {
            SYSTEM.widget.play();
            SYSTEM.widget.setVolume(50);
        });
    }

    setInterval(updateClock, 1000);
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

// --- UTILS ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
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

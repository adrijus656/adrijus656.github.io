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
    
    // Play Music
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
    document.getElementById('track-name').style.color = "#fff";
    document.querySelector('.visualizer').classList.add('playing');
});

SYSTEM.widget.bind(SC.Widget.Events.PAUSE, () => {
    SYSTEM.isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('track-name').style.color = "#888";
    document.querySelector('.visualizer').classList.remove('playing');
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

// --- INTERACTIVE ASH BACKGROUND ---
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

        // Repel from mouse
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < 100) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (100 - distance) / 100;
                const directionX = forceDirectionX * force * 2;
                const directionY = forceDirectionY * force * 2;
                this.x -= directionX;
                this.y -= directionY;
            }
        }

        // Wrap around screen
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
        else if(val !== '') out.innerHTML += `<div style="color:#777">Unknown command.</div>`;

        e.target.value = '';
        out.scrollTop = out.scrollHeight;
    }
});

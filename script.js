// --- CONFIGURATION ---
const SYSTEM = {
    startTime: Date.now(),
    widget: SC.Widget(document.getElementById('sc-widget')),
    isPlaying: false,
    widgetReady: false
};

// --- PARTICLE NETWORK BACKGROUND (THE "COOL" PART) ---
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 100; // Adjust for density
const connectionDistance = 150;
const mouseDistance = 200;

let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse Interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            const directionX = forceDirectionX * force * 0.5;
            const directionY = forceDirectionY * force * 0.5;
            this.x -= directionX; // Move away from mouse
            this.y -= directionY;
        }
    }
    draw() {
        ctx.fillStyle = '#a855f7'; // Purple dots
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Draw Connections
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < connectionDistance) {
                ctx.beginPath();
                // Fading line opacity based on distance
                let opacity = 1 - (distance / connectionDistance);
                ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.5})`; // Purple lines
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initParticles);
initParticles();
animateParticles();


// --- SYSTEM LOGIC ---

function bootSystem() {
    const entry = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    
    entry.style.opacity = '0';
    setTimeout(() => entry.style.display = 'none', 600);
    
    interface.classList.add('active');
    
    // Attempt Audio
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
    document.getElementById('track-name').style.color = "var(--accent)";
    document.querySelector('.visualizer-bars').classList.add('playing');
});

SYSTEM.widget.bind(SC.Widget.Events.PAUSE, () => {
    SYSTEM.isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('track-name').style.color = "#fff";
    document.querySelector('.visualizer-bars').classList.remove('playing');
});

function togglePlay() { SYSTEM.widget.toggle(); }
function nextSong() { SYSTEM.widget.next(); }
function prevSong() { SYSTEM.widget.prev(); }

// Fake Visualizer
function updateVisualizer() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        if(SYSTEM.isPlaying) {
            const h = Math.floor(Math.random() * 20) + 5;
            bar.style.height = `${h}px`;
        } else {
            bar.style.height = '2px';
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
    toast.innerText = 'COPIED TO CLIPBOARD';
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
        
        out.innerHTML += `<div><span style="color:var(--accent)">➜</span> ${e.target.value}</div>`;
        
        if(val === 'help') out.innerHTML += `<div style="color:#777">COMMANDS: HELP, CLEAR, DATE, WHOAMI</div>`;
        else if(val === 'clear') out.innerHTML = '';
        else if(val === 'date') out.innerHTML += `<div>${new Date().toLocaleString()}</div>`;
        else if(val === 'whoami') out.innerHTML += `<div>root@adraa</div>`;
        else if(val !== '') out.innerHTML += `<div style="color:#ef4444">Unknown command.</div>`;

        e.target.value = '';
        out.scrollTop = out.scrollHeight;
    }
});

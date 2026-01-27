const USER_ID = "906117797749346344";
let systemInitialized = false;
let startTime = Date.now();
let warpSpeed = 1.0;
let accentColor = "#a855f7"; 
let barHeights = Array(18).fill(3); 

const widgetIframe = document.getElementById('sc-widget');
const widget = SC.Widget(widgetIframe);
const playBtn = document.getElementById('playBtn');

function formatTime(ms) {
    if(!ms) return "0:00";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

// --- INITIALIZE SYSTEM ---
function initSystem() {
    if (systemInitialized) return;
    
    // Create bars
    const visContainer = document.getElementById('visualizer');
    visContainer.innerHTML = '';
    for(let i=0; i<18; i++) {
        const b = document.createElement('div');
        b.className = 'v-bar';
        visContainer.appendChild(b);
    }
    
    systemInitialized = true;
    widget.play();
    
    typeLog("adraa_OS v4.9: Systems Online.", "var(--p)");
    typeLog("Location: Vilnius, LT", "#666");
    
    setTimeout(updateTrackInfo, 1000);
}

// --- TERMINAL ---
const termField = document.getElementById('term-field');
termField.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const input = termField.value.toLowerCase().trim();
        typeLog(`> ${input}`, "#fff");
        if(input === 'help') {
            typeLog("PROTOCOLS: diag, clear, exit", "var(--p)");
        } else if(input === 'clear') {
            document.getElementById('term-logs').innerHTML = '';
        } else if(input === 'exit') {
            toggleTerminal();
        } else {
            typeLog("Command unrecognized.", "#ef4444");
        }
        termField.value = '';
    }
});

// --- AUDIO ---
widget.bind(SC.Widget.Events.PLAY, () => {
    playBtn.className = "fas fa-pause";
    updateTrackInfo();
    const progInt = setInterval(() => {
        widget.getPosition(pos => {
            widget.getDuration(dur => {
                document.getElementById('progress-bar').style.width = (pos/dur)*100 + "%";
                document.getElementById('curr-time').innerText = formatTime(pos);
                document.getElementById('total-time').innerText = formatTime(dur);
            });
        });
        widget.isPaused(p => { if(p) clearInterval(progInt); });
    }, 500);
});

widget.bind(SC.Widget.Events.PAUSE, () => { playBtn.className = "fas fa-play"; });

function toggleMusic() { if(!systemInitialized) initSystem(); widget.toggle(); }
function nextTrack() { widget.next(); setTimeout(updateTrackInfo, 500); }
function prevTrack() { widget.prev(); setTimeout(updateTrackInfo, 500); }

function updateTrackInfo() {
    widget.getCurrentSound(s => { 
        if(s) document.getElementById('track-name').innerText = s.title.toUpperCase();
    });
}

document.getElementById('vol-control').oninput = (e) => { widget.setVolume(e.target.value); };
document.getElementById('speedRange').oninput = (e) => { warpSpeed = parseFloat(e.target.value) / 10; };

// --- WEATHER ---
async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=54.6872&longitude=25.2797&current_weather=true");
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        document.getElementById('vilnius-weather').innerText = `VILNIUS: ${temp}°C`;
    } catch (e) { document.getElementById('vilnius-weather').innerText = "VILNIUS: OFFLINE"; }
}

// --- DISCORD & VISUALS ---
async function updateDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
        const { data } = await res.json();
        document.getElementById('discord-avatar').src = `https://cdn.discordapp.com/avatars/${USER_ID}/${data.discord_user.avatar}.png`;
        document.getElementById('discord-name').innerText = data.discord_user.username.toUpperCase();
        document.getElementById('status-dot').className = `status-dot ${data.discord_status}`;
        document.getElementById('discord-activity').innerText = data.listening_to_spotify ? `Spotify: ${data.spotify.song}` : "IDLE";
    } catch (e) {}
}

function animateBars() {
    requestAnimationFrame(animateBars);
    if (!systemInitialized) return;
    const bars = document.querySelectorAll('.v-bar');
    widget.isPaused(paused => {
        bars.forEach((bar, i) => {
            let target = paused ? 3 : Math.random() * 25 + 5;
            barHeights[i] += (target - barHeights[i]) * 0.15;
            bar.style.height = `${barHeights[i]}px`;
        });
    });
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let stars = Array(150).fill().map(() => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*2+0.5 }));
    function anim() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = accentColor + "44"; 
        stars.forEach(star => {
            star.y += star.s * warpSpeed;
            if (star.y > canvas.height) star.y = 0;
            ctx.beginPath(); ctx.arc(star.x, star.y, 1, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(anim);
    }
    anim();
}

function typeLog(text, color = "#999") {
    const logs = document.getElementById('term-logs');
    const p = document.createElement('p'); p.style.color = color;
    logs.appendChild(p);
    let i = 0;
    const int = setInterval(() => {
        p.innerText += text[i]; i++;
        if(i === text.length) { clearInterval(int); logs.scrollTop = logs.scrollHeight; }
    }, 10);
}

window.onload = () => {
    updateDiscord(); fetchWeather(); initStarfield(); animateBars();
    setInterval(updateDiscord, 15000);
    setInterval(fetchWeather, 900000);
    setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        document.getElementById('uptime-val').innerText = `${h}:${m}:${s}`;
    }, 1000);
};

function toggleTerminal() { 
    document.getElementById('term-modal').classList.toggle('term-hidden'); 
    if(!document.getElementById('term-modal').classList.contains('term-hidden')) setTimeout(() => termField.focus(), 100);
}
function toggleWarp() { document.getElementById('warpSystem').classList.toggle('active'); }
function copyDiscord() { navigator.clipboard.writeText("adra6"); const t = document.getElementById('copy-toast'); t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2000); }

document.addEventListener('mousemove', (e) => {
    document.querySelector('.cursor').style.left = e.clientX + 'px';
    document.querySelector('.cursor').style.top = e.clientY + 'px';
    document.querySelector('.cursor-follower').style.transform = `translate(${e.clientX-14}px, ${e.clientY-14}px)`;
});
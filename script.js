const USER_ID = "906117797749346344";
let startTime = Date.now();
const widget = SC.Widget(document.getElementById('sc-widget'));

// --- BOOT SYSTEM ---
function bootSystem() {
    const screen = document.getElementById('entry-screen');
    const interface = document.getElementById('interface');
    
    screen.style.opacity = '0';
    setTimeout(() => {
        screen.style.display = 'none';
        interface.classList.add('visible');
        
        try { widget.play(); } catch(e){}
        createVisualizer();
        initStarfield();
        fetchDiscord();
        setInterval(updateUptime, 1000);
    }, 800);
}

// --- CURSOR ---
document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('cursor');
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
});

// --- AUDIO PLAYER ---
const playIcon = document.getElementById('play-icon');
const trackName = document.getElementById('track-name');

function togglePlay() { widget.toggle(); }
function nextSong() { widget.next(); }
function prevSong() { widget.prev(); }

widget.bind(SC.Widget.Events.PLAY, () => {
    playIcon.className = "fa-solid fa-pause";
    startVisualizerAnim();
    trackName.style.color = "var(--accent)";
});

widget.bind(SC.Widget.Events.PAUSE, () => {
    playIcon.className = "fa-solid fa-play";
    stopVisualizerAnim();
    trackName.style.color = "#fff";
});

widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
    const pct = (data.currentPosition / data.duration) * 100;
    document.getElementById('progress-fill').style.width = pct + "%";
});

widget.bind(SC.Widget.Events.READY, () => {
    widget.getCurrentSound(sound => {
        if(sound) trackName.innerText = sound.title;
    });
});

document.getElementById('volume').addEventListener('input', (e) => widget.setVolume(e.target.value));

// --- VISUALIZER ---
function createVisualizer() {
    const viz = document.getElementById('visualizer');
    viz.innerHTML = '';
    for(let i=0; i<15; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.animationDelay = `${Math.random()}s`;
        viz.appendChild(bar);
    }
}
function startVisualizerAnim() {
    document.querySelectorAll('.bar').forEach(b => b.style.animationPlayState = 'running');
}
function stopVisualizerAnim() {
    document.querySelectorAll('.bar').forEach(b => {
        b.style.height = '4px';
        b.style.animationPlayState = 'paused';
    });
}

// --- TERMINAL COMMANDS ---
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');

const commands = {
    'help': "SYSTEM: socials, music, system, discord, clear, exit<br>TOOLS: ping, ip, whois, trace, nmap, brute, hash, curl, ssh<br>FUN: matrix, hack, selfdestruct, 8ball, coinflip, joke, quote, roll, ascii",
    'clear': () => termOutput.innerHTML = "",
    'exit': () => toggleTerminal(),
    'socials': "Discord: adra6 | Steam: 76561199593591499",
    'whoami': "<span style='color:#0f0'>root@adraa-mainframe</span> (UID: 0)",
    'date': () => new Date().toLocaleString(),
    'weather': "📍 VILNIUS, LT: -8°C (Snow Showers)",
    'system': "OS: AdraaOS v6.2 (Stable)<br>KERNEL: Linux 5.15-generic<br>CPU: Intel i9-13900K (3% Load)<br>RAM: 6.9GB / 64GB",
    'uptime': () => document.getElementById('uptime').innerText,
    'discord': "User: adra6<br>ID: 906117797749346344<br>Status: CONNECTED",
    'music': () => `NOW PLAYING: ${document.getElementById('track-name').innerText}`,
    'reboot': () => { setTimeout(() => location.reload(), 1000); return "System rebooting..."; },
    'ip': "LOCAL: 192.168.1.55<br>PUBLIC: 84.15.***.***",
    'ping': (t) => `Pinging ${t || 'google.com'}...<br>64 bytes: time=14ms<br>64 bytes: time=13ms`,
    'nmap': "Scanning ports...<br>22/TCP [OPEN] SSH<br>80/TCP [OPEN] HTTP<br>443/TCP [OPEN] HTTPS",
    'trace': "Tracing route...<br>1 192.168.1.1<br>2 10.20.30.1<br>3 8.8.8.8",
    'brute': "Target: AUTH_SERVER<br>[*] Cracking...<br>[!] PASSWORD FOUND: 'admin123'",
    'hash': "MD5: 8b1a9953c4611296a827abf8c47804d7",
    'whois': "Domain: ADRAA.LOL<br>Registrar: NameCheap<br>Status: ACTIVE",
    'curl': "HTTP/1.1 200 OK<br>Content-Type: text/html",
    'ssh': "Connecting to remote server... Access Denied.",
    'matrix': () => { document.body.style.fontFamily = "'Courier New', monospace"; document.body.style.color = "#0f0"; return "Wake up, Neo..."; },
    'hack': () => "Initiating hack... [||||||||||] 100% ACCESS GRANTED",
    'selfdestruct': () => { setTimeout(() => location.reload(), 2000); return "SELF DESTRUCT IN 3... 2... 1..."; },
    '8ball': () => ["Yes.", "No.", "Maybe.", "Ask again."][Math.floor(Math.random()*4)],
    'coinflip': () => Math.random() > 0.5 ? "HEADS" : "TAILS",
    'joke': "There are 10 types of people: those who understand binary, and those who don't.",
    'quote': "\"Real eyes realize real lies.\"",
    'roll': () => `You rolled a ${Math.floor(Math.random()*100)}`,
    'ascii': "  __ _  __| |_ __ __ _  __ _ <br> / _` |/ _` | '__/ _` |/ _` |<br>| (_| | (_| | | | (_| | (_| |<br> \\__,_|\\__,_|_|  \\__,_|\\__,_|",
    'sudo': "User is not in the sudoers file.",
    'ls': "Desktop Documents Downloads system32 cheats.dll",
    'cd': "Directory changed.",
    'cat': "Access Denied: Encrypted file.",
    'mkdir': "Directory created.",
    'rm': "Permission denied.",
    'ps': "PID TTY TIME CMD<br>1 ? 00:00:03 init<br>2 ? 00:00:00 kthreadd",
    'top': "Load average: 0.00, 0.01, 0.05",
    'kill': "Process terminated."
};

termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const raw = termInput.value.trim();
        const args = raw.split(' ');
        const cmd = args[0].toLowerCase();
        const param = args[1];

        printTerm(`➜ ~ ${raw}`, "#fff");
        
        if (commands[cmd]) {
            const res = typeof commands[cmd] === "function" ? commands[cmd](param) : commands[cmd];
            if(res) printTerm(res, "var(--accent)");
        } else if (raw !== "") {
            printTerm(`Command '${cmd}' not found.`, "#ef4444");
        }
        termInput.value = "";
        termOutput.scrollTop = termOutput.scrollHeight;
    }
});

function printTerm(text, color) {
    const div = document.createElement('div');
    div.className = 'line';
    div.style.color = color || "#ccc";
    div.innerHTML = text;
    termOutput.appendChild(div);
}

function toggleTerminal() {
    const term = document.getElementById('terminal');
    term.classList.toggle('closed');
    if(!term.classList.contains('closed')) setTimeout(() => termInput.focus(), 100);
}

// --- DATA FETCHING ---
async function fetchDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
        const { data } = await res.json();
        if(data) {
            // Update HUD
            document.getElementById('discord-pfp').src = `https://cdn.discordapp.com/avatars/${USER_ID}/${data.discord_user.avatar}.png`;
            document.getElementById('discord-status').className = `status-indicator ${data.discord_status}`;
            
            let act = "IDLE";
            let fullAct = "Just chilling...";
            
            if(data.listening_to_spotify) {
                act = data.spotify.song;
                fullAct = `Listening to: ${data.spotify.song}\nby ${data.spotify.artist}`;
            } else if(data.activities.length > 0) {
                act = data.activities[0].name;
                fullAct = `${data.activities[0].name}`;
                if(data.activities[0].details) fullAct += `\n${data.activities[0].details}`;
                if(data.activities[0].state) fullAct += `\n${data.activities[0].state}`;
            }
            
            document.getElementById('activity-text').innerText = act.toUpperCase();

            // Update Popup
            document.getElementById('dock-pfp').src = `https://cdn.discordapp.com/avatars/${USER_ID}/${data.discord_user.avatar}.png`;
            document.getElementById('dock-status-text').innerText = data.discord_status.toUpperCase();
            document.getElementById('dock-activity').innerText = fullAct;
        }
    } catch(e) {}
}
setInterval(fetchDiscord, 5000);

function updateUptime() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let stars = Array(100).fill().map(() => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*2 }));
    function anim() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#ffffff"; 
        stars.forEach(st => {
            st.y += st.s * 0.5;
            if (st.y > canvas.height) st.y = 0;
            ctx.beginPath(); ctx.arc(st.x, st.y, st.s/2, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(anim);
    }
    anim();
}
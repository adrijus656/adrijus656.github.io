// ══════════════════════════════════════════
//  ADRAA // ROOT  —  script.js
// ══════════════════════════════════════════

const SYS = {
    startTime: Date.now(),
    widget: SC.Widget(document.getElementById('sc-widget')),
    playing: false,
    ready: false,
    volume: 50,
    muted: false,
    shuffle: false,
    repeat: false,
    userID: '906117797749346344',
    cmdHistory: [],
    histIdx: -1,
    matrixOn: false,
    matrixRAF: null,
    matrixCtx: null,
    konami: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
    konamiIdx: 0,
    booted: false,
};

// ── TOAST ───────────────────────────────────
function showToast(icon, msg) {
    const area = document.getElementById('notification-area');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i class="' + icon + '"></i><span>' + msg + '</span>';
    area.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'toastIn .35s reverse forwards';
        setTimeout(() => t.remove(), 380);
    }, 3400);
}
function openLink(url, name) {
    window.open(url, '_blank');
    showToast('fa-solid fa-arrow-up-right-from-square', 'Opening ' + name + '...');
}
function copyDiscord() {
    navigator.clipboard.writeText('adra6');
    showToast('fa-brands fa-discord', 'Copied: adra6');
}
function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

// ── MODALS ──────────────────────────────────
function openAbout() {
    closeCtx();
    document.getElementById('about-modal').classList.add('open');
    // sync pfp + status into the discord card
    const pfp = document.getElementById('discord-pfp').src;
    const status = document.getElementById('status-indicator').className.replace('status-dot ','').trim();
    const activity = document.getElementById('discord-activity').innerText;
    document.getElementById('about-pfp').src = pfp;
    document.getElementById('about-status').className = 'dc-status ' + status;
    const dot = document.getElementById('about-activity-dot');
    dot.className = 'fa-solid fa-circle ' + status;
    document.getElementById('about-activity-text').innerText =
        activity && activity !== 'OFFLINE' ? activity : status.toUpperCase();
    setTimeout(() => {
        document.querySelectorAll('.skill-bar').forEach(b => {
            b.style.width = b.dataset.w + '%';
        });
    }, 120);
}
function closeAbout(e) {
    if (!e || e.target === document.getElementById('about-modal'))
        document.getElementById('about-modal').classList.remove('open');
}
function openShortcuts() {
    closeCtx();
    document.getElementById('shortcuts-modal').classList.add('open');
}
function closeShortcuts(e) {
    if (!e || e.target === document.getElementById('shortcuts-modal'))
        document.getElementById('shortcuts-modal').classList.remove('open');
}
function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    document.getElementById('terminal').classList.remove('open');
}

// ── CONTEXT MENU ────────────────────────────
function closeCtx() { document.getElementById('context-menu').style.display = 'none'; }
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var m = document.getElementById('context-menu');
    m.style.display = 'block';
    m.style.left = Math.min(e.clientX, innerWidth  - 220) + 'px';
    m.style.top  = Math.min(e.clientY, innerHeight - 340) + 'px';
});
document.addEventListener('click', function(e) {
    if (!e.target.closest('#context-menu')) closeCtx();
});

// ── CURSOR + RING ────────────────────────────
var cursor     = document.getElementById('cursor');
var cursorRing = document.getElementById('cursor-ring');
var mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
});

(function ringFollow() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(ringFollow);
})();

document.addEventListener('mouseover', function(e) {
    var t = e.target.closest('[onclick], input, .dock-item, .btn, .btn-side, .play-btn, .ctx-item, .about-link, .modal-close, .dot');
    cursor.classList.toggle('hovering', !!t);
    cursorRing.classList.toggle('hovering', !!t);
});

document.addEventListener('click', function(e) {
    var r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.left = e.clientX + 'px';
    r.style.top  = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(function() { r.remove(); }, 620);
});

// ── KEYBOARD SHORTCUTS ───────────────────────
document.addEventListener('keydown', function(e) {
    var expected = SYS.konami[SYS.konamiIdx];
    if (e.key === expected || e.key.toLowerCase() === expected) {
        SYS.konamiIdx++;
        if (SYS.konamiIdx === SYS.konami.length) { SYS.konamiIdx = 0; partyMode(); }
    } else { SYS.konamiIdx = 0; }

    if (document.activeElement === document.getElementById('term-input')) return;
    if (!SYS.booted) return;

    switch(e.key) {
        case '?':           openShortcuts();    break;
        case 'Escape':      closeAllModals();   break;
        case 'f': case 'F': toggleFullScreen(); break;
        case 't': case 'T': toggleTerminal();   break;
        case 'a': case 'A': openAbout();        break;
        case 'm': case 'M': toggleMute();       break;
        case ' ':
            if (!e.target.closest('input')) { e.preventDefault(); togglePlay(); }
            break;
        case 'ArrowRight':
            if (!e.target.closest('.player-widget')) nextSong();
            break;
        case 'ArrowLeft':
            if (!e.target.closest('.player-widget')) prevSong();
            break;
        case 'ArrowUp':
            if (!e.target.closest('.player-widget')) {
                e.preventDefault();
                setVolume(Math.min(100, SYS.volume + 10));
            }
            break;
        case 'ArrowDown':
            if (!e.target.closest('.player-widget')) {
                e.preventDefault();
                setVolume(Math.max(0, SYS.volume - 10));
            }
            break;
    }
});

// ── KONAMI PARTY ─────────────────────────────
function partyMode() {
    showToast('fa-solid fa-star', 'PARTY MODE');
    var emojis = ['🔥','⚡','💀','🎉','👾'];
    var orig = document.title;
    var i = 0;
    var iv = setInterval(function() { document.title = emojis[i++%emojis.length]+' ADRAA '+emojis[i%emojis.length]; }, 220);
    var bars = document.querySelectorAll('.bar');
    bars.forEach(function(b, idx) {
        b.style.background = 'hsl(' + (idx*18) + ',80%,65%)';
        b.style.boxShadow  = '0 0 8px hsl(' + (idx*18) + ',80%,65%)';
    });
    setTimeout(function() {
        clearInterval(iv);
        document.title = orig;
        bars.forEach(function(b) { b.style.background=''; b.style.boxShadow=''; });
    }, 7000);
}

// ── GLITCH ───────────────────────────────────
function triggerGlitch() {
    closeCtx();
    var title = document.querySelector('.gradient-title');
    title.classList.add('glitching');
    title.addEventListener('animationend', function() { title.classList.remove('glitching'); }, { once: true });
}

// ── DISCORD LANYARD ──────────────────────────
async function fetchDiscord() {
    try {
        var res = await fetch('https://api.lanyard.rest/v1/users/' + SYS.userID);
        var json = await res.json();
        var data = json.data;
        if (!data) return;
        document.getElementById('discord-pfp').src =
            'https://cdn.discordapp.com/avatars/' + SYS.userID + '/' + data.discord_user.avatar + '.png';
        document.getElementById('discord-name').innerText = data.discord_user.username;
        document.getElementById('status-indicator').className = 'status-dot ' + data.discord_status;
        var s = data.discord_status.toUpperCase();
        if (data.activities && data.activities.length) s = data.activities[0].name.toUpperCase();
        document.getElementById('discord-activity').innerText = s;
    } catch(e) {}
}
fetchDiscord();
setInterval(fetchDiscord, 5000);

// ── TYPEWRITER ───────────────────────────────
var phrases = ['oh? hello!', 'Experimenting, EROR!?!1011', 'music head.', 'based in vilnius.', 'root access granted.', 'Hallo!'];
var pIdx = 0, cIdx = 0, typing = true;
function typeLoop() {
    var el = document.getElementById('typewriter');
    if (!el) return;
    var word = phrases[pIdx];
    if (typing) {
        el.textContent = word.slice(0, ++cIdx);
        if (cIdx >= word.length) { typing = false; setTimeout(typeLoop, 2000); return; }
    } else {
        el.textContent = word.slice(0, --cIdx);
        if (cIdx <= 0) { typing = true; pIdx = (pIdx+1) % phrases.length; }
    }
    setTimeout(typeLoop, typing ? 80 : 40);
}

// ── BOOT ─────────────────────────────────────
function bootSystem() {
    var entry = document.getElementById('entry-screen');
    entry.style.opacity = '0';
    setTimeout(function() { entry.style.display = 'none'; }, 850);

    document.getElementById('interface').classList.add('active');
    SYS.booted = true;

    if (SYS.ready) { SYS.widget.play(); SYS.widget.setVolume(SYS.volume); }
    else SYS.widget.bind(SC.Widget.Events.READY, function() {
        SYS.widget.play(); SYS.widget.setVolume(SYS.volume);
    });

    setInterval(tickClock, 1000);
    typeLoop();
    progressLoop();
    initMatrix();
    showToast('fa-solid fa-circle-check', 'System initialized');
}

function tickClock() {
    var now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
    var s = Math.floor((Date.now() - SYS.startTime) / 1000);
    var h  = String(Math.floor(s/3600)).padStart(2,'0');
    var m  = String(Math.floor((s%3600)/60)).padStart(2,'0');
    var sc = String(s%60).padStart(2,'0');
    document.getElementById('uptime').innerText = h+':'+m+':'+sc;
}

// ── SOUNDCLOUD ───────────────────────────────
SYS.widget.bind(SC.Widget.Events.READY, function() {
    SYS.ready = true;
    SYS.widget.getCurrentSound(function(s) { if(s) setTrackName(s.title); });
});
SYS.widget.bind(SC.Widget.Events.PLAY, function() {
    SYS.playing = true;
    document.getElementById('play-icon').className = 'fa-solid fa-pause';
    document.getElementById('visualizer').classList.add('playing');
    SYS.widget.getCurrentSound(function(s) { if(s) setTrackName(s.title); });
});
SYS.widget.bind(SC.Widget.Events.PAUSE, function() {
    SYS.playing = false;
    document.getElementById('play-icon').className = 'fa-solid fa-play';
    document.getElementById('visualizer').classList.remove('playing');
});
SYS.widget.bind(SC.Widget.Events.FINISH, function() {
    if (SYS.repeat) { SYS.widget.seekTo(0); SYS.widget.play(); }
    else if (SYS.shuffle) shuffleJump();
});

function setTrackName(title) {
    var el = document.getElementById('track-name');
    el.textContent = title;
    el.classList.remove('marquee');
    requestAnimationFrame(function() {
        if (el.scrollWidth > el.parentElement.offsetWidth + 4) el.classList.add('marquee');
    });
}
function togglePlay() { SYS.widget.toggle(); }
function nextSong()   { SYS.widget.next();  showToast('fa-solid fa-forward-step', 'Next track'); }
function prevSong()   { SYS.widget.prev();  showToast('fa-solid fa-backward-step','Prev track'); }

function toggleShuffle() {
    SYS.shuffle = !SYS.shuffle;
    document.getElementById('btn-shuffle').classList.toggle('on', SYS.shuffle);
    showToast('fa-solid fa-shuffle', SYS.shuffle ? 'Shuffle on' : 'Shuffle off');
}
function toggleRepeat() {
    SYS.repeat = !SYS.repeat;
    document.getElementById('btn-repeat').classList.toggle('on', SYS.repeat);
    showToast('fa-solid fa-repeat', SYS.repeat ? 'Repeat on' : 'Repeat off');
}
function shuffleJump() {
    SYS.widget.getSounds(function(sounds) {
        var idx = Math.floor(Math.random() * sounds.length);
        SYS.widget.skip(idx);
    });
}

function setVolume(v) {
    SYS.volume = v; SYS.muted = false;
    SYS.widget.setVolume(v);
    document.getElementById('vol-slider').value = v;
    document.getElementById('vol-label').innerText = v;
    var i = document.getElementById('vol-icon');
    i.className = v === 0 ? 'fa-solid fa-volume-xmark'
                : v  < 50 ? 'fa-solid fa-volume-low'
                :            'fa-solid fa-volume-high';
}
function toggleMute() {
    SYS.muted = !SYS.muted;
    SYS.widget.setVolume(SYS.muted ? 0 : SYS.volume);
    document.getElementById('vol-icon').className =
        SYS.muted ? 'fa-solid fa-volume-xmark' : SYS.volume<50?'fa-solid fa-volume-low':'fa-solid fa-volume-high';
    showToast(SYS.muted?'fa-solid fa-volume-xmark':'fa-solid fa-volume-high', SYS.muted?'Muted':'Unmuted');
}
document.getElementById('vol-slider').addEventListener('input', function(e) { setVolume(+e.target.value); });

// ── PROGRESS BAR ─────────────────────────────
function fmtMs(ms) {
    var s = Math.floor(ms/1000);
    return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}
function progressLoop() {
    if (SYS.playing) {
        SYS.widget.getPosition(function(pos) {
            SYS.widget.getDuration(function(dur) {
                if (!dur) return;
                var pct = (pos/dur)*100;
                document.getElementById('progress-fill').style.width  = pct + '%';
                document.getElementById('progress-handle').style.left = pct + '%';
                document.getElementById('time-cur').innerText = fmtMs(pos);
                document.getElementById('time-dur').innerText = fmtMs(dur);
            });
        });
    }
    setTimeout(progressLoop, 500);
}
function seekTo(e) {
    var bar = document.getElementById('progress-bar');
    var pct = Math.max(0, Math.min(1, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
    SYS.widget.getDuration(function(dur) { SYS.widget.seekTo(pct * dur); });
}

// ── VISUALIZER — spectrum simulation ─────────
// SoundCloud widget is cross-origin so Web Audio API can't access it.
// We simulate a believable frequency spectrum: bass bands move slow+tall,
// treble bands move fast+short, with smooth lerp for natural motion.
(function() {
    var bars    = document.querySelectorAll('.visualizer .bar');
    var N       = bars.length;
    var heights = new Float32Array(N);
    var targets = new Float32Array(N);
    var t = 0;

    var params = Array.from({length: N}, function(_, i) {
        var norm = i / (N - 1);
        return {
            speed: 0.8  + norm * 3.5,
            amp:   22   - norm * 12,
            phase: Math.random() * Math.PI * 2,
            chaos: 0.4  + norm * 1.4,
        };
    });

    function tick() {
        t += 0.03;
        if (SYS.playing) {
            params.forEach(function(p, i) {
                var w1    = Math.sin(t * p.speed + p.phase) * p.amp;
                var w2    = Math.sin(t * p.speed * 1.7 + p.phase * 0.55) * p.amp * 0.38;
                var noise = (Math.random() - 0.5) * p.chaos * 3.5;
                targets[i] = Math.max(2, w1 + w2 + noise + p.amp * 0.85);
            });
        } else {
            for (var i = 0; i < N; i++) targets[i] = 3;
        }
        for (var i = 0; i < N; i++) {
            var lr = targets[i] > heights[i] ? 0.35 : 0.18;
            heights[i] += (targets[i] - heights[i]) * lr;
            bars[i].style.height = heights[i].toFixed(1) + 'px';
        }
        requestAnimationFrame(tick);
    }
    tick();
})();

// ── MATRIX RAIN ───────────────────────────────
function initMatrix() {
    var cv  = document.getElementById('matrix-canvas');
    var ctx = cv.getContext('2d');
    cv.width  = innerWidth;
    cv.height = innerHeight;
    SYS.matrixCtx = { cv: cv, ctx: ctx };
    window.addEventListener('resize', function() { cv.width = innerWidth; cv.height = innerHeight; });
}

function toggleMatrix() {
    closeCtx();
    if (!SYS.matrixCtx) return;
    var cv  = SYS.matrixCtx.cv;
    var ctx = SYS.matrixCtx.ctx;
    SYS.matrixOn = !SYS.matrixOn;
    cv.classList.toggle('active', SYS.matrixOn);

    if (SYS.matrixOn) {
        var cols  = Math.floor(cv.width / 16);
        var drops = new Array(cols).fill(0);
        var chars = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&?';
        function frame() {
            if (!SYS.matrixOn) return;
            ctx.fillStyle = 'rgba(0,0,0,0.055)';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.fillStyle = '#0f0';
            ctx.font = '14px JetBrains Mono';
            drops.forEach(function(y, i) {
                ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*16, y*16);
                if (y*16 > cv.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
            SYS.matrixRAF = requestAnimationFrame(frame);
        }
        frame();
        showToast('fa-solid fa-table-cells', 'Matrix rain: ON');
    } else {
        cancelAnimationFrame(SYS.matrixRAF);
        ctx.clearRect(0, 0, cv.width, cv.height);
        showToast('fa-solid fa-table-cells', 'Matrix rain: OFF');
    }
}

// ── TERMINAL ─────────────────────────────────
function toggleTerminal() {
    closeCtx();
    var t = document.getElementById('terminal');
    t.classList.toggle('open');
    if (t.classList.contains('open'))
        setTimeout(function() { document.getElementById('term-input').focus(); }, 80);
}

var QUOTES = [
    '"if it works, don\'t touch it." — every dev ever',
    '"first, solve the problem. then, write the code." — john johnson',
    '"code is read more than it\'s written." — unknown',
    '"it works on my machine." — classic',
    '"make it work, make it right, make it fast." — kent beck',
    '"premature optimization is the root of all evil." — knuth',
    '"programs must be written for people to read, and only incidentally for machines to execute." — abelson',
    '"talk is cheap. show me the code." — linus torvalds',
];

var CMDS = {
    help: function() { return '<span class="t-dim">────────────────────────────────────────</span>\n<span class="t-yellow">  SYSTEM</span>\n  <span class="t-bright">help</span>              show this list\n  <span class="t-bright">clear</span>             clear terminal\n  <span class="t-bright">sysinfo</span>           system info\n  <span class="t-bright">neofetch</span>          fancy system info\n  <span class="t-bright">uptime</span>            session uptime\n  <span class="t-bright">date</span>              current date & time\n  <span class="t-bright">whoami</span>            identity\n\n<span class="t-yellow">  MUSIC</span>\n  <span class="t-bright">music</span>             current track info\n  <span class="t-bright">play / pause</span>      playback control\n  <span class="t-bright">next / prev</span>       skip tracks\n  <span class="t-bright">vol [0-100]</span>       set volume\n  <span class="t-bright">mute</span>              toggle mute\n  <span class="t-bright">shuffle / repeat</span>  toggle modes\n\n<span class="t-yellow">  TOOLS</span>\n  <span class="t-bright">echo [text]</span>       print text\n  <span class="t-bright">calc [expr]</span>       calculator\n  <span class="t-bright">flip</span>              coin flip\n  <span class="t-bright">roll [n]</span>          dice roller\n  <span class="t-bright">ping</span>              latency test\n  <span class="t-bright">timer [s]</span>         countdown timer\n  <span class="t-bright">weather</span>           vilnius weather\n  <span class="t-bright">quote</span>             dev quote\n  <span class="t-bright">matrix</span>            matrix rain toggle\n  <span class="t-bright">glitch</span>            glitch the title\n\n<span class="t-yellow">  SOCIAL</span>\n  <span class="t-bright">social</span>            all links\n  <span class="t-bright">discord</span>           copy discord tag\n  <span class="t-bright">steam</span>             open steam\n  <span class="t-bright">sc</span>                open soundcloud\n<span class="t-dim">────────────────────────────────────────</span>'; },

    clear: '__clear__',

    sysinfo: function() {
        var s = Math.floor((Date.now()-SYS.startTime)/1000);
        return '<span class="t-gray">  OS       </span><span class="t-bright">AdraaOS v15.5</span>\n<span class="t-gray">  HOST     </span><span class="t-bright">root@adraa</span>\n<span class="t-gray">  SHELL    </span><span class="t-bright">adrash 2.0.1</span>\n<span class="t-gray">  LOCATION </span><span class="t-bright">Vilnius, LT</span>\n<span class="t-gray">  TEMP     </span><span class="t-bright">-8°C // overcast</span>\n<span class="t-gray">  UPTIME   </span><span class="t-bright">'+Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m '+s%60+'s</span>';
    },

    neofetch: function() {
        return '<span class="t-bright">   /\\   </span>   <span class="t-green">OS    </span> AdraaOS v15.5\n<span class="t-bright">  /  \\  </span>   <span class="t-green">HOST  </span> root@adraa\n<span class="t-bright"> / /\\ \\ </span>   <span class="t-green">SHELL </span> adrash 2.0.1\n<span class="t-bright">/_/  \\_\\</span>   <span class="t-green">CITY  </span> Vilnius, LT\n           <span class="t-green">MUSIC </span> '+document.getElementById('track-name').innerText+'\n           <span class="t-green">STATUS</span> '+(SYS.playing?'<span class="t-green">playing ♪</span>':'paused');
    },

    uptime: function() {
        var s = Math.floor((Date.now()-SYS.startTime)/1000);
        return 'session: <span class="t-bright">'+Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m '+s%60+'s</span>';
    },

    date: function() {
        return '<span class="t-bright">'+new Date().toLocaleString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</span>';
    },

    whoami: function() { return '<span class="t-bright">root</span>@<span class="t-green">adraa</span>  //  developer  //  vilnius, LT'; },

    music: function() {
        var n = document.getElementById('track-name').innerText;
        var s = SYS.playing ? '<span class="t-green">▶ playing</span>' : '<span class="t-gray">⏸ paused</span>';
        return s+'  →  <span class="t-bright">'+n+'</span>\n  vol: <span class="t-bright">'+SYS.volume+'</span>'+(SYS.muted?' <span class="t-red">[MUTED]</span>':'')+' | shuffle: <span class="t-bright">'+(SYS.shuffle?'on':'off')+'</span> | repeat: <span class="t-bright">'+(SYS.repeat?'on':'off')+'</span>';
    },

    play:    function() { SYS.widget.play();  return '<span class="t-green">▶ playing</span>'; },
    pause:   function() { SYS.widget.pause(); return '<span class="t-gray">⏸ paused</span>'; },
    next:    function() { nextSong(); return 'skipped →'; },
    prev:    function() { prevSong(); return '← went back'; },
    shuffle: function() { toggleShuffle(); return 'shuffle: <span class="t-bright">'+(SYS.shuffle?'on':'off')+'</span>'; },
    repeat:  function() { toggleRepeat();  return 'repeat: <span class="t-bright">'+(SYS.repeat?'on':'off')+'</span>'; },

    vol: function(args) {
        var v = parseInt(args[0]);
        if (isNaN(v)||v<0||v>100) return '<span class="t-red">usage: vol [0-100]</span>';
        setVolume(v);
        return 'volume: <span class="t-bright">'+v+'</span>';
    },

    mute: function() { toggleMute(); return SYS.muted?'<span class="t-red">muted</span>':'<span class="t-green">unmuted</span>'; },

    echo: function(args) { return '<span class="t-bright">'+args.join(' ')+'</span>'; },

    calc: function(args) {
        var expr = args.join('');
        if (!expr) return '<span class="t-red">usage: calc [expression]</span>';
        try {
            if (!/^[\d\s\+\-\*\/\.\(\)\^%]+$/.test(expr)) return '<span class="t-red">invalid expression</span>';
            var r = Function('"use strict"; return ('+expr+')')();
            return '<span class="t-bright">'+expr+' = '+r+'</span>';
        } catch(e) { return '<span class="t-red">invalid expression</span>'; }
    },

    flip: function() {
        return 'flipping... <span class="t-bright">'+(Math.random()>0.5?'🪙 HEADS':'🪙 TAILS')+'</span>';
    },

    roll: function(args) {
        var n = parseInt(args[0])||6;
        if (n<2||n>10000) return '<span class="t-red">pick a number 2–10000</span>';
        var r = Math.floor(Math.random()*n)+1;
        return 'rolling d'+n+'... <span class="t-bright">'+r+'</span> <span class="t-gray">/ '+n+'</span>';
    },

    ping: function() {
        var ms = Math.floor(Math.random()*14+2);
        var c  = ms<10?'t-green':ms<30?'t-yellow':'t-red';
        return 'PING adraa.root → <span class="'+c+'">'+ms+'ms</span>  ✓';
    },

    timer: function(args) {
        var sec = parseInt(args[0]);
        if (isNaN(sec)||sec<=0) return '<span class="t-red">usage: timer [seconds]</span>';
        showToast('fa-solid fa-clock', 'Timer: '+sec+'s');
        var end = Date.now()+sec*1000;
        var out = document.getElementById('term-output');
        var id  = 'tmr'+Date.now();
        out.innerHTML += '<div id="'+id+'"><span class="t-yellow">⏱ '+sec+'s</span></div>';
        var iv = setInterval(function() {
            var left = Math.max(0, Math.ceil((end-Date.now())/1000));
            var el   = document.getElementById(id);
            if (el) el.innerHTML = left>0?'<span class="t-yellow">⏱ '+left+'s remaining...</span>':'<span class="t-green">⏱ done!</span>';
            if (left<=0) { clearInterval(iv); showToast('fa-solid fa-bell','Timer done!'); }
        }, 500);
        return null;
    },

    weather: function() {
        return '<span class="t-blue">Vilnius, LT</span>  🌨  <span class="t-bright">-8°C</span>  feels like <span class="t-bright">-13°C</span>  wind 22km/h';
    },

    quote: function() {
        return '<span class="t-gray">'+QUOTES[Math.floor(Math.random()*QUOTES.length)]+'</span>';
    },

    matrix: function() { toggleMatrix(); return 'matrix rain: <span class="t-bright">'+(SYS.matrixOn?'ON':'OFF')+'</span>'; },
    glitch: function() { triggerGlitch(); return '<span class="t-green">glitch triggered</span>'; },

    social: function() {
        return '  <span class="t-blue">discord</span>    adra6\n  <span class="t-blue">steam</span>      steamcommunity.com/profiles/76561199593591499\n  <span class="t-blue">soundcloud</span> soundcloud.com/adra-adra-853007141';
    },

    discord: function() { copyDiscord(); return 'copied: <span class="t-bright">adra6</span>'; },
    steam:   function() { openLink('https://steamcommunity.com/profiles/76561199593591499/','Steam'); return 'opening steam...'; },
    sc:      function() { openLink('https://soundcloud.com/adra-adra-853007141','SoundCloud'); return 'opening soundcloud...'; },
};

var termIn = document.getElementById('term-input');
termIn.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        SYS.histIdx = Math.min(SYS.histIdx+1, SYS.cmdHistory.length-1);
        termIn.value = SYS.cmdHistory[SYS.histIdx]||'';
        return;
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        SYS.histIdx = Math.max(SYS.histIdx-1, -1);
        termIn.value = SYS.histIdx===-1?'':SYS.cmdHistory[SYS.histIdx];
        return;
    }
    if (e.key === 'Tab') {
        e.preventDefault();
        var v = termIn.value.toLowerCase();
        var match = Object.keys(CMDS).find(function(k) { return k.startsWith(v); });
        if (match) termIn.value = match;
        return;
    }
    if (e.key !== 'Enter') return;

    var raw   = termIn.value.trim();
    var parts = raw.toLowerCase().split(/\s+/);
    var cmd   = parts[0];
    var args  = parts.slice(1);
    var out   = document.getElementById('term-output');

    if (raw) { SYS.cmdHistory.unshift(raw); SYS.histIdx = -1; }

    out.innerHTML += '<div class="t-input-line"><span class="prompt-sym">➜</span> <span class="prompt-path">~</span> <span class="t-bright">'+raw+'</span></div>';

    if (!raw) { termIn.value=''; return; }

    if (CMDS[cmd]) {
        var fn = CMDS[cmd];
        var result = typeof fn === 'function' ? fn(args) : fn;
        if (result === '__clear__') {
            out.innerHTML = '';
        } else if (result !== null && result !== undefined) {
            out.innerHTML += '<div style="margin-bottom:6px;padding-left:2px;white-space:pre-wrap">'+result+'</div>';
        }
    } else {
        out.innerHTML += '<div style="margin-bottom:4px"><span class="t-red">bash:</span> <span class="t-gray">'+cmd+': not found. type </span><span class="t-bright">help</span></div>';
    }

    termIn.value = '';
    out.scrollTop = out.scrollHeight;
});

setInterval(function() {
    var c = document.getElementById('tcursor');
    if (c) c.style.opacity = c.style.opacity==='0'?'1':'0';
}, 550);

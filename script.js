const webhookUrl = "https://discord.com/api/webhooks/1465424477595631616/GAUugpZmy3QwDHEkhCG3oaHwil6Rwh5PpzJ2ictm_3GBw_SwFwBuLEV2L2RMbpJINSFn";
const canvas = document.getElementById('void-canvas');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress-line');
const quizContent = document.getElementById('quiz-content');

let mouse = { x: -1000, y: -1000, active: false };
let pointer = 0;

const questions = [
    { q: "Is your heart racing yet?", options: ["A little", "Yes"] },
    { q: "Do you believe some things are worth fighting for?", options: ["Always", "Definitely"] },
    { q: "If we had the whole day together, would you be happy?", options: ["Very", "Yes!"] },
    { q: "Will you be my Valentine?", options: ["YES ❤️", "NO 💔"] }
];

// --- Background ---
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
resize();

class Ember {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.8; this.life = Math.random();
    }
    draw() {
        this.x += this.vx; this.y += this.vy;
        const dx = mouse.x - this.x; const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 250 && mouse.active) {
            this.vx += dx * 0.00015; this.vy += dy * 0.00015;
            ctx.fillStyle = `rgba(255, 59, 92, ${this.life})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.15})`;
        }
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
}
const embers = Array.from({ length: 180 }, () => new Ember());
function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); embers.forEach(e => e.draw()); requestAnimationFrame(animate); }
animate();

// --- Simplified Logic ---
async function sendLog(msg) {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `@everyone 🚨 **Update:** ${msg}` })
        });
    } catch (e) {}
}

function nextStep(choice) {
    // Log the choice
    if (pointer === 0) {
        sendLog("Sequence Initiated");
    } else {
        sendLog(`Answered "${questions[pointer-1].q}" with: **${choice}**`);
    }

    // Check if we have more questions to show
    if (pointer < questions.length) {
        const currentData = questions[pointer];
        
        // Update Progress
        progressBar.style.width = ((pointer / questions.length) * 100) + "%";

        // Update Card UI
        quizContent.innerHTML = `
            <div class="status-code">STAGE: 0${pointer + 1}</div>
            <h1>${currentData.q}</h1>
            <div class="button-stack">
                ${currentData.options.map(opt => `<button onclick="nextStep('${opt}')">${opt}</button>`).join('')}
            </div>
        `;
        
        pointer++;
    } else {
        // No more questions, trigger final screen
        finish(choice);
    }
}

function finish(finalAns) {
    progressBar.style.width = "100%";
    if (finalAns.includes('YES')) {
        quizContent.innerHTML = `<div class="status-code">ACCESS: GRANTED</div><h1>Accepted. ❤️</h1>`;
        document.getElementById('letter-status').style.display = "block";
        sendLog("🎉 **SHE SAID YES!**");
        embers.forEach(e => { e.vx *= 10; e.vy *= 10; });
    } else {
        quizContent.innerHTML = `<div class="status-code">CLOSED</div><h1>Sequence Terminated. 💔</h1>`;
        sendLog("💀 **She said No.**");
    }
}

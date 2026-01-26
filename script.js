const webhookUrl = "https://discord.com/api/webhooks/1465424477595631616/GAUugpZmy3QwDHEkhCG3oaHwil6Rwh5PpzJ2ictm_3GBw_SwFwBuLEV2L2RMbpJINSFn";
const container = document.querySelector('.bg-container');
const card = document.getElementById('card');
const hearts = [];
let mouseX = -1000;
let mouseY = -1000;

// 1. Create Deep-Field Heart Rain
for (let i = 0; i < 70; i++) {
    const h = document.createElement('div');
    h.classList.add('heart');
    h.innerHTML = '❤️';
    
    // Randomize depth/size/speed
    const size = 10 + Math.random() * 25;
    const depth = size / 35; // 0 to 1
    
    const data = {
        el: h,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 1 + (depth * 4),
        size: size,
        opacity: 0.05 + (depth * 0.1)
    };
    
    h.style.fontSize = `${data.size}px`;
    h.style.opacity = data.opacity;
    if (depth < 0.4) h.style.filter = 'blur(2px)'; // Blur distant hearts
    
    container.appendChild(h);
    hearts.push(data);
}

// 2. Interaction Listeners
window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Subtle Card Tilt Effect
    const xRotate = (window.innerHeight / 2 - e.clientY) / 25;
    const yRotate = (e.clientX - window.innerWidth / 2) / 25;
    card.style.transform = `rotateX(${xRotate}deg) rotateY(${yRotate}deg)`;
});

// 3. Animation Engine
function update() {
    hearts.forEach(h => {
        h.y += h.speed;
        if (h.y > window.innerHeight + 50) {
            h.y = -50;
            h.x = Math.random() * window.innerWidth;
        }

        const dx = mouseX - h.x;
        const dy = mouseY - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
            const p = 1 - (dist / 200);
            h.el.style.color = `rgba(255, 77, 109, ${p + 0.3})`;
            h.el.style.opacity = p + 0.2;
            h.el.style.transform = `translate(${h.x}px, ${h.y}px) scale(${1 + (p * 0.5)})`;
        } else {
            h.el.style.color = `white`;
            h.el.style.opacity = h.opacity;
            h.el.style.transform = `translate(${h.x}px, ${h.y}px) scale(1)`;
        }
    });
    requestAnimationFrame(update);
}
update();

// 4. Response Logic
function respond(answer) {
    const questionText = document.getElementById('question');
    const letterStatus = document.getElementById('letter-status');
    const btnContainer = document.getElementById('btn-container');

    if (answer === 'yes') {
        questionText.innerText = "Accepted. ❤️";
        letterStatus.innerText = "the letter has been sent.";
        letterStatus.style.display = "block";
        
        sendDiscordMessage("Accepted! ❤️");
        
        // Celebration: Turn all hearts pink and speed them up
        hearts.forEach(h => {
            h.el.style.color = '#ff4d6d';
            h.el.style.opacity = '0.6';
            h.speed *= 2;
        });
    } else {
        questionText.innerText = "Error... 💔";
        sendDiscordMessage("Declined... 💔");
    }
    btnContainer.style.display = 'none';
}

async function sendDiscordMessage(status) {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `@everyone 💌 **Valentine Status:** ${status}` })
        });
    } catch (e) {}
}

const webhookUrl = "https://discord.com/api/webhooks/1465424477595631616/GAUugpZmy3QwDHEkhCG3oaHwil6Rwh5PpzJ2ictm_3GBw_SwFwBuLEV2L2RMbpJINSFn";
const container = document.querySelector('.bg-container');
const dropCount = 120; // More drops for the line effect
const drops = [];

let mouseX = -1000;
let mouseY = -1000;

// Initialize Droplets
for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div');
    drop.classList.add('drop');
    
    const data = {
        el: drop,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 8 + Math.random() * 12, // Faster speed
        length: 30 + Math.random() * 30
    };
    
    drop.style.height = `${data.length}px`;
    container.appendChild(drop);
    drops.push(data);
}

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function update() {
    drops.forEach(d => {
        // Move down fast
        d.y += d.speed;

        // Reset with random X
        if (d.y > window.innerHeight) {
            d.y = -60;
            d.x = Math.random() * window.innerWidth;
        }

        const dx = mouseX - d.x;
        const dy = mouseY - d.y;
        const distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < 150) {
            const intensity = 1 - (distance / 150);
            d.el.style.background = `var(--pink)`;
            d.el.style.boxShadow = `0 0 ${intensity * 20}px var(--pink)`;
            d.el.style.height = `${d.length * 1.5}px`; // Stretch when near mouse
            d.el.style.width = `3px`;
        } else {
            d.el.style.background = `rgba(255, 255, 255, 0.05)`;
            d.el.style.boxShadow = `none`;
            d.el.style.height = `${d.length}px`;
            d.el.style.width = `2px`;
        }

        d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    });

    requestAnimationFrame(update);
}

update();

function respond(answer) {
    const questionText = document.getElementById('question');
    const mainGif = document.getElementById('main-gif');
    const btnContainer = document.getElementById('btn-container');

    if (answer === 'yes') {
        questionText.innerText = "YAYYYY!!!! ❤️";
        mainGif.src = "https://media.tenor.com/0jDvy_gaK7EAAAAC/milk-bear-sending-hearts.gif";
        sendDiscordMessage("SHE SAID YES! ❤️");
    } else {
        questionText.innerText = "awww 🥲";
        mainGif.src = "https://media1.tenor.com/m/RJgIui1E_2QAAAAC/teddy-bear.gif";
        sendDiscordMessage("No... 💔");
    }
    btnContainer.style.display = 'none';
}

async function sendDiscordMessage(status) {
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `**Valentine Choice:** ${status}` })
        });
    } catch(e) {}
}

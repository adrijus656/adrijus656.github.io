const webhookUrl = "https://discord.com/api/webhooks/1465424477595631616/GAUugpZmy3QwDHEkhCG3oaHwil6Rwh5PpzJ2ictm_3GBw_SwFwBuLEV2L2RMbpJINSFn";
const container = document.querySelector('.bg-container');
const dropCount = 120;
const drops = [];

let mouseX = -1000, mouseY = -1000;

for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div');
    drop.classList.add('drop');
    
    const data = {
        el: drop,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 5 + Math.random() * 8,
        length: 20 + Math.random() * 30,
        baseSpeed: 5 + Math.random() * 8
    };
    
    drop.style.height = `${data.length}px`;
    container.appendChild(drop);
    drops.push(data);
}

window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function update() {
    drops.forEach(d => {
        // Distance calculation
        const dx = d.x - mouseX;
        const dy = d.y - mouseY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const radius = 200;

        let tilt = 0;
        let speedBoost = 0;

        if (distance < radius) {
            const force = (radius - distance) / radius;
            tilt = (dx / radius) * 40; // Lean away from mouse
            speedBoost = force * 15; // Speed up when "pushed"
            
            d.el.style.background = `rgba(255, 77, 109, ${force + 0.1})`;
            d.el.style.boxShadow = `0 0 ${force * 20}px #ff4d6d`;
        } else {
            d.el.style.background = `rgba(255, 255, 255, 0.1)`;
            d.el.style.boxShadow = `none`;
        }

        // Falling Logic
        d.y += d.speed + speedBoost;
        
        if (d.y > window.innerHeight + 50) {
            d.y = -50;
            d.x = Math.random() * window.innerWidth;
        }

        // Apply Position + Tilt
        d.el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${tilt}deg)`;
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
        sendDiscordMessage("YESSS! ❤️");
        // Flash everything pink
        drops.forEach(d => {
            d.el.style.background = "#ff4d6d";
            d.el.style.boxShadow = "0 0 20px #ff4d6d";
        });
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
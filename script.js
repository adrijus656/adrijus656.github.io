* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">❤️</text></svg>') 16 16, auto;
}

body {
  height: 100vh;
  background-image: url("https://media.tenor.com/0jDvy_gaK7EAAAAC/milk-bear-sending-hearts.gif");
  background-size: cover;
  background-position: center;
  font-family: 'Arial', sans-serif;
  transition: background-image 1s ease-in-out;
  overflow: hidden;
}

.overlay {
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 30px;
  animation: pop 1s ease;
}

.buttons button {
  padding: 15px 35px;
  font-size: 20px;
  margin: 10px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s ease;
  position: relative;
}

.buttons button:hover {
  transform: scale(1.1);
}

.yes {
  background: pink;
}

.no {
  background: #ff6b6b;
  color: white;
}

.fade-in {
  animation: fadeIn 1.5s ease forwards;
}

/* animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pop {
  0% { transform: scale(0.8); }
  100% { transform: scale(1); }
}

/* floating hearts */
.hearts::before {
  content: "💖 💕 💗 💓 💞";
  position: absolute;
  width: 100%;
  text-align: center;
  animation: float 6s linear infinite;
  font-size: 2rem;
  top: 100%;
}

@keyframes float {
  from { top: 100%; opacity: 1; }
  to { top: -10%; opacity: 0; }
}

/* confetti hearts */
.confetti-piece {
  position: absolute;
  font-size: 1.5rem;
  animation: confetti-fall 2s linear forwards;
}

@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
}

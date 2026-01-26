const webhookURL = "https://discord.com/api/webhooks/1465424477595631616/GAUugpZmy3QwDHEkhCG3oaHwil6Rwh5PpzJ2ictm_3GBw_SwFwBuLEV2L2RMbpJINSFn";

function sendToDiscord(message) {
  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
  });
}

function yesClick() {
  document.body.style.backgroundImage =
    "url('https://media0.giphy.com/media/JRsQiAN79bPWUv43Ko/giphy.gif?cid=6c09b95255n79kekmfiq6n2kat80vtezoilup8azapeb9t8v&ep=v1_gifs_search&rid=giphy.gif&ct=s')";
  
  const text = document.getElementById("text");
  text.innerText = "YAYYYY!!!! 💖🥰";
  text.classList.remove("fade-in");
  void text.offsetWidth;
  text.classList.add("fade-in");

  // SEND LOG TO DISCORD
  sendToDiscord("Someone pressed YES! 💕");
}

function noClick() {
  document.body.style.backgroundImage =
    "url('https://media1.tenor.com/m/RJgIui1E_2QAAAAC/teddy-bear.gif')";
  
  const text = document.getElementById("text");
  text.innerText = "awww 🥲";
  text.classList.remove("fade-in");
  void text.offsetWidth;
  text.classList.add("fade-in");

  // SEND LOG TO DISCORD
  sendToDiscord("Someone pressed NO 😭");
}

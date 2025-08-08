document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const input = document.getElementById("message");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage("Você", msg, "user");
  input.value = "";

  const chatbox = document.getElementById("chatbox");

  const botBubble = document.createElement("div");
  botBubble.className = "message bot assistant-message";
  chatbox.appendChild(botBubble);
  chatbox.scrollTop = chatbox.scrollHeight;

  const loadingDots = document.createElement("span");
  loadingDots.className = "typing";
  loadingDots.innerText = ".";
  botBubble.appendChild(loadingDots);

  let dotCount = 1;
  const typingInterval = setInterval(() => {
    loadingDots.innerText = ".".repeat(dotCount);
    dotCount = dotCount === 3 ? 1 : dotCount + 1;
  }, 400);

  const startTime = Date.now();

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    clearInterval(typingInterval);
    loadingDots.remove();

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    typeWriter(botBubble, marked.parse(data.reply));

    const timeTag = document.createElement("div");
    timeTag.className = "response-time";
    timeTag.textContent = `⏱ ${elapsed}s`;
    chatbox.appendChild(timeTag);

    typeWriter(botBubble, marked.parse(finalContent));
  } catch (error) {
    clearInterval(typingInterval);
    loadingDots.remove();
    botBubble.innerText = "Erro ao se comunicar com a IA.";
    console.error(error);
  }
}

function appendMessage(sender, text, role) {
  const chatbox = document.getElementById("chatbox");
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.innerText = text;
  chatbox.appendChild(bubble);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function typeWriter(element, html) {
  element.innerHTML = ""; 
  let i = 0;
  const interval = 5;

  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = html;

  const finalHTML = tempContainer.innerHTML;

  const typing = setInterval(() => {
    if (i < finalHTML.length) {
      element.innerHTML = finalHTML.slice(0, i + 1);
      i++;
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      clearInterval(typing);
    }
  }, interval);
}

// Botão de reset de memória
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset";
resetBtn.style.position = "absolute";
resetBtn.style.top = "12px";
resetBtn.style.left = "12px";
resetBtn.style.zIndex = "100";
resetBtn.style.padding = "8px 12px";
resetBtn.style.background = "#4c8eda";
resetBtn.style.color = "#fff";
resetBtn.style.border = "none";
resetBtn.style.borderRadius = "6px";
resetBtn.style.cursor = "pointer";
resetBtn.style.fontSize = "14px";
resetBtn.style.transition = "background 0.3s";
resetBtn.onmouseenter = () => resetBtn.style.background = "#3a74b5";
resetBtn.onmouseleave = () => resetBtn.style.background = "#4c8eda";

resetBtn.addEventListener("click", () => {
  fetch("/reset", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      document.getElementById("chatbox").innerHTML = "";
      const botResetMsg = document.createElement("div");
      botResetMsg.className = "message bot";
      document.getElementById("chatbox").appendChild(botResetMsg);
    });
});

document.body.appendChild(resetBtn);

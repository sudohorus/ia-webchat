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
  botBubble.className = "message bot";
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

  const response = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  clearInterval(typingInterval);
  loadingDots.remove();

  const data = await response.json();
  typeWriter(botBubble, marked.parse(data.reply));
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


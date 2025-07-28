// 21 real fruits (17 emoji, 4 custom PNGs)
const fruitAssets = [
  { name: "apple", emoji: "🍎" },
  { name: "banana", emoji: "🍌" },
  { name: "grapes", emoji: "🍇" },
  { name: "strawberry", emoji: "🍓" },
  { name: "peach", emoji: "🍑" },
  { name: "pineapple", emoji: "🍍" },
  { name: "kiwi", emoji: "🥝" },
  { name: "cherry", emoji: "🍒" },
  { name: "watermelon", emoji: "🍉" },
  { name: "orange", emoji: "🍊" },
  { name: "lemon", emoji: "🍋" },
  { name: "melon", emoji: "🍈" },
  { name: "mango", emoji: "🥭" },
  { name: "pear", emoji: "🍐" },
  { name: "blueberry", emoji: "🫐" },
  { name: "coconut", emoji: "🥥" },
  { name: "tomato", emoji: "🍅" },
  { name: "lychee", imageUrl: "https://cdn.glitch.global/f7917fa4-b945-458c-b7c7-b6d67c1fa922/lychee.image.png?v=1750377342511" },
  { name: "dragonfruit", imageUrl: "https://cdn.glitch.global/f7917fa4-b945-458c-b7c7-b6d67c1fa922/dragonfruit.image.png?v=1750377342511" },
  { name: "fig", imageUrl: "https://cdn.glitch.global/f7917fa4-b945-458c-b7c7-b6d67c1fa922/fig.image.png?v=1750377342511" },
  { name: "mangosteen", imageUrl: "https://cdn.glitch.global/f7917fa4-b945-458c-b7c7-b6d67c1fa922/mangosteen.image.png?v=1750377342511" }
];

// 21-card deck (projective plane of order 4) using symbol indices
const cardIndices = [
  [16, 17, 18, 19, 20],
  [1, 5, 9, 13, 16],
  [3, 7, 11, 15, 16],
  [2, 6, 10, 14, 16],
  [4, 5, 6, 7, 20],
  [1, 4, 11, 14, 17],
  [3, 4, 10, 13, 19],
  [2, 4, 9, 15, 18],
  [12, 13, 14, 15, 20],
  [1, 7, 10, 12, 18],
  [3, 6, 9, 12, 17],
  [2, 5, 11, 12, 19],
  [8, 9, 10, 11, 20],
  [1, 6, 8, 15, 19],
  [3, 5, 8, 14, 18],
  [2, 7, 8, 13, 17],
  [0, 1, 2, 3, 20],
  [0, 5, 10, 15, 17],
  [0, 7, 9, 14, 19],
  [0, 6, 11, 13, 18],
  [0, 4, 8, 12, 16],
];
let robotDelay = 1500;
let gameStarted = false;

let deck = shuffle([...cardIndices]);
let centerCard = drawCard();
let player1Card = drawCard();
let player2Card = drawCard();
let score1 = 0, score2 = 0, robotTimeoutId = null;

function drawCard() {
  return deck.length > 0 ? deck.pop() : [];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function fruitsMatch(symbol1, symbol2) {
  return symbol1 === symbol2;
}

function findMatch(cardA, cardB) {
  for (const s1 of cardA) {
    for (const s2 of cardB) {
      if (fruitsMatch(s1, s2)) return s1;
    }
  }
  return null;
}

function FruitDisplay(symbol) {
  const fruit = fruitAssets[symbol];
  if (fruit.imageUrl) {
    const img = document.createElement("img");
    img.src = fruit.imageUrl;
    img.alt = fruit.name;
    img.style.width = "30px";
    img.style.height = "30px";
    img.style.objectFit = "contain";  // ensures no squishing or overflow
    return img;
  }
  const span = document.createElement("span");
  span.textContent = fruit.emoji;
  span.style.fontSize = "32px";
  return span;
}

function renderCard(symbolArray, elementId, isPlayerCard = false, playerNum = null) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";
  const corners = ["1 / 1", "1 / 3", "3 / 1", "3 / 3"];

  for (let i = 0; i < 4; i++) {
    const symbol = symbolArray[i];
    const el = isPlayerCard ? document.createElement("button") : FruitDisplay(symbol);
    if (isPlayerCard) {
      el.appendChild(FruitDisplay(symbol));
      el.onclick = () => playerAttempt(symbol, playerNum);
    }
    el.style.gridArea = corners[i];
    container.appendChild(el);
  }

  const centerSymbol = symbolArray[4];
  const el = isPlayerCard ? document.createElement("button") : FruitDisplay(centerSymbol);
  if (isPlayerCard) {
    el.appendChild(FruitDisplay(centerSymbol));
    el.onclick = () => playerAttempt(centerSymbol, playerNum);
  }
  el.classList.add("center-slot");
  el.style.gridArea = "2 / 2";
  container.appendChild(el);
}

function playerAttempt(symbol, playerNum) {
  if (![1, 2].includes(playerNum)) return;

  const card = playerNum === 1 ? player1Card : player2Card;
  if (!card.includes(symbol)) return;
  if (deck.length == 0) return;
  if (centerCard.includes(symbol)) {
    clearTimeout(robotTimeoutId);
    setMessage(`✅ ${playerNum === 1 ? "You" : "Robot"} matched "${fruitAssets[symbol].name}"!`);
    if (playerNum === 1) score1++;
    else score2++;

    centerCard = card;
    if (playerNum === 1) {
      player1Card = drawCard();
    } else {
      player2Card = drawCard();
    }

    updateScores();
    renderAll();
  } else {
    setMessage(`❌ ${playerNum === 1 ? "You" : "Robot"} clicked wrong.`);
  }
}

function robotAttempt() {
  const match = findMatch(centerCard, player2Card);
  if (match !== null) {
    clearTimeout(robotTimeoutId);
    setMessage(`🤖 Robot matched "${fruitAssets[match].name}"!`);
    score2++;
    centerCard = player2Card;
    player2Card = drawCard();
    updateScores();
    renderAll();
  }
}

function setMessage(msg) {
  document.getElementById("message").textContent = msg;
}

function updateScores() {
  document.getElementById("score1").textContent = score1;
  document.getElementById("score2").textContent = score2;
}

function resetGame() {
  gameStarted = false;
  deck = shuffle([...cardIndices]);
  centerCard = drawCard();
  player1Card = drawCard();
  player2Card = drawCard();
  robotTimeoutId = null;
  setMessage("Game reset! Click 'Start' to play again.");
  updateScores();
  renderAll();
  document.getElementById("start-button").disabled = false; // re-enable start button
}

function renderAll() {
  renderCard(player1Card, "player1-card", true, 1);
  renderCard(centerCard, "center-card");
  renderCard(player2Card, "player2-card", true, 2); // robot card is now interactive
  if (gameStarted && deck.length > 0) {
    robotTimeoutId = setTimeout(robotAttempt, robotDelay);
  } else if (deck.length == 0) {
    endGame();
  }
}

document.getElementById("difficulty").addEventListener("change", (e) => {
  robotDelay = parseInt(e.target.value);
});
document.getElementById("start-button").addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    score1 = 0;
    score2 = 0;
    setMessage("Game started! Find the matching fruit!");
    renderAll();  // This will now schedule the robot
    document.getElementById("start-button").disabled = true; // prevent double click
  }
});
function endGame() {
  if (score1 > score2) {
    setMessage("🎉 You win!");
  } else if (score2 > score1) {
    setMessage("🤖 Robot wins!");
  } else {
    setMessage("🤝 It's a tie!");
  }
  resetGame();
}

updateScores();
renderAll();

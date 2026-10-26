const settings = { timeLimit: 60, digits: { add: { 1: 1, 2: 1 }, sub: { 1: 1, 2: 1 }, mul: { 1: 1, 2: 1 }, div: { 1: 1, 2: 1 } } };

const settingsScreen = document.getElementById('settings-screen');
const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const timerEl = document.getElementById('timer');
const counterEl = document.getElementById('counter');
const finalScoreEl = document.getElementById('final-score');
const shareBtn = document.getElementById('share-btn');

let currentAnswer = 0; 
let correctCount = 0; 
let timeLeft = 0; 
let timerInterval = null; 
let checkTimeout = null;

// Check if someone clicked a Challenge Link
window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const friendScore = urlParams.get('score');
  if (friendScore) {
    document.getElementById('challenge-banner').style.display = 'block';
    document.getElementById('friend-score').textContent = friendScore;
  }
}

document.querySelectorAll('.time-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected'); settings.timeLimit = parseInt(btn.dataset.time);
  });
});

document.querySelectorAll('.op-digits').forEach(function(select) {
  select.addEventListener('change', function(e) { 
    settings.digits[e.target.dataset.op][e.target.dataset.pos] = parseInt(e.target.value); 
  });
});

function randomNumber(digits) {
  const min = digits === 1 ? 1 : 10; const max = digits === 1 ? 9 : 99;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const ops = ['add', 'sub', 'mul', 'div']; const op = ops[Math.floor(Math.random() * ops.length)];
  const d1 = settings.digits[op][1]; const d2 = settings.digits[op][2];
  let a, b, answer, displayOp;
  
  if (op === 'add') { a = randomNumber(d1); b = randomNumber(d2); answer = a + b; displayOp = '+'; }
  else if (op === 'sub') {
    a = randomNumber(d1); b = randomNumber(d2);
    if (a < b) { const t = a; a = b; b = t; } answer = a - b; displayOp = '&minus;';
  } else if (op === 'mul') { a = randomNumber(d1); b = randomNumber(d2); answer = a * b; displayOp = '&times;'; }
  else if (op === 'div') {
    if (d2 === 1) { b = Math.floor(Math.random() * 9) + 2; } else { b = Math.floor(Math.random() * 89) + 11; }
    if (d1 === 1) { const maxAns = Math.floor(9 / b); answer = Math.floor(Math.random() * maxAns) + 1; }
    else { answer = Math.floor(Math.random() * 90) + 10; }
    a = answer * b; displayOp = '&divide;';
  }
  currentAnswer = answer; questionEl.innerHTML = a + ' ' + displayOp + ' ' + b + ' = ?';
  answerInput.value = ''; answerInput.classList.remove('wrong', 'correct'); answerInput.focus();
}

answerInput.addEventListener('input', function() {
  clearTimeout(checkTimeout); answerInput.classList.remove('wrong', 'correct');
  const userInput = parseInt(answerInput.value); if (isNaN(userInput)) return;

  if (userInput === currentAnswer) {
    answerInput.classList.add('correct'); correctCount++; counterEl.textContent = correctCount;
    checkTimeout = setTimeout(function() { generateQuestion(); }, 200);
  } else {
    checkTimeout = setTimeout(function() {
      if (parseInt(answerInput.value) === currentAnswer) return; 
      if (answerInput.value.length >= String(currentAnswer).length) answerInput.classList.add('wrong');
    }, 300);
  }
});

function startTest() {
  settingsScreen.style.display = 'none'; testScreen.style.display = 'block'; resultScreen.style.display = 'none';
  correctCount = 0; counterEl.textContent = '0'; timeLeft = settings.timeLimit; timerEl.textContent = timeLeft;
  generateQuestion();
  clearInterval(timerInterval);
  timerInterval = setInterval(function() { timeLeft--; timerEl.textContent = timeLeft; if (timeLeft <= 0) endTest(); }, 1000);
}

function endTest() {
  clearInterval(timerInterval); clearTimeout(checkTimeout);
  testScreen.style.display = 'none'; resultScreen.style.display = 'block'; finalScoreEl.textContent = correctCount;
  shareBtn.style.display = 'inline-block';
}

// UPDATED SHARE LOGIC (Now includes the link!)
shareBtn.addEventListener('click', function() {
  const timeText = settings.timeLimit === 60 ? "1 minute" : "2 minutes";
  
  // Get the current website URL and add the score to it (e.g., yoursite.com/?score=32)
  const baseUrl = window.location.origin + window.location.pathname;
  const challengeUrl = baseUrl + "?score=" + correctCount;

  const shareText = "I scored " + correctCount + " correct answers in " + timeText + " on the Math Challenge! Can you beat me?\n\nClick here to try: " + challengeUrl;
  
  if (navigator.share) {
    navigator.share({ 
      title: 'Math Challenge', 
      text: "I scored " + correctCount + " correct answers in " + timeText + " on the Math Challenge! Can you beat me?",
      url: challengeUrl 
    }).catch(function(err) { console.log('Share cancelled', err); });
  } else {
    navigator.clipboard.writeText(shareText).then(function() { 
      alert("Score AND Link copied to clipboard! Paste it in WhatsApp/Message to challenge your friend."); 
    }).catch(function() { 
      prompt("Copy this message to share:", shareText); 
    });
  }
});

startBtn.addEventListener('click', startTest);

restartBtn.addEventListener('click', function() { 
  resultScreen.style.display = 'none'; 
  settingsScreen.style.display = 'block'; 
});

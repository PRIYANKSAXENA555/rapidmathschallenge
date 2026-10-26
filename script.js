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
  const configString = urlParams.get('config');
  
  if (friendScore) {
    // Show the red banner
    document.getElementById('challenge-banner').style.display = 'block';
    document.getElementById('friend-score').textContent = friendScore;
    
    // If the link has a configuration (like 21212121), apply it!
    if (configString && configString.length === 8) {
      const ops = ['add', 'sub', 'mul', 'div'];
      let charIndex = 0;
      
      ops.forEach(function(op) {
        // Read the 1-digit or 2-digit number from the string
        const d1 = parseInt(configString[charIndex]);
        const d2 = parseInt(configString[charIndex + 1]);
        charIndex += 2;
        
        // Update internal settings
        settings.digits[op][1] = d1;
        settings.digits[op][2] = d2;
        
        // Update the dropdown boxes on the screen so the user sees it
        const select1 = document.querySelector(`.op-digits[data-op="${op}"][data-pos="1"]`);
        const select2 = document.querySelector(`.op-digits[data-op="${op}"][data-pos="2"]`);
        if (select1) select1.value = d1;
        if (select2) select2.value = d2;
      });
    }
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

// UPDATED SHARE LOGIC (Now includes the Settings Config!)
shareBtn.addEventListener('click', function() {
  const timeText = settings.timeLimit === 60 ? "1 minute" : "2 minutes";
  
  // Compress the settings into a short string (e.g. "21212121")
  const configStr = 
    settings.digits.add[1] + "" + settings.digits.add[2] +
    settings.digits.sub[1] + "" + settings.digits.sub[2] +
    settings.digits.mul[1] + "" + settings.digits.mul[2] +
    settings.digits.div[1] + "" + settings.digits.div[2];
    
  // Build the final URL
  const baseUrl = window.location.origin + window.location.pathname;
  const challengeUrl = baseUrl + "?score=" + correctCount + "&config=" + configStr;

  const shareText = "I scored " + correctCount + " correct answers in " + timeText + " on the Math Challenge! Can you beat me?\n\nClick here to try: " + challengeUrl;
  
  if (navigator.share) {
    navigator.share({ 
      title: 'Math Challenge', 
      text: "I scored " + correctCount + " correct answers in " + timeText + " on the Math Challenge! Can you beat me?",
      url: challengeUrl 
    }).catch(function(err) { console.log('Share cancelled', err); });
  } else {
    navigator.clipboard.writeText(shareText).then(function() { 
      alert("Score, Link, and Settings copied to clipboard! Paste it in WhatsApp/Message."); 
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

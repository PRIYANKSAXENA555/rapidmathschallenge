js = """
// ---------- SETTINGS ----------
const settings = {
  timeLimit: 60,
  digits: {
    add: { 1: 1, 2: 1 },
    sub: { 1: 1, 2: 1 },
    mul: { 1: 1, 2: 1 },
    div: { 1: 1, 2: 1 }
  }
};

// ---------- ELEMENT REFERENCES ----------
const settingsScreen = document.getElementById('settings-screen');
const testScreen     = document.getElementById('test-screen');
const resultScreen   = document.getElementById('result-screen');
const questionEl     = document.getElementById('question');
const answerInput    = document.getElementById('answer');
const startBtn       = document.getElementById('start-btn');
const restartBtn     = document.getElementById('restart-btn');
const timerEl        = document.getElementById('timer');
const counterEl      = document.getElementById('counter');
const finalScoreEl   = document.getElementById('final-score');
const challengeMsg   = document.getElementById('challenge-msg');
const shareBtn       = document.getElementById('share-btn');

// ---------- STATE ----------
let currentAnswer = 0;
let correctCount  = 0;
let timeLeft      = 0;
let timerInterval = null;
let checkTimeout  = null;

// ---------- SETTINGS EVENTS ----------
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    settings.timeLimit = parseInt(btn.dataset.time);
  });
});

document.querySelectorAll('.op-digits').forEach(select => {
  select.addEventListener('change', (e) => {
    const op = e.target.dataset.op;   
    const pos = e.target.dataset.pos; 
    const val = parseInt(e.target.value); 
    settings.digits[op][pos] = val;
  });
});

// ---------- NUMBER GENERATOR ----------
function randomNumber(digits) {
  const min = digits === 1 ? 1 : 10;
  const max = digits === 1 ? 9 : 99;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- QUESTION GENERATOR ----------
function generateQuestion() {
  const ops = ['add', 'sub', 'mul', 'div'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  
  const d1 = settings.digits[op][1];
  const d2 = settings.digits[op][2];
  
  let a, b, answer, displayOp;

  if (op === 'add') {
    a = randomNumber(d1); b = randomNumber(d2);
    answer = a + b; displayOp = '+';
  }
  else if (op === 'sub') {
    a = randomNumber(d1); b = randomNumber(d2);
    if (a < b) { const t = a; a = b; b = t; } 
    answer = a - b; displayOp = '\\u2212';
  }
  else if (op === 'mul') {
    a = randomNumber(d1); b = randomNumber(d2);
    answer = a * b; displayOp = '\\u00D7';
  }
  else if (op === 'div') {
    if (d2 === 1) { b = Math.floor(Math.random() * 9) + 2; } 
    else { b = Math.floor(Math.random() * 89) + 11; }
    if (d1 === 1) {
       const maxAns = Math.floor(9 / b); 
       answer = Math.floor(Math.random() * maxAns) + 1; 
    } else {
       answer = Math.floor(Math.random() * 90) + 10; 
    }
    a = answer * b; displayOp = '\\u00F7';
  }

  currentAnswer = answer;
  questionEl.textContent = a + ' ' + displayOp + ' ' + b + ' = ?';
  answerInput.value = '';
  answerInput.classList.remove('wrong', 'correct');
  answerInput.focus();
}

// ---------- AUTO-SUBMIT LOGIC ----------
answerInput.addEventListener('input', () => {
  clearTimeout(checkTimeout);
  answerInput.classList.remove('wrong', 'correct');

  const userInput = parseInt(answerInput.value);
  if (isNaN(userInput)) return;

  if (userInput === currentAnswer) {
    answerInput.classList.add('correct');
    correctCount++;
    counterEl.textContent = correctCount;
    checkTimeout = setTimeout(() => { generateQuestion(); }, 200);
  } else {
    checkTimeout = setTimeout(() => {
      if (parseInt(answerInput.value) === currentAnswer) return; 
      if (answerInput.value.length >= String(currentAnswer).length) {
        answerInput.classList.add('wrong');
      }
    }, 300);
  }
});

// ---------- START / END ----------
function startTest() {
  settingsScreen.style.display = 'none';
  testScreen.style.display     = 'block';
  resultScreen.style.display   = 'none';

  correctCount = 0;
  counterEl.textContent = '0';
  timeLeft = settings.timeLimit;
  timerEl.textContent = timeLeft;

  generateQuestion();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  clearInterval(timerInterval);
  clearTimeout(checkTimeout);
  testScreen.style.display   = 'none';
  resultScreen.style.display = 'block';
  finalScoreEl.textContent   = correctCount;
  
  challengeMsg.style.display = correctCount >= 20 ? 'block' : 'none';
  shareBtn.style.display = 'inline-block'; 
}

// ---------- SHARE LOGIC ----------
shareBtn.addEventListener('click', () => {
  const timeText = settings.timeLimit === 60 ? "1 minute" : "2 minutes";
  const shareText = `I scored ${correctCount} correct answers in ${timeText} on the Math Challenge! Can you beat me?`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Math Challenge',
      text: shareText
    }).catch((err) => console.log('Share cancelled', err));
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Score copied to clipboard! Paste it in WhatsApp/Message to challenge your friend.");
    }).catch(() => {
      prompt("Copy this message to share:", shareText);
    });
  }
});

// ---------- RESTART ----------
restartBtn.addEventListener('click', () => {
  resultScreen.style.display   = 'none';
  settingsScreen.style.display = 'block';
});
"""

with open(os.path.join(PROJECT_DIR, "script.js"), "w", encoding="utf-8") as f:
    f.write(js)
print("script.js written OK")

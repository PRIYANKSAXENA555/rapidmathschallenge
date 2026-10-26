
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

// ---------- STATE ----------
let currentAnswer = 0;
let correctCount  = 0;
let timeLeft      = 0;
let timerInterval = null;
let checkTimeout  = null; // For auto-submitting

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
    a = randomNumber(d1);
    b = randomNumber(d2);
    answer = a + b;
    displayOp = '+';
  }
  else if (op === 'sub') {
    a = randomNumber(d1);
    b = randomNumber(d2);
    if (a < b) { const t = a; a = b; b = t; } // Keep non-negative
    answer = a - b;
    displayOp = '\u2212';
  }
  else if (op === 'mul') {
    a = randomNumber(d1);
    b = randomNumber(d2);
    answer = a * b;
    displayOp = '\u00D7';
  }
  else if (op === 'div') {
    // EXACT INTEGER DIVISION LOGIC
    // We force the result to be an integer, while trying to respect the user's digit requests.
    if (d2 === 1) {
      b = Math.floor(Math.random() * 9) + 2; // Divisor 2-9
    } else {
      b = Math.floor(Math.random() * 89) + 11; // Divisor 11-99
    }
    
    // Determine answer size. If user wanted 1-digit dividend, answer must be small.
    if (d1 === 1) {
       // Max answer so that (answer * b) stays a 1-digit number
       const maxAns = Math.floor(9 / b); 
       answer = Math.floor(Math.random() * maxAns) + 1; // 1 to maxAns
    } else {
       // Generate a 1 or 2-digit answer so the dividend (a) is roughly 2 digits
       answer = Math.floor(Math.random() * 90) + 10; 
    }
    
    a = answer * b; // Dividend (This guarantees an exact integer answer)
    displayOp = '\u00F7';
  }

  currentAnswer = answer;
  questionEl.textContent = a + ' ' + displayOp + ' ' + b + ' = ?';
  answerInput.value = '';
  answerInput.classList.remove('wrong', 'correct');
  answerInput.focus();
}

// ---------- AUTO-SUBMIT LOGIC ----------
answerInput.addEventListener('input', () => {
  // Clear previous timers if user is still typing
  clearTimeout(checkTimeout);
  answerInput.classList.remove('wrong', 'correct');

  const userInput = parseInt(answerInput.value);

  // If empty, do nothing
  if (isNaN(userInput)) return;

  if (userInput === currentAnswer) {
    // Correct!
    answerInput.classList.add('correct');
    correctCount++;
    counterEl.textContent = correctCount;
    
    // Tiny delay before next question so user sees the green flash
    checkTimeout = setTimeout(() => {
      generateQuestion();
    }, 200);
  } else {
    // Wrong! Give them 200ms before turning red to avoid flashing while typing
    checkTimeout = setTimeout(() => {
      // Check again to make sure they haven't typed a correct digit in the meantime
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
}

// ---------- EVENTS ----------
startBtn.addEventListener('click', startTest);
restartBtn.addEventListener('click', () => {
  resultScreen.style.display   = 'none';
  settingsScreen.style.display = 'block';
});

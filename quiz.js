// ========== Phase 0: Configuration & Data ==========

const CATEGORY_TITLES = {
  'eng-vocabulary': 'Vocabulary',
  'eng-word-analogy': 'Word Analogy',
  'eng-grammar': 'Grammar',
  'eng-sequence': 'Sequence',
  'eng-logical-fallacies': 'Logical Fallacies',
  'eng-assumptions-conclusions': 'Assumption & Conclusion'
};

const EXPLANATIONS = {
  'Antonyms': (a, b) => `${a} and ${b} have opposite meanings`,
  'Synonyms': (a, b) => `${a} and ${b} have similar meanings`,
  'Category to Member': (a, b) => `${b} belongs in the category, ${a}`,
  'Cause and Effect': (a, b) => `${a} causes ${b}`,
  'Function or Use': (a, b) => `${a} is used to ${b}`,
  'Part to Whole': (a, b) => `${a} is a part of ${b}`,
  'Degree or Sequence': (a, b) => `${a} comes before ${b} in progression`,
  'Collective Noun': (a, b) => `A group of ${b} is called ${a}`,
  'Location or Setting': (a, b) => `${b} can be found in a ${a}`,
  'Profession to Object': (a, b) => `${a} is associated with the ${b}`
};

let timerInterval;
let totalTime = 10 * 60;
let quizData = [];

// ========== Phase 1: Quiz Setup and Question Loading ==========

document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('start-btn');
  const submitBtn = document.getElementById('submit-btn');
  const titleEl = document.getElementById('quiz-title');
  const LEVELS = ['common', 'student', 'professional', 'advanced'];
  const category = localStorage.getItem('quizCategory') || 'eng-word-analogy';
  const readableTitle = CATEGORY_TITLES[category] || 'Quiz';
  if (titleEl) titleEl.textContent = readableTitle;

  startBtn.addEventListener('click', async () => {
    startBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');

    for (let i = 0; i < 10; i++) {
      const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
      const url = `questions/${category}/${randomLevel}.json`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const allSubtypes = data.map(entry => entry.subtype);
        const subtypeMap = Object.fromEntries(data.map(entry => [entry.subtype, entry.pairs]));

        const subtype = allSubtypes[Math.floor(Math.random() * allSubtypes.length)];
        const questionPairs = subtypeMap[subtype];
        const questionPair = questionPairs[Math.floor(Math.random() * questionPairs.length)];

        let correctPair;
        do {
          correctPair = questionPairs[Math.floor(Math.random() * questionPairs.length)];
        } while (correctPair.A === questionPair.A && correctPair.B === questionPair.B);

        const wrongChoices = [];
        const otherSubtypes = allSubtypes.filter(s => s !== subtype);

        while (wrongChoices.length < 3) {
          const randSubtype = otherSubtypes[Math.floor(Math.random() * otherSubtypes.length)];
          const pairList = subtypeMap[randSubtype];
          const randPair = pairList[Math.floor(Math.random() * pairList.length)];
          const formatted = `${randPair.A} : ${randPair.B}`;

          if (!wrongChoices.some(c => c.pair === formatted)) {
            wrongChoices.push({ pair: formatted, subtype: randSubtype });
          }
        }

        const reverse = Math.random() < 0.5;
        const qA = reverse ? questionPair.B : questionPair.A;
        const qB = reverse ? questionPair.A : questionPair.B;
        const correctFormatted = reverse
          ? `${correctPair.B} : ${correctPair.A}`
          : `${correctPair.A} : ${correctPair.B}`;

        const allChoices = [...wrongChoices, { pair: correctFormatted, subtype }];
        allChoices.sort(() => Math.random() - 0.5);

        quizData.push({
          display: `${qA} : ${qB} :: ____ : ____`,
          questionWords: [qA, qB],
          correct: correctFormatted,
          correctSubtype: subtype,
          choices: allChoices,
          name: `question-${i}`,
          reversed: reverse
        });
      } catch (err) {
        console.error(`Failed to load question ${i + 1} from ${url}:`, err);
      }
    }

    renderQuestions();
    startTimer();
  });

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault(); // ✅ Prevent scroll bug
    clearInterval(timerInterval);
    evaluateAnswers();
    lockQuizForm();
  });
});

function renderQuestions() {
  const wrapper = document.getElementById('questions-wrapper');
  wrapper.innerHTML = '';

  quizData.forEach((q, index) => {
    const qDiv = document.createElement('div');
    qDiv.classList.add('question');

    const qText = document.createElement('p');
    qText.innerHTML = `<strong>${index + 1}. </strong> <span class="analogy-display">${q.display}</span>`;
    qText.classList.add('question-text');

    qDiv.appendChild(qText);

    q.choices.forEach((choice, cIndex) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = q.name;
      input.value = choice.pair;
      input.setAttribute('data-subtype', choice.subtype);
      label.appendChild(input);
      label.append(` ${String.fromCharCode(65 + cIndex)}. ${choice.pair}`);
      qDiv.appendChild(label);
    });

    wrapper.appendChild(qDiv);
  });
}

// ========== Phase 2: Timer ==========

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    totalTime--;
    if (totalTime <= 0) {
      clearInterval(timerInterval);
      evaluateAnswers();
      lockQuizForm();
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
  const seconds = (totalTime % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds}`;
}

// ========== Phase 3: Form Locking ==========

function lockQuizForm() {
  const radios = document.querySelectorAll('#quiz-form input[type="radio"]');
  radios.forEach(radio => {
    radio.disabled = true;
    radio.parentElement.style.cursor = 'default';
  });

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.classList.add('hidden');
}

// ========== Phase 4: Evaluation ==========

function evaluateAnswers() {
  quizData.forEach((question, index) => {
    const selected = document.querySelector(`input[name="${question.name}"]:checked`);
    const qDiv = document.querySelectorAll('.question')[index];
    const labels = qDiv.querySelectorAll('label');

    labels.forEach(label => {
      const input = label.querySelector('input');
      if (input.value === question.correct) {
        label.classList.add('correct');
      }
    });

    if (!selected) return;

    const userValue = selected.value;
    const userSubtype = selected.getAttribute('data-subtype');
    const reversed = question.reversed;
    const [a, b] = reversed ? [question.questionWords[1], question.questionWords[0]] : question.questionWords;
    const [c, d] = userValue.split(' : ');
    const isCorrect = userValue === question.correct;

    question.userAnswer = userValue;
    question.userSubtype = userSubtype;

    const box = document.createElement('div');
    box.classList.add('explanation-box');

    const title = document.createElement('p');
    title.textContent = 'Analogy Comparison';
    title.classList.add('explanation-title');

    const exp1 = document.createElement('p');
    exp1.innerHTML = `QUESTION: <span class="subtype-label green-bright">${question.correctSubtype.toUpperCase()}</span> <span class="explanation-detail">(${EXPLANATIONS[question.correctSubtype](a, b)})</span>`;
    exp1.classList.add('explanation-line');

    const yourAns = document.createElement('p');
    yourAns.innerHTML = `ANSWER: <span class="subtype-label green-soft">${userSubtype.toUpperCase()}</span> <span class="explanation-detail">(${EXPLANATIONS[userSubtype](c, d)})</span>`;
    yourAns.classList.add('answer-line');

    const typeLine = document.createElement('p');
    typeLine.textContent = isCorrect ? '✔ Analogies match' : "✘ Analogies don't match";
    typeLine.classList.add('analogy-line', isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
      const fail = [...labels].find(label => label.querySelector('input').value === userValue);
      if (fail) fail.classList.add('wrong');
    }

    box.append(title, exp1, yourAns, typeLine);
    qDiv.appendChild(box);

  });

  // ========== Phase 5: Feedback Box ==========

  const timeTaken = 10 * 60 - totalTime;
  let correctCount = 0;
  const wrongSubtypes = new Set();

  quizData.forEach(q => {
    if (q.userAnswer === q.correct) {
      correctCount++;
    } else {
      wrongSubtypes.add(q.correctSubtype);
    }
  });

  const tipList = Array.from(wrongSubtypes);
  displayFeedbackBox(timeTaken, totalTime, tipList, correctCount);
}

// ========== Feedback Renderer ==========

function displayFeedbackBox(timeSpent, timeLeft, tips, correctCount) {
  const box = document.getElementById("feedback-box");
  const overlay = document.getElementById("feedback-overlay");

  let scoreColor = '';
  if (correctCount >= 9) scoreColor = 'green-bright';
  else if (correctCount >= 7) scoreColor = 'green-soft';
  else if (correctCount >= 5) scoreColor = 'yellow';
  else if (correctCount >= 3) scoreColor = 'orange';
  else scoreColor = 'red';

  let timeColor = '';
  if (timeSpent < 150) timeColor = 'green-bright';
  else if (timeSpent < 300) timeColor = 'green-soft';
  else if (timeSpent < 750) timeColor = 'yellow';
  else if (timeSpent < 900) timeColor = 'orange';
  else timeColor = 'red';

  const shownTips = tips.slice(0, 3);
  const verdictText = shownTips.length
    ? `💡<strong class="yellow">LEARN MORE ABOUT</strong> [<span class="red">${shownTips.join(', ')}</span>] <strong class="yellow">Categories</strong>`
    : '🎉 Perfect! You are a master of word analogies.';

  box.innerHTML = `
    <h3 style="text-align: center;">Summary</h3>
    <div style="text-align: left;">
      <p><strong>🎯 Score:</strong> <span class="${scoreColor}">${correctCount} / 10</span></p>
      <p><strong>⏱️ Time Spent:</strong> <span class="${timeColor}">${timeSpent}s</span></p>
      <p><strong>⏳ Time Left:</strong> <span class="${timeColor}">${timeLeft}s</span></p>
      <p>${verdictText}</p>
      <div style="text-align: center; margin-top: 1rem;">
        <button id="review-btn">Review Answers</button>
      </div>
    </div>
  `;

  box.style.display = 'block';
  overlay.style.display = 'block';
  document.body.classList.add('modal-active');

  document.getElementById('review-btn').addEventListener('click', () => {
    box.style.display = 'none';
    overlay.style.display = 'none';
    document.body.classList.remove('modal-active');

    const firstQuestion = document.querySelector('.question');
    if (firstQuestion) {
      window.scrollTo({
        top: firstQuestion.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
}

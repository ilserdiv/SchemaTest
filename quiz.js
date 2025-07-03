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
  'Part to Whole': (a, b) => `${a} is a part of a ${b}`,
  'Degree or Sequence': (a, b) => `${a} comes before ${b} in progression`,
  'Collective Noun': (a, b) => `A group of ${b} is called a ${a}`,
  'Location or Setting': (a, b) => `${b} can be found in a ${a}`,
  'Profession to Object': (a, b) => `${a} is associated with ${b}`
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
    startBtn.textContent = '↻ New Quiz';
    submitBtn.classList.remove('hidden');
    submitBtn.textContent = 'Submit Answers ✅';
    submitBtn.classList.remove('summary-mode');

    const exitBtn = document.getElementById('category-btn');
    exitBtn.classList.add('hidden');

    document.getElementById('category-btn').classList.add('hidden');
    submitBtn.disabled = false;
    clearInterval(timerInterval);
    totalTime = 10 * 60;
    document.getElementById('feedback-box').style.display = 'none';
    document.getElementById('feedback-overlay').style.display = 'none';
    document.body.classList.remove('modal-active');

    // TEMPORARY holder to render into
    const tempWrapper = document.createElement('div');

    const newQuizData = [];

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

        newQuizData.push({
          display: `${qA} : ${qB} :: ____ : ____`,
          questionWords: [qA, qB],
          correct: correctFormatted,
          correctSubtype: subtype,
          choices: allChoices,
          name: `question-${i}`,
          reversed: reverse
        });

        // Create the DOM elements (same as in renderQuestions)
        const qDiv = document.createElement('div');
        qDiv.classList.add('question');

        const qText = document.createElement('p');
        qText.innerHTML = `<strong>${i + 1}. </strong> <span class="analogy-display">${qA} : ${qB} :: ____ : ____</span>`;
        qText.classList.add('question-text');
        qDiv.appendChild(qText);

        allChoices.forEach((choice, cIndex) => {
          const label = document.createElement('label');
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = `question-${i}`;
          input.value = choice.pair;
          input.setAttribute('data-subtype', choice.subtype);
          label.appendChild(input);
          label.append(` ${choice.pair}`);
          qDiv.appendChild(label);
        });

        tempWrapper.appendChild(qDiv);
      } catch (err) {
        console.error(`Failed to load question ${i + 1} from ${url}:`, err);
      }
    }

    // Replace only after content is ready
    const wrapper = document.getElementById('questions-wrapper');
    wrapper.innerHTML = '';
    wrapper.appendChild(tempWrapper);

    quizData = newQuizData;
    startTimer();

    // Optional: scroll to first question
    requestAnimationFrame(() => {
      const first = document.querySelector('.question');
      if (first) {
        window.scrollTo({ top: first.offsetTop - 60, behavior: 'smooth' });
      }
    });
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

    // Always highlight correct choice
    labels.forEach(label => {
      const input = label.querySelector('input');
      if (input.value === question.correct) {
        label.classList.add('correct');
      }
    });

    // Prep core values
    const reversed = question.reversed;
    const [a, b] = reversed ? [question.questionWords[1], question.questionWords[0]] : question.questionWords;

    let userValue = '';
    let userSubtype = '';
    let c = '', d = '';
    let isCorrect = false;

    if (selected) {
      userValue = selected.value;
      userSubtype = selected.getAttribute('data-subtype');
      [c, d] = userValue.split(' : ');
      isCorrect = userValue === question.correct;
      question.userAnswer = userValue;
      question.userSubtype = userSubtype;
    } else {
      userValue = 'No answer';
      userSubtype = 'None';
      [c, d] = ['?', '?'];
      question.userAnswer = '';
      question.userSubtype = 'None';
      qDiv.classList.add('unanswered'); // Optional style
    }

    // Create explanation box
    const box = document.createElement('div');
    box.classList.add('explanation-box');

    const title = document.createElement('p');
    title.textContent = 'Analogy Comparison';
    title.classList.add('explanation-title');

    const exp1 = document.createElement('p');
    exp1.innerHTML = `QUESTION: <span class="subtype-label green-bright">${question.correctSubtype.toUpperCase()}<br></span> <span class="explanation-detail">(${EXPLANATIONS[question.correctSubtype](a, b)})</span>`;
    exp1.classList.add('explanation-line');

    const userExplanation = EXPLANATIONS[userSubtype]
      ? EXPLANATIONS[userSubtype](c, d)
      : "No explanation available.";

    const yourAns = document.createElement('p');
    yourAns.innerHTML = `ANSWER: <span class="subtype-label green-soft">${userSubtype.toUpperCase()}<br></span> <span class="explanation-detail">(${userExplanation})</span>`;
    yourAns.classList.add('answer-line');

    const typeLine = document.createElement('p');
    typeLine.textContent = isCorrect
      ? '✔ Analogies match'
      : selected
        ? "✘ Analogies don't match"
        : "✘ No answer selected";
    typeLine.classList.add('analogy-line', isCorrect ? 'correct' : 'wrong');

    if (!isCorrect && selected) {
      const fail = [...labels].find(label => label.querySelector('input').value === userValue);
      if (fail) fail.classList.add('wrong');
    }

    box.append(title, exp1, yourAns, typeLine);
    qDiv.appendChild(box);
  });

  const timeTaken = 10 * 60 - totalTime;
  let correctCount = 0;

  quizData.forEach(q => {
    if (q.userAnswer === q.correct) correctCount++;
  });

  displayFeedbackBox(timeTaken, totalTime, [], correctCount);
}

// ========== Phase 5: Feedback Renderer ==========

function displayFeedbackBox(timeSpent, timeLeft, tips, correctCount) {
  const box = document.getElementById("feedback-box");
  const overlay = document.getElementById("feedback-overlay");

  const avgTime = Math.round(timeSpent / 10);

  let scoreColor = '';
  if (correctCount >= 9) scoreColor = 'green-bright';
  else if (correctCount >= 7) scoreColor = 'green-soft';
  else if (correctCount >= 5) scoreColor = 'yellow';
  else if (correctCount >= 3) scoreColor = 'orange';
  else scoreColor = 'red';

  let avgColor = '';
  if (avgTime < 20) avgColor = 'green-bright';
  else if (avgTime < 40) avgColor = 'green-soft';
  else if (avgTime < 50) avgColor = 'orange';
  else avgColor = 'red';

  const scoreFeedback = {
    "green-bright": "Outstanding work!",
    "green-soft": "Great job!",
    "yellow": "You're getting there!",
    "orange": "Not bad, but there's room for improvement.",
    "red": "Keep trying—you'll get better with practice!"
  };

  const timeAdvice = {
    "green-bright": {
      "green-bright": "You answered quickly and accurately—excellent time management!",
      "green-soft": "Efficient and accurate—well-paced!",
      "orange": "You got a great score—consider if you could go even faster.",
      "red": "Great score! But you could try to answer more quickly next time."
    },
    "green-soft": {
      "green-bright": "Impressive speed—keep it balanced with accuracy!",
      "green-soft": "You’re pacing well overall.",
      "orange": "Try to streamline a bit—you're accurate but can be quicker.",
      "red": "You performed well—consider answering a bit faster next time."
    },
    "yellow": {
      "green-bright": "You're fast—now focus more on accuracy.",
      "green-soft": "Decent timing—aim to boost your accuracy.",
      "orange": "You're on the right track—balance time and accuracy.",
      "red": "Consider spending a bit more time thinking through the questions."
    },
    "orange": {
      "green-bright": "You're rushing a bit—try to slow down and focus.",
      "green-soft": "You're fast, but focus more on comprehension.",
      "orange": "Balance is key—review questions a little more carefully.",
      "red": "Don't worry—try to slow down and aim for better accuracy."
    },
    "red": {
      "green-bright": "You rushed through—slow down to improve accuracy.",
      "green-soft": "Speed isn’t everything—take more time next round.",
      "orange": "Take your time to read more carefully.",
      "red": "It’s okay to go slow—accuracy comes first. Stay calm and try again!"
    }
  };

  const feedbackHTML = `
    <p class="feedback-line">
      <span class="${scoreColor}">${scoreFeedback[scoreColor]}</span>
      <span class="${avgColor}"> ${timeAdvice[scoreColor][avgColor]}</span>
    </p>
  `;

  box.innerHTML = `
    <button id="close-feedback" class="feedback-close-btn" aria-label="Close">&times;</button>
    <div class="feedback-header">
      <h3>Summary</h3>
    </div>
    <div class="button-group">
      <p><strong>🎯 Score:</strong> <span class="${scoreColor}">${correctCount} / 10</span></p>
      <p><strong>⏱️ Avg Time:</strong> <span class="${avgColor}">${avgTime}s per question</span></p>
      ${feedbackHTML}
      <div class="feedback-buttons">
        <a href="tests.html" class="category-btn">🚪Exit Category</a>
        <button id="review-btn" class="category-btn">👁️View Explanations</button>
      </div>
    </div>
  `;

document.getElementById('close-feedback').addEventListener('click', () => {
  // Prepare to animate
  box.classList.remove('modal-animate'); // remove previous entrance
  box.classList.add('modal-exit');       // trigger exit animation

  overlay.style.opacity = '0';           // optional: fade overlay too

  // Wait for exit animation to finish before hiding
  setTimeout(() => {
    box.style.display = 'none';
    overlay.style.display = 'none';
    overlay.style.opacity = ''; // reset for next time
    document.body.classList.remove('modal-active');
    box.classList.remove('modal-exit'); // reset for next round
  }, 300); // match CSS duration
});

  //Modal Entrance Animation
  box.classList.remove('modal-animate');
  void box.offsetWidth;
  box.classList.add('modal-animate');

  box.style.display = 'block';
  overlay.style.display = 'block';
  document.body.classList.add('modal-active');

  document.getElementById('review-btn').addEventListener('click', () => {
    box.classList.remove('modal-animate');
    box.classList.add('modal-exit');
    overlay.style.opacity = '0';

    setTimeout(() => {
      box.style.display = 'none';
      overlay.style.display = 'none';
      overlay.style.opacity = '';
      document.body.classList.remove('modal-active');
      box.classList.remove('modal-exit');
      
      // Scroll after modal is closed
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200); // Match the faster duration below
  });

}

// PHASE 6 — Submit Logic (transforms to Summary)
const submitBtn = document.getElementById('submit-btn');
let quizSubmitted = false;

submitBtn.addEventListener('click', () => {
  const box = document.getElementById('feedback-box');
  const overlay = document.getElementById('feedback-overlay');
  const categoryBtn = document.getElementById('category-btn');

  if (!quizSubmitted) {
    // First time: submit quiz
    clearInterval(timerInterval);
    evaluateAnswers();
    lockQuizForm();
    quizSubmitted = true;

    // Change Submit to Summary
    submitBtn.textContent = '📝 Open Summary';
    submitBtn.classList.add('summary-mode');
    submitBtn.disabled = false;
    submitBtn.classList.remove('hidden');
    // ✅ Unhide Exit Category button
    categoryBtn.classList.remove('hidden');
    
    // Show modal immediately
    box.classList.remove('modal-exit');
    box.classList.add('modal-animate');
    box.style.display = 'block';
    overlay.style.display = 'block';
    document.body.classList.add('modal-active');

  } else {
    // Clicking again opens the modal again
    box.classList.remove('modal-exit');
    box.classList.add('modal-animate');
    box.style.display = 'block';
    overlay.style.display = 'block';
    document.body.classList.add('modal-active');
  }
});
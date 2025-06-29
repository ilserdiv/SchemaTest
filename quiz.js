// quiz.js

const CATEGORY_TITLES = {
  'eng-vocabulary': 'Vocabulary',
  'eng-word-analogy': 'Word Analogy',
  'eng-grammar': 'Grammar',
  'eng-sequence': 'Sequence',
  'eng-logical-fallacies': 'Logical Fallacies',
  'eng-assumptions-conclusions': 'Assumption & Conclusion'
};

document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('start-btn');
  const submitBtn = document.getElementById('submit-btn');
  const quizForm = document.getElementById('quiz-form');
  const questionsWrapper = document.getElementById('questions-wrapper');
  const timerDisplay = document.getElementById('timer');
  const titleEl = document.getElementById('quiz-title');

  const CATEGORIES = [
    'eng-logical-fallacies', 'eng-grammar', 'eng-vocabulary',
    'eng-word-analogy', 'eng-sequence', 'eng-assumptions-conclusions'
  ];

  const LEVELS = ['common', 'student', 'professional', 'advanced'];

  const category = localStorage.getItem('quizCategory') || 'eng-word-analogy';
  const readableTitle = CATEGORY_TITLES[category] || 'Quiz';
  if (titleEl) titleEl.textContent = readableTitle;

  startBtn.addEventListener('click', async () => {
    startBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');

    const questions = [];

    for (let i = 0; i < 10; i++) {
      const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
      const url = `questions/${category}/${randomLevel}.json`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const allSubtypes = data.map(entry => entry.subtype);
        const subtypeMap = Object.fromEntries(
          data.map(entry => [entry.subtype, entry.pairs])
        );

        const subtype = allSubtypes[Math.floor(Math.random() * allSubtypes.length)];
        const questionPairs = subtypeMap[subtype];

        const questionPair = questionPairs[Math.floor(Math.random() * questionPairs.length)];

        let correctPair;
        do {
          correctPair = questionPairs[Math.floor(Math.random() * questionPairs.length)];
        } while (
          correctPair.A === questionPair.A && correctPair.B === questionPair.B
        );

        const wrongChoices = [];
        const otherSubtypes = allSubtypes.filter(s => s !== subtype);

        while (wrongChoices.length < 3) {
          const randSubtype = otherSubtypes[Math.floor(Math.random() * otherSubtypes.length)];
          const pairList = subtypeMap[randSubtype];
          const randPair = pairList[Math.floor(Math.random() * pairList.length)];
          const formatted = `${randPair.A} : ${randPair.B}`;

          if (!wrongChoices.includes(formatted)) {
            wrongChoices.push(formatted);
          }
        }

        const reverse = Math.random() < 0.5;
        const qA = reverse ? questionPair.B : questionPair.A;
        const qB = reverse ? questionPair.A : questionPair.B;
        const correctFormatted = reverse ? `${correctPair.B} : ${correctPair.A}` : `${correctPair.A} : ${correctPair.B}`;
        const allChoices = [...wrongChoices, correctFormatted].sort(() => Math.random() - 0.5);

        questions.push({
          display: `${qA} : ${qB} :: ? : ?`,
          choices: allChoices,
          correct: correctFormatted,
          name: `question-${i}`
        });

      } catch (err) {
        console.error(`Failed to load question ${i + 1} from ${url}:`, err);
      }
    }

    renderQuestions(questions);
    startTimer();
  });

  function renderQuestions(questions) {
    questionsWrapper.innerHTML = '';

    questions.forEach((q, index) => {
      const qDiv = document.createElement('div');
      qDiv.classList.add('question');

      const qText = document.createElement('p');
      qText.textContent = `${index + 1}. ${q.display}`;
      qDiv.appendChild(qText);

      q.choices.forEach((choice, cIndex) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = q.name;
        input.value = choice;
        label.appendChild(input);
        label.append(` ${String.fromCharCode(65 + cIndex)}. ${choice}`);
        qDiv.appendChild(label);
      });

      questionsWrapper.appendChild(qDiv);
    });
  }

  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearInterval(timerInterval);
    alert('Quiz submitted! (Scoring logic coming soon)');
  });
});

let timerInterval;
let totalTime = 10 * 60;

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    totalTime--;
    if (totalTime <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
  const seconds = (totalTime % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds}`;
}

function submitQuiz() {
  document.getElementById('quiz-form').requestSubmit();
}
const CATEGORY_TITLES = {
  'eng-vocabulary': 'Vocabulary',
  'eng-word-analogy': 'Word Analogy',
  'eng-grammar': 'Grammar',
  'eng-sequence': 'Sequence',
  'eng-logical-fallacies': 'Logical Fallacies',
  'eng-assumptions-conclusions': 'Assumption & Conclusion'
};

const EXPLANATIONS = {
  'Antonym': (a, b) => `${a} and ${b} are antonyms`,
  'Synonym': (a, b) => `${a} and ${b} are synonyms`,
  'Category to Member': (a, b) => `${b} belongs in the category, ${a}`,
  'Cause and Effect': (a, b) => `${a} and ${b} has a cause-and-effect relationship`,
  'Function or Use': (a, b) => `${a} is used to ${b}`,
  'Part to Whole': (a, b) => `${a} is a part of ${b}`,
  'Degree or Sequence': (a, b) => `${a} and ${b} has a degree/sequence relationship`,
  'Collective Noun': (a, b) => `A group of ${b} is called ${a}`,
  'Location or Setting': (a, b) => `${b} can be found in a ${a}`,
  'Profession to Object': (a, b) => `${a} is associated with the ${b}`
};

let timerInterval;
let totalTime = 10 * 60;
let quizData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('start-btn');
  const submitBtn = document.getElementById('submit-btn');
  const quizForm = document.getElementById('quiz-form');
  const questionsWrapper = document.getElementById('questions-wrapper');
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
        const subtypeMap = Object.fromEntries(
          data.map(entry => [entry.subtype, entry.pairs])
        );

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
          display: `${qA} : ${qB} :: ? : ?`,
          questionWords: [qA, qB],
          correct: correctFormatted,
          correctSubtype: subtype,
          choices: allChoices,
          name: `question-${i}`
        });

      } catch (err) {
        console.error(`Failed to load question ${i + 1} from ${url}:`, err);
      }
    }

    renderQuestions();
    startTimer();
  });

  function renderQuestions() {
    questionsWrapper.innerHTML = '';

    quizData.forEach((q, index) => {
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
        input.value = choice.pair;
        input.setAttribute('data-subtype', choice.subtype);
        label.appendChild(input);
        label.append(` ${String.fromCharCode(65 + cIndex)}. ${choice.pair}`);
        qDiv.appendChild(label);
      });

      questionsWrapper.appendChild(qDiv);
    });
  }

  document.getElementById('submit-btn').addEventListener('click', () => {
    submitQuiz();
  });

  document.getElementById('quiz-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearInterval(timerInterval);
    evaluateAnswers();
    lockQuizForm();
  });
});

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

function evaluateAnswers() {
  quizData.forEach((question, index) => {
    const selected = document.querySelector(`input[name="${question.name}"]:checked`);
    const qDiv = document.querySelectorAll('.question')[index];
    const labels = qDiv.querySelectorAll('label');

    labels.forEach(label => {
      const input = label.querySelector('input');
      if (input.value === question.correct) {
        input.parentElement.classList.add('correct');
      }
    });

    if (!selected) return;

    const userValue = selected.value;
    const userSubtype = selected.getAttribute('data-subtype');

    const [a, b] = question.questionWords;
    const [c, d] = userValue.split(' : ');
    const explain1 = EXPLANATIONS[question.correctSubtype](a, b);
    const explain2 = EXPLANATIONS[userSubtype](c, d);

    const box = document.createElement('div');
    box.classList.add('explanation-box');

    const exp1 = document.createElement('p');
    exp1.textContent = `Reference: ${explain1}`;
    exp1.classList.add('explanation-line');

    const isCorrect = userValue === question.correct;
    const typeLine = document.createElement('p');
    typeLine.textContent = `Analogy: "${question.correctSubtype}" : "${userSubtype}"`;
    typeLine.classList.add('analogy-line', isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
      const fail = [...labels].find(label => label.querySelector('input').value === userValue);
      fail.querySelector('input').parentElement.classList.add('wrong');

      const yourAns = document.createElement('p');
      yourAns.textContent = `Your answer: ${explain2}`;
      yourAns.classList.add('answer-line');
      box.append(exp1, yourAns, typeLine);
    } else {
      box.append(exp1, typeLine);
    }

    qDiv.appendChild(box);
  });
}
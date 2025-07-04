// generator.js for word-analogy

const EXPLANATIONS = {
  'Antonyms': (a, b) => `${a} and ${b} have opposite meanings.`,
  'Synonyms': (a, b) => `${a} and ${b} have similar meanings.`,
  'Cause and Effect': (a, b) => `${a} causes ${b}.`,
  'Function or Use': (a, b) => `${a} is used to ${b}.`,
  'Part to Whole': (a, b) => `${a} is a part of a ${b}.`,
  'Degree or Sequence': (a, b) => `${a} comes before ${b} in progression.`,
  'Location or Setting': (a, b) => `${b} can be found in a ${a}.`,
  'Profession to Object': (a, b) => `${a} is associated with ${b}.`,
  'Category to Member': (a, b) => `${b} belongs in the category, ${a}.`,
  'Collective Noun': (a, b) => `A group of ${b} is called a ${a}.`
};

const LEVEL_FILES = [
  "level-1.json", "level-1.json", "level-1.json",
  "level-3.json", "level-3.json",
  "level-2.json", "level-2.json", "level-2.json",
  "level-4.json", "level-4.json"
];

async function fetchLevelData(levelFile) {
  const response = await fetch(`../../data/analytical-competency/word-analogy/${levelFile}`);
  const rawData = await response.json();

  // Flatten grouped structure into individual items
  const allItems = [];
  rawData.forEach(group => {
    group.pairs.forEach(pair => {
      allItems.push({
        pair,
        type: group.type
      });
    });
  });

  return allItems;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function maybeReverse(pair) {
  return Math.random() < 0.5 ? [pair[1], pair[0]] : [pair[0], pair[1]];
}

async function generateQuiz() {
  const quiz = [];

  for (let i = 0; i < 10; i++) {
    const levelData = await fetchLevelData(LEVEL_FILES[i]);
    const allItems = shuffleArray(levelData);

    const correctItem = allItems[0];
    const choicesPool = allItems.slice(1);
    const correctOrder = maybeReverse(correctItem.pair);

    const choices = [
      {
        pair: correctOrder,
        type: correctItem.type,
        explanation: EXPLANATIONS[correctItem.type](...correctOrder),
        correct: true
      }
    ];

    while (choices.length < 4 && choicesPool.length) {
      const distractor = choicesPool.shift();
      const pair = maybeReverse(distractor.pair);
      choices.push({
        pair,
        type: distractor.type,
        explanation: EXPLANATIONS[distractor.type](...pair),
        correct: distractor.type === correctItem.type
      });
    }

    shuffleArray(choices);

    quiz.push({
      question: correctOrder,
      type: correctItem.type,
      choices
    });
  }

  return quiz;
}

export { generateQuiz };
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
  "level-1.json", "level-1.json", "level-1.json", "level-3.json",
  "level-3.json", "level-2.json", "level-2.json", "level-2.json",
  "level-4.json", "level-4.json"
];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function applyReversal(pair, reversed) {
  return reversed ? [pair[1], pair[0]] : [pair[0], pair[1]];
}

async function fetchLevelData(levelFile) {
  const res = await fetch(`../../data/analytical-competency/word-analogy/${levelFile}`);
  const data = await res.json();
  const allPairs = [];

  data.forEach(group => {
    group.pairs.forEach(pair => {
      allPairs.push({ pair, type: group.type });
    });
  });

  return allPairs;
}

async function generateQuiz() {
  const quiz = [];

  for (let i = 0; i < 10; i++) {
    const levelData = await fetchLevelData(LEVEL_FILES[i]);
    shuffleArray(levelData);

    // Group by type
    const typeMap = {};
    levelData.forEach(item => {
      if (!typeMap[item.type]) typeMap[item.type] = [];
      typeMap[item.type].push(item.pair);
    });

    // Get a type with at least 2 pairs
    let mainType, mainPairs;
    const availableTypes = Object.keys(typeMap).filter(type => typeMap[type].length >= 2);
    if (availableTypes.length === 0) continue;

    mainType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    mainPairs = shuffleArray(typeMap[mainType]);

    const questionPair = mainPairs[0];
    const correctPair = mainPairs[1];

    const reversed = Math.random() < 0.5;
    const question = applyReversal(questionPair, reversed);
    const correctAnswer = applyReversal(correctPair, reversed);

    // Collect distractors from other types
    const distractors = [];
    for (const type of Object.keys(typeMap)) {
      if (type === mainType) continue;
      const pool = shuffleArray(typeMap[type]);
      for (const pair of pool) {
        distractors.push({
          pair: applyReversal(pair, reversed),
          type,
          correct: false,
          explanation: EXPLANATIONS[type](...applyReversal(pair, reversed))
        });
        if (distractors.length === 3) break;
      }
      if (distractors.length === 3) break;
    }

    // Add correct choice
    const choices = [
      {
        pair: correctAnswer,
        type: mainType,
        correct: true,
        explanation: EXPLANATIONS[mainType](...correctAnswer)
      },
      ...distractors
    ];

    shuffleArray(choices);

    quiz.push({
      question,
      type: mainType,
      choices
    });
  }

  return quiz;
}

export { generateQuiz };
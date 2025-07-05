// === Explanation templates by analogy type ===
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

// === All supported analogy types ===
const ALL_TYPES = [
  "Antonyms", "Synonyms", "Category to Member", "Cause and Effect",
  "Function or Use", "Part to Whole", "Degree or Sequence",
  "Collective Noun", "Location or Setting", "Profession to Object"
];

// === Blueprint of how many items to take from which level ===
const LEVEL_PLAN = [
  { level: "level-1.json", count: 3 },
  { level: "level-3.json", count: 2 },
  { level: "level-2.json", count: 3 },
  { level: "level-4.json", count: 2 }
];

// === Fisher-Yates shuffle algorithm for randomizing arrays ===
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// === Reverses the order of a pair if `reversed` is true ===
function applyReversal(pair, reversed) {
  return reversed ? [pair[1], pair[0]] : [pair[0], pair[1]];
}

// === Loads all pair data from a level file (e.g., level-1.json) and flattens it ===
async function fetchLevelData(levelFile) {
  const res = await fetch(`../../data/analytical-competency/word-analogy/${levelFile}`);
  const data = await res.json();
  const flat = [];
  data.forEach(group => {
    group.pairs.forEach(pair => {
      flat.push({ pair, type: group.type });
    });
  });
  return flat;
}

// === Main function to generate 10 analogy quiz items ===
async function generateQuiz() {
  const quiz = [];

  // Randomize the types so each quiz has different combinations
  const typesPool = shuffleArray([...ALL_TYPES]);

  // Go through each level plan and generate questions
  for (const { level, count } of LEVEL_PLAN) {
    const levelData = await fetchLevelData(level);

    // Group all pairs by type
    const typeMap = {};
    levelData.forEach(item => {
      if (!typeMap[item.type]) typeMap[item.type] = [];
      typeMap[item.type].push(item.pair);
    });

    // For each required item in this level
    for (let i = 0; i < count; i++) {
      const type = typesPool.pop();
      const pairs = typeMap[type];

      // Skip if there aren't at least 2 pairs of the selected type
      if (!pairs || pairs.length < 2) continue;

      const reversed = Math.random() < 0.5; // randomize order
      const shuffledPairs = shuffleArray([...pairs]);

      const question = applyReversal(shuffledPairs[0], reversed);
      const correct = applyReversal(shuffledPairs[1], reversed);

      // === Build 3 distractor choices from other types ===
      const distractors = [];
      for (const [otherType, pool] of Object.entries(typeMap)) {
        if (otherType === type) continue;
        for (const pair of shuffleArray(pool)) {
          distractors.push({
            pair: applyReversal(pair, reversed),
            type: otherType,
            correct: false,
            explanation: EXPLANATIONS[otherType](...applyReversal(pair, reversed))
          });
          if (distractors.length === 3) break;
        }
        if (distractors.length === 3) break;
      }

      // === Add correct choice ===
      const choices = [
        {
          pair: correct,
          type,
          correct: true,
          explanation: EXPLANATIONS[type](...correct)
        },
        ...distractors
      ];

      shuffleArray(choices); // randomize choice order

      // === Push complete quiz item ===
      quiz.push({
        question,
        type,
        choices
      });
    }
  }

  return quiz;
}

export { generateQuiz };
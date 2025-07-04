const EXPLANATIONS = {
  'Antonyms': (a, b) => `${a} and ${b} have opposite meanings`,
  'Synonyms': (a, b) => `${a} and ${b} have similar meanings`,
  'Cause and Effect': (a, b) => `${a} causes ${b}`,
  'Function or Use': (a, b) => `${a} is used to ${b}`,
  'Part to Whole': (a, b) => `${a} is a part of a ${b}`,
  'Degree or Sequence': (a, b) => `${a} comes before ${b} in progression`,
  'Location or Setting': (a, b) => `${b} can be found in a ${a}`,
  'Profession to Object': (a, b) => `${a} is associated with ${b}`,
  'Category to Member': (a, b) => `${b} belongs in the category, ${a}`,
  'Collective Noun': (a, b) => `A group of ${b} is called a ${a}`,
};
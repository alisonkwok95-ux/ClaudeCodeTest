// Puzzle generator for Spelling Bee game
// Uses the enable1 word list (public domain)

const WORD_LIST_URL =
  'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt';

let cachedWords = null;

async function fetchWordList() {
  if (cachedWords) return cachedWords;
  const response = await fetch(WORD_LIST_URL);
  const text = await response.text();
  cachedWords = text
    .split('\n')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]{4,}$/.test(w));
  return cachedWords;
}

function getUniqueLetters(word) {
  return [...new Set(word.split(''))];
}

function isPangram(word, letters) {
  return letters.every((l) => word.includes(l));
}

function isValidWord(word, centerLetter, letters) {
  if (word.length < 4) return false;
  if (!word.includes(centerLetter)) return false;
  return word.split('').every((ch) => letters.includes(ch));
}

function scoreWord(word, letters) {
  if (word.length === 4) return 1;
  let score = word.length;
  if (isPangram(word, letters)) score += 7;
  return score;
}

export async function generatePuzzle() {
  const words = await fetchWordList();

  // Find all pangrams (words with exactly 7 unique letters)
  const pangrams = words.filter((w) => getUniqueLetters(w).length === 7);

  if (pangrams.length === 0) throw new Error('No pangrams found in word list');

  // Try random pangrams until we find a valid puzzle
  const shuffled = [...pangrams].sort(() => Math.random() - 0.5);

  for (const pangram of shuffled.slice(0, 200)) {
    const letters = getUniqueLetters(pangram); // exactly 7 letters

    // Pick a random center letter
    const centerIdx = Math.floor(Math.random() * 7);
    const centerLetter = letters[centerIdx];

    // Find all valid words
    const validWords = words.filter((w) =>
      isValidWord(w, centerLetter, letters)
    );

    if (validWords.length >= 15) {
      const outerLetters = letters.filter((l) => l !== centerLetter);
      return {
        centerLetter,
        outerLetters,
        allLetters: letters,
        validWords,
        pangrams: validWords.filter((w) => isPangram(w, letters)),
      };
    }
  }

  throw new Error('Could not find a valid puzzle after 200 attempts');
}

export function computeScore(foundWords, allLetters) {
  return foundWords.reduce((sum, w) => sum + scoreWord(w, allLetters), 0);
}

export function computeMaxScore(validWords, allLetters) {
  return validWords.reduce((sum, w) => sum + scoreWord(w, allLetters), 0);
}

export { isPangram, scoreWord };

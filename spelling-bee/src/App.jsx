import { useState, useEffect, useCallback } from 'react';
import Honeycomb from './Honeycomb';
import {
  generatePuzzle,
  computeScore,
  computeMaxScore,
  isPangram,
} from './puzzleGenerator';

const RANKS = [
  { label: 'Beginner', pct: 0 },
  { label: 'Good Start', pct: 2 },
  { label: 'Moving Up', pct: 5 },
  { label: 'Good', pct: 8 },
  { label: 'Solid', pct: 15 },
  { label: 'Nice', pct: 25 },
  { label: 'Great', pct: 40 },
  { label: 'Amazing', pct: 50 },
  { label: 'Genius', pct: 70 },
];

function getRank(score, maxScore) {
  if (maxScore === 0) return 'Beginner';
  const pct = (score / maxScore) * 100;
  let rank = RANKS[0].label;
  for (const r of RANKS) {
    if (pct >= r.pct) rank = r.label;
  }
  return rank;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [outerLetters, setOuterLetters] = useState([]);
  const [input, setInput] = useState('');
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoading(true);
    generatePuzzle()
      .then((p) => {
        setPuzzle(p);
        setOuterLetters(shuffle(p.outerLetters));
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, []);

  const showMessage = useCallback((text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  }, []);

  const submitWord = useCallback(() => {
    if (!puzzle) return;
    const word = input.toLowerCase();
    if (word.length < 4) {
      showMessage('Too short!');
      return;
    }
    if (!word.includes(puzzle.centerLetter)) {
      showMessage(`Missing center letter "${puzzle.centerLetter.toUpperCase()}"`);
      return;
    }
    if (foundWords.includes(word)) {
      showMessage('Already found!');
      return;
    }
    if (!puzzle.validWords.includes(word)) {
      showMessage('Not in word list');
      return;
    }
    const isP = isPangram(word, puzzle.allLetters);
    setFoundWords((prev) => [...prev, word].sort());
    setInput('');
    showMessage(isP ? 'Pangram! +7 bonus!' : 'Nice!', 'success');
  }, [puzzle, input, foundWords, showMessage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!puzzle) return;
      if (e.key === 'Enter') {
        submitWord();
      } else if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const letter = e.key.toLowerCase();
        if (puzzle.allLetters.includes(letter)) {
          setInput((prev) => prev + letter);
        }
      }
    },
    [puzzle, submitWord]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const score = puzzle ? computeScore(foundWords, puzzle.allLetters) : 0;
  const maxScore = puzzle ? computeMaxScore(puzzle.validWords, puzzle.allLetters) : 0;
  const rank = getRank(score, maxScore);
  const rankPct = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐝</div>
          <p className="text-gray-500 text-lg">Generating puzzle...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching word list</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <p className="text-red-500 text-lg mb-4">Failed to load puzzle</p>
          <p className="text-gray-500 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-yellow-400 rounded-full font-semibold hover:bg-yellow-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-6 px-4 font-sans">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
        Spelling Bee
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Center letter required &bull; 4+ letters &bull; Letters can repeat
      </p>

      {/* Score row */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-gray-300 text-lg">/</span>
        <span className="text-gray-400">{maxScore}</span>
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-base font-semibold text-yellow-500">{rank}</span>
        <div className="h-5 w-px bg-gray-200" />
        <span className="text-sm text-gray-400">
          {foundWords.length}&thinsp;/&thinsp;{puzzle.validWords.length} words
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${rankPct}%` }}
        />
      </div>

      {/* Input display */}
      <div className="min-h-[56px] flex items-center justify-center mb-1">
        <div className="text-3xl font-bold tracking-widest border-b-2 border-gray-900 px-4 pb-1 min-w-[160px] text-center">
          {input.length === 0 ? (
            <span className="text-gray-300 text-xl font-normal">Type or click letters</span>
          ) : (
            input.split('').map((ch, i) => (
              <span
                key={i}
                className={
                  ch === puzzle.centerLetter ? 'text-yellow-500' : 'text-gray-900'
                }
              >
                {ch.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Toast message */}
      <div className="h-8 mb-1 flex items-center justify-center">
        {message && (
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-opacity ${
              message.type === 'success'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      {/* Honeycomb */}
      <Honeycomb
        centerLetter={puzzle.centerLetter}
        outerLetters={outerLetters}
        onLetterClick={(letter) => setInput((prev) => prev + letter)}
      />

      {/* Controls */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => setInput((prev) => prev.slice(0, -1))}
          className="px-5 py-2 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-500 active:bg-gray-100 transition-colors select-none"
        >
          Delete
        </button>
        <button
          onClick={() => setOuterLetters((prev) => shuffle(prev))}
          className="px-5 py-2 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-500 active:bg-gray-100 transition-colors select-none"
          title="Shuffle outer letters"
        >
          &#8635; Shuffle
        </button>
        <button
          onClick={submitWord}
          className="px-5 py-2 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors select-none"
        >
          Enter
        </button>
      </div>

      {/* Found words */}
      {foundWords.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">
            Found Words &mdash; {foundWords.length}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {foundWords.map((word) => {
              const isP = isPangram(word, puzzle.allLetters);
              return (
                <span
                  key={word}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isP
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  title={isP ? 'Pangram!' : undefined}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* New puzzle button */}
      <button
        onClick={() => {
          setLoading(true);
          setFoundWords([]);
          setInput('');
          setMessage(null);
          generatePuzzle()
            .then((p) => {
              setPuzzle(p);
              setOuterLetters(shuffle(p.outerLetters));
              setLoading(false);
            })
            .catch((err) => {
              setLoadError(err.message);
              setLoading(false);
            });
        }}
        className="mt-10 text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
      >
        New Puzzle
      </button>
    </div>
  );
}

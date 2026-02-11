import { useState, useEffect } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";
import SubmissionModal from "../components/SubmissionModal";

/* Types */

type Group = {
  name: string;
  words: string[];
};

type Puzzle = {
  date: string;
  words: string[];
  groups: Group[];
  creator?: string; // Optional creator field
};

/* Component */

const Home = () => {
  const todayStr = new Date().toLocaleDateString("en-CA");

  const getPuzzle = (): Puzzle => {
    const exactMatch = connections.find((p) => p.date === todayStr);
    if (exactMatch) return exactMatch;

    const startDate = new Date(connections[0].date);
    const today = new Date(todayStr);
    const daysDiff = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const puzzleIndex = daysDiff % connections.length;

    return connections[puzzleIndex >= 0 ? puzzleIndex : 0];
  };

  const puzzle: Puzzle = getPuzzle();

  const STORAGE_SOLVED = `connections-${puzzle.date}-solved`;
  const STORAGE_WON = `connections-${puzzle.date}-won`;
  const STORAGE_LOST = `connections-${puzzle.date}-lost`;
  const STORAGE_WRONGS = `connections-${puzzle.date}-wrongs`;

  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [animatingGroup, setAnimatingGroup] = useState<string | null>(null);
  const [fadingTiles, setFadingTiles] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);

  /* Utils */

  const shuffleArray = (arr: string[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /* Reset puzzle */

  const resetPuzzle = () => {
    localStorage.removeItem(STORAGE_SOLVED);
    localStorage.removeItem(STORAGE_WON);
    localStorage.removeItem(STORAGE_LOST);
    localStorage.removeItem(STORAGE_WRONGS);

    setSolvedGroups([]);
    setWords(shuffleArray(puzzle.words));
    setSelected([]);
    setWrongAttempts(0);
    setHasWon(false);
    setHasLost(false);
    setShowModal(false);
    setAnimatingGroup(null);
    setFadingTiles([]);
    setShowError(false);
  };

  /* Load saved state */

  useEffect(() => {
    const savedSolved = JSON.parse(
      localStorage.getItem(STORAGE_SOLVED) || "[]",
    ) as string[];

    const solved = puzzle.groups.filter((group) =>
      savedSolved.includes(group.name),
    );

    setSolvedGroups(solved);

    const remainingWords = puzzle.words.filter(
      (word) => !solved.some((g) => g.words.includes(word)),
    );

    setWords(shuffleArray(remainingWords));

    const savedWrongs = localStorage.getItem(STORAGE_WRONGS);
    setWrongAttempts(savedWrongs ? Number(savedWrongs) : 0);

    if (localStorage.getItem(STORAGE_WON) === "true") {
      setHasWon(true);
      setShowModal(true);
    }

    if (localStorage.getItem(STORAGE_LOST) === "true") {
      setHasLost(true);
      setShowModal(true);
      setSolvedGroups(puzzle.groups);
      setWords([]);
    }
  }, [puzzle]);

  /* Timer */

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Tile logic */

  const toggleTile = (word: string) => {
    if (hasWon || hasLost) return;

    if (selected.includes(word)) {
      setSelected((prev) => prev.filter((w) => w !== word));
      return;
    }

    if (selected.length < 4) {
      setSelected((prev) => [...prev, word]);
    }
  };

  /* Guess logic */

  const handleGuess = () => {
    if (selected.length !== 4 || hasWon || hasLost) return;

    const correctGroup = puzzle.groups.find((group) =>
      group.words.every((word) => selected.includes(word)),
    );

    if (!correctGroup) {
      const newWrongs = wrongAttempts + 1;
      setWrongAttempts(newWrongs);
      localStorage.setItem(STORAGE_WRONGS, String(newWrongs));
      setSelected([]);

      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      return;
    }

    setFadingTiles(selected);

    setTimeout(() => {
      const newSolved = [...solvedGroups, correctGroup];
      setSolvedGroups(newSolved);
      setAnimatingGroup(correctGroup.name);

      localStorage.setItem(
        STORAGE_SOLVED,
        JSON.stringify(newSolved.map((g) => g.name)),
      );

      setWords((prev) =>
        prev.filter((word) => !correctGroup.words.includes(word)),
      );

      setFadingTiles([]);
      setSelected([]);

      if (newSolved.length === puzzle.groups.length) {
        setHasWon(true);
        setTimeout(() => setShowModal(true), 600);
        localStorage.setItem(STORAGE_WON, "true");
      }

      setTimeout(() => setAnimatingGroup(null), 600);
    }, 400);
  };

  /* Shuffle */

  const shuffleGrid = () => {
    if (hasWon || hasLost) return;
    setWords(shuffleArray(words));
    setSelected([]);
  };

  /* Surrender */

  const surrender = () => {
    if (hasWon || hasLost) return;

    setHasLost(true);
    setShowModal(true);
    localStorage.setItem(STORAGE_LOST, "true");
    setSolvedGroups(puzzle.groups);
    setWords([]);
  };

  /* Render */

  return (
    <div className={styles.home}>
      <div className={styles.titleCard}>
        <h1 className={styles.brand}>League of Legends</h1>
        <h2 className={styles.title}>Connections</h2>
        <div className={styles.timer}>Next game: {timeLeft}</div>
      </div>

      <div
        className={`${styles.gameContainer} ${showError ? styles.error : ""}`}
      >
        <p className={styles.creator}>
          Puzzle made by: {puzzle.creator || "Anonymous"}
        </p>

        <div className={styles.board}>
          <div className={styles.solvedContainer}>
            {solvedGroups.map((group, index) => (
              <div
                key={group.name}
                className={`${styles.solvedRow} ${styles[`category${index}`]} ${
                  animatingGroup === group.name ? styles.animating : ""
                }`}
              >
                <span className={styles.category}>{group.name}</span>
                <span className={styles.words}>{group.words.join(" • ")}</span>
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {words.map((word) => (
              <div
                key={word}
                className={`${styles.tile} ${
                  selected.includes(word) ? styles.selected : ""
                } ${fadingTiles.includes(word) ? styles.fadeOut : ""}`}
                onClick={() => toggleTile(word)}
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.lives}>
          <span className={styles.livesLabel}>Incorrect:</span>
          <span className={styles.attempts}>{wrongAttempts}</span>
        </div>

        <div className={styles.buttonRow}>
          <button
            className={`${styles.actionButton} ${styles.shuffle}`}
            onClick={shuffleGrid}
            disabled={hasWon || hasLost}
          >
            Shuffle
          </button>

          <button
            className={`${styles.actionButton} ${styles.submit}`}
            onClick={handleGuess}
            disabled={selected.length !== 4 || hasWon || hasLost}
          >
            Submit
          </button>

          <button
            className={`${styles.actionButton} ${styles.surrender}`}
            onClick={surrender}
            disabled={hasWon || hasLost}
          >
            Surrender
          </button>

          {(hasWon || hasLost) && (
            <button
              className={`${styles.actionButton} ${styles.viewResult}`}
              onClick={() => setShowModal(true)}
            >
              View Result
            </button>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={`${styles.modal} ${hasWon ? styles.win : styles.lose}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIcon}>{hasWon ? "🏆" : "💀"}</div>

            <h2 className={styles.modalTitle}>
              {hasWon ? "Victory!" : "Defeat"}
            </h2>

            <p className={styles.modalText}>
              {hasWon ? "You solved all four connections." : "You surrendered."}
            </p>

            <div className={styles.modalButtons}>
              <button
                className={styles.modalButton}
                onClick={() => setShowModal(false)}
              >
                View Board
              </button>

              <button
                className={`${styles.modalButton} ${styles.retry}`}
                onClick={resetPuzzle}
              >
                Retry
              </button>

              <button
                className={`${styles.modalButton} ${styles.submitOwn}`}
                onClick={() => {
                  setShowModal(false);
                  setShowSubmissionForm(true);
                }}
              >
                Submit Puzzle
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionForm && (
        <SubmissionModal onClose={() => setShowSubmissionForm(false)} />
      )}
    </div>
  );
};

export default Home;

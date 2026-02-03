import { useState, useEffect } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

/* Types */

type Group = {
  name: string;
  words: string[];
};

type Puzzle = {
  date: string;
  words: string[];
  groups: Group[];
};

/* Constants */

const MAX_LIVES = 3;

/* Component */

const Home = () => {
  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const puzzle: Puzzle | undefined =
    connections.find((p) => p.date === todayStr) || connections[0]; // fallback

  const STORAGE_SOLVED = `connections-${puzzle.date}-solved`;
  const STORAGE_WON = `connections-${puzzle.date}-won`;
  const STORAGE_LIVES = `connections-${puzzle.date}-lives`;
  const STORAGE_LOST = `connections-${puzzle.date}-lost`;

  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([]);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* Reset puzzle */
  const resetPuzzle = () => {
    // clear storage for today
    localStorage.removeItem(STORAGE_SOLVED);
    localStorage.removeItem(STORAGE_WON);
    localStorage.removeItem(STORAGE_LOST);
    localStorage.removeItem(STORAGE_LIVES);

    // reset state
    setSolvedGroups([]);
    setWords([...puzzle.words]);
    setSelected([]);
    setLives(MAX_LIVES);
    setHasWon(false);
    setHasLost(false);
    setShowModal(false);
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

    setWords(remainingWords);

    const savedLives = localStorage.getItem(STORAGE_LIVES);
    setLives(savedLives ? Number(savedLives) : MAX_LIVES);

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
      const newLives = lives - 1;
      setLives(newLives);
      localStorage.setItem(STORAGE_LIVES, String(newLives));
      setSelected([]);

      if (newLives === 0) {
        setHasLost(true);
        setShowModal(true);
        localStorage.setItem(STORAGE_LOST, "true");

        // reveal all
        setSolvedGroups(puzzle.groups);
        setWords([]);
      }

      return;
    }

    const newSolved = [...solvedGroups, correctGroup];
    setSolvedGroups(newSolved);

    localStorage.setItem(
      STORAGE_SOLVED,
      JSON.stringify(newSolved.map((g) => g.name)),
    );

    setWords((prev) =>
      prev.filter((word) => !correctGroup.words.includes(word)),
    );

    if (newSolved.length === puzzle.groups.length) {
      setHasWon(true);
      setShowModal(true);
      localStorage.setItem(STORAGE_WON, "true");
    }

    setSelected([]);
  };

  /* Shuffle grid */
  const shuffleGrid = () => {
    if (hasWon || hasLost) return;

    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setWords(shuffled);
    setSelected([]);
  };

  /* Render */
  return (
    <div className={styles.home}>
      <div className={styles.titleCard}>
        <h1 className={styles.brand}>League of Legends</h1>
        <h2 className={styles.title}>Connections</h2>
        <div className={styles.timer}>Next game: {timeLeft}</div>
      </div>

      <div className={styles.gameContainer}>
        <div className={styles.board}>
          <div className={styles.solvedContainer}>
            {solvedGroups.map((group, index) => (
              <div
                key={group.name}
                className={`${styles.solvedRow} ${styles[`category${index}`]}`}
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
                }`}
                onClick={() => toggleTile(word)}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.lives}>
          <span className={styles.livesLabel}>Lives:</span>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span
              key={i}
              className={`${styles.heart} ${
                i < lives ? styles.full : styles.empty
              }`}
            >
              ♥
            </span>
          ))}
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
              {hasWon
                ? "You solved all four connections."
                : "You ran out of lives."}
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
                Retry Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

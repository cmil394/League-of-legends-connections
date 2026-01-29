import { useState, useEffect } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

/* ================= TYPES ================= */

type Group = {
  name: string;
  words: string[];
};

type Puzzle = {
  date: string;
  words: string[];
  groups: Group[];
};

/* ================= COMPONENT ================= */

const Home = () => {
  const puzzle: Puzzle = connections[0];

  const [words, setWords] = useState<string[]>([...puzzle.words]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [hasWon, setHasWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);

  /* ================= LOAD WIN STATE ================= */
  useEffect(() => {
    const storedWin = localStorage.getItem("connectionsWon");
    if (storedWin === "true") {
      setHasWon(true);
      setShowWinModal(true);
    }
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= TILE LOGIC ================= */
  const toggleTile = (word: string) => {
    if (hasWon) return;

    if (selected.includes(word)) {
      setSelected((prev) => prev.filter((w) => w !== word));
      return;
    }

    if (selected.length < 4) {
      setSelected((prev) => [...prev, word]);
    }
  };

  /* ================= GUESS LOGIC ================= */
  const handleGuess = () => {
    if (selected.length !== 4 || hasWon) return;

    const correctGroup = puzzle.groups.find((group) =>
      group.words.every((word) => selected.includes(word)),
    );

    if (correctGroup) {
      setSolvedGroups((prev) => [...prev, correctGroup]);

      setWords((prev) =>
        prev.filter((word) => !correctGroup.words.includes(word)),
      );

      if (solvedGroups.length + 1 === puzzle.groups.length) {
        setHasWon(true);
        setShowWinModal(true);
        localStorage.setItem("connectionsWon", "true");
      }
    }

    setSelected([]);
  };

  /* ================= SHUFFLE ================= */
  const shuffleGrid = () => {
    if (hasWon) return;

    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setWords(shuffled);
    setSelected([]);
  };

  /* ================= RENDER ================= */
  return (
    <div className={styles.home}>
      <h1 className={styles.brand}>League of Legends</h1>
      <h2 className={styles.title}>Connections</h2>

      <div className={styles.timer}>Next game: {timeLeft}</div>

      {/* ===== FIXED BOARD ===== */}
      <div className={styles.board}>
        {/* ===== SOLVED GROUPS ===== */}
        <div className={styles.solvedContainer}>
          {solvedGroups.map((group) => (
            <div key={group.name} className={styles.solvedRow}>
              <span className={styles.category}>{group.name}</span>
              <span className={styles.words}>{group.words.join(" • ")}</span>
            </div>
          ))}
        </div>

        {/* ===== GRID ===== */}
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

      {/* ===== BUTTONS ===== */}
      <div className={styles.buttonRow}>
        <button
          className={`${styles.actionButton} ${styles.shuffle}`}
          onClick={shuffleGrid}
          disabled={hasWon}
        >
          Shuffle
        </button>

        <button
          className={`${styles.actionButton} ${styles.submit}`}
          onClick={handleGuess}
          disabled={selected.length !== 4 || hasWon}
        >
          Submit
        </button>
      </div>

      {/* ===== WIN MODAL ===== */}
      {showWinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>You Won! 🎉</h2>
            <p>You solved all four connections.</p>
            <button
              className={styles.modalButton}
              onClick={() => setShowWinModal(false)}
            >
              View Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

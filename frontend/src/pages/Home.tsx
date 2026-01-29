import { useState, useEffect } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

const Home = () => {
  const puzzle = connections[0];

  const [words, setWords] = useState<string[]>([...puzzle.words]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<string[][]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");

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
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
      return;
    }

    if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  };

  /* ================= GUESS LOGIC ================= */
  const handleGuess = () => {
    if (selected.length !== 4) return;

    const correctGroup = puzzle.groups.find((group) =>
      group.words.every((word) => selected.includes(word)),
    );

    if (correctGroup) {
      alert(`Correct! You found: ${correctGroup.name}`);
      setSolvedGroups([...solvedGroups, correctGroup.words]);
    } else {
      alert("Incorrect guess. Try again!");
    }

    setSelected([]);
  };

  /* ================= SHUFFLE ================= */
  const shuffleGrid = () => {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setWords(shuffled);
    setSelected([]);
  };

  const isSolved = (word: string) => solvedGroups.flat().includes(word);

  /* ================= RENDER ================= */
  return (
    <div className={styles.home}>
      <h1 className={styles.brand}>League of Legends</h1>
      <h2 className={styles.title}>Connections</h2>

      <div className={styles.timer}>Next game: {timeLeft}</div>

      <div className={styles.grid}>
        {words.map((word) => (
          <div
            key={word}
            className={`${styles.tile} ${
              selected.includes(word) ? styles.selected : ""
            } ${isSolved(word) ? styles.solved : ""}`}
            onClick={() => !isSolved(word) && toggleTile(word)}
          >
            {word}
          </div>
        ))}
      </div>

      <div className={styles.buttonRow}>
        <button
          className={`${styles.actionButton} ${styles.shuffle}`}
          onClick={shuffleGrid}
        >
          Shuffle
        </button>

        <button
          className={`${styles.actionButton} ${styles.submit}`}
          disabled={selected.length !== 4}
          onClick={handleGuess}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Home;

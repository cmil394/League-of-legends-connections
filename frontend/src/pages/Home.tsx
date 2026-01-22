import { useState, useEffect } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

const Home = () => {
  const puzzle = connections[0];
  const [words, setWords] = useState<string[]>([...puzzle.words]);
  const [selected, setSelected] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");

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

  const toggleTile = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
      return;
    }
    if (selected.length < 4) setSelected([...selected, index]);
  };

  const handleGuess = () => {
    if (selected.length !== 4) return;
    alert("Guess submitted");
    setSelected([]);
  };

  const shuffleGrid = () => {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setWords(shuffled);
    setSelected([]);
  };

  return (
    <div className={styles.home}>
      <h1 className={styles.brand}>League of Legends</h1>
      <h2 className={styles.title}>Connections</h2>

      <div className={styles.timer}>Next game: {timeLeft}</div>

      <div className={styles.grid}>
        {words.map((word, i) => (
          <div
            key={i}
            className={`${styles.tile} ${
              selected.includes(i) ? styles.selected : ""
            }`}
            onClick={() => toggleTile(i)}
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

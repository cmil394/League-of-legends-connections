import { useState } from "react";
import styles from "./CSS/Home.module.css";

const Home = () => {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleTile = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
      return;
    }

    if (selected.length < 4) {
      setSelected([...selected, index]);
    }
  };

  const handleGuess = () => {
    if (selected.length !== 4) return;

    console.log("Guessed tiles:", selected);
  };

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>League of Legends Connections</h1>

      <div className={styles.grid}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.tile} ${
              selected.includes(i) ? styles.selected : ""
            }`}
            onClick={() => toggleTile(i)}
          >
            Placeholder
          </div>
        ))}
      </div>

      <button
        className={styles.guessButton}
        disabled={selected.length !== 4}
        onClick={handleGuess}
      >
        Guess
      </button>
    </div>
  );
};

export default Home;

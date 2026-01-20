import { useState } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

const Home = () => {
  const puzzle = connections[0];
  const [words, setWords] = useState<string[]>([...puzzle.words]);
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
    const selectedOriginalIndexes = selected.map((i) =>
      puzzle.words.indexOf(words[i]),
    );

    const match = puzzle.solution.find(
      (group) =>
        group.indexes.every((idx) => selectedOriginalIndexes.includes(idx)) &&
        selectedOriginalIndexes.every((idx) => group.indexes.includes(idx)),
    );

    if (match) {
      alert(`Correct! This group is: ${match.name}`);
    } else {
      alert("Wrong guess. Try again!");
    }

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
      <h1 className={styles.title}>League of Legends Connections</h1>

      <button className={styles.shuffleButton} onClick={shuffleGrid}>
        Shuffle Grid
      </button>

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

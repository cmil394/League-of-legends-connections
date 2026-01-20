import { useState } from "react";
import styles from "./CSS/Home.module.css";
import connections from "../../../connections.json";

const Home = () => {
  const puzzle = connections[0];
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
    const match = puzzle.solution.find(
      (group) =>
        group.indexes.every((idx) => selected.includes(idx)) &&
        selected.every((idx) => group.indexes.includes(idx)),
    );

    if (match) {
      alert(`Correct! This group is: ${match.name}`);
    } else {
      alert("Wrong guess. Try again!");
    }

    setSelected([]);
  };

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>League of Legends Connections</h1>

      <div className={styles.grid}>
        {puzzle.words.map((word, i) => (
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

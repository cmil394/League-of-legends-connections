import styles from "./CSS/Home.module.css";

function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.homeCard}>
        <h1 className={styles.title}>League of Legends Connections</h1>

        <p className={styles.subtitle}>
          Test your knowledge by finding the hidden connections between
          champions, items, regions, and lore.
        </p>

        <div className={styles.buttons}>
          <button className={styles.primary}>Start Game</button>
          <button className={styles.secondary}>How to Play</button>
        </div>

        <p className={styles.footer}>
          Inspired by Connections • Powered by League lore
        </p>
      </div>
    </div>
  );
}

export default Home;

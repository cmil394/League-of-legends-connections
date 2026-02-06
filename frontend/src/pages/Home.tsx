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

type SubmissionGroup = {
  category: string;
  words: [string, string, string, string];
};

/* Component */

const Home = () => {
  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const puzzle: Puzzle =
    connections.find((p) => p.date === todayStr) || connections[0];

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

  // Submission form state
  const [submitterName, setSubmitterName] = useState("");
  const [submissionGroups, setSubmissionGroups] = useState<SubmissionGroup[]>([
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
  ]);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

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

  const shuffleArray = (arr: string[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

      // Trigger error animation
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 500);

      return;
    }

    // Start tile fade animation
    setFadingTiles(selected);

    // Wait for tiles to fade, then add the solved group
    setTimeout(() => {
      const newSolved = [...solvedGroups, correctGroup];
      setSolvedGroups(newSolved);

      // Trigger the row animation
      setAnimatingGroup(correctGroup.name);

      localStorage.setItem(
        STORAGE_SOLVED,
        JSON.stringify(newSolved.map((g) => g.name)),
      );

      setWords((prev) =>
        prev.filter((word) => !correctGroup.words.includes(word)),
      );

      setFadingTiles([]);

      if (newSolved.length === puzzle.groups.length) {
        setHasWon(true);
        setTimeout(() => setShowModal(true), 600);
        localStorage.setItem(STORAGE_WON, "true");
      }

      setSelected([]);

      // Clear animation class after animation completes
      setTimeout(() => {
        setAnimatingGroup(null);
      }, 600);
    }, 400);
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

  /* Surrender */
  const surrender = () => {
    if (hasWon || hasLost) return;

    setHasLost(true);
    setShowModal(true);
    localStorage.setItem(STORAGE_LOST, "true");

    setSolvedGroups(puzzle.groups);
    setWords([]);
  };

  /* Submission form handlers */
  const openSubmissionForm = () => {
    setShowModal(false);
    setShowSubmissionForm(true);
    setSubmitStatus("idle");
  };

  const updateGroupCategory = (index: number, value: string) => {
    const updated = [...submissionGroups];
    updated[index].category = value;
    setSubmissionGroups(updated);
  };

  const updateGroupWord = (
    groupIndex: number,
    wordIndex: number,
    value: string,
  ) => {
    const updated = [...submissionGroups];
    updated[groupIndex].words[wordIndex] = value;
    setSubmissionGroups(updated);
  };

  const handleSubmitPuzzle = async () => {
    // Basic validation
    if (!submitterName.trim()) {
      alert("Please enter your username");
      return;
    }

    for (let i = 0; i < submissionGroups.length; i++) {
      const group = submissionGroups[i];
      if (!group.category.trim()) {
        alert(`Please enter a category for group ${i + 1}`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!group.words[j].trim()) {
          alert(`Please fill in all words for group ${i + 1}`);
          return;
        }
      }
    }

    setSubmitStatus("submitting");

    try {
      const response = await fetch("http://localhost:3001/api/submit-puzzle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submitter: submitterName,
          groups: submissionGroups,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          setShowSubmissionForm(false);
          // Reset form
          setSubmitterName("");
          setSubmissionGroups([
            { category: "", words: ["", "", "", ""] },
            { category: "", words: ["", "", "", ""] },
            { category: "", words: ["", "", "", ""] },
            { category: "", words: ["", "", "", ""] },
          ]);
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    }
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
                onClick={openSubmissionForm}
              >
                Submit Your Own
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSubmissionForm(false)}
        >
          <div
            className={`${styles.submissionModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.submissionTitle}>Submit Your Puzzle</h2>

            {submitStatus === "success" ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <p>Puzzle submitted successfully!</p>
              </div>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Your Username</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>

                {submissionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={styles.groupSection}>
                    <h3 className={styles.groupTitle}>
                      Group {groupIndex + 1}
                    </h3>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Category</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={group.category}
                        onChange={(e) =>
                          updateGroupCategory(groupIndex, e.target.value)
                        }
                        placeholder="e.g., Champions with Dashes"
                      />
                    </div>

                    <div className={styles.wordsGrid}>
                      {group.words.map((word, wordIndex) => (
                        <input
                          key={wordIndex}
                          type="text"
                          className={styles.wordInput}
                          value={word}
                          onChange={(e) =>
                            updateGroupWord(
                              groupIndex,
                              wordIndex,
                              e.target.value,
                            )
                          }
                          placeholder={`Word ${wordIndex + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {submitStatus === "error" && (
                  <p className={styles.errorMessage}>
                    Failed to submit. Please try again.
                  </p>
                )}

                <div className={styles.submissionButtons}>
                  <button
                    className={`${styles.modalButton}`}
                    onClick={() => setShowSubmissionForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className={`${styles.modalButton} ${styles.submitBtn}`}
                    onClick={handleSubmitPuzzle}
                    disabled={submitStatus === "submitting"}
                  >
                    {submitStatus === "submitting"
                      ? "Submitting..."
                      : "Submit Puzzle"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

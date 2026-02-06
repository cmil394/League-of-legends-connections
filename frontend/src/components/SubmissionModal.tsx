import { useState } from "react";
import styles from "../pages/CSS/Submission.module.css";

type SubmissionGroup = {
  category: string;
  words: [string, string, string, string];
};

type Props = {
  onClose: () => void;
};

const SubmissionModal = ({ onClose }: Props) => {
  const [submitterName, setSubmitterName] = useState("");
  const [submissionGroups, setSubmissionGroups] = useState<SubmissionGroup[]>([
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
    { category: "", words: ["", "", "", ""] },
  ]);

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const updateCategory = (index: number, value: string) => {
    const updated = [...submissionGroups];
    updated[index].category = value;
    setSubmissionGroups(updated);
  };

  const updateWord = (groupIndex: number, wordIndex: number, value: string) => {
    const updated = [...submissionGroups];
    updated[groupIndex].words[wordIndex] = value;
    setSubmissionGroups(updated);
  };

  const handleSubmit = async () => {
    if (!submitterName.trim()) {
      alert("Please enter your username");
      return;
    }

    for (let i = 0; i < submissionGroups.length; i++) {
      const g = submissionGroups[i];
      if (!g.category.trim() || g.words.some((w) => !w.trim())) {
        alert(`Please complete group ${i + 1}`);
        return;
      }
    }

    setStatus("submitting");

    try {
      const res = await fetch("http://localhost:3001/api/submit-puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitter: submitterName,
          groups: submissionGroups,
        }),
      });

      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Submit Your Puzzle</h2>

        {status === "success" ? (
          <div className={styles.success}>
            <div className={styles.check}>✓</div>
            <p>Puzzle submitted successfully!</p>
          </div>
        ) : (
          <>
            <div className={styles.formGroup}>
              <label>Your Username</label>
              <input
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            {submissionGroups.map((group, gi) => (
              <div key={gi} className={styles.group}>
                <h3>Group {gi + 1}</h3>

                <input
                  placeholder="Category"
                  value={group.category}
                  onChange={(e) => updateCategory(gi, e.target.value)}
                />

                <div className={styles.words}>
                  {group.words.map((word, wi) => (
                    <input
                      key={wi}
                      placeholder={`Word ${wi + 1}`}
                      value={word}
                      onChange={(e) => updateWord(gi, wi, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {status === "error" && (
              <p className={styles.error}>Submission failed.</p>
            )}

            <div className={styles.buttons}>
              <button onClick={onClose}>Cancel</button>
              <button onClick={handleSubmit} disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmissionModal;

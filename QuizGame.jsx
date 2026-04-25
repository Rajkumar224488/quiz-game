import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function QuizGame() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error("Failed to fetch quiz questions.");
      }
      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers(new Array((data.questions || []).length).fill(null));
      setCurrentIndex(0);
      setSelected(null);
      setShowResult(false);
      setResult(null);
    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    setSelected(option);
  };

  const handleNext = async () => {
    if (!questions.length || selected === null) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = selected;
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelected(updatedAnswers[nextIndex]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: updatedAnswers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answers.");
      }

      const data = await response.json();
      setResult(data);
      setShowResult(true);
    } catch (err) {
      setError(err.message || "Could not submit quiz.");
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setSelected(null);
    setShowResult(false);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <section className="quiz-shell">
          <p className="quiz-kicker">React Quiz</p>
          <h2 className="quiz-title">Loading questions...</h2>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <section className="quiz-shell">
          <p className="quiz-kicker">Connection Issue</p>
          <h2 className="quiz-title">Quiz Error</h2>
          <p className="quiz-subtitle">{error}</p>
          <button className="quiz-next" onClick={loadQuestions}>
            Retry
          </button>
        </section>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="quiz-page">
        <section className="quiz-shell">
          <p className="quiz-kicker">React Quiz</p>
          <h2 className="quiz-title">No questions found.</h2>
        </section>
      </div>
    );
  }

  if (showResult) {
    const score = result?.score ?? 0;
    const total = result?.total ?? questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="quiz-page">
        <section className="quiz-shell quiz-shell-result">
          <p className="quiz-kicker">Completed</p>
          <h2 className="quiz-title">Quiz Finished</h2>
          <p className="quiz-subtitle">
            Score: <strong>{score}</strong> / <strong>{total}</strong> ({percentage}%)
          </p>
          <button className="quiz-next" onClick={restartQuiz}>
            Play Again
          </button>
        </section>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-page">
      <section className="quiz-shell">
        <header className="quiz-header">
          <div>
            <p className="quiz-kicker">React Quiz</p>
            <h2 className="quiz-title">Question {currentIndex + 1}</h2>
            <p className="quiz-subtitle">
              {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <span className="quiz-counter">{currentIndex + 1}/{questions.length}</span>
        </header>

        <div className="quiz-progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <h3 className="quiz-question">{currentQuestion.question}</h3>

        <div className="quiz-options">
        {currentQuestion.options.map((option) => {
          const isSelected = option === selected;

          return (
            <button
              key={option}
              className={`quiz-option ${isSelected ? "is-selected" : ""}`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          );
        })}
        </div>

        <button className="quiz-next" onClick={handleNext} disabled={selected === null}>
          {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </section>
    </div>
  );
}

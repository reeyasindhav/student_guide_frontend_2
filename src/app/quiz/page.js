"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateQuiz } from "@/services/quizApi";
import QuizCard from "@/components/QuizCard";

/* ---------- helper functions (same as your original) ---------- */

function normalizeText(s) {
  if (!s) return "";
  return s
    .toString()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D"]/g, '"')
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(a|an|the|is|are|was|were|this|that)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(a, b) {
  const as = new Set(a.split(" ").filter(Boolean));
  const bs = new Set(b.split(" ").filter(Boolean));
  const inter = new Set([...as].filter(x => bs.has(x)));
  const union = new Set([...as, ...bs]);
  if (union.size === 0) return 0;
  return inter.size / union.size;
}

function compareAnswers(userAnsRaw, correctRaw, type) {
  const user = (userAnsRaw ?? "").toString().trim();
  const correct = correctRaw;

  if (type === "mcq") {
    const userLetter = user.toUpperCase().replace(/\./g, "").trim();
    const correctLetter =
      typeof correct === "string" && /^[A-E]$/i.test(correct.trim())
        ? correct.trim().toUpperCase()
        : null;

    if (userLetter && correctLetter) {
      return {
        correct: userLetter === correctLetter,
        confidence: 1.0,
        points: userLetter === correctLetter ? 1 : 0,
      };
    }

    if (normalizeText(user) === normalizeText(correct)) {
      return { correct: true, confidence: 1.0, points: 1 };
    }

    return { correct: false, confidence: 0.0, points: 0 };
  }

  if (type === "assertion_reason") {
    const u = normalizeText(user);
    const c = normalizeText(correct);
    const sim = jaccardSimilarity(u, c);
    return { correct: sim > 0.6, confidence: sim, points: sim > 0.6 ? 1 : 0 };
  }

  if (type === "numerical") {
    const u = parseFloat(user);
    const c = parseFloat(correct);
    if (!isNaN(u) && !isNaN(c)) {
      const tol = Math.max(1e-3, Math.abs(c) * 0.01);
      const ok = Math.abs(u - c) <= tol;
      const confidence = ok ? 1 : Math.max(0, 1 - Math.abs(u - c) / (Math.abs(c) + 1e-6));
      return { correct: ok, confidence, points: ok ? 1 : 0 };
    }
    const sim = jaccardSimilarity(normalizeText(user), normalizeText(correct.toString()));
    return { correct: sim > 0.7, confidence: sim, points: sim > 0.7 ? 1 : 0 };
  }

  const uNorm = normalizeText(user);
  const cNorm = normalizeText(correct);
  const sim = jaccardSimilarity(uNorm, cNorm);

  if (sim >= 0.6) return { correct: true, confidence: sim, points: 1 };
  if (sim >= 0.35) return { correct: false, confidence: sim, points: 0.5 };
  return { correct: false, confidence: sim, points: 0 };
}

/* ---------- component ---------- */

export default function QuizPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attemptResult, setAttemptResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("fresh"); // fresh | viewing | retry
  const [startedAt, setStartedAt] = useState(null);
  const [loadedAttemptData, setLoadedAttemptData] = useState(null);

  /* ---------------- LOAD EXISTING ATTEMPT ---------------- */
  useEffect(() => {
    if (!attemptId) return;
    loadAttempt(attemptId);
  }, [attemptId]);

  async function loadAttempt(id) {
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/quiz/attempt/${id}`);
      const data = await res.json();

      const quizJson = data.quiz;
      const qArr = Array.isArray(quizJson?.quiz)
        ? quizJson.quiz
        : Array.isArray(quizJson)
        ? quizJson
        : [];

      setQuiz(qArr);
      setQuizId(data.attempt.quiz_id);

      setAnswers(data.attempt.answers || {});
      setMode("viewing");

      // Recompute correctness display for UI
      const perQuestion = qArr.map((q, idx) => {
        const userAns = data.attempt.answers?.[idx] ?? "";
        const res = compareAnswers(userAns, q.answer, q.type);
        return {
          index: idx,
          question: q.question,
          userAnswer: userAns,
          correctAnswer: q.answer,
          explanation: q.explanation,
          isCorrect: res.correct,
          points: res.points,
          confidence: res.confidence,
        };
      });

      setAttemptResult({
        totalPoints: data.attempt.score,
        maxPoints: qArr.length,
        perQuestion,
      });

      setStartedAt(data.attempt.started_at);
      setLoadedAttemptData(data.attempt);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  /* ---------------- GENERATE NEW QUIZ ---------------- */
  async function handleGenerate() {
    if (!file) return;
    setLoading(true);

    const res = await generateQuiz(file, difficulty);
    const qArr = Array.isArray(res?.quiz?.quiz) ? res.quiz.quiz : [];

    setQuiz(qArr);
    setQuizId(res.quiz_id);
    setAnswers({});
    setAttemptResult(null);
    setMode("fresh");
    setStartedAt(new Date().toISOString());

    setLoading(false);
  }

  /* ---------------- SUBMIT QUIZ ATTEMPT ---------------- */
  async function submitQuiz() {
    console.log("Submitting payload answers:", answers);

    let totalPoints = 0;
    const perQuestion = [];

    quiz.forEach((q, idx) => {
      const userAns = answers[idx] ?? "";
      const res = compareAnswers(userAns, q.answer, q.type);

      totalPoints += res.points;

      perQuestion.push({
        index: idx,
        question: q.question,
        userAnswer: userAns,
        correctAnswer: q.answer,
        explanation: q.explanation,
        isCorrect: res.correct,
        confidence: res.confidence,
        points: res.points,
      });
    });

    setAttemptResult({
      totalPoints,
      maxPoints: quiz.length,
      perQuestion,
    });

    // Save attempt
    const payload = {
      quiz_id: quizId,
      answers,
      score: totalPoints,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    };

    await fetch("http://localhost:8000/quiz/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Refresh sidebar
    window.dispatchEvent(new Event("history-updated"));
  }

  /* ---------------- RETRY QUIZ ---------------- */
  function retryQuiz() {
    setMode("retry");
    setAnswers({});
    setAttemptResult(null);
    setStartedAt(new Date().toISOString());
  }

  /* ---------------- UI ---------------- */

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-indigo-700 dark:text-indigo-300 mb-4 text-center">AI Quiz Generator</h1>
        <p className="text-gray-600 dark:text-zinc-400 text-base mb-6 text-center">
          Upload your syllabus or notes and let AI create a personalized quiz. Instantly test your knowledge and get explanations for every answer.
        </p>

        {/* ---------- Generate UI (only in fresh mode) ---------- */}
        {mode === "fresh" && (
          <div className="p-6 bg-gray-50 dark:bg-zinc-800 rounded-xl shadow mb-6">
            <h3 className="font-semibold mb-2">Upload Syllabus/Notes PDF</h3>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded-lg w-full" />
            <div className="mt-4 flex gap-4 items-center">
              <label className="font-medium">Difficulty:</label>
              <select
                className="border p-2 rounded-lg bg-white dark:bg-zinc-700"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                onClick={handleGenerate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition ml-auto"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        )}

        {/* ---------- QUIZ DISPLAY ---------- */}
        {quiz.length > 0 && (
          <div className="mt-6">
            {mode === "viewing" && (
              <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-300 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Viewing previous attempt (Score: {attemptResult?.totalPoints} / {attemptResult?.maxPoints})</span>
                <button
                  onClick={retryQuiz}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  Retry Quiz
                </button>
              </div>
            )}

            <div className="space-y-6 mb-8">
              {quiz.map((q, idx) => (
                <QuizCard
                  key={`${idx}-${mode}`}
                  q={q}
                  index={idx}
                  onAnswer={(idx, val) => {
                    setAnswers(prev => ({ ...prev, [idx]: val }));
                  }}
                  userAnswer={answers[idx]}
                  readOnly={mode === "viewing"}
                />
              ))}
            </div>

            {/* Submit only if user is answering */}
            {mode !== "viewing" && (
              <div className="flex justify-end">
                <button
                  onClick={submitQuiz}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
                >
                  Submit Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------- RESULTS ---------- */}
        {attemptResult && (
          <div className="mt-8 p-8 bg-gray-50 dark:bg-zinc-800 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-700 dark:text-green-300">
              Your Score: {attemptResult.totalPoints} / {attemptResult.maxPoints}
            </h2>

            <div className="space-y-4">
              {attemptResult.perQuestion.map((r, i) => (
                <div
                  key={i}
                  className={`p-6 border rounded-xl mb-2 ${
                    r.isCorrect
                      ? "border-green-300 bg-green-50"
                      : r.points > 0
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="font-semibold text-lg mb-2">
                    {i + 1}. {r.question}
                  </div>

                  <div className="text-base mb-1">
                    <strong>Your answer:</strong>{" "}
                    <span className={r.isCorrect ? "text-green-700" : "text-red-700"}>
                      {r.userAnswer || "Not answered"}
                    </span>
                  </div>
                  <div className="text-base mb-1">
                    <strong>Correct:</strong>{" "}
                    {Array.isArray(r.correctAnswer)
                      ? r.correctAnswer.join(" / ")
                      : r.correctAnswer}
                  </div>

                  <div className="mt-2 text-base text-gray-800">
                    <strong>Explanation:</strong> {r.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

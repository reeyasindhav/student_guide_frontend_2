"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateQuiz } from "@/services/quizApi";
import QuizCard from "@/components/QuizCard";
import { API_BASE_URL } from "@/config/api";
import { fetchAttempts, fetchAttemptById } from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";
import {
  BookOpen,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  FileText,
  X,
} from "lucide-react";

/* ---------- helper functions ---------- */

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
  const inter = new Set([...as].filter((x) => bs.has(x)));
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
      const confidence = ok
        ? 1
        : Math.max(0, 1 - Math.abs(u - c) / (Math.abs(c) + 1e-6));
      return { correct: ok, confidence, points: ok ? 1 : 0 };
    }
    const sim = jaccardSimilarity(
      normalizeText(user),
      normalizeText(correct.toString())
    );
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

function QuizContent() {
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

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const loadHistory = useCallback(
    async (signal = null) => {
      if (loadingHistory) return; // Prevent duplicate calls

      setLoadingHistory(true);
      try {
        const data = await fetchAttempts();
        if (signal?.aborted) return;
        setHistoryList(data || []);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Failed to load quiz history:", err);
        setHistoryList([]);
      } finally {
        if (!signal?.aborted) {
          setLoadingHistory(false);
        }
      }
    },
    [loadingHistory]
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadHistory(abortController.signal);
    return () => abortController.abort();
  }, []); // Only load once on mount

  /* ---------------- LOAD EXISTING ATTEMPT ---------------- */
  useEffect(() => {
    if (!attemptId) return;
    loadAttempt(attemptId);
  }, [attemptId]);

  const loadAttempt = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/quiz/attempt/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load quiz attempt");
      }
      const data = await res.json();

      if (!data.attempt || !data.quiz) {
        throw new Error("Invalid quiz attempt data");
      }

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
      setCurrentAttemptId(id);
    } catch (e) {
      console.error("Failed to load quiz attempt:", e);
      alert("Failed to load quiz attempt. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- GENERATE NEW QUIZ ---------------- */
  async function handleGenerate() {
    if (!file) return;
    setLoading(true);

    try {
      const res = await generateQuiz(file, difficulty);
      const qArr = Array.isArray(res?.quiz?.quiz) ? res.quiz.quiz : [];

      setQuiz(qArr);
      setQuizId(res.quiz_id);
      setAnswers({});
      setAttemptResult(null);
      setMode("fresh");
      setStartedAt(new Date().toISOString());
      setCurrentAttemptId(null);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- SUBMIT QUIZ ATTEMPT ---------------- */
  async function submitQuiz() {
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

    setMode("viewing");

    const payload = {
      quiz_id: quizId,
      answers,
      score: totalPoints,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save quiz attempt");
      }

      await loadHistory();
      window.dispatchEvent(new Event("history-updated"));
    } catch (err) {
      console.error("Failed to save quiz attempt:", err);
      alert(
        "Failed to save your quiz attempt. Your score has been calculated locally."
      );
    }
  }

  /* ---------------- RETRY QUIZ ---------------- */
  function retryQuiz() {
    setMode("retry");
    setAnswers({});
    setAttemptResult(null);
    setStartedAt(new Date().toISOString());
  }

  /* ---------------- START NEW QUIZ ---------------- */
  function startNewQuiz() {
    setMode("fresh");
    setQuiz([]);
    setQuizId(null);
    setAnswers({});
    setAttemptResult(null);
    setFile(null);
    setCurrentAttemptId(null);
    setStartedAt(null);
    setLoadedAttemptData(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const openAttempt = useCallback(
    (id) => {
      router.push(`/quiz?attemptId=${id}`);
      setShowSidebar(false);
    },
    [router]
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex">
      {/* Sidebar - Quiz History */}
      <aside
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed lg:sticky lg:translate-x-0 top-14 left-0 h-[calc(100vh-3.5rem)] w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-transform duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={20} />
              Quiz History
            </h2>
          </div>
          <button
            onClick={() => {
              setShowSidebar(false);
              startNewQuiz();
            }}
            className="w-full mb-3 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={18} />
            New Quiz
          </button>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1"
          >
            <X size={16} className="inline mr-1" />
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingHistory && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          )}

          {!loadingHistory && historyList.length === 0 && (
            <div className="text-center py-12 px-4">
              <BookOpen
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No quiz attempts yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Generate and complete a quiz to see your history
              </p>
            </div>
          )}

          <div className="space-y-1">
            {historyList.map((item) => (
              <HistoryListItem
                key={item.id}
                item={{
                  ...item,
                  title: `Quiz Attempt - Score: ${item.score || 0}/${
                    item.max_score || 5
                  }`,
                }}
                onClick={() => openAttempt(item.id)}
                active={String(item.id) === String(currentAttemptId)}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <BookOpen
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Quiz Generator
              </h1>
            </div>
            <button
              onClick={startNewQuiz}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen size={16} />
              New Quiz
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2
                    size={48}
                    className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading quiz...
                  </p>
                </div>
              </div>
            )}

            {!loading && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4">
                    <BookOpen size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Quiz Generator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload your syllabus or notes and let AI create a
                    personalized quiz. Instantly test your knowledge and get
                    explanations for every answer.
                  </p>
                </div>

                {/* Generate UI (only in fresh mode) */}
                {mode === "fresh" && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Upload size={20} />
                      Upload Syllabus/Notes PDF
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer"
                        />
                        {file && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span>{file.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 items-center">
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                          Difficulty:
                        </label>
                        <select
                          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        <button
                          onClick={handleGenerate}
                          disabled={!file || loading}
                          className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <BookOpen size={18} />
                              Generate Quiz
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz Display */}
                {quiz.length > 0 && (
                  <div className="mt-6">
                    {mode === "viewing" && attemptResult && (
                      <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy
                            size={24}
                            className="text-blue-600 dark:text-blue-400"
                          />
                          <div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Viewing previous attempt
                            </span>
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              Score: {attemptResult.totalPoints} /{" "}
                              {attemptResult.maxPoints}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={retryQuiz}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <RotateCcw size={18} />
                          Retry Quiz
                        </button>
                      </div>
                    )}

                    <div className="space-y-4 mb-8">
                      {quiz.map((q, idx) => (
                        <QuizCard
                          key={`${idx}-${mode}`}
                          q={q}
                          index={idx}
                          onAnswer={(idx, val) => {
                            setAnswers((prev) => ({ ...prev, [idx]: val }));
                          }}
                          userAnswer={answers[idx]}
                          readOnly={mode === "viewing"}
                        />
                      ))}
                    </div>

                    {/* Submit Button */}
                    {mode !== "viewing" && (
                      <div className="flex justify-end">
                        <button
                          onClick={submitQuiz}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={20} />
                          Submit Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Results */}
                {attemptResult && mode === "viewing" && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4">
                        <Trophy size={40} className="text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                        Your Score: {attemptResult.totalPoints} /{" "}
                        {attemptResult.maxPoints}
                      </h2>
                      <div className="text-lg text-gray-600 dark:text-gray-400">
                        {(
                          (attemptResult.totalPoints /
                            attemptResult.maxPoints) *
                          100
                        ).toFixed(1)}
                        % Correct
                      </div>
                    </div>

                    <div className="space-y-4">
                      {attemptResult.perQuestion.map((r, i) => (
                        <div
                          key={i}
                          className={`p-5 rounded-xl border-2 ${
                            r.isCorrect
                              ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                              : r.points > 0
                              ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                              : "border-red-300 bg-red-50 dark:bg-red-900/20"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            {r.isCorrect ? (
                              <CheckCircle
                                size={24}
                                className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1"
                              />
                            ) : (
                              <XCircle
                                size={24}
                                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1"
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                                {i + 1}. {r.question}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <strong className="text-sm text-gray-700 dark:text-gray-300">
                                    Your answer:
                                  </strong>
                                  <span
                                    className={`text-sm ${
                                      r.isCorrect
                                        ? "text-green-700 dark:text-green-300 font-medium"
                                        : "text-red-700 dark:text-red-300"
                                    }`}
                                  >
                                    {r.userAnswer || "Not answered"}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <strong className="text-sm text-gray-700 dark:text-gray-300">
                                    Correct answer:
                                  </strong>
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {Array.isArray(r.correctAnswer)
                                      ? r.correctAnswer.join(" / ")
                                      : r.correctAnswer}
                                  </span>
                                </div>
                                {r.explanation && (
                                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <strong className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
                                      Explanation:
                                    </strong>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                      {r.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {quiz.length === 0 && mode === "fresh" && !loading && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <BookOpen
                        size={40}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Generate Quiz
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upload a PDF file to generate your personalized quiz
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
          <Loader2
            className="animate-spin text-blue-600 dark:text-blue-400"
            size={48}
          />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}

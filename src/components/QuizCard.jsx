import { useState, useEffect } from "react";

export default function QuizCard({ q, index, onAnswer, userAnswer, readOnly }) {
  const [answer, setAnswer] = useState("");

  // Sync external answer when viewing previous attempts
  useEffect(() => {
    if (userAnswer !== undefined && userAnswer !== null) {
      setAnswer(userAnswer);
    }
  }, [userAnswer]);

  const letters = ["A", "B", "C", "D", "E"];

  function handleSelect(val) {
    if (readOnly) return; // disable interaction in view mode
    console.log("QuizCard selected:", index, val);
    setAnswer(val);
    onAnswer(index, val);
  }

  return (
    <div className="p-4 bg-white border rounded shadow mb-4">
      <div className="flex items-start">
        <div className="mr-3 text-indigo-600 font-semibold">{index + 1}.</div>
        <div className="flex-1">
          <h3 className="text-md font-medium mb-2">{q.question}</h3>

          {/* MCQ */}
          {q.type === "mcq" && Array.isArray(q.options) && (
            <div className="grid gap-2">
              {q.options.map((opt, i) => {
                const label = letters[i];
                return (
                  <label
                    key={i}
                    className="flex items-center gap-3 cursor-pointer p-2 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={label}
                      checked={answer === label}
                      onChange={() => handleSelect(label)}
                      disabled={readOnly}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold">{label}.</span> {opt}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Assertion */}
          {q.type === "assertion_reason" && (
            <div className="grid gap-2">
              {[
                "A true, R true, R explains A",
                "A true, R true, R does not explain A",
                "A true, R false",
                "A false, R true",
                "Both false"
              ].map((opt, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 cursor-pointer p-2 border rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={`q-${index}`}
                    value={opt}
                    checked={answer === opt}
                    onChange={() => handleSelect(opt)}
                    disabled={readOnly}
                  />
                  <div>{opt}</div>
                </label>
              ))}
            </div>
          )}

          {/* Numerical */}
          {q.type === "numerical" && (
            <input
              type="text"
              className="mt-2 w-full border p-2 rounded"
              value={answer}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={readOnly}
            />
          )}

          {/* Short */}
          {q.type === "short" && (
            <textarea
              className="mt-2 w-full border p-2 rounded"
              rows={3}
              value={answer}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={readOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
}

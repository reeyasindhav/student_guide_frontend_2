"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function QuizCard({ q, index, onAnswer, userAnswer, readOnly }) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (userAnswer !== undefined && userAnswer !== null) {
      setAnswer(userAnswer);
    }
  }, [userAnswer]);

  const letters = ["A", "B", "C", "D", "E"];

  function handleSelect(val) {
    if (readOnly) return;
    setAnswer(val);
    onAnswer(index, val);
  }

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 leading-relaxed">
            {q.question}
          </h3>

          {/* MCQ */}
          {q.type === "mcq" && Array.isArray(q.options) && (
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const label = letters[i];
                const isSelected = answer === label;
                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } ${readOnly ? "cursor-default" : ""}`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle2
                          size={20}
                          className="text-indigo-600 dark:text-indigo-400"
                          fill="currentColor"
                        />
                      ) : (
                        <Circle
                          size={20}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={label}
                      checked={isSelected}
                      onChange={() => handleSelect(label)}
                      disabled={readOnly}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-2">
                        {label}.
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {opt}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Assertion Reason */}
          {q.type === "assertion_reason" && (
            <div className="space-y-2">
              {[
                "A true, R true, R explains A",
                "A true, R true, R does not explain A",
                "A true, R false",
                "A false, R true",
                "Both false",
              ].map((opt, i) => {
                const isSelected = answer === opt;
                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } ${readOnly ? "cursor-default" : ""}`}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle2
                          size={20}
                          className="text-indigo-600 dark:text-indigo-400"
                          fill="currentColor"
                        />
                      ) : (
                        <Circle
                          size={20}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleSelect(opt)}
                      disabled={readOnly}
                      className="hidden"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Numerical */}
          {q.type === "numerical" && (
            <input
              type="text"
              className="mt-2 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter numerical answer"
              value={answer}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={readOnly}
            />
          )}

          {/* Short Answer */}
          {q.type === "short" && (
            <textarea
              className="mt-2 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              rows={4}
              placeholder="Type your answer here..."
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

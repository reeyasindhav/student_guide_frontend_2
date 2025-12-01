"use client";

import { Download, FileText, Code, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SummaryViewer({ data }) {
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No summary available.
        </p>
      </div>
    );
  }

  const summary = data.summary || data.overview || "";
  const keyPoints = Array.isArray(data.key_points)
    ? data.key_points
    : Array.isArray(data.notes)
    ? data.notes
    : [];
  const formulas = Array.isArray(data.formulas) ? data.formulas : [];
  const definitions = Array.isArray(data.definitions) ? data.definitions : [];
  const workflow = Array.isArray(data.workflow_steps)
    ? data.workflow_steps
    : [];
  const mistakes = Array.isArray(data.common_mistakes)
    ? data.common_mistakes
    : [];
  const questions = Array.isArray(data.practice_questions)
    ? data.practice_questions
    : [];

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadTXT() {
    let txt = `SUMMARY\n\n${summary}\n\n`;
    if (keyPoints.length) {
      txt +=
        "KEY POINTS\n\n" +
        keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") +
        "\n\n";
    }
    if (formulas.length) {
      txt +=
        "FORMULAS\n\n" +
        formulas.map((f, i) => `${i + 1}. ${f}`).join("\n") +
        "\n\n";
    }
    if (questions.length) {
      txt +=
        "PRACTICE QUESTIONS\n\n" +
        questions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
        "\n\n";
    }
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Summary</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTXT}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Download size={16} />
              TXT
            </button>
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Code size={16} />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary */}
        {summary && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Overview
              </h3>
              <button
                onClick={() => copyToClipboard(summary)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={14} />
                    Copied!
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}

        {/* Sections */}
        <Section title="Key Points" items={keyPoints} icon="📌" />
        <Section title="Formulas" items={formulas} icon="📐" />
        <Section title="Definitions" items={definitions} icon="📖" />
        <Section title="Workflow / Steps" items={workflow} icon="⚙️" />
        <Section title="Common Mistakes" items={mistakes} icon="⚠️" />
        <Section title="Practice Questions" items={questions} icon="❓" />
      </div>
    </div>
  );
}

function Section({ title, items, icon }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({items.length})
        </span>
      </h3>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex gap-3 text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
              {idx + 1}
            </span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

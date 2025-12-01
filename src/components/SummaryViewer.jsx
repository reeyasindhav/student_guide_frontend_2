export default function SummaryViewer({ data }) {
  if (!data) {
    return <p className="mt-4 text-gray-500">No summary available.</p>;
  }

  // Normalize potential field names
  const summary = data.summary || data.overview || "";
  const keyPoints = Array.isArray(data.key_points) ? data.key_points : (Array.isArray(data.notes) ? data.notes : []);
  const formulas = Array.isArray(data.formulas) ? data.formulas : [];
  const definitions = Array.isArray(data.definitions) ? data.definitions : [];
  const workflow = Array.isArray(data.workflow_steps) ? data.workflow_steps : [];
  const mistakes = Array.isArray(data.common_mistakes) ? data.common_mistakes : [];
  const questions = Array.isArray(data.practice_questions) ? data.practice_questions : [];

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
      txt += "KEY POINTS\n\n" + keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") + "\n\n";
    }
    if (formulas.length) {
      txt += "FORMULAS\n\n" + formulas.map((f, i) => `${i + 1}. ${f}`).join("\n") + "\n\n";
    }
    if (questions.length) {
      txt += "PRACTICE QUESTIONS\n\n" + questions.map((q, i) => `${i + 1}. ${q}`).join("\n") + "\n\n";
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

  return (
    <div className="mt-6 bg-white p-6 rounded shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">Summary</h2>

        <div className="flex gap-2">
          <button onClick={downloadTXT} className="px-3 py-1 border rounded text-sm">Download TXT</button>
          <button onClick={downloadJSON} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Download JSON</button>
        </div>
      </div>

      <p className="mt-3 text-gray-800">{summary}</p>

      <Section title="Key Points" items={keyPoints} />
      <Section title="Formulas" items={formulas} />
      <Section title="Definitions" items={definitions} />
      <Section title="Workflow / Steps" items={workflow} />
      <Section title="Common Mistakes" items={mistakes} />
      <Section title="Practice Questions" items={questions} />
    </div>
  );
}

function Section({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="list-disc ml-6 mt-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
}

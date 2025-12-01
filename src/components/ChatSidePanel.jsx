export default function ChatSidePanel() {
  return (
    <div className="w-64 h-full border-r bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">AI Study Chatbot</h2>
        <p className="text-xs text-gray-600">Ask questions from uploaded syllabus</p>
      </div>

      <div className="p-4 text-sm text-gray-600">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc ml-4 mt-1">
          <li>Upload NCERT chapters</li>
          <li>Upload coaching notes</li>
          <li>Ask conceptual or numerical questions</li>
        </ul>
      </div>
    </div>
  );
}

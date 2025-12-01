export default function ChatMessage({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full my-2 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 max-w-[70%] rounded-lg shadow 
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}
        `}
      >
        {text.split("\n").map((line, i) => (
          <p key={i} className="leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}

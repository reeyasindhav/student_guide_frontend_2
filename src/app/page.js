export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-black dark:to-zinc-900 font-sans">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-200 via-white to-blue-200 dark:from-zinc-900 dark:to-zinc-800">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-4 leading-tight">Student Guide AI</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-zinc-200 mb-6">Your JEE/NEET Smart Study Companion</h2>
            <p className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-lg">
              Unlock your full potential with AI-powered learning. Discover curated educational videos, get instant summaries, chat with expert tutors, and practice with personalized quizzes. Trusted by thousands of students for competitive exam success.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <a href="/youtube" className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">Search Videos</a>
              <a href="/summarizer" className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition">Summarize Notes</a>
              <a href="/chatbot" className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Chat with Tutor</a>
              <a href="/quiz" className="px-6 py-3 rounded-full bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition">Practice Quiz</a>
            </div>
            <div className="text-xs text-gray-400 dark:text-zinc-500">Prototype — features evolving. Made for JEE/NEET aspirants.</div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src="/ai_image.jpg" alt="AI Study" className="w-80 h-80 object-contain rounded-xl shadow-lg border border-indigo-100 dark:border-zinc-700" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">🎥 Curated Video Library</h3>
          <p className="text-gray-700 dark:text-zinc-300">Search and discover high-quality JEE/NEET lectures from trusted educators. No distractions, only relevant content.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">📝 Instant Summaries</h3>
          <p className="text-gray-700 dark:text-zinc-300">Upload notes or paste YouTube links to get concise summaries, key points, formulas, and practice questions in seconds.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">🤖 AI Tutor Chat</h3>
          <p className="text-gray-700 dark:text-zinc-300">Ask doubts, get explanations, and receive guidance from an AI tutor trained on your syllabus and notes.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">🧩 Practice Quizzes</h3>
          <p className="text-gray-700 dark:text-zinc-300">Generate topic-wise quizzes, test your understanding, and get instant feedback with detailed solutions.</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h3 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-8">What Students Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-2">
            <p className="text-gray-700 dark:text-zinc-300 italic">"Student Guide AI helped me revise faster and focus on what matters. The summaries and quizzes are spot on!"</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-100">A</span>
              <span className="text-sm text-gray-500">Aman, JEE Aspirant</span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-2">
            <p className="text-gray-700 dark:text-zinc-300 italic">"The AI tutor cleared my doubts instantly. It's like having a personal teacher 24/7!"</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center font-bold text-green-700 dark:text-green-100">S</span>
              <span className="text-sm text-gray-500">Sneha, NEET Aspirant</span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-2">
            <p className="text-gray-700 dark:text-zinc-300 italic">"I love the video search and the way it filters out non-educational stuff. Highly recommended!"</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-8 h-8 rounded-full bg-yellow-200 dark:bg-yellow-700 flex items-center justify-center font-bold text-yellow-700 dark:text-yellow-100">R</span>
              <span className="text-sm text-gray-500">Rahul, JEE/NEET</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 px-4 bg-indigo-900 text-white text-center mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-lg font-semibold">Student Guide AI &copy; {new Date().getFullYear()}</div>
          <div className="text-sm">Made with ❤️ for JEE/NEET aspirants. Not affiliated with Vedantu or any coaching institute.</div>
        </div>
      </footer>
    </div>
  );
}

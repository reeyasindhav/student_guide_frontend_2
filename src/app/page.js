"use client";

import Link from "next/link";
import {
  Play,
  BookOpen,
  MessageSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Hero Section */}
      <section className="relative w-full pt-8 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
              <Sparkles size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Your Smart Study
              <span className="block text-red-600 dark:text-red-400">
                Companion
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Unlock your full potential with AI-powered learning. Discover
              curated educational videos, get instant summaries, chat with
              expert tutors, and practice with personalized quizzes—all in one
              place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
              <Link
                href="/youtube"
                className="group px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <Play size={20} />
                <span>Search Videos</span>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="/summarizer"
                className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <FileText size={20} />
                <span>Get Summaries</span>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="/chatbot"
                className="group px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <MessageSquare size={20} />
                <span>Chat Tutor</span>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="/quiz"
                className="group px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <BookOpen size={20} />
                <span>Practice Quiz</span>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 blur-3xl rounded-3xl"></div>
                <img
                  src="/ai_image.jpg"
                  alt="AI Study Companion"
                  className="relative w-full h-auto object-contain rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-[#181818]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed specifically for JEE/NEET aspirants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Videos */}
            <Link
              href="/youtube"
              className="group bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-red-500 dark:hover:border-red-600 transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Curated Videos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                Discover high-quality JEE/NEET lectures from trusted educators.
                No distractions, only relevant content.
              </p>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm">
                <span>Explore</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>

            {/* Feature 2 - Summaries */}
            <Link
              href="/summarizer"
              className="group bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-600 transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText
                  size={28}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Instant Summaries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                Get concise summaries, key points, formulas, and practice
                questions in seconds.
              </p>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
                <span>Try Now</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>

            {/* Feature 3 - Chat */}
            <Link
              href="/chatbot"
              className="group bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-600 transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare
                  size={28}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                AI Tutor Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                Ask doubts, get explanations, and receive guidance from an AI
                tutor 24/7.
              </p>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                <span>Start Chat</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>

            {/* Feature 4 - Quiz */}
            <Link
              href="/quiz"
              className="group bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-yellow-500 dark:hover:border-yellow-600 transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen
                  size={28}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Practice Quizzes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                Generate topic-wise quizzes, test your understanding, and get
                instant feedback.
              </p>
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium text-sm">
                <span>Take Quiz</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Student Guide AI?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for students, powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant results with AI-powered processing. No waiting, just
                learning.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Focused Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Curated specifically for JEE/NEET. No distractions, only what
                matters.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your learning journey with detailed history and
                analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-[#181818]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Students Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Trusted by thousands of JEE/NEET aspirants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2
                    key={i}
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                "Student Guide AI helped me revise faster and focus on what
                matters. The summaries and quizzes are spot on!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Aman
                  </div>
                  <div className="text-sm text-gray-500">JEE Aspirant</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2
                    key={i}
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                "The AI tutor cleared my doubts instantly. It's like having a
                personal teacher 24/7!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center font-bold text-white">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Sneha
                  </div>
                  <div className="text-sm text-gray-500">NEET Aspirant</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2
                    key={i}
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                "I love the video search and the way it filters out
                non-educational stuff. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center font-bold text-white">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Rahul
                  </div>
                  <div className="text-sm text-gray-500">JEE/NEET Aspirant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Ace Your Exams?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of students already using Student Guide AI to excel
              in JEE/NEET
            </p>
            <Link
              href="/youtube"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <Play size={20} />
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

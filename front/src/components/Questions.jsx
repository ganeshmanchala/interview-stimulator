import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function QuestionItem({ q, idx }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="text-sm text-blue-600 font-medium mb-2">Question {idx + 1}</div>
      <div className="text-gray-800 font-medium">{q.text}</div>
    </div>
  );
}

export default function Questions() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topics, setTopics] = useState("");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  async function handleGenerate(e) {
    e?.preventDefault();
    setError("");
    if (!role.trim()) return setError("Please enter a job role (e.g., Backend Java Engineer).");
    setLoading(true);
    setQuestions([]);
    try {
      const payload = {
        role,
        experience,
        topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
        count: Number(count) || 5,
      };

      const res = await fetch(`${API_BASE}/api/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate questions");
      }

      const data = await res.json();
      setQuestions(data.questions || []);

      try {
        sessionStorage.setItem("interview_questions", JSON.stringify(data.questions || []));
      } catch (err) {
        console.warn("sessionStorage unavailable", err);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function startInterview() {
    if (!questions || questions.length === 0) return setError("Generate questions first.");

    try {
      sessionStorage.setItem("interview_questions", JSON.stringify(questions));
    } catch (e) {
      console.warn("Could not persist questions to sessionStorage", e);
    }

    console.log("Starting interview with questions:", questions);
    navigate("/interview", { state: { questions } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Interview Questions</h2>
              <p className="text-gray-600">
                Tell us about the job role and we'll generate personalized interview questions using AI
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Role *</label>
                <input 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="e.g., Backend Java Engineer, Frontend Developer, Data Scientist"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level (optional)</label>
                  <input 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    placeholder="e.g., 2-4 years, Senior, Entry-level"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={count} 
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords / Topics (comma separated)</label>
                <input 
                  value={topics} 
                  onChange={(e) => setTopics(e.target.value)} 
                  placeholder="e.g., concurrency, JVM, memory management, system design"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating Questions...
                    </div>
                  ) : (
                    "Generate Questions"
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setRole(""); setExperience(""); setTopics(""); setQuestions([]); setError(""); }}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Generated Questions</h3>
              <button 
                disabled={questions.length === 0}
                onClick={startInterview}
                className="px-8 py-3 bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                Start Interview
              </button>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No questions generated yet</div>
                <div className="text-gray-500">Fill out the form above to generate personalized interview questions</div>
              </div>
            )}

            <div className="grid gap-4">
              {questions.map((q, i) => (
                <QuestionItem key={q.id || i} q={q} idx={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
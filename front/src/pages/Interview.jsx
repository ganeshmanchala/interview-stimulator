import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import InterviewRecorder from "../components/InterviewRecorder";

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = location.state?.questions;
    if (Array.isArray(qs) && qs.length) {
      setQuestions(qs);
      setLoading(false);
      return;
    }
    const stored = sessionStorage.getItem("interview_questions");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        setQuestions(parsed);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    navigate("/questions", { replace: true });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl text-gray-700">Loading interview session...</div>
      </div>
    </div>
  );
  
  if (!questions?.length) return null;

  const sessionId = `sess-${Date.now()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="pt-20">
        <InterviewRecorder sessionId={sessionId} questions={questions} />
      </main>
    </div>
  );
}

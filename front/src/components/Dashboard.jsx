import React, { useEffect, useState } from "react";

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-1000"
          style={{ 
            width: value,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:4000/api/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setDashboard(data.dashboard);
        } else {
          setError(data.error || "Failed to load dashboard");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const { confidence, fluency, correctness, interviewsCount } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Performance Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your interview performance and improvement over time with detailed analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="Confidence Score"
            value={`${Math.round(confidence * 100)}%`}
            color="#2563eb"
            icon="💪"
          />
          <StatCard
            label="Fluency Score"
            value={`${Math.round(fluency * 100)}%`}
            color="#22c55e"
            icon="🎯"
          />
          <StatCard
            label="Correctness Score"
            value={`${Math.round(correctness * 100)}%`}
            color="#f59e0b"
            icon="✓"
          />
        </div>

        {/* Interviews Count */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {interviewsCount}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Interviews Completed</h3>
          <p className="text-gray-600 mb-4">Keep practicing to improve your skills</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(interviewsCount * 10, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {interviewsCount < 10 ? `${10 - interviewsCount} more to unlock advanced analytics` : 'Advanced analytics unlocked!'}
          </p>
        </div>

        {/* Progress Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            {interviewsCount === 0 
              ? "Start your first interview to see your progress!"
              : interviewsCount < 3
              ? "Great start! Continue practicing to see more detailed insights."
              : "Excellent progress! Your consistency is paying off."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
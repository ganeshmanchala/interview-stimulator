import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CircleProgress({ label, value, color }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = () => {
      start += 2;
      if (start < value) {
        setProgress(start);
        requestAnimationFrame(step);
      } else {
        setProgress(value);
      }
    };
    step();
  }, [value]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="180" height="180" className="transform -rotate-90">
        <circle cx="90" cy="90" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="text-lg font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{progress}%</p>
      </div>
    </div>
  );
}

export default function FinalReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [avg, setAvg] = useState({ confidence: 0, fluency: 0, correctness: 0 });

  useEffect(() => {
    const data = location.state?.reports;
    if (data) {
      setReports(data);
      sessionStorage.setItem("final_reports", JSON.stringify(data));
    } else {
      const stored = sessionStorage.getItem("final_reports");
      if (stored) {
        setReports(JSON.parse(stored));
      } else {
        navigate("/questions");
      }
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!reports) return;

    const allReports = Object.values(reports);
    let totalConfidence = 0,
      totalFluency = 0,
      totalCorrectness = 0,
      count = 0;

    allReports.forEach((r) => {
      const s = r?.report?.scores || {};
      if (s.confidence && s.fluency && s.correctness) {
        totalConfidence += s.confidence;
        totalFluency += s.fluency;
        totalCorrectness += s.correctness;
        count++;
      }
    });

    const newAvg = count > 0
      ? {
          confidence: totalConfidence / count,
          fluency: totalFluency / count,
          correctness: totalCorrectness / count,
        }
      : { confidence: 0, fluency: 0, correctness: 0 };

    setAvg(newAvg);
  }, [reports]);

  useEffect(() => {
    if (!reports) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch("http://localhost:4000/api/user/dashboard/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(avg),
    })
      .then((r) => r.json())
      .then((res) => console.log("Dashboard updated:", res))
      .catch((err) => console.error("Dashboard update failed", err));
  }, [avg, reports]);

  if (!reports) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading your report...</div>
        </div>
      </div>
    );
  }

  const allReports = Object.values(reports);
  if (allReports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-700 mb-4">No report data available</div>
          <button 
            onClick={() => navigate("/questions")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              AI
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Interview Performance Report</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive analysis of your interview performance with actionable feedback
            </p>
          </div>

          {/* Overall Performance */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Overall Performance</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-12">
              <CircleProgress label="Confidence" value={Math.round(avg.confidence * 100)} color="#2563eb" />
              <CircleProgress label="Fluency" value={Math.round(avg.fluency * 100)} color="#22c55e" />
              <CircleProgress label="Correctness" value={Math.round(avg.correctness * 100)} color="#f59e0b" />
            </div>
          </div>

          {/* Detailed Reports */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Question Analysis</h3>
            <div className="space-y-6">
              {Object.entries(reports).map(([qid, rep], idx) => {
                const q = rep?.report?.question || "N/A";
                const s = rep?.report?.scores || {};
                
                return (
                  <div key={qid} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">
                        Q{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{q}</h4>
                        
                        {/* Score Bars */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Confidence</span>
                              <span className="font-semibold text-blue-600">
                                {s.confidence ? Math.round(s.confidence * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(s.confidence || 0) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Fluency</span>
                              <span className="font-semibold text-green-600">
                                {s.fluency ? Math.round(s.fluency * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(s.fluency || 0) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Correctness</span>
                              <span className="font-semibold text-amber-600">
                                {s.correctness ? Math.round(s.correctness * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(s.correctness || 0) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-blue-700">AI Feedback</span>
                          </div>
                          <p className="text-blue-800 leading-relaxed">
                            {s.feedback || "Processing your response..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/questions")}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

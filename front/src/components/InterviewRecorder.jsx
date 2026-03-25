import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewRecorder({ sessionId = "demo-session", questions = [] }) {
  const [index, setIndex] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploads, setUploads] = useState({});
  const [reports, setReports] = useState({});
  const [isQuestionSpoken, setIsQuestionSpoken] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState("female");

  const voiceMap = {
  female: "TrXeCDRboKSzemKz1SeI",
  male: "XwSdJ6CBKhZOy9kIJWfP"
};


  const q = questions[index] || { id: `q-${index}`, text: "No question provided." };

  useEffect(() => {
    let mounted = true;
    async function initMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (!mounted) return;
        setMediaStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Media init error:", err);
      }
    }
    initMedia();
    return () => {
      mounted = false;
      if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
    };
  }, []);



  useEffect(() => {
    setIsQuestionSpoken(false);
  }, [index]);

 async function speakQuestionPromise(text) {
  try {
    setIsPlayingQuestion(true);

    const response = await fetch("http://localhost:4000/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId: voiceMap[selectedVoice]
      }),
    });


    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsPlayingQuestion(false);
      setIsQuestionSpoken(true);
    };

    audio.play();

  } catch (err) {
    console.error("TTS failed:", err);
  }
}



  async function handlePlayQuestion() {
    try {
      await speakQuestionPromise(q.text);
    } catch (err) {
      console.error("TTS failed:", err);
    }
  }

  function startRecording() {
    if (!mediaStream) return alert("No media stream");

    const startRec = () => {
      chunksRef.current = [];
      const rec = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => handleStop();
      rec.start();
      setIsRecording(true);
    };

    if (!isQuestionSpoken) {
      speakQuestionPromise(q.text).then(startRec).catch(startRec);
    } else {
      startRec();
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current.stop();
  }

  async function handleStop() {
    setIsRecording(false);
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const filename = `${sessionId}_${q.id}.webm`;
    const url = URL.createObjectURL(blob);
    setUploads((prev) => ({ ...prev, [index]: { blob, url, status: "ready" } }));

    await uploadRecording(blob, filename, q.id, index);
  }

  const uploadRecording = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.mp4");
      formData.append("question", q.text);

      const response = await fetch(`http://localhost:4000/api/sessions/${sessionId}/recordings`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", errorText);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload success:", data);
      setReports((prev) => ({
        ...prev,
        [q.id]: data,
      }));

      return data;
    } catch (err) {
      console.error("Error during upload:", err);
      throw err;
    }
  };

  async function pollForReport(sessionId, recordingId, questionId) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/recordings/${recordingId}/report`);
      if (res.ok) {
        const data = await res.json();
        setReports((prev) => ({ ...prev, [questionId]: data }));
      } else {
        setTimeout(() => pollForReport(sessionId, recordingId, questionId), 5000);
      }
    } catch (err) {
      console.error("Polling error:", err);
      setTimeout(() => pollForReport(sessionId, recordingId, questionId), 5000);
    }
  }

  function nextQuestion() {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  }

  function prevQuestion() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function renderVoiceSelector() {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
      <label className="font-medium text-gray-700">Voice:</label>
      <select 
        value={selectedVoice} 
        onChange={(e) => {
        setSelectedVoice(e.target.value);
        setSelectedVoiceURI(voiceMap[e.target.value]);
        }}
        className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>
      <div className="flex items-center gap-2">
        <label className="font-medium text-gray-700">Rate:</label>
        <input
        type="range"
        min="0.6"
        max="1.4"
        step="0.1"
        value={speechRate}
        onChange={(e) => setSpeechRate(+e.target.value)}
        className="w-20"
        />
        <span className="text-xs text-gray-600">{speechRate.toFixed(1)}x</span>
      </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Interview Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            {/* Question Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Question {index + 1} of {questions.length}
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      Recording...
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {q.text}
                </h3>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={handlePlayQuestion}
                  disabled={isPlayingQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {isPlayingQuestion ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      {isQuestionSpoken ? "Replay Question" : "Play Question"}
                    </>
                  )}
                </button>
                {renderVoiceSelector()}
              </div>
            </div>

            {/* Video Feed */}
            <div className="relative rounded-xl overflow-hidden bg-black mb-6 shadow-lg">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="w-full aspect-video object-cover"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center bg-black/50 rounded-xl p-4">
                    <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-sm">Camera is active</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  Start Recording
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  Stop Recording
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevQuestion}
                  disabled={index === 0}
                  className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition-all duration-200 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {index < questions.length - 1 ? (
                  <button 
                    onClick={nextQuestion}
                    className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sessionStorage.setItem("final_reports", JSON.stringify(reports));
                      navigate("/final-report", { state: { reports } });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    View Final Report
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reports Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">Live Feedback</h4>
            </div>
            
            {Object.keys(reports).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No feedback yet</p>
                <p className="text-sm text-gray-500">Complete your first recording to see AI feedback</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(reports).map(([qid, rep]) => {
                  const question = rep?.report?.question || "N/A";
                  const scores = rep?.report?.scores || {};
                  const transcript = rep?.report?.transcript || "Not available";
                  
                  return (
                    <div key={qid} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                          Q{Object.keys(reports).indexOf(qid) + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                            {question}
                          </h5>
                          
                          {/* Score Indicators */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Confidence</div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(scores.confidence || 0) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs font-semibold text-gray-700 mt-1">
                                {scores.confidence ? Math.round(scores.confidence * 100) : '0'}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Fluency</div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(scores.fluency || 0) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs font-semibold text-gray-700 mt-1">
                                {scores.fluency ? Math.round(scores.fluency * 100) : '0'}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Correctness</div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(scores.correctness || 0) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs font-semibold text-gray-700 mt-1">
                                {scores.correctness ? Math.round(scores.correctness * 100) : '0'}%
                              </div>
                            </div>
                          </div>

                          {/* Feedback */}
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">Feedback:</div>
                            <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                              {scores.feedback || "Processing your response..."}
                            </div>
                          </div>

                          {/* Transcript */}
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Transcript:</div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 max-h-20 overflow-y-auto">
                              {transcript}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

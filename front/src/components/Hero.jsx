import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full mb-8 border border-blue-200/50 shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          AI-Powered Interview Training
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          Master Your Next{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interview
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Practice with AI-powered interview simulations, get real-time feedback on your answers, 
          and boost your confidence with personalized coaching tailored to your career goals.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            to="/questions" 
            className="px-8 py-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span>Start Interview Practice</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link 
            to="/demo" 
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Watch Demo</span>
          </Link>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">1000+</div>
            <div className="text-gray-600">Interviews Conducted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">94%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div> */}
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-1/3 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-20 w-3 h-3 bg-blue-300 rounded-full opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default Hero;
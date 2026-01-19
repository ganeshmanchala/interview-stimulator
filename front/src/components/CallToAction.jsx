import React from "react";
import { Link } from "react-router-dom";

const CallToAction = () => (
  <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
    <div className="container mx-auto px-4 sm:px-6 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
        Ready to Ace Your Next Interview?
      </h2>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
        Join thousands of professionals who've improved their interview skills and landed their dream jobs.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          to="/signup" 
          className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Start Free Trial
        </Link>
        <Link 
          to="/pricing" 
          className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
        >
          View Pricing
        </Link>
      </div>
    </div>
  </section>
);

export default CallToAction;
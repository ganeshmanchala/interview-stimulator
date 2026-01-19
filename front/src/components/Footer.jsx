import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">AI</div>
          <span className="text-xl font-bold">InterviewSim</span>
        </div>
        <p className="text-gray-400 max-w-md">
          Empowering job seekers with AI-powered interview practice and personalized feedback to land dream careers.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-4 text-lg">Product</h4>
        <ul className="space-y-3">
          <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
          <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
          <li><Link to="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4 text-lg">Support</h4>
        <ul className="space-y-3">
          <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
          <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
          <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
        </ul>
      </div>
    </div>
    <div className="container mx-auto px-4 sm:px-6 text-center mt-8 pt-8 border-t border-gray-800">
      <div className="text-gray-400 text-sm">
        © {new Date().getFullYear()} InterviewSim. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
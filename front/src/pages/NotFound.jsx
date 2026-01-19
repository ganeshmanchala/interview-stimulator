import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="mb-4">Page not found</p>
        <Link to="/" className="px-4 py-2 rounded bg-primary text-white">Go home</Link>
      </div>
    </div>
  );
}

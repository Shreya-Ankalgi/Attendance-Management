import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-green-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Attendance System</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Automate attendance tracking with QR codes for seamless management.
        </p>
        <div className="mt-6">
          <Link
            to="/signup"
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Our System?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CheckCircle className="text-green-500 size-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">QR Code Based Attendance</h3>
            <p className="text-gray-600 mt-2">Easily generate and scan QR codes to mark attendance.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CheckCircle className="text-green-500 size-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Real-time Tracking</h3>
            <p className="text-gray-600 mt-2">Monitor attendance records with real-time updates.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CheckCircle className="text-green-500 size-10 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Secure & Reliable</h3>
            <p className="text-gray-600 mt-2">Ensuring security and privacy for all users.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-4 text-center">
        <p className="text-sm">&copy; 2025 Attendance Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

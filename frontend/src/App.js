import React, { useState } from "react";
import DoctorsPage from "./pages/DoctorsPage";
import PatientsPage from "./pages/PatientsPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("doctors");

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-app">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              LINESETU <span className="text-teal-600">Admin</span>
            </h1>
            <p className="text-xs text-gray-500" style={{ marginTop: 2 }}>Management Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" data-testid="admin-nav">
              <button
                data-testid="nav-doctors-tab"
                onClick={() => setActiveTab("doctors")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "doctors" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500"}`}
              >
                Doctors
              </button>
              <button
                data-testid="nav-patients-tab"
                onClick={() => setActiveTab("patients")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "patients" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500"}`}
              >
                Patients
              </button>
            </nav>
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">A</div>
          </div>
        </div>
      </header>
      {activeTab === "doctors" ? <DoctorsPage /> : <PatientsPage />}
    </div>
  );
}

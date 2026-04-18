import { useState } from "react";
import DoctorsPage from "./pages/DoctorsPage";
import PatientsPage from "./pages/PatientsPage";

type ActiveTab = "doctors" | "patients" | "banner";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("doctors");

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-app">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              LINESETU <span className="text-teal-600">Admin</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Management Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" data-testid="admin-nav">
              <button
                data-testid="nav-doctors-tab"
                onClick={() => setActiveTab("doctors")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "doctors"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Doctors
              </button>
              <button
                data-testid="nav-patients-tab"
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "patients"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Patients
              </button>
              <button
                data-testid="nav-banner-tab"
                onClick={() => setActiveTab("banner")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "banner"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Banner
              </button>
            </nav>
            <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      {activeTab === "doctors" ? (
        <DoctorsPage />
      ) : activeTab === "patients" ? (
        <PatientsPage />
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-[700/2600] w-full max-w-[700px] mx-auto">
              <iframe
                title="Clinic Banner"
                src="/admin-panel/clinic-banner.html"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div id="app-container" className="bg-gray-100 min-h-screen flex w-full">
      {/* Sidebar (fixed width) */}
      <div className="fixed h-full"> {/* Add fixed and h-full here */}
        <Sidebar />
      </div>

      {/* Main Content Area */}
      {/* Add pl-64 or a similar left padding to main-content to account for sidebar's width */}
      <div id="main-content" className="flex-1 flex flex-col pl-64"> {/* Adjust pl-XX based on your sidebar's actual width */}
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
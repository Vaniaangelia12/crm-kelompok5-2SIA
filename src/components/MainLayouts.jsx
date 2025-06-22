import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div id="app-container" className="bg-gray-100 min-h-screen flex w-full">
      {/* Sidebar dengan posisi fixed */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow z-30">
        <Sidebar />
      </div>
      {/* Main content diberi margin kiri sesuai lebar Sidebar */}
      <div id="main-content" className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
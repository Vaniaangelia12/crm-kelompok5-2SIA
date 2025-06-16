import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Box,
  BarChart2,
  Settings,
  LogIn,
  UserPlus,
  PackageCheck,
  Tag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard />, path: "/" },
  { name: "Pelanggan", icon: <Users />, path: "/pelanggan" },
  { name: "Produk", icon: <Box />, path: "/produk" },
  { name: "Laporan", icon: <BarChart2 />, path: "/laporan" },
  { name: "Penjualan", icon: <ShoppingCart />, path: "/penjualan" },
  { name: "Umpan Balik", icon: <Users />, path: "/umpanbalik" },
  { name: "Riwayat Pembelian", icon: <PackageCheck />, path: "/riwayat-pembelian" },
];

const accountItems = [
  { name: "Pengaturan Akun", icon: <Settings />, path: "/akun" },
  { name: "Sign In", icon: <LogIn />, path: "/signin" },
  { name: "Sign Up", icon: <UserPlus />, path: "/signup" },
];

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="bg-[#3F9540] w-64 h-screen shadow-md px-5 py-6 hidden md:block text-white">
      {/* Logo dan Judul */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src="Logo FM.svg"
          alt="Logo Fresh Mart"
          className="w-10 h-10 object-contain"
        />
        <span className="text-2xl font-bold text-white">FRESH MART</span>
      </div>

      {/* Menu Utama */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive(item.path)
                ? "bg-[#E81F25] text-white font-semibold"
                : "text-white hover:bg-white hover:text-[#3F9540]"
            }`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Akun Section */}
      <div className="mt-10 text-xs font-semibold text-white uppercase tracking-wide">
        Akun
      </div>
      <nav className="mt-3 space-y-1">
        {accountItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive(item.path)
                ? "bg-[#E81F25] text-white font-semibold"
                : "text-white hover:bg-white hover:text-[#3F9540]"
            }`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

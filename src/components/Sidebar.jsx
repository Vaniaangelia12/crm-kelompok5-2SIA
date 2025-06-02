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
    <aside className="bg-white w-64 h-screen shadow-md px-5 py-6 hidden md:block">
      <div className="text-2xl font-semibold mb-8 text-gray-800">UMKM CRM</div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive(item.path)
                ? "bg-gray-200 text-gray-900 font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-10 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Akun
      </div>
      <nav className="mt-3 space-y-1">
        {accountItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
              isActive(item.path)
                ? "bg-gray-200 text-gray-900 font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

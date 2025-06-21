import {
  LayoutDashboard,
  Box,
  MessageCircle,
  Info,
  User,
  ClipboardList,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard />, path: '/user' },
  { name: 'Katalog Produk', icon: <Box />, path: '/user/produk' },
  { name: 'Umpan Balik', icon: <MessageCircle />, path: '/user/umpanbalik' },
  { name: 'FAQ', icon: <Info />, path: '/user/faq' },
  { name: 'Riwayat Pembelian', icon: <ClipboardList />, path: '/user/riwayat' },
];

const accountItems = [
  { name: 'Profil', icon: <User />, path: '/user/akun' },
  { name: 'Logout', icon: <LogOut />, path: '/logout' },
];

const UserSidebar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="bg-white w-64 h-screen shadow-lg px-4 py-6 hidden md:block border-r-2 border-gray-100">
      {/* Logo dengan warna tema */}
      <div className="text-2xl font-bold mb-8">
        <span className="text-[#E81F25]">Fresh</span>
        <span className="text-[#3F9540]"> Mart</span>
      </div>
      
      {/* Menu Utama */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-[#3F9540] text-white font-medium shadow-md'
                : 'text-gray-600 hover:bg-[#3F9540]/10 hover:text-[#3F9540]'
            }`}
          >
            <span className={`w-5 h-5 ${
              isActive(item.path) ? 'text-white' : 'text-[#3F9540]'
            }`}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Menu Akun */}
      <div className="mt-8">
        <div className="text-xs font-semibold text-gray-500 px-3 mb-2">AKUN</div>
        <nav className="space-y-1">
          {accountItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-[#E81F25] text-white font-medium shadow-md'
                  : 'text-gray-600 hover:bg-[#E81F25]/10 hover:text-[#E81F25]'
              }`}
            >
              <span className={`w-5 h-5 ${
                isActive(item.path) ? 'text-white' : 'text-[#E81F25]'
              }`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Style tambahan untuk visual yang lebih baik */}
      <style jsx>{`
        .transition-all {
          transition: all 0.2s ease;
        }
        .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </aside>
  )
}

export default UserSidebar
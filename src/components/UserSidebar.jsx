import {
  LayoutDashboard,
  Box,
  MessageCircle,
  Info,
  User,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoFreshMart from '../assets/images/logo_freshmart.png'; // Import the image

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/user' },
  { name: 'Katalog Produk', icon: Box, path: '/user/produk' },
  { name: 'Umpan Balik', icon: MessageCircle, path: '/user/umpanbalik' },
  { name: 'FAQ', icon: Info, path: '/user/faq' },
  { name: 'Riwayat Pembelian', icon: ClipboardList, path: '/user/riwayat' },
];

const accountItems = [
  { name: 'Profil', icon: User, path: '/user/akun' },
  { name: 'Logout', icon: LogOut, path: '/logout' },
];

const UserSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const primaryColor = '#E81F25';
  const secondaryColor = '#3F9540';

  return (
    <aside className="bg-white w-64 h-screen shadow-lg px-4 py-6 hidden md:block border-r-2 border-gray-100">
      {/* Logo dengan warna tema dan gambar */}
      <div className="flex items-center gap-2 mb-8"> {/* Added flex and items-center for alignment */}
        <img src={logoFreshMart} alt="Fresh Mart Logo" className="h-10 w-auto" /> {/* Added the logo image */}
        <span className="text-2xl font-bold">
          <span style={{ color: primaryColor }}>Fresh</span>
          <span style={{ color: secondaryColor }}> Mart</span>
        </span>
      </div>

      {/* Menu Utama */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? `bg-[${secondaryColor}] text-white font-medium shadow-md`
                  : `text-gray-600 hover:bg-[${secondaryColor}]/10 hover:text-[${secondaryColor}]`
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? 'text-white' : `text-[${secondaryColor}]`}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Menu Akun */}
      <div className="mt-8">
        <div className="text-xs font-semibold text-gray-500 px-3 mb-2">AKUN</div>
        <nav className="space-y-1">
          {accountItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? `bg-[${primaryColor}] text-white font-medium shadow-md`
                    : `text-gray-600 hover:bg-[${primaryColor}]/10 hover:text-[${primaryColor}]`
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? 'text-white' : `text-[${primaryColor}]`}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default UserSidebar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, MessageCircle, Info, ClipboardList, ShoppingCart, 
  Home, User, LogOut, ChevronRight, Percent, Shield 
} from 'lucide-react';

export default function Dashboard2() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('loggedUser'));

  // Menu navigasi utama
  const mainMenu = [
    { name: 'Katalog Produk', icon: Box, path: '/user/produk', color: 'bg-blue-100 text-blue-600' },
    { name: 'Umpan Balik', icon: MessageCircle, path: '/user/umpanbalik', color: 'bg-green-100 text-green-600' },
    { name: 'FAQ', icon: Info, path: '/user/faq', color: 'bg-purple-100 text-purple-600' },
    { name: 'Riwayat Pembelian', icon: ClipboardList, path: '/user/riwayat', color: 'bg-orange-100 text-orange-600' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser');
    navigate('/login');
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#E81F25] to-[#C2181B] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Selamat Datang di Fresh Mart</h1>
          <p className="mt-2">Hai, {user?.nama_lengkap || 'Pelanggan'}! Apa yang ingin Anda lakukan hari ini?</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Promo Banner */}
        <div className="mb-8 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Shopping at Fresh Mart is the Right Choice❤️🛍️🎊</h2>
              <p className="mb-4 md:mb-0 text-white">
              Branch of 
              <a 
                href="https://www.instagram.com/jumbomartpekanbaru/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-green-500 hover:text-blue-700 font-semibold transition-colors duration-200 ml-1"
              >
                @jumbomartpekanbaru
              </a>
            </p>
            </div>
            <button 
              onClick={() => navigate('/user/produk')}
              className="px-6 py-2 bg-white text-[#3F9540] rounded-lg font-semibold hover:bg-gray-100 transition flex items-center"
            >
              Belanja Sekarang <ChevronRight className="ml-1" size={18} />
            </button>
          </div>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainMenu.map((item, index) => (
            <div 
              key={index}
              onClick={() => navigate(item.path)}
              className={`${item.color} p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col items-center text-center`}
            >
              <div className="p-3 rounded-full bg-white mb-4">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-sm opacity-80">Klik untuk melihat lebih lanjut</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <ShoppingCart className="mr-2 text-[#E81F25]" />
            Mulai Berbelanja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/user/produk?category=sayuran')}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#3F9540] transition cursor-pointer"
            >
              <h3 className="font-semibold text-[#3F9540]">Sayuran Segar</h3>
              <p className="text-sm text-gray-600 mt-1">Produk pilihan langsung dari petani</p>
            </div>
            <div 
              onClick={() => navigate('/user/produk?category=buah')}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#3F9540] transition cursor-pointer"
            >
              <h3 className="font-semibold text-[#3F9540]">Buah Import</h3>
              <p className="text-sm text-gray-600 mt-1">Kualitas premium berbagai negara</p>
            </div>
            <div 
              onClick={() => navigate('/user/produk?category=daging')}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#3F9540] transition cursor-pointer"
            >
              <h3 className="font-semibold text-[#3F9540]">Daging & Ikan</h3>
              <p className="text-sm text-gray-600 mt-1">Segar dan higienis</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="p-4 text-[#E81F25] flex flex-col items-center"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => navigate('/user/produk')}
            className="p-4 text-gray-600 flex flex-col items-center"
          >
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Belanja</span>
          </button>
          <button 
            onClick={() => navigate('/user/riwayat')}
            className="p-4 text-gray-600 flex flex-col items-center"
          >
            <ClipboardList size={20} />
            <span className="text-xs mt-1">Riwayat</span>
          </button>
          <button 
            onClick={() => navigate('/user/profile')}
            className="p-4 text-gray-600 flex flex-col items-center"
          >
            <User size={20} />
            <span className="text-xs mt-1">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
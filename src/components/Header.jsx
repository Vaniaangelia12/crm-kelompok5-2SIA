import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  // Pemetaan nama berdasarkan segment URL
  const renameMap = {
    // === USER ===
    user: 'Dashboard',
    produk: 'Katalog Produk',
    umpanbalik: 'Umpan Balik',
    faq: 'FAQ',
    riwayat: 'Riwayat Pembelian',
    akun: 'Profil',

    // === ADMIN ===
    '': 'Dashboard', // root path untuk admin
    riwayatpembelian: 'Riwayat Pembelian',
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const readableSegments = pathSegments.map((seg, index) => {
    const renamed = renameMap[seg];
    return renamed || (seg.charAt(0).toUpperCase() + seg.slice(1));
  });

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        Pages
        {readableSegments.length > 0 ? (
          readableSegments.map((seg, idx) => (
            <span key={idx} className="text-gray-900 font-semibold">
              {' / '}{seg}
            </span>
          ))
        ) : (
          <span className="text-gray-900 font-semibold"> Dashboard</span>
        )}
      </div>

      {/* Search box */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Type here..."
            className="px-4 py-2 pl-10 text-sm border rounded-full focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
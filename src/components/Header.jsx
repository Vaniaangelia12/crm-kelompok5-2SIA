import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  // Comprehensive mapping of full paths to readable names for breadcrumbs
  const pathDisplayNameMap = {
    '/': 'Dashboard',
    '/produk': 'Manajemen Produk',
    '/umpanbalik': 'Manajemen Umpan Balik',
    '/faq': 'Manajemen FAQ',
    '/akun': 'Profil Admin',
    '/riwayatpembelian': 'Riwayat Pembelian',
    '/notifikasi': 'Kirim Notifikasi',
    '/jadwalpromo': 'Jadwal Promosi',
    '/listuser': 'Daftar Pengguna',
    '/user': 'Dashboard Pengguna',
    '/user/produk': 'Katalog Produk',
    '/user/faq': 'FAQ Pengguna',
    '/user/umpanbalik': 'Umpan Balik',
    '/user/akun': 'Profil Pengguna',
    '/user/riwayat': 'Riwayat Pembelian',
    '/login': 'Login',
    '/register': 'Registrasi',
    '/forgot': 'Lupa Password',
    '/logout': 'Logout',
    '/reset-password-confirm': 'Reset Password',
  };

  // Function to get breadcrumb segments dynamically
  const getBreadcrumbSegments = () => {
    const path = location.pathname;
    const segments = [];

    // Always start with 'Pages'
    segments.push('Pages');

    // Handle specific dashboard paths first
    if (path === '/') {
      segments.push('Dashboard');
      return segments;
    }
    if (path === '/user') {
      segments.push('Dashboard Pengguna');
      return segments;
    }

    // Handle nested paths starting with '/user'
    if (path.startsWith('/user/')) {
      segments.push('Dashboard Pengguna'); // First segment for user dashboard
      const subPath = path.substring(5); // Get path after '/user'
      const fullMappedName = pathDisplayNameMap[path]; // Try to find full path match
      if (fullMappedName) {
        segments.push(fullMappedName);
      } else {
        // Fallback for dynamic or unmapped user sub-paths (e.g., if there were /user/settings/profile)
        // This splits by '/' and capitalizes each word, joining with spaces.
        segments.push(subPath.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '));
      }
    } else {
      // For admin paths or other root-level paths (e.g., /login, /register)
      const fullMappedName = pathDisplayNameMap[path];
      if (fullMappedName) {
        segments.push(fullMappedName);
      } else {
        // Fallback for unmapped root paths
        const parts = path.split('/').filter(Boolean);
        if (parts.length > 0) {
          segments.push(parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '));
        }
      }
    }
    return segments;
  };

  const breadcrumbSegments = getBreadcrumbSegments();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        {breadcrumbSegments.map((seg, idx) => (
          <span key={idx} className={`${idx === 0 ? '' : 'text-gray-900 font-semibold'}`}>
            {idx === 0 ? seg : ` / ${seg}`}
          </span>
        ))}
      </div>
    </header>
  );
};

export default Header;

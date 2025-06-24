import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/MainLayouts';
import ProductManagement from './pages/Product';
import UmpanBalik from './pages/UmpanBalik';
import FAQ from './pages/FAQ';
import Profile from './pages/Profil';
import UserLayout from './components/UserLayout';
import DashboardUser from './pages/User/Dashboard2';
import ProductUser from './pages/User/Product2';
import FAQUser from './pages/User/FAQ2';
import UmpanBalikUserPribadi from './pages/User/UmpanBalik2';
import ProfilUser from './pages/User/Profil2';
import RiwayatPembelianUserPribadi from './pages/User/RiwayatPembelian2';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import RiwayatPembelian from './pages/RiwayatPembelian';
import ListUser from './pages/ListUser';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'; // <--- IMPORT KOMPONEN BARU INI
import SendNotification from './pages/SendNotification';
import SchedulePromotion from './pages/SchedulePromotion';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/logout" element={<Logout />} />
      {/* RUTE BARU UNTUK KONFIRMASI RESET PASSWORD */}
      <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} /> {/* <--- TAMBAHKAN ROUTE INI */}

      {/* Semua route yang lain dibungkus ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/produk" element={<ProductManagement />} />
        <Route path="/umpanbalik" element={<UmpanBalik />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/akun" element={<Profile />} />
        <Route path="/riwayatpembelian" element={<RiwayatPembelian />} />
        <Route path="/notifikasi" element={<SendNotification />} />
        <Route path="/jadwalpromo" element={<SchedulePromotion />} />
        <Route path="/listuser" element={<ListUser />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/user" element={<DashboardUser />} />
        <Route path="/user/produk" element={<ProductUser />} />
        <Route path="/user/faq" element={<FAQUser />} />
        <Route path="/user/umpanbalik" element={<UmpanBalikUserPribadi />} />
        <Route path="/user/akun" element={<ProfilUser />} />
        <Route path="/user/riwayat" element={<RiwayatPembelianUserPribadi />} />
      </Route>
    </Routes>
  );
}
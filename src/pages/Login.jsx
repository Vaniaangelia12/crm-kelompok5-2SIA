import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Import Supabase client

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Bersihkan pesan error sebelumnya

    try {
      // LANGKAH 1: Autentikasi pengguna menggunakan Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Supabase Auth Login Error:', authError.message, authError.status);
        if (authError.message.includes('Invalid login credentials') || authError.status === 400) {
          setErrorMessage('Email atau password salah. Silakan coba lagi.');
        } else if (authError.message.includes('Email not confirmed')) {
          setErrorMessage('Email Anda belum terverifikasi. Silakan cek inbox Anda.');
        } else {
          setErrorMessage('Terjadi kesalahan saat login: ' + authError.message);
        }
        return; // Hentikan proses jika login auth gagal
      }

      // Jika login Supabase Auth berhasil, kita mendapatkan ID pengguna yang diautentikasi
      const userId = authData.user.id;
      console.log('User logged in via Supabase Auth. User ID:', userId);

      // LANGKAH 2: Ambil data profil lengkap pengguna dari tabel 'pengguna'
      console.log('Fetching user profile for ID:', userId);
      const { data: userData, error: profileError } = await supabase
        .from('pengguna')
        .select('id, email, role, total_saldo, total_poin, tanggal_bergabung, nik, nama_lengkap') // Tambahkan nik dan nama_lengkap untuk memastikan semua kolom ada
        .eq('id', userId) // Filter berdasarkan ID user yang didapat dari Supabase Auth
        .single();

      if (profileError) {
        console.error('Error fetching user profile data (profileError object):', profileError);
        console.error('Error fetching user profile data (profileError message):', profileError.message);
        setErrorMessage('Gagal memuat data profil Anda. Silakan coba lagi.');
        await supabase.auth.signOut(); // Logout dari Supabase Auth jika gagal memuat profil
        return;
      }
      
      if (!userData) {
        console.error('User data not found in "pengguna" table for ID:', userId);
        setErrorMessage('Data profil tidak ditemukan di database. Harap hubungi administrator.');
        await supabase.auth.signOut();
        return;
      }

      console.log('User profile data loaded:', userData);

      // LANGKAH 3: Simpan data user yang relevan ke sessionStorage
      sessionStorage.setItem('loggedUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        nama_lengkap: userData.nama_lengkap, // Simpan juga nama lengkap jika sering diakses
      }));

      // Simpan saldo pengguna
      sessionStorage.setItem(`userSaldo_${userData.id}`, (userData.total_saldo || 0).toString());
      // Simpan poin pengguna
      sessionStorage.setItem(`userPoin_${userData.id}`, (userData.total_poin || 0).toString());
      // Simpan tanggal bergabung
      sessionStorage.setItem(`userJoinDate_${userData.id}`, userData.tanggal_bergabung || '');


      alert('Login Berhasil!');

      // LANGKAH 4: Arahkan berdasarkan role
      if (userData.role === 'admin') {
        navigate('/'); // dashboard admin
      } else {
        navigate('/user'); // dashboard user
      }
    } catch (error) {
      console.error('Login gagal (catch block general):', error.message);
      if (!errorMessage) { // Hanya set jika belum ada pesan error spesifik
        setErrorMessage('Login gagal: ' + error.message);
      }
    } finally {
      setLoading(false); // Hentikan loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3F9540]/20 to-[#E81F25]/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-100 space-y-8">
        {/* Header dengan logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#3F9540]/10 p-4 rounded-full">
              <svg className="w-10 h-10 text-[#3F9540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            <span className="text-[#3F9540]">Masuk</span> Akun
          </h2>
          <p className="mt-2 text-gray-600">
            Selamat datang kembali di FreshMart
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Login Gagal!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Disable input saat loading
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Disable input saat loading
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lupa Password */}
          <div className="flex items-center justify-end">
            <Link
              to="/forgot"
              className="text-sm font-medium text-[#E81F25] hover:text-[#C2181B] transition duration-150"
            >
              Lupa Password?
            </Link>
          </div>

          {/* Tombol Login */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-50 transition duration-150"
              disabled={loading} // Disable tombol saat loading
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Link Daftar Akun */}
        <div className="text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-medium text-[#3F9540] hover:text-[#2E7C30] transition duration-150"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
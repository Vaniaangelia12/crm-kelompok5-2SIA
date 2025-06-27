import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Sesuaikan path ini jika perlu
import { Loader2 } from 'lucide-react';

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionSet, setIsSessionSet] = useState(false); // State untuk melacak apakah sesi sudah diatur

  useEffect(() => {
    // Fungsi untuk mendapatkan token dari URL fragment
    const getUrlHashParams = () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      return {
        type: params.get('type'),
        accessToken: params.get('access_token'),
        expiresIn: params.get('expires_in'),
        refreshToken: params.get('refresh_token'),
      };
    };

    const handleSession = async () => {
      const { type, accessToken } = getUrlHashParams();

      if (type === 'recovery' && accessToken) {
        setLoading(true);
        try {
          // Mengatur sesi Supabase menggunakan access token dari URL
          const { error } = await supabase.auth.setSession({ access_token: accessToken });

          if (error) {
            console.error("Error setting Supabase session:", error.message);
            setMessage('Gagal mengautentikasi sesi. Link mungkin tidak valid atau kedaluwarsa.');
            setIsSessionSet(false);
          } else {
            setMessage('Sesi berhasil dikonfirmasi. Silakan masukkan password baru Anda.');
            setIsSessionSet(true); // Sesi berhasil diatur
          }
        } catch (err) {
          console.error("Unexpected error during session setup:", err);
          setMessage('Terjadi kesalahan tak terduga saat menyiapkan sesi.');
          setIsSessionSet(false);
        } finally {
          setLoading(false);
        }
      } else {
        // Jika tidak ada token atau type bukan 'recovery', arahkan kembali ke login/forgot
        setMessage('Link reset password tidak valid atau kedaluwarsa.');
        setLoading(false);
        setIsSessionSet(false);
        // Delay navigasi agar pesan terlihat
        setTimeout(() => navigate('/forgot'), 3000); 
      }
    };

    handleSession();
    
    // Cleanup URL fragment agar link tidak digunakan lagi
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

  }, [navigate]); // navigate sebagai dependency useCallback

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Password baru dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      // Mengupdate password pengguna yang sedang aktif sesinya
      const { data, error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        console.error("Error updating password:", error.message);
        setMessage("Gagal mengatur ulang password: " + error.message);
      } else {
        console.log("Password updated successfully:", data);
        setMessage("Password Anda berhasil diatur ulang!");
        // Redirect ke halaman login setelah reset berhasil
        setTimeout(() => navigate('/login', { state: { resetSuccess: true } }), 2000);
      }
    } catch (err) {
      console.error("Unexpected error during password reset:", err);
      setMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3F9540]/20 to-[#E81F25]/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-100 space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#3F9540]/10 p-4 rounded-full">
              <svg className="w-10 h-10 text-[#3F9540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zM9 11a4 4 0 118 0 4 4 0 01-8 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            <span className="text-[#3F9540]">Atur</span> Ulang Password
          </h2>
          <p className="mt-2 text-gray-600">
            {isSessionSet ? "Masukkan password baru Anda di bawah." : "Sedang memverifikasi link reset..."}
          </p>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin h-8 w-8 text-[#3F9540] mx-auto" />
            <p className="text-gray-600 mt-2">Memuat...</p>
          </div>
        )}

        {!loading && message && (
          <p className={`mt-4 text-center text-sm ${message.includes("Gagal") || message.includes("tidak valid") || message.includes("tidak cocok") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}

        {isSessionSet && !loading && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
              />
            </div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} /> Mengatur ulang...
                </>
              ) : (
                "Atur Ulang Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
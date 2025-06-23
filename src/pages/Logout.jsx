import React, { useState, useEffect } from "react"; // Import useState
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true); // State untuk mengontrol visibilitas modal

  // Kita akan menunda efek agar modal bisa dirender terlebih dahulu
  useEffect(() => {
    if (!showModal) return; // Jangan lakukan apa-apa jika modal tidak ditampilkan

    // Langsung tampilkan modal ketika komponen pertama kali dirender
    // (logic akan ditangani di JSX di bawah)
  }, [showModal]);

  const handleLogout = () => {
    sessionStorage.removeItem("loggedUser");
    setShowModal(false); // Sembunyikan modal setelah logout
    navigate("/login", { replace: true });
  };

  const handleCancel = () => {
    setShowModal(false); // Sembunyikan modal
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  if (!showModal) {
    return null; // Jika modal tidak ditampilkan, jangan render apa-apa
  }

  return (
    // Backdrop modal
   <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-50 backdrop-blur-sm">
  {/* Konten modal */}
  <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 transform transition-all duration-200 ease-out">
    {/* Ikon dan Header */}
    <div className="flex flex-col items-center mb-6">
      <div className="w-16 h-16 rounded-full bg-[#E81F25]/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#E81F25]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Keluar Akun?</h2>
    </div>
    
    {/* Pesan Konfirmasi */}
    <p className="text-gray-600 mb-8 text-center">
      Apakah Anda yakin ingin keluar dari akun Anda sekarang?
    </p>
    
    {/* Tombol Aksi */}
    <div className="flex flex-col sm:flex-row justify-center gap-3">
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-gradient-to-r from-[#E81F25] to-[#C2181B] text-white font-medium rounded-lg shadow-md hover:from-[#C2181B] hover:to-[#E81F25] transition-all focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:ring-opacity-50 flex-1"
      >
        Ya, Keluar
      </button>
      <button
        onClick={handleCancel}
        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 flex-1"
      >
        Batal
      </button>
    </div>
  </div>
</div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Mail, MessageCircle, Send, User } from 'lucide-react';

const kategoriOptions = ["keluhan", "saran", "pertanyaan"];

export default function UmpanBalikUserPribadi() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [kategori, setKategori] = useState("");
  const [pesan, setPesan] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("loggedUser"));
    if (user && user.role === "user") {
      setLoggedUser(user);
    } else {
      alert("Silakan login sebagai user.");
      navigate("/login");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!kategori || !pesan.trim()) {
      alert("Kategori dan umpan balik wajib diisi.");
      return;
    }

    const feedback = {
      nama: loggedUser.nama_lengkap,
      email: loggedUser.email,
      kategori,
      umpan_balik: pesan,
      waktu: new Date().toISOString()
    };

    // Simulasi kirim ke server atau simpan sementara
    console.log("Umpan balik terkirim:", feedback);

    alert("Terima kasih atas umpan balik Anda!");
    setKategori("");
    setPesan("");
  };

  if (!loggedUser) return null;

  return (
    <div className="mt-4 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {/* Header dengan warna tema */}
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-[#3F9540]/10 mr-4">
          <MessageCircle className="text-[#3F9540] w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kirim Umpan Balik</h2>
          <p className="text-gray-600">Sampaikan keluhan, saran, atau pertanyaan Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Pengguna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
            <div className="relative">
              <input 
                type="text" 
                value={loggedUser.nama_lengkap} 
                readOnly 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User className="text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={loggedUser.email} 
                readOnly 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Mail className="text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
          <div className="relative">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-[#3F9540] focus:border-transparent cursor-pointer"
              required
            >
              <option value="">Pilih kategori umpan balik</option>
              {kategoriOptions.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Umpan Balik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Isi Umpan Balik</label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            rows={5}
            placeholder="Tulis pesan Anda secara detail di sini..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent shadow-sm"
            required
          />
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition-all flex items-center cursor-pointer"
          >
            <Send className="w-5 h-5 mr-2" />
            Kirim Umpan Balik
          </button>
        </div>
      </form>
    </div>
  );
}
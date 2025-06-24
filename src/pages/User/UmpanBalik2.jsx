import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Mail, MessageCircle, Send, User } from 'lucide-react';
import { supabase } from '../../supabase'; // Import Supabase client

const kategoriOptions = ["keluhan", "saran", "pertanyaan"];

export default function UmpanBalikUserPribadi() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [kategori, setKategori] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State untuk error
  const navigate = useNavigate();

  // Fungsi utilitas untuk memvalidasi format UUID
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  };

  // Mengambil detail pengguna dari Supabase (nama lengkap, email)
  const fetchUserDetails = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('pengguna') // Asumsi tabel pengguna
      .select('nama_lengkap, email, role') // Ambil nama_lengkap, email, dan role
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user details:", error.message);
      setError("Gagal memuat detail pengguna: " + error.message);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem("loggedUser"));
    
    if (!userSession) {
      alert("Silakan login sebagai user.");
      navigate("/login");
      return;
    }

    // Validasi ID pengguna
    if (!isValidUUID(userSession.id)) {
      setError('ID pengguna tidak dalam format yang benar (UUID). Harap login ulang.');
      alert('ID pengguna tidak valid. Silakan login ulang.');
      navigate("/login");
      return;
    }

    // Ambil detail lengkap pengguna dari database
    fetchUserDetails(userSession.id).then(details => {
      if (details && details.role === "user") {
        setLoggedUser({
          id: userSession.id,
          email: details.email,
          nama_lengkap: details.nama_lengkap,
          role: details.role,
        });
      } else {
        alert("Silakan login sebagai user.");
        navigate("/login");
      }
    });
  }, [navigate, fetchUserDetails, isValidUUID]); // Tambahkan isValidUUID ke dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!kategori || !pesan.trim()) {
      alert("Kategori dan umpan balik wajib diisi.");
      setLoading(false);
      return;
    }

    if (!loggedUser || !loggedUser.id) {
        alert("Informasi pengguna tidak tersedia. Harap login kembali.");
        setLoading(false);
        navigate("/login");
        return;
    }

    const feedbackData = {
      // Sesuaikan dengan nama kolom di tabel umpan_balik Anda
      // id: loggedUser.id, // Kolom 'id' di tabel umpan_balik Anda adalah PRIMARY KEY dan DEFAULT gen_random_uuid().
                        // Jadi, TIDAK PERLU DIKIRIMKAN secara manual dari client, Supabase akan menggeneratenya.
                        // Jika Anda mengirimkannya, dan itu bukan gen_random_uuid, bisa error.
                        // Kita HANYA akan mengirimkan kolom yang bukan auto-generated PRIMARY KEY.
      nama: loggedUser.nama_lengkap, // Diubah dari nama_pengguna
      email: loggedUser.email, // Sudah benar
      kategori: kategori, // Diubah dari kategori_umpan_balik
      isi: pesan, // Diubah dari isi_umpan_balik
      tanggal_kirim: new Date().toISOString() // Diubah dari waktu_kirim
    };

    try {
      const { error: supabaseError } = await supabase
        .from('umpan_balik') // Nama tabel di Supabase
        .insert([feedbackData]);

      if (supabaseError) {
        throw supabaseError;
      }

      alert("Terima kasih atas umpan balik Anda! Pesan Anda telah terkirim.");
      setKategori("");
      setPesan("");
    } catch (err) {
      console.error("Gagal mengirim umpan balik:", err.message);
      setError("Gagal mengirim umpan balik: " + err.message);
      alert("Terjadi kesalahan saat mengirim umpan balik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loggedUser) {
    // Tampilkan loading atau pesan lain sebelum loggedUser terisi
    return (
      <div className="mt-4 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
        <p className="text-gray-600">Memuat informasi pengguna...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 max_w-6xl mx_auto bg_white p_6 rounded_xl shadow_lg border border_red_200 text_center">
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    );
  }

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
                value={loggedUser.nama_lengkap || ''} // Pastikan ada fallback jika null
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
                value={loggedUser.email || ''} // Pastikan ada fallback jika null
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
              disabled={loading} // Disable saat loading
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
            disabled={loading} // Disable saat loading
          />
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition-all flex items-center cursor-pointer"
            disabled={loading} // Disable tombol saat loading
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? 'Mengirim...' : 'Kirim Umpan Balik'}
          </button>
        </div>
      </form>
    </div>
  );
}
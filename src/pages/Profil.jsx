import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Import Supabase client
import {
  User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash,
  Gift, Coins, Loader2
} from 'lucide-react';

export default function Profile2() {
  const navigate = useNavigate();
  const [loggedUserSession, setLoggedUserSession] = useState(null); // Data user dari sessionStorage

  const [userData, setUserData] = useState(null); // Data profil lengkap dari Supabase
  const [userTransactions, setUserTransactions] = useState([]); // Data transaksi dari Supabase

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const [totalPoin, setTotalPoin] = useState(0); // Akan diambil dari DB
  const [poinToRedeem, setPoinToRedeem] = useState('');
  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false); // Loading state for redeem

  const [totalSaldo, setTotalSaldo] = useState(0); // Akan diambil dari DB

  const [loadingProfile, setLoadingProfile] = useState(true); // Loading untuk memuat profil
  const [savingProfile, setSavingProfile] = useState(false); // Loading untuk menyimpan profil
  const [error, setError] = useState(null); // State untuk error umum

  // Fungsi utilitas untuk memvalidasi format UUID
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  };

  // Fetch user details and transactions from Supabase
  const fetchData = useCallback(async (userId) => {
    setLoadingProfile(true); // Pastikan loading true saat memulai fetch
    setError(null);
    console.log("Starting fetchData for userId:", userId);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('pengguna')
        .select('id, nik, nama_lengkap, email, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_hp, tanggal_bergabung, total_poin, total_saldo, role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error (object):", profileError);
        console.error("Profile fetch error (message):", profileError.message);
        throw profileError;
      }
      if (!profileData) {
        console.error("Profile data not found for userId:", userId);
        throw new Error("Data profil tidak ditemukan di database.");
      }
      console.log("Profile data fetched successfully:", profileData);
      setUserData(profileData);
      setEditedData({
        nama_lengkap: profileData.nama_lengkap,
        email: profileData.email,
        tempat_lahir: profileData.tempat_lahir,
        tanggal_lahir: profileData.tanggal_lahir,
        jenis_kelamin: profileData.jenis_kelamin,
        alamat: profileData.alamat,
        nomor_hp: profileData.nomor_hp,
      });
      setTotalPoin(profileData.total_poin || 0);
      setTotalSaldo(profileData.total_saldo || 0);

      // Fetch user transactions if role is user
      if (profileData.role === "user") {
        console.log("Fetching transactions for user role.");
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transaksi') // Asumsi nama tabel transaksi Anda adalah 'transaksi'
          .select('id, userId, tanggalPembelian, items') // Pastikan Anda mengambil kolom 'items' yang berisi data belanja
          .eq('userId', userId);

        if (transactionsError) {
          console.error("Transactions fetch error (object):", transactionsError);
          console.error("Transactions fetch error (message):", transactionsError.message);
          throw transactionsError;
        }
        console.log("Transactions data fetched successfully:", transactionsData);
        setUserTransactions(transactionsData || []);
      } else {
        console.log("User is not 'user' role, skipping transaction fetch.");
        setUserTransactions([]); // Pastikan ini direset untuk non-user
      }

    } catch (err) {
      console.error("Caught error in fetchData:", err.message);
      setError("Gagal memuat data profil: " + err.message);
      // Jika terjadi error fatal saat memuat, mungkin paksa logout
      // await supabase.auth.signOut(); // Nonaktifkan ini sementara untuk debugging
      // navigate("/login"); // Nonaktifkan ini sementara untuk debugging
    } finally {
      console.log("fetchData finally block: Setting loadingProfile to false.");
      setLoadingProfile(false); // Pastikan loading menjadi false pada akhirnya
    }
  }, [navigate]);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!user || !user.id || !isValidUUID(user.id)) {
      alert("Anda perlu login untuk melihat profil.");
      navigate("/login");
      return;
    }
    setLoggedUserSession(user);

    // Panggil fetchData langsung tanpa dependensi
    const loadData = async () => {
      await fetchData(user.id);
    };
    loadData();
  }, []); // <- Kosong, agar hanya jalan sekali saat komponen mount


  // Fungsi getStatusMembership - menggunakan transaksi asli
  const getStatusMembership = useCallback((userProfile, transactions) => {
    if (!userProfile || !userProfile.tanggal_bergabung) return "Baru";

    const joinedAt = new Date(userProfile.tanggal_bergabung);
    const now = new Date();
    const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));

    if (selisihHari < 7 && (!transactions || transactions.length === 0)) return "Baru";

    const transaksi7Hari = (transactions || []).filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7);
    if (transaksi7Hari.length >= 5) return "Loyal";
    if (transaksi7Hari.length >= 2) return "Aktif";

    const transaksi30Hari = (transactions || []).filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 30);
    if (transaksi30Hari.length === 0) return "Pasif";

    return "Aktif";
  }, []);

  // Membungkus handleChange dengan useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  }, [setEditedData]);

  const handleRedeemPoin = async () => {
    const poin = parseInt(poinToRedeem);

    if (isNaN(poin) || poin <= 0) {
      setRedeemMessage("Jumlah poin harus angka positif.");
      return;
    }
    if (poin < 10) {
      setRedeemMessage("Minimal penukaran adalah 10 poin.");
      return;
    }
    if (poin > totalPoin) {
      setRedeemMessage("Poin Anda tidak mencukupi.");
      return;
    }

    setRedeemLoading(true);
    setRedeemMessage("");
    setError(null);

    const saldoEarned = poin * 100; // Contoh: 1 poin = Rp 100
    const newTotalPoin = totalPoin - poin;
    const newTotalSaldo = totalSaldo + saldoEarned;

    try {
      // Update poin dan saldo di Supabase
      const { error: supabaseError } = await supabase
        .from('pengguna')
        .update({
          total_poin: newTotalPoin,
          total_saldo: newTotalSaldo
        })
        .eq('id', userData.id);

      if (supabaseError) {
        throw supabaseError;
      }

      setTotalPoin(newTotalPoin);
      setTotalSaldo(newTotalSaldo);
      setPoinToRedeem('');
      setRedeemMessage(`Berhasil menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`);

      // Update sessionStorage agar konsisten
      sessionStorage.setItem(`userPoin_${userData.id}`, newTotalPoin.toString());
      sessionStorage.setItem(`userSaldo_${userData.id}`, newTotalSaldo.toString());

    } catch (err) {
      console.error("Gagal menukar poin:", err.message);
      setRedeemMessage("Gagal menukar poin: " + err.message);
      setError("Terjadi kesalahan saat penukaran poin: " + err.message);
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSave = async () => {
    setSavingProfile(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('pengguna')
        .update(editedData)
        .eq('id', userData.id);

      if (supabaseError) {
        throw supabaseError;
      }

      setUserData(prev => ({ ...prev, ...editedData }));
      setIsEditing(false);
      alert("Perubahan berhasil disimpan!");
    } catch (err) {
      console.error("Error saving profile:", err.message);
      setError("Gagal menyimpan profil: " + err.message);
      alert("Terjadi kesalahan saat menyimpan profil: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset editedData ke nilai userData saat ini jika dibatalkan
    if (userData) {
      setEditedData({
        nama_lengkap: userData.nama_lengkap,
        email: userData.email,
        tempat_lahir: userData.tempat_lahir,
        tanggal_lahir: userData.tanggal_lahir,
        jenis_kelamin: userData.jenis_kelamin,
        alamat: userData.alamat,
        nomor_hp: userData.nomor_hp,
      });
    }
  };

  // Membungkus formatTanggal dengan useCallback agar bisa diteruskan sebagai prop
  const formatTanggal = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string for formatting:", dateString);
      return 'Tanggal tidak valid';
    }
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []); // Dependensi kosong karena tidak ada variabel eksternal yang berubah

  const freshGreen = '#3F9540';
  const freshGreenDark = '#2E7C30';

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#3F9540] mx-auto mb-4" />
          <p className="text-gray-700">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center border border-red-400 bg-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error!</h2>
          <p className="text-red-700">{error}</p>
          <button onClick={() => navigate("/login")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Login Ulang</button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: Pengguna tidak ditemukan!</h2>
          <p className="text-gray-700">Data profil tidak dapat dimuat. Mohon coba login kembali.</p>
          <button onClick={() => navigate("/login")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-7xl border border-gray-200">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-8 md:mb-10">Profil Pengguna</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
          <ProfileFieldFixed label="NIK" value={userData.nik} icon={<Hash size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          {/* Meneruskan formatTanggal sebagai prop ke ProfileField */}
          <ProfileField label="Nama Lengkap" name="nama_lengkap" value={isEditing ? editedData.nama_lengkap : userData.nama_lengkap} icon={<User size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileField label="Email" name="email" type="email" value={isEditing ? editedData.email : userData.email} icon={<Mail size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileField label="Tempat Lahir" name="tempat_lahir" value={isEditing ? editedData.tempat_lahir : userData.tempat_lahir} icon={<MapPin size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileField label="Tanggal Lahir" name="tanggal_lahir" type="date" value={isEditing ? editedData.tanggal_lahir : userData.tanggal_lahir} icon={<Calendar size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileField label="Jenis Kelamin" name="jenis_kelamin" type="select" options={['Laki-laki', 'Perempuan']} value={isEditing ? editedData.jenis_kelamin : userData.jenis_kelamin} icon={<User size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileField label="Alamat" name="alamat" value={isEditing ? editedData.alamat : userData.alamat} icon={<MapPin size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} type="textarea" freshGreen={freshGreen} freshGreenDark={freshGreenDark} className="col-span-1 sm:col-span-2 lg:col-span-3" formatTanggal={formatTanggal} />
          <ProfileField label="Nomor HP" name="nomor_hp" type="tel" value={isEditing ? editedData.nomor_hp : userData.nomor_hp} icon={<Phone size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} formatTanggal={formatTanggal} />
          <ProfileFieldFixed
            label="Status Membership"
            value={getStatusMembership(userData, userTransactions)} // Menggunakan userTransactions
            icon={<Award size={20} color={freshGreenDark} />}
            className="col-span-1 sm:col-span-2 lg:col-span-1"
            freshGreenDark={freshGreenDark}
          />
          <ProfileFieldFixed
            label="Total Saldo"
            value={formatRupiah(totalSaldo)}
            icon={<Coins size={20} color={freshGreenDark} />}
            className="col-span-1 sm:col-span-2 lg:col-span-1"
            freshGreenDark={freshGreenDark}
          />

          {/* Form Penukaran Poin (Hanya untuk Role 'user') */}
          {userData.role === "user" && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 col-span-full shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tukar Poin Membership Anda</h3>

              {/* Informasi Poin Saat Ini */}
              <div className="mb-4 text-gray-700">
                <p className="font-semibold text-lg">Poin Anda Saat Ini: <span className="text-[#3F9540]">{totalPoin} Poin</span></p>
                <p className="text-sm text-gray-500 mt-1">
                  Anda mendapatkan 1 Poin untuk setiap kelipatan Rp 10.000 transaksi.
                </p>
              </div>

              {/* Kriteria Penukaran */}
              <div className="mb-6 p-3 bg-[#E81F25]/10 rounded-md border border-[#E81F25]/20">
                <p className="font-semibold text-[#E81F25]">Kriteria Penukaran Poin:</p>
                <ul className="list-disc list-inside text-sm text-[#E81F25]">
                  <li>Minimal penukaran: <span className="font-bold">10 Poin</span></li>
                  <li>Poin yang ditukarkan akan mengurangi total poin Anda.</li>
                  <li>Poin yang sudah ditukar tidak dapat dikembalikan.</li>
                </ul>
              </div>

              {/* Input dan Tombol Penukaran */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="number"
                  min="10"
                  max={totalPoin}
                  value={poinToRedeem === 0 ? '' : poinToRedeem}
                  onChange={(e) => setPoinToRedeem(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="p-3 border border-gray-300 rounded-md w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#3F9540] transition-all"
                  placeholder="Jumlah poin (min 10)"
                  disabled={redeemLoading}
                />
                <button
                  onClick={handleRedeemPoin}
                  disabled={
                    redeemLoading ||
                    poinToRedeem < 10 ||
                    poinToRedeem > totalPoin ||
                    isNaN(poinToRedeem) ||
                    poinToRedeem === ''
                  }
                  className="px-6 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white rounded-md font-semibold hover:from-[#2E7C30] hover:to-[#3F9540] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer flex items-center justify-center"
                >
                  {redeemLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} /> Menukar...
                    </>
                  ) : (
                    "Tukarkan Poin"
                  )}
                </button>
              </div>

              {/* Pesan Setelah Penukaran */}
              {redeemMessage && (
                <p className={`text-sm mt-3 ${redeemMessage.includes("berhasil") ? "text-green-600" : "text-red-600"} font-medium`}>
                  {redeemMessage}
                </p>
              )}

              {/* Pesan Validasi Input (jika diperlukan) */}
              {poinToRedeem !== '' && poinToRedeem < 10 && (
                <p className="text-sm mt-2 text-red-500">Minimal penukaran adalah 10 poin.</p>
              )}
              {poinToRedeem > totalPoin && (
                <p className="text-sm mt-2 text-red-500">Poin tidak mencukupi.</p>
              )}
              {poinToRedeem === '' && !redeemMessage && ( // Tampilkan ini hanya jika input kosong dan belum ada pesan redeem
                <p className="text-sm mt-2 text-gray-500">Masukkan jumlah poin yang ingin ditukar.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-10 flex justify-center space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-5 py-2.5 bg-[#3F9540] text-white font-semibold rounded-lg shadow-md hover:bg-[#2E7C30] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 text-base cursor-pointer"
            >
              <PenTool size={18} className="mr-2" /> Edit Profil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={savingProfile}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-semibold rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 text-base cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" /> Simpan
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={savingProfile}
                className="flex items-center px-5 py-2.5 bg-[#E81F25] text-white font-semibold rounded-lg shadow-md hover:bg-[#C2181B] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:ring-opacity-75 text-base cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <X size={18} className="mr-2" /> Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen ProfileField (untuk bidang yang bisa di-edit)
// Menerima formatTanggal sebagai prop
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, freshGreen, freshGreenDark, className, formatTanggal }) => (
  <div className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {icon} <span>{label}</span>
    </p>
    {isEditing ? (
      type === "textarea" ? (
        <textarea name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border resize-y min-h-[40px]" style={{ '--fresh-green': freshGreen }} rows="3"></textarea>
      ) : type === "date" ? ( // Handle date type
        <input type="date" name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border" style={{ '--fresh-green': freshGreen }} />
      ) : type === "select" ? ( // Handle select type
        <select name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 bg-white box-border" style={{ '--fresh-green': freshGreen }}>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border" style={{ '--fresh-green': freshGreen }} />
      )
    ) : (
      <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">
        {type === "date" ? formatTanggal(value) : value || '-'}
      </p>
    )}
  </div>
);

// Komponen ProfileFieldFixed (untuk bidang yang tidak bisa di-edit)
const ProfileFieldFixed = ({ label, value, icon, className, freshGreenDark }) => (
  <div className={`p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {icon} <span>{label}</span>
    </p>
    <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">
      {value || '-'}
    </p>
  </div>
);